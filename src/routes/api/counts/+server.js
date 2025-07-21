import { env } from "$env/dynamic/private";
import { json } from "@sveltejs/kit";
import { Point } from "@influxdata/influxdb3-client";
import { influxDBClient, bucket } from "$lib/server/influxdb";

const EXPECTED_AUTH_TOKEN = `Bearer ${env.RASPBERRY_PI_AUTH_TOKEN}`

/**
 * 
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const GET = async({ url }) => {
    const range = url.searchParams.get('range')
    const start = url.searchParams.get('start')
    const end = url.searchParams.get('end')
    const cameraIds = url.searchParams.getAll('id')
    const limit = url.searchParams.get('limit')

    const measurement = 'people_count'
    const whereClauses = []

    let timeFilterClause = ""
    if(range) {
        const interval = range.replace('h', ' hours').replace('d', ' days').replace('m', ' minutes');
        whereClauses.push(`"time" >= now() - interval '${interval}'`)
    }
    else if (start && end) {
        whereClauses.push(`"time" BETWEEN '${start}' AND '${end}'`)
    }
    else {
        return json({ message: "Need time range"}, { status: 400 })
    }

    if (cameraIds.length > 0) {
      const locations = cameraIds.map(id => `'${id}'`).join(',');
      whereClauses.push(`location IN (${locations})`);
    }
    else {
        return json({ message: "Need cameraids"}, { status: 400 })
    }

    let query = `SELECT * FROM "${measurement}"`;
    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }
    if (limit) {
        query += ` ORDER BY "time" DESC LIMIT ${limit}`
    }
    else {
        query += ` ORDER BY "time" DESC LIMIT 10000`
    }
    

    try {
        const reader = await influxDBClient.query(query)
        const results = []

        for await (const row of reader) {
            results.push(row)
        }

        return json(results)
    }
    catch(e) {
        console.log(e)
        return json({ error: 'Failed to fetch data' }, { status: 500 })
    }
}

/**
 * 
 * @type {import("@sveltejs/kit").RequestHandler}
 */
export const POST = async({ request }) => {
    const authorization = request.headers.get('Authorization')

    if (authorization !== EXPECTED_AUTH_TOKEN) {
        return json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { location, count, timestamp } = await request.json()

        if (!location || typeof count !== 'number' || !timestamp) {
            return json( { error: 'Invalid request body' }, { status: 400 })
        }

        const point = Point.measurement("people_count")
        .setTag('location', location)
        .setIntegerField('count', count)
        .setTimestamp(new Date(timestamp))

        await influxDBClient.write(point)

        return json({ success: true })
    }
    catch(e) {
        console.log(e)
        return json({ success: false }, { status: 400 })
    }
}
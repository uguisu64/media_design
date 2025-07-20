import { InfluxDBClient } from "@influxdata/influxdb3-client"
import { env } from '$env/dynamic/private';

const host = env.INFLUXDB_HOST
const token = env.INFLUXDB_TOKEN
const database = env.INFLUXDB_BUCKET

/**
 * @type {InfluxDBClient}
 */
export const influxDBClient = new InfluxDBClient({ host, token, database })

export const bucket = env.INFLUXDB_BUCKET
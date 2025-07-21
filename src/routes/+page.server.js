import { error } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').ServerLoad} */
export const load = async ({ fetch }) => {
  try {
    const response = await fetch('/api/counts?id=test_camera_01&range=1d&limit=1'); 

    if (!response.ok) {
      throw new Error('APIからデータを取得できませんでした');
    }

    const latestData = await response.json();

    return {
      counts: latestData
    };
  } catch (e) {
    console.error(e);
    throw error(500, 'データの取得中にサーバーエラーが発生しました');
  }
};
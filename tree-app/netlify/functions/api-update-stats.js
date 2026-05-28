import { getConnection } from './utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();

  if (event.httpMethod === 'POST') {
    try {
      const { userId, type } = JSON.parse(event.body);

      const moduleMap = {
        emotionCompanion: 'emotion',
        loveAssistant: 'loveAssistant',
        treeHole: 'treeHole',
        tarot: 'tarot',
        assistant: 'assistant',
        fortune: 'fortune'
      };

      const module = moduleMap[type];
      if (!module) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid type' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      if (!conn) {
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Mock mode' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const today = new Date().toISOString().split('T')[0];
      await conn.execute(
        'INSERT INTO usage_stats (user_id, module, date, count) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE count = count + 1, updated_at = NOW()',
        [userId, module, today]
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Success' }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
    headers: { 'Access-Control-Allow-Origin': '*' }
  };
}

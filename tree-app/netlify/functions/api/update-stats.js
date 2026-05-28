import { getConnection } from '../utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();

  if (event.httpMethod === 'POST') {
    try {
      const { userId, type } = JSON.parse(event.body);
      
      const fieldMap = {
        emotionCompanion: 'emotion_companion',
        loveAssistant: 'love_assistant',
        treeHole: 'tree_hole',
        tarot: 'tarot'
      };

      const field = fieldMap[type];
      if (!field) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: '无效的类型' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      await conn.execute(
        `UPDATE usage_stats SET ${field} = ${field} + 1, updated_at = NOW() WHERE user_id = ?`,
        [userId]
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ message: '统计更新成功' }),
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
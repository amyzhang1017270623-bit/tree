import { getConnection } from '../utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();
  const userId = event.path.split('/').pop();

  if (event.httpMethod === 'GET') {
    try {
      const [userRows] = await conn.execute('SELECT * FROM users WHERE id = ?', [userId]);
      const [statsRows] = await conn.execute('SELECT * FROM usage_stats WHERE user_id = ?', [userId]);

      if (userRows.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: '用户不存在' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const user = userRows[0];
      if (user.character_preferences) {
        try {
          user.character_preferences = JSON.parse(user.character_preferences);
        } catch (e) {
          user.character_preferences = null;
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          user: user,
          stats: statsRows.length > 0 ? statsRows[0] : null
        }),
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

  if (event.httpMethod === 'PUT') {
    try {
      const body = JSON.parse(event.body);
      
      if (body.characterPreferences) {
        const preferences = JSON.stringify(body.characterPreferences);
        await conn.execute(
          'UPDATE users SET character_preferences = ?, last_active_at = NOW() WHERE id = ?',
          [preferences, userId]
        );
      } else {
        const { isMember, memberExpireAt } = body;
        await conn.execute(
          'UPDATE users SET is_member = ?, member_expire_at = ?, last_active_at = NOW() WHERE id = ?',
          [isMember, memberExpireAt || null, userId]
        );
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: '更新成功' }),
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
import { getConnection, getMockUsers, getMockStats } from './utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();
  const isMockMode = conn === null;
  const userId = event.path.split('/').pop();

  if (event.httpMethod === 'GET') {
    try {
      if (isMockMode) {
        const users = getMockUsers();
        const user = users.find(u => u.id == userId);
        const stats = getMockStats()[userId];
        if (!user) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: '用户不存在' }),
            headers: { 'Access-Control-Allow-Origin': '*' }
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify({ user, stats }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const [userRows] = await conn.execute('SELECT * FROM users WHERE id = ?', [userId]);
      const [statsRows] = await conn.execute('SELECT * FROM usage_stats WHERE user_id = ?', [userId]);

      if (userRows.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: '用户不存在' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          user: userRows[0],
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
      if (isMockMode) {
        return {
          statusCode: 200,
          body: JSON.stringify({ message: '更新成功（模拟数据）' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const { isMember, memberExpireAt } = JSON.parse(event.body);
      
      await conn.execute(
        'UPDATE users SET is_member = ?, member_expire_at = ?, last_active_at = NOW() WHERE id = ?',
        [isMember, memberExpireAt || null, userId]
      );

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

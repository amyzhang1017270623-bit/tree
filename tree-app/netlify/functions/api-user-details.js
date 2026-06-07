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

      const user = userRows[0];
      // 解析 character_preferences JSON
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
      if (isMockMode) {
        return {
          statusCode: 200,
          body: JSON.stringify({ message: '更新成功（模拟数据）' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const body = JSON.parse(event.body);
      
      // 处理角色偏好更新
      if (body.characterPreferences) {
        const characterPreferences = JSON.stringify(body.characterPreferences);
        await conn.execute(
          'UPDATE users SET character_preferences = ?, updated_at = NOW() WHERE id = ?',
          [characterPreferences, userId]
        );
      } else if (body.isMember !== undefined || body.memberExpireAt !== undefined) {
        // 处理会员状态更新
        await conn.execute(
          'UPDATE users SET is_member = ?, member_expire_at = ?, updated_at = NOW() WHERE id = ?',
          [body.isMember || false, body.memberExpireAt || null, userId]
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

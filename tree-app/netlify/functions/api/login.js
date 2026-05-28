import { getConnection, getMockUsers } from '../utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();
  const isMockMode = conn === null;

  if (event.httpMethod === 'POST') {
    try {
      const { phone, password } = JSON.parse(event.body);

      if (!phone || !password) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: '请提供手机号和密码' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      let user = null;

      if (isMockMode) {
        const mockUsers = getMockUsers();
        user = mockUsers.find(u => u.phone === phone && u.password === password);
      } else {
        const [rows] = await conn.execute(
          'SELECT id, name, gender, birth_date, birth_time, phone, character_preferences FROM users WHERE phone = ? AND password = ?',
          [phone, password]
        );
        if (rows.length > 0) {
          user = rows[0];
        }
      }

      if (!user) {
        return {
          statusCode: 401,
          body: JSON.stringify({ error: '手机号或密码错误' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          gender: user.gender,
          birthDate: user.birth_date,
          birthTime: user.birth_time,
          phone: user.phone,
          characterPreferences: user.character_preferences,
          message: '登录成功'
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

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
    headers: { 'Access-Control-Allow-Origin': '*' }
  };
}

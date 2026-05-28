import { getConnection, addMockUser, getMockUsers } from './utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();
  const isMockMode = conn === null;

  if (event.httpMethod === 'POST') {
    try {
      const { name, gender, birthDate, birthTime, phone, password, location } = JSON.parse(event.body);

      if (isMockMode) {
        const user = {
          id: Date.now(),
          name,
          gender: gender || '不愿透露',
          birth_date: birthDate,
          birth_time: birthTime || null,
          phone: phone || '',
          password: password || '',
          location: location || '',
          created_at: new Date().toISOString(),
          is_member: false
        };
        addMockUser(user);
        return {
          statusCode: 201,
          body: JSON.stringify({ id: user.id, name, message: '注册成功（模拟数据）' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const [userResult] = await conn.execute(
        'INSERT INTO users (name, gender, birth_date, birth_time, phone, password, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, gender || '不愿透露', birthDate, birthTime || null, phone || '', password || '', location || '']
      );

      const userId = userResult.insertId;
      await conn.execute('INSERT INTO usage_stats (user_id) VALUES (?)', [userId]);

      return {
        statusCode: 201,
        body: JSON.stringify({ id: userId, name, message: '注册成功' }),
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

  if (event.httpMethod === 'GET') {
    try {
      if (isMockMode) {
        return {
          statusCode: 200,
          body: JSON.stringify(getMockUsers()),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const [rows] = await conn.execute('SELECT * FROM users ORDER BY created_at DESC');
      return {
        statusCode: 200,
        body: JSON.stringify(rows),
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

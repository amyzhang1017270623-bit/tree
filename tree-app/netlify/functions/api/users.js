import { getConnection, getMockUsers, addMockUser } from '../utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();

  if (event.httpMethod === 'POST') {
    try {
      const { name, gender, birthDate, birthTime, phone, password } = JSON.parse(event.body);
      
      if (!phone) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: '请提供手机号' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      let exists = false;
      
      if (conn) {
        const [rows] = await conn.execute(
          'SELECT id FROM users WHERE phone = ?',
          [phone]
        );
        exists = rows.length > 0;
      } else {
        const mockUsers = getMockUsers();
        exists = mockUsers.some(user => user.phone === phone);
      }
      
      if (exists) {
        return {
          statusCode: 409,
          body: JSON.stringify({ error: '该手机号已注册，请直接登录' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const clientIP = event.headers['client-ip'] || 
                      event.headers['x-forwarded-for'] || 
                      event.headers['x-real-ip'] || 'unknown';
      
      let location = '国内';

      let userId;
      
      if (conn) {
        const [userResult] = await conn.execute(
          'INSERT INTO users (name, gender, birth_date, birth_time, phone, password, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [name, gender || '不愿透露', birthDate, birthTime || null, phone || '', password || '', location]
        );
        userId = userResult.insertId;
        await conn.execute('INSERT INTO usage_stats (user_id) VALUES (?)', [userId]);
      } else {
        userId = Date.now();
        addMockUser({
          id: userId,
          name,
          gender: gender || '不愿透露',
          birth_date: birthDate,
          birth_time: birthTime || null,
          phone: phone || '',
          password: password || '',
          location
        });
      }

      return {
        statusCode: 201,
        body: JSON.stringify({ id: userId, name, message: '注册成功' }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('注册失败:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    }
  }

  if (event.httpMethod === 'GET') {
    try {
      let rows = [];
      
      if (conn) {
        [rows] = await conn.execute('SELECT * FROM users ORDER BY created_at DESC');
      } else {
        rows = getMockUsers();
      }
      
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
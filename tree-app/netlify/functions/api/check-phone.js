import { getConnection, getMockUsers } from '../utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();

  if (event.httpMethod === 'GET') {
    try {
      const phone = event.queryStringParameters?.phone;
      
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

      return {
        statusCode: 200,
        body: JSON.stringify({ exists }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('检查手机号失败:', error);
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

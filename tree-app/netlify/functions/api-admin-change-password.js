import { getConnection } from './utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();
  const isMockMode = conn === null;

  if (event.httpMethod === 'POST') {
    try {
      const { oldPassword, newPassword } = JSON.parse(event.body);

      if (!oldPassword || !newPassword) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: '请提供原密码和新密码' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      let success = false;

      if (isMockMode) {
        success = oldPassword === 'admin123';
      } else {
        const [rows] = await conn.execute(
          'SELECT id FROM admins WHERE username = ? AND password = ?',
          ['admin', oldPassword]
        );
        if (rows.length > 0) {
          await conn.execute(
            'UPDATE admins SET password = ? WHERE username = ?',
            [newPassword, 'admin']
          );
          success = true;
        }
      }

      if (!success) {
        return {
          statusCode: 401,
          body: JSON.stringify({ error: '原密码错误' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: '密码修改成功' }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('修改密码失败:', error);
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
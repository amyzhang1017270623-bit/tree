import { getConnection } from './utils/mysql.js';

const mockAdmins = [
  { id: 1, username: 'admin', password: 'admin123', name: '管理员' }
];

export async function handler(event, context) {
  const conn = await getConnection();
  const isMockMode = conn === null;

  if (event.httpMethod === 'POST') {
    try {
      const { username, password } = JSON.parse(event.body);

      if (!username || !password) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: '请提供用户名和密码' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      let admin = null;

      if (isMockMode) {
        admin = mockAdmins.find(a => a.username === username && a.password === password);
      } else {
        try {
          const [rows] = await conn.execute(
            'SELECT id, username, name FROM admins WHERE username = ? AND password = ?',
            [username, password]
          );
          if (rows.length > 0) {
            admin = rows[0];
          }
        } catch (dbError) {
          console.error('数据库查询失败:', dbError);
          admin = mockAdmins.find(a => a.username === username && a.password === password);
        }
      }

      if (!admin) {
        return {
          statusCode: 401,
          body: JSON.stringify({ error: '用户名或密码错误' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          id: admin.id,
          username: admin.username,
          name: admin.name,
          message: '登录成功'
        }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('管理员登录错误:', error);
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
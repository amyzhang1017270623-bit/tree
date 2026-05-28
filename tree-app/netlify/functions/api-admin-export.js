import { getConnection } from './utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();
  const isMockMode = conn === null;

  if (event.httpMethod === 'GET') {
    try {
      let users = [];

      if (isMockMode) {
        users = [
          { id: 1, name: '张三', phone: '138****1234', gender: '男', birth_date: '1990-01-01', created_at: '2024-01-15 14:30:00' },
          { id: 2, name: '李四', phone: '139****5678', gender: '女', birth_date: '1995-05-15', created_at: '2024-01-15 13:20:00' },
          { id: 3, name: '王五', phone: '137****9012', gender: '男', birth_date: '1988-12-25', created_at: '2024-01-15 11:15:00' }
        ];
      } else {
        const [rows] = await conn.execute('SELECT id, name, phone, gender, birth_date, created_at FROM users');
        users = rows;
      }

      const headers = ['ID', '姓名', '手机号', '性别', '出生日期', '注册时间'];
      const csvContent = [
        headers.join(','),
        ...users.map(u => [
          u.id,
          `"${u.name || ''}"`,
          u.phone || '',
          u.gender || '',
          u.birth_date || '',
          u.created_at || ''
        ].join(','))
      ].join('\n');

      return {
        statusCode: 200,
        body: csvContent,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=users_${Date.now()}.csv`
        }
      };
    } catch (error) {
      console.error('导出数据失败:', error);
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
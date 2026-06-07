import { getConnection } from './utils/mysql.js';

const mockUsers = [
  { id: 1, name: '张三', phone: '138****1234', gender: '男', birth_date: '1990-01-01', birth_time: '09:00:00', created_at: '2024-01-15 14:30:00' },
  { id: 2, name: '李四', phone: '139****5678', gender: '女', birth_date: '1995-05-15', birth_time: '14:30:00', created_at: '2024-01-15 13:20:00' },
  { id: 3, name: '王五', phone: '137****9012', gender: '男', birth_date: '1988-12-25', birth_time: '22:00:00', created_at: '2024-01-15 11:15:00' },
  { id: 4, name: '赵六', phone: '136****3456', gender: '女', birth_date: '1992-08-08', birth_time: '10:30:00', created_at: '2024-01-15 10:00:00' },
  { id: 5, name: '钱七', phone: '135****7890', gender: '女', birth_date: '1998-03-20', birth_time: '16:45:00', created_at: '2024-01-15 09:30:00' }
];

export async function handler(event, context) {
  const conn = await getConnection();
  const isMockMode = conn === null;

  if (event.httpMethod === 'GET') {
    try {
      const params = new URLSearchParams(event.queryStringParameters || {});
      const page = parseInt(params.get('page') || '1', 10) || 1;
      const limit = parseInt(params.get('limit') || '10', 10) || 10;
      const search = params.get('search');
      const gender = params.get('gender');
      const queryUserId = params.get('id');
      const pathParts = event.path.split('/');
      const pathUserId = pathParts[pathParts.length - 1] !== 'stats' 
        ? pathParts[pathParts.length - 1] 
        : pathParts[pathParts.length - 2];
      const userId = queryUserId || (pathUserId !== 'api-admin-users' ? pathUserId : null);

      if (userId) {
        // 检查是否是获取统计数据
        if (pathParts[pathParts.length - 1] === 'stats') {
          // 获取用户使用统计数据
          if (isMockMode) {
            return {
              statusCode: 200,
              body: JSON.stringify({ emotion: 5, tarot: 3, loveAssistant: 2, treeHole: 4, assistant: 1 }),
              headers: { 'Access-Control-Allow-Origin': '*' }
            };
          } else {
            const [statsRows] = await conn.execute(
              'SELECT module, SUM(count) as total FROM usage_stats WHERE user_id = ? GROUP BY module',
              [userId]
            );
            
            const stats = {};
            for (const row of statsRows) {
              stats[row.module] = parseInt(row.total) || 0;
            }
            
            return {
              statusCode: 200,
              body: JSON.stringify(stats),
              headers: { 'Access-Control-Allow-Origin': '*' }
            };
          }
        }
        
        let user = null;
        
        if (isMockMode) {
          user = mockUsers.find(u => u.id === parseInt(userId));
        } else {
          const [rows] = await conn.execute(
            'SELECT id, name, phone, gender, birth_date, birth_time, character_preferences, created_at FROM users WHERE id = ?',
            [userId]
          );
          if (rows.length > 0) {
            user = rows[0];
          }
        }

        if (!user) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: '用户不存在' }),
            headers: { 'Access-Control-Allow-Origin': '*' }
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ user }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      let users = [];
      let total = 0;

      if (isMockMode) {
        users = [...mockUsers];
        if (search) {
          users = users.filter(u => u.name.includes(search) || u.phone.includes(search));
        }
        if (gender) {
          users = users.filter(u => u.gender === gender);
        }
        total = users.length;
        users = users.slice((page - 1) * limit, page * limit);
      } else {
        let query = 'SELECT id, name, phone, gender, location, created_at FROM users WHERE 1=1';
        let queryParams = [];

        if (search) {
          query += ' AND (name LIKE ? OR phone LIKE ?)';
          queryParams.push(`%${search}%`, `%${search}%`);
        }
        if (gender) {
          query += ' AND gender = ?';
          queryParams.push(gender);
        }

        query += ` ORDER BY created_at DESC LIMIT ${Number(limit)} OFFSET ${Number((page - 1) * limit)}`;

        const [rows] = await conn.execute(query, queryParams);
        users = rows;

        let countQuery = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
        let countParams = [];
        if (search) {
          countQuery += ' AND (name LIKE ? OR phone LIKE ?)';
          countParams.push(`%${search}%`, `%${search}%`);
        }
        if (gender) {
          countQuery += ' AND gender = ?';
          countParams.push(gender);
        }
        const [countResult] = await conn.execute(countQuery, countParams);
        total = countResult[0].count;
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ users, total }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    }
  }

  if (event.httpMethod === 'PUT') {
    try {
      const userId = event.path.split('/').pop();
      const { name, gender, birthDate, birthTime } = JSON.parse(event.body);

      if (!userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: '用户ID不能为空' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      if (isMockMode) {
        const userIndex = mockUsers.findIndex(u => u.id === parseInt(userId));
        if (userIndex !== -1) {
          if (name) mockUsers[userIndex].name = name;
          if (gender) mockUsers[userIndex].gender = gender;
          if (birthDate) mockUsers[userIndex].birth_date = birthDate;
          if (birthTime) mockUsers[userIndex].birth_time = birthTime;
        }
      } else {
        await conn.execute(
          'UPDATE users SET name = COALESCE(?, name), gender = COALESCE(?, gender), birth_date = COALESCE(?, birth_date), birth_time = COALESCE(?, birth_time) WHERE id = ?',
          [name, gender, birthDate, birthTime, userId]
        );
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: '用户信息更新成功' }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('更新用户失败:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    }
  }

  if (event.httpMethod === 'DELETE') {
    try {
      const userId = event.path.split('/').pop();

      if (!userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: '用户ID不能为空' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      if (isMockMode) {
        const index = mockUsers.findIndex(u => u.id === parseInt(userId));
        if (index !== -1) {
          mockUsers.splice(index, 1);
        }
      } else {
        await conn.execute('DELETE FROM users WHERE id = ?', [userId]);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: '用户删除成功' }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('删除用户失败:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const pathParts = event.path.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      
      if (lastPart === 'reset-password') {
        const userId = pathParts[pathParts.length - 2];
        const { newPassword } = JSON.parse(event.body);

        if (!userId || !newPassword) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: '用户ID和新密码不能为空' }),
            headers: { 'Access-Control-Allow-Origin': '*' }
          };
        }

        if (!isMockMode) {
          await conn.execute('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ message: '密码重置成功' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      } else {
        const { username, name, password } = JSON.parse(event.body);

        if (!username || !password) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: '用户名和密码不能为空' }),
            headers: { 'Access-Control-Allow-Origin': '*' }
          };
        }

        if (!isMockMode) {
          await conn.execute('INSERT INTO admins (username, password, name) VALUES (?, ?, ?)', 
            [username, password, name || '']);
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ message: '管理员添加成功' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }
    } catch (error) {
      console.error('操作失败:', error);
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
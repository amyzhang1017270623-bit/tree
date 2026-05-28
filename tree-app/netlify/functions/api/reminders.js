import { getConnection } from '../utils/mysql.js';

async function ensureTableExists(conn) {
  if (!conn) return;
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        category VARCHAR(50) DEFAULT 'daily',
        remind_day_of BOOLEAN DEFAULT FALSE,
        remind_1day_before BOOLEAN DEFAULT FALSE,
        remind_3days_before BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (error) {
    console.error('❌ 创建 reminders 表失败:', error.message);
  }
}

export async function handler(event, context) {
  const conn = await getConnection();
  const isMockMode = conn === null;
  
  if (!isMockMode) {
    await ensureTableExists(conn);
  }

  let mockReminders = [];

  if (isMockMode) {
    try {
      const data = await getMockReminders();
      mockReminders = data;
    } catch (e) {
      mockReminders = [];
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      const { userId, date, title, description, category, remindDayOf, remind1DayBefore, remind3DaysBefore } = body;

      if (!userId || !date || !title) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: '缺少必要参数' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      if (isMockMode) {
        const newReminder = {
          id: Date.now().toString(),
          user_id: userId,
          date,
          title,
          description: description || '',
          category: category || 'daily',
          remind_day_of: remindDayOf || false,
          remind_1day_before: remind1DayBefore || false,
          remind_3days_before: remind3DaysBefore || false,
          created_at: new Date().toISOString()
        };
        mockReminders.push(newReminder);
        saveMockReminders(mockReminders);
        
        return {
          statusCode: 201,
          body: JSON.stringify({ id: newReminder.id, message: '日程添加成功（模拟数据）' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const [result] = await conn.execute(
        'INSERT INTO reminders (user_id, date, title, description, category, remind_day_of, remind_1day_before, remind_3days_before) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, date, title, description || '', category || 'daily', remindDayOf || false, remind1DayBefore || false, remind3DaysBefore || false]
      );

      return {
        statusCode: 201,
        body: JSON.stringify({ id: result.insertId, message: '日程添加成功' }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('添加日程失败:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    }
  }

  if (event.httpMethod === 'GET') {
    try {
      const userId = event.queryStringParameters?.userId;

      if (!userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: '缺少用户ID' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      if (isMockMode) {
        const userReminders = mockReminders.filter(r => r.user_id === userId);
        return {
          statusCode: 200,
          body: JSON.stringify(userReminders),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const [rows] = await conn.execute(
        'SELECT * FROM reminders WHERE user_id = ? ORDER BY date ASC',
        [userId]
      );

      return {
        statusCode: 200,
        body: JSON.stringify(rows),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('获取日程失败:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    }
  }

  if (event.httpMethod === 'DELETE') {
    try {
      const { id, userId } = JSON.parse(event.body);

      if (!id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: '缺少日程ID' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      if (isMockMode) {
        const index = mockReminders.findIndex(r => r.id === id && r.user_id === userId);
        if (index !== -1) {
          mockReminders.splice(index, 1);
          saveMockReminders(mockReminders);
        }
        return {
          statusCode: 200,
          body: JSON.stringify({ message: '日程删除成功（模拟数据）' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      await conn.execute('DELETE FROM reminders WHERE id = ? AND user_id = ?', [id, userId]);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: '日程删除成功' }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('删除日程失败:', error);
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

function getMockReminders() {
  try {
    const data = localStorage.getItem('tree-app-reminders');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveMockReminders(reminders) {
  try {
    localStorage.setItem('tree-app-reminders', JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed to save mock reminders:', e);
  }
}
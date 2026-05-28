import { getConnection } from './utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();
  const isMockMode = conn === null;

  if (event.httpMethod === 'GET') {
    try {
      let settings = {
        appName: '0号树洞',
        tarotFreeCount: 2,
        loginTimeout: 20,
        dailyLimit: 100
      };

      if (!isMockMode) {
        const [rows] = await conn.execute('SELECT key_name, key_value FROM system_settings');
        for (const row of rows) {
          switch (row.key_name) {
            case 'app_name':
              settings.appName = row.key_value;
              break;
            case 'tarot_free_count':
              settings.tarotFreeCount = parseInt(row.key_value) || 2;
              break;
            case 'login_timeout':
              settings.loginTimeout = parseInt(row.key_value) || 20;
              break;
            case 'daily_limit':
              settings.dailyLimit = parseInt(row.key_value) || 100;
              break;
          }
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify(settings),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('获取系统设置失败:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    }
  }

  if (event.httpMethod === 'PUT') {
    try {
      const { appName, tarotFreeCount, loginTimeout, dailyLimit } = JSON.parse(event.body);

      if (!isMockMode) {
        const updates = [
          { key: 'app_name', value: appName },
          { key: 'tarot_free_count', value: tarotFreeCount.toString() },
          { key: 'login_timeout', value: loginTimeout.toString() },
          { key: 'daily_limit', value: dailyLimit.toString() }
        ];

        for (const update of updates) {
          await conn.execute(
            'UPDATE system_settings SET key_value = ? WHERE key_name = ?',
            [update.value, update.key]
          );
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: '设置保存成功' }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('保存系统设置失败:', error);
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
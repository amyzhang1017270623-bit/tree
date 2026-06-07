import { getConnection } from './utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();

  if (event.httpMethod === 'POST') {
    try {
      const { userId, type } = JSON.parse(event.body);

      const moduleMap = {
        emotionCompanion: 'emotion',
        loveAssistant: 'loveAssistant',
        treeHole: 'treeHole',
        tarot: 'tarot',
        assistant: 'assistant',
        fortune: 'fortune'
      };

      const module = moduleMap[type];
      if (!module) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid type' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      if (!conn) {
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Mock mode', canUse: true, remainingUsage: 100 }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const [userRows] = await conn.execute('SELECT id FROM users WHERE id = ?', [userId]);
      if (userRows.length === 0) {
        console.warn(`[Stats Update] User ${userId} not found, skipping stats update`);
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'User not found, stats not updated', canUse: true }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const today = new Date().toISOString().split('T')[0];

      const [settingsRows] = await conn.execute(
        "SELECT key_value FROM system_settings WHERE key_name = 'daily_limit'"
      );
      const dailyLimit = settingsRows.length > 0 ? parseInt(settingsRows[0].key_value) || 100 : 100;

      const [usageRows] = await conn.execute(
        'SELECT COALESCE(SUM(count), 0) as total FROM usage_stats WHERE user_id = ? AND date = ? AND module NOT IN (?, ?)',
        [userId, today, 'fortune', 'tarot']
      );
      const currentUsage = parseInt(usageRows[0].total) || 0;

      const isExemptModule = module === 'fortune' || module === 'tarot';

      if (!isExemptModule && currentUsage >= dailyLimit) {
        console.warn(`[Stats Update] User ${userId} exceeded daily limit: ${currentUsage}/${dailyLimit}`);
        return {
          statusCode: 403,
          body: JSON.stringify({
            error: 'Daily limit exceeded',
            canUse: false,
            currentUsage,
            dailyLimit,
            message: '聊了这么久了，请我喝一杯奶茶吧'
          }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      await conn.execute(
        'INSERT INTO usage_stats (user_id, module, date, count) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE count = count + 1, updated_at = NOW()',
        [userId, module, today]
      );

      const [finalUsageRows] = await conn.execute(
        'SELECT COALESCE(SUM(count), 0) as total FROM usage_stats WHERE user_id = ? AND date = ? AND module NOT IN (?, ?)',
        [userId, today, 'fortune', 'tarot']
      );
      const finalUsage = parseInt(finalUsageRows[0].total) || 0;

      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Success', 
          canUse: true,
          remainingUsage: dailyLimit - finalUsage
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

  if (event.httpMethod === 'GET') {
    try {
      const userId = event.queryStringParameters?.userId;
      
      if (!userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'userId is required' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      if (!conn) {
        return {
          statusCode: 200,
          body: JSON.stringify({ canUse: true, currentUsage: 0, dailyLimit: 100, remainingUsage: 100 }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const today = new Date().toISOString().split('T')[0];

      const [settingsRows] = await conn.execute(
        "SELECT key_value FROM system_settings WHERE key_name = 'daily_limit'"
      );
      const dailyLimit = settingsRows.length > 0 ? parseInt(settingsRows[0].key_value) || 100 : 100;

      const [usageRows] = await conn.execute(
        'SELECT COALESCE(SUM(count), 0) as total FROM usage_stats WHERE user_id = ? AND date = ? AND module NOT IN (?, ?)',
        [userId, today, 'fortune', 'tarot']
      );
      const currentUsage = parseInt(usageRows[0].total) || 0;

      return {
        statusCode: 200,
        body: JSON.stringify({
          canUse: currentUsage < dailyLimit,
          currentUsage,
          dailyLimit,
          remainingUsage: dailyLimit - currentUsage
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

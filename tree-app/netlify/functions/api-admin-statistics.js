import { getConnection } from './utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();
  const isMockMode = conn === null;

  if (event.httpMethod === 'GET') {
    try {
      let statistics = {
        totalUsers: 0,
        todayRegistrations: 0,
        weeklyNewUsers: 0,
        monthlyActiveUsers: 0,
        totalUsageCount: 0,
        dailyRegistrations: [0, 0, 0, 0, 0, 0, 0],
        dayLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        weeklyRegistrations: [],
        weekLabels: [],
        monthlyRegistrations: [],
        monthLabels: [],
        featureDistribution: [
          { name: '今日运势', count: 0, percentage: 0 },
          { name: '恋爱助手', count: 0, percentage: 0 },
          { name: '情感陪伴', count: 0, percentage: 0 },
          { name: '情感树洞', count: 0, percentage: 0 },
          { name: '塔罗世界', count: 0, percentage: 0 },
          { name: '私人助理', count: 0, percentage: 0 }
        ],
        genderDistribution: { male: 0, female: 0, unknown: 0 },
        tarotStats: { weeklyFreeCount: 0, weeklyPaidCount: 0, monthlyTotal: 0, totalPaidCount: 0 }
      };

      if (!isMockMode) {
        try {
          const [userCount] = await conn.execute('SELECT COUNT(*) as count FROM users');
          statistics.totalUsers = userCount[0].count || 0;

          const today = new Date().toISOString().split('T')[0];
          const [todayCount] = await conn.execute(
            'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?',
            [today]
          );
          statistics.todayRegistrations = todayCount[0].count || 0;

          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const [weeklyCount] = await conn.execute(
            'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) >= ?',
            [oneWeekAgo]
          );
          statistics.weeklyNewUsers = weeklyCount[0].count || 0;

          const dailyRegistrations = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const [count] = await conn.execute(
              'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?',
              [date]
            );
            dailyRegistrations.push(count[0].count || 0);
          }
          statistics.dailyRegistrations = dailyRegistrations;

          const [todayRegistrations] = await conn.execute(
            'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?',
            [today]
          );
          statistics.todayRegistrations = todayRegistrations[0].count || 0;

          const dayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
          const todayDayOfWeek = new Date().getDay();
          const weekDayLabels = [];
          for (let i = 6; i >= 0; i--) {
            const dayIndex = (todayDayOfWeek - i + 7) % 7;
            weekDayLabels.push(dayLabels[dayIndex]);
          }
          statistics.dayLabels = weekDayLabels;

          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();
          const monthlyRegistrations = [];
          const monthLabels = [];
          for (let i = 0; i < 12; i++) {
            const month = i;
            const firstDay = new Date(currentYear, month, 1).toISOString().split('T')[0];
            const lastDay = new Date(currentYear, month + 1, 0).toISOString().split('T')[0];
            const [count] = await conn.execute(
              'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?',
              [firstDay, lastDay]
            );
            monthlyRegistrations.push(count[0].count || 0);
            monthLabels.push(`${month + 1}月`);
          }
          statistics.monthlyRegistrations = monthlyRegistrations;
          statistics.monthLabels = monthLabels;

          const weeklyRegistrations = [];
          const weekLabels = [];
          const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
          const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
          let startOfWeek = new Date(firstDayOfMonth);
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          
          while (startOfWeek <= lastDayOfMonth) {
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            const endDate = endOfWeek > lastDayOfMonth ? lastDayOfMonth : endOfWeek;
            
            const [count] = await conn.execute(
              'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?',
              [startOfWeek.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
            );
            weeklyRegistrations.push(count[0].count || 0);
            
            const startMonth = startOfWeek.getMonth() + 1;
            const startDay = startOfWeek.getDate();
            const endMonth = endDate.getMonth() + 1;
            const endDay = endDate.getDate();
            weekLabels.push(`${startMonth}/${startDay}-${endMonth}/${endDay}`);
            
            startOfWeek.setDate(startOfWeek.getDate() + 7);
          }
          statistics.weeklyRegistrations = weeklyRegistrations;
          statistics.weekLabels = weekLabels;

          const [totalUsageResult] = await conn.execute(
            'SELECT COALESCE(SUM(count), 0) as total FROM usage_stats'
          );
          statistics.totalUsageCount = totalUsageResult[0].total || 0;

          const [featureUsage] = await conn.execute(
            'SELECT module, COALESCE(SUM(count), 0) as total FROM usage_stats GROUP BY module'
          );
          
          const featureMap = {
            fortune: '今日运势',
            loveAssistant: '恋爱助手',
            emotion: '情感陪伴',
            treeHole: '情感树洞',
            tarot: '塔罗世界',
            assistant: '私人助理'
          };
          
          const featureDistribution = [
            { name: '今日运势', count: 0, percentage: 0 },
            { name: '恋爱助手', count: 0, percentage: 0 },
            { name: '情感陪伴', count: 0, percentage: 0 },
            { name: '情感树洞', count: 0, percentage: 0 },
            { name: '塔罗世界', count: 0, percentage: 0 },
            { name: '私人助理', count: 0, percentage: 0 }
          ];
          
          let totalFeatureUsage = 0;
          featureUsage.forEach(item => {
            const featureIndex = featureDistribution.findIndex(
              f => f.name === (featureMap[item.module] || item.module)
            );
            if (featureIndex !== -1) {
              const count = parseInt(item.total) || 0;
              featureDistribution[featureIndex].count += count;
              totalFeatureUsage += count;
            }
          });
          
          featureDistribution.forEach(feature => {
            feature.percentage = totalFeatureUsage > 0 
              ? Math.round((feature.count / totalFeatureUsage) * 100) 
              : 0;
          });
          
          statistics.featureDistribution = featureDistribution;

          statistics.genderDistribution = { male: 0, female: 0, unknown: 0 };
          
          const [users] = await conn.execute('SELECT gender FROM users');
          users.forEach(user => {
            if (user.gender === '男') {
              statistics.genderDistribution.male++;
            } else if (user.gender === '女') {
              statistics.genderDistribution.female++;
            } else {
              statistics.genderDistribution.unknown++;
            }
          });

          const [tarotWeekly] = await conn.execute(
            'SELECT COALESCE(SUM(count), 0) as total FROM usage_stats WHERE module = ? AND DATE(created_at) >= ?',
            ['tarot', oneWeekAgo]
          );
          statistics.tarotStats.weeklyFreeCount = tarotWeekly[0].total || 0;
          statistics.tarotStats.weeklyPaidCount = 0;
          
          const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const [tarotMonthly] = await conn.execute(
            'SELECT COALESCE(SUM(count), 0) as total FROM usage_stats WHERE module = ? AND DATE(created_at) >= ?',
            ['tarot', oneMonthAgo]
          );
          statistics.tarotStats.monthlyTotal = tarotMonthly[0].total || 0;
          statistics.tarotStats.totalPaidCount = 0;

          const [activeUsers] = await conn.execute('SELECT COUNT(DISTINCT user_id) as count FROM usage_stats');
          statistics.monthlyActiveUsers = activeUsers[0].count || 0;
        } catch (dbError) {
          console.error('数据库统计查询失败:', dbError);
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify(statistics),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
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

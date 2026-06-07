import { getConnection, addMockUser, getMockUsers } from './utils/mysql.js';

export async function handler(event, context) {
  const conn = await getConnection();
  const isMockMode = conn === null;

  if (event.httpMethod === 'POST') {
    try {
      const { name, gender, birthDate, birthTime, phone, password } = JSON.parse(event.body);

      // 根据请求来源判断 location
      const headers = event.headers || {};
      const clientIp = headers['x-forwarded-for'] || headers['client-ip'] || headers['x-real-ip'] || '';
      
      // 判断是国内还是国外
      let location = '国外';
      
      // 通过 IP 或其他请求头判断
      // Netlify 函数会提供 x-forwarded-for 头
      if (clientIp) {
        // 简单判断：如果 IP 以特定前缀开头或包含特定标识，认为是国内
        // 这里使用简单的规则，实际应用中可以使用 IP 地理位置 API
        const ipParts = clientIp.split(',')[0].trim();
        
        // 常见的中国 IP 地址段（简化版）
        // 实际应用中应该使用完整的 IP 地理位置数据库
        const chineseIpPrefixes = [
          '1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9',
          '14', '27', '36', '39', '42', '49', '58', '59', '60', '61',
          '106', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123',
          '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
          '140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159',
          '160', '161', '162', '163', '164', '165', '166', '167', '168', '169', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179',
          '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', '190', '191', '192', '193', '194', '195', '196', '197', '198', '199',
          '202', '203', '210', '211', '218', '219', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246', '247', '248', '249', '250', '251', '252', '253', '254', '255'
        ];
        
        // 检查是否是中国 IP
        for (const prefix of chineseIpPrefixes) {
          if (ipParts.startsWith(prefix + '.') || ipParts === prefix) {
            location = '国内';
            break;
          }
        }
      }
      
      // 如果无法通过 IP 判断，检查其他请求头
      // 比如 Accept-Language 或 timezone
      const acceptLanguage = headers['accept-language'] || '';
      if (acceptLanguage.includes('zh') || acceptLanguage.includes('CN')) {
        location = '国内';
      }

      if (isMockMode) {
        const user = {
          id: Date.now(),
          name,
          gender: gender || '不愿透露',
          birth_date: birthDate,
          birth_time: birthTime || null,
          phone: phone || '',
          password: password || '',
          location: location,
          created_at: new Date().toISOString(),
          is_member: false
        };
        addMockUser(user);
        return {
          statusCode: 201,
          body: JSON.stringify({ id: user.id, name, location, message: '注册成功（模拟数据）' }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const [userResult] = await conn.execute(
        'INSERT INTO users (name, gender, birth_date, birth_time, phone, password, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, gender === '不愿透露' ? '保密' : gender || '保密', birthDate, birthTime || null, phone || '', password || '', location]
      );

      const userId = userResult.insertId;

      return {
        statusCode: 201,
        body: JSON.stringify({ id: userId, name, location, message: '注册成功' }),
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
      if (isMockMode) {
        return {
          statusCode: 200,
          body: JSON.stringify(getMockUsers()),
          headers: { 'Access-Control-Allow-Origin': '*' }
        };
      }

      const [rows] = await conn.execute('SELECT * FROM users ORDER BY created_at DESC');
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

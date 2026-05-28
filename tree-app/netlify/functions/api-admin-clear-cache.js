export async function handler(event, context) {
  if (event.httpMethod === 'POST') {
    try {
      console.log('缓存已清除');
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: '缓存清除成功' }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    } catch (error) {
      console.error('清除缓存失败:', error);
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
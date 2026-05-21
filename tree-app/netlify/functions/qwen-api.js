const API_KEY = 'sk-3ea880e116f0438e926d0c99e47e8674'

const ENDPOINTS = {
  cn: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
  global: 'https://dashscope-us.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
  multiCn: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
  multiGlobal: 'https://dashscope-us.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
}

exports.handler = async (event, context) => {
  const { path, httpMethod, body, headers } = event
  
  try {
    const endpointKey = path.replace('/.netlify/functions/qwen-api/', '')
    
    if (!ENDPOINTS[endpointKey]) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Endpoint not found' }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    }

    const targetUrl = ENDPOINTS[endpointKey]
    
    const response = await fetch(targetUrl, {
      method: httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: body
    })

    const responseBody = await response.text()
    
    return {
      statusCode: response.status,
      body: responseBody,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
      }
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  }
}
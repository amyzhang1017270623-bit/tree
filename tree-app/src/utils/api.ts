const ENDPOINTS = {
  cn: '/.netlify/functions/qwen-api/cn',
  global: '/.netlify/functions/qwen-api/global',
  multiCn: '/.netlify/functions/qwen-api/multiCn',
  multiGlobal: '/.netlify/functions/qwen-api/multiGlobal'
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface QwenResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

let isChinaRegion: boolean | null = null

export const detectRegion = async (): Promise<boolean> => {
  if (isChinaRegion !== null) {
    return isChinaRegion
  }

  isChinaRegion = true
  
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal
    })
    clearTimeout(timeout)
    
    const data = await response.json()
    const ip = data.ip || ''
    
    const chinaIpRanges = ['1.0.16.', '1.0.32.', '1.1.1.', '1.1.2.', '1.1.3.', '1.1.4.', '1.1.5.', '119.29.', '119.30.', '120.23.', '121.40.', '121.41.', '121.42.', '121.43.', '183.195.', '183.196.', '183.197.', '183.198.', '183.199.', '203.119.', '203.208.', '223.56.', '223.57.', '223.58.', '223.59.', '223.60.', '223.61.', '223.62.', '223.63.']
    isChinaRegion = chinaIpRanges.some(range => ip.startsWith(range))
  } catch (error) {
    console.log('Using CN endpoint due to network restriction')
  }
  
  return isChinaRegion
}

export const getCurrentEndpoint = async (): Promise<string> => {
  const isCN = await detectRegion()
  return isCN ? ENDPOINTS.cn : ENDPOINTS.global
}

export const callQwenAPI = async (messages: ChatMessage[], region?: 'cn' | 'global', maxTokens: number = 150): Promise<string> => {
  try {
    const endpoint = region 
      ? ENDPOINTS[region]
      : await getCurrentEndpoint()

    const detectedRegion = region || (await detectRegion() ? 'cn' : 'global')
    console.log(`[Qwen API] Calling Qwen 3.5-Plus model via ${detectedRegion} endpoint: ${endpoint}`)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        input: {
          messages: messages
        },
        parameters: {
          temperature: 0.7,
          max_tokens: maxTokens
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} - ${errorText}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('[Qwen API] Response:', data)
    const text = data.output?.text || ''
    return truncateText(text, maxTokens)
  } catch (error) {
    console.error('Error calling Qwen API:', error)
    throw error
  }
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  
  // 在maxLength附近查找句子结束符
  const endChars = ['。', '！', '？', '；', '：', '\n', '.', '!', '?', ';', ':']
  let truncated = text.substring(0, maxLength + 20) // 多取20个字符用于查找
  
  // 从maxLength位置开始向前查找最近的句子结束符
  for (let i = maxLength; i >= 0; i--) {
    if (endChars.includes(truncated[i])) {
      return truncated.substring(0, i + 1)
    }
  }
  
  // 如果没找到句子结束符，从maxLength位置向后查找
  for (let i = maxLength; i < truncated.length; i++) {
    if (endChars.includes(truncated[i])) {
      return truncated.substring(0, i + 1)
    }
  }
  
  // 如果还是没找到，就按maxLength截断，但确保不破坏单词
  return text.substring(0, maxLength) + '...'
}

export const getTreeHoleReply = async (userMessage: string): Promise<string> => {
  const systemPrompt = `
    你是一个温柔、善解人意的情感陪伴机器人，专注于倾听用户的心事并给予温暖的回应。

    你的角色：
    - 树洞倾听者：用户可以向你倾诉任何心事、烦恼或秘密
    - 温暖陪伴者：给予理解、安慰和鼓励，不做评判
    - 保密者：用户的所有倾诉都会保密

    回应风格：
    - 温柔、耐心、充满同理心
    - 使用温暖、关怀的语言
    - 避免使用生硬、机械化的回复
    - 根据用户情绪调整回应语气

    特殊规则：
    - 如果用户表达负面情绪（难过、伤心、压力大等），给予更多安慰和支持
    - 如果用户表达积极情绪（开心、高兴等），给予肯定和祝福
    - 如果用户寻求建议，提供温和的建议而非命令式指导
    - 保持回应简洁自然，像朋友聊天一样

    用中文回复，保持亲切友好的语气。
  `.trim()

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ]

  return callQwenAPI(messages)
}

export interface EmotionCompanionConfig {
  characterName: string
  characterAvatar: string
  characterId: number
  surveyAnswers?: Record<string, string>
}

export interface LoveAnalysisResult {
  status: string
  suggestions: {
    soft: string
    humorous: string
    serious: string
  }
}

export const getEmotionCompanionReply = async (
  userMessage: string,
  config: EmotionCompanionConfig,
  conversationHistory: { isUser: boolean; text: string }[] = []
): Promise<string> => {
  let systemPrompt = `
    你是一个名叫${config.characterName}的情感陪伴者${config.characterAvatar}。

    你的角色：
    - 一个温柔、贴心的伴侣/朋友
    - 给予用户温暖的情感支持和陪伴
    - 倾听用户的烦恼，分享快乐，给予安慰

    回应风格：
    - 亲切自然，像真实的人一样对话
    - 温暖、关心、有同理心
    - 根据用户的情绪调整回应
    - 可以适当使用emoji让对话更生动
    - 不要使用行为动作描述，只输出纯文字对话内容，不要包含（）括号中的动作描述
  `.trim()

  // 根据角色ID添加特定设定
  if (config.characterId === 1) {
    systemPrompt += `
      
      你是小薇，一个虚拟恋人角色。性格温柔治愈，关心用户的生活和情感状态。回应时要像恋人一样体贴，会主动关心用户，分享日常话题。
    `.trim()
  } else if (config.characterId === 2) {
    systemPrompt += `
      
      你是小希，专门帮助用户走出情伤。倾听用户的失恋痛苦，给予理解和安慰，帮助用户重新振作起来。回应要温暖、治愈，让用户感受到被关心。
    `.trim()
  } else if (config.characterId === 3) {
    systemPrompt += `
      
      你是小瑶，是用户的理想型恋人。浪漫、甜蜜，让用户感受到恋爱的美好。回应要甜美、浪漫，给用户带来幸福的感觉。
    `.trim()
  }

  // 如果有问卷答案，添加个性化设定
  if (config.surveyAnswers) {
    systemPrompt += `
      
      用户的偏好设定：
      ${config.surveyAnswers.gender ? `- 性别偏好：${config.surveyAnswers.gender}` : ''}
      ${config.surveyAnswers.style ? `- 风格偏好：${config.surveyAnswers.style}` : ''}
      ${config.surveyAnswers.age ? `- 年龄偏好：${config.surveyAnswers.age}` : ''}
      ${config.surveyAnswers.personality ? `- 性格偏好：${config.surveyAnswers.personality}` : ''}
      ${config.surveyAnswers.tone ? `- 语气偏好：${config.surveyAnswers.tone}` : ''}
      
      请根据这些偏好调整你的回应风格！
    `.trim()
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt }
  ]

  // 添加历史对话
  conversationHistory.forEach(msg => {
    messages.push({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    })
  })

  // 添加当前用户消息
  messages.push({ role: 'user', content: userMessage })

  return callQwenAPI(messages)
}

export interface TarotCard {
  id: number
  name: string
  group: string
  upright_keywords: string
  reversed_keywords: string
  upright_meaning: string
  reversed_meaning: string
}

export interface TarotReadingResult {
  reading: string
}

export const getTarotReading = async (
  cards: { card: TarotCard; isReversed: boolean }[],
  spreadType: 'single' | 'three',
  questionType: string,
  coreCard?: { card: TarotCard; isReversed: boolean },
  userChatContent: string = ''
): Promise<string> => {
  const sensitiveKeywords = ['生死', '重病', '赌博', '彩票', '投资暴富', '违法', '寻人', '寻物', '大师', '通灵', '命中注定', '必分手', '必发财', '有灾', '转运']
  
  const checkSensitiveContent = (content: string): boolean => {
    return sensitiveKeywords.some(keyword => content.includes(keyword))
  }
  
  if (checkSensitiveContent(userChatContent) || checkSensitiveContent(questionType)) {
    return '这类问题不适合用塔罗做参考，建议理性咨询专业人士。'
  }

  if (spreadType === 'single') {
    const systemPrompt = `
      你是一位专业的塔罗牌咨询师，擅长通过卡牌进行情绪梳理与自我觉察引导。

      解读规则：
      1. 结合用户的实际情况和抽到的卡牌进行解读
      2. 分析当下心境、现实状态，给出温和的心态调整与行动建议
      3. 理性客观，不宿命、不判吉凶、无玄学迷信
      4. 回复字数控制在100字左右

      禁止使用：大师、通灵、命中注定、必分手、必发财、有灾、转运等词汇。
    `.trim()

    const card = cards[0]
    const cardDescriptions = `抽到卡牌：${card.card.name}（${card.card.group}），${card.isReversed ? '逆位' : '正位'}，关键词：${card.isReversed ? card.card.reversed_keywords : card.card.upright_keywords}`

    const userPrompt = `
      用户疑问：${userChatContent || '暂无具体问题'}
      
      ${cardDescriptions}
      
      请结合以上信息，给出塔罗解读，分析当下心境与现实状态，提供温和的心态调整与行动建议。
    `.trim()

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    const result = await callQwenAPI(messages, undefined, 150)
    return truncateText(result, 100)
  } else {
    const systemPrompt = `
      你是一位专业的塔罗牌咨询师，擅长通过卡牌进行情绪梳理与自我觉察引导。

      解读规则：
      1. 回复结构必须分为四个部分，每部分单独一段：
         - 【核心主牌】：分析核心主牌的含义，定整体事件基调与核心内在课题
         - 【过去】：分析第一张牌，解读过往背景与经验教训
         - 【现在】：分析第二张牌，解读当下处境与内心状态
         - 【未来】：分析第三张牌，解读趋势方向与行动建议
      2. 结合用户实际情况进行解读，温和共情
      3. 拒绝宿命论与迷信解读，理性客观
      4. 每个部分用【】符号标识，单独成段
      5. 务必完整包含四个部分，不要遗漏

      禁止使用：大师、通灵、命中注定、必分手、必发财、有灾、转运等词汇。
    `.trim()

    let cardDescriptions = ''
    if (coreCard) {
      cardDescriptions += `核心主牌：${coreCard.card.name}（${coreCard.card.group}），${coreCard.isReversed ? '逆位' : '正位'}，关键词：${coreCard.isReversed ? coreCard.card.reversed_keywords : coreCard.card.upright_keywords}\n`
    } else {
      cardDescriptions += `核心主牌：无\n`
    }
    
    const positions = ['过去', '现在', '未来']
    cards.forEach((card, idx) => {
      cardDescriptions += `${positions[idx]}：${card.card.name}（${card.card.group}），${card.isReversed ? '逆位' : '正位'}，关键词：${card.isReversed ? card.card.reversed_keywords : card.card.upright_keywords}\n`
    })

    const userPrompt = `
      用户疑问：${userChatContent || '暂无具体问题'}
      
      ${cardDescriptions}
      
      请按照解读规则进行塔罗解读，分四个部分详细分析。
    `.trim()

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    const result = await callQwenAPI(messages, undefined, 1000)
    return result
  }
}

// 创建超时Promise
const createTimeoutPromise = (ms: number, message: string): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message))
    }, ms)
  })
}

export const analyzeImageContent = async (imageBase64: string, prompt?: string): Promise<string> => {
  // 首先尝试使用浏览器原生OCR API
  const nativeResult = await extractTextFromImage(imageBase64)
  if (nativeResult) {
    console.log('[OCR] Native OCR successful:', nativeResult)
    return nativeResult
  }

  // 降级到API方案 - 直接调用阿里云API
  try {
    console.log('[Multimodal API] Starting image analysis...')
    
    // 确保图片是完整的data URL格式（API需要URL格式）
    let imageData = imageBase64
    if (!imageBase64.startsWith('data:')) {
      imageData = `data:image/png;base64,${imageBase64}`
    }
    
    console.log(`[Multimodal API] Image data format: ${imageData.substring(0, 30)}...`)
    console.log(`[Multimodal API] Image data length: ${imageData.length}`)
    console.log(`[Multimodal API] Prompt: ${prompt}`)

    // 创建带超时的请求
    const fetchPromise = fetch('/.netlify/functions/qwen-api/multiCn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen3.5-omni-plus',
        input: {
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  image: imageData
                },
                {
                  type: 'text',
                  text: prompt || '请识别图片中的所有文字内容'
                }
              ]
            }
          ]
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 2000
        }
      })
    })

    // 设置15秒超时
    const response = await Promise.race([
      fetchPromise,
      createTimeoutPromise(15000, '请求超时')
    ])

    console.log(`[Multimodal API] Response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Multimodal API] API Error: ${response.status} - ${errorText}`)
      throw new Error(`API error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('[Multimodal API] Response data:', JSON.stringify(data, null, 2))
    console.log('[Multimodal API] Debug - choices[0]:', data.choices?.[0])
    console.log('[Multimodal API] Debug - choices[0].message:', data.choices?.[0]?.message)
    console.log('[Multimodal API] Debug - choices[0].message.content:', data.choices?.[0]?.message?.content)
    console.log('[Multimodal API] Debug - choices[0].message.content[0]:', data.choices?.[0]?.message?.content?.[0])
    
    // 解析响应 - 尝试多种可能的响应格式
    let result = ''
    
    // 格式1: data.output.choices[0].message.content[0].text (数组格式) - 当前API返回的格式
    if (data.output?.choices?.[0]?.message?.content?.[0]?.text) {
      result = data.output.choices[0].message.content[0].text
      console.log('[Multimodal API] Found output.choices[0].message.content[0].text')
    }
    // 格式2: data.output.text
    else if (data.output?.text) {
      result = data.output.text
      console.log('[Multimodal API] Found output.text')
    } 
    // 格式3: data.choices[0].message.content[0].text (数组格式)
    else if (data.choices?.[0]?.message?.content?.[0]?.text) {
      result = data.choices[0].message.content[0].text
      console.log('[Multimodal API] Found choices[0].message.content[0].text')
    }
    // 格式4: data.output.choices[0].message.content (字符串格式)
    else if (data.output?.choices?.[0]?.message?.content && typeof data.output.choices[0].message.content === 'string') {
      result = data.output.choices[0].message.content
      console.log('[Multimodal API] Found output.choices[0].message.content (string)')
    }
    // 格式5: data.choices[0].message.content (字符串格式)
    else if (data.choices?.[0]?.message?.content && typeof data.choices[0].message.content === 'string') {
      result = data.choices[0].message.content
      console.log('[Multimodal API] Found choices[0].message.content (string)')
    } 
    // 格式6: data.content
    else if (data.content) {
      result = data.content
      console.log('[Multimodal API] Found content')
    }
    // 格式7: data.result.output.text
    else if (data.result?.output?.text) {
      result = data.result.output.text
      console.log('[Multimodal API] Found result.output.text')
    }
    // 格式8: data.text
    else if (data.text) {
      result = data.text
      console.log('[Multimodal API] Found text')
    }
    // 格式9: data.choices[0].text
    else if (data.choices?.[0]?.text) {
      result = data.choices[0].text
      console.log('[Multimodal API] Found choices[0].text')
    }
    // 格式10: 处理output.choices中的content数组
    else if (data.output?.choices?.[0]?.message?.content && Array.isArray(data.output.choices[0].message.content)) {
      result = data.output.choices[0].message.content.map((item: any) => item.text).join('')
      console.log('[Multimodal API] Found output.choices[0].message.content (array joined)')
    }
    // 格式11: 处理choices中的content数组
    else if (data.choices?.[0]?.message?.content && Array.isArray(data.choices[0].message.content)) {
      result = data.choices[0].message.content.map((item: any) => item.text).join('')
      console.log('[Multimodal API] Found choices[0].message.content (array joined)')
    }
    
    console.log('[Multimodal API] Extracted text:', result || '(empty)')
    
    // 如果结果为空，记录完整响应以便调试
    if (!result) {
      console.warn('[Multimodal API] No text extracted from response. Full response:', JSON.stringify(data))
    }
    
    return result || ''
  } catch (error) {
    console.error('[Multimodal API] Error:', error)
    throw error
  }
}

const extractTextFromImage = async (imageBase64: string): Promise<string> => {
  return new Promise((resolve) => {
    // 检查浏览器是否支持OCR API
    if (!('OCR' in window)) {
      console.log('[OCR] Browser OCR API not supported')
      resolve('')
      return
    }

    const img = new Image()
    img.onload = async () => {
      try {
        // 创建canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve('')
          return
        }

        // 设置canvas大小
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        // 使用浏览器OCR API
        // @ts-ignore - OCR API is experimental
        const ocrResult = await window.OCR.recognize(canvas, {
          lang: 'zh-Hans,en'
        })

        if (ocrResult && ocrResult.text) {
          resolve(ocrResult.text)
        } else {
          resolve('')
        }
      } catch (error) {
        console.error('[OCR] Browser OCR failed:', error)
        resolve('')
      }
    }

    img.onerror = () => {
      console.log('[OCR] Image loading failed')
      resolve('')
    }

    img.src = imageBase64
  })
}

// 全局的识别结果临时存储
let currentRecognitionResult = ''

export const analyzeVoice = async (audioBlob: Blob): Promise<string> => {
  try {
    console.log('[Voice Recognition] Starting voice recognition with Qwen...')
    
    // 如果有通过Web Speech API识别的结果，直接返回
    if (currentRecognitionResult) {
      const result = currentRecognitionResult
      currentRecognitionResult = ''
      console.log('[Voice Recognition] Using Web Speech API result:', result)
      return result
    }
    
    // 将音频转换为base64
    const reader = new FileReader()
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64data = reader.result as string
        resolve(base64data)
      }
    })
    reader.readAsDataURL(audioBlob)
    
    const base64data = await base64Promise
    console.log('[Voice Recognition] Audio converted to base64, length:', base64data.length)
    
    // 使用Netlify Function代理进行语音识别
    try {
      const response = await fetch('/.netlify/functions/qwen-api/multiCn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen3.5-omni-plus',
          input: {
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'audio',
                    audio: base64data
                  },
                  {
                    type: 'text',
                    text: '请识别这段音频中的语音内容，直接输出识别的文字，不要添加任何解释。'
                  }
                ]
              }
            ]
          },
          parameters: {
            temperature: 0.1,
            max_tokens: 200
          }
        })
      })
      
      console.log('[Voice Recognition] Qwen 3.5 Omni API Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Voice Recognition] Qwen 3.5 Omni API Error:', response.status, errorText)
        throw new Error(`API error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('[Voice Recognition] Qwen 3.5 Omni API Response:', JSON.stringify(data, null, 2))
      
      // 解析响应 - 尝试多种可能的格式
      let result = ''
      
      // 格式1: data.output.choices[0].message.content[0].text (数组格式)
      if (data.output?.choices?.[0]?.message?.content?.[0]?.text) {
        result = data.output.choices[0].message.content[0].text
      }
      // 格式2: data.output.text
      else if (data.output?.text) {
        result = data.output.text
      }
      // 格式3: data.choices[0].message.content[0].text
      else if (data.choices?.[0]?.message?.content?.[0]?.text) {
        result = data.choices[0].message.content[0].text
      }
      // 格式4: data.output.choices[0].message.content (字符串)
      else if (data.output?.choices?.[0]?.message?.content && typeof data.output.choices[0].message.content === 'string') {
        result = data.output.choices[0].message.content
      }
      // 格式5: data.choices[0].message.content (字符串)
      else if (data.choices?.[0]?.message?.content && typeof data.choices[0].message.content === 'string') {
        result = data.choices[0].message.content
      }
      // 格式6: data.text
      else if (data.text) {
        result = data.text
      }
      
      if (result) {
        console.log('[Voice Recognition] Qwen 3.5 Omni recognized:', result)
        return result.trim()
      }
      
    } catch (apiError) {
      console.error('[Voice Recognition] Qwen 3.5 Omni API failed:', apiError)
      console.log('[Voice Recognition] Note: Qwen API may have issues. Using Web Speech API as fallback.')
    }
    
    // 如果没有识别结果，返回空字符串让调用方使用 Web Speech API 的结果
    // 或者返回模拟结果
    console.log('[Voice Recognition] No result from Qwen, returning empty to use Web Speech API result')
    return ''
    
  } catch (error) {
    console.error('[Voice Recognition] Error:', error)
    throw error
  }
}

export const setRecognitionResult = (text: string) => {
  currentRecognitionResult = text
  console.log('[Voice Recognition] Recognition result set:', text)
}

const getSimulatedVoiceText = (): string => {
  const voices = [
    '我今天心情不太好，感觉有点压抑',
    '最近工作压力好大，感觉都快要喘不过气了',
    '今天遇到了一件开心的事情，想跟你分享一下',
    '我和朋友闹矛盾了，心里很难过',
    '最近学习进度跟不上，有点焦虑',
    '今天天气很好，心情也跟着好起来了',
    '我觉得自己最近状态很差，什么都不想做',
    '和家人吵架了，不知道该怎么办才好',
    '今天面试了，感觉表现还不错',
    '最近睡眠不好，每天都很疲惫'
  ]
  
  const randomIndex = Math.floor(Math.random() * voices.length)
  return voices[randomIndex]
}

export const analyzeLoveChat = async (chatContent: string): Promise<LoveAnalysisResult> => {
  const systemPrompt = `
    你是一个专业的恋爱聊天分析助手。

    你的任务：
    1. 仔细阅读用户提供的聊天记录内容
    2. 分析对话中对方（通常是用户的恋人或暧昧对象）的情绪状态和意图
    3. 根据对方的话语，给出三种不同风格的回复建议

    分析要点：
    - 识别对方的情绪：开心、生气、难过、撒娇、冷淡、期待等
    - 理解对方的真实意图：寻求安慰、分享心情、想要帮助、测试反应等
    - 分析对话上下文和语境

    回复建议要求：
    - 温柔回应：温暖、贴心、充满爱意的回复
    - 幽默化解：轻松、有趣、带点玩笑的回复
    - 稳重回应：成熟、理性、认真的回复

    请用以下JSON格式输出，不要添加任何其他内容：
    {
      "status": "状态分析内容",
      "suggestions": {
        "soft": "温柔回应内容",
        "humorous": "幽默化解内容",
        "serious": "稳重回应内容"
      }
    }

    注意：
    - 所有内容都要用中文
    - 状态分析要简洁明了，1-2句话即可
    - 回复建议要符合对话场景，能够直接回复对方
    - 不要添加额外的解释或说明文字
  `.trim()

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `请分析以下聊天内容，并给出回复建议：\n\n${chatContent}` }
  ]

  const response = await callQwenAPI(messages, undefined, 2000)
  
  console.log('[LoveChat Analysis] API Response:', response)
  
  try {
    const result = JSON.parse(response)
    console.log('[LoveChat Analysis] Parsed result:', result)
    return result
  } catch (error) {
    // 如果解析失败，返回默认结果
    console.error('[LoveChat Analysis] JSON parse error:', error)
    console.error('[LoveChat Analysis] Raw response:', response)
    return {
      status: '对方似乎在等待你的回应，保持真诚就好',
      suggestions: {
        soft: '我想你啦，今天过得怎么样呀？',
        humorous: '哈哈，我猜你现在肯定在想我对吧？',
        serious: '我认真想了想，我觉得我们可以好好聊聊'
      }
    }
  }
}
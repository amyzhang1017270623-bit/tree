export const ZODIAC_DATA = {
  白羊: { emoji: '♈', element: '火', modality: '本位' },
  金牛: { emoji: '♉', element: '土', modality: '固定' },
  双子: { emoji: '♊', element: '风', modality: '变动' },
  巨蟹: { emoji: '♋', element: '水', modality: '本位' },
  狮子: { emoji: '♌', element: '火', modality: '固定' },
  处女: { emoji: '♍', element: '土', modality: '变动' },
  天秤: { emoji: '♎', element: '风', modality: '本位' },
  天蝎: { emoji: '♏', element: '水', modality: '固定' },
  射手: { emoji: '♐', element: '火', modality: '变动' },
  摩羯: { emoji: '♑', element: '土', modality: '本位' },
  水瓶: { emoji: '♒', element: '风', modality: '固定' },
  双鱼: { emoji: '♓', element: '水', modality: '变动' }
}

export const ZODIAC_ENGLISH = {
  '白羊': 'Aries',
  '金牛': 'Taurus',
  '双子': 'Gemini',
  '巨蟹': 'Cancer',
  '狮子': 'Leo',
  '处女': 'Virgo',
  '天秤': 'Libra',
  '天蝎': 'Scorpio',
  '射手': 'Sagittarius',
  '摩羯': 'Capricorn',
  '水瓶': 'Aquarius',
  '双鱼': 'Pisces'
}

export const LUCKY_COLORS = {
  zh: ['黄色', '粉色', '绿色', '蓝色', '紫色', '橙色', '红色', '白色'],
  en: ['Yellow', 'Pink', 'Green', 'Blue', 'Purple', 'Orange', 'Red', 'White']
}

export const LUCKY_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export const GOOD_THINGS = {
  zh: ['出行', '聚会', '学习', '表白', '购物', '运动', '整理', '规划'],
  en: ['Travel', 'Gathering', 'Study', 'Confession', 'Shopping', 'Exercise', 'Organize', 'Planning']
}

export const BAD_THINGS = {
  zh: ['争吵', '投资', '签约', '搬家', '手术', '旅游', '冒险', '拖延'],
  en: ['Argue', 'Invest', 'Sign contract', 'Move', 'Surgery', 'Travel', 'Risk', 'Procrastinate']
}

function getZodiacFromDate(birthDate: string): string {
  const date = new Date(birthDate)
  const month = date.getMonth() + 1
  const day = date.getDate()

  const zodiacMap: Record<string, [number, number]> = {
    白羊: [3, 21], 金牛: [4, 20], 双子: [5, 21], 巨蟹: [6, 22],
    狮子: [7, 23], 处女: [8, 23], 天秤: [9, 23], 天蝎: [10, 23],
    射手: [11, 22], 摩羯: [12, 22], 水瓶: [1, 20], 双鱼: [2, 19]
  }

  for (const [zodiac, [m, d]] of Object.entries(zodiacMap)) {
    if (month === m && day >= d) return zodiac
    if (month === m + 1 && day < d) return zodiac
  }
  return '摩羯'
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

function getDateSeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}

export interface FortuneData {
  zodiac: string
  zodiacEn: string
  emoji: string
  overall: { score: string; desc: string }
  love: { score: string; desc: string }
  career: { score: string; desc: string }
  wealth: { score: string; desc: string }
  health: { score: string; desc: string }
  luckyColor: string
  luckyNumber: number
  goodThing: string
  badThing: string
  mood: string
  relationship: string
  energy: string
}

export function calculateFortune(userInfo: { birthDate: string; name: string }, locale: string = 'zh'): FortuneData {
  const date = new Date()
  const dateSeed = getDateSeed(date)
  const zodiac = getZodiacFromDate(userInfo.birthDate)
  const zodiacInfo = ZODIAC_DATA[zodiac as keyof typeof ZODIAC_DATA]

  const combinedSeed = hashString(userInfo.birthDate + userInfo.name + dateSeed.toString())

  const pick = <T>(arr: T[]): T => arr[combinedSeed % arr.length]

  const pickFromDate = <T>(arr: T[]): T => {
    const seed = hashString((combinedSeed + dateSeed).toString())
    return arr[seed % arr.length]
  }

  const overallScores = ['★★★★★', '★★★★☆', '★★★☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆']
  
  const overallDescs = {
    zh: [
      '今天运势极佳，所有事情都会顺顺利利',
      '运势不错，适合处理重要事务',
      '整体平稳，保持平常心就好',
      '有些小挑战，但最终会有好结果',
      '运气不错，多做善事会增加福气'
    ],
    en: [
      'Excellent fortune today, everything will go smoothly',
      'Good fortune, suitable for handling important matters',
      'Overall stable, just keep a normal mind',
      'Some small challenges, but will have good results',
      'Good luck, doing good deeds will increase blessings'
    ]
  }

  const loveDescs = {
    zh: [
      '感情运势良好，单身者有机会遇到心仪的人',
      '有伴侣者与另一半相处融洽',
      '今天的你魅力四射，桃花运不错',
      '适合与伴侣共度美好时光',
      '感情上会有意想不到的惊喜'
    ],
    en: [
      'Good love fortune, singles may meet someone special',
      'Couples get along well with partners',
      'You are charming today, good love luck',
      'Suitable for spending quality time with partner',
      'Unexpected surprises in relationships'
    ]
  }

  const careerDescs = {
    zh: [
      '事业上会有突破性进展',
      '工作表现优异，得到上司认可',
      '适合开展新项目或学习新技能',
      '团队合作顺利，问题迎刃而解',
      '保持专注，稳扎稳打就能成功'
    ],
    en: [
      'Breakthrough progress in career',
      'Excellent work performance, recognized by superiors',
      'Suitable for starting new projects or learning new skills',
      'Smooth teamwork, problems solved easily',
      'Stay focused, steady efforts lead to success'
    ]
  }

  const wealthDescs = {
    zh: [
      '财运不错，可能有小额进账',
      '适合进行长期投资规划',
      '财务状况稳定，注意控制消费',
      '有贵人相助，财务问题能得到解决',
      '今天的购物运不错，可能买到心仪的东西'
    ],
    en: [
      'Good financial fortune, may have small income',
      'Suitable for long-term investment planning',
      'Stable financial situation, control spending',
      'Noble help available, financial issues resolved',
      'Good shopping luck today, may buy desired items'
    ]
  }

  const healthDescs = {
    zh: [
      '身体状况良好，精神充沛',
      '注意休息，不要过度劳累',
      '适合进行户外运动',
      '身体微微不适，多喝水多休息',
      '健康运势平稳，保持现有生活习惯'
    ],
    en: [
      'Good physical condition, full of energy',
      'Pay attention to rest, avoid overworking',
      'Suitable for outdoor activities',
      'Slight discomfort, drink more water and rest',
      'Stable health fortune, maintain current habits'
    ]
  }

  const moods = {
    zh: ['多云阴晴', '阳光明媚', '有些低落', '平静如水', '兴奋期待', '思绪万千'],
    en: ['Cloudy', 'Sunny', 'Somewhat low', 'Calm', 'Excited', 'Thoughtful']
  }

  const relationships = {
    zh: ['顺其自然', '关系升温', '需要沟通', '保持距离', '暧昧不明', '心有灵犀'],
    en: ['Let it be', 'Relationship warming', 'Needs communication', 'Keep distance', 'Ambiguous', 'Telepathic']
  }

  const energies = {
    zh: ['正在回血', '精力充沛', '略显疲惫', '充满活力', '需要充电', '状态极佳'],
    en: ['Recovering', 'Energetic', 'Slightly tired', 'Full of vitality', 'Needs recharge', 'Excellent condition']
  }

  return {
    zodiac,
    zodiacEn: ZODIAC_ENGLISH[zodiac as keyof typeof ZODIAC_ENGLISH],
    emoji: zodiacInfo.emoji,
    overall: {
      score: pickFromDate(overallScores),
      desc: pickFromDate(overallDescs[locale as keyof typeof overallDescs])
    },
    love: {
      score: pick(['★★★★★', '★★★★☆', '★★★☆☆', '★★☆☆☆']),
      desc: pickFromDate(loveDescs[locale as keyof typeof loveDescs])
    },
    career: {
      score: pick(['★★★★★', '★★★★☆', '★★★☆☆', '★★☆☆☆']),
      desc: pickFromDate(careerDescs[locale as keyof typeof careerDescs])
    },
    wealth: {
      score: pick(['★★★★★', '★★★★☆', '★★★☆☆', '★★☆☆☆']),
      desc: pickFromDate(wealthDescs[locale as keyof typeof wealthDescs])
    },
    health: {
      score: pick(['★★★★★', '★★★★☆', '★★★☆☆', '★★☆☆☆']),
      desc: pickFromDate(healthDescs[locale as keyof typeof healthDescs])
    },
    luckyColor: pickFromDate(LUCKY_COLORS[locale as keyof typeof LUCKY_COLORS]),
    luckyNumber: pickFromDate(LUCKY_NUMBERS),
    goodThing: pickFromDate(GOOD_THINGS[locale as keyof typeof GOOD_THINGS]),
    badThing: pickFromDate(BAD_THINGS[locale as keyof typeof BAD_THINGS]),
    mood: pickFromDate(moods[locale as keyof typeof moods]),
    relationship: pickFromDate(relationships[locale as keyof typeof relationships]),
    energy: pickFromDate(energies[locale as keyof typeof energies])
  }
}

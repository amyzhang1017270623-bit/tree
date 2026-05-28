import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

let connection = null;

// 模拟数据
let mockUsers = [];
let mockStats = {};

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, value] = trimmedLine.split('=').map(s => s.trim());
          if (key && value !== undefined && !process.env[key]) {
            process.env[key] = value;
          }
        }
      }
      console.log('✅ 已加载 .env 文件');
    } catch (error) {
      console.warn('⚠️  加载 .env 文件失败:', error.message);
    }
  }
}

export async function getConnection() {
  loadEnv();

  if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER) {
    console.warn('⚠️  未配置数据库，使用模拟数据');
    return null;
  }

  if (connection) {
    return connection;
  }

  try {
    const port = parseInt(process.env.MYSQL_PORT) || 3306;
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: port,
      connectTimeout: 10000
    });
    console.log('✅ 数据库连接成功');
    return connection;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.warn('⚠️  回退到模拟数据模式');
    return null;
  }
}

// 获取模拟数据
export function getMockUsers() { return mockUsers; }
export function getMockStats() { return mockStats; }
export function addMockUser(user) { mockUsers.push(user); mockStats[user.id] = { emotion_companion: 0, love_assistant: 0, tree_hole: 0, tarot: 0 }; }
export function updateMockStats(userId, field) { if (mockStats[userId]) { mockStats[userId][field]++; } }

import { getConnection } from './utils/mysql.js';

export async function initDatabase() {
  const conn = await getConnection();
  
  if (!conn) {
    console.log('⚠️  未连接数据库，跳过表初始化');
    return false;
  }

  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(20) NOT NULL UNIQUE,
        password VARCHAR(255) DEFAULT '',
        name VARCHAR(100) DEFAULT '',
        gender ENUM('男', '女', '保密') DEFAULT '保密',
        birth_date DATE DEFAULT NULL,
        birth_time TIME DEFAULT NULL,
        character_preferences TEXT DEFAULT NULL,
        avatar_url VARCHAR(255) DEFAULT NULL,
        location ENUM('国内', '国外') DEFAULT '国内',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    const [hasLocation] = await conn.execute(`
      SHOW COLUMNS FROM users LIKE 'location'
    `);
    if (hasLocation.length === 0) {
      await conn.execute(`
        ALTER TABLE users ADD COLUMN location ENUM('国内', '国外') DEFAULT '国内'
      `);
    }
    console.log('✅ users 表初始化成功');

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ admins 表初始化成功');

    const [adminExists] = await conn.execute('SELECT COUNT(*) as count FROM admins WHERE username = ?', ['admin']);
    if (adminExists[0].count === 0) {
      await conn.execute('INSERT INTO admins (username, password, name) VALUES (?, ?, ?)', ['admin', 'admin123', '管理员']);
      console.log('✅ 默认管理员账号创建成功');
    }

    await conn.execute('DROP TABLE IF EXISTS usage_stats');
    await conn.execute(`
      CREATE TABLE usage_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        module VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        count INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY user_module_date (user_id, module, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ usage_stats 表重新创建成功');

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) DEFAULT 'daily',
        remind_day_of BOOLEAN DEFAULT FALSE,
        remind_1day_before BOOLEAN DEFAULT FALSE,
        remind_3days_before BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ reminders 表初始化成功');

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(100) NOT NULL UNIQUE,
        key_value TEXT,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ system_settings 表初始化成功');

    const defaultSettings = [
      { key_name: 'app_name', key_value: '0号树洞', description: '应用名称' },
      { key_name: 'tarot_free_count', key_value: '2', description: '塔罗免费次数/周' },
      { key_name: 'login_timeout', key_value: '20', description: '登录超时时间（分钟）' },
      { key_name: 'daily_limit', key_value: '100', description: '每日最大使用次数' }
    ];

    for (const setting of defaultSettings) {
      const [exists] = await conn.execute('SELECT COUNT(*) as count FROM system_settings WHERE key_name = ?', [setting.key_name]);
      if (exists[0].count === 0) {
        await conn.execute('INSERT INTO system_settings (key_name, key_value, description) VALUES (?, ?, ?)', 
          [setting.key_name, setting.key_value, setting.description]);
      }
    }
    console.log('✅ 默认系统设置初始化成功');

    return true;
  } catch (error) {
    console.error('❌ 初始化数据库表失败:', error.message);
    return false;
  }
}

export async function handler(event, context) {
  const success = await initDatabase();
  
  return {
    statusCode: success ? 200 : 500,
    body: JSON.stringify({ 
      success, 
      message: success ? '数据库表初始化成功' : '数据库表初始化失败' 
    }),
    headers: { 'Access-Control-Allow-Origin': '*' }
  };
}
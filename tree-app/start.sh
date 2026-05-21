#!/bin/bash

# 自动查找并使用正确的 Node.js 路径启动项目

# 查找 Node.js 安装位置
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    echo "使用 nvm 加载 Node.js..."
    source "$HOME/.nvm/nvm.sh"
    
    # 如果有 .nvmrc 文件，使用该文件中的版本
    if [ -f ".nvmrc" ]; then
        nvm use
    else
        # 尝试使用可用的最新版本
        nvm use 24.15.0 || nvm use 16.20.2 || nvm use node
    fi
else
    # 尝试查找其他可能的 Node.js 位置
    NODE_PATHS=(
        "/Users/alice/.nvm/versions/node/v24.15.0/bin"
        "/Users/alice/.nvm/versions/node/v16.20.2/bin"
        "/Users/alice/.workbuddy/binaries/node/versions/22.12.0/bin"
        "/usr/local/bin"
        "/opt/homebrew/bin"
    )
    
    for path in "${NODE_PATHS[@]}"; do
        if [ -f "$path/node" ]; then
            echo "找到 Node.js 在: $path"
            export PATH="$path:$PATH"
            break
        fi
    done
fi

# 检查 Node.js 是否可用
if ! command -v node &> /dev/null; then
    echo "错误: 无法找到 Node.js，请确保已正确安装"
    exit 1
fi

echo "Node.js 版本: $(node --version)"
echo "npm 版本: $(npm --version)"

# 启动开发服务器
echo "启动开发服务器..."
npm run dev

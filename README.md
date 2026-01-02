# Pixiv-Evolved

一个用于增强 Pixiv 使用体验的油猴脚本，采用插件化架构，提供完善的控制面板、国际化支持和配置管理功能。

## 功能特性

- 🎨 **Pixiv 风格的控制面板** - 贴近 Pixiv 原生的 UI 设计
- 🔌 **插件化架构** - 所有功能以插件形式实现，支持独立安装和启用/禁用
- 🌐 **多语言支持** - 支持简体中文、英文、日文
- ⚙️ **配置管理** - 支持配置的导入、导出和重置（包含所有插件配置）
- 📑 **选项卡分类** - 清晰的功能分类，避免界面混乱
- 🔧 **模块化设计** - 所有功能使用独立函数，易于扩展

## 安装

1. 安装油猴扩展（Tampermonkey 或 Violentmonkey）
2. 打开 `pixiv-plus.user.js` 文件，复制全部内容
3. 在油猴扩展中创建新脚本，粘贴代码并保存

## 使用方法

1. 访问 Pixiv 网站
2. 点击浏览器扩展栏的油猴图标
3. 选择 "Pixiv-Evolved 控制面板"
4. 在控制面板中配置各项功能

## 功能说明

### 控制面板结构

控制面板分为以下选项卡：

- **常规 (General)** - 基础设置和语言选择
- **插件管理 (Plugins)** - 管理所有已安装的插件，包括启用/禁用和配置
- **显示 (Display)** - 界面显示相关设置（预留，功能通过插件实现）
- **下载 (Download)** - 下载功能相关设置（预留，功能通过插件实现）
- **高级 (Advanced)** - 高级功能和实验性设置（预留，功能通过插件实现）

### 插件系统

所有功能都通过插件的形式实现：

- **插件管理** - 在"插件管理"选项卡中查看、启用、禁用和配置所有插件
- **独立配置** - 每个插件都有自己独立的配置项，可在插件管理界面中配置
- **GitHub 加载** - 插件默认从 GitHub 仓库加载：https://github.com/juzijun233/Pixiv-Evolved
- **动态加载** - 支持通过配置添加自定义插件，无需修改主脚本
- **配置同步** - 插件配置随主配置一起导出和导入

#### 插件加载方式

插件默认从 GitHub 仓库的 `plugins` 目录加载：
- 基础插件（plugin-base.js、example-plugin.js、lazy-load.js）通过 `@require` 指令自动加载
- 自定义插件可以通过配置 `customPlugins` 数组动态加载

**添加自定义插件：**

在控制面板的配置中设置 `customPlugins` 数组，例如：
```javascript
{
  "customPlugins": ["my-custom-plugin.js"]
}
```

插件将从以下地址加载：
```
https://raw.githubusercontent.com/juzijun233/Pixiv-Evolved/main/plugins/my-custom-plugin.js
```

### 配置管理

- **导出配置** - 将所有设置导出为 JSON 文件
- **导入配置** - 从 JSON 文件导入设置
- **重置配置** - 恢复所有设置为默认值

### 国际化

脚本会自动检测浏览器语言，支持：
- 简体中文 (zh)
- English (en)
- 日本語 (ja)

也可以在控制面板中手动切换语言。

## 插件开发

### 创建新插件

参考 [plugins/README.md](plugins/README.md) 了解详细的插件开发指南。

**快速开始：**

1. 在 GitHub 仓库的 `plugins/` 目录下创建新的插件文件，例如 `my-plugin.js`
2. 继承 `PluginBase` 类并实现必要的接口
3. 定义配置项（configSchema）
4. 插件会自动从 GitHub 加载，或通过配置 `customPlugins` 动态加载
5. 插件会自动在控制面板的"插件管理"选项卡中显示

**示例：**

```javascript
class MyPlugin extends PluginBase {
    constructor() {
        super('my-plugin', {
            name: 'My Plugin',
            version: '1.0.0',
            description: '我的插件描述',
            author: 'Your Name',
            configSchema: [
                {
                    type: 'switch',
                    key: 'enabled',
                    label: '启用功能',
                    description: '开启或关闭此功能',
                    default: false
                }
            ]
        });
    }
    
    onEnable() {
        // 插件启用时的逻辑
    }
    
    onDisable() {
        // 插件禁用时的逻辑
    }
}

// 注册插件
if (typeof window.PixivEvolvedPluginManager !== 'undefined') {
    window.PixivEvolvedPluginManager.register(new MyPlugin());
}
```

### 插件配置

插件配置通过 `configSchema` 定义，支持三种类型：

- **Switch (开关)** - 布尔值配置
- **Input (输入框)** - 文本、数字等输入
- **Select (下拉选择)** - 选项列表

配置会自动在控制面板中渲染，用户可以修改并保存。

### 插件 API

插件可以访问以下全局对象：

- `window.PixivEvolvedPluginManager` - 插件管理器
- `window.PixivEvolvedConfigManager` - 配置管理器  
- `window.PixivEvolvedI18n` - 国际化系统

详细文档请查看 [plugins/README.md](plugins/README.md)。

## 项目结构

```
Pixiv-Evolved/
├── pixiv-plus.user.js     # 主脚本文件
├── README.md              # 项目说明文档
└── plugins/               # 插件目录
    ├── README.md          # 插件开发指南
    ├── plugin-base.js     # 插件基类
    └── example-plugin.js  # 示例插件
```

## 技术特点

- 纯 JavaScript 实现，无需外部依赖
- 使用 GM_* API 进行配置存储
- CSS-in-JS 方式创建样式，避免样式冲突
- 响应式设计，适配不同屏幕尺寸

## 许可证

保留所有权利

## 贡献

欢迎提交 Issue 和 Pull Request！


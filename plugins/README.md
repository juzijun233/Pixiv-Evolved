# Pixiv-Evolved 插件开发指南

## 插件系统概述

Pixiv-Evolved 采用插件化架构，所有功能都通过插件的形式实现。每个插件都是独立的 JavaScript 文件，可以单独安装、启用和禁用。

## 插件结构

### 1. 插件基类 (plugin-base.js)

所有插件都应该继承 `PluginBase` 类，该类提供了插件的基本功能：

- 插件注册和初始化
- 配置管理
- 启用/禁用控制
- 生命周期管理

### 2. 插件接口

每个插件必须实现以下接口：

```javascript
class YourPlugin extends PluginBase {
    constructor() {
        super('plugin-id', {
            name: 'Plugin Name',
            version: '1.0.0',
            description: 'Plugin description',
            author: 'Author Name',
            configSchema: [
                // 配置项定义
            ]
        });
    }
    
    init() {
        // 插件初始化
    }
    
    onEnable() {
        // 插件启用时的逻辑
    }
    
    onDisable() {
        // 插件禁用时的逻辑
    }
    
    cleanup() {
        // 清理资源
    }
}
```

## 配置项定义 (configSchema)

插件通过 `configSchema` 定义其配置项。支持三种类型的配置：

### Switch (开关)

```javascript
{
    type: 'switch',
    key: 'enabled',
    label: '启用功能',
    description: '开启或关闭此功能',
    default: false
}
```

### Input (输入框)

```javascript
{
    type: 'input',
    key: 'customText',
    label: '自定义文本',
    description: '输入自定义内容',
    default: '',
    inputType: 'text' // 'text', 'number', 'password' 等
}
```

### Select (下拉选择)

```javascript
{
    type: 'select',
    key: 'displayMode',
    label: '显示模式',
    description: '选择显示模式',
    default: 'normal',
    options: [
        { value: 'normal', label: '正常' },
        { value: 'compact', label: '紧凑' },
        { value: 'detailed', label: '详细' }
    ]
}
```

## 插件注册

插件需要在脚本末尾注册到插件管理器：

```javascript
// 方式1: 如果插件管理器已加载
if (typeof window.PixivEvolvedPluginManager !== 'undefined') {
    window.PixivEvolvedPluginManager.register(new YourPlugin());
} else {
    // 方式2: 等待插件管理器加载完成
    window.addEventListener('pixiv-evolved-ready', () => {
        if (typeof window.PixivEvolvedPluginManager !== 'undefined') {
            window.PixivEvolvedPluginManager.register(new YourPlugin());
        }
    });
}
```

## 使用配置

在插件中访问配置：

```javascript
// 获取配置值
const value = this.getConfig('configKey', defaultValue);

// 设置配置值
this.setConfig('configKey', value);

// 获取所有配置
const allConfig = this.getAllConfig();

// 设置所有配置
this.setAllConfig(configObject);
```

## 访问全局对象

插件可以访问以下全局对象：

- `window.PixivEvolvedPluginManager` - 插件管理器
- `window.PixivEvolvedConfigManager` - 配置管理器
- `window.PixivEvolvedI18n` - 国际化系统

## 示例插件

参考 `example-plugin.js` 查看完整的插件示例。

## 插件部署

### 方式1: 使用 @require 指令

在主脚本的头部添加：

```javascript
// @require      https://your-domain.com/plugins/your-plugin.js
```

### 方式2: 动态加载

在主脚本中使用：

```javascript
PluginManager.loadPluginScript('https://your-domain.com/plugins/your-plugin.js');
```

## 最佳实践

1. **插件ID唯一性**: 确保每个插件有唯一的 ID
2. **配置默认值**: 为所有配置项提供合理的默认值
3. **错误处理**: 在 init、onEnable 等方法中添加错误处理
4. **资源清理**: 在 onDisable 和 cleanup 中清理所有添加的元素和事件监听器
5. **配置验证**: 在设置配置时进行必要的验证
6. **国际化**: 考虑添加多语言支持

## 插件开发检查清单

- [ ] 继承 PluginBase 类
- [ ] 定义唯一的插件 ID
- [ ] 实现必要的生命周期方法
- [ ] 定义 configSchema
- [ ] 注册插件到插件管理器
- [ ] 测试插件的启用/禁用
- [ ] 测试配置项的保存和读取
- [ ] 测试资源清理
- [ ] 添加错误处理


/**
 * 示例插件
 * 演示如何创建一个 Pixiv-Evolved 插件
 */

(function() {
    'use strict';

    // 确保插件基类已加载
    if (typeof window.PixivEvolvedPluginBase === 'undefined') {
        console.error('PluginBase not found. Please ensure plugin-base.js is loaded first.');
        return;
    }

    class ExamplePlugin extends window.PixivEvolvedPluginBase {
        constructor() {
            super('example-plugin', {
                name: 'Example Plugin',
                version: '1.0.0',
                description: '这是一个示例插件，演示如何创建 Pixiv-Evolved 插件',
                author: 'Pixiv-Evolved Team',
                configSchema: [
                    {
                        type: 'switch',
                        key: 'enabled',
                        label: '启用示例功能',
                        description: '开启或关闭示例功能',
                        default: false
                    },
                    {
                        type: 'input',
                        key: 'customText',
                        label: '自定义文本',
                        description: '输入自定义文本内容',
                        default: '',
                        inputType: 'text'
                    },
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
                ]
            });
        }

        init() {
            super.init();
            // 初始化插件逻辑
            console.log('Example plugin initialized');
        }

        onEnable() {
            super.onEnable();
            // 插件启用时的逻辑
            const enabled = this.getConfig('enabled');
            if (enabled) {
                console.log('Example plugin enabled');
                // 在这里添加你的功能代码
                this.setupFeature();
            }
        }

        onDisable() {
            super.onDisable();
            // 插件禁用时的逻辑
            console.log('Example plugin disabled');
            // 清理功能
            this.cleanupFeature();
        }

        setupFeature() {
            // 设置功能
            const customText = this.getConfig('customText');
            const displayMode = this.getConfig('displayMode');
            
            console.log(`Custom text: ${customText}, Display mode: ${displayMode}`);
            
            // 在这里实现你的功能
            // 例如：修改页面元素、添加事件监听器等
        }

        cleanupFeature() {
            // 清理功能，移除添加的元素或事件监听器
        }

        cleanup() {
            this.cleanupFeature();
            super.cleanup();
        }
    }

    // 注册插件
    if (typeof window.PixivEvolvedPluginManager !== 'undefined') {
        window.PixivEvolvedPluginManager.register(new ExamplePlugin());
    } else {
        // 如果插件管理器还未加载，等待加载后再注册
        window.addEventListener('pixiv-evolved-ready', () => {
            if (typeof window.PixivEvolvedPluginManager !== 'undefined') {
                window.PixivEvolvedPluginManager.register(new ExamplePlugin());
            }
        });
    }

})();


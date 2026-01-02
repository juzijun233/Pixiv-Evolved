/**
 * Pixiv Plus 插件基类
 * 所有插件都应该继承或遵循这个接口规范
 */

(function() {
    'use strict';

    /**
     * 插件基类
     */
    class PluginBase {
        constructor(pluginId, pluginInfo) {
            this.id = pluginId;
            this.name = pluginInfo.name || pluginId;
            this.version = pluginInfo.version || '1.0.0';
            this.description = pluginInfo.description || '';
            this.author = pluginInfo.author || '';
            this.enabled = false;
            this.config = {};
            
            // 插件配置项定义
            // 格式: [{ type: 'switch|input|select', key: 'configKey', label: 'Label', description: 'Desc', default: value, options: [...] }]
            this.configSchema = pluginInfo.configSchema || [];
        }

        /**
         * 初始化插件
         */
        init() {
            // 子类应该重写此方法
            console.log(`Plugin ${this.id} initialized`);
        }

        /**
         * 启用插件
         */
        enable() {
            this.enabled = true;
            this.onEnable();
        }

        /**
         * 禁用插件
         */
        disable() {
            this.enabled = false;
            this.onDisable();
        }

        /**
         * 插件启用时的回调
         */
        onEnable() {
            // 子类应该重写此方法
        }

        /**
         * 插件禁用时的回调
         */
        onDisable() {
            // 子类应该重写此方法
        }

        /**
         * 获取配置值
         */
        getConfig(key, defaultValue = null) {
            if (this.config && this.config[key] !== undefined) {
                return this.config[key];
            }
            // 从配置schema中获取默认值
            const schemaItem = this.configSchema.find(item => item.key === key);
            if (schemaItem && schemaItem.default !== undefined) {
                return schemaItem.default;
            }
            return defaultValue;
        }

        /**
         * 设置配置值
         */
        setConfig(key, value) {
            if (!this.config) {
                this.config = {};
            }
            this.config[key] = value;
        }

        /**
         * 获取所有配置
         */
        getAllConfig() {
            const config = {};
            this.configSchema.forEach(item => {
                config[item.key] = this.getConfig(item.key, item.default);
            });
            return { ...config, ...this.config };
        }

        /**
         * 设置所有配置
         */
        setAllConfig(config) {
            this.config = { ...config };
        }

        /**
         * 清理资源
         */
        cleanup() {
            // 子类应该重写此方法
            this.disable();
        }
    }

    // 导出到全局
    if (typeof window !== 'undefined') {
        window.PixivPlusPluginBase = PluginBase;
    }

})();


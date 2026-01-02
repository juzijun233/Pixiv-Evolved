// ==UserScript==
// @name         Pixiv-Evolved
// @namespace    https://github.com/juzijun233/Pixiv-Evolved
// @version      1.0.0
// @description  增强 Pixiv 使用体验的油猴脚本
// @author       juzijun233
// @match        https://www.pixiv.net/*
// @match        https://pixiv.net/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @license      MIT
// @require      https://raw.githubusercontent.com/juzijun233/Pixiv-Evolved/main/plugins/plugin-base.js
// @require      https://raw.githubusercontent.com/juzijun233/Pixiv-Evolved/main/plugins/example-plugin.js
// @require      https://raw.githubusercontent.com/juzijun233/Pixiv-Evolved/main/plugins/lazy-load.js
// @require      https://raw.githubusercontent.com/juzijun233/Pixiv-Evolved/main/plugins/show-following.js
// 注意：插件文件默认从 GitHub 仓库加载
// GitHub 地址：https://github.com/juzijun233/Pixiv-Evolved
// 插件目录：https://raw.githubusercontent.com/juzijun233/Pixiv-Evolved/main/plugins/
// ==/UserScript==

(function() {
    'use strict';

    // ==================== i18n 国际化系统 ====================
    const i18n = {
        languages: {
            zh: {
                // 通用
                save: '保存',
                cancel: '取消',
                confirm: '确认',
                close: '关闭',
                export: '导出配置',
                import: '导入配置',
                reset: '重置',
                
                // 控制面板
                controlPanel: 'Pixiv-Evolved 控制面板',
                general: '常规',
                plugins: '插件管理',
                display: '显示',
                download: '下载',
                advanced: '高级',
                
                // 插件管理
                pluginList: '插件列表',
                pluginName: '插件名称',
                pluginVersion: '版本',
                pluginAuthor: '作者',
                pluginDescription: '描述',
                pluginStatus: '状态',
                pluginSettings: '插件设置',
                noPlugins: '暂无已安装的插件',
                enablePlugin: '启用',
                disablePlugin: '禁用',
                
                // 配置管理
                exportSuccess: '配置导出成功',
                importSuccess: '配置导入成功',
                importError: '配置导入失败，请检查文件格式',
                resetConfirm: '确定要重置所有配置吗？此操作不可恢复。',
                resetSuccess: '配置已重置',
                
                // 示例功能
                exampleFeature: '示例功能',
                exampleFeatureDesc: '这是一个示例功能开关',
                exampleOption: '示例选项',
                exampleOptionDesc: '这是一个示例选项',
                exampleInput: '示例输入',
                exampleInputDesc: '请输入内容',
                exampleSelect: '示例选择',
                exampleSelectDesc: '请选择选项',
                
                // 功能标签
                enabled: '已启用',
                disabled: '已禁用',
                
                // 语言设置
                language: '语言',
                languageDesc: '选择界面显示语言',
                
                // 下载设置
                downloadQuality: '下载质量',
                downloadQualityDesc: '选择下载图片的质量',
                
                // 插件源设置
                pluginSource: '插件源',
                pluginSourceDesc: '设置插件的加载源地址（默认为 GitHub 仓库）',
                pluginSourcePlaceholder: 'https://raw.githubusercontent.com/username/repo/main/plugins',
                pluginSourceReset: '重置为默认值',
                pluginSourceCurrent: '当前插件源',
                pluginSourceTest: '测试连接',
                pluginSourceTestSuccess: '连接成功',
                pluginSourceTestFailed: '连接失败',
            },
            en: {
                // General
                save: 'Save',
                cancel: 'Cancel',
                confirm: 'Confirm',
                close: 'Close',
                export: 'Export Config',
                import: 'Import Config',
                reset: 'Reset',
                
                // Control Panel
                controlPanel: 'Pixiv-Evolved Control Panel',
                general: 'General',
                plugins: 'Plugins',
                display: 'Display',
                download: 'Download',
                advanced: 'Advanced',
                
                // Plugin Management
                pluginList: 'Plugin List',
                pluginName: 'Plugin Name',
                pluginVersion: 'Version',
                pluginAuthor: 'Author',
                pluginDescription: 'Description',
                pluginStatus: 'Status',
                pluginSettings: 'Plugin Settings',
                noPlugins: 'No plugins installed',
                enablePlugin: 'Enable',
                disablePlugin: 'Disable',
                
                // Config Management
                exportSuccess: 'Config exported successfully',
                importSuccess: 'Config imported successfully',
                importError: 'Config import failed, please check file format',
                resetConfirm: 'Are you sure you want to reset all settings? This action cannot be undone.',
                resetSuccess: 'Config has been reset',
                
                // Example Features
                exampleFeature: 'Example Feature',
                exampleFeatureDesc: 'This is an example feature switch',
                exampleOption: 'Example Option',
                exampleOptionDesc: 'This is an example option',
                exampleInput: 'Example Input',
                exampleInputDesc: 'Please enter content',
                exampleSelect: 'Example Select',
                exampleSelectDesc: 'Please select an option',
                
                // Feature Labels
                enabled: 'Enabled',
                disabled: 'Disabled',
                
                // Language Settings
                language: 'Language',
                languageDesc: 'Select interface language',
                
                // Download Settings
                downloadQuality: 'Download Quality',
                downloadQualityDesc: 'Select the quality of downloaded images',
                
                // Plugin Source Settings
                pluginSource: 'Plugin Source',
                pluginSourceDesc: 'Set the plugin source URL (default: GitHub repository)',
                pluginSourcePlaceholder: 'https://raw.githubusercontent.com/username/repo/main/plugins',
                pluginSourceReset: 'Reset to Default',
                pluginSourceCurrent: 'Current Plugin Source',
                pluginSourceTest: 'Test Connection',
                pluginSourceTestSuccess: 'Connection successful',
                pluginSourceTestFailed: 'Connection failed',
            },
            ja: {
                // 一般
                save: '保存',
                cancel: 'キャンセル',
                confirm: '確認',
                close: '閉じる',
                export: '設定をエクスポート',
                import: '設定をインポート',
                reset: 'リセット',
                
                // コントロールパネル
                controlPanel: 'Pixiv-Evolved コントロールパネル',
                general: '一般',
                plugins: 'プラグイン管理',
                display: '表示',
                download: 'ダウンロード',
                advanced: '高度',
                
                // プラグイン管理
                pluginList: 'プラグインリスト',
                pluginName: 'プラグイン名',
                pluginVersion: 'バージョン',
                pluginAuthor: '作者',
                pluginDescription: '説明',
                pluginStatus: 'ステータス',
                pluginSettings: 'プラグイン設定',
                noPlugins: 'インストール済みプラグインなし',
                enablePlugin: '有効化',
                disablePlugin: '無効化',
                
                // 設定管理
                exportSuccess: '設定のエクスポートに成功しました',
                importSuccess: '設定のインポートに成功しました',
                importError: '設定のインポートに失敗しました。ファイル形式を確認してください',
                resetConfirm: 'すべての設定をリセットしてもよろしいですか？この操作は元に戻せません。',
                resetSuccess: '設定がリセットされました',
                
                // サンプル機能
                exampleFeature: 'サンプル機能',
                exampleFeatureDesc: 'これはサンプル機能スイッチです',
                exampleOption: 'サンプルオプション',
                exampleOptionDesc: 'これはサンプルオプションです',
                exampleInput: 'サンプル入力',
                exampleInputDesc: '内容を入力してください',
                exampleSelect: 'サンプル選択',
                exampleSelectDesc: 'オプションを選択してください',
                
                // 機能ラベル
                enabled: '有効',
                disabled: '無効',
                
                // 言語設定
                language: '言語',
                languageDesc: 'インターフェースの表示言語を選択',
                
                // ダウンロード設定
                downloadQuality: 'ダウンロード品質',
                downloadQualityDesc: 'ダウンロードする画像の品質を選択',
                
                // プラグインソース設定
                pluginSource: 'プラグインソース',
                pluginSourceDesc: 'プラグインの読み込み元アドレスを設定（デフォルト: GitHub リポジトリ）',
                pluginSourcePlaceholder: 'https://raw.githubusercontent.com/username/repo/main/plugins',
                pluginSourceReset: 'デフォルトにリセット',
                pluginSourceCurrent: '現在のプラグインソース',
                pluginSourceTest: '接続テスト',
                pluginSourceTestSuccess: '接続成功',
                pluginSourceTestFailed: '接続失敗',
            }
        },
        
        currentLang: 'zh',
        
        init() {
            // 检测浏览器语言
            const browserLang = navigator.language.split('-')[0];
            if (this.languages[browserLang]) {
                this.currentLang = browserLang;
            }
            
            // 尝试从配置中读取语言设置
            const savedLang = ConfigManager.get('language');
            if (savedLang && this.languages[savedLang]) {
                this.currentLang = savedLang;
            }
        },
        
        t(key) {
            const lang = this.languages[this.currentLang] || this.languages.zh;
            return lang[key] || key;
        },
        
        setLang(lang) {
            if (this.languages[lang]) {
                this.currentLang = lang;
                ConfigManager.set('language', lang);
            }
        }
    };

    // ==================== 配置管理系统 ====================
    const ConfigManager = {
        prefix: 'pixivEvolved_',
        
        get(key, defaultValue = null) {
            const value = GM_getValue(this.prefix + key, defaultValue);
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        },
        
        set(key, value) {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            GM_setValue(this.prefix + key, stringValue);
        },
        
        delete(key) {
            GM_deleteValue(this.prefix + key);
        },
        
        getAll() {
            const allValues = {};
            const values = GM_listValues();
            values.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    const configKey = key.replace(this.prefix, '');
                    allValues[configKey] = this.get(configKey);
                }
            });
            return allValues;
        },
        
        setAll(config) {
            Object.keys(config).forEach(key => {
                this.set(key, config[key]);
            });
        },
        
        reset() {
            const values = GM_listValues();
            values.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    GM_deleteValue(key);
                }
            });
        },
        
        export() {
            const config = this.getAll();
            // 包含插件配置
            const pluginConfigs = PluginManager.exportPluginsConfig();
            const allConfig = { ...config, ...pluginConfigs };
            const blob = new Blob([JSON.stringify(allConfig, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pixiv-evolved-config-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        
        import(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const config = JSON.parse(e.target.result);
                        // 分离插件配置和普通配置
                        const pluginConfigs = {};
                        const normalConfig = {};
                        Object.keys(config).forEach(key => {
                            if (key.startsWith('plugin_')) {
                                pluginConfigs[key] = config[key];
                            } else {
                                normalConfig[key] = config[key];
                            }
                        });
                        
                        this.setAll(normalConfig);
                        // 导入插件配置
                        if (Object.keys(pluginConfigs).length > 0) {
                            PluginManager.importPluginsConfig(pluginConfigs);
                        }
                        // 更新语言设置
                        if (normalConfig.language) {
                            i18n.setLang(normalConfig.language);
                        }
                        resolve(config);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = () => reject(new Error('File read error'));
                reader.readAsText(file);
            });
        }
    };

    // ==================== 插件管理系统 ====================
    const PluginManager = {
        plugins: {},
        pluginConfigs: {},
        
        /**
         * 注册插件
         */
        register(plugin) {
            if (!plugin || !plugin.id) {
                console.error('Invalid plugin: plugin must have an id');
                return false;
            }
            
            // 加载插件配置
            const pluginConfigKey = `plugin_${plugin.id}`;
            const savedConfig = ConfigManager.get(pluginConfigKey, { enabled: false, config: {} });
            
            plugin.enabled = savedConfig.enabled || false;
            plugin.setAllConfig(savedConfig.config || {});
            
            // 保存插件配置的引用
            this.pluginConfigs[plugin.id] = {
                enabled: plugin.enabled,
                config: plugin.getAllConfig()
            };
            
            // 初始化插件
            try {
                plugin.init();
                
                // 如果插件已启用，则启用它
                if (plugin.enabled) {
                    plugin.enable();
                }
                
                this.plugins[plugin.id] = plugin;
                console.log(`Plugin ${plugin.id} registered successfully`);
                return true;
            } catch (error) {
                console.error(`Failed to initialize plugin ${plugin.id}:`, error);
                return false;
            }
        },
        
        /**
         * 卸载插件
         */
        unregister(pluginId) {
            if (this.plugins[pluginId]) {
                try {
                    this.plugins[pluginId].cleanup();
                    delete this.plugins[pluginId];
                    delete this.pluginConfigs[pluginId];
                    ConfigManager.delete(`plugin_${pluginId}`);
                    return true;
                } catch (error) {
                    console.error(`Failed to unregister plugin ${pluginId}:`, error);
                    return false;
                }
            }
            return false;
        },
        
        /**
         * 启用插件
         */
        enablePlugin(pluginId) {
            if (this.plugins[pluginId]) {
                try {
                    this.plugins[pluginId].enable();
                    this.pluginConfigs[pluginId].enabled = true;
                    this.savePluginConfig(pluginId);
                    return true;
                } catch (error) {
                    console.error(`Failed to enable plugin ${pluginId}:`, error);
                    return false;
                }
            }
            return false;
        },
        
        /**
         * 禁用插件
         */
        disablePlugin(pluginId) {
            if (this.plugins[pluginId]) {
                try {
                    this.plugins[pluginId].disable();
                    this.pluginConfigs[pluginId].enabled = false;
                    this.savePluginConfig(pluginId);
                    return true;
                } catch (error) {
                    console.error(`Failed to disable plugin ${pluginId}:`, error);
                    return false;
                }
            }
            return false;
        },
        
        /**
         * 获取插件
         */
        getPlugin(pluginId) {
            return this.plugins[pluginId];
        },
        
        /**
         * 获取所有插件
         */
        getAllPlugins() {
            return Object.values(this.plugins);
        },
        
        /**
         * 更新插件配置
         */
        updatePluginConfig(pluginId, config) {
            if (this.plugins[pluginId]) {
                this.plugins[pluginId].setAllConfig(config);
                this.pluginConfigs[pluginId].config = config;
                this.savePluginConfig(pluginId);
                return true;
            }
            return false;
        },
        
        /**
         * 获取插件配置
         */
        getPluginConfig(pluginId) {
            if (this.pluginConfigs[pluginId]) {
                return {
                    enabled: this.pluginConfigs[pluginId].enabled,
                    config: { ...this.pluginConfigs[pluginId].config }
                };
            }
            return null;
        },
        
        /**
         * 保存插件配置
         */
        savePluginConfig(pluginId) {
            if (this.plugins[pluginId] && this.pluginConfigs[pluginId]) {
                const plugin = this.plugins[pluginId];
                const configData = {
                    enabled: plugin.enabled,
                    config: plugin.getAllConfig()
                };
                ConfigManager.set(`plugin_${pluginId}`, configData);
            }
        },
        
        /**
         * 导出所有插件配置
         */
        exportPluginsConfig() {
            const config = {};
            Object.keys(this.plugins).forEach(pluginId => {
                config[`plugin_${pluginId}`] = this.getPluginConfig(pluginId);
            });
            return config;
        },
        
        /**
         * 导入插件配置
         */
        importPluginsConfig(config) {
            Object.keys(config).forEach(key => {
                if (key.startsWith('plugin_')) {
                    const pluginId = key.replace('plugin_', '');
                    const pluginConfig = config[key];
                    if (this.plugins[pluginId]) {
                        const plugin = this.plugins[pluginId];
                        if (pluginConfig.enabled !== undefined) {
                            if (pluginConfig.enabled) {
                                this.enablePlugin(pluginId);
                            } else {
                                this.disablePlugin(pluginId);
                            }
                        }
                        if (pluginConfig.config) {
                            this.updatePluginConfig(pluginId, pluginConfig.config);
                        }
                    }
                }
            });
        },
        
        /**
         * 加载插件脚本
         */
        async loadPluginScript(url) {
            try {
                const response = await fetch(url);
                const code = await response.text();
                // 在全局作用域中执行插件代码
                const script = document.createElement('script');
                script.textContent = code;
                document.head.appendChild(script);
                script.remove();
                return true;
            } catch (error) {
                console.error(`Failed to load plugin script ${url}:`, error);
                return false;
            }
        }
    };
    
    // 暴露到全局，供插件使用
    if (typeof window !== 'undefined') {
        window.PixivEvolvedPluginManager = PluginManager;
        window.PixivEvolvedConfigManager = ConfigManager;
        window.PixivEvolvedI18n = i18n;
        
        // 触发插件就绪事件
        window.dispatchEvent(new CustomEvent('pixiv-evolved-ready'));
    }

    // ==================== 控制面板 UI ====================
    const ControlPanel = {
        panel: null,
        isVisible: false,
        
        init() {
            i18n.init();
            this.createPanel();
            this.registerMenuCommand();
        },
        
        registerMenuCommand() {
            GM_registerMenuCommand(i18n.t('controlPanel'), () => {
                this.toggle();
            });
        },
        
        createPanel() {
            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.id = 'pixiv-evolved-overlay';
            overlay.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                z-index: 999998;
                opacity: 0;
                transition: opacity 0.2s ease;
            `;
            
            // 创建主面板
            this.panel = document.createElement('div');
            this.panel.id = 'pixiv-evolved-panel';
            this.panel.style.cssText = `
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.95);
                width: 90%;
                max-width: 800px;
                max-height: 85vh;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
                z-index: 999999;
                opacity: 0;
                transition: all 0.2s ease;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
            `;
            
            this.buildPanelContent();
            
            overlay.appendChild(this.panel);
            document.body.appendChild(overlay);
            
            // 点击遮罩层关闭
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hide();
                }
            });
        },
        
        buildPanelContent() {
            // 头部
            const header = document.createElement('div');
            header.style.cssText = `
                padding: 20px 24px;
                border-bottom: 1px solid #e5e5e5;
                background: #fafafa;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            const title = document.createElement('h2');
            title.textContent = i18n.t('controlPanel');
            title.style.cssText = `
                margin: 0;
                font-size: 20px;
                font-weight: 600;
                color: #212121;
            `;
            
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.cssText = `
                background: none;
                border: none;
                font-size: 32px;
                color: #666;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s;
            `;
            closeBtn.onmouseover = () => { closeBtn.style.background = '#f0f0f0'; };
            closeBtn.onmouseout = () => { closeBtn.style.background = 'none'; };
            closeBtn.onclick = () => this.hide();
            
            header.appendChild(title);
            header.appendChild(closeBtn);
            
            // 主体内容区域
            const body = document.createElement('div');
            body.style.cssText = `
                display: flex;
                height: calc(85vh - 140px);
                overflow: hidden;
            `;
            
            // 选项卡导航
            const tabs = document.createElement('div');
            tabs.id = 'pixiv-evolved-tabs';
            tabs.style.cssText = `
                width: 180px;
                background: #f5f5f5;
                border-right: 1px solid #e5e5e5;
                padding: 16px 0;
                overflow-y: auto;
            `;
            
            // 选项卡内容区
            const tabContent = document.createElement('div');
            tabContent.id = 'pixiv-evolved-tab-content';
            tabContent.style.cssText = `
                flex: 1;
                padding: 24px;
                overflow-y: auto;
            `;
            
            // 定义选项卡
            const tabDefinitions = [
                { id: 'general', label: 'general', content: this.buildGeneralTab.bind(this) },
                { id: 'plugins', label: 'plugins', content: this.buildPluginsTab.bind(this) },
                { id: 'display', label: 'display', content: this.buildDisplayTab.bind(this) },
                { id: 'download', label: 'download', content: this.buildDownloadTab.bind(this) },
                { id: 'advanced', label: 'advanced', content: this.buildAdvancedTab.bind(this) }
            ];
            
            // 创建选项卡
            let activeTab = 'general';
            tabDefinitions.forEach(tabDef => {
                const tab = document.createElement('div');
                tab.className = 'pixiv-evolved-tab';
                tab.dataset.tab = tabDef.id;
                tab.textContent = i18n.t(tabDef.label);
                tab.style.cssText = `
                    padding: 12px 20px;
                    cursor: pointer;
                    color: #666;
                    font-size: 14px;
                    transition: all 0.2s;
                    border-left: 3px solid transparent;
                `;
                
                if (tabDef.id === activeTab) {
                    tab.style.background = '#fff';
                    tab.style.color = '#0096fa';
                    tab.style.borderLeftColor = '#0096fa';
                    tab.style.fontWeight = '600';
                }
                
                tab.onmouseover = () => {
                    if (tab.dataset.tab !== activeTab) {
                        tab.style.background = '#fafafa';
                    }
                };
                tab.onmouseout = () => {
                    if (tab.dataset.tab !== activeTab) {
                        tab.style.background = 'transparent';
                    }
                };
                
                tab.onclick = () => {
                    // 更新活动选项卡
                    document.querySelectorAll('.pixiv-evolved-tab').forEach(t => {
                        t.style.background = 'transparent';
                        t.style.color = '#666';
                        t.style.borderLeftColor = 'transparent';
                        t.style.fontWeight = 'normal';
                    });
                    tab.style.background = '#fff';
                    tab.style.color = '#0096fa';
                    tab.style.borderLeftColor = '#0096fa';
                    tab.style.fontWeight = '600';
                    activeTab = tabDef.id;
                    
                    // 更新内容
                    tabContent.innerHTML = '';
                    tabContent.appendChild(tabDef.content());
                };
                
                tabs.appendChild(tab);
            });
            
            // 加载默认选项卡内容
            tabContent.appendChild(tabDefinitions[0].content());
            
            body.appendChild(tabs);
            body.appendChild(tabContent);
            
            // 底部操作栏
            const footer = document.createElement('div');
            footer.style.cssText = `
                padding: 16px 24px;
                border-top: 1px solid #e5e5e5;
                background: #fafafa;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            const leftActions = document.createElement('div');
            leftActions.style.cssText = 'display: flex; gap: 8px;';
            
            const importBtn = this.createButton(i18n.t('import'), 'secondary', () => this.importConfig());
            const exportBtn = this.createButton(i18n.t('export'), 'secondary', () => {
                ConfigManager.export();
                this.showMessage(i18n.t('exportSuccess'));
            });
            const resetBtn = this.createButton(i18n.t('reset'), 'secondary', () => this.resetConfig());
            
            leftActions.appendChild(importBtn);
            leftActions.appendChild(exportBtn);
            leftActions.appendChild(resetBtn);
            
            const rightActions = document.createElement('div');
            const saveBtn = this.createButton(i18n.t('save'), 'primary', () => {
                this.saveAllSettings();
                this.showMessage(i18n.t('save') + ' ' + i18n.t('exportSuccess'));
            });
            rightActions.appendChild(saveBtn);
            
            footer.appendChild(leftActions);
            footer.appendChild(rightActions);
            
            // 组装面板
            this.panel.appendChild(header);
            this.panel.appendChild(body);
            this.panel.appendChild(footer);
            
            // 创建隐藏的文件输入
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImport(file);
                }
                fileInput.value = '';
            };
            document.body.appendChild(fileInput);
            this.fileInput = fileInput;
            
            // 绑定导入按钮
            importBtn.onclick = () => fileInput.click();
        },
        
        createButton(text, type = 'primary', onClick) {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.onclick = onClick;
            const isPrimary = type === 'primary';
            btn.style.cssText = `
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                background: ${isPrimary ? '#0096fa' : '#f0f0f0'};
                color: ${isPrimary ? '#fff' : '#212121'};
            `;
            btn.onmouseover = () => {
                btn.style.background = isPrimary ? '#0088e6' : '#e0e0e0';
            };
            btn.onmouseout = () => {
                btn.style.background = isPrimary ? '#0096fa' : '#f0f0f0';
            };
            return btn;
        },
        
        createSettingItem(label, description, inputElement) {
            const item = document.createElement('div');
            item.style.cssText = `
                margin-bottom: 24px;
                padding-bottom: 24px;
                border-bottom: 1px solid #f0f0f0;
            `;
            
            const labelDiv = document.createElement('div');
            labelDiv.style.cssText = `
                font-size: 14px;
                font-weight: 600;
                color: #212121;
                margin-bottom: 4px;
            `;
            labelDiv.textContent = label;
            
            const descDiv = document.createElement('div');
            descDiv.style.cssText = `
                font-size: 12px;
                color: #999;
                margin-bottom: 12px;
            `;
            descDiv.textContent = description;
            
            item.appendChild(labelDiv);
            item.appendChild(descDiv);
            item.appendChild(inputElement);
            
            return item;
        },
        
        createSwitch(key, label, description, defaultValue = false, getValueFn = null, setValueFn = null) {
            const switchContainer = document.createElement('label');
            switchContainer.style.cssText = `
                display: flex;
                align-items: center;
                cursor: pointer;
                user-select: none;
            `;
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = getValueFn ? getValueFn() : ConfigManager.get(key, defaultValue);
            input.style.cssText = `
                width: 0;
                height: 0;
                opacity: 0;
                position: absolute;
            `;
            
            const slider = document.createElement('span');
            slider.style.cssText = `
                position: relative;
                width: 44px;
                height: 24px;
                background: ${input.checked ? '#0096fa' : '#ccc'};
                border-radius: 12px;
                transition: background 0.3s;
                margin-right: 12px;
            `;
            
            const circle = document.createElement('span');
            circle.style.cssText = `
                position: absolute;
                top: 2px;
                left: ${input.checked ? '22px' : '2px'};
                width: 20px;
                height: 20px;
                background: #fff;
                border-radius: 50%;
                transition: left 0.3s;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            `;
            
            slider.appendChild(circle);
            switchContainer.appendChild(input);
            switchContainer.appendChild(slider);
            
            const labelSpan = document.createElement('span');
            labelSpan.textContent = input.checked ? i18n.t('enabled') : i18n.t('disabled');
            labelSpan.style.cssText = 'font-size: 14px; color: #666;';
            
            input.onchange = () => {
                slider.style.background = input.checked ? '#0096fa' : '#ccc';
                circle.style.left = input.checked ? '22px' : '2px';
                labelSpan.textContent = input.checked ? i18n.t('enabled') : i18n.t('disabled');
                if (setValueFn) {
                    setValueFn(input.checked);
                } else {
                    ConfigManager.set(key, input.checked);
                }
            };
            
            switchContainer.appendChild(labelSpan);
            
            return this.createSettingItem(label, description, switchContainer);
        },
        
        createInput(key, label, description, type = 'text', defaultValue = '', getValueFn = null, setValueFn = null) {
            const input = document.createElement('input');
            input.type = type;
            input.value = getValueFn ? getValueFn() : ConfigManager.get(key, defaultValue);
            input.style.cssText = `
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                box-sizing: border-box;
                transition: border-color 0.2s;
            `;
            input.onfocus = () => { input.style.borderColor = '#0096fa'; };
            input.onblur = () => { input.style.borderColor = '#ddd'; };
            input.onchange = () => { 
                if (setValueFn) {
                    setValueFn(input.value);
                } else {
                    ConfigManager.set(key, input.value);
                }
            };
            
            return this.createSettingItem(label, description, input);
        },
        
        createSelect(key, label, description, options, defaultValue = '', getValueFn = null, setValueFn = null) {
            const select = document.createElement('select');
            select.value = getValueFn ? getValueFn() : ConfigManager.get(key, defaultValue);
            select.style.cssText = `
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                background: #fff;
                cursor: pointer;
                box-sizing: border-box;
            `;
            
            options.forEach(option => {
                const optionEl = document.createElement('option');
                optionEl.value = option.value;
                optionEl.textContent = option.label;
                select.appendChild(optionEl);
            });
            
            select.onchange = () => { 
                if (setValueFn) {
                    setValueFn(select.value);
                } else {
                    ConfigManager.set(key, select.value);
                }
            };
            
            return this.createSettingItem(label, description, select);
        },
        
        buildPluginsTab() {
            const container = document.createElement('div');
            
            const plugins = PluginManager.getAllPlugins();
            
            if (plugins.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.textContent = i18n.t('noPlugins');
                emptyMsg.style.cssText = `
                    text-align: center;
                    padding: 40px 20px;
                    color: #999;
                    font-size: 14px;
                `;
                container.appendChild(emptyMsg);
                return container;
            }
            
            plugins.forEach(plugin => {
                const pluginCard = document.createElement('div');
                pluginCard.style.cssText = `
                    margin-bottom: 24px;
                    padding: 20px;
                    background: #fafafa;
                    border: 1px solid #e5e5e5;
                    border-radius: 8px;
                `;
                
                // 插件头部
                const header = document.createElement('div');
                header.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                `;
                
                const info = document.createElement('div');
                info.style.cssText = 'flex: 1;';
                
                const name = document.createElement('div');
                name.style.cssText = `
                    font-size: 16px;
                    font-weight: 600;
                    color: #212121;
                    margin-bottom: 4px;
                `;
                name.textContent = plugin.name || plugin.id;
                
                const meta = document.createElement('div');
                meta.style.cssText = `
                    font-size: 12px;
                    color: #999;
                    margin-bottom: 8px;
                `;
                meta.innerHTML = `
                    ${i18n.t('pluginVersion')}: ${plugin.version || 'N/A'} | 
                    ${i18n.t('pluginAuthor')}: ${plugin.author || 'Unknown'}
                `;
                
                const desc = document.createElement('div');
                desc.style.cssText = `
                    font-size: 14px;
                    color: #666;
                    line-height: 1.5;
                    margin-bottom: 12px;
                `;
                desc.textContent = plugin.description || i18n.t('pluginDescription');
                
                info.appendChild(name);
                info.appendChild(meta);
                info.appendChild(desc);
                
                // 启用/禁用开关
                const toggleContainer = document.createElement('div');
                toggleContainer.style.cssText = 'display: flex; align-items: center; gap: 12px;';
                
                const toggleSwitch = this.createPluginToggle(plugin);
                toggleContainer.appendChild(toggleSwitch);
                
                header.appendChild(info);
                header.appendChild(toggleContainer);
                
                pluginCard.appendChild(header);
                
                // 插件配置项
                if (plugin.configSchema && plugin.configSchema.length > 0) {
                    const settingsTitle = document.createElement('div');
                    settingsTitle.style.cssText = `
                        font-size: 14px;
                        font-weight: 600;
                        color: #212121;
                        margin: 20px 0 12px 0;
                        padding-top: 20px;
                        border-top: 1px solid #e5e5e5;
                    `;
                    settingsTitle.textContent = i18n.t('pluginSettings');
                    pluginCard.appendChild(settingsTitle);
                    
                    const settingsContainer = document.createElement('div');
                    settingsContainer.style.cssText = 'margin-left: 0;';
                    
                    plugin.configSchema.forEach(schema => {
                        if (schema.key === 'enabled') return; // 跳过启用开关，已经在头部显示
                        
                        const configKey = `plugin_${plugin.id}_${schema.key}`;
                        let settingElement;
                        
                                switch (schema.type) {
                            case 'switch':
                                settingElement = this.createSwitch(
                                    configKey,
                                    schema.label || schema.key,
                                    schema.description || '',
                                    schema.default || false,
                                    () => plugin.getConfig(schema.key, schema.default),
                                    (value) => {
                                        plugin.setConfig(schema.key, value);
                                        PluginManager.savePluginConfig(plugin.id);
                                    }
                                );
                                break;
                            case 'input':
                                settingElement = this.createInput(
                                    configKey,
                                    schema.label || schema.key,
                                    schema.description || '',
                                    schema.inputType || 'text',
                                    schema.default || '',
                                    () => plugin.getConfig(schema.key, schema.default),
                                    (value) => {
                                        plugin.setConfig(schema.key, value);
                                        PluginManager.savePluginConfig(plugin.id);
                                    }
                                );
                                break;
                            case 'select':
                                settingElement = this.createSelect(
                                    configKey,
                                    schema.label || schema.key,
                                    schema.description || '',
                                    schema.options || [],
                                    schema.default || '',
                                    () => plugin.getConfig(schema.key, schema.default),
                                    (value) => {
                                        plugin.setConfig(schema.key, value);
                                        PluginManager.savePluginConfig(plugin.id);
                                    }
                                );
                                break;
                        }
                        
                        if (settingElement) {
                            settingsContainer.appendChild(settingElement);
                        }
                    });
                    
                    pluginCard.appendChild(settingsContainer);
                }
                
                // 检查插件是否有自定义设置UI
                if (typeof plugin.getCustomSettingsUI === 'function') {
                    try {
                        const customUI = plugin.getCustomSettingsUI();
                        if (customUI) {
                            settingsContainer = settingsContainer || document.createElement('div');
                            settingsContainer.style.cssText = settingsContainer.style.cssText || 'margin-left: 0;';
                            settingsContainer.appendChild(customUI);
                            if (!pluginCard.contains(settingsContainer)) {
                                pluginCard.appendChild(settingsContainer);
                            }
                        }
                    } catch (error) {
                        console.error(`[Pixiv-Evolved] 获取插件 ${plugin.id} 的自定义设置UI时出错:`, error);
                    }
                }
                
                container.appendChild(pluginCard);
            });
            
            return container;
        },
        
        createPluginToggle(plugin) {
            const toggleContainer = document.createElement('label');
            toggleContainer.style.cssText = `
                display: flex;
                align-items: center;
                cursor: pointer;
                user-select: none;
                gap: 8px;
            `;
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = plugin.enabled;
            input.style.cssText = `
                width: 0;
                height: 0;
                opacity: 0;
                position: absolute;
            `;
            
            const slider = document.createElement('span');
            slider.style.cssText = `
                position: relative;
                width: 44px;
                height: 24px;
                background: ${plugin.enabled ? '#0096fa' : '#ccc'};
                border-radius: 12px;
                transition: background 0.3s;
            `;
            
            const circle = document.createElement('span');
            circle.style.cssText = `
                position: absolute;
                top: 2px;
                left: ${plugin.enabled ? '22px' : '2px'};
                width: 20px;
                height: 20px;
                background: #fff;
                border-radius: 50%;
                transition: left 0.3s;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            `;
            
            slider.appendChild(circle);
            
            const label = document.createElement('span');
            label.textContent = plugin.enabled ? i18n.t('enabled') : i18n.t('disabled');
            label.style.cssText = `
                font-size: 14px;
                color: #666;
                font-weight: 500;
            `;
            
            input.onchange = () => {
                if (input.checked) {
                    PluginManager.enablePlugin(plugin.id);
                    slider.style.background = '#0096fa';
                    circle.style.left = '22px';
                    label.textContent = i18n.t('enabled');
                } else {
                    PluginManager.disablePlugin(plugin.id);
                    slider.style.background = '#ccc';
                    circle.style.left = '2px';
                    label.textContent = i18n.t('disabled');
                }
            };
            
            toggleContainer.appendChild(input);
            toggleContainer.appendChild(slider);
            toggleContainer.appendChild(label);
            
            return toggleContainer;
        },
        
        buildGeneralTab() {
            const container = document.createElement('div');
            
            // 语言选择
            const langOptions = [
                { value: 'zh', label: '简体中文' },
                { value: 'en', label: 'English' },
                { value: 'ja', label: '日本語' }
            ];
            const langSelect = this.createSelect(
                'language',
                i18n.t('language'),
                i18n.t('languageDesc'),
                langOptions,
                i18n.currentLang
            );
            
            // 监听语言变化并重新加载界面
            const selectEl = langSelect.querySelector('select');
            if (selectEl) {
                const originalOnChange = selectEl.onchange;
                selectEl.onchange = () => {
                    // 先保存配置
                    if (originalOnChange) originalOnChange();
                    
                    const newLang = selectEl.value;
                    i18n.setLang(newLang);
                    // 重新加载当前选项卡
                    const activeTab = document.querySelector('.pixiv-evolved-tab[style*="0096fa"]');
                    if (activeTab) {
                        activeTab.click();
                    }
                    // 更新标题
                    const title = document.querySelector('#pixiv-evolved-panel h2');
                    if (title) title.textContent = i18n.t('controlPanel');
                    // 更新按钮文本
                    this.updateButtonTexts();
                };
            }
            
            container.appendChild(langSelect);
            
            return container;
        },
        
        buildDisplayTab() {
            const container = document.createElement('div');
            
            // 显示相关的功能已移至插件
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = i18n.t('noPlugins') || '暂无相关功能，请安装插件';
            emptyMsg.style.cssText = `
                text-align: center;
                padding: 40px 20px;
                color: #999;
                font-size: 14px;
            `;
            container.appendChild(emptyMsg);
            
            return container;
        },
        
        buildDownloadTab() {
            const container = document.createElement('div');
            
            // 下载相关的功能已移至插件
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = i18n.t('noPlugins') || '暂无相关功能，请安装插件';
            emptyMsg.style.cssText = `
                text-align: center;
                padding: 40px 20px;
                color: #999;
                font-size: 14px;
            `;
            container.appendChild(emptyMsg);
            
            return container;
        },
        
        buildAdvancedTab() {
            const container = document.createElement('div');
            
            // 插件源配置
            const pluginSourceSection = document.createElement('div');
            pluginSourceSection.style.cssText = `
                margin-bottom: 32px;
                padding: 24px;
                background: #fafafa;
                border: 1px solid #e5e5e5;
                border-radius: 8px;
            `;
            
            const sectionTitle = document.createElement('h3');
            sectionTitle.textContent = i18n.t('pluginSource');
            sectionTitle.style.cssText = `
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #212121;
            `;
            pluginSourceSection.appendChild(sectionTitle);
            
            const sectionDesc = document.createElement('p');
            sectionDesc.textContent = i18n.t('pluginSourceDesc');
            sectionDesc.style.cssText = `
                margin: 0 0 20px 0;
                font-size: 13px;
                color: #666;
                line-height: 1.5;
            `;
            pluginSourceSection.appendChild(sectionDesc);
            
            // 当前插件源显示
            const currentSourceDiv = document.createElement('div');
            currentSourceDiv.style.cssText = 'margin-bottom: 16px;';
            
            const currentLabel = document.createElement('div');
            currentLabel.textContent = i18n.t('pluginSourceCurrent') + ':';
            currentLabel.style.cssText = `
                font-size: 13px;
                color: #666;
                margin-bottom: 8px;
            `;
            currentSourceDiv.appendChild(currentLabel);
            
            const currentSourceValue = document.createElement('div');
            const getCurrentSource = () => {
                const source = ConfigManager.get('pluginSource', '');
                const defaultSource = 'https://raw.githubusercontent.com/juzijun233/Pixiv-Evolved/main/plugins';
                return source || defaultSource;
            };
            currentSourceValue.textContent = getCurrentSource();
            currentSourceValue.style.cssText = `
                font-size: 13px;
                color: #0096fa;
                font-family: 'Courier New', monospace;
                word-break: break-all;
                padding: 8px 12px;
                background: #fff;
                border: 1px solid #e5e5e5;
                border-radius: 4px;
            `;
            currentSourceDiv.appendChild(currentSourceValue);
            pluginSourceSection.appendChild(currentSourceDiv);
            
            // 插件源输入框
            const sourceInput = this.createInput(
                'pluginSource',
                i18n.t('pluginSource'),
                i18n.t('pluginSourceDesc'),
                'text',
                '',
                () => {
                    const source = ConfigManager.get('pluginSource', '');
                    return source || '';
                },
                (value) => {
                    // 移除末尾的斜杠
                    const cleanValue = value.trim().replace(/\/+$/, '');
                    if (cleanValue) {
                        ConfigManager.set('pluginSource', cleanValue);
                    } else {
                        ConfigManager.delete('pluginSource');
                    }
                    // 更新当前源显示
                    currentSourceValue.textContent = getCurrentSource();
                }
            );
            
            // 设置输入框占位符
            const inputEl = sourceInput.querySelector('input');
            if (inputEl) {
                inputEl.placeholder = i18n.t('pluginSourcePlaceholder');
            }
            
            pluginSourceSection.appendChild(sourceInput);
            
            // 操作按钮
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = 'display: flex; gap: 12px; margin-top: 16px;';
            
            // 重置按钮
            const resetBtn = this.createButton(i18n.t('pluginSourceReset'), 'secondary', () => {
                ConfigManager.delete('pluginSource');
                if (inputEl) {
                    inputEl.value = '';
                }
                currentSourceValue.textContent = getCurrentSource();
                this.showMessage(i18n.t('resetSuccess'));
            });
            resetBtn.style.marginTop = '0';
            
            // 测试连接按钮
            const testBtn = this.createButton(i18n.t('pluginSourceTest'), 'secondary', async () => {
                const source = getCurrentSource();
                if (!source) {
                    this.showMessage(i18n.t('pluginSourceTestFailed'));
                    return;
                }
                
                testBtn.disabled = true;
                const originalText = testBtn.textContent;
                testBtn.textContent = i18n.t('pluginSourceTest') + '...';
                
                try {
                    // 尝试访问插件目录（测试一个不存在的文件，只检查目录是否可访问）
                    const testUrl = source + '/test-connection.js';
                    const response = await fetch(testUrl, { method: 'HEAD' });
                    // 即使404也说明服务器可访问
                    if (response.status === 404 || response.status === 200) {
                        this.showMessage(i18n.t('pluginSourceTestSuccess'));
                    } else {
                        this.showMessage(i18n.t('pluginSourceTestFailed') + ': ' + response.status);
                    }
                } catch (error) {
                    this.showMessage(i18n.t('pluginSourceTestFailed') + ': ' + error.message);
                } finally {
                    testBtn.disabled = false;
                    testBtn.textContent = originalText;
                }
            });
            testBtn.style.marginTop = '0';
            
            buttonContainer.appendChild(resetBtn);
            buttonContainer.appendChild(testBtn);
            pluginSourceSection.appendChild(buttonContainer);
            
            container.appendChild(pluginSourceSection);
            
            return container;
        },
        
        saveAllSettings() {
            // 保存所有设置（已经在各个控件中自动保存，这里可以添加额外的保存逻辑）
            this.showMessage(i18n.t('save') + ' ' + i18n.t('exportSuccess'));
        },
        
        async handleImport(file) {
            try {
                await ConfigManager.import(file);
                i18n.init(); // 重新初始化 i18n 以应用新语言
                this.showMessage(i18n.t('importSuccess'));
                // 更新按钮和选项卡文本
                this.updateButtonTexts();
                // 更新标题
                const title = document.querySelector('#pixiv-evolved-panel h2');
                if (title) title.textContent = i18n.t('controlPanel');
                // 重新加载面板内容（特别是插件选项卡）
                const activeTab = document.querySelector('.pixiv-evolved-tab[style*="0096fa"]');
                if (activeTab) {
                    activeTab.click();
                }
            } catch (error) {
                console.error('Import error:', error);
                this.showMessage(i18n.t('importError'));
            }
        },
        
        importConfig() {
            // 这个方法由文件输入框的 onchange 事件触发
        },
        
        resetConfig() {
            if (confirm(i18n.t('resetConfirm'))) {
                ConfigManager.reset();
                i18n.init(); // 重新初始化 i18n
                this.showMessage(i18n.t('resetSuccess'));
                // 更新按钮和选项卡文本
                this.updateButtonTexts();
                // 更新标题
                const title = document.querySelector('#pixiv-evolved-panel h2');
                if (title) title.textContent = i18n.t('controlPanel');
                // 重新加载面板内容
                const activeTab = document.querySelector('.pixiv-evolved-tab[style*="0096fa"]');
                if (activeTab) {
                    activeTab.click();
                }
            }
        },
        
        updateButtonTexts() {
            // 更新底部按钮文本
            const footer = document.querySelector('#pixiv-evolved-panel > div:last-child');
            if (footer) {
                const buttons = footer.querySelectorAll('button');
                if (buttons.length >= 4) {
                    buttons[0].textContent = i18n.t('import');
                    buttons[1].textContent = i18n.t('export');
                    buttons[2].textContent = i18n.t('reset');
                    buttons[3].textContent = i18n.t('save');
                }
            }
            
            // 更新选项卡文本
            const tabTexts = {
                general: i18n.t('general'),
                display: i18n.t('display'),
                download: i18n.t('download'),
                advanced: i18n.t('advanced')
            };
            document.querySelectorAll('.pixiv-evolved-tab').forEach(tab => {
                const tabId = tab.dataset.tab;
                if (tabTexts[tabId]) {
                    tab.textContent = tabTexts[tabId];
                }
            });
        },
        
        showMessage(message) {
            // 创建消息提示
            const msg = document.createElement('div');
            msg.textContent = message;
            msg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4caf50;
                color: #fff;
                padding: 12px 20px;
                border-radius: 4px;
                z-index: 1000000;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                animation: slideIn 0.3s ease;
            `;
            
            // 添加动画样式
            if (!document.getElementById('pixiv-evolved-animations')) {
                const style = document.createElement('style');
                style.id = 'pixiv-evolved-animations';
                style.textContent = `
                    @keyframes slideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(msg);
            setTimeout(() => {
                msg.style.opacity = '0';
                msg.style.transition = 'opacity 0.3s';
                setTimeout(() => msg.remove(), 300);
            }, 2000);
        },
        
        show() {
            if (this.isVisible) return;
            this.isVisible = true;
            const overlay = document.getElementById('pixiv-evolved-overlay');
            overlay.style.display = 'block';
            this.panel.style.display = 'block';
            
            // 触发动画
            setTimeout(() => {
                overlay.style.opacity = '1';
                this.panel.style.opacity = '1';
                this.panel.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 10);
            
            // 防止背景滚动
            document.body.style.overflow = 'hidden';
        },
        
        hide() {
            if (!this.isVisible) return;
            this.isVisible = false;
            const overlay = document.getElementById('pixiv-evolved-overlay');
            overlay.style.opacity = '0';
            this.panel.style.opacity = '0';
            this.panel.style.transform = 'translate(-50%, -50%) scale(0.95)';
            
            setTimeout(() => {
                overlay.style.display = 'none';
                this.panel.style.display = 'none';
                document.body.style.overflow = '';
            }, 200);
        },
        
        toggle() {
            if (this.isVisible) {
                this.hide();
            } else {
                this.show();
            }
        }
    };

    // ==================== 插件加载 ====================
    // GitHub 仓库地址
    const GITHUB_REPO = 'https://github.com/juzijun233/Pixiv-Evolved';
    const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/juzijun233/Pixiv-Evolved/main';
    const DEFAULT_PLUGINS_BASE_URL = `${GITHUB_RAW_BASE}/plugins`;
    
    /**
     * 获取插件源URL
     * @returns {string} 插件源的基础URL
     */
    function getPluginSourceUrl() {
        const customSource = ConfigManager.get('pluginSource', '');
        if (customSource && customSource.trim()) {
            // 移除末尾的斜杠
            return customSource.trim().replace(/\/+$/, '');
        }
        return DEFAULT_PLUGINS_BASE_URL;
    }
    
    // 默认插件列表（已通过 @require 加载的插件不需要再次加载）
    const DEFAULT_PLUGINS = [
        // 注意：plugin-base.js、example-plugin.js、lazy-load.js 已通过 @require 加载
        // 如果需要动态加载其他插件，可以在这里添加
        // 'custom-plugin.js'
    ];
    
    async function loadPlugins() {
        // 从配置中获取自定义插件列表
        const customPlugins = ConfigManager.get('customPlugins', []);
        const allPlugins = [...DEFAULT_PLUGINS, ...customPlugins];
        
        if (allPlugins.length === 0) {
            console.log('[Pixiv-Evolved] 所有插件已通过 @require 加载');
            return;
        }
        
        // 获取插件源URL
        const pluginsBaseUrl = getPluginSourceUrl();
        console.log(`[Pixiv-Evolved] 使用插件源: ${pluginsBaseUrl}`);
        console.log(`[Pixiv-Evolved] 开始加载 ${allPlugins.length} 个插件...`);
        
        // 动态加载插件
        for (const pluginFile of allPlugins) {
            // 确保插件文件名不包含路径分隔符
            const cleanPluginFile = pluginFile.replace(/^\/+/, '').replace(/\.\./g, '');
            const pluginUrl = `${pluginsBaseUrl}/${cleanPluginFile}`;
            console.log(`[Pixiv-Evolved] 加载插件: ${cleanPluginFile} (${pluginUrl})`);
            
            try {
                const success = await PluginManager.loadPluginScript(pluginUrl);
                if (success) {
                    console.log(`[Pixiv-Evolved] 插件加载成功: ${cleanPluginFile}`);
                } else {
                    console.warn(`[Pixiv-Evolved] 插件加载失败: ${cleanPluginFile}`);
                }
            } catch (error) {
                console.error(`[Pixiv-Evolved] 加载插件时出错 ${cleanPluginFile}:`, error);
            }
        }
        
        console.log('[Pixiv-Evolved] 插件加载完成');
    }
    
    // ==================== 初始化 ====================
    function init() {
        // 初始化 i18n
        i18n.init();
        
        // 加载插件
        loadPlugins();
        
        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                ControlPanel.init();
            });
        } else {
            ControlPanel.init();
        }
    }
    
    // 启动
    init();
    
})();


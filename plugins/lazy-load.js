/**
 * 懒加载插件
 * 当页面在后台（标签页未激活）时，延迟加载内容，直到标签页被激活后再加载
 */

(function() {
    'use strict';

    // 确保插件基类已加载
    if (typeof window.PixivEvolvedPluginBase === 'undefined') {
        console.error('PluginBase not found. Please ensure plugin-base.js is loaded first.');
        return;
    }

    class LazyLoadPlugin extends window.PixivEvolvedPluginBase {
        constructor() {
            super('lazy-load', {
                name: '懒加载',
                version: '1.0.0',
                description: '当页面在后台时延迟加载内容，切换到标签页后再加载',
                author: 'Pixiv-Evolved Team',
                configSchema: [
                    {
                        type: 'switch',
                        key: 'enabled',
                        label: '启用懒加载',
                        description: '开启后，后台标签页将延迟加载内容',
                        default: true
                    },
                    {
                        type: 'switch',
                        key: 'delayImages',
                        label: '延迟图片加载',
                        description: '延迟加载图片直到标签页激活',
                        default: true
                    },
                    {
                        type: 'switch',
                        key: 'delayRequests',
                        label: '延迟API请求',
                        description: '延迟API请求直到标签页激活',
                        default: true
                    }
                ]
            });

            this.pendingRequests = [];
            this.pendingImages = [];
            this.fetchInterceptor = null;
            this.xhrInterceptor = null;
            this.imageObserver = null;
            this.isPageVisible = true;
        }

        init() {
            super.init();
            // 检查当前页面是否在激活状态
            if (typeof document !== 'undefined') {
                this.isPageVisible = !document.hidden && document.visibilityState === 'visible';
            }
            
            // 立即检查并设置拦截（在 document-start 阶段）
            // 这样可以在页面加载前就拦截请求
            // 注意：这里需要检查配置，但由于配置管理器可能还未加载，我们先设置拦截
            // 在 onEnable/onDisable 中会再次检查和调整
            this.setupEarlyInterception();
        }
        
        /**
         * 早期拦截设置（在 document-start 阶段执行）
         */
        setupEarlyInterception() {
            // 检查页面类型
            if (!this.shouldLazyLoad()) {
                return;
            }
            
            // 尝试从配置管理器读取配置（如果可用）
            let enabled = true;
            if (typeof window.PixivEvolvedConfigManager !== 'undefined') {
                const pluginConfig = window.PixivEvolvedConfigManager.get(`plugin_${this.id}`);
                if (pluginConfig && pluginConfig.enabled !== undefined) {
                    enabled = pluginConfig.enabled;
                }
            }
            
            if (!enabled) {
                return;
            }
            
            // 立即检查页面可见性
            this.isPageVisible = typeof document !== 'undefined' && 
                                !document.hidden && 
                                document.visibilityState === 'visible';
            
            // 如果页面不可见，立即设置拦截
            if (!this.isPageVisible) {
                console.log('[Lazy Load] Page is hidden, setting up early interception');
                // 检查具体配置
                let delayRequests = true;
                if (typeof window.PixivEvolvedConfigManager !== 'undefined') {
                    const pluginConfig = window.PixivEvolvedConfigManager.get(`plugin_${this.id}`);
                    if (pluginConfig && pluginConfig.config && pluginConfig.config.delayRequests !== undefined) {
                        delayRequests = pluginConfig.config.delayRequests;
                    }
                }
                
                if (delayRequests) {
                    this.interceptFetch();
                    this.interceptXHR();
                }
                // 图片拦截需要等待 DOM，所以在 onEnable 中设置
            }
        }

        onEnable() {
            super.onEnable();
            
            if (!this.getConfig('enabled', true)) {
                // 如果插件被禁用，移除拦截
                this.removeInterceptors();
                return;
            }

            console.log('[Lazy Load] Plugin enabled');
            
            // 检查当前页面类型是否支持
            if (!this.shouldLazyLoad()) {
                console.log('[Lazy Load] Current page type does not support lazy load');
                return;
            }

            // 检查页面状态并设置拦截
            this.checkAndSetupInterception();
            
            // 监听页面可见性变化
            this.setupVisibilityListener();
        }
        
        /**
         * 检查页面状态并设置拦截
         */
        checkAndSetupInterception() {
            if (typeof document !== 'undefined') {
                this.isPageVisible = !document.hidden && document.visibilityState === 'visible';
            }

            // 如果页面当前不可见，启动拦截
            if (!this.isPageVisible) {
                console.log('[Lazy Load] Page is hidden, setting up interceptors');
                if (this.getConfig('delayRequests', true)) {
                    this.interceptFetch();
                    this.interceptXHR();
                }
                if (this.getConfig('delayImages', true)) {
                    // 图片拦截需要等待 DOM
                    if (typeof document !== 'undefined' && document.body) {
                        this.interceptImages();
                    } else {
                        // 等待 DOM 加载
                        const self = this;
                        if (typeof document !== 'undefined') {
                            const setupImages = () => {
                                if (self.getConfig('delayImages', true)) {
                                    self.interceptImages();
                                }
                            };
                            if (document.readyState === 'loading') {
                                document.addEventListener('DOMContentLoaded', setupImages);
                            } else {
                                setupImages();
                            }
                        }
                    }
                }
            } else {
                console.log('[Lazy Load] Page is visible, no interception needed');
            }
        }

        onDisable() {
            super.onDisable();
            
            console.log('[Lazy Load] Plugin disabled');
            
            // 移除可见性监听器
            if (this.visibilityHandler && typeof document !== 'undefined') {
                document.removeEventListener('visibilitychange', this.visibilityHandler);
                this.visibilityHandler = null;
            }
            
            // 清理拦截器
            this.removeInterceptors();
            
            // 执行所有待处理的请求（因为插件被禁用了，让它们正常执行）
            this.executePendingRequests();
            this.loadPendingImages();
        }

        /**
         * 检查当前页面是否应该应用懒加载
         */
        shouldLazyLoad() {
            if (typeof window === 'undefined' || !window.location) {
                return false;
            }

            const path = window.location.pathname;
            const patterns = [
                /^\/users\/\d+/,           // 画师主页 /users/123456
                /^\/artworks\/\d+/,        // 插画详情页 /artworks/123456
                /^\/novel\/series\/\d+/,   // 小说系列页 /novel/series/123
                /^\/novel\/\d+/,           // 小说详情页 /novel/123456
                /^\/user\/\d+\/series\/\d+/, // 漫画系列页 /user/123456/series/123
                /^\/user\/\d+\/illust\/\d+/  // 漫画详情页（如果有的话）
            ];

            return patterns.some(pattern => pattern.test(path));
        }

        /**
         * 设置页面可见性监听
         */
        setupVisibilityListener() {
            if (typeof document === 'undefined') {
                return;
            }

            this.visibilityHandler = () => {
                const wasHidden = !this.isPageVisible;
                this.isPageVisible = !document.hidden && document.visibilityState === 'visible';

                if (wasHidden && this.isPageVisible) {
                    // 页面从隐藏变为可见
                    console.log('[Lazy Load] Page became visible, loading pending content...');
                    
                    // 移除拦截器
                    this.removeInterceptors();
                    
                    // 执行待处理的请求
                    if (this.getConfig('delayRequests', true)) {
                        this.executePendingRequests();
                    }
                    
                    // 加载待处理的图片
                    if (this.getConfig('delayImages', true)) {
                        this.loadPendingImages();
                    }
                }
            };

            document.addEventListener('visibilitychange', this.visibilityHandler);
        }

        /**
         * 拦截 fetch 请求
         */
        interceptFetch() {
            if (this.fetchInterceptor) {
                return;
            }

            // 保存原始 fetch（如果存在）
            if (typeof window.fetch === 'undefined') {
                // fetch 可能还未定义，等待定义后再拦截
                Object.defineProperty(window, 'fetch', {
                    configurable: true,
                    writable: true,
                    value: null
                });
            }

            const self = this;
            const originalFetch = window.fetch || (() => Promise.reject(new Error('fetch not available')));

            // 保存原始 fetch 到闭包中
            const _originalFetch = originalFetch;

            window.fetch = function(...args) {
                // 每次调用时检查页面可见性
                self.isPageVisible = typeof document !== 'undefined' && 
                                    !document.hidden && 
                                    document.visibilityState === 'visible';

                // 如果页面可见，正常执行
                if (self.isPageVisible) {
                    return _originalFetch.apply(this, args);
                }

                // 页面不可见，延迟请求
                const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
                console.log('[Lazy Load] Delaying fetch request:', url);
                
                return new Promise((resolve, reject) => {
                    self.pendingRequests.push({
                        type: 'fetch',
                        args: args,
                        resolve: resolve,
                        reject: reject,
                        original: _originalFetch
                    });
                });
            };

            this.fetchInterceptor = true;
        }

        /**
         * 拦截 XMLHttpRequest
         */
        interceptXHR() {
            if (this.xhrInterceptor) {
                return;
            }

            const self = this;
            const OriginalXHR = window.XMLHttpRequest;

            window.XMLHttpRequest = function(...args) {
                const xhr = new OriginalXHR(...args);
                const originalOpen = xhr.open;
                const originalSend = xhr.send;

                // 拦截 open 方法
                xhr.open = function(method, url, ...rest) {
                    this._method = method;
                    this._url = url;
                    this._rest = rest;
                    
                    // 每次调用时检查页面可见性
                    self.isPageVisible = typeof document !== 'undefined' && 
                                        !document.hidden && 
                                        document.visibilityState === 'visible';
                    
                    // 如果页面可见，正常打开
                    if (self.isPageVisible) {
                        return originalOpen.apply(this, [method, url, ...rest]);
                    }
                    
                    // 页面不可见，标记为待处理
                    this._lazyLoad = true;
                    return true;
                };

                // 拦截 send 方法
                xhr.send = function(...args) {
                    if (!this._lazyLoad) {
                        return originalSend.apply(this, args);
                    }

                    // 页面不可见，延迟发送
                    console.log('[Lazy Load] Delaying XHR request:', this._url);
                    
                    self.pendingRequests.push({
                        type: 'xhr',
                        xhr: this,
                        originalOpen: originalOpen,
                        originalSend: originalSend,
                        sendArgs: args
                    });

                    return;
                };

                return xhr;
            };

            this.xhrInterceptor = true;
        }

        /**
         * 拦截图片加载
         */
        interceptImages() {
            if (this.imageObserver) {
                return;
            }

            const self = this;

            // 拦截图片元素的 src 属性设置
            const ImageProto = window.Image.prototype;
            const originalImageSrcSetter = Object.getOwnPropertyDescriptor(ImageProto, 'src')?.set;

            if (originalImageSrcSetter) {
                Object.defineProperty(ImageProto, 'src', {
                    set: function(value) {
                        if (self.isPageVisible) {
                            originalImageSrcSetter.call(this, value);
                        } else {
                            console.log('Delaying image load:', value);
                            this.dataset.lazySrc = value;
                            self.pendingImages.push(this);
                        }
                    },
                    get: function() {
                        return this.dataset.lazySrc || this.currentSrc || '';
                    },
                    configurable: true
                });
            }

            // 监听 DOM 中的 img 标签
            const observer = new MutationObserver((mutations) => {
                if (self.isPageVisible) {
                    return;
                }

                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            // 检查新添加的 img 元素
                            if (node.tagName === 'IMG' && node.src) {
                                const originalSrc = node.src;
                                node.dataset.lazySrc = originalSrc;
                                node.src = '';
                                self.pendingImages.push(node);
                                console.log('Delaying image load:', originalSrc);
                            }
                            
                            // 检查子元素中的 img
                            const imgs = node.querySelectorAll && node.querySelectorAll('img');
                            if (imgs) {
                                imgs.forEach(img => {
                                    if (img.src && !img.dataset.lazySrc) {
                                        const originalSrc = img.src;
                                        img.dataset.lazySrc = originalSrc;
                                        img.src = '';
                                        self.pendingImages.push(img);
                                        console.log('Delaying image load:', originalSrc);
                                    }
                                });
                            }
                        }
                    });
                });
            });

            if (typeof document !== 'undefined' && document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                this.imageObserver = observer;
            } else {
                // 如果 body 还未加载，等待 DOMContentLoaded
                if (typeof document !== 'undefined') {
                    document.addEventListener('DOMContentLoaded', () => {
                        if (document.body) {
                            observer.observe(document.body, {
                                childList: true,
                                subtree: true
                            });
                            self.imageObserver = observer;
                        }
                    });
                }
            }
        }

        /**
         * 移除所有拦截器
         */
        removeInterceptors() {
            // 移除 fetch 拦截
            if (this.fetchInterceptor && window.fetch) {
                // 注意：这里无法完全恢复原始的 fetch，因为可能被其他代码修改
                // 但可以通过检查 pendingRequests 来避免继续拦截
            }

            // 移除 XHR 拦截
            if (this.xhrInterceptor) {
                // 类似地，无法完全恢复
            }

            // 移除图片观察器
            if (this.imageObserver) {
                this.imageObserver.disconnect();
                this.imageObserver = null;
            }

            this.fetchInterceptor = null;
            this.xhrInterceptor = null;
        }

        /**
         * 执行所有待处理的请求
         */
        executePendingRequests() {
            console.log(`[Lazy Load] Executing ${this.pendingRequests.length} pending requests`);

            this.pendingRequests.forEach((request) => {
                try {
                    if (request.type === 'fetch') {
                        request.original.apply(window, request.args)
                            .then(request.resolve)
                            .catch(request.reject);
                    } else if (request.type === 'xhr') {
                        request.originalOpen.apply(request.xhr, [
                            request.xhr._method,
                            request.xhr._url,
                            ...request.xhr._rest
                        ]);
                        request.originalSend.apply(request.xhr, request.sendArgs);
                    }
                } catch (error) {
                    console.error('Error executing pending request:', error);
                    if (request.reject) {
                        request.reject(error);
                    }
                }
            });

            this.pendingRequests = [];
        }

        /**
         * 加载所有待处理的图片
         */
        loadPendingImages() {
            console.log(`[Lazy Load] Loading ${this.pendingImages.length} pending images`);

            this.pendingImages.forEach((img) => {
                try {
                    if (img.dataset.lazySrc) {
                        // 恢复原始 src
                        const ImageProto = window.Image.prototype;
                        const originalImageSrcSetter = Object.getOwnPropertyDescriptor(ImageProto, 'src')?.set;
                        
                        if (originalImageSrcSetter && img instanceof Image) {
                            originalImageSrcSetter.call(img, img.dataset.lazySrc);
                        } else if (img.tagName === 'IMG') {
                            img.src = img.dataset.lazySrc;
                        }
                        
                        delete img.dataset.lazySrc;
                    }
                } catch (error) {
                    console.error('Error loading pending image:', error);
                }
            });

            this.pendingImages = [];
        }

        /**
         * 清理资源
         */
        cleanup() {
            // 移除事件监听器
            if (this.visibilityHandler && typeof document !== 'undefined') {
                document.removeEventListener('visibilitychange', this.visibilityHandler);
            }

            // 移除拦截器
            this.removeInterceptors();

            // 清理待处理请求和图片
            this.pendingRequests = [];
            this.pendingImages = [];

            super.cleanup();
        }
    }

    // 注册插件
    if (typeof window.PixivEvolvedPluginManager !== 'undefined') {
        window.PixivEvolvedPluginManager.register(new LazyLoadPlugin());
    } else {
        // 如果插件管理器还未加载，等待加载后再注册
        window.addEventListener('pixiv-evolved-ready', () => {
            if (typeof window.PixivEvolvedPluginManager !== 'undefined') {
                window.PixivEvolvedPluginManager.register(new LazyLoadPlugin());
            }
        });
    }

})();


/**
 * 显示关注插件
 * 当画师被关注或悄悄关注后，在页面中的画师名前方显示一个"眼睛"图标
 */

(function() {
    'use strict';

    // 确保插件基类已加载
    if (typeof window.PixivEvolvedPluginBase === 'undefined') {
        console.error('PluginBase not found. Please ensure plugin-base.js is loaded first.');
        return;
    }

    class ShowFollowingPlugin extends window.PixivEvolvedPluginBase {
        constructor() {
            super('show-following', {
                name: '显示关注',
                version: '1.0.0',
                description: '在画师名前方显示眼睛图标，标识已关注的画师',
                author: 'Pixiv-Evolved Team',
                configSchema: [
                    {
                        type: 'switch',
                        key: 'enabled',
                        label: '启用显示关注',
                        description: '开启后，已关注的画师名前会显示眼睛图标',
                        default: true
                    },
                    {
                        type: 'switch',
                        key: 'showPrivateFollowing',
                        label: '显示悄悄关注',
                        description: '开启后，悄悄关注的画师也会显示图标',
                        default: true
                    }
                ]
            });

            this.followingSet = new Set(); // 存储已关注的用户ID
            this.privateFollowingSet = new Set(); // 存储悄悄关注的用户ID
            this.currentUserId = null;
            this.isLoading = false;
            this.observer = null;
            this.processedElements = new WeakSet(); // 记录已处理的元素，避免重复处理
            this.processTimeout = null; // 处理页面的延迟定时器
        }

        init() {
            super.init();
            console.log('[显示关注] 插件已初始化');
        }

        async onEnable() {
            super.onEnable();
            
            if (!this.getConfig('enabled', true)) {
                return;
            }

            console.log('[显示关注] 插件已启用');
            
            // 等待页面加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        }

        onDisable() {
            super.onDisable();
            console.log('[显示关注] 插件已禁用');
            
            // 移除所有添加的眼睛图标
            this.removeAllIcons();
            
            // 停止观察器
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            
            // 清理数据
            this.followingSet.clear();
            this.privateFollowingSet.clear();
            this.currentUserId = null;
            this.processedElements = new WeakSet();
        }

        /**
         * 开始执行插件功能
         */
        async start() {
            // 检查用户是否登录
            if (!await this.checkLogin()) {
                console.log('[显示关注] 用户未登录，插件不生效');
                return;
            }

            // 获取当前用户ID
            this.currentUserId = await this.getCurrentUserId();
            if (!this.currentUserId) {
                console.log('[显示关注] 无法获取用户ID');
                return;
            }

            console.log(`[显示关注] 当前用户ID: ${this.currentUserId}`);

            // 加载关注列表
            await this.loadFollowingList();

            // 处理现有页面元素
            this.processPage();

            // 监听页面变化
            this.setupObserver();
        }

        /**
         * 检查用户是否登录
         */
        async checkLogin() {
            try {
                // 尝试从页面数据中获取用户信息
                // Pixiv 通常会在 window.__INITIAL_STATE__ 或类似的地方存储用户信息
                if (window.__INITIAL_STATE__ && window.__INITIAL_STATE__.user) {
                    return true;
                }

                // 或者检查页面中是否有用户相关的元素
                // 例如检查是否有登录按钮（未登录时会有登录按钮）
                const loginButton = document.querySelector('a[href*="/login"]');
                if (loginButton && loginButton.offsetParent !== null) {
                    return false;
                }

                // 尝试访问用户信息API来验证登录状态
                const testResponse = await fetch('https://www.pixiv.net/ajax/user/self', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (testResponse.ok) {
                    const data = await testResponse.json();
                    return data.body && data.body.userId;
                }

                return false;
            } catch (error) {
                console.error('[显示关注] 检查登录状态时出错:', error);
                return false;
            }
        }

        /**
         * 获取当前用户ID
         */
        async getCurrentUserId() {
            try {
                // 方法1: 从用户信息API获取（最可靠）
                const response = await fetch('https://www.pixiv.net/ajax/user/self', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.body && data.body.userId) {
                        return String(data.body.userId);
                    }
                }

                // 方法2: 从页面数据中获取
                // Pixiv 可能在 window.__INITIAL_STATE__ 或其他全局变量中存储用户信息
                if (window.__INITIAL_STATE__) {
                    const user = window.__INITIAL_STATE__.user || 
                                window.__INITIAL_STATE__.userData ||
                                window.__INITIAL_STATE__.userInfo;
                    if (user && (user.id || user.userId)) {
                        return String(user.id || user.userId);
                    }
                }

                // 方法3: 从全局变量中获取
                if (window.global && window.global.userId) {
                    return String(window.global.userId);
                }

                // 方法4: 从页面中的用户菜单或导航栏获取
                // Pixiv 通常在导航栏有用户头像链接，包含用户ID
                const userNavLink = document.querySelector('nav a[href^="/users/"], header a[href^="/users/"]');
                if (userNavLink) {
                    const href = userNavLink.getAttribute('href');
                    const match = href.match(/\/users\/(\d+)/);
                    if (match) {
                        return match[1];
                    }
                }

                // 方法5: 从URL中提取（如果当前在用户主页且是登录用户）
                const urlMatch = window.location.pathname.match(/^\/users\/(\d+)/);
                if (urlMatch) {
                    // 检查是否是自己的主页（通过检查是否有编辑按钮等）
                    const editButton = document.querySelector('a[href*="/settings/profile"], button[data-action="edit"]');
                    if (editButton) {
                        return urlMatch[1];
                    }
                }

                console.warn('[显示关注] 无法通过常规方法获取用户ID，尝试其他方法...');
                return null;
            } catch (error) {
                console.error('[显示关注] 获取用户ID时出错:', error);
                return null;
            }
        }

        /**
         * 加载关注列表
         */
        async loadFollowingList() {
            if (this.isLoading || !this.currentUserId) {
                return;
            }

            this.isLoading = true;
            console.log('[显示关注] 开始加载关注列表...');

            try {
                // 使用用户指定的API端点格式：/users/{uid}/following
                // 但实际Pixiv API可能需要使用 /ajax/user/{uid}/following
                // 先尝试标准API端点
                let nextUrl = `https://www.pixiv.net/ajax/user/${this.currentUserId}/following?offset=0&limit=24&rest=show`;
                let hasMore = true;
                let offset = 0;
                let pageCount = 0;
                const maxPages = 10; // 最多加载10页

                while (hasMore && pageCount < maxPages) {
                    const response = await fetch(nextUrl, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'Referer': 'https://www.pixiv.net/'
                        }
                    });

                    if (!response.ok) {
                        if (response.status === 403 || response.status === 401) {
                            console.error('[显示关注] 访问关注列表被拒绝，可能需要登录或权限不足');
                        } else {
                            console.error(`[显示关注] 加载关注列表失败: ${response.status} ${response.statusText}`);
                        }
                        break;
                    }

                    const data = await response.json();
                    
                    if (data.error) {
                        console.error('[显示关注] API返回错误:', data.error);
                        break;
                    }
                    
                    if (data.body && data.body.users) {
                        // 处理公开关注
                        data.body.users.forEach(user => {
                            if (user.userId) {
                                this.followingSet.add(String(user.userId));
                            }
                        });
                    }

                    // 检查是否还有更多数据
                    if (data.body && data.body.next) {
                        nextUrl = data.body.next;
                        offset += 24;
                        pageCount++;
                    } else {
                        hasMore = false;
                    }
                }

                // 如果启用了显示悄悄关注，也加载悄悄关注列表
                if (this.getConfig('showPrivateFollowing', true)) {
                    await this.loadPrivateFollowingList();
                }

                console.log(`[显示关注] 关注列表加载完成，共 ${this.followingSet.size} 个公开关注，${this.privateFollowingSet.size} 个悄悄关注`);
            } catch (error) {
                console.error('[显示关注] 加载关注列表时出错:', error);
            } finally {
                this.isLoading = false;
            }
        }

        /**
         * 加载悄悄关注列表
         */
        async loadPrivateFollowingList() {
            try {
                let nextUrl = `https://www.pixiv.net/ajax/user/${this.currentUserId}/following?offset=0&limit=24&rest=hide`;
                let hasMore = true;
                let offset = 0;
                let pageCount = 0;
                const maxPages = 10; // 最多加载10页

                while (hasMore && pageCount < maxPages) {
                    const response = await fetch(nextUrl, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'Referer': 'https://www.pixiv.net/'
                        }
                    });

                    if (!response.ok) {
                        if (response.status === 403 || response.status === 401) {
                            console.warn('[显示关注] 访问悄悄关注列表被拒绝，可能没有悄悄关注的用户');
                        } else {
                            console.error(`[显示关注] 加载悄悄关注列表失败: ${response.status}`);
                        }
                        break;
                    }

                    const data = await response.json();
                    
                    if (data.error) {
                        console.warn('[显示关注] 加载悄悄关注列表时API返回错误:', data.error);
                        break;
                    }
                    
                    if (data.body && data.body.users) {
                        data.body.users.forEach(user => {
                            if (user.userId) {
                                this.privateFollowingSet.add(String(user.userId));
                            }
                        });
                    }

                    if (data.body && data.body.next) {
                        nextUrl = data.body.next;
                        offset += 24;
                        pageCount++;
                    } else {
                        hasMore = false;
                    }
                }
            } catch (error) {
                console.error('[显示关注] 加载悄悄关注列表时出错:', error);
            }
        }

        /**
         * 检查用户是否被关注
         */
        isFollowing(userId) {
            if (!userId) return false;
            const id = String(userId);
            return this.followingSet.has(id) || this.privateFollowingSet.has(id);
        }

        /**
         * 创建眼睛图标
         */
        createEyeIcon() {
            const icon = document.createElement('span');
            icon.innerHTML = '👁️';
            icon.style.cssText = `
                display: inline-block;
                margin-right: 4px;
                font-size: 14px;
                vertical-align: middle;
                cursor: default;
            `;
            icon.title = '已关注';
            icon.setAttribute('data-following-indicator', 'true');
            return icon;
        }

        /**
         * 处理页面元素
         */
        processPage() {
            // 查找所有用户链接（最常见的画师名显示方式）
            const userLinks = document.querySelectorAll('a[href^="/users/"]');
            
            userLinks.forEach(link => {
                if (this.processedElements.has(link)) {
                    return;
                }

                const href = link.getAttribute('href');
                const match = href.match(/\/users\/(\d+)/);
                
                if (match) {
                    const userId = match[1];
                    
                    if (this.isFollowing(userId)) {
                        // 检查是否已经添加了图标
                        if (!link.querySelector('[data-following-indicator="true"]')) {
                            const icon = this.createEyeIcon();
                            // 插入到链接内容的开头
                            link.insertBefore(icon, link.firstChild);
                        }
                    }
                }

                this.processedElements.add(link);
            });

            // 处理其他可能包含用户ID的元素
            // 例如：通过 data-user-id 属性
            this.processElementsWithUserId();
        }

        /**
         * 处理包含用户ID属性的元素
         */
        processElementsWithUserId() {
            // 查找所有包含 data-user-id 或类似属性的元素
            const elementsWithUserId = document.querySelectorAll('[data-user-id], [data-userId], [data-user_id]');
            
            elementsWithUserId.forEach(element => {
                if (this.processedElements.has(element)) {
                    return;
                }

                const userId = element.getAttribute('data-user-id') || 
                              element.getAttribute('data-userId') ||
                              element.getAttribute('data-user_id');

                if (userId && this.isFollowing(userId)) {
                    // 检查是否已经添加了图标
                    if (!element.querySelector('[data-following-indicator="true"]')) {
                        // 查找元素内的文本节点或画师名元素
                        // 通常画师名会在链接或特定元素中
                        const nameElement = element.querySelector('a[href*="/users/"]') || 
                                          element.querySelector('span, div, h1, h2, h3') ||
                                          element;
                        
                        if (nameElement && nameElement.textContent && nameElement.textContent.trim()) {
                            const icon = this.createEyeIcon();
                            // 插入到元素内容的开头
                            if (nameElement.firstChild) {
                                nameElement.insertBefore(icon, nameElement.firstChild);
                            } else {
                                nameElement.appendChild(icon);
                            }
                        }
                    }
                }

                this.processedElements.add(element);
            });
        }

        /**
         * 设置 MutationObserver 监听页面变化
         */
        setupObserver() {
            if (this.observer) {
                return;
            }

            this.observer = new MutationObserver((mutations) => {
                let shouldProcess = false;

                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length > 0) {
                        shouldProcess = true;
                    }
                });

                if (shouldProcess) {
                    // 延迟处理，避免频繁触发
                    clearTimeout(this.processTimeout);
                    this.processTimeout = setTimeout(() => {
                        this.processPage();
                    }, 300);
                }
            });

            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        /**
         * 移除所有添加的眼睛图标
         */
        removeAllIcons() {
            const icons = document.querySelectorAll('[data-following-indicator="true"]');
            icons.forEach(icon => icon.remove());
        }

        cleanup() {
            this.removeAllIcons();
            
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }

            if (this.processTimeout) {
                clearTimeout(this.processTimeout);
            }

            super.cleanup();
        }
    }

    // 注册插件
    if (typeof window.PixivEvolvedPluginManager !== 'undefined') {
        window.PixivEvolvedPluginManager.register(new ShowFollowingPlugin());
    } else {
        // 如果插件管理器还未加载，等待加载后再注册
        window.addEventListener('pixiv-evolved-ready', () => {
            if (typeof window.PixivEvolvedPluginManager !== 'undefined') {
                window.PixivEvolvedPluginManager.register(new ShowFollowingPlugin());
            }
        });
    }

})();


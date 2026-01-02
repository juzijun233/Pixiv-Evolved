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
            this.followingUsers = new Map(); // 存储已关注用户的详细信息 {userId: {userId, userName, userAccount, imageUrl, ...}}
            this.privateFollowingUsers = new Map(); // 存储悄悄关注用户的详细信息
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
            
            // 移除弹窗
            const modal = document.getElementById('pixiv-evolved-following-list-modal');
            if (modal) {
                modal.remove();
            }
            
            // 停止观察器
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            
            // 清理数据
            this.followingSet.clear();
            this.privateFollowingSet.clear();
            this.followingUsers.clear();
            this.privateFollowingUsers.clear();
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
                                const userId = String(user.userId);
                                this.followingSet.add(userId);
                                // 存储用户详细信息
                                this.followingUsers.set(userId, {
                                    userId: user.userId,
                                    userName: user.userName || user.name,
                                    userAccount: user.userAccount || user.account,
                                    imageUrl: user.imageUrl || user.profileImageUrl || user.avatar,
                                    isPrivate: false
                                });
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
                                const userId = String(user.userId);
                                this.privateFollowingSet.add(userId);
                                // 存储用户详细信息
                                this.privateFollowingUsers.set(userId, {
                                    userId: user.userId,
                                    userName: user.userName || user.name,
                                    userAccount: user.userAccount || user.account,
                                    imageUrl: user.imageUrl || user.profileImageUrl || user.avatar,
                                    isPrivate: true
                                });
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

        /**
         * 显示关注列表弹窗
         */
        showFollowingList() {
            // 合并所有关注用户
            const allUsers = [];
            
            // 添加公开关注
            this.followingUsers.forEach((user, userId) => {
                allUsers.push(user);
            });
            
            // 添加悄悄关注
            this.privateFollowingUsers.forEach((user, userId) => {
                // 避免重复（如果同时存在于两个列表中）
                if (!this.followingUsers.has(userId)) {
                    allUsers.push(user);
                }
            });
            
            // 按用户名排序
            allUsers.sort((a, b) => {
                const nameA = (a.userName || a.userAccount || '').toLowerCase();
                const nameB = (b.userName || b.userAccount || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
            
            // 创建弹窗
            this.createFollowingListModal(allUsers);
        }

        /**
         * 创建关注列表弹窗
         */
        createFollowingListModal(users) {
            // 移除已存在的弹窗
            const existingModal = document.getElementById('pixiv-evolved-following-list-modal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.id = 'pixiv-evolved-following-list-modal';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 100000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            `;
            
            // 创建弹窗容器
            const modal = document.createElement('div');
            modal.style.cssText = `
                background: #fff;
                border-radius: 8px;
                width: 100%;
                max-width: 800px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            `;
            
            // 创建标题栏
            const header = document.createElement('div');
            header.style.cssText = `
                padding: 20px;
                border-bottom: 1px solid #e5e5e5;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            const title = document.createElement('h2');
            title.style.cssText = `
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #212121;
            `;
            title.textContent = `关注列表 (共 ${users.length} 人)`;
            header.appendChild(title);
            
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.cssText = `
                background: none;
                border: none;
                font-size: 28px;
                color: #666;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                line-height: 32px;
                text-align: center;
            `;
            closeBtn.onclick = () => overlay.remove();
            closeBtn.onmouseover = () => closeBtn.style.color = '#212121';
            closeBtn.onmouseout = () => closeBtn.style.color = '#666';
            header.appendChild(closeBtn);
            
            // 创建内容区域
            const content = document.createElement('div');
            content.style.cssText = `
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            `;
            
            if (users.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.style.cssText = `
                    text-align: center;
                    color: #999;
                    padding: 40px 0;
                `;
                emptyMsg.textContent = '暂无关注列表数据，请先加载关注列表';
                content.appendChild(emptyMsg);
            } else {
                // 创建用户列表
                const userList = document.createElement('div');
                userList.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 16px;
                `;
                
                users.forEach(user => {
                    const userItem = document.createElement('div');
                    userItem.style.cssText = `
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        border: 1px solid #e5e5e5;
                        border-radius: 4px;
                        transition: background 0.2s;
                    `;
                    userItem.onmouseover = () => userItem.style.background = '#f5f5f5';
                    userItem.onmouseout = () => userItem.style.background = '#fff';
                    
                    // 头像
                    const avatar = document.createElement('img');
                    avatar.src = user.imageUrl || 'https://s.pixiv.net/common/images/no_profile.png';
                    avatar.alt = user.userName || user.userAccount || '';
                    avatar.style.cssText = `
                        width: 48px;
                        height: 48px;
                        border-radius: 50%;
                        object-fit: cover;
                        flex-shrink: 0;
                    `;
                    avatar.onerror = () => {
                        avatar.src = 'https://s.pixiv.net/common/images/no_profile.png';
                    };
                    
                    // 用户信息
                    const userInfo = document.createElement('div');
                    userInfo.style.cssText = `
                        flex: 1;
                        min-width: 0;
                    `;
                    
                    // 用户名链接
                    const nameLink = document.createElement('a');
                    nameLink.href = `https://www.pixiv.net/users/${user.userId}`;
                    nameLink.target = '_blank';
                    nameLink.rel = 'noopener noreferrer';
                    nameLink.style.cssText = `
                        display: block;
                        font-size: 14px;
                        font-weight: 600;
                        color: #0096fa;
                        text-decoration: none;
                        margin-bottom: 4px;
                        word-break: break-word;
                    `;
                    nameLink.textContent = user.userName || user.userAccount || `用户 ${user.userId}`;
                    nameLink.onmouseover = () => nameLink.style.textDecoration = 'underline';
                    nameLink.onmouseout = () => nameLink.style.textDecoration = 'none';
                    
                    // 用户账号（如果与用户名不同）
                    if (user.userAccount && user.userAccount !== user.userName) {
                        const account = document.createElement('div');
                        account.style.cssText = `
                            font-size: 12px;
                            color: #999;
                        `;
                        account.textContent = `@${user.userAccount}`;
                        userInfo.appendChild(account);
                    }
                    
                    // 悄悄关注标识
                    if (user.isPrivate) {
                        const privateBadge = document.createElement('span');
                        privateBadge.textContent = '悄悄关注';
                        privateBadge.style.cssText = `
                            font-size: 11px;
                            color: #999;
                            background: #f0f0f0;
                            padding: 2px 6px;
                            border-radius: 2px;
                            margin-left: 4px;
                        `;
                        nameLink.appendChild(privateBadge);
                    }
                    
                    userInfo.insertBefore(nameLink, userInfo.firstChild);
                    
                    userItem.appendChild(avatar);
                    userItem.appendChild(userInfo);
                    userList.appendChild(userItem);
                });
                
                content.appendChild(userList);
            }
            
            modal.appendChild(header);
            modal.appendChild(content);
            overlay.appendChild(modal);
            
            // 点击遮罩层关闭
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                }
            };
            
            // 添加到页面
            document.body.appendChild(overlay);
        }

        /**
         * 获取自定义设置UI（用于在插件设置中添加自定义按钮）
         */
        getCustomSettingsUI() {
            const container = document.createElement('div');
            container.style.cssText = `
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #e5e5e5;
            `;
            
            const button = document.createElement('button');
            button.textContent = '取关注列表';
            button.style.cssText = `
                background: #0096fa;
                color: #fff;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            `;
            button.onmouseover = () => button.style.background = '#0088e6';
            button.onmouseout = () => button.style.background = '#0096fa';
            button.onclick = () => {
                if (this.followingUsers.size === 0 && this.privateFollowingUsers.size === 0) {
                    alert('关注列表为空，请先等待插件加载关注列表，或刷新页面。');
                } else {
                    this.showFollowingList();
                }
            };
            
            const desc = document.createElement('div');
            desc.style.cssText = `
                font-size: 12px;
                color: #999;
                margin-top: 8px;
            `;
            desc.textContent = '点击查看所有已关注的画师列表（用于调试）';
            
            container.appendChild(button);
            container.appendChild(desc);
            
            return container;
        }

        cleanup() {
            this.removeAllIcons();
            
            // 移除弹窗
            const modal = document.getElementById('pixiv-evolved-following-list-modal');
            if (modal) {
                modal.remove();
            }
            
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


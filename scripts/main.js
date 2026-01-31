// 主应用逻辑

class App {
    constructor() {
        this.currentPage = 'home-page';
        this.init();
    }

    // 初始化应用
    init() {
        // 初始化存储
        storage.init();
        
        // 绑定事件
        this.bindEvents();
        
        // 渲染初始数据
        this.renderBookmarks();
        this.renderTags();
        
        // 应用保存的样式
        this.applySavedStyle();
    }

    // 自动调整文本框高度
    autoResizeTextarea(textarea) {
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px'; // 限制最大高度为300px
        }
    }

    // 绑定事件
    bindEvents() {
        // 导航按钮
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });

        

        document.getElementById('back-from-detail')?.addEventListener('click', () => {
            this.navigateTo('home-page');
        });

        // 搜索按钮
        document.getElementById('search-btn')?.addEventListener('click', () => {
            document.getElementById('search-bar').classList.toggle('hidden');
        });

        document.getElementById('close-search')?.addEventListener('click', () => {
            document.getElementById('search-bar').classList.add('hidden');
        });

        // 搜索输入
        const searchInput = document.getElementById('search-bar')?.querySelector('input');
        if (searchInput) {
            // 使用防抖函数优化实时搜索
            const debouncedSearch = debounce((query) => {
                bookmarkManager.searchBookmarks(query);
            }, 300);
            
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                debouncedSearch(query);
            });
        }

        // 标签过滤
        document.querySelectorAll('.tag-filter')?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tag-filter').forEach(b => b.classList.remove('active', 'bg-primary', 'text-white'));
                document.querySelectorAll('.tag-filter').forEach(b => b.classList.add('bg-gray-200', 'text-gray-700'));
                e.currentTarget.classList.add('active', 'bg-primary', 'text-white');
                e.currentTarget.classList.remove('bg-gray-200', 'text-gray-700');
                // 实现过滤逻辑
                const tagName = e.currentTarget.textContent.trim();
                if (tagName === '全部') {
                    this.renderBookmarks();
                } else {
                    const tag = storage.getTags().find(t => t.name === tagName);
                    if (tag) {
                        bookmarkManager.filterBookmarksByTag(tag.id);
                    }
                }
            });
        });

        // 样式切换
        document.querySelectorAll('.style-btn')?.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('border-primary'));
                document.querySelectorAll('.style-btn').forEach(b => b.classList.add('border-gray-300'));
                btn.classList.add('border-primary');
                btn.classList.remove('border-gray-300');
                
                const styleNumber = index + 1;
                this.switchStyle(styleNumber);
            });
        });

        // 添加标签模态框
        document.getElementById('add-tag-modal-btn')?.addEventListener('click', () => {
            document.getElementById('add-tag-modal').classList.remove('hidden');
        });

        document.getElementById('cancel-add-tag')?.addEventListener('click', () => {
            document.getElementById('add-tag-modal').classList.add('hidden');
        });

        document.getElementById('confirm-add-tag')?.addEventListener('click', () => {
            const tagName = document.getElementById('new-tag-name').value.trim();
            if (tagName) {
                const selectedColor = document.querySelector('.w-6.h-6.rounded-full.border-2')?.style.backgroundColor || '#3B82F6';
                storage.saveTag({ name: tagName, color: selectedColor });
                this.renderTags();
                document.getElementById('add-tag-modal').classList.add('hidden');
                document.getElementById('new-tag-name').value = '';
            }
        });

        // 颜色选择
        document.querySelectorAll('.w-6.h-6.rounded-full')?.forEach(colorBtn => {
            colorBtn.addEventListener('click', (e) => {
                document.querySelectorAll('.w-6.h-6.rounded-full').forEach(b => b.classList.remove('border-2', 'border-white', 'shadow-sm'));
                e.currentTarget.classList.add('border-2', 'border-white', 'shadow-sm');
            });
        });

        // 图片上传
        document.getElementById('upload-btn')?.addEventListener('click', () => {
            document.getElementById('image-input').click();
        });

        document.getElementById('image-input')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.previewImage(file);
            }
        });

        // 重新选择图片
        document.getElementById('reselect-img')?.addEventListener('click', () => {
            document.getElementById('image-preview').classList.add('hidden');
            document.getElementById('image-input').value = '';
        });

        // 确认裁剪
        document.getElementById('crop-btn')?.addEventListener('click', async () => {
            try {
                // 显示加载状态
                this.showLoading();
                
                // 获取预览图片的src
                const previewImg = document.getElementById('preview-img');
                if (!previewImg || !previewImg.src) {
                    throw new Error('没有可识别的图片');
                }
                
                // 实际裁剪图片
                const croppedImageData = await imageEditor.cropImage();
                if (!croppedImageData) {
                    throw new Error('裁剪失败');
                }
                
                // 使用裁剪后的图片进行AI OCR文字识别
                const result = await aiOCR.recognizeText(croppedImageData);
                
                // 隐藏图片预览
                document.getElementById('image-preview').classList.add('hidden');
                
                if (result.success) {
                    // 直接将识别结果填入内容字段
                    const contentTextarea = document.getElementById('bookmark-content');
                    contentTextarea.value = result.text;
                    // 自动调整文本框高度
                    this.autoResizeTextarea(contentTextarea);
                    this.showSuccessToast('文字识别完成');
                } else {
                    this.showErrorToast(`识别失败: ${result.error}`);
                }
            } catch (error) {
                console.error('裁剪图片错误:', error);
                this.showErrorToast('裁剪失败，请稍后重试');
            } finally {
                this.hideLoading();
            }
        });

        // 旋转图片
        document.getElementById('rotate-btn')?.addEventListener('click', () => {
            imageEditor.rotateImage();
        });

        // 保存书签
        document.getElementById('save-bookmark')?.addEventListener('click', () => {
            this.saveBookmark();
        });

        // 模板选择
        document.querySelectorAll('.template-btn')?.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('border-primary'));
                document.querySelectorAll('.template-btn').forEach(b => b.classList.add('border-gray-300'));
                btn.classList.add('border-primary');
                btn.classList.remove('border-gray-300');
            });
        });

        // 标签输入
        document.getElementById('add-tag-btn')?.addEventListener('click', () => {
            const tagInput = document.getElementById('tag-input');
            const tagName = tagInput.value.trim();
            if (tagName) {
                this.addTagToInput(tagName);
                tagInput.value = '';
            }
        });

        // 内容文本框自动调整高度
        const contentTextarea = document.getElementById('bookmark-content');
        if (contentTextarea) {
            contentTextarea.addEventListener('input', () => {
                this.autoResizeTextarea(contentTextarea);
            });
            // 初始调整
            this.autoResizeTextarea(contentTextarea);
        }

        document.getElementById('tag-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const tagName = e.target.value.trim();
                if (tagName) {
                    this.addTagToInput(tagName);
                    e.target.value = '';
                }
            }
        });

        // 详情页操作按钮
        // 编辑按钮
        document.querySelector('#detail-page .fa-edit')?.parentElement.addEventListener('click', () => {
            if (this.currentBookmarkId) {
                bookmarkManager.editBookmark(this.currentBookmarkId);
            }
        });

        // 分享按钮
        document.querySelector('#detail-page .fa-share-alt')?.parentElement.addEventListener('click', () => {
            if (this.currentBookmarkId) {
                shareService.shareBookmark(this.currentBookmarkId);
            }
        });

        // 删除按钮
        document.querySelector('#detail-page .fa-trash')?.parentElement.addEventListener('click', () => {
            if (this.currentBookmarkId) {
                bookmarkManager.deleteBookmark(this.currentBookmarkId);
                this.navigateTo('home-page');
            }
        });

        // 数据导入导出
        // 导出按钮
        document.querySelectorAll('button')?.forEach(btn => {
            if (btn.textContent.trim() === '导出数据') {
                btn.addEventListener('click', () => {
                    try {
                        this.showLoading();
                        
                        const data = storage.exportData();
                        if (!data) {
                            throw new Error('导出数据为空');
                        }
                        
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `quotoday-backup-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        
                        this.hideLoading();
                        this.showSuccessToast('数据导出成功');
                    } catch (error) {
                        console.error('导出数据错误:', error);
                        this.hideLoading();
                        this.showErrorToast('数据导出失败，请稍后重试');
                    }
                });
            }
        });

        // 导入按钮
        document.querySelectorAll('button')?.forEach(btn => {
            if (btn.textContent.trim() === '导入数据') {
                btn.addEventListener('click', () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            this.showLoading();
                            
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                try {
                                    const result = storage.importData(event.target.result);
                                    this.hideLoading();
                                    
                                    if (result) {
                                        this.renderBookmarks();
                                        this.renderTags();
                                        this.showSuccessToast('数据导入成功');
                                    }
                                } catch (error) {
                                    console.error('导入数据错误:', error);
                                    this.hideLoading();
                                    this.showErrorToast(`导入失败: ${error.message}`);
                                }
                            };
                            
                            reader.onerror = () => {
                                this.hideLoading();
                                this.showErrorToast('文件读取失败');
                            };
                            
                            reader.readAsText(file);
                        }
                    });
                    input.click();
                });
            }
        });

        // 清除数据按钮
        document.querySelectorAll('button')?.forEach(btn => {
            if (btn.textContent.trim() === '清除数据') {
                btn.addEventListener('click', () => {
                    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
                        try {
                            this.showLoading();
                            
                            storage.clearAllData();
                            this.renderBookmarks();
                            this.renderTags();
                            
                            this.hideLoading();
                            this.showSuccessToast('数据已清除');
                        } catch (error) {
                            console.error('清除数据错误:', error);
                            this.hideLoading();
                            this.showErrorToast('数据清除失败，请稍后重试');
                        }
                    }
                });
            }
        });

        // 标签编辑按钮
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-edit') && e.target.closest('.tag-item')) {
                const tagItem = e.target.closest('.tag-item');
                const tagId = tagItem.querySelector('.edit-tag')?.dataset.id || tagItem.querySelector('.delete-tag')?.dataset.id;
                if (tagId) {
                    tagManager.editTag(tagId);
                }
            }
        });
    }

    // 页面导航
    navigateTo(page) {
        // 获取当前页面和目标页面
        const currentPageEl = document.getElementById(this.currentPage);
        const targetPageEl = document.getElementById(page);
        
        if (!targetPageEl) return;
        
        // 添加离开动画
        if (currentPageEl && !currentPageEl.classList.contains('hidden')) {
            currentPageEl.classList.add('animate-slide-out');
            setTimeout(() => {
                currentPageEl.classList.add('hidden');
                currentPageEl.classList.remove('animate-slide-out');
            }, 300);
        } else {
            // 隐藏所有页面
            document.querySelectorAll('.page-content').forEach(p => {
                p.classList.add('hidden');
            });
        }
        
        // 显示目标页面并添加进入动画
        setTimeout(() => {
            targetPageEl.classList.remove('hidden');
            targetPageEl.classList.add('animate-slide-in');
            setTimeout(() => {
                targetPageEl.classList.remove('animate-slide-in');
            }, 300);
        }, 150);
        
        // 更新当前页面
        this.currentPage = page;
        
        // 更新导航按钮状态
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active', 'text-primary');
            btn.classList.add('text-gray-500');
        });
        const activeNavBtn = document.querySelector(`[data-page="${page}"]`);
        if (activeNavBtn) {
            activeNavBtn.classList.add('active', 'text-primary');
            activeNavBtn.classList.remove('text-gray-500');
        }
    }

    // 渲染书签列表
    renderBookmarks() {
        const bookmarkList = document.getElementById('bookmark-list');
        if (!bookmarkList) return;

        const bookmarks = storage.getBookmarks();
        
        bookmarkList.innerHTML = '';
        
        bookmarks.forEach(bookmark => {
            const bookmarkEl = document.createElement('div');
            bookmarkEl.className = 'bookmark-item p-4 bg-gray-50 rounded-lg shadow-sm card-hover';
            
            // 格式化日期
            const date = new Date(bookmark.created_at);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            // 获取标签名称
            const tagNames = bookmark.tags.map(tagId => {
                const tag = storage.getTag(tagId);
                return tag ? tag.name : '';
            }).filter(Boolean);
            
            bookmarkEl.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold">${bookmark.title}</h3>
                    <span class="text-xs text-gray-500">${formattedDate}</span>
                </div>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                    ${bookmark.content}
                </p>
                <div class="flex justify-between items-center">
                    <div class="flex space-x-1">
                        ${tagNames.map(name => `<span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">${name}</span>`).join('')}
                    </div>
                    <button class="text-gray-400 view-detail" data-id="${bookmark.id}">
                        <i class="fa fa-ellipsis-v"></i>
                    </button>
                </div>
            `;
            
            bookmarkList.appendChild(bookmarkEl);
        });

        // 绑定操作菜单事件
        document.querySelectorAll('.view-detail').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookmarkId = e.currentTarget.dataset.id;
                this.showBookmarkMenu(bookmarkId, e);
            });
        });
    }

    // 渲染标签列表
    renderTags() {
        const tagList = document.getElementById('tag-list');
        if (!tagList) return;

        const tags = storage.getTags();
        
        tagList.innerHTML = '';
        
        tags.forEach(tag => {
            const tagEl = document.createElement('div');
            tagEl.className = 'tag-item flex items-center justify-between p-3 bg-gray-50 rounded-lg card-hover';
            
            tagEl.innerHTML = `
                <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full" style="background-color: ${tag.color};" mr-3></div>
                    <span class="font-medium">${tag.name}</span>
                </div>
                <div class="flex items-center">
                    <span class="text-xs text-gray-500 mr-4">使用 ${tag.count} 次</span>
                    <button class="text-gray-400 mr-2 edit-tag" data-id="${tag.id}">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="text-gray-400 delete-tag" data-id="${tag.id}">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            `;
            
            tagList.appendChild(tagEl);
        });

        // 绑定编辑和删除事件
        document.querySelectorAll('.edit-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tagId = e.currentTarget.dataset.id;
                tagManager.editTag(tagId);
            });
        });

        document.querySelectorAll('.delete-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tagId = e.currentTarget.dataset.id;
                tagManager.deleteTag(tagId);
            });
        });
    }

    // 显示书签详情
    showBookmarkDetail(id) {
        const bookmark = storage.getBookmark(id);
        if (!bookmark) return;

        // 保存当前书签ID
        this.currentBookmarkId = id;
        shareService.setCurrentBookmarkId(id);

        // 填充详情数据
        document.getElementById('detail-title').textContent = bookmark.title;
        document.getElementById('detail-author').textContent = bookmark.author;
        document.getElementById('detail-content').textContent = bookmark.content;
        document.getElementById('detail-page').textContent = `第 ${bookmark.page} 页`;
        
        // 格式化日期
        const date = new Date(bookmark.created_at);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        document.getElementById('detail-date').textContent = formattedDate;
        
        // 填充标签
        const detailTags = document.getElementById('detail-tags');
        detailTags.innerHTML = '';
        bookmark.tags.forEach(tagId => {
            const tag = storage.getTag(tagId);
            if (tag) {
                const tagEl = document.createElement('span');
                tagEl.className = 'text-xs px-3 py-1 rounded-full';
                tagEl.style.backgroundColor = `${tag.color}20`;
                tagEl.style.color = tag.color;
                tagEl.textContent = tag.name;
                detailTags.appendChild(tagEl);
            }
        });
        
        // 填充备注
        document.getElementById('detail-note').textContent = bookmark.note || '无备注';
        
        // 导航到详情页
        this.navigateTo('detail-page');
    }

    // 显示书签操作菜单
    showBookmarkMenu(id, e) {
        // 先关闭已存在的菜单
        this.closeBookmarkMenu();

        // 创建菜单容器
        const menuContainer = document.createElement('div');
        menuContainer.className = 'fixed inset-0 z-40';
        menuContainer.id = 'bookmark-menu-container';

        // 创建菜单元素
        const menu = document.createElement('div');
        menu.className = 'absolute bg-white rounded-lg shadow-lg py-2 min-w-[120px] z-50 animate-fade-in';
        menu.id = 'bookmark-menu';

        // 添加菜单项
        menu.innerHTML = `
            <button class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center menu-share" data-id="${id}">
                <i class="fa fa-share-alt mr-2"></i>
                <span>分享</span>
            </button>
            <button class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center menu-edit" data-id="${id}">
                <i class="fa fa-edit mr-2"></i>
                <span>编辑</span>
            </button>
            <button class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center menu-delete" data-id="${id}">
                <i class="fa fa-trash mr-2"></i>
                <span>删除</span>
            </button>
        `;

        // 计算菜单位置
        const rect = e.currentTarget.getBoundingClientRect();
        menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
        menu.style.right = `${window.innerWidth - rect.right + window.scrollX}px`;

        // 确保菜单在视口内
        const menuWidth = 150;
        const menuHeight = 120;
        if (menu.getBoundingClientRect().right > window.innerWidth) {
            menu.style.right = `${window.innerWidth - rect.left - menuWidth + window.scrollX}px`;
        }
        if (menu.getBoundingClientRect().bottom > window.innerHeight) {
            menu.style.top = `${rect.top + window.scrollY - menuHeight - 5}px`;
        }

        // 添加到文档
        menuContainer.appendChild(menu);
        document.body.appendChild(menuContainer);

        // 为菜单项绑定事件
        menu.querySelector('.menu-share').addEventListener('click', (e) => {
            const bookmarkId = e.currentTarget.dataset.id;
            shareService.shareBookmark(bookmarkId);
            this.closeBookmarkMenu();
        });

        menu.querySelector('.menu-edit').addEventListener('click', (e) => {
            const bookmarkId = e.currentTarget.dataset.id;
            bookmarkManager.editBookmark(bookmarkId);
            this.closeBookmarkMenu();
        });

        menu.querySelector('.menu-delete').addEventListener('click', (e) => {
            const bookmarkId = e.currentTarget.dataset.id;
            bookmarkManager.deleteBookmark(bookmarkId);
            this.closeBookmarkMenu();
        });

        // 点击外部关闭菜单
        menuContainer.addEventListener('click', (e) => {
            if (e.target === menuContainer) {
                this.closeBookmarkMenu();
            }
        });
    }

    // 关闭书签操作菜单
    closeBookmarkMenu() {
        const existingMenu = document.getElementById('bookmark-menu-container');
        if (existingMenu) {
            existingMenu.remove();
        }
    }

    // 预览图片
    async previewImage(file) {
        try {
            // 显示加载状态
            this.showLoading();
            
            // 压缩图片
            const compressedImageData = await imageEditor.compressUploadedImage(file);
            
            const previewImg = document.getElementById('preview-img');
            const imagePreview = document.getElementById('image-preview');
            const cropArea = document.getElementById('crop-area');
            const rotationIndicator = document.getElementById('rotation-indicator');
            
            if (!previewImg || !imagePreview || !cropArea) {
                this.hideLoading();
                this.showErrorToast('图片预览组件缺失');
                return;
            }
            
            // 重置旋转角度
            previewImg.style.transform = 'rotate(0deg)';
            if (rotationIndicator) {
                rotationIndicator.textContent = '0°';
            }
            
            // 加载压缩后的图片
            previewImg.src = compressedImageData;
            
            // 图片加载完成后显示预览
            previewImg.onload = () => {
                // 隐藏加载状态
                this.hideLoading();
                
                // 显示预览区域
                imagePreview.classList.remove('hidden');
                
                // 设置裁剪区域默认大小为整张图片
                setTimeout(() => {
                    const imgRect = previewImg.getBoundingClientRect();
                    
                    // 设置裁剪区域为整张图片大小
                    const cropWidth = imgRect.width;
                    const cropHeight = imgRect.height;
                    const cropLeft = 0;
                    const cropTop = 0;
                    
                    // 设置裁剪区域样式
                    cropArea.style.width = `${cropWidth}px`;
                    cropArea.style.height = `${cropHeight}px`;
                    cropArea.style.left = `${cropLeft}px`;
                    cropArea.style.top = `${cropTop}px`;
                    
                    // 确保裁剪区域可见
                    cropArea.classList.remove('hidden');
                }, 100);
            };
            
            // 图片加载失败
            previewImg.onerror = () => {
                this.hideLoading();
                this.showErrorToast('图片加载失败');
            };
        } catch (error) {
            console.error('预览图片错误:', error);
            this.hideLoading();
            this.showErrorToast('图片预览失败');
        }
    }

    // 添加标签到输入区域
    addTagToInput(tagName) {
        const tagInputArea = document.getElementById('tag-input-area');
        if (!tagInputArea) return;

        const tagEl = document.createElement('div');
        tagEl.className = 'tag flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm';
        tagEl.innerHTML = `
            ${tagName}
            <button class="ml-2 text-blue-800 remove-tag">
                <i class="fa fa-times"></i>
            </button>
        `;
        
        tagInputArea.appendChild(tagEl);

        // 绑定删除事件
        tagEl.querySelector('.remove-tag').addEventListener('click', () => {
            tagEl.remove();
        });
    }

    // 保存书签
    saveBookmark() {
        try {
            const title = document.getElementById('book-title').value.trim();
            const author = document.getElementById('book-author').value.trim();
            const page = document.getElementById('book-page').value.trim();
            const content = document.getElementById('bookmark-content').value.trim();
            const note = document.getElementById('bookmark-note').value.trim();
            
            if (!title || !content) {
                this.showErrorToast('请填写书名和内容');
                return;
            }
            
            // 显示加载状态
            this.showLoading();
            
            // 获取选中的标签
            const tags = [];
            document.querySelectorAll('#tag-input-area .tag').forEach(tagEl => {
                const tagName = tagEl.textContent.trim().replace('×', '').trim();
                // 查找或创建标签
                let existingTag = storage.getTags().find(t => t.name === tagName);
                if (!existingTag) {
                    // 创建新标签
                    existingTag = {
                        name: tagName,
                        color: '#3B82F6'
                    };
                    storage.saveTag(existingTag);
                }
                tags.push(existingTag.id);
            });
            
            // 获取选中的模板
            let template = '1';
            document.querySelectorAll('.template-btn').forEach((btn, index) => {
                if (btn.classList.contains('border-primary')) {
                    template = (index + 1).toString();
                }
            });
            
            // 获取字体大小
            const fontSize = document.getElementById('font-size').value;
            
            // 创建书签对象
            const bookmark = {
                title,
                author,
                page,
                content,
                note,
                tags,
                template,
                font_size: parseInt(fontSize)
            };
            
            // 保存书签
            const saved = storage.saveBookmark(bookmark);
            
            if (!saved) {
                throw new Error('保存书签失败');
            }
            
            // 更新标签计数
            storage.updateTagCounts();
            
            // 隐藏加载状态
            this.hideLoading();
            
            // 显示成功提示
            this.showSuccessToast('书签保存成功');
            
            // 重置表单
            this.resetCreateForm();
            
            // 导航回首页
            setTimeout(() => {
                this.navigateTo('home-page');
                this.renderBookmarks();
                this.renderTags();
            }, 1000);
        } catch (error) {
            console.error('保存书签错误:', error);
            this.hideLoading();
            this.showErrorToast('保存书签失败，请稍后重试');
        }
    }

    // 重置创建表单
    resetCreateForm() {
        document.getElementById('book-title').value = '';
        document.getElementById('book-author').value = '';
        document.getElementById('book-page').value = '';
        document.getElementById('bookmark-content').value = '';
        document.getElementById('bookmark-note').value = '';
        document.getElementById('tag-input-area').innerHTML = '';
        document.getElementById('tag-input').value = '';
        document.getElementById('image-input').value = '';
        document.getElementById('image-preview').classList.add('hidden');
    }

    // 切换样式
    switchStyle(styleNumber) {
        const styleLink = document.getElementById('current-style');
        styleLink.href = `styles/style${styleNumber}.css`;
        
        // 保存样式设置
        storage.saveSettings({ style: styleNumber.toString() });
        
        // 显示成功提示
        this.showSuccessToast('样式已更新');
    }

    // 编辑标签
    editTag(id) {
        const tag = storage.getTag(id);
        if (!tag) return;

        // 填充编辑模态框
        document.getElementById('edit-tag-id').value = tag.id;
        document.getElementById('edit-tag-name').value = tag.name;

        // 选择颜色
        document.querySelectorAll('#edit-tag-modal .w-6.h-6.rounded-full').forEach(colorBtn => {
            colorBtn.classList.remove('border-2', 'border-white', 'shadow-sm');
            if (colorBtn.style.backgroundColor === tag.color || colorBtn.style.backgroundColor === '' && tag.color === '#3B82F6') {
                colorBtn.classList.add('border-2', 'border-white', 'shadow-sm');
            }
        });

        // 显示编辑模态框
        document.getElementById('edit-tag-modal').classList.remove('hidden');

        // 绑定确认按钮事件
        document.getElementById('confirm-edit-tag').onclick = () => {
            const tagName = document.getElementById('edit-tag-name').value.trim();
            if (!tagName) {
                this.showErrorToast('请输入标签名称');
                return;
            }

            const selectedColor = document.querySelector('#edit-tag-modal .w-6.h-6.rounded-full.border-2')?.style.backgroundColor || '#3B82F6';
            const updatedTag = {
                id: id,
                name: tagName,
                color: selectedColor
            };

            storage.saveTag(updatedTag);
            this.renderTags();
            this.renderBookmarks();
            document.getElementById('edit-tag-modal').classList.add('hidden');
            this.showSuccessToast('标签更新成功');
        };

        // 绑定取消按钮事件
        document.getElementById('cancel-edit-tag').onclick = () => {
            document.getElementById('edit-tag-modal').classList.add('hidden');
        };
    }

    // 应用保存的样式
    applySavedStyle() {
        const settings = storage.getSettings();
        const styleNumber = settings.style || '1';
        
        const styleLink = document.getElementById('current-style');
        styleLink.href = `styles/style${styleNumber}.css`;
        
        // 更新样式选择按钮
        document.querySelectorAll('.style-btn').forEach((btn, index) => {
            if (index + 1 === parseInt(styleNumber)) {
                btn.classList.add('border-primary');
                btn.classList.remove('border-gray-300');
            } else {
                btn.classList.remove('border-primary');
                btn.classList.add('border-gray-300');
            }
        });
    }

    // 显示提示信息
    showToast(message, type = 'success') {
        const toast = document.getElementById(type === 'success' ? 'success-toast' : 'error-toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 2000);
    }

    // 显示成功提示
    showSuccessToast(message) {
        this.showToast(message, 'success');
    }

    // 显示错误提示
    showErrorToast(message) {
        this.showToast(message, 'error');
    }

    // 显示加载状态
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }

    // 隐藏加载状态
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }
}

// 初始化应用
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// 工具函数
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

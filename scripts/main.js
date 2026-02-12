// 主应用逻辑

class App {
    constructor() {
        this.currentPage = 'home-page';
        this.punctuationMode = 'toChinese'; // 'toChinese' 或 'toEnglish'
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
        
        // 加载筛选下拉菜单选项
        this.loadFilterOptions();
        
        // 应用保存的样式
        this.applySavedStyle();
    }

    // 加载筛选下拉菜单选项
    loadFilterOptions() {
        // 加载标签选项
        this.loadTagOptions();
        
        // 加载书名选项
        this.loadTitleOptions();
        
        // 加载作者选项
        this.loadAuthorOptions();
        
        // 加载创建页面的标签下拉菜单
        this.loadCreatePageTagOptions();
        
        // 加载创建页面的书名和作者选项
        this.loadCreatePageTitleOptions();
        this.loadCreatePageAuthorOptions();
    }

    // 加载标签选项
    loadTagOptions() {
        const tagSelect = document.getElementById('filter-tag');
        if (!tagSelect) return;
        
        // 清空现有选项（保留默认选项）
        while (tagSelect.options.length > 1) {
            tagSelect.remove(1);
        }
        
        // 获取所有标签
        const tags = storage.getTags();
        
        // 添加标签选项
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = tag.name;
            tagSelect.appendChild(option);
        });
    }
    
    // 加载创建页面的标签下拉菜单
    loadCreatePageTagOptions() {
        const tagDropdown = document.getElementById('tag-dropdown');
        if (!tagDropdown) return;
        
        // 清空现有选项
        tagDropdown.innerHTML = '';
        
        // 获取所有标签
        const tags = storage.getTags();
        
        // 添加标签选项
        tags.forEach(tag => {
            const option = document.createElement('div');
            option.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
            option.textContent = tag.name;
            option.addEventListener('click', () => {
                document.getElementById('tag-input').value = tag.name;
                tagDropdown.classList.add('hidden');
            });
            tagDropdown.appendChild(option);
        });
    }

    // 加载创建页面的书名选项
    loadCreatePageTitleOptions() {
        const titleDropdown = document.getElementById('book-title-dropdown');
        if (!titleDropdown) return;
        
        // 清空现有选项
        titleDropdown.innerHTML = '';
        
        // 获取所有书签
        const bookmarks = storage.getBookmarks();
        
        // 提取唯一的书名
        const titles = [...new Set(bookmarks.map(bookmark => bookmark.title))];
        
        // 添加书名选项
        titles.forEach(title => {
            const option = document.createElement('div');
            option.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
            option.textContent = title;
            option.addEventListener('click', () => {
                document.getElementById('book-title').value = title;
                titleDropdown.classList.add('hidden');
            });
            titleDropdown.appendChild(option);
        });
    }

    // 加载创建页面的作者选项
    loadCreatePageAuthorOptions() {
        const authorDropdown = document.getElementById('book-author-dropdown');
        if (!authorDropdown) return;
        
        // 清空现有选项
        authorDropdown.innerHTML = '';
        
        // 获取所有书签
        const bookmarks = storage.getBookmarks();
        
        // 提取唯一的作者
        const authors = [...new Set(bookmarks.map(bookmark => bookmark.author))];
        
        // 添加作者选项
        authors.forEach(author => {
            const option = document.createElement('div');
            option.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
            option.textContent = author;
            option.addEventListener('click', () => {
                document.getElementById('book-author').value = author;
                authorDropdown.classList.add('hidden');
            });
            authorDropdown.appendChild(option);
        });
    }

    // 加载书名选项
    loadTitleOptions() {
        const titleSelect = document.getElementById('filter-title');
        if (!titleSelect) return;
        
        // 清空现有选项（保留默认选项）
        while (titleSelect.options.length > 1) {
            titleSelect.remove(1);
        }
        
        // 获取所有书签
        const bookmarks = storage.getBookmarks();
        
        // 提取唯一的书名
        const titles = [...new Set(bookmarks.map(bookmark => bookmark.title))];
        
        // 添加书名选项
        titles.forEach(title => {
            const option = document.createElement('option');
            option.value = title;
            option.textContent = title;
            titleSelect.appendChild(option);
        });
    }

    // 加载作者选项
    loadAuthorOptions() {
        const authorSelect = document.getElementById('filter-author');
        if (!authorSelect) return;
        
        // 清空现有选项（保留默认选项）
        while (authorSelect.options.length > 1) {
            authorSelect.remove(1);
        }
        
        // 获取所有书签
        const bookmarks = storage.getBookmarks();
        
        // 提取唯一的作者
        const authors = [...new Set(bookmarks.map(bookmark => bookmark.author))];
        
        // 添加作者选项
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author;
            option.textContent = author;
            authorSelect.appendChild(option);
        });
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
                
                // 如果是点击创建页面按钮，重置表单
                if (page === 'create-page') {
                    bookmarkManager.resetForm();
                }
                
                this.navigateTo(page);
            });
        });

        

        document.getElementById('back-from-detail')?.addEventListener('click', () => {
            this.navigateTo('home-page');
        });

        // 搜索按钮 - 点击执行搜索
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput.value.trim();
                bookmarkManager.searchBookmarks(query);
            });

            // 回车键触发搜索
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    bookmarkManager.searchBookmarks(query);
                }
            });
        }

        // 重置按钮 - 重置所有筛选条件
        document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
            this.resetFilters();
        });

        // 筛选下拉菜单
        const filterTagSelect = document.getElementById('filter-tag');
        const filterTitleSelect = document.getElementById('filter-title');
        const filterAuthorSelect = document.getElementById('filter-author');
        
        if (filterTagSelect && filterTitleSelect && filterAuthorSelect) {
            // 保存this上下文
            const self = this;
            
            // 使用防抖函数优化实时筛选
            const debouncedFilter = debounce(function() {
                self.filterBookmarks();
            }, 300);
            
            filterTagSelect.addEventListener('change', debouncedFilter);
            filterTitleSelect.addEventListener('change', debouncedFilter);
            filterAuthorSelect.addEventListener('change', debouncedFilter);
        }

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
            tagManager.openAddTagModal();
        });

        document.getElementById('cancel-add-tag')?.addEventListener('click', () => {
            tagManager.closeAddTagModal();
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
            bookmarkManager.saveBookmark();
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

        // 转换标点按钮点击事件 - 自动检测并转换
        document.getElementById('convert-punctuation-btn')?.addEventListener('click', () => {
            const contentTextarea = document.getElementById('bookmark-content');
            const convertBtn = document.getElementById('convert-punctuation-btn');
            if (contentTextarea && contentTextarea.value) {
                try {
                    const text = contentTextarea.value;
                    // 检测文本中主要使用哪种标点
                    const hasChinesePunctuation = /[，。！？；：""''（）【】《》]/.test(text);
                    const hasEnglishPunctuation = /[,.!?;:"''()\[\]<>]/.test(text);

                    let convertedText;
                    let successMessage;
                    let newMode;

                    if (hasChinesePunctuation && !hasEnglishPunctuation) {
                        // 主要是中文标点，转换为英文标点
                        convertedText = aiOCR.convertToEnglishPunctuation(text);
                        successMessage = '已转换为英文标点';
                        newMode = 'toEnglish';
                    } else {
                        // 默认或主要是英文标点，转换为中文标点
                        convertedText = aiOCR.convertToChinesePunctuation(text);
                        successMessage = '已转换为中文标点';
                        newMode = 'toChinese';
                    }

                    contentTextarea.value = convertedText;
                    this.punctuationMode = newMode;

                    // 按钮文字保持为"标点转换"

                    // 自动调整文本框高度
                    this.autoResizeTextarea(contentTextarea);
                    this.showSuccessToast(successMessage);
                } catch (error) {
                    console.error('转换标点错误:', error);
                    this.showErrorToast('转换标点失败，请稍后重试');
                }
            } else {
                this.showErrorToast('请先输入内容');
            }
        });

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

        // 保存按钮
        document.querySelector('#detail-page .fa-download')?.parentElement.addEventListener('click', () => {
            if (this.currentBookmarkId) {
                this.saveBookmarkAsImage(this.currentBookmarkId);
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

        // 书名下拉按钮点击事件
        document.getElementById('book-title-dropdown-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('book-title-dropdown');
            // 切换下拉菜单显示状态
            dropdown.classList.toggle('hidden');
            // 隐藏作者下拉菜单
            document.getElementById('book-author-dropdown').classList.add('hidden');
            // 隐藏标签下拉菜单
            document.getElementById('tag-dropdown').classList.add('hidden');
        });

        // 作者下拉按钮点击事件
        document.getElementById('book-author-dropdown-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('book-author-dropdown');
            // 切换下拉菜单显示状态
            dropdown.classList.toggle('hidden');
            // 隐藏书名下拉菜单
            document.getElementById('book-title-dropdown').classList.add('hidden');
            // 隐藏标签下拉菜单
            document.getElementById('tag-dropdown').classList.add('hidden');
        });

        // 标签下拉按钮点击事件
        document.getElementById('tag-dropdown-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('tag-dropdown');
            // 切换下拉菜单显示状态
            dropdown.classList.toggle('hidden');
            // 隐藏其他下拉菜单
            document.getElementById('book-title-dropdown').classList.add('hidden');
            document.getElementById('book-author-dropdown').classList.add('hidden');
        });

        // 点击页面其他区域时下拉菜单自动隐藏
        document.addEventListener('click', (e) => {
            // 检查点击是否在下拉菜单或下拉按钮之外
            if (!e.target.closest('#book-title-dropdown') && !e.target.closest('#book-title-dropdown-btn') &&
                !e.target.closest('#book-author-dropdown') && !e.target.closest('#book-author-dropdown-btn') &&
                !e.target.closest('#tag-dropdown') && !e.target.closest('#tag-dropdown-btn')) {
                // 隐藏所有下拉菜单
                document.getElementById('book-title-dropdown').classList.add('hidden');
                document.getElementById('book-author-dropdown').classList.add('hidden');
                document.getElementById('tag-dropdown').classList.add('hidden');
            }
        });

        // 点击空白区域收起已打开的书签
        document.addEventListener('click', (e) => {
            // 检查点击是否在书签项或操作按钮之外
            if (!e.target.closest('.bookmark-item') && !e.target.closest('.action-btn')) {
                // 收起所有书签的展开状态
                document.querySelectorAll('.bookmark-item').forEach(item => {
                    const itemContent = item.querySelector('.bookmark-content');
                    const itemActions = item.querySelector('.bookmark-actions');
                    if (itemContent) itemContent.classList.remove('expanded');
                    if (itemActions) itemActions.classList.add('hidden');
                });
            }
        });
    }

    // 页面导航
    navigateTo(page) {
        // 如果目标页面就是当前页面，直接返回
        if (page === this.currentPage) return;
        
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
                    <span class="font-semibold text-sm">${bookmark.author}</span>
                </div>
                <p class="text-sm text-gray-600 mb-3 bookmark-content transition-all duration-300 overflow-hidden">
                    ${bookmark.content}
                </p>
                <div class="flex justify-between items-center mb-3">
                    <div class="flex space-x-1">
                        ${tagNames.map(name => `<span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">${name}</span>`).join('')}
                    </div>
                    <span class="text-xs text-gray-500">${formattedDate}</span>
                </div>
                <div class="bookmark-actions hidden grid grid-cols-3 gap-2 mb-2">
                    <button class="action-btn view-btn flex flex-col items-center justify-center p-2" data-id="${bookmark.id}">
                        <i class="fa fa-eye text-gray-500 mb-1"></i>
                        <span class="text-xs text-gray-500">查看</span>
                    </button>
                    <button class="action-btn edit-btn flex flex-col items-center justify-center p-2" data-id="${bookmark.id}">
                        <i class="fa fa-edit text-gray-500 mb-1"></i>
                        <span class="text-xs text-gray-500">编辑</span>
                    </button>
                    <button class="action-btn delete-btn flex flex-col items-center justify-center p-2" data-id="${bookmark.id}">
                        <i class="fa fa-trash text-gray-500 mb-1"></i>
                        <span class="text-xs text-gray-500">删除</span>
                    </button>
                </div>
            `;
            
            bookmarkList.appendChild(bookmarkEl);

            // 为书签项添加点击展开/收起功能
            bookmarkEl.addEventListener('click', (e) => {
                // 避免点击操作按钮时触发
                if (!e.target.closest('.action-btn')) {
                    const contentEl = bookmarkEl.querySelector('.bookmark-content');
                    const actionsEl = bookmarkEl.querySelector('.bookmark-actions');
                    
                    // 先关闭所有其他书签的展开状态
                    document.querySelectorAll('.bookmark-item').forEach(item => {
                        if (item !== bookmarkEl) {
                            const itemContent = item.querySelector('.bookmark-content');
                            const itemActions = item.querySelector('.bookmark-actions');
                            if (itemContent) itemContent.classList.remove('expanded');
                            if (itemActions) itemActions.classList.add('hidden');
                        }
                    });
                    
                    // 切换当前书签的展开状态
                    if (contentEl) {
                        contentEl.classList.toggle('expanded');
                    }
                    if (actionsEl) {
                        actionsEl.classList.toggle('hidden');
                    }
                }
            });
        });

        // 绑定操作按钮事件
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.currentTarget.dataset.id;
                app.viewBookmark(bookmarkId);
            });
        });

        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.currentTarget.dataset.id;
                this.saveBookmarkAsImage(bookmarkId);
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.currentTarget.dataset.id;
                bookmarkManager.editBookmark(bookmarkId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.currentTarget.dataset.id;
                bookmarkManager.deleteBookmark(bookmarkId);
            });
        });
        
        // 重新加载筛选选项
        this.loadFilterOptions();
        
        // 重新加载创建页面的标签、书名和作者下拉菜单
        this.loadCreatePageTagOptions();
        this.loadCreatePageTitleOptions();
        this.loadCreatePageAuthorOptions();
    }

    // 渲染标签列表
    renderTags() {
        const tagList = document.getElementById('tag-list');
        if (!tagList) return;

        const tags = storage.getTags();
        
        tagList.innerHTML = '';
        
        tags.forEach(tag => {
            const tagEl = document.createElement('div');
            tagEl.className = 'tag-item flex items-center justify-between p-3 bg-gray-50 rounded-lg card-hover cursor-pointer';
            
            tagEl.innerHTML = `
                <div class="flex items-center">
                    <span class="font-medium">${tag.name}</span>
                </div>
                <div class="flex items-center">
                    <span class="text-xs text-gray-500 mr-4">使用 ${tag.count} 次</span>
                    <button class="btn-icon mr-2 edit-tag" data-id="${tag.id}">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-tag" data-id="${tag.id}">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            `;
            
            // 添加点击事件
            tagEl.addEventListener('click', (e) => {
                // 避免点击按钮时触发
                if (!e.target.closest('button')) {
                    // 跳转到首页
                    this.navigateTo('home-page');
                    
                    // 延迟执行，确保页面已切换
                    setTimeout(() => {
                        // 选中对应的标签并筛选
                        const filterTagSelect = document.getElementById('filter-tag');
                        if (filterTagSelect) {
                            filterTagSelect.value = tag.id;
                            // 触发筛选
                            this.filterBookmarks();
                        }
                    }, 300);
                }
            });
            
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
        
        // 重新加载筛选选项
        this.loadFilterOptions();
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
                tagEl.className = 'text-xs px-3 py-1 rounded-full bg-gray-200 text-gray-800';
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
                <i class="fa fa-share-alt mr-2 text-gray-500"></i>
                <span>分享</span>
            </button>
            <button class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center menu-edit" data-id="${id}">
                <i class="fa fa-edit mr-2 text-gray-500"></i>
                <span>编辑</span>
            </button>
            <button class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center menu-delete" data-id="${id}">
                <i class="fa fa-trash mr-2 text-gray-500"></i>
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
            <button class="btn-icon ml-2 remove-tag" style="padding: 2px;">
                <i class="fa fa-times text-blue-800"></i>
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
            const content = document.getElementById('bookmark-content').value.trim();
            const note = document.getElementById('bookmark-note').value.trim();
            
            // 验证必填项
            if (!title) {
                this.showErrorToast('请填写书名');
                return;
            }
            
            if (!author) {
                this.showErrorToast('请填写作者');
                return;
            }
            
            if (!content) {
                this.showErrorToast('请填写内容');
                return;
            }
            
            // 验证标签
            const tagCount = document.querySelectorAll('#tag-input-area .tag').length;
            if (tagCount === 0) {
                this.showErrorToast('请至少添加一个标签');
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
                    name: tagName
                };
                storage.saveTag(existingTag);
            }
                tags.push(existingTag.id);
            });
            
            // 创建书签对象
            const bookmark = {
                title,
                author,
                content,
                note,
                tags
            };
            
            // 保存书签
            storage.saveBookmark(bookmark);
            
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
        
        // 处理暗黑模式
        if (styleNumber === 3) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
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

        // 显示编辑模态框
        document.getElementById('edit-tag-modal').classList.remove('hidden');

        // 绑定确认按钮事件
        document.getElementById('confirm-edit-tag').onclick = () => {
            const tagName = document.getElementById('edit-tag-name').value.trim();
            if (!tagName) {
                this.showErrorToast('请输入标签名称');
                return;
            }

            const updatedTag = {
                id: id,
                name: tagName
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
        
        // 处理暗黑模式
        if (parseInt(styleNumber) === 3) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
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

    // 筛选书签
    filterBookmarks() {
        const bookmarks = storage.getBookmarks();
        
        const tagFilter = document.getElementById('filter-tag')?.value || '';
        const titleFilter = document.getElementById('filter-title')?.value || '';
        const authorFilter = document.getElementById('filter-author')?.value || '';
        
        let filteredBookmarks = bookmarks;
        
        // 按标签筛选
        if (tagFilter) {
            filteredBookmarks = filteredBookmarks.filter(bookmark => 
                bookmark.tags.includes(tagFilter)
            );
        }
        
        // 按书名筛选
        if (titleFilter) {
            filteredBookmarks = filteredBookmarks.filter(bookmark => 
                bookmark.title === titleFilter
            );
        }
        
        // 按作者筛选
        if (authorFilter) {
            filteredBookmarks = filteredBookmarks.filter(bookmark => 
                bookmark.author === authorFilter
            );
        }
        
        // 渲染筛选结果
        const bookmarkList = document.getElementById('bookmark-list');
        if (!bookmarkList) return;

        bookmarkList.innerHTML = '';
        
        if (filteredBookmarks.length === 0) {
            bookmarkList.innerHTML = '<div class="text-center py-8 text-gray-500">没有找到匹配的书签</div>';
            return;
        }
        
        filteredBookmarks.forEach(bookmark => {
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
                    <span class="font-semibold text-sm">${bookmark.author}</span>
                </div>
                <p class="text-sm text-gray-600 mb-3 bookmark-content transition-all duration-300 overflow-hidden">
                    ${bookmark.content}
                </p>
                <div class="flex justify-between items-center mb-3">
                    <div class="flex space-x-1">
                        ${tagNames.map(name => `<span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">${name}</span>`).join('')}
                    </div>
                    <span class="text-xs text-gray-500">${formattedDate}</span>
                </div>
                <div class="bookmark-actions hidden grid grid-cols-3 gap-2 mb-2">
                    <button class="action-btn view-btn flex flex-col items-center justify-center p-2" data-id="${bookmark.id}">
                        <i class="fa fa-eye text-gray-500 mb-1"></i>
                        <span class="text-xs text-gray-500">查看</span>
                    </button>
                    <button class="action-btn edit-btn flex flex-col items-center justify-center p-2" data-id="${bookmark.id}">
                        <i class="fa fa-edit text-gray-500 mb-1"></i>
                        <span class="text-xs text-gray-500">编辑</span>
                    </button>
                    <button class="action-btn delete-btn flex flex-col items-center justify-center p-2" data-id="${bookmark.id}">
                        <i class="fa fa-trash text-gray-500 mb-1"></i>
                        <span class="text-xs text-gray-500">删除</span>
                    </button>
                </div>
            `;

            bookmarkList.appendChild(bookmarkEl);

            // 为书签项添加点击展开/收起功能
            bookmarkEl.addEventListener('click', (e) => {
                // 避免点击操作按钮时触发
                if (!e.target.closest('.action-btn')) {
                    const contentEl = bookmarkEl.querySelector('.bookmark-content');
                    const actionsEl = bookmarkEl.querySelector('.bookmark-actions');

                    // 先关闭所有其他书签的展开状态
                    document.querySelectorAll('.bookmark-item').forEach(item => {
                        if (item !== bookmarkEl) {
                            const itemContent = item.querySelector('.bookmark-content');
                            const itemActions = item.querySelector('.bookmark-actions');
                            if (itemContent) itemContent.classList.remove('expanded');
                            if (itemActions) itemActions.classList.add('hidden');
                        }
                    });

                    // 切换当前书签的展开状态
                    if (contentEl) {
                        contentEl.classList.toggle('expanded');
                    }
                    if (actionsEl) {
                        actionsEl.classList.toggle('hidden');
                    }
                }
            });
        });

        // 绑定操作按钮事件
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.currentTarget.dataset.id;
                app.viewBookmark(bookmarkId);
            });
        });

        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.currentTarget.dataset.id;
                this.saveBookmarkAsImage(bookmarkId);
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.currentTarget.dataset.id;
                bookmarkManager.editBookmark(bookmarkId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.currentTarget.dataset.id;
                bookmarkManager.deleteBookmark(bookmarkId);
            });
        });
    }

    // 重置所有筛选条件
    resetFilters() {
        // 重置搜索输入框
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        // 重置筛选下拉菜单
        const filterTag = document.getElementById('filter-tag');
        const filterTitle = document.getElementById('filter-title');
        const filterAuthor = document.getElementById('filter-author');

        if (filterTag) filterTag.value = '';
        if (filterTitle) filterTitle.value = '';
        if (filterAuthor) filterAuthor.value = '';

        // 重新渲染所有书签
        this.renderBookmarks();

        // 显示提示
        this.showSuccessToast('筛选条件已重置');
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

    // 保存书签为图片
    async saveBookmarkAsImage(id) {
        try {
            // 显示加载状态
            this.showLoading();
            
            // 确保书签详情页已加载
            this.showBookmarkDetail(id);
            
            // 等待页面渲染完成
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 获取书签详情页的内容
            const bookmarkPreview = document.getElementById('bookmark-preview');
            if (!bookmarkPreview) {
                throw new Error('找不到书签预览元素');
            }
            
            // 使用html2canvas将内容转换为图片
            const canvas = await html2canvas(bookmarkPreview, {
                scale: 2, // 提高图片质量
                useCORS: true, // 允许加载跨域图片
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            // 将canvas转换为图片数据URL
            const imageDataUrl = canvas.toDataURL('image/png');
            
            // 调用保存图片到相册的方法
            await this.saveImageToGallery(imageDataUrl);
            
            // 显示成功提示
            this.showSuccessToast('书签已保存到相册');
        } catch (error) {
            console.error('保存书签为图片失败:', error);
            this.showErrorToast('保存失败，请稍后重试');
        } finally {
            this.hideLoading();
        }
    }

    // 保存图片到设备
    async saveImageToGallery(imageDataUrl) {
        try {
            // 创建保存确认模态框
            const modal = this.createSaveConfirmModal(imageDataUrl);
            document.body.appendChild(modal);
        } catch (error) {
            console.error('保存图片失败:', error);
            throw error;
        }
    }

    // 创建保存确认模态框
    createSaveConfirmModal(imageDataUrl) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = 'save-confirm-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-lg p-6 w-4/5 max-w-sm';
        
        const modalTitle = document.createElement('h3');
        modalTitle.className = 'text-lg font-bold mb-4 text-center';
        modalTitle.textContent = '保存书签图片';
        
        const modalBody = document.createElement('div');
        modalBody.className = 'mb-6';
        
        const saveInfo = document.createElement('p');
        saveInfo.className = 'text-sm text-gray-600 mb-4';
        saveInfo.textContent = '请点击下方按钮保存书签图片，保存后可在相册中查看。';
        
        const imagePreview = document.createElement('div');
        imagePreview.className = 'w-full h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center';
        
        const previewImg = document.createElement('img');
        previewImg.src = imageDataUrl;
        previewImg.className = 'max-w-full max-h-full object-contain';
        imagePreview.appendChild(previewImg);
        
        const modalFooter = document.createElement('div');
        modalFooter.className = 'flex justify-center space-x-3';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm';
        cancelBtn.textContent = '取消';
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'px-4 py-2 bg-primary text-white rounded-lg text-sm';
        saveBtn.textContent = '保存图片';
        saveBtn.addEventListener('click', () => {
            // 创建一个链接元素用于下载
            const link = document.createElement('a');
            link.href = imageDataUrl;
            link.download = `bookmark-${new Date().toISOString().split('T')[0]}.png`;
            
            // 确保链接在文档中
            document.body.appendChild(link);
            
            // 触发点击事件
            link.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(imageDataUrl);
                modal.remove();
                
                // 检查是否在移动设备上
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (isMobile) {
                    app.showSuccessToast('图片已保存到下载文件夹，稍后会出现在相册中');
                } else {
                    app.showSuccessToast('图片保存成功');
                }
            }, 100);
        });
        
        modalBody.appendChild(saveInfo);
        modalBody.appendChild(imagePreview);
        
        modalFooter.appendChild(cancelBtn);
        modalFooter.appendChild(saveBtn);
        
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        
        modal.appendChild(modalContent);
        
        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }

    // 查看书签
    viewBookmark(id) {
        const bookmark = storage.getBookmark(id);
        if (!bookmark) return;

        // 获取当前设置的风格
        const settings = storage.getSettings();
        const styleNumber = settings.style || '1';

        // 根据风格设置背景颜色
        let backgroundColor = '#f3f4f6'; // 默认风格1背景
        if (styleNumber === '2') {
            backgroundColor = '#F5F5F4'; // 风格2背景
        } else if (styleNumber === '3') {
            backgroundColor = '#0F172A'; // 风格3背景
        }

        // 创建查看模式容器
        const viewContainer = document.createElement('div');
        viewContainer.className = 'fixed inset-0 flex items-center justify-center z-50';
        viewContainer.id = 'bookmark-view-container';
        viewContainer.style.backgroundColor = backgroundColor;

        // 创建书签内容容器
        const contentContainer = document.createElement('div');
        contentContainer.className = 'w-full max-w-2xl p-6';

        // 创建书签卡片
        const bookmarkCard = document.createElement('div');
        bookmarkCard.className = 'p-6 rounded-lg shadow-sm';
        bookmarkCard.style.border = 'none'; // 取消查看状态下的边框
        bookmarkCard.style.backgroundColor = styleNumber === '3' ? '#1E293B' : '#FFFFFF';

        // 创建内容包装器，用于垂直居中
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'flex flex-col';
        contentWrapper.style.width = '100%';
        contentWrapper.style.maxWidth = '800px';
        contentWrapper.style.margin = 'auto';

        // 创建标题和作者信息（与首页一致：左上、右上）
        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex justify-between items-start mb-4';
        infoContainer.style.color = styleNumber === '3' ? '#F8FAFC' : '#1F2937';
        infoContainer.innerHTML = `
            <h3 class="font-semibold">${bookmark.title}</h3>
            <span class="font-semibold text-sm">${bookmark.author}</span>
        `;

        // 创建内容区域（垂直居中）
        const textContainer = document.createElement('div');
        textContainer.className = 'py-6';
        textContainer.style.minHeight = '100px'; // 确保有最小高度，避免内容太少时显得拥挤
        
        // 创建文本元素
        const contentText = document.createElement('div');
        contentText.className = 'text-sm leading-relaxed';
        contentText.style.color = styleNumber === '3' ? '#F8FAFC' : '#374151';
        contentText.style.whiteSpace = 'pre-wrap';
        contentText.style.wordWrap = 'break-word';
        contentText.textContent = bookmark.content;

        // 创建日期和标签信息（与首页一致：左下、右下）
        const metaContainer = document.createElement('div');
        metaContainer.className = 'flex justify-between items-center mt-4';
        
        // 标签容器
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'flex flex-wrap gap-1';
        
        // 获取标签名称
        const tagNames = bookmark.tags.map(tagId => {
            const tag = storage.getTag(tagId);
            return tag ? tag.name : '';
        }).filter(Boolean);
        
        tagNames.forEach(name => {
            const tagEl = document.createElement('span');
            tagEl.className = 'text-xs px-2 py-0.5';
            tagEl.style.color = styleNumber === '3' ? '#94A3B8' : '#6B7280';
            tagEl.textContent = name;
            tagsContainer.appendChild(tagEl);
        });
        
        // 日期信息
        const dateContainer = document.createElement('div');
        dateContainer.className = 'text-xs';
        dateContainer.style.color = styleNumber === '3' ? '#94A3B8' : '#6B7280';
        
        // 格式化日期
        const date = new Date(bookmark.created_at);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        dateContainer.textContent = formattedDate;
        
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'absolute top-6 right-6 text-3xl';
        closeButton.style.color = styleNumber === '3' ? '#94A3B8' : '#6B7280';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(viewContainer);
        });

        // 添加滑动方向指示
        const leftArrow = document.createElement('div');
        leftArrow.className = 'absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl opacity-30 cursor-pointer hover:opacity-100 transition-opacity';
        leftArrow.style.color = styleNumber === '3' ? '#94A3B8' : '#6B7280';
        leftArrow.innerHTML = '<i class="fa fa-angle-left"></i>';
        
        const rightArrow = document.createElement('div');
        rightArrow.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 text-2xl opacity-30 cursor-pointer hover:opacity-100 transition-opacity';
        rightArrow.style.color = styleNumber === '3' ? '#94A3B8' : '#6B7280';
        rightArrow.innerHTML = '<i class="fa fa-angle-right"></i>';

        // 只有在有多个书签时才显示箭头
        const bookmarks = storage.getBookmarks();
        if (bookmarks.length > 1) {
            viewContainer.appendChild(leftArrow);
            viewContainer.appendChild(rightArrow);
            
            // 添加点击事件
            leftArrow.addEventListener('click', () => {
                const currentIndex = bookmarks.findIndex(b => b.id === id);
                const prevIndex = currentIndex - 1;
                if (prevIndex >= 0) {
                    const prevBookmark = bookmarks[prevIndex];
                    createNextBookmarkView(prevBookmark.id, viewContainer);
                } else {
                    // 在书签查看页面上显示提示
                    showBookmarkToast(viewContainer, '已经是第一页');
                }
            });
            
            rightArrow.addEventListener('click', () => {
                const currentIndex = bookmarks.findIndex(b => b.id === id);
                const nextIndex = currentIndex + 1;
                if (nextIndex < bookmarks.length) {
                    const nextBookmark = bookmarks[nextIndex];
                    createNextBookmarkView(nextBookmark.id, viewContainer);
                } else {
                    // 在书签查看页面上显示提示
                    showBookmarkToast(viewContainer, '已经是最后一页');
                }
            });
        }

        // 组装容器
        contentWrapper.appendChild(infoContainer);
        textContainer.appendChild(contentText);
        contentWrapper.appendChild(textContainer);
        metaContainer.appendChild(tagsContainer);
        metaContainer.appendChild(dateContainer);
        contentWrapper.appendChild(metaContainer);
        bookmarkCard.appendChild(contentWrapper);
        contentContainer.appendChild(bookmarkCard);
        viewContainer.appendChild(contentContainer);
        viewContainer.appendChild(closeButton);

        // 应用用户选定的风格
        const styleLink = document.getElementById('current-style');
        if (styleLink) {
            const styleUrl = styleLink.href;
            const viewStyleLink = document.createElement('link');
            viewStyleLink.rel = 'stylesheet';
            viewStyleLink.href = styleUrl;
            viewStyleLink.id = 'view-style';
            viewContainer.appendChild(viewStyleLink);
        }

        // 添加触摸事件监听，实现左右滑动切换书签，支持拖动跟随
        let touchStartX = 0;
        let touchStartY = 0;
        let isDragging = false;
        
        viewContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            isDragging = true;
            // 移除过渡效果，以便实时跟随拖动
            viewContainer.style.transition = 'none';
        });
        
        viewContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const touchX = e.changedTouches[0].screenX;
            const touchY = e.changedTouches[0].screenY;
            
            // 计算滑动距离
            const deltaX = touchX - touchStartX;
            const deltaY = touchY - touchStartY;
            
            // 只处理水平滑动
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault(); // 防止页面滚动
                // 实时更新页面位置，跟随拖动
                viewContainer.style.transform = `translateX(${deltaX}px)`;
            }
        });
        
        viewContainer.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const touchEndX = e.changedTouches[0].screenX;
            const deltaX = touchEndX - touchStartX;
            const swipeThreshold = 50; // 滑动阈值
            const bookmarks = storage.getBookmarks();
            const currentIndex = bookmarks.findIndex(b => b.id === id);
            
            // 添加过渡效果
            viewContainer.style.transition = 'transform 0.3s ease-out';
            
            if (deltaX < -swipeThreshold) {
                // 左滑，切换到下一个书签
                const nextIndex = currentIndex + 1;
                if (nextIndex < bookmarks.length) {
                    // 滑动到左侧
                    viewContainer.style.transform = 'translateX(-100%)';
                    setTimeout(() => {
                        // 隐藏当前容器
                        viewContainer.style.opacity = '0';
                        // 创建并显示下一个书签
                        const nextBookmark = bookmarks[nextIndex];
                        createNextBookmarkView(nextBookmark.id, viewContainer);
                    }, 300);
                } else {
                    // 回弹到原始位置
                    viewContainer.style.transform = 'translateX(0)';
                }
            } else if (deltaX > swipeThreshold) {
                // 右滑，切换到上一个书签
                const prevIndex = currentIndex - 1;
                if (prevIndex >= 0) {
                    // 滑动到右侧
                    viewContainer.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        // 隐藏当前容器
                        viewContainer.style.opacity = '0';
                        // 创建并显示上一个书签
                        const prevBookmark = bookmarks[prevIndex];
                        createNextBookmarkView(prevBookmark.id, viewContainer);
                    }, 300);
                } else {
                    // 回弹到原始位置
                    viewContainer.style.transform = 'translateX(0)';
                }
            } else {
                // 滑动距离不足，回弹到原始位置
                viewContainer.style.transform = 'translateX(0)';
            }
        });
        
        // 初始化书签视图（添加事件监听等）
        function initBookmarkView(container, bookmarkId) {
            // 重新添加触摸事件监听，实现左右滑动切换书签，支持拖动跟随
            let touchStartX = 0;
            let touchStartY = 0;
            let isDragging = false;
            
            container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
                isDragging = true;
                // 移除过渡效果，以便实时跟随拖动
                container.style.transition = 'none';
            });
            
            container.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                
                const touchX = e.changedTouches[0].screenX;
                const touchY = e.changedTouches[0].screenY;
                
                // 计算滑动距离
                const deltaX = touchX - touchStartX;
                const deltaY = touchY - touchStartY;
                
                // 只处理水平滑动
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    e.preventDefault(); // 防止页面滚动
                    // 实时更新页面位置，跟随拖动
                    container.style.transform = `translateX(${deltaX}px)`;
                }
            });
            
            container.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                isDragging = false;
                
                const touchEndX = e.changedTouches[0].screenX;
                const deltaX = touchEndX - touchStartX;
                const swipeThreshold = 50; // 滑动阈值
                const bookmarks = storage.getBookmarks();
                const currentIndex = bookmarks.findIndex(b => b.id === bookmarkId);
                
                // 添加过渡效果
                container.style.transition = 'transform 0.3s ease-out';
                
                if (deltaX < -swipeThreshold) {
                    // 左滑，切换到下一个书签
                    const nextIndex = currentIndex + 1;
                    if (nextIndex < bookmarks.length) {
                        // 滑动到左侧
                        container.style.transform = 'translateX(-100%)';
                        setTimeout(() => {
                            // 隐藏当前容器
                            container.style.opacity = '0';
                            // 创建并显示下一个书签
                            const nextBookmark = bookmarks[nextIndex];
                            createNextBookmarkView(nextBookmark.id, container);
                        }, 300);
                    } else {
                        // 回弹到原始位置
                        container.style.transform = 'translateX(0)';
                    }
                } else if (deltaX > swipeThreshold) {
                    // 右滑，切换到上一个书签
                    const prevIndex = currentIndex - 1;
                    if (prevIndex >= 0) {
                        // 滑动到右侧
                        container.style.transform = 'translateX(100%)';
                        setTimeout(() => {
                            // 隐藏当前容器
                            container.style.opacity = '0';
                            // 创建并显示上一个书签
                            const prevBookmark = bookmarks[prevIndex];
                            createNextBookmarkView(prevBookmark.id, container);
                        }, 300);
                    } else {
                        // 回弹到原始位置
                        container.style.transform = 'translateX(0)';
                    }
                } else {
                    // 滑动距离不足，回弹到原始位置
                    container.style.transform = 'translateX(0)';
                }
            });
            
            // 为新容器添加关闭按钮
            const closeButton = document.createElement('button');
            closeButton.className = 'absolute top-6 right-6 text-3xl';
            closeButton.style.color = styleNumber === '3' ? '#94A3B8' : '#6B7280';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                document.body.removeChild(container);
            });
            container.appendChild(closeButton);
            
            // 添加滑动方向指示
            const leftArrow = document.createElement('div');
            leftArrow.className = 'absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl opacity-30 cursor-pointer hover:opacity-100 transition-opacity';
            leftArrow.style.color = styleNumber === '3' ? '#94A3B8' : '#6B7280';
            leftArrow.innerHTML = '<i class="fa fa-angle-left"></i>';
            
            const rightArrow = document.createElement('div');
            rightArrow.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 text-2xl opacity-30 cursor-pointer hover:opacity-100 transition-opacity';
            rightArrow.style.color = styleNumber === '3' ? '#94A3B8' : '#6B7280';
            rightArrow.innerHTML = '<i class="fa fa-angle-right"></i>';
            
            // 只有在有多个书签时才显示箭头
            const bookmarks = storage.getBookmarks();
            if (bookmarks.length > 1) {
                container.appendChild(leftArrow);
                container.appendChild(rightArrow);
                
                // 添加点击事件
                leftArrow.addEventListener('click', (e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    const currentIndex = bookmarks.findIndex(b => b.id === bookmarkId);
                    const prevIndex = currentIndex - 1;
                    if (prevIndex >= 0) {
                        const prevBookmark = bookmarks[prevIndex];
                        createNextBookmarkView(prevBookmark.id, container);
                    } else {
                        // 在书签查看页面上显示提示
                        showBookmarkToast(container, '已经是第一页');
                    }
                });
                
                rightArrow.addEventListener('click', (e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    const currentIndex = bookmarks.findIndex(b => b.id === bookmarkId);
                    const nextIndex = currentIndex + 1;
                    if (nextIndex < bookmarks.length) {
                        const nextBookmark = bookmarks[nextIndex];
                        createNextBookmarkView(nextBookmark.id, container);
                    } else {
                        // 在书签查看页面上显示提示
                        showBookmarkToast(container, '已经是最后一页');
                    }
                });
            }
            
            // 添加点击背景关闭功能
            container.addEventListener('click', (e) => {
                if (e.target === container) {
                    document.body.removeChild(container);
                    // 导航回首页
                    app.navigateTo('home-page');
                }
            });
        }
        
        // 在书签查看页面上显示提示信息
        function showBookmarkToast(container, message) {
            // 创建提示元素
            const toast = document.createElement('div');
            toast.className = 'fixed top-1/4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
            toast.style.backgroundColor = styleNumber === '3' ? '#EF4444' : '#F87171';
            toast.style.color = '#FFFFFF';
            toast.style.fontSize = '14px';
            toast.style.fontWeight = '500';
            toast.style.opacity = '0';
            toast.style.zIndex = '60'; // 确保提示在书签查看页面之上
            toast.textContent = message;
            
            // 添加到容器中
            container.appendChild(toast);
            
            // 显示提示
            setTimeout(() => {
                toast.style.opacity = '1';
            }, 10);
            
            // 2秒后隐藏提示
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 2000);
        }
        
        // 创建并显示下一个书签视图
        function createNextBookmarkView(bookmarkId, currentContainer) {
            // 创建新的书签查看容器
            const nextViewContainer = document.createElement('div');
            nextViewContainer.className = 'fixed inset-0 flex items-center justify-center z-50';
            nextViewContainer.id = 'bookmark-view-container';
            nextViewContainer.style.backgroundColor = backgroundColor;
            nextViewContainer.style.opacity = '0';
            nextViewContainer.style.transform = 'translateX(100%)';
            nextViewContainer.style.transition = 'all 0.3s ease-out';
            
            // 复制当前书签卡片的结构，用于快速显示
            const nextContentContainer = contentContainer.cloneNode(true);
            const nextBookmarkCard = bookmarkCard.cloneNode(true);
            
            // 获取下一个书签数据
            const nextBookmark = storage.getBookmark(bookmarkId);
            if (!nextBookmark) return;
            
            // 更新书签数据
            updateBookmarkView(nextBookmarkCard, nextBookmark);
            
            // 组装容器
            nextContentContainer.innerHTML = '';
            nextContentContainer.appendChild(nextBookmarkCard);
            nextViewContainer.appendChild(nextContentContainer);
            
            // 添加到文档
            document.body.appendChild(nextViewContainer);
            
            // 触发重排，然后执行动画
            setTimeout(() => {
                nextViewContainer.style.opacity = '1';
                nextViewContainer.style.transform = 'translateX(0)';
                
                // 动画结束后，移除旧容器并重新初始化新容器
                setTimeout(() => {
                    if (currentContainer && currentContainer.parentNode) {
                        document.body.removeChild(currentContainer);
                    }
                    // 重新初始化新容器的事件监听等
                    initBookmarkView(nextViewContainer, bookmarkId);
                }, 300);
            }, 50);
        }
        
        // 更新书签视图数据
        function updateBookmarkView(card, bookmark) {
            // 格式化日期
            const date = new Date(bookmark.created_at);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            // 获取标签名称
            const tagNames = bookmark.tags.map(tagId => {
                const tag = storage.getTag(tagId);
                return tag ? tag.name : '';
            }).filter(Boolean);
            
            // 更新标题和作者
            const infoContainer = card.querySelector('.flex.justify-between.items-start');
            if (infoContainer) {
                const titleEl = infoContainer.querySelector('h3');
                const authorEl = infoContainer.querySelector('span');
                if (titleEl) titleEl.textContent = bookmark.title;
                if (authorEl) authorEl.textContent = bookmark.author;
            }
            
            // 更新内容
            const textContainer = card.querySelector('.py-6');
            if (textContainer) {
                const contentText = textContainer.querySelector('.text-sm');
                if (contentText) contentText.textContent = bookmark.content;
            }
            
            // 更新标签和日期
            const metaContainer = card.querySelector('.flex.justify-between.items-center');
            if (metaContainer) {
                const tagsContainer = metaContainer.querySelector('.flex.flex-wrap');
                const dateContainer = metaContainer.querySelector('.text-xs');
                
                if (tagsContainer) {
                    tagsContainer.innerHTML = '';
                    tagNames.forEach(name => {
                        const tagEl = document.createElement('span');
                        tagEl.className = 'text-xs px-2 py-0.5';
                        tagEl.style.color = styleNumber === '3' ? '#94A3B8' : '#6B7280';
                        tagEl.textContent = name;
                        tagsContainer.appendChild(tagEl);
                    });
                }
                
                if (dateContainer) {
                    dateContainer.textContent = formattedDate;
                }
            }
        }
        


        // 添加到文档
        document.body.appendChild(viewContainer);

        // 点击背景也可以关闭
        viewContainer.addEventListener('click', (e) => {
            if (e.target === viewContainer) {
                document.body.removeChild(viewContainer);
                // 导航回首页
                app.navigateTo('home-page');
            }
        });
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
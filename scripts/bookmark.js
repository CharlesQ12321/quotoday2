// 书签管理功能

class BookmarkManager {
    constructor() {
        this.init();
    }

    // 初始化
    init() {
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        // 从识别结果填充内容
        document.getElementById('ocr-result')?.addEventListener('DOMNodeInserted', (e) => {
            if (e.target.id === 'recognized-text') {
                setTimeout(() => {
                    const recognizedText = document.getElementById('recognized-text').value;
                    if (recognizedText) {
                        document.getElementById('bookmark-content').value = recognizedText;
                    }
                }, 100);
            }
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
                app.showErrorToast('请填写书名');
                return;
            }
            
            if (!author) {
                app.showErrorToast('请填写作者');
                return;
            }
            
            if (!content) {
                app.showErrorToast('请填写内容');
                return;
            }
            
            // 验证标签
            const tagCount = document.querySelectorAll('#tag-input-area .tag').length;
            if (tagCount === 0) {
                app.showErrorToast('请至少添加一个标签');
                return;
            }
            
            app.showLoading();
            
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
            
            // 只有当line-height元素存在时才获取
            const lineHeightElement = document.getElementById('line-height');
            const lineHeight = lineHeightElement ? lineHeightElement.value : '1.5';
            
            // 创建书签对象
            const bookmark = {
                title,
                author,
                content,
                note,
                tags,
                line_height: parseFloat(lineHeight)
            };
            
            // 如果是编辑模式，添加ID
            if (this.currentEditingId) {
                bookmark.id = this.currentEditingId;
            }
            
            // 保存书签
            storage.saveBookmark(bookmark);
            
            // 更新标签计数
            storage.updateTagCounts();
            
            app.hideLoading();
            
            // 显示成功提示
            const successMessage = this.currentEditingId ? '书签更新成功' : '书签保存成功';
            app.showSuccessToast(successMessage);
            
            // 重置表单
            this.resetForm();
            
            // 清除编辑状态
            this.currentEditingId = null;
            
            // 导航回首页
            setTimeout(() => {
                app.navigateTo('home-page');
                app.renderBookmarks();
                app.renderTags();
            }, 1000);
        } catch (error) {
            console.error('保存书签错误:', error);
            app.hideLoading();
            app.showErrorToast('书签保存失败，请稍后重试');
        }
    }

    // 重置表单
    resetForm() {
        const formFields = [
            'bookmark-content', 'bookmark-note', 'tag-input', 'recognized-text'
        ];
        
        // 清空输入字段
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
            }
        });
        
        // 设置书名和作者的默认值
        const bookTitle = document.getElementById('book-title');
        if (bookTitle) {
            bookTitle.value = '书名';
        }
        
        const bookAuthor = document.getElementById('book-author');
        if (bookAuthor) {
            bookAuthor.value = '作者';
        }
        
        // 清空标签输入区域
        const tagInputArea = document.getElementById('tag-input-area');
        if (tagInputArea) {
            tagInputArea.innerHTML = '';
        }
        
        // 重置文件输入
        const imageInput = document.getElementById('image-input');
        if (imageInput) {
            imageInput.value = '';
        }
        
        // 隐藏预览和OCR区域
        const imagePreview = document.getElementById('image-preview');
        const ocrResult = document.getElementById('ocr-result');
        if (imagePreview) imagePreview.classList.add('hidden');
        if (ocrResult) ocrResult.classList.add('hidden');
        
        // 清除编辑状态
        this.currentEditingId = null;
    }

    // 获取书签预览
    getBookmarkPreview(bookmark) {
        const preview = document.createElement('div');
        preview.className = 'bookmark-preview p-6 rounded-lg';
        
        // 设置默认样式
        preview.style.backgroundColor = '#F9FAFB';
        preview.style.border = '1px solid #E5E7EB';
        
        // 设置行间距
        preview.style.lineHeight = bookmark.line_height;
        
        // 格式化日期
        const date = new Date(bookmark.created_at);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        // 获取标签名称
        const tagNames = bookmark.tags.map(tagId => {
            const tag = storage.getTag(tagId);
            return tag ? tag.name : '';
        }).filter(Boolean);
        
        preview.innerHTML = `
            <h2 class="text-lg font-semibold mb-2">${bookmark.title}</h2>
            <p class="text-sm text-gray-500 mb-4">${bookmark.author}</p>
            <p class="text-sm mb-4">${bookmark.content}</p>
            <div class="flex justify-between items-center text-xs text-gray-500">
                <span>${formattedDate}</span>
            </div>
            ${tagNames.length > 0 ? `<div class="mt-4 flex flex-wrap gap-2">${tagNames.map(name => `<span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">${name}</span>`).join('')}</div>` : ''}
        `;
        
        return preview;
    }

    // 生成书签图片
    generateBookmarkImage(bookmark) {
        const preview = this.getBookmarkPreview(bookmark);
        document.body.appendChild(preview);

        return new Promise((resolve) => {
            html2canvas(preview, {
                scale: 2,
                useCORS: true,
                backgroundColor: null
            }).then(canvas => {
                const imageData = canvas.toDataURL('image/png');
                document.body.removeChild(preview);
                resolve(imageData);
            });
        });
    }

    // 编辑书签
    editBookmark(id) {
        const bookmark = storage.getBookmark(id);
        if (!bookmark) {
            app.showErrorToast('找不到要编辑的书签');
            return;
        }

        // 保存当前编辑的书签ID
        this.currentEditingId = id;

        // 填充表单
        document.getElementById('book-title').value = bookmark.title;
        document.getElementById('book-author').value = bookmark.author;
        document.getElementById('bookmark-content').value = bookmark.content;
        document.getElementById('bookmark-note').value = bookmark.note;
        
        // 填充标签
        const tagInputArea = document.getElementById('tag-input-area');
        tagInputArea.innerHTML = '';
        bookmark.tags.forEach(tagId => {
            const tag = storage.getTag(tagId);
            if (tag) {
                app.addTagToInput(tag.name);
            }
        });
        
        // 只有当line-height元素存在时才设置
        const lineHeightElement = document.getElementById('line-height');
        if (lineHeightElement) {
            lineHeightElement.value = bookmark.line_height;
        }
        
        // 导航到创建页
        app.navigateTo('create-page');
        
        // 延迟执行，确保DOM元素已完全渲染
        setTimeout(() => {
            // 自动调整内容文本框高度
            const contentTextarea = document.getElementById('bookmark-content');
            if (contentTextarea) {
                // 先确保值已设置
                if (contentTextarea.value) {
                    // 强制刷新scrollHeight
                    contentTextarea.style.height = 'auto';
                    // 等待一下让浏览器计算scrollHeight
                    setTimeout(() => {
                        contentTextarea.style.height = Math.min(contentTextarea.scrollHeight, 300) + 'px'; // 限制最大高度为300px
                    }, 50);
                }
            }
        }, 300);
    }

    // 删除书签
    deleteBookmark(id) {
        if (confirm('确定要删除这个书签吗？')) {
            storage.deleteBookmark(id);
            storage.updateTagCounts();
            app.renderBookmarks();
            app.renderTags();
            app.showSuccessToast('书签删除成功');
        }
    }

    // 搜索书签
    searchBookmarks(query) {
        const bookmarks = storage.getBookmarks();
        
        if (!query) {
            app.renderBookmarks();
            return;
        }
        
        const filteredBookmarks = bookmarks.filter(bookmark => {
            const titleMatch = bookmark.title.toLowerCase().includes(query.toLowerCase());
            const contentMatch = bookmark.content.toLowerCase().includes(query.toLowerCase());
            const authorMatch = bookmark.author.toLowerCase().includes(query.toLowerCase());
            
            // 搜索标签
            const tagMatch = bookmark.tags.some(tagId => {
                const tag = storage.getTag(tagId);
                return tag && tag.name.toLowerCase().includes(query.toLowerCase());
            });
            
            return titleMatch || contentMatch || authorMatch || tagMatch;
        });
        
        // 渲染搜索结果
        const bookmarkList = document.getElementById('bookmark-list');
        if (!bookmarkList) return;

        bookmarkList.innerHTML = '';
        
        if (filteredBookmarks.length === 0) {
            bookmarkList.innerHTML = '<div class="text-center py-8 text-gray-500">没有找到匹配的书签</div>';
            return;
        }
        
        filteredBookmarks.forEach(bookmark => {
            const bookmarkEl = document.createElement('div');
            bookmarkEl.className = 'bookmark-item p-4 bg-gray-50 rounded-lg shadow-sm';
            
            // 格式化日期
            const date = new Date(bookmark.created_at);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            // 获取标签名称
            const tagNames = bookmark.tags.map(tagId => {
                const tag = storage.getTag(tagId);
                return tag ? tag.name : '';
            }).filter(Boolean);
            
            // 高亮匹配的文本
            const highlightText = (text, query) => {
                if (!query) return text;
                const regex = new RegExp(`(${query})`, 'gi');
                return text.replace(regex, '<mark class="bg-yellow-200 text-black">$1</mark>');
            };
            
            bookmarkEl.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold">${highlightText(bookmark.title, query)}</h3>
                    <span class="font-semibold text-sm">${highlightText(bookmark.author, query)}</span>
                </div>
                <p class="text-sm text-gray-600 mb-3 bookmark-content transition-all duration-300 overflow-hidden">
                    ${highlightText(bookmark.content, query)}
                </p>
                <div class="flex justify-between items-center mb-3">
                    <div class="flex space-x-1">
                        ${tagNames.map(name => `<span class="text-xs px-2 py-0.5 text-gray-600">${highlightText(name, query)}</span>`).join('')}
                    </div>
                    <span class="text-xs text-gray-500">${formattedDate}</span>
                </div>
                <div class="bookmark-actions hidden grid grid-cols-3 gap-2 mb-2">
                    <button class="action-btn share-btn flex flex-col items-center justify-center p-2" data-id="${bookmark.id}">
                        <i class="fa fa-share-alt text-gray-500 mb-1"></i>
                        <span class="text-xs text-gray-500">分享</span>
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
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.currentTarget.dataset.id;
                shareService.shareBookmark(bookmarkId);
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

    // 按标签过滤书签
    filterBookmarksByTag(tagId) {
        const bookmarks = storage.getBookmarks();
        
        if (tagId === 'all') {
            app.renderBookmarks();
            return;
        }
        
        const filteredBookmarks = bookmarks.filter(bookmark => 
            bookmark.tags.includes(tagId)
        );
        
        // 渲染过滤结果
        const bookmarkList = document.getElementById('bookmark-list');
        if (!bookmarkList) return;

        bookmarkList.innerHTML = '';
        
        if (filteredBookmarks.length === 0) {
            bookmarkList.innerHTML = '<div class="text-center py-8 text-gray-500">没有找到匹配的书签</div>';
            return;
        }
        
        filteredBookmarks.forEach(bookmark => {
            const bookmarkEl = document.createElement('div');
            bookmarkEl.className = 'bookmark-item p-4 bg-gray-50 rounded-lg shadow-sm';
            
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
                        ${tagNames.map(name => `<span class="text-xs px-2 py-0.5 text-gray-600">${name}</span>`).join('')}
                    </div>
                    <span class="text-xs text-gray-500">${formattedDate}</span>
                </div>
                <div class="bookmark-actions hidden grid grid-cols-3 gap-2 mb-2">
                    <button class="action-btn share-btn flex flex-col items-center justify-center p-2" data-id="${bookmark.id}">
                        <i class="fa fa-share-alt text-gray-500 mb-1"></i>
                        <span class="text-xs text-gray-500">分享</span>
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
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookmarkId = e.currentTarget.dataset.id;
                shareService.shareBookmark(bookmarkId);
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
}

// 导出实例
const bookmarkManager = new BookmarkManager();
window.bookmarkManager = bookmarkManager;
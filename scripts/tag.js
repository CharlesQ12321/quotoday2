// 标签管理功能

class TagManager {
    constructor() {
        this.init();
    }

    // 初始化
    init() {
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        // 添加标签按钮
        document.getElementById('add-tag-modal-btn')?.addEventListener('click', () => {
            this.openAddTagModal();
        });

        // 确认添加标签
        document.getElementById('confirm-add-tag')?.addEventListener('click', () => {
            this.addTag();
        });

        // 取消添加标签
        document.getElementById('cancel-add-tag')?.addEventListener('click', () => {
            this.closeAddTagModal();
        });

        // 确认编辑标签
        document.getElementById('confirm-edit-tag')?.addEventListener('click', () => {
            this.updateTag();
        });

        // 取消编辑标签
        document.getElementById('cancel-edit-tag')?.addEventListener('click', () => {
            this.closeEditTagModal();
        });
    }

    // 打开添加标签模态框
    openAddTagModal() {
        const modal = document.getElementById('add-tag-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('new-tag-name').value = '';
        }
    }

    // 关闭添加标签模态框
    closeAddTagModal() {
        const modal = document.getElementById('add-tag-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // 打开编辑标签模态框
    openEditTagModal(id) {
        const tag = storage.getTag(id);
        if (!tag) {
            app.showErrorToast('找不到要编辑的标签');
            return;
        }

        const modal = document.getElementById('edit-tag-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('edit-tag-id').value = id;
            document.getElementById('edit-tag-name').value = tag.name;
        }
    }

    // 关闭编辑标签模态框
    closeEditTagModal() {
        const modal = document.getElementById('edit-tag-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // 添加标签
    addTag() {
        const tagName = document.getElementById('new-tag-name').value.trim();
        if (!tagName) {
            alert('请输入标签名称');
            return;
        }

        // 检查标签是否已存在
        const existingTags = storage.getTags();
        if (existingTags.some(tag => tag.name === tagName)) {
            alert('标签已存在');
            return;
        }

        // 创建新标签
        const newTag = {
            name: tagName
        };

        // 保存标签
        storage.saveTag(newTag);

        // 更新标签计数
        storage.updateTagCounts();

        // 重新渲染标签列表
        app.renderTags();

        // 关闭模态框
        this.closeAddTagModal();

        // 显示成功提示
        app.showSuccessToast('标签添加成功');
    }

    // 编辑标签
    editTag(id) {
        this.openEditTagModal(id);
    }

    // 更新标签
    updateTag() {
        const tagId = document.getElementById('edit-tag-id').value;
        const tagName = document.getElementById('edit-tag-name').value.trim();
        
        if (!tagId || !tagName) {
            app.showErrorToast('请输入标签名称');
            return;
        }

        const tag = storage.getTag(tagId);
        if (!tag) {
            app.showErrorToast('找不到要编辑的标签');
            this.closeEditTagModal();
            return;
        }

        // 检查新名称是否已存在
        const existingTags = storage.getTags();
        if (existingTags.some(t => t.name === tagName && t.id !== tagId)) {
            app.showErrorToast('标签名称已存在');
            return;
        }

        // 更新标签
        tag.name = tagName;
        storage.saveTag(tag);

        // 更新标签计数
        storage.updateTagCounts();

        // 重新渲染标签列表和书签列表
        app.renderTags();
        app.renderBookmarks();

        // 关闭模态框
        this.closeEditTagModal();

        // 显示成功提示
        app.showSuccessToast('标签更新成功');
    }

    // 删除标签
    deleteTag(id) {
        const tag = storage.getTag(id);
        if (!tag) {
            app.showErrorToast('找不到要删除的标签');
            return;
        }

        // 检查标签是否正在使用
        const bookmarks = storage.getBookmarks();
        const usingBookmarks = bookmarks.filter(bookmark => bookmark.tags.includes(id));
        
        let confirmMessage = `确定要删除标签 "${tag.name}" 吗？`;
        if (usingBookmarks.length > 0) {
            confirmMessage += `\n\n此标签正在被 ${usingBookmarks.length} 个书签使用，删除后这些书签将不再包含此标签。`;
        }

        if (confirm(confirmMessage)) {
            try {
                storage.deleteTag(id);

                // 更新标签计数
                storage.updateTagCounts();

                // 重新渲染标签列表和书签列表
                app.renderTags();
                app.renderBookmarks();

                // 显示成功提示
                app.showSuccessToast('标签删除成功');
            } catch (error) {
                console.error('删除标签错误:', error);
                app.showErrorToast('标签删除失败，请稍后重试');
            }
        }
    }

    // 批量删除标签
    deleteMultipleTags(tagIds) {
        if (tagIds.length === 0) return;

        if (confirm(`确定要删除这 ${tagIds.length} 个标签吗？`)) {
            tagIds.forEach(id => {
                storage.deleteTag(id);
            });

            // 更新标签计数
            storage.updateTagCounts();

            // 重新渲染标签列表和书签列表
            app.renderTags();
            app.renderBookmarks();

            // 显示成功提示
            app.showSuccessToast(`成功删除 ${tagIds.length} 个标签`);
        }
    }

    // 获取标签使用统计
    getTagStatistics() {
        const tags = storage.getTags();
        return tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            count: tag.count,
            percentage: 0
        }));
    }

    // 搜索标签
    searchTags(query) {
        const tags = storage.getTags();
        
        if (!query) {
            app.renderTags();
            return;
        }
        
        const filteredTags = tags.filter(tag => 
            tag.name.toLowerCase().includes(query.toLowerCase())
        );
        
        // 渲染搜索结果
        const tagList = document.getElementById('tag-list');
        if (!tagList) return;

        tagList.innerHTML = '';
        
        if (filteredTags.length === 0) {
            tagList.innerHTML = '<div class="text-center py-8 text-gray-500">没有找到匹配的标签</div>';
            return;
        }
        
        filteredTags.forEach(tag => {
            const tagEl = document.createElement('div');
            tagEl.className = 'tag-item flex items-center justify-between p-3 bg-gray-50 rounded-lg';
            
            tagEl.innerHTML = `
                <div class="flex items-center">
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
                this.editTag(tagId);
            });
        });

        document.querySelectorAll('.delete-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tagId = e.currentTarget.dataset.id;
                this.deleteTag(tagId);
            });
        });
    }
}

// 导出实例
const tagManager = new TagManager();
window.tagManager = tagManager;
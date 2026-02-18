// 分享功能

class ShareService {
    constructor() {
        this.init();
    }

    // 初始化
    init() {
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        // 分享按钮
        document.querySelectorAll('.fa-share-alt')?.forEach(btn => {
            btn.parentElement.addEventListener('click', (e) => {
                const bookmarkId = this.getBookmarkIdFromElement(e.currentTarget);
                if (bookmarkId) {
                    this.shareBookmark(bookmarkId);
                }
            });
        });
    }

    // 从元素获取书签ID
    getBookmarkIdFromElement(element) {
        // 查找最近的书签项
        let bookmarkItem = element.closest('.bookmark-item');
        if (bookmarkItem) {
            return bookmarkItem.querySelector('.share-btn')?.dataset.id;
        }
        
        // 从详情页获取
        if (document.getElementById('detail-page').classList.contains('hidden') === false) {
            // 这里可以从详情页的内容推断书签ID，或者在渲染时存储
            return this.currentBookmarkId;
        }
        
        return null;
    }

    // 设置当前书签ID
    setCurrentBookmarkId(id) {
        this.currentBookmarkId = id;
    }

    // 获取当前样式设置
    getCurrentStyle() {
        const settings = storage.getSettings();
        return settings.style || '1';
    }

    // 获取样式配置
    getStyleConfig(styleNumber) {
        const configs = {
            '1': {
                // 简约风格
                backgroundColor: '#FFFFFF',
                fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                titleColor: '#1F2937',
                authorColor: '#1F2937',
                contentColor: '#374151',
                tagColor: '#6B7280',
                dateColor: '#6B7280',
                borderColor: '#E5E7EB',
                brandColor: '#9CA3AF',
                cardBackground: '#FFFFFF'
            },
            '2': {
                // 文艺风格
                backgroundColor: '#FEFDFB',
                fontFamily: "'Georgia', 'Cambria', 'Times New Roman', serif",
                titleColor: '#374151',
                authorColor: '#374151',
                contentColor: '#4B5563',
                tagColor: '#B45309',
                dateColor: '#6B7280',
                borderColor: '#FDE68A',
                brandColor: '#991B1B',
                cardBackground: '#FEF3C7'
            },
            '3': {
                // 暗黑风格
                backgroundColor: '#1E1E1E',
                fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                titleColor: '#FFFFFF',
                authorColor: '#E0E0E0',
                contentColor: '#E0E0E0',
                tagColor: '#60A5FA',
                dateColor: '#909090',
                borderColor: '#3D3D3D',
                brandColor: '#3B82F6',
                cardBackground: '#2D2D2D'
            }
        };
        return configs[styleNumber] || configs['1'];
    }

    // 创建临时书签预览元素 - 使用实际的书签查看功能
    createBookmarkPreviewElement(bookmark) {
        // 获取当前样式配置
        const styleNumber = this.getCurrentStyle();

        // 根据风格设置背景颜色
        let backgroundColor = '#f3f4f6'; // 默认风格1背景
        if (styleNumber === '2') {
            backgroundColor = '#F5F5F4'; // 风格2背景
        } else if (styleNumber === '3') {
            backgroundColor = '#0F172A'; // 风格3背景
        }

        // 创建临时容器（模拟书签查看页面的容器）
        const viewContainer = document.createElement('div');
        viewContainer.id = 'temp-bookmark-preview';
        viewContainer.className = 'fixed inset-0 flex items-center justify-center z-50';
        viewContainer.style.backgroundColor = backgroundColor;
        viewContainer.style.left = '-9999px';
        viewContainer.style.top = '-9999px';

        // 创建书签内容容器
        const contentContainer = document.createElement('div');
        contentContainer.className = 'w-full max-w-2xl p-6';

        // 创建书签卡片
        const bookmarkCard = document.createElement('div');
        bookmarkCard.className = 'p-6 rounded-lg shadow-sm';
        bookmarkCard.style.border = 'none';
        bookmarkCard.style.backgroundColor = styleNumber === '3' ? '#1E293B' : '#FFFFFF';

        // 创建内容包装器，用于垂直居中
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'flex flex-col';
        contentWrapper.style.width = '100%';
        contentWrapper.style.maxWidth = '800px';
        contentWrapper.style.margin = 'auto';

        // 格式化日期
        const date = new Date(bookmark.created_at);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // 获取标签名称
        const tagNames = bookmark.tags.map(tagId => {
            const tag = storage.getTag(tagId);
            return tag ? tag.name : '';
        }).filter(Boolean);

        // 创建标题和作者信息
        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex justify-between items-start mb-4';
        infoContainer.style.color = styleNumber === '3' ? '#F8FAFC' : '#1F2937';
        infoContainer.innerHTML = `
            <h3 class="font-semibold">${bookmark.title}</h3>
            <span class="font-semibold text-sm">${bookmark.author}</span>
        `;

        // 创建内容区域
        const textContainer = document.createElement('div');
        textContainer.className = 'py-6';
        textContainer.style.minHeight = '100px';

        // 创建文本元素
        const contentText = document.createElement('div');
        contentText.className = 'text-sm leading-relaxed';
        contentText.style.color = styleNumber === '3' ? '#F8FAFC' : '#374151';
        contentText.style.whiteSpace = 'pre-wrap';
        contentText.style.wordWrap = 'break-word';
        contentText.textContent = bookmark.content;

        // 创建日期和标签信息
        const metaContainer = document.createElement('div');
        metaContainer.className = 'flex justify-between items-center mt-4';

        // 标签容器
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'flex flex-wrap gap-1';

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
        dateContainer.textContent = formattedDate;

        // 创建品牌标识部分
        const brandContainer = document.createElement('div');
        brandContainer.className = 'mt-6 pt-4';
        brandContainer.style.borderTop = '1px solid ' + (styleNumber === '3' ? '#3D3D3D' : '#E5E7EB');
        brandContainer.style.textAlign = 'center';
        const brandText = document.createElement('div');
        brandText.className = 'text-xs';
        brandText.style.color = styleNumber === '3' ? '#3B82F6' : '#9CA3AF';
        brandText.textContent = '每日一签 · Quotoday';
        brandContainer.appendChild(brandText);

        // 应用用户选定的风格
        const styleLink = document.getElementById('current-style');
        if (styleLink) {
            const styleUrl = styleLink.href;
            const viewStyleLink = document.createElement('link');
            viewStyleLink.rel = 'stylesheet';
            viewStyleLink.href = styleUrl;
            viewContainer.appendChild(viewStyleLink);
        }

        // 组装容器
        contentWrapper.appendChild(infoContainer);
        textContainer.appendChild(contentText);
        contentWrapper.appendChild(textContainer);
        metaContainer.appendChild(tagsContainer);
        metaContainer.appendChild(dateContainer);
        contentWrapper.appendChild(metaContainer);
        contentWrapper.appendChild(brandContainer);
        bookmarkCard.appendChild(contentWrapper);
        contentContainer.appendChild(bookmarkCard);
        viewContainer.appendChild(contentContainer);

        document.body.appendChild(viewContainer);
        return viewContainer;
    }

    // 将书签转换为图片
    async convertBookmarkToImage(bookmark) {
        try {
            app.showLoading();
            
            // 创建临时预览元素
            const previewElement = this.createBookmarkPreviewElement(bookmark);
            
            // 获取书签卡片元素
            const bookmarkCard = previewElement.querySelector('.rounded-lg');
            
            // 使用html2canvas生成图片（只截取书签卡片）
            const canvas = await html2canvas(bookmarkCard, {
                backgroundColor: null,
                scale: 2,
                useCORS: true
            });
            
            // 移除临时元素
            document.body.removeChild(previewElement);
            
            // 转换为Blob
            const blob = await new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/png');
            });
            
            app.hideLoading();
            return blob;
        } catch (error) {
            console.error('生成图片失败:', error);
            app.hideLoading();
            app.showErrorToast('生成图片失败，请稍后重试');
            throw error;
        }
    }

    // 下载图片
    downloadImage(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 显示分享模态框（用于电脑端）
    showShareModal(imageBlob, bookmark) {
        // 移除已存在的模态框
        const existingModal = document.getElementById('share-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const url = URL.createObjectURL(imageBlob);

        const modal = document.createElement('div');
        modal.id = 'share-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-11/12 max-w-md max-h-[90vh] overflow-y-auto">
                <div class="flex justify-end items-center mb-4">
                    <button id="close-share-modal" class="text-gray-400 hover:text-gray-600">
                        <i class="fa fa-times text-xl"></i>
                    </button>
                </div>
                <div class="mb-4">
                    <img src="${url}" alt="书签图片" class="w-full rounded-lg shadow-md">
                </div>
                <div class="space-y-3">
                    <button id="download-image-btn" class="w-full py-3 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition">
                        <i class="fa fa-download mr-2"></i>
                        <span>下载图片</span>
                    </button>
                </div>
                <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-600 text-center">长按图片进行分享</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定关闭事件
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('#close-share-modal')) {
                modal.remove();
                URL.revokeObjectURL(url);
            }
        });

        // 绑定下载按钮事件
        document.getElementById('download-image-btn').addEventListener('click', () => {
            this.downloadImage(imageBlob, `quotoday-${Date.now()}.png`);
            app.showSuccessToast('图片已下载');
        });
    }

    // 从查看页面分享书签
    async shareBookmarkFromView(id, viewContainer) {
        const bookmark = storage.getBookmark(id);
        if (!bookmark) {
            app.showErrorToast('找不到要分享的书签');
            return;
        }

        this.setCurrentBookmarkId(id);

        try {
            // 从查看页面截取书签卡片作为图片
            const imageBlob = await this.convertViewToImage(viewContainer);
            const file = new File([imageBlob], `quotoday-${Date.now()}.png`, { type: 'image/png' });
            
            // 检测是否是移动设备
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            // 检查是否支持Web Share API且支持分享文件
            if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                // 移动端使用系统分享功能，包含图片
                await navigator.share({
                    title: bookmark.title,
                    text: `${bookmark.content} - ${bookmark.author}`,
                    files: [file]
                });
            } else if (isMobile && navigator.share) {
                // 移动端只支持文本分享
                await navigator.share({
                    title: bookmark.title,
                    text: `${bookmark.content} - ${bookmark.author}`,
                    url: window.location.origin
                });
                // 同时提供下载选项
                this.downloadImage(imageBlob, `quotoday-${Date.now()}.png`);
                app.showSuccessToast('图片已保存，请手动分享');
            } else {
                // 电脑端显示分享模态框
                this.showShareModal(imageBlob, bookmark);
            }
        } catch (error) {
            console.error('分享失败:', error);
            // 分享取消不算错误
            if (error.name !== 'AbortError') {
                app.showErrorToast('分享失败，请稍后重试');
            }
        }
    }

    // 将查看页面的书签转换为图片
    async convertViewToImage(viewContainer) {
        try {
            app.showLoading();
            
            // 获取书签卡片元素（不包含分享按钮和品牌标识）
            const bookmarkCard = viewContainer.querySelector('.rounded-lg');
            
            // 临时隐藏分享按钮
            const shareButton = viewContainer.querySelector('.action-btn');
            if (shareButton) {
                shareButton.style.display = 'none';
            }
            
            // 使用html2canvas生成图片
            const canvas = await html2canvas(bookmarkCard, {
                backgroundColor: null,
                scale: 2,
                useCORS: true
            });
            
            // 恢复分享按钮显示
            if (shareButton) {
                shareButton.style.display = '';
            }
            
            // 转换为Blob
            const blob = await new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/png');
            });
            
            app.hideLoading();
            return blob;
        } catch (error) {
            console.error('生成图片失败:', error);
            app.hideLoading();
            app.showErrorToast('生成图片失败，请稍后重试');
            throw error;
        }
    }

    // 分享书签
    async shareBookmark(id) {
        const bookmark = storage.getBookmark(id);
        if (!bookmark) {
            app.showErrorToast('找不到要分享的书签');
            return;
        }

        this.setCurrentBookmarkId(id);

        try {
            // 首先生成图片
            const imageBlob = await this.convertBookmarkToImage(bookmark);
            const file = new File([imageBlob], `quotoday-${Date.now()}.png`, { type: 'image/png' });
            
            // 检测是否是移动设备
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            // 检查是否支持Web Share API且支持分享文件
            if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                // 移动端使用系统分享功能，包含图片
                await navigator.share({
                    title: bookmark.title,
                    text: `${bookmark.content} - ${bookmark.author}`,
                    files: [file]
                });
            } else if (isMobile && navigator.share) {
                // 移动端只支持文本分享
                await navigator.share({
                    title: bookmark.title,
                    text: `${bookmark.content} - ${bookmark.author}`,
                    url: window.location.origin
                });
                // 同时提供下载选项
                this.downloadImage(imageBlob, `quotoday-${Date.now()}.png`);
                app.showSuccessToast('图片已保存，请手动分享');
            } else {
                // 电脑端显示分享模态框
                this.showShareModal(imageBlob, bookmark);
            }
        } catch (error) {
            console.error('分享失败:', error);
            // 分享取消不算错误
            if (error.name !== 'AbortError') {
                app.showErrorToast('分享失败，请稍后重试');
            }
        }
    }
}

// 导出实例
const shareService = new ShareService();
window.shareService = shareService;

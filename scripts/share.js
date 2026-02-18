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

    // 创建临时书签预览元素 - 样式与书签查看详情页一致
    createBookmarkPreviewElement(bookmark) {
        // 格式化日期
        const date = new Date(bookmark.created_at);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        // 获取标签名称
        const tagNames = bookmark.tags.map(tagId => {
            const tag = storage.getTag(tagId);
            return tag ? tag.name : '';
        }).filter(Boolean);

        // 创建临时容器 - 仅包含书签内容，无外围空白
        const container = document.createElement('div');
        container.id = 'temp-bookmark-preview';
        container.style.cssText = `
            position: fixed;
            left: -9999px;
            top: -9999px;
            width: 700px;
            background-color: #FFFFFF;
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 32px;
        `;

        container.innerHTML = `
            <!-- 标题和作者 - 左右分布 -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
                <div style="font-size: 20px; font-weight: 700; color: #1F2937; line-height: 1.4;">${bookmark.title}</div>
                <div style="font-size: 16px; font-weight: 600; color: #1F2937; line-height: 1.4; text-align: right;">${bookmark.author}</div>
            </div>
            
            <!-- 内容区域 - 居中对齐 -->
            <div style="font-size: 18px; color: #374151; line-height: 1.8; margin-bottom: 48px; text-align: center; padding: 20px 0;">
                ${bookmark.content}
            </div>
            
            <!-- 底部区域 - 标签和日期左右分布 -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${tagNames.map(name => `
                        <span style="font-size: 14px; color: #6B7280;">${name}</span>
                    `).join('')}
                </div>
                <div style="font-size: 14px; color: #6B7280;">${formattedDate}</div>
            </div>
            
            <!-- 分隔线和品牌标识 -->
            <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; text-align: center;">
                <div style="font-size: 14px; color: #9CA3AF;">每日一签 · Quotoday</div>
            </div>
        `;

        document.body.appendChild(container);
        return container;
    }

    // 将书签转换为图片
    async convertBookmarkToImage(bookmark) {
        try {
            app.showLoading();
            
            // 创建临时预览元素
            const previewElement = this.createBookmarkPreviewElement(bookmark);
            
            // 使用html2canvas生成图片
            const canvas = await html2canvas(previewElement, {
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
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">分享书签</h3>
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
                    <button id="copy-text-btn" class="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                        <i class="fa fa-copy mr-2"></i>
                        <span>复制文字内容</span>
                    </button>
                </div>
                <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-600 text-center">提示：下载图片后，您可以手动分享到微信、QQ等应用</p>
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

        // 绑定复制文字按钮事件
        document.getElementById('copy-text-btn').addEventListener('click', async () => {
            const text = `${bookmark.title}\n${bookmark.author}\n\n${bookmark.content}`;
            try {
                await navigator.clipboard.writeText(text);
                app.showSuccessToast('文字已复制到剪贴板');
            } catch (err) {
                // 降级方案
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                app.showSuccessToast('文字已复制到剪贴板');
            }
        });
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

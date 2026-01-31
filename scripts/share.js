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
            return bookmarkItem.querySelector('.view-detail')?.dataset.id;
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

    // 分享书签
    async shareBookmark(id) {
        const bookmark = storage.getBookmark(id);
        if (!bookmark) {
            app.showErrorToast('找不到要分享的书签');
            return;
        }

        this.setCurrentBookmarkId(id);

        try {
            // 显示加载状态
            app.showLoading();
            
            // 生成书签图片
            const imageData = await bookmarkManager.generateBookmarkImage(bookmark);
            
            app.hideLoading();
            
            // 检查是否支持Web Share API
            if (navigator.share) {
                this.shareWithWebShare(imageData, bookmark);
            } else {
                this.shareWithFallback(imageData, bookmark);
            }
        } catch (error) {
            console.error('分享失败:', error);
            app.hideLoading();
            app.showErrorToast('分享失败，请稍后重试');
        }
    }

    // 使用Web Share API分享
    shareWithWebShare(imageData, bookmark) {
        // 由于Web Share API不支持直接分享base64图片，我们需要先下载图片
        this.downloadImage(imageData, `bookmark-${bookmark.id}.png`).then(() => {
            alert('图片已下载，请手动分享');
        });
    }

    // 分享回退方案
    shareWithFallback(imageData, bookmark) {
        // 显示分享选项
        this.showShareOptions(imageData, bookmark);
    }

    // 显示分享选项
    showShareOptions(imageData, bookmark) {
        const shareOptions = document.createElement('div');
        shareOptions.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        shareOptions.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-4/5 max-w-sm">
                <h3 class="text-lg font-bold mb-4">分享书签</h3>
                <div class="space-y-3 mb-6">
                    <button class="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <span class="flex items-center">
                            <i class="fa fa-download text-gray-600 mr-3"></i>
                            <span>下载图片</span>
                        </span>
                        <i class="fa fa-arrow-right text-gray-400"></i>
                    </button>
                    <button class="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <span class="flex items-center">
                            <i class="fa fa-copy text-gray-600 mr-3"></i>
                            <span>复制链接</span>
                        </span>
                        <i class="fa fa-arrow-right text-gray-400"></i>
                    </button>
                    <button class="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <span class="flex items-center">
                            <i class="fa fa-clipboard text-gray-600 mr-3"></i>
                            <span>复制内容</span>
                        </span>
                        <i class="fa fa-arrow-right text-gray-400"></i>
                    </button>
                    <button class="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <span class="flex items-center">
                            <i class="fa fa-file-pdf-o text-red-600 mr-3"></i>
                            <span>导出为PDF</span>
                        </span>
                        <i class="fa fa-arrow-right text-gray-400"></i>
                    </button>
                    <button class="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <span class="flex items-center">
                            <i class="fa fa-file-text-o text-blue-600 mr-3"></i>
                            <span>导出为文本</span>
                        </span>
                        <i class="fa fa-arrow-right text-gray-400"></i>
                    </button>
                    <button class="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <span class="flex items-center">
                            <i class="fa fa-file-code-o text-green-600 mr-3"></i>
                            <span>导出为JSON</span>
                        </span>
                        <i class="fa fa-arrow-right text-gray-400"></i>
                    </button>
                </div>
                <button class="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-medium close-share hover:bg-gray-300 transition-colors">
                    取消
                </button>
            </div>
        `;
        
        document.body.appendChild(shareOptions);

        // 绑定事件
        shareOptions.querySelector('.close-share').addEventListener('click', () => {
            document.body.removeChild(shareOptions);
        });

        // 下载图片
        shareOptions.querySelectorAll('button')[0].addEventListener('click', () => {
            this.downloadImage(imageData, `bookmark-${bookmark.id}.png`);
            document.body.removeChild(shareOptions);
            app.showSuccessToast('图片已下载');
        });

        // 复制链接
        shareOptions.querySelectorAll('button')[1].addEventListener('click', () => {
            this.copyLink(bookmark);
            document.body.removeChild(shareOptions);
            app.showSuccessToast('链接已复制');
        });

        // 复制内容
        shareOptions.querySelectorAll('button')[2].addEventListener('click', () => {
            this.copyContent(bookmark);
            document.body.removeChild(shareOptions);
            app.showSuccessToast('内容已复制');
        });

        // 导出为PDF
        shareOptions.querySelectorAll('button')[3].addEventListener('click', () => {
            this.exportToPDF(bookmark);
            document.body.removeChild(shareOptions);
        });

        // 导出为文本
        shareOptions.querySelectorAll('button')[4].addEventListener('click', () => {
            this.exportToText(bookmark);
            document.body.removeChild(shareOptions);
        });

        // 导出为JSON
        shareOptions.querySelectorAll('button')[5].addEventListener('click', () => {
            this.exportToJSON(bookmark);
            document.body.removeChild(shareOptions);
        });
    }

    // 下载图片
    downloadImage(imageData, filename) {
        return new Promise((resolve) => {
            const link = document.createElement('a');
            link.href = imageData;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            resolve();
        });
    }

    // 复制链接
    copyLink(bookmark) {
        // 创建一个分享链接
        const shareLink = `${window.location.origin}${window.location.pathname}?bookmark=${bookmark.id}`;
        this.copyToClipboard(shareLink);
    }

    // 复制内容
    copyContent(bookmark) {
        const content = `${bookmark.title}\n${bookmark.author}\n\n${bookmark.content}\n\n第 ${bookmark.page} 页`;
        this.copyToClipboard(content);
    }

    // 复制到剪贴板
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(err => {
                console.error('复制失败:', err);
                this.fallbackCopyTextToClipboard(text);
            });
        } else {
            this.fallbackCopyTextToClipboard(text);
        }
    }

    // 回退复制方法
    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('复制失败:', err);
        }

        document.body.removeChild(textArea);
    }

    // 生成分享图片
    generateShareImage(bookmark) {
        return bookmarkManager.generateBookmarkImage(bookmark);
    }

    // 导出为PDF
    exportToPDF(bookmark) {
        // 这里可以使用jsPDF等库实现
        alert('PDF导出功能开发中');
    }

    // 导出为文本
    exportToText(bookmark) {
        const content = `${bookmark.title}\n${bookmark.author}\n\n${bookmark.content}\n\n第 ${bookmark.page} 页\n\n创建时间: ${new Date(bookmark.created_at).toLocaleString()}`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bookmark-${bookmark.id}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        app.showSuccessToast('文本已导出');
    }

    // 导出为JSON
    exportToJSON(bookmark) {
        const bookmarkData = {
            ...bookmark,
            export_date: new Date().toISOString()
        };
        
        const content = JSON.stringify(bookmarkData, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bookmark-${bookmark.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        app.showSuccessToast('JSON已导出');
    }
}

// 导出实例
const shareService = new ShareService();
window.shareService = shareService;
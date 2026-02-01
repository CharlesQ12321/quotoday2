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

    // 分享书签
    async shareBookmark(id) {
        const bookmark = storage.getBookmark(id);
        if (!bookmark) {
            app.showErrorToast('找不到要分享的书签');
            return;
        }

        this.setCurrentBookmarkId(id);

        try {
            // 检查是否支持Web Share API
            if (navigator.share) {
                // 直接调用原生分享功能
                await navigator.share({
                    title: bookmark.title,
                    text: `${bookmark.content} - ${bookmark.author}`,
                    url: window.location.origin
                });
            } else {
                // 显示不支持分享的提示
                app.showErrorToast('您的设备不支持分享功能');
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
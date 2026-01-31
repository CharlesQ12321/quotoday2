// 图片编辑功能

class ImageEditor {
    constructor() {
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
        this.startX = 0;
        this.startY = 0;
        this.startWidth = 0;
        this.startHeight = 0;
        this.startLeft = 0;
        this.startTop = 0;
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        const cropArea = document.getElementById('crop-area');
        const previewImg = document.getElementById('preview-img');
        
        if (!cropArea || !previewImg) return;

        // 拖动裁剪区域
        cropArea.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('resize-handle')) {
                this.startDrag(e);
            }
        });

        document.addEventListener('mousemove', (e) => {
            this.handleDrag(e);
        });

        document.addEventListener('mouseup', () => {
            this.stopDrag();
        });

        // 触摸事件支持
        cropArea.addEventListener('touchstart', (e) => {
            if (!e.target.classList.contains('resize-handle')) {
                this.startDrag(e.touches[0]);
            }
        });

        document.addEventListener('touchmove', (e) => {
            this.handleDrag(e.touches[0]);
        });

        document.addEventListener('touchend', () => {
            this.stopDrag();
        });

        // 添加调整手柄
        this.addResizeHandles();
    }

    // 添加调整手柄
    addResizeHandles() {
        const cropArea = document.getElementById('crop-area');
        if (!cropArea) return;

        // 清除现有手柄
        cropArea.querySelectorAll('.resize-handle').forEach(handle => handle.remove());

        // 创建四个角的调整手柄
        const handles = [
            { className: 'resize-handle top-left', style: 'top: -4px; left: -4px; cursor: nwse-resize;' },
            { className: 'resize-handle top-right', style: 'top: -4px; right: -4px; cursor: nesw-resize;' },
            { className: 'resize-handle bottom-left', style: 'bottom: -4px; left: -4px; cursor: nesw-resize;' },
            { className: 'resize-handle bottom-right', style: 'bottom: -4px; right: -4px; cursor: nwse-resize;' }
        ];

        handles.forEach(handleConfig => {
            const handle = document.createElement('div');
            handle.className = handleConfig.className;
            handle.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background-color: #3B82F6;
                border: 2px solid white;
                border-radius: 50%;
                ${handleConfig.style}
                z-index: 10;
            `;
            cropArea.appendChild(handle);

            // 绑定调整事件
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.startResize(e, handleConfig.className);
            });

            handle.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                this.startResize(e.touches[0], handleConfig.className);
            });
        });
    }

    // 开始拖动
    startDrag(e) {
        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        
        const cropArea = document.getElementById('crop-area');
        const previewImg = document.getElementById('preview-img');
        
        if (cropArea && previewImg) {
            const cropRect = cropArea.getBoundingClientRect();
            const imgRect = previewImg.getBoundingClientRect();
            
            this.startLeft = cropRect.left - imgRect.left;
            this.startTop = cropRect.top - imgRect.top;
        }
    }

    // 处理拖动
    handleDrag(e) {
        if (!this.isDragging && !this.isResizing) return;

        const cropArea = document.getElementById('crop-area');
        const previewImg = document.getElementById('preview-img');
        
        if (!cropArea || !previewImg) return;

        const imgRect = previewImg.getBoundingClientRect();
        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;

        if (this.isDragging) {
            // 计算新位置
            let newLeft = this.startLeft + deltaX;
            let newTop = this.startTop + deltaY;

            // 限制在图片范围内
            const cropRect = cropArea.getBoundingClientRect();
            const cropWidth = cropRect.width;
            const cropHeight = cropRect.height;

            newLeft = Math.max(0, Math.min(newLeft, imgRect.width - cropWidth));
            newTop = Math.max(0, Math.min(newTop, imgRect.height - cropHeight));

            // 更新位置
            cropArea.style.left = `${newLeft}px`;
            cropArea.style.top = `${newTop}px`;
        } else if (this.isResizing) {
            this.handleResize(e, deltaX, deltaY);
        }
    }

    // 停止拖动
    stopDrag() {
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }

    // 开始调整大小
    startResize(e, handle) {
        this.isResizing = true;
        this.resizeHandle = handle;
        this.startX = e.clientX;
        this.startY = e.clientY;
        
        const cropArea = document.getElementById('crop-area');
        if (cropArea) {
            const cropRect = cropArea.getBoundingClientRect();
            this.startWidth = cropRect.width;
            this.startHeight = cropRect.height;
            this.startLeft = cropArea.offsetLeft;
            this.startTop = cropArea.offsetTop;
        }
    }

    // 处理调整大小
    handleResize(e, deltaX, deltaY) {
        if (!this.isResizing || !this.resizeHandle) return;

        const cropArea = document.getElementById('crop-area');
        const previewImg = document.getElementById('preview-img');
        
        if (!cropArea || !previewImg) return;

        const imgRect = previewImg.getBoundingClientRect();
        let newWidth = this.startWidth;
        let newHeight = this.startHeight;
        let newLeft = this.startLeft;
        let newTop = this.startTop;

        // 根据调整手柄的位置计算新的大小和位置
        switch (this.resizeHandle) {
            case 'resize-handle top-left':
                newWidth = Math.max(50, this.startWidth - deltaX);
                newHeight = Math.max(50, this.startHeight - deltaY);
                newLeft = Math.min(this.startLeft + deltaX, imgRect.width - newWidth);
                newTop = Math.min(this.startTop + deltaY, imgRect.height - newHeight);
                break;
            case 'resize-handle top-right':
                newWidth = Math.max(50, this.startWidth + deltaX);
                newHeight = Math.max(50, this.startHeight - deltaY);
                newTop = Math.min(this.startTop + deltaY, imgRect.height - newHeight);
                break;
            case 'resize-handle bottom-left':
                newWidth = Math.max(50, this.startWidth - deltaX);
                newHeight = Math.max(50, this.startHeight + deltaY);
                newLeft = Math.min(this.startLeft + deltaX, imgRect.width - newWidth);
                break;
            case 'resize-handle bottom-right':
                newWidth = Math.max(50, this.startWidth + deltaX);
                newHeight = Math.max(50, this.startHeight + deltaY);
                break;
        }

        // 限制在图片范围内
        newLeft = Math.max(0, newLeft);
        newTop = Math.max(0, newTop);
        newWidth = Math.min(newWidth, imgRect.width - newLeft);
        newHeight = Math.min(newHeight, imgRect.height - newTop);

        // 更新大小和位置
        cropArea.style.width = `${newWidth}px`;
        cropArea.style.height = `${newHeight}px`;
        cropArea.style.left = `${newLeft}px`;
        cropArea.style.top = `${newTop}px`;
    }

    // 旋转图片
    rotateImage() {
        const previewImg = document.getElementById('preview-img');
        if (!previewImg) return;

        let currentRotation = parseInt(previewImg.style.transform.replace('rotate(', '').replace('deg)', '')) || 0;
        currentRotation += 90;
        if (currentRotation >= 360) {
            currentRotation = 0;
        }

        previewImg.style.transform = `rotate(${currentRotation}deg)`;
        
        // 更新旋转角度显示
        const rotationIndicator = document.getElementById('rotation-indicator');
        if (rotationIndicator) {
            rotationIndicator.textContent = `${currentRotation}°`;
        }
        
        // 调整图片大小以适应容器
        setTimeout(() => {
            this.adjustImageSize(previewImg);
        }, 100);
    }

    // 调整图片大小以适应容器
    adjustImageSize(img) {
        const container = img.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        const widthRatio = containerWidth / imgWidth;
        const heightRatio = containerHeight / imgHeight;
        const ratio = Math.min(widthRatio, heightRatio);

        img.style.width = `${imgWidth * ratio}px`;
        img.style.height = `${imgHeight * ratio}px`;
    }

    // 获取裁剪区域
    getCropArea() {
        const cropArea = document.getElementById('crop-area');
        const previewImg = document.getElementById('preview-img');
        
        if (!cropArea || !previewImg) return null;

        const cropRect = cropArea.getBoundingClientRect();
        const imgRect = previewImg.getBoundingClientRect();

        return {
            x: cropRect.left - imgRect.left,
            y: cropRect.top - imgRect.top,
            width: cropRect.width,
            height: cropRect.height
        };
    }

    // 裁剪图片
    cropImage() {
        const cropArea = this.getCropArea();
        const previewImg = document.getElementById('preview-img');
        
        if (!cropArea || !previewImg) return null;

        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            img.onload = () => {
                // 计算裁剪比例
                const scaleX = img.width / previewImg.clientWidth;
                const scaleY = img.height / previewImg.clientHeight;

                canvas.width = cropArea.width * scaleX;
                canvas.height = cropArea.height * scaleY;

                // 裁剪图片
                ctx.drawImage(
                    img,
                    cropArea.x * scaleX,
                    cropArea.y * scaleY,
                    cropArea.width * scaleX,
                    cropArea.height * scaleY,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                // 返回裁剪后的图片数据
                resolve(canvas.toDataURL('image/jpeg'));
            };
            img.src = previewImg.src;
        });
    }
}

// 导出实例
const imageEditor = new ImageEditor();
window.imageEditor = imageEditor;
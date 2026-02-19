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
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (this.isResizing) {
                e.preventDefault();
            }
            this.handleDrag(e.touches[0]);
        }, { passive: false });

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

        // 创建四个角和四条边的调整手柄
        const handles = [
            // 四个角
            { className: 'resize-handle top-left', style: 'top: -8px; left: -8px; cursor: nwse-resize;' },
            { className: 'resize-handle top-right', style: 'top: -8px; right: -8px; cursor: nesw-resize;' },
            { className: 'resize-handle bottom-left', style: 'bottom: -8px; left: -8px; cursor: nesw-resize;' },
            { className: 'resize-handle bottom-right', style: 'bottom: -8px; right: -8px; cursor: nwse-resize;' },
            // 四条边
            { className: 'resize-handle top', style: 'top: -8px; left: 50%; transform: translateX(-50%); cursor: ns-resize;' },
            { className: 'resize-handle bottom', style: 'bottom: -8px; left: 50%; transform: translateX(-50%); cursor: ns-resize;' },
            { className: 'resize-handle left', style: 'left: -8px; top: 50%; transform: translateY(-50%); cursor: ew-resize;' },
            { className: 'resize-handle right', style: 'right: -8px; top: 50%; transform: translateY(-50%); cursor: ew-resize;' }
        ];

        handles.forEach(handleConfig => {
            const handle = document.createElement('div');
            handle.className = handleConfig.className;
            handle.style.cssText = `
                position: absolute;
                width: 16px;
                height: 16px;
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

        // 如果正在调整大小，不执行拖动
        if (this.isResizing) {
            this.handleResize(e, deltaX, deltaY);
            return;
        }

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
            case 'resize-handle top':
                newHeight = Math.max(50, this.startHeight - deltaY);
                newTop = Math.min(this.startTop + deltaY, imgRect.height - newHeight);
                break;
            case 'resize-handle bottom':
                newHeight = Math.max(50, this.startHeight + deltaY);
                break;
            case 'resize-handle left':
                newWidth = Math.max(50, this.startWidth - deltaX);
                newLeft = Math.min(this.startLeft + deltaX, imgRect.width - newWidth);
                break;
            case 'resize-handle right':
                newWidth = Math.max(50, this.startWidth + deltaX);
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

                // 压缩图片
                const compressedData = this.compressImage(canvas);
                
                // 返回裁剪后的图片数据
                resolve(compressedData);
            };
            img.src = previewImg.src;
        });
    }

    // 压缩图片
    compressImage(canvas) {
        // 设置压缩质量（0-1之间，值越大质量越高）
        const quality = 0.7;
        
        // 获取压缩后的图片数据
        const compressedData = canvas.toDataURL('image/jpeg', quality);
        
        return compressedData;
    }

    // 压缩上传的图片
    compressUploadedImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // 创建Canvas元素
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // 计算压缩后的尺寸
                    const maxWidth = 1200;
                    const maxHeight = 1200;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                    
                    // 设置Canvas尺寸
                    canvas.width = width;
                    canvas.height = height;
                    
                    // 绘制压缩后的图片
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // 压缩图片
                    const compressedData = this.compressImage(canvas);
                    resolve(compressedData);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
}

// 导出实例
const imageEditor = new ImageEditor();
window.imageEditor = imageEditor;
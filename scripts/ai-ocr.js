// AI文字识别功能实现

class AIOCR {
    constructor() {
        // GLM-4.6V API配置
        this.apiConfig = {
            endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', // GLM-4.6V API端点
            apiKey: 'd54dc5bab2624d67b0525a82958b7ca9.F5u7mVKLCD5NHQt5', // API Key
            model: 'glm-4.6v' // GLM-4.6V模型
        };
    }

    // 识别图片中的文字
    async recognizeText(imageData) {
        console.log('Step 1: Processing image data...');
        console.log('Image data length:', imageData.length);

        // 显示加载提示
        this.showLoading('正在识别文字...');

        try {
            // 转换图片数据为base64
            const base64Image = this.imageDataToBase64(imageData);
            console.log('Step 2: Converted image to base64');
            console.log('Base64 image length:', base64Image.length);

            // 构建API请求体
            const requestBody = JSON.stringify({
                model: this.apiConfig.model,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            },
                            {
                                type: "text",
                                text: "请仔细识别图片中的所有文字，包括大小、颜色、字体不同的文字，返回识别到的完整文字内容。不要添加任何解释或说明，只返回文字内容，保持原文的格式和排版。"
                            }
                        ]
                    }
                ],
                thinking: {
                    type: "enabled"
                }
            });

            console.log('Step 3: Built API request');

            // 调用API
            console.log('Step 4: Sending API request to:', this.apiConfig.endpoint);
            const response = await fetch(this.apiConfig.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiConfig.apiKey}`
                },
                body: requestBody
            });

            console.log('Step 5: Received API response');
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
            }

            // 解析响应
            const result = await response.json();
            console.log('Step 6: Parsed API response');

            let text = '';
            if (result.choices && result.choices.length > 0) {
                text = result.choices[0].message.content;
                console.log('Step 7: Extracted text from response');
                console.log('Recognized text:', text);
            }

            // 对识别结果进行后处理
            text = this.postProcess(text);
            console.log('Step 8: Post-processed text');
            console.log('Post-processed text:', text);

            // 隐藏加载提示
            this.hideLoading();

            return {
                success: true,
                text: text
            };
        } catch (error) {
            console.error('OCR error:', error);
            // 隐藏加载提示
            this.hideLoading();
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 将图片数据转换为base64
    imageDataToBase64(imageData) {
        // 如果已经是base64格式，直接返回
        if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
            return imageData.split(',')[1];
        }
        
        // 否则返回空字符串
        return '';
    }

    // 对识别结果进行后处理
    postProcess(text) {
        // 去除多余的空白字符
        text = text.trim();
        
        // 修复常见的字符错误
        const fixes = {
            '，': ',',
            '。': '.',
            '！': '!',
            '？': '?',
            '；': ';',
            '：': ':',
            '“': '"',
            '”': '"',
            '‘': "'",
            '’': "'",
            '（': '(',
            '）': ')',
            '【': '[',
            '】': ']',
            '《': '<',
            '》': '>'
        };

        Object.entries(fixes).forEach(([key, value]) => {
            text = text.replace(new RegExp(key, 'g'), value);
        });

        return text;
    }

    // 显示加载提示
    showLoading(message = '处理中...') {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.querySelector('span').textContent = message;
            loading.classList.remove('hidden');
        }
    }

    // 隐藏加载提示
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    // 处理图片
    processImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    }
}

// 导出实例
const aiOCR = new AIOCR();
window.aiOCR = aiOCR;
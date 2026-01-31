// 文字识别模拟功能

class OCRService {
    constructor() {
        this.apiUrl = 'https://api.example.com/ocr'; // 模拟API地址
    }

    // 模拟文字识别
    async recognizeText(imageData) {
        // 显示加载提示
        this.showLoading('正在识别文字...');

        // 模拟API调用延迟
        return new Promise((resolve) => {
            setTimeout(() => {
                // 隐藏加载提示
                this.hideLoading();

                // 模拟识别结果
                const mockResults = [
                    '正是因为大规模的人类合作是以虚构的故事为基础，只要改变所讲的故事，就能改变人类合作的方式。',
                    '真正重要的东西，用眼睛是看不见的，只有用心才能看见。',
                    '我们坚持一件事情，并不是因为这样做了会有效果，而是坚信，这样做是对的。',
                    '人生就像一盒巧克力，你永远不知道下一块会是什么味道。',
                    '成功是一个过程，不是终点，所以只要我们在前进，就应该为此感到自豪。'
                ];

                // 随机选择一个结果
                const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
                
                resolve({
                    success: true,
                    text: randomResult
                });
            }, 2000);
        });
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

    // 优化识别结果
    optimizeResult(text) {
        // 去除多余的空白字符
        text = text.trim();
        
        // 修复常见的识别错误
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
}

// 导出实例
const ocrService = new OCRService();
window.ocrService = ocrService;
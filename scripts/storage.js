// 本地存储管理

class StorageManager {
    constructor() {
        this.BOOKMARKS_KEY = 'quotoday_bookmarks';
        this.TAGS_KEY = 'quotoday_tags';
        this.SETTINGS_KEY = 'quotoday_settings';
    }

    // 初始化存储
    init() {
        this.initializeDefaultData();
    }

    // 初始化默认数据
    initializeDefaultData() {
        // 初始化书签
        if (!localStorage.getItem(this.BOOKMARKS_KEY)) {
            const defaultBookmarks = [
                {
                    id: '1',
                    title: '人类简史',
                    author: '尤瓦尔·赫拉利',
                    page: '123',
                    content: '正是因为大规模的人类合作是以虚构的故事为基础，只要改变所讲的故事，就能改变人类合作的方式。',
                    note: '这段话说得很有道理，人类的合作确实建立在共同的信念之上。',
                    tags: ['读书笔记'],
                    created_at: new Date().toISOString(),
                    template: '1',
                    font_size: 16,
                    line_height: 1.5
                },
                {
                    id: '2',
                    title: '小王子',
                    author: '安托万·德·圣-埃克苏佩里',
                    page: '67',
                    content: '真正重要的东西，用眼睛是看不见的，只有用心才能看见。',
                    note: '经典名言，值得深思。',
                    tags: ['名言'],
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    template: '1',
                    font_size: 16,
                    line_height: 1.5
                }
            ];
            localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(defaultBookmarks));
        }

        // 初始化标签
        if (!localStorage.getItem(this.TAGS_KEY)) {
            const defaultTags = [
                {
                    id: '1',
                    name: '读书笔记',
                    count: 1
                },
                {
                    id: '2',
                    name: '名言',
                    count: 1
                },
                {
                    id: '3',
                    name: '感悟',
                    count: 0
                },
                {
                    id: '4',
                    name: '学习',
                    count: 0
                }
            ];
            localStorage.setItem(this.TAGS_KEY, JSON.stringify(defaultTags));
        }

        // 初始化设置
        if (!localStorage.getItem(this.SETTINGS_KEY)) {
            const defaultSettings = {
                style: '1',
                default_template: '1',
                default_font_size: 16,
                default_line_height: 1.5
            };
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(defaultSettings));
        }
    }

    // 获取所有书签
    getBookmarks() {
        const bookmarks = localStorage.getItem(this.BOOKMARKS_KEY);
        return bookmarks ? JSON.parse(bookmarks) : [];
    }

    // 获取单个书签
    getBookmark(id) {
        const bookmarks = this.getBookmarks();
        return bookmarks.find(bookmark => bookmark.id === id);
    }

    // 保存书签
    saveBookmark(bookmark) {
        const bookmarks = this.getBookmarks();
        const index = bookmarks.findIndex(b => b.id === bookmark.id);

        if (index !== -1) {
            // 更新现有书签
            bookmarks[index] = { ...bookmarks[index], ...bookmark };
        } else {
            // 添加新书签
            const newBookmark = {
                id: Date.now().toString(),
                created_at: new Date().toISOString(),
                ...bookmark
            };
            bookmarks.push(newBookmark);
        }

        localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(bookmarks));
        return bookmarks;
    }

    // 删除书签
    deleteBookmark(id) {
        const bookmarks = this.getBookmarks();
        const filteredBookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
        localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(filteredBookmarks));
        return filteredBookmarks;
    }

    // 获取所有标签
    getTags() {
        const tags = localStorage.getItem(this.TAGS_KEY);
        return tags ? JSON.parse(tags) : [];
    }

    // 获取单个标签
    getTag(id) {
        const tags = this.getTags();
        return tags.find(tag => tag.id === id);
    }

    // 保存标签
    saveTag(tag) {
        const tags = this.getTags();
        const index = tags.findIndex(t => t.id === tag.id);

        if (index !== -1) {
            // 更新现有标签
            tags[index] = { ...tags[index], ...tag };
        } else {
            // 添加新标签
            const newTag = {
                id: Date.now().toString(),
                count: 0,
                ...tag
            };
            tags.push(newTag);
        }

        localStorage.setItem(this.TAGS_KEY, JSON.stringify(tags));
        return tags;
    }

    // 删除标签
    deleteTag(id) {
        const tags = this.getTags();
        const filteredTags = tags.filter(tag => tag.id !== id);
        localStorage.setItem(this.TAGS_KEY, JSON.stringify(filteredTags));
        
        // 从所有书签中移除该标签
        const bookmarks = this.getBookmarks();
        const updatedBookmarks = bookmarks.map(bookmark => ({
            ...bookmark,
            tags: bookmark.tags.filter(tagId => tagId !== id)
        }));
        localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
        
        return filteredTags;
    }

    // 更新标签使用计数
    updateTagCounts() {
        const bookmarks = this.getBookmarks();
        const tags = this.getTags();
        
        // 重置所有标签计数
        const resetTags = tags.map(tag => ({
            ...tag,
            count: 0
        }));
        
        // 计算每个标签的使用次数
        bookmarks.forEach(bookmark => {
            bookmark.tags.forEach(tagId => {
                const tagIndex = resetTags.findIndex(tag => tag.id === tagId);
                if (tagIndex !== -1) {
                    resetTags[tagIndex].count++;
                }
            });
        });
        
        localStorage.setItem(this.TAGS_KEY, JSON.stringify(resetTags));
        return resetTags;
    }

    // 获取设置
    getSettings() {
        const settings = localStorage.getItem(this.SETTINGS_KEY);
        return settings ? JSON.parse(settings) : {
            style: '1',
            default_template: '1',
            default_font_size: 16,
            default_line_height: 1.5
        };
    }

    // 保存设置
    saveSettings(settings) {
        const currentSettings = this.getSettings();
        const updatedSettings = { ...currentSettings, ...settings };
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
        return updatedSettings;
    }

    // 导出所有数据
    exportData() {
        const bookmarks = this.getBookmarks();
        const tags = this.getTags();
        const settings = this.getSettings();
        
        const exportData = {
            version: '1.0.0',
            export_date: new Date().toISOString(),
            data: {
                bookmarks,
                tags,
                settings
            }
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    // 导入数据
    importData(jsonData) {
        try {
            // 验证JSON格式
            if (!jsonData || typeof jsonData !== 'string') {
                throw new Error('无效的JSON数据');
            }
            
            const importData = JSON.parse(jsonData);
            
            // 验证数据格式
            if (!importData || typeof importData !== 'object') {
                throw new Error('无效的数据格式');
            }
            
            // 验证必要字段
            if (!importData.version || !importData.export_date || !importData.data) {
                throw new Error('无效的数据格式，缺少必要字段');
            }
            
            // 验证数据结构
            if (importData.data && typeof importData.data === 'object') {
                // 验证书签格式
                if (importData.data.bookmarks) {
                    if (!Array.isArray(importData.data.bookmarks)) {
                        throw new Error('书签数据必须是数组格式');
                    }
                    
                    // 验证每个书签的必要字段
                    for (const bookmark of importData.data.bookmarks) {
                        if (!bookmark || typeof bookmark !== 'object') {
                            throw new Error('书签数据格式错误');
                        }
                        if (!bookmark.id || !bookmark.title || !bookmark.content || !bookmark.created_at) {
                            throw new Error(`书签数据缺少必要字段: ${bookmark.title || '未知书签'}`);
                        }
                        // 验证字段类型
                        if (typeof bookmark.id !== 'string' || typeof bookmark.title !== 'string' || 
                            typeof bookmark.content !== 'string' || typeof bookmark.created_at !== 'string') {
                            throw new Error(`书签数据字段类型错误: ${bookmark.title || '未知书签'}`);
                        }
                    }
                    
                    // 处理数据冲突
                    const existingBookmarks = this.getBookmarks();
                    const mergedBookmarks = this.mergeBookmarks(existingBookmarks, importData.data.bookmarks);
                    localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(mergedBookmarks));
                }
                
                // 验证标签格式
                if (importData.data.tags) {
                    if (!Array.isArray(importData.data.tags)) {
                        throw new Error('标签数据必须是数组格式');
                    }
                    
                    // 验证每个标签的必要字段
                        for (const tag of importData.data.tags) {
                            if (!tag || typeof tag !== 'object') {
                                throw new Error('标签数据格式错误');
                            }
                            if (!tag.id || !tag.name) {
                                throw new Error(`标签数据缺少必要字段: ${tag.name || '未知标签'}`);
                            }
                            // 验证字段类型
                            if (typeof tag.id !== 'string' || typeof tag.name !== 'string') {
                                throw new Error(`标签数据字段类型错误: ${tag.name || '未知标签'}`);
                            }
                        }
                    
                    // 处理数据冲突
                    const existingTags = this.getTags();
                    const mergedTags = this.mergeTags(existingTags, importData.data.tags);
                    localStorage.setItem(this.TAGS_KEY, JSON.stringify(mergedTags));
                }
                
                // 验证设置格式
                if (importData.data.settings) {
                    if (typeof importData.data.settings !== 'object') {
                        throw new Error('设置数据必须是对象格式');
                    }
                    
                    // 合并设置
                    const existingSettings = this.getSettings();
                    const mergedSettings = { ...existingSettings, ...importData.data.settings };
                    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(mergedSettings));
                }
                
                // 更新标签计数
                this.updateTagCounts();
                
                return true;
            }
            
            throw new Error('无效的数据结构');
        } catch (error) {
            console.error('导入数据失败:', error);
            if (error instanceof SyntaxError) {
                throw new Error('JSON格式错误，请检查文件内容');
            }
            throw error; // 重新抛出错误，让调用者知道具体的错误原因
        }
    }

    // 合并书签数据
    mergeBookmarks(existing, imported) {
        if (!existing || !Array.isArray(existing)) {
            return imported;
        }
        
        const existingIds = new Set(existing.map(bookmark => bookmark.id));
        const newBookmarks = imported.filter(bookmark => !existingIds.has(bookmark.id));
        
        return [...existing, ...newBookmarks];
    }

    // 合并标签数据
    mergeTags(existing, imported) {
        if (!existing || !Array.isArray(existing)) {
            return imported;
        }
        
        const existingIds = new Set(existing.map(tag => tag.id));
        const newTags = imported.filter(tag => !existingIds.has(tag.id));
        
        return [...existing, ...newTags];
    }

    // 清除所有数据
    clearAllData() {
        localStorage.removeItem(this.BOOKMARKS_KEY);
        localStorage.removeItem(this.TAGS_KEY);
        localStorage.removeItem(this.SETTINGS_KEY);
        this.init(); // 重新初始化默认数据
    }

    // 获取存储大小
    getStorageSize() {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length;
            }
        }
        return totalSize;
    }
}

// 导出实例
const storage = new StorageManager();
window.storage = storage;
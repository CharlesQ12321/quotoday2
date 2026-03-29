const CACHE_NAME = 'quotoday-v1';
const urlsToCache = [
  './',
  './index.html',
  './生成读书软件图标.png',
  './styles/base.css',
  './styles/style1.css',
  './scripts/storage.js',
  './scripts/main.js',
  './scripts/image-editor.js',
  './scripts/ocr.js',
  './scripts/ai-ocr.js',
  './scripts/bookmark.js',
  './scripts/tag.js',
  './scripts/share.js'
];

// 安装时缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error('Cache failed:', err);
      })
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截请求并提供缓存内容
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在缓存中找到，直接返回
        if (response) {
          return response;
        }
        // 否则发起网络请求
        return fetch(event.request)
          .then((networkResponse) => {
            // 检查响应是否有效
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // 将新资源添加到缓存
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          })
          .catch(() => {
            // 网络请求失败时，尝试返回离线页面
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

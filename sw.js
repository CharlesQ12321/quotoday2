// 缓存版本号 - 每次更新项目时修改这个版本号
const CACHE_VERSION = '1.0.2';
const CACHE_NAME = `quotoday-v${CACHE_VERSION}`;

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
  console.log(`[SW] Installing version ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache opened:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error('[SW] Cache failed:', err);
      })
  );
  // 立即激活新的 Service Worker
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 删除所有不是当前版本的缓存
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 通知所有客户端 Service Worker 已更新
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_VERSION
          });
        });
      });
    })
  );
  // 立即接管所有客户端
  self.clients.claim();
});

// 拦截请求并提供缓存内容
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在缓存中找到，仍然发起网络请求检查更新
        if (response) {
          // 对于导航请求（页面本身），优先使用网络，失败时回退到缓存
          if (event.request.mode === 'navigate') {
            return fetch(event.request)
              .then((networkResponse) => {
                // 更新缓存
                if (networkResponse && networkResponse.status === 200) {
                  const responseToCache = networkResponse.clone();
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
                }
                return networkResponse;
              })
              .catch(() => {
                // 网络失败时返回缓存
                return response;
              });
          }
          
          // 对于其他资源，后台更新缓存
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              }
            })
            .catch(() => {});
          
          return response;
        }
        
        // 缓存中没有，发起网络请求
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

// 监听消息，用于手动触发缓存更新
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CHECK_UPDATE') {
    // 通知客户端当前版本
    event.source.postMessage({
      type: 'SW_VERSION',
      version: CACHE_VERSION
    });
  }
});

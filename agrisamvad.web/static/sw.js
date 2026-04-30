self.addEventListener('install', (e) => {
    console.log('AgriSamvad SW: Service Active');
});
self.addEventListener('fetch', (e) => {
    e.respondWith(fetch(e.request));
});
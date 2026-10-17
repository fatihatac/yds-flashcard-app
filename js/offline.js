// Service worker ile konuşur: çevrimdışı kullanım için kaç dosyanın önbellekte hazır olduğunu sorar veya eksikleri indirtir.
function ask(msg) {
  const sw = navigator.serviceWorker?.controller;
  if (!sw) return Promise.resolve(null);
  return new Promise((resolve) => {
    const ch = new MessageChannel();
    const timer = setTimeout(() => resolve(null), 60000);
    ch.port1.onmessage = (e) => { clearTimeout(timer); resolve(e.data); };
    sw.postMessage(msg, [ch.port2]);
  });
}

export const offlineStatus = () => ask('offline-status');
export const offlineSync = () => ask('offline-sync');

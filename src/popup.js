'use strict';

function getTwitterNames() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('names', names => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      } else {
        return resolve(names.names);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const list = document.querySelector('#list');
  const btn = document.querySelector('#btn');
  btn.addEventListener('click', () => {
    const names = list.value.split('\n');
    chrome.storage.sync.set({ names });

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: 'reload-names' });
      window.close();
    });
  })

  const names = await getTwitterNames();
  list.value = names.join('\n');
});
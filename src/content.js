'use strict';

let Names;

const link = document.createElement('link');
link.setAttribute('rel', 'stylesheet');
link.setAttribute('href', chrome.runtime.getURL('src/inject/twitter-identity-check.css'));
document.head.appendChild(link);

// Thanks to https://medium.com/@griffinmichl/implementing-debounce-in-javascript-eab51a12311e
function debounce(func, wait) {
  let timeout
  return function(...args) {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(context, args), wait)
  }
}

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

async function start() {
  try {
    Names = await getTwitterNames();

    if (Array.isArray(Names)) {
      markNames();
      watch();
    }
  } catch (err) {
    console.error('twitter identity check error:', err);
  }
}

function watch() {
  const config = { childList: true };

  // Create an observer instance that starts the name check when the DOM changes.
  const observer = new MutationObserver(debounce(mutationsList => {
    markNames();
  }, 1000));

  observer.observe(document.body, { childList: true, subtree: true });
}

function markNames() {

  // Clean up
  document.querySelectorAll('.tw-id-check-known').forEach(el => {
    el.classList.remove('tw-id-check-known');
  });
  
  // Apply class
  const addStyles = el => {
    if (Names.indexOf(el.textContent) > -1) {
      el.classList.add('tw-id-check-known');
    }
  };

  // Search tweets
  document.querySelectorAll('.permalink-container .username[data-aria-label-part]').forEach(addStyles);
  document.querySelectorAll('[role="alertdialog"] .username[data-aria-label-part]').forEach(addStyles);
  document.querySelectorAll('.stream-container .username[data-aria-label-part]').forEach(addStyles);
}

chrome.runtime.onMessage.addListener(
  async function(request, sender, sendResponse) {
    if (request.message === 'reload-names') {
      Names = await getTwitterNames();
      markNames();
    }
  }
);

start();

let queue = [];
let isProcessing = false;
let throttle = 5000;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startScraping') {
    queue = message.rows;
    throttle = message.throttle;
    processNext();
  }
});

async function processNext() {
  if (queue.length === 0 || isProcessing) return;

  isProcessing = true;
  const row = queue.shift();
  const query = encodeURIComponent(`${row.Company} ${row.Country}`);
  const url = `https://www.google.com/search?q=${query}`;

  try {
    const tab = await chrome.tabs.create({ url, active: false });
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for page load

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    const scraped = result.result || { status: 'Failed' };
    const fullResult = { ...row, ...scraped };

    chrome.runtime.sendMessage({ action: 'updateResult', result: fullResult });
    await chrome.tabs.remove(tab.id);
  } catch (error) {
    const fullResult = { ...row, status: 'Failed' };
    chrome.runtime.sendMessage({ action: 'updateResult', result: fullResult });
  }

  isProcessing = false;
  setTimeout(processNext, throttle);
}

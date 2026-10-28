// Listen for keyboard command toggle (Ctrl+Shift+S / Cmd+Shift+S)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-overlay') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'toggle-overlay' });
    }
  }
});

// Listen for action click
chrome.action.onClicked.addListener(async (tab) => {
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle-overlay' });
  }
});

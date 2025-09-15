// Think Inside the Box - Background Script
// Handles extension lifecycle events and storage management

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Think Inside the Box extension installed');

  // Initialize default settings
  try {
    chrome.storage.sync.set({
      enabled: true,
      theme: 'default',
      maxHeight: 300,
      fontSize: 13,
      fontFamily: 'Consolas, monospace'
    }).catch(error => {
      console.warn('Think Inside the Box: Storage not available, using defaults', error);
    });
  } catch (error) {
    console.warn('Think Inside the Box: Storage API not available', error);
  }
});

// Handle extension updates
chrome.runtime.onStartup.addListener(() => {
  console.log('Think Inside the Box extension started');
});
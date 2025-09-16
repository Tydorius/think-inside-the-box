// Main Content Script
// Coordinates all modules and initializes the extension

(function() {
  'use strict';

  console.log('Content script loading...');

  // Ensure all dependencies are loaded
  if (typeof ThinkBlockDetector === 'undefined' ||
      typeof ThinkBlockStyler === 'undefined' ||
      typeof ThinkBlockMonitor === 'undefined') {
    console.error('Required modules not loaded');
    return;
  }

  // Global extension state
  let isInitialized = false;
  let detector = null;
  let styler = null;
  let monitor = null;

  /**
   * Initialize the extension
   */
  async function initialize() {
    if (isInitialized) {
      console.log('Already initialized');
      return;
    }

    console.log('Initializing extension...');

    try {
      // Create instances
      detector = new ThinkBlockDetector();
      styler = new ThinkBlockStyler();

      // Initialize styler with settings
      await styler.initialize();

      // Initialize detector with settings
      detector.initialize(styler.settings);

      // Create monitor with detector and styler
      monitor = new ThinkBlockMonitor(detector, styler);

      // Initialize monitor with settings
      monitor.initialize(styler.settings);

      // Start monitoring
      monitor.startMonitoring();

      isInitialized = true;
      console.log('Extension initialized successfully');

    } catch (error) {
      console.error('Initialization failed', error);
    }
  }

  /**
   * Clean up when the page is about to unload
   */
  function cleanup() {
    if (monitor) {
      monitor.stopMonitoring();
    }
    console.log('Cleanup completed');
  }

  /**
   * Check if we're on a valid JanitorAI chat page
   */
  function isValidPage() {
    const url = window.location.href;
    const chatPagePattern = /https:\/\/janitorai\.com\/chats\//;
    return chatPagePattern.test(url);
  }

  /**
   * Handle page navigation changes (for SPAs)
   */
  function handleNavigationChange() {
    if (isValidPage()) {
      console.log('Valid chat page detected');

      // Delay initialization to ensure page content is loaded
      setTimeout(initialize, 1000);
    } else {
      console.log('Not a chat page, extension disabled');
      cleanup();
      isInitialized = false;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleNavigationChange);
  } else {
    handleNavigationChange();
  }

  // Handle page unload
  window.addEventListener('beforeunload', cleanup);

  // Listen for navigation changes (for single-page applications)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('Navigation detected');
      handleNavigationChange();
    }
  }).observe(document, { subtree: true, childList: true });

  // Listen for storage changes (settings updates)
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && styler && detector && monitor) {
        console.log('Settings changed, updating all components');
        styler.initialize().then(() => {
          // Update detector and monitor with new settings
          detector.initialize(styler.settings);
          monitor.initialize(styler.settings);

          // Update existing containers
          styler.updateExistingContainers();

          // Restart periodic check with new interval if it changed
          if (changes.periodicCheckInterval) {
            monitor.stopMonitoring();
            monitor.startMonitoring();
          }
        });
      }
    });
  }

  // Listen for messages from popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SETTINGS_UPDATED' && styler) {
        console.log('Settings updated from popup');
        styler.settings = { ...styler.settings, ...message.settings };
        styler.updateExistingContainers();
        sendResponse({ success: true });
      }
    });
  }

  console.log('Content script loaded');

})();
// Main Content Script
// Coordinates all modules and initializes the extension

(function() {
  'use strict';

  dinfo('Content script loading...');

  // Ensure all dependencies are loaded
  if (typeof ThinkBlockDetector === 'undefined' ||
      typeof ThinkBlockStyler === 'undefined' ||
      typeof ThinkBlockMonitor === 'undefined' ||
      typeof ThinkBlockControlPanel === 'undefined') {
    console.error('Required modules not loaded');
    return;
  }

  // Global extension state
  let isInitialized = false;
  let detector = null;
  let styler = null;
  let monitor = null;
  let controlPanel = null;

  /**
   * Initialize the extension
   */
  async function initialize() {
    if (isInitialized) {
      dinfo('Already initialized');
      return;
    }

    dinfo('Initializing extension...');

    try {
      // Create instances
      detector = new ThinkBlockDetector();
      styler = new ThinkBlockStyler();

      // Initialize styler with settings
      await styler.initialize();

      // Set global debug mode and verbosity
      window.setDebugMode(styler.settings.debugMode || false, styler.settings.debugVerbosity || 2);

      // Initialize detector with settings
      detector.initialize(styler.settings);

      // Create monitor with detector and styler
      monitor = new ThinkBlockMonitor(detector, styler);

      // Initialize monitor with settings
      monitor.initialize(styler.settings);

      // Start monitoring
      monitor.startMonitoring();

      // Create and initialize control panel
      controlPanel = new ThinkBlockControlPanel();
      controlPanel.initialize(styler.settings, manualCheckForThinkBlocks);

      isInitialized = true;
      dinfo('Extension initialized successfully');

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
    if (controlPanel) {
      controlPanel.destroy();
    }
    dinfo('Cleanup completed');
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
   * Manually trigger a check for new thinking blocks
   */
  function manualCheckForThinkBlocks() {
    if (!isInitialized || !detector || !monitor) {
      dinfo('Extension not initialized, skipping manual check');
      return;
    }

    dinfo('Manual check for think blocks triggered');

    // Clear processed blocks to allow detection of potentially missed content
    detector.clearProcessedBlocks();

    // Process current content
    monitor.processCurrentContent();
  }

  /**
   * Handle window focus events to re-check for think blocks
   */
  function handleWindowFocus() {
    if (!isValidPage()) {
      return;
    }

    dinfo('Window focused, checking for new think blocks');

    // Delay the check slightly to ensure any DOM updates are complete
    setTimeout(manualCheckForThinkBlocks, 500);
  }

  /**
   * Handle page navigation changes (for SPAs)
   */
  function handleNavigationChange() {
    if (isValidPage()) {
      dinfo('Valid chat page detected');

      // Delay initialization to ensure page content is loaded
      setTimeout(initialize, 1000);
    } else {
      dinfo('Not a chat page, extension disabled');
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

  // Handle window focus to re-check for think blocks
  window.addEventListener('focus', handleWindowFocus);

  // Listen for navigation changes (for single-page applications)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      ddebug('Navigation detected');
      handleNavigationChange();
    }
  }).observe(document, { subtree: true, childList: true });

  // Listen for storage changes (settings updates)
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && styler && detector && monitor) {
        dinfo('Settings changed, updating all components');
        styler.initialize().then(() => {
          // Update global debug mode and verbosity
          window.setDebugMode(styler.settings.debugMode || false, styler.settings.debugVerbosity || 2);

          // Update detector and monitor with new settings
          detector.initialize(styler.settings);
          monitor.initialize(styler.settings);

          // Update control panel with new settings
          if (controlPanel) {
            controlPanel.updateSettings(styler.settings);
          }

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
        dinfo('Settings updated from popup');
        styler.settings = { ...styler.settings, ...message.settings };
        styler.updateExistingContainers();
        sendResponse({ success: true });
      }
    });
  }

  dinfo('Content script loaded');

})();
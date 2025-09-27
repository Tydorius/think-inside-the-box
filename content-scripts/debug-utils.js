// Debug Utility Module
// Provides centralized debug logging with verbosity levels

/**
 * Debug logging utility with verbosity levels
 * @param {string} message - Message to log
 * @param {number} level - Verbosity level (0=critical, 1=important, 2=detailed, 3=verbose)
 * @param {any} ...args - Additional arguments to log
 */
function dconsole(message, level = 1, ...args) {
  // Check if debug mode is enabled
  if (!window.thinkBoxDebugMode) {
    return;
  }

  // Get current verbosity level (default to 2 if not set)
  const verbosityLevel = window.thinkBoxVerbosity || 2;

  // Only log if message level is <= current verbosity level
  if (level > verbosityLevel) {
    return;
  }

  // Add level prefix for clarity
  const levelPrefixes = {
    0: '[CRITICAL]',
    1: '[INFO]',
    2: '[DEBUG]',
    3: '[VERBOSE]'
  };

  const prefix = levelPrefixes[level] || '[DEBUG]';
  const fullMessage = `${prefix} Think-Inside-Box: ${message}`;

  // Use appropriate console method based on level
  if (level === 0) {
    console.error(fullMessage, ...args);
  } else if (level === 1) {
    console.log(fullMessage, ...args);
  } else {
    console.debug(fullMessage, ...args);
  }
}

/**
 * Quick debug functions for different levels
 */
window.dcritical = (message, ...args) => dconsole(message, 0, ...args);
window.dinfo = (message, ...args) => dconsole(message, 1, ...args);
window.ddebug = (message, ...args) => dconsole(message, 2, ...args);
window.dverbose = (message, ...args) => dconsole(message, 3, ...args);

/**
 * Set debug verbosity level
 * @param {number} level - Verbosity level (0-3)
 */
window.setDebugVerbosity = function(level) {
  window.thinkBoxVerbosity = Math.max(0, Math.min(3, level));
  dinfo(`Debug verbosity set to level ${window.thinkBoxVerbosity}`);
};

/**
 * Enable/disable debug mode
 * @param {boolean} enabled - Whether debug mode should be enabled
 * @param {number} verbosity - Verbosity level (0-3)
 */
window.setDebugMode = function(enabled, verbosity = 2) {
  window.thinkBoxDebugMode = enabled;
  window.thinkBoxVerbosity = verbosity;

  if (enabled) {
    dinfo(`Debug mode enabled with verbosity level ${verbosity}`);
  }
};

// Initialize debug mode state
if (typeof window.thinkBoxDebugMode === 'undefined') {
  window.thinkBoxDebugMode = false;
}

if (typeof window.thinkBoxVerbosity === 'undefined') {
  window.thinkBoxVerbosity = 2; // Default to detailed level
}

// Export for use by other modules
window.dconsole = dconsole;
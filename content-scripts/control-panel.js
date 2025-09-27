// Control Panel Module
// Provides a floating control panel for manual extension controls

class ThinkBlockControlPanel {
  constructor() {
    this.panel = null;
    this.isVisible = true;
    this.position = 'bottom-right'; // default position
    this.settings = null;
    this.manualCheckCallback = null;
  }

  /**
   * Initialize the control panel with settings
   * @param {Object} settings - Settings object from styler
   * @param {Function} manualCheckCallback - Function to call when manual check is triggered
   */
  initialize(settings, manualCheckCallback) {
    this.settings = settings;
    this.manualCheckCallback = manualCheckCallback;
    this.position = settings.controlPanelPosition || 'bottom-right';
    this.isVisible = settings.controlPanelVisible !== false; // default to true

    dinfo('Control panel initialized');

    if (this.isVisible) {
      this.createPanel();
    }
  }

  /**
   * Creates the floating control panel
   */
  createPanel() {
    // Remove existing panel if it exists
    this.removePanel();

    // Create the panel container
    this.panel = document.createElement('div');
    this.panel.id = 'think-inside-box-control-panel';
    this.panel.className = 'think-inside-box-control-panel';

    // Create the manual check button
    const checkButton = document.createElement('button');
    checkButton.className = 'think-inside-box-check-button';
    checkButton.innerHTML = '⟳';
    checkButton.title = 'Manually check for new <think> blocks';
    checkButton.addEventListener('click', this.handleManualCheck.bind(this));

    // Add button to panel
    this.panel.appendChild(checkButton);

    // Apply positioning and styling
    this.applyStyles();
    this.applyPosition();

    // Add to page
    document.body.appendChild(this.panel);

    dinfo('Control panel created and added to page');
  }

  /**
   * Applies CSS styles to the control panel
   */
  applyStyles() {
    if (!this.panel) return;

    // Base styles for the panel
    Object.assign(this.panel.style, {
      position: 'fixed',
      zIndex: '999999',
      borderRadius: '8px',
      padding: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)'
    });

    // Apply theme-aware styles
    this.applyThemeStyles();

    // Style button
    const button = this.panel.querySelector('button');
    if (button) {
      Object.assign(button.style, {
        width: '32px',
        height: '32px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        outline: 'none'
      });
    }
  }

  /**
   * Applies theme-aware styling to the control panel
   */
  applyThemeStyles() {
    if (!this.panel || !this.settings) return;

    const theme = this.settings.theme;

    switch (theme) {
      case 'dark':
        this.panel.style.backgroundColor = 'rgba(45, 55, 72, 0.95)';
        this.panel.style.border = '2px solid #4a5568';
        this.panel.style.color = '#e2e8f0';
        break;

      case 'minimal':
        this.panel.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        this.panel.style.border = '2px solid #e0e0e0';
        this.panel.style.color = '#333333';
        break;

      case 'custom':
        this.panel.style.backgroundColor = this.hexToRgba(this.settings.backgroundColor, 0.95);
        this.panel.style.border = `2px solid ${this.settings.borderColor}`;
        this.panel.style.color = this.settings.textColor;
        break;

      default: // default theme - matching JanitorAI's dark purple/slate styling
        this.panel.style.backgroundColor = 'rgba(49, 51, 56, 0.95)';
        this.panel.style.border = '2px solid #5b21b6';
        this.panel.style.color = '#c6a3ff';
        break;
    }

    // Update button theme
    this.applyButtonTheme();
  }

  /**
   * Applies theme-aware styling to the button
   */
  applyButtonTheme() {
    const checkButton = this.panel.querySelector('.think-inside-box-check-button');
    if (!checkButton || !this.settings) return;

    const theme = this.settings.theme;

    // Remove existing event listeners by cloning the button
    const newButton = checkButton.cloneNode(true);
    checkButton.parentNode.replaceChild(newButton, checkButton);
    newButton.addEventListener('click', this.handleManualCheck.bind(this));

    switch (theme) {
      case 'dark':
        newButton.style.backgroundColor = '#4a5568';
        newButton.style.color = '#cbd5e0';
        this.setupButtonHover(newButton, '#4a5568', '#5a6578');
        break;

      case 'minimal':
        newButton.style.backgroundColor = '#f8f9fa';
        newButton.style.color = '#495057';
        this.setupButtonHover(newButton, '#f8f9fa', '#e9ecef');
        break;

      case 'custom':
        newButton.style.backgroundColor = this.settings.borderColor;
        newButton.style.color = this.settings.textColor;
        this.setupButtonHover(newButton, this.settings.borderColor, this.darkenColor(this.settings.borderColor, 10));
        break;

      default: // default theme
        newButton.style.backgroundColor = '#5b21b6';
        newButton.style.color = '#c6a3ff';
        this.setupButtonHover(newButton, '#5b21b6', '#7c3aed');
        break;
    }
  }

  /**
   * Sets up hover effects for a button
   */
  setupButtonHover(button, normalColor, hoverColor) {
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = hoverColor;
      button.style.transform = 'scale(1.05)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = normalColor;
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('mousedown', () => {
      button.style.transform = 'scale(0.95)';
    });

    button.addEventListener('mouseup', () => {
      button.style.transform = 'scale(1.05)';
    });
  }

  /**
   * Converts hex color to rgba
   */
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Darkens a hex color by a percentage
   */
  darkenColor(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  /**
   * Applies position-based styling to the control panel
   */
  applyPosition() {
    if (!this.panel) return;

    // Clear all position styles
    this.panel.style.top = '';
    this.panel.style.bottom = '';
    this.panel.style.left = '';
    this.panel.style.right = '';

    // Apply position-specific styles
    switch (this.position) {
      case 'top-left':
        this.panel.style.top = '20px';
        this.panel.style.left = '20px';
        break;
      case 'top-right':
        this.panel.style.top = '20px';
        this.panel.style.right = '20px';
        break;
      case 'bottom-left':
        this.panel.style.bottom = '20px';
        this.panel.style.left = '20px';
        break;
      case 'bottom-right':
      default:
        this.panel.style.bottom = '20px';
        this.panel.style.right = '20px';
        break;
    }
  }

  /**
   * Handles manual check button click
   */
  handleManualCheck() {
    dinfo('Manual check button clicked');

    // Visual feedback
    const checkButton = this.panel.querySelector('.think-inside-box-check-button');
    if (checkButton) {
      const originalText = checkButton.innerHTML;
      checkButton.innerHTML = '⟳';
      checkButton.style.animation = 'spin 1s linear';
      checkButton.style.transformOrigin = 'center';

      // Add spinning animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);

      setTimeout(() => {
        checkButton.innerHTML = originalText;
        checkButton.style.animation = '';
        document.head.removeChild(style);
      }, 1000);
    }

    // Call the manual check function
    if (this.manualCheckCallback) {
      this.manualCheckCallback();
    }
  }


  /**
   * Updates the control panel with new settings
   * @param {Object} newSettings - Updated settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };

    const newPosition = newSettings.controlPanelPosition;
    const newVisibility = newSettings.controlPanelVisible;

    if (newPosition && newPosition !== this.position) {
      this.position = newPosition;
      if (this.panel) {
        this.applyPosition();
      }
    }

    if (newVisibility !== undefined && newVisibility !== this.isVisible) {
      this.isVisible = newVisibility;
      if (this.isVisible && !this.panel) {
        this.createPanel();
      } else if (!this.isVisible && this.panel) {
        this.removePanel();
      }
    }

    // Update theme styling if panel exists
    if (this.panel && (newSettings.theme || newSettings.backgroundColor || newSettings.borderColor || newSettings.textColor)) {
      this.applyThemeStyles();
    }
  }

  /**
   * Removes the control panel from the page
   */
  removePanel() {
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
      this.panel = null;
      ddebug('Control panel removed');
    }
  }

  /**
   * Shows the control panel
   */
  show() {
    this.isVisible = true;
    if (!this.panel) {
      this.createPanel();
    } else {
      this.panel.style.display = 'flex';
    }
  }

  /**
   * Hides the control panel
   */
  hide() {
    this.isVisible = false;
    if (this.panel) {
      this.panel.style.display = 'none';
    }
  }

  /**
   * Cleanup method for removing the control panel
   */
  destroy() {
    this.removePanel();
    dinfo('Control panel destroyed');
  }
}

// Export for use by main script
window.ThinkBlockControlPanel = ThinkBlockControlPanel;
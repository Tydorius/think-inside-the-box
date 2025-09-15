// Styling Module
// Handles wrapping detected thinking blocks in styled containers

class ThinkBlockStyler {
  constructor() {
    this.containerClass = 'think-inside-box-container';
    this.markerClass = 'think-inside-box-marker';
    this.contentClass = 'think-inside-box-content';
    this.settings = {
      enabled: true,
      theme: 'default',
      maxHeight: 200,
      fontSize: 13,
      fontFamily: 'Consolas, monospace',
      backgroundColor: '#313338',
      borderColor: '#5b21b6',
      textColor: '#c6a3ff',
      markerColor: '#8e67ff'
    };
  }

  /**
   * Initialize the styler with user settings
   */
  async initialize() {
    try {
      if (chrome.storage && chrome.storage.sync) {
        const stored = await chrome.storage.sync.get();
        this.settings = { ...this.settings, ...stored };
        console.log('Styler initialized with settings', this.settings);
      } else {
        console.log('Storage not available, using default settings');
      }
    } catch (error) {
      console.warn('Failed to load settings, using defaults', error);
    }
  }

  /**
   * Wraps thinking block ranges in styled containers
   * @param {Array} ranges - Array of detected ranges
   * @returns {Object} Processing results including container heights
   */
  wrapThinkingBlocks(ranges) {
    if (!this.settings.enabled) {
      console.log('Styling disabled');
      return { containers: [], totalNewHeight: 0 };
    }

    console.log(`Styling ${ranges.length} thinking blocks`);

    const containers = [];
    let totalNewHeight = 0;

    ranges.forEach((range, index) => {
      try {
        const container = this.wrapSingleRange(range, index);
        if (container) {
          containers.push(container);

          // Measure the new container height after a brief delay to ensure styling is applied
          setTimeout(() => {
            const containerHeight = container.offsetHeight;
            const computedStyle = window.getComputedStyle(container);
            const fullHeight = containerHeight +
              parseFloat(computedStyle.marginTop) +
              parseFloat(computedStyle.marginBottom);

            totalNewHeight += fullHeight;
            console.log(`Container ${index} height: ${fullHeight}px`);
          }, 10);
        }
      } catch (error) {
        console.error('Failed to wrap range', error);
      }
    });

    return {
      containers,
      totalNewHeight: 0, // Will be calculated asynchronously
      rangeCount: ranges.length
    };
  }

  /**
   * Wraps a single range in a styled container
   * @param {Object} range - The range to wrap
   * @param {number} index - Index for unique identification
   */
  wrapSingleRange(range, index) {
    // Create the main container
    const container = document.createElement('div');
    container.className = this.containerClass;
    container.id = `think-box-${index}-${Date.now()}`;

    // Apply dynamic styling based on current settings
    this.applyContainerStyles(container);

    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = this.contentClass;

    // Add internal padding to prevent content from touching edges
    contentWrapper.style.padding = '8px 12px';
    contentWrapper.style.boxSizing = 'border-box';

    // Insert container before the first element
    const startElement = range.startElement;
    startElement.parentNode.insertBefore(container, startElement);

    // Process each element in the range
    this.processRangeElements(range, contentWrapper);

    // Add content wrapper to container
    container.appendChild(contentWrapper);

    console.log(`Created container for thinking block ${index}`);
  }

  /**
   * Processes elements within a range
   * @param {Object} range - The range to process
   * @param {HTMLElement} contentWrapper - The wrapper to add content to
   */
  processRangeElements(range, contentWrapper) {
    range.elements.forEach((element, index) => {
      const text = element.textContent;

      if (index === 0 && text.includes('&lt;think&gt;')) {
        // Handle start marker
        const marker = this.createMarker('&lt;think&gt;');
        contentWrapper.appendChild(marker);

        const remainingText = text.replace('&lt;think&gt;', '').trim();
        if (remainingText) {
          const textNode = document.createElement('div');
          textNode.textContent = remainingText;
          contentWrapper.appendChild(textNode);
        }
      } else if (index === range.elements.length - 1 && text.includes('&lt;/think&gt;')) {
        // Handle end marker
        const endIndex = text.indexOf('&lt;/think&gt;');
        const contentText = text.substring(0, endIndex).trim();

        if (contentText) {
          const textNode = document.createElement('div');
          textNode.textContent = contentText;
          contentWrapper.appendChild(textNode);
        }

        const marker = this.createMarker('&lt;/think&gt;');
        contentWrapper.appendChild(marker);
      } else {
        // Handle middle content
        const textNode = document.createElement('div');
        textNode.innerHTML = element.innerHTML;
        contentWrapper.appendChild(textNode);
      }

      // Remove original element
      element.remove();
    });
  }

  /**
   * Creates a styled marker element
   * @param {string} text - Marker text
   * @returns {HTMLElement} Styled marker element
   */
  createMarker(text) {
    const marker = document.createElement('span');
    marker.className = this.markerClass;
    marker.textContent = text;

    // Apply dynamic marker styling
    this.applyMarkerStyles(marker);

    return marker;
  }

  /**
   * Applies styling to container based on current settings
   * @param {HTMLElement} container - Container element to style
   */
  applyContainerStyles(container) {
    const s = this.settings;

    // Base styles
    container.style.maxHeight = s.maxHeight + 'px';
    container.style.fontSize = s.fontSize + 'px';
    container.style.fontFamily = s.fontFamily;
    container.style.overflowY = 'auto';
    container.style.overflowX = 'hidden';
    container.style.borderRadius = '12px';
    container.style.margin = '16px 0';
    container.style.padding = '16px';
    container.style.lineHeight = '1.6';
    container.style.scrollBehavior = 'smooth';
    container.style.scrollbarWidth = 'thin';
    container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    container.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    container.style.userSelect = 'text';

    // Apply theme-specific styles
    this.applyThemeStyles(container);
  }

  /**
   * Applies theme-specific styles to container
   * @param {HTMLElement} container - Container element to style
   */
  applyThemeStyles(container) {
    const theme = this.settings.theme;

    switch (theme) {
      case 'dark':
        container.style.background = 'linear-gradient(145deg, #2d3748, #1a202c)';
        container.style.borderColor = '#4a5568';
        container.style.color = '#e2e8f0';
        container.style.border = '1px solid #4a5568';
        container.style.scrollbarColor = '#4a5568 #2d3748';
        break;

      case 'minimal':
        container.style.background = '#ffffff';
        container.style.borderColor = '#e0e0e0';
        container.style.color = '#333333';
        container.style.border = '1px solid #e0e0e0';
        container.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
        break;

      case 'custom':
        container.style.background = this.settings.backgroundColor;
        container.style.borderColor = this.settings.borderColor;
        container.style.color = this.settings.textColor;
        container.style.border = `1px solid ${this.settings.borderColor}`;
        break;

      default: // default theme - matching JanitorAI's dark purple/slate styling
        container.style.background = 'linear-gradient(145deg, #313338, #2d2f32)';
        container.style.borderColor = '#5b21b6';
        container.style.color = '#c6a3ff';
        container.style.border = '1px solid #5b21b6';
        container.style.scrollbarColor = '#8e67ff #313338';
    }
  }

  /**
   * Applies styling to marker based on current settings
   * @param {HTMLElement} marker - Marker element to style
   */
  applyMarkerStyles(marker) {
    const theme = this.settings.theme;

    // Base marker styles
    marker.style.display = 'inline-block';
    marker.style.padding = '2px 6px';
    marker.style.borderRadius = '4px';
    marker.style.fontWeight = 'bold';
    marker.style.fontSize = '11px';
    marker.style.margin = '0 4px';
    marker.style.fontFamily = 'inherit';
    marker.style.border = '1px solid';

    // Apply theme-specific marker styles
    switch (theme) {
      case 'dark':
        marker.style.backgroundColor = '#4a5568';
        marker.style.color = '#cbd5e0';
        marker.style.borderColor = '#5a6578';
        break;

      case 'minimal':
        marker.style.backgroundColor = '#f5f5f5';
        marker.style.color = '#666666';
        marker.style.borderColor = '#e0e0e0';
        break;

      case 'custom':
        marker.style.backgroundColor = this.settings.markerColor;
        marker.style.color = this.getContrastColor(this.settings.markerColor);
        marker.style.borderColor = this.settings.borderColor;
        break;

      default: // default theme - matching JanitorAI's dark purple/slate styling
        marker.style.backgroundColor = '#5b21b6';
        marker.style.color = '#c6a3ff';
        marker.style.borderColor = '#8e67ff';
    }
  }

  /**
   * Get contrasting text color for marker background
   * @param {string} hexColor - Background color in hex format
   * @returns {string} Contrasting text color
   */
  getContrastColor(hexColor) {
    // Remove # if present
    const color = hexColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }

  /**
   * Updates all existing containers with new settings
   */
  updateExistingContainers() {
    const containers = document.querySelectorAll('.' + this.containerClass);
    containers.forEach(container => {
      this.applyContainerStyles(container);

      // Update markers within this container
      const markers = container.querySelectorAll('.' + this.markerClass);
      markers.forEach(marker => {
        this.applyMarkerStyles(marker);
      });
    });

    console.log(`Updated ${containers.length} existing containers with new settings`);
  }
}

// Export for use by other modules
window.ThinkBlockStyler = ThinkBlockStyler;
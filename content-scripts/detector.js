// Detection Module
// Handles finding and identifying thinking blocks in page content

class ThinkBlockDetector {
  constructor() {
    this.startMarker = '&lt;think&gt;';
    this.endMarker = '&lt;/think&gt;';
    this.processedBlocks = new Set();
    this.debugMode = false; // Will be set from settings
    this.settings = null; // Will be initialized with settings
  }

  /**
   * Initialize the detector with settings
   * @param {Object} settings - Settings object from styler
   */
  initialize(settings) {
    this.settings = settings;
    this.debugMode = settings.debugMode || false;
    dinfo(`Detector initialized with debug mode: ${this.debugMode}`);
  }

  /**
   * Scans the document for thinking block patterns
   * @returns {Array} Array of detected thinking block ranges
   */
  scanDocument() {
    ddebug('Scanning for thinking blocks');

    // Target the virtuoso container specifically for React Virtuoso compatibility
    const virtuosoContainer = document.querySelector('[data-testid="virtuoso-item-list"]');
    if (!virtuosoContainer) {
      dcritical('Virtuoso container not found, falling back to document search');

      const allElements = document.querySelectorAll('div[style*="font-size: 1rem"]');

      const ranges = this.processElements(allElements);

      if (this.debugMode) {
        this.debugLogContent();
      }

      return ranges;
    }

    ddebug('Found virtuoso container, scanning within it');
    const allElements = virtuosoContainer.querySelectorAll('div[style*="font-size: 1rem"]');

    const ranges = this.processElements(allElements);

    if (this.debugMode) {
      this.debugLogContent();
    }

    return ranges;
  }

  /**
   * Debug function: Logs content analysis without modifying DOM
   */
  debugLogContent() {
    dverbose('Analyzing content for debug purposes');

    // Find container to search in
    const searchContainer = document.querySelector('[data-testid="virtuoso-item-list"]') || document.body;
    dverbose('Search container:', searchContainer);

    // Count occurrences of "think" in general text
    const bodyText = searchContainer.textContent.toLowerCase();
    const thinkCount = (bodyText.match(/think/g) || []).length;
    dverbose(`Found ${thinkCount} total instances of "think" in text`);

    // Look for HTML entity markers with detailed analysis
    const allElements = searchContainer.querySelectorAll('*');
    let startMarkers = 0;
    let endMarkers = 0;
    const markerDetails = [];

    // Test different possible encodings
    const possibleStartMarkers = [
      '&lt;think&gt;',
      '<think>',
      '&amp;lt;think&amp;gt;',
      '&#60;think&#62;'
    ];

    const possibleEndMarkers = [
      '&lt;/think&gt;',
      '</think>',
      '&amp;lt;/think&amp;gt;',
      '&#60;/think&#62;'
    ];

    dverbose('Testing for different marker encodings...');

    allElements.forEach(el => {
      const textContent = el.textContent;
      const innerHTML = el.innerHTML;

      // Check each possible start marker encoding
      possibleStartMarkers.forEach(marker => {
        if (textContent.includes(marker)) {
          startMarkers++;
          dverbose(`Found START marker "${marker}" in textContent:`, textContent.substring(0, 100));
          markerDetails.push({
            type: 'start',
            encoding: marker,
            source: 'textContent',
            element: el.tagName,
            classes: el.className,
            style: el.getAttribute('style'),
            text: textContent.substring(0, 100) + '...'
          });
        }
        if (innerHTML.includes(marker)) {
          dverbose(`Found START marker "${marker}" in innerHTML:`, innerHTML.substring(0, 100));
          markerDetails.push({
            type: 'start',
            encoding: marker,
            source: 'innerHTML',
            element: el.tagName,
            classes: el.className,
            style: el.getAttribute('style'),
            text: innerHTML.substring(0, 100) + '...'
          });
        }
      });

      // Check each possible end marker encoding
      possibleEndMarkers.forEach(marker => {
        if (textContent.includes(marker)) {
          endMarkers++;
          dverbose(`Found END marker "${marker}" in textContent:`, textContent.substring(0, 100));
          markerDetails.push({
            type: 'end',
            encoding: marker,
            source: 'textContent',
            element: el.tagName,
            classes: el.className,
            style: el.getAttribute('style'),
            text: textContent.substring(0, 100) + '...'
          });
        }
        if (innerHTML.includes(marker)) {
          dverbose(`Found END marker "${marker}" in innerHTML:`, innerHTML.substring(0, 100));
          markerDetails.push({
            type: 'end',
            encoding: marker,
            source: 'innerHTML',
            element: el.tagName,
            classes: el.className,
            style: el.getAttribute('style'),
            text: innerHTML.substring(0, 100) + '...'
          });
        }
      });
    });

    dverbose(`Found ${startMarkers} start markers and ${endMarkers} end markers`);
    dverbose('Marker details:', markerDetails);

    // Check for the specific div structure we're looking for
    const targetDivs = searchContainer.querySelectorAll('div[style*="font-size: 1rem"]');
    dverbose(`Found ${targetDivs.length} divs with "font-size: 1rem" style`);

    let targetDivsWithMarkers = 0;
    targetDivs.forEach((div, index) => {
      const textContent = div.textContent;
      const innerHTML = div.innerHTML;

      dverbose(`Target div ${index}:`);
      dverbose(`  textContent: "${textContent}"`);
      dverbose(`  innerHTML: "${innerHTML}"`);
      dverbose(`  style: "${div.getAttribute('style')}"`);

      // Check all possible marker encodings in target divs
      let hasMarker = false;
      [...possibleStartMarkers, ...possibleEndMarkers].forEach(marker => {
        if (textContent.includes(marker) || innerHTML.includes(marker)) {
          hasMarker = true;
          targetDivsWithMarkers++;
          dverbose(`  ✓ Contains marker: "${marker}"`);
        }
      });

      if (!hasMarker && textContent.toLowerCase().includes('think')) {
        dverbose('  ⚠ Contains "think" but no markers');
      }
    });

    dverbose(`${targetDivsWithMarkers} target divs contain think markers`);
  }

  /**
   * Processes elements to find thinking block ranges
   * @param {NodeList} allElements - Elements to process
   * @returns {Array} Array of detected thinking block ranges
   */
  processElements(allElements) {
    const ranges = [];
    let currentRange = null;

    ddebug(`Processing ${allElements.length} potential elements`);

    for (const element of allElements) {
      const text = element.textContent.trim();

      dverbose(`Processing element: "${text}"`);

      // Check for start marker (exact match)
      if (!currentRange && text === this.startMarker.replace(/&lt;/g, '<').replace(/&gt;/g, '>')) {
        dverbose('Found START marker element');
        currentRange = {
          startElement: element,
          elements: [element],
          processed: false
        };
      }
      // Check for start marker (HTML entity match)
      else if (!currentRange && element.innerHTML.trim() === this.startMarker) {
        dverbose('Found START marker element (HTML entity)');
        currentRange = {
          startElement: element,
          elements: [element],
          processed: false
        };
      }
      // Check for end marker (exact match)
      else if (currentRange && text === this.endMarker.replace(/&lt;/g, '<').replace(/&gt;/g, '>')) {
        dverbose('Found END marker element');
        currentRange.elements.push(element);
        currentRange.endElement = element;
        ranges.push(currentRange);
        currentRange = null;
      }
      // Check for end marker (HTML entity match)
      else if (currentRange && element.innerHTML.trim() === this.endMarker) {
        dverbose('Found END marker element (HTML entity)');
        currentRange.elements.push(element);
        currentRange.endElement = element;
        ranges.push(currentRange);
        currentRange = null;
      }
      // Add elements in between start and end
      else if (currentRange) {
        dverbose('Adding content element to range');
        currentRange.elements.push(element);
      }
    }

    dinfo(`Found ${ranges.length} thinking blocks`);
    return ranges.filter(range => !this.isProcessed(range));
  }

  /**
   * Checks if a range has already been processed and still has a styled container
   * @param {Object} range - The range to check
   * @returns {boolean} True if already processed and styled container still exists
   */
  isProcessed(range) {
    const key = this.generateRangeKey(range);

    // If not in processed set, definitely not processed
    if (!this.processedBlocks.has(key)) {
      return false;
    }

    // Check if the styled container still exists in the DOM
    const startElement = range.startElement;
    if (startElement && startElement.parentNode) {
      // Look for our styled container near this element
      const nextSibling = startElement.nextSibling;
      if (nextSibling && nextSibling.classList && nextSibling.classList.contains('think-inside-box-container')) {
        return true; // Container exists, still processed
      }

      // Check if this element is inside a styled container
      const container = startElement.closest('.think-inside-box-container');
      if (container) {
        return true; // Element is already styled
      }
    }

    // Container doesn't exist anymore, remove from processed set and allow re-processing
    this.processedBlocks.delete(key);
    ddebug('Styled container missing, allowing re-processing of range');
    return false;
  }

  /**
   * Marks a range as processed
   * @param {Object} range - The range to mark
   */
  markAsProcessed(range) {
    const key = this.generateRangeKey(range);
    this.processedBlocks.add(key);
  }

  /**
   * Generates a unique key for a range
   * @param {Object} range - The range to generate key for
   * @returns {string} Unique identifier
   */
  generateRangeKey(range) {
    return `${range.startElement.outerHTML}-${range.endElement?.outerHTML || ''}`;
  }

  /**
   * Clears processed blocks to allow re-processing on scroll
   */
  clearProcessedBlocks() {
    const count = this.processedBlocks.size;
    this.processedBlocks.clear();
    ddebug(`Cleared ${count} processed blocks for re-processing`);
  }

  /**
   * Manual debug function for console testing
   */
  runDebugAnalysis() {
    dinfo('Manual debug analysis triggered');
    this.debugLogContent();
  }
}

// Export for use by other modules
window.ThinkBlockDetector = ThinkBlockDetector;

// Add global debug function for easy console testing
window.debugThinkAnalysis = function() {
  dinfo('Global debug function called');
  const detector = new ThinkBlockDetector();
  detector.runDebugAnalysis();
};
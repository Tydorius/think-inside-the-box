// Monitoring Module
// Handles real-time monitoring of page changes using MutationObserver

class ThinkBlockMonitor {
  constructor(detector, styler) {
    this.detector = detector;
    this.styler = styler;
    this.observer = null;
    this.processingTimeout = null;
    this.scrollTimeout = null;
    this.isProcessing = false;
    this.lastScrollPosition = 0;
    this.scrollContainer = null;
    this.intersectionObserver = null;
    this.scrollAnchor = null;
  }

  /**
   * Starts monitoring the page for changes
   */
  startMonitoring() {
    console.log('Starting content monitoring');

    // Find the main chat container (adjust selector as needed for JanitorAI)
    const chatContainer = this.findChatContainer();

    if (!chatContainer) {
      console.warn('Chat container not found, monitoring entire body');
      this.monitorElement(document.body);
    } else {
      this.monitorElement(chatContainer);
    }

    // Set up scroll monitoring for React Virtuoso
    this.setupScrollMonitoring();

    // Set up intersection observer for viewport detection
    this.setupIntersectionObserver();

    // Process existing content
    this.processCurrentContent();
  }

  /**
   * Finds the main chat container on JanitorAI
   * @returns {HTMLElement|null} The chat container element
   */
  findChatContainer() {
    // First try to find the React Virtuoso container (most specific)
    const virtuosoContainer = document.querySelector('[data-testid="virtuoso-item-list"]');
    if (virtuosoContainer) {
      console.log('Found React Virtuoso container');
      return virtuosoContainer;
    }

    // Fallback to virtuoso scroller
    const virtuosoScroller = document.querySelector('[data-testid="virtuoso-scroller"]');
    if (virtuosoScroller) {
      console.log('Found Virtuoso scroller container');
      return virtuosoScroller;
    }

    // Common selectors for chat containers (may need adjustment based on actual JanitorAI structure)
    const selectors = [
      '[class*="chat"]',
      '[class*="message"]',
      '[class*="conversation"]',
      '[id*="chat"]',
      'main',
      '.content'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`Found chat container with selector: ${selector}`);
        return element;
      }
    }

    return null;
  }

  /**
   * Sets up scroll monitoring for React Virtuoso
   */
  setupScrollMonitoring() {
    // Find the virtuoso scroller (the scrollable container)
    this.scrollContainer = document.querySelector('[data-testid="virtuoso-scroller"]');

    if (!this.scrollContainer) {
      console.warn('Virtuoso scroller not found, using window scroll');
      this.scrollContainer = window;
    } else {
      console.log('Found virtuoso scroller, setting up scroll monitoring');
    }

    // Set up scroll event listener
    this.scrollContainer.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });

    // Store initial scroll position
    this.lastScrollPosition = this.getScrollPosition();
  }

  /**
   * Gets current scroll position
   * @returns {number} Current scroll position
   */
  getScrollPosition() {
    if (this.scrollContainer === window) {
      return window.scrollY;
    }
    return this.scrollContainer.scrollTop;
  }

  /**
   * Handles scroll events with debouncing
   * @param {Event} event - Scroll event
   */
  handleScroll(event) {
    // Clear existing timeout
    clearTimeout(this.scrollTimeout);

    // Debounce scroll processing to avoid excessive scanning
    this.scrollTimeout = setTimeout(() => {
      const currentPosition = this.getScrollPosition();
      const scrollDelta = Math.abs(currentPosition - this.lastScrollPosition);

      // Only process if user scrolled a significant amount (50px threshold)
      if (scrollDelta > 50) {
        console.log(`Significant scroll detected (${scrollDelta}px), re-scanning for new think blocks`);

        // Clear processed blocks on significant scroll to allow re-processing of newly visible content
        this.detector.clearProcessedBlocks();

        // Temporarily disable scroll events during processing to prevent feedback loops
        this.isProcessing = true;

        this.processCurrentContent();

        // Update last position AFTER processing to get the corrected position
        setTimeout(() => {
          this.lastScrollPosition = this.getScrollPosition();
          this.isProcessing = false;
        }, 100);
      }
    }, 150); // 150ms debounce - faster than mutation observer for responsive scroll
  }

  /**
   * Sets up intersection observer to detect when new content enters viewport
   */
  setupIntersectionObserver() {
    // Create intersection observer to detect new content in viewport
    this.intersectionObserver = new IntersectionObserver((entries) => {
      let hasNewContent = false;

      entries.forEach(entry => {
        // When new content becomes visible, check for think blocks
        if (entry.isIntersecting) {
          const element = entry.target;
          // Check if this element or its children might contain think blocks
          if (element.textContent && element.textContent.toLowerCase().includes('think')) {
            hasNewContent = true;
          }
        }
      });

      if (hasNewContent) {
        console.log('New content detected via intersection observer, re-scanning');
        // Use a small delay to let React finish rendering
        setTimeout(() => this.processCurrentContent(), 100);
      }
    }, {
      // Watch for elements that are at least 10% visible
      threshold: 0.1,
      // Start watching slightly before elements enter viewport
      rootMargin: '50px'
    });

    // Observe the virtuoso item list for new content
    const virtuosoContainer = document.querySelector('[data-testid="virtuoso-item-list"]');
    if (virtuosoContainer) {
      // Observe all direct children of the virtuoso container
      const observer = this.intersectionObserver;
      const observeChildren = () => {
        virtuosoContainer.querySelectorAll('[data-index]').forEach(child => {
          observer.observe(child);
        });
      };

      // Initial observation
      observeChildren();

      // Re-observe when DOM changes (new children added)
      setTimeout(observeChildren, 1000); // Periodic re-check
    }
  }

  /**
   * Sets up MutationObserver for an element
   * @param {HTMLElement} target - Element to monitor
   */
  monitorElement(target) {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
      // Optimize for performance
      attributes: false,
      attributeOldValue: false,
      characterDataOldValue: false
    });

    console.log('MutationObserver started');
  }

  /**
   * Handles detected mutations
   * @param {Array} mutations - Array of mutation records
   */
  handleMutations(mutations) {
    if (this.isProcessing) {
      return;
    }

    // For React Virtuoso, we need faster processing due to virtual scrolling
    const hasVirtuosoChanges = mutations.some(mutation =>
      mutation.target.closest && (
        mutation.target.closest('[data-testid="virtuoso-item-list"]') ||
        mutation.target.closest('[data-virtuoso-scroller]')
      )
    );

    // Use shorter debounce for virtuoso changes, longer for others
    const debounceTime = hasVirtuosoChanges ? 100 : 250;

    // Debounce processing to avoid excessive computation
    clearTimeout(this.processingTimeout);
    this.processingTimeout = setTimeout(() => {
      this.processChanges(mutations);
    }, debounceTime);
  }

  /**
   * Processes detected changes
   * @param {Array} mutations - Array of mutation records
   */
  processChanges(mutations) {
    this.isProcessing = true;
    let hasRelevantChanges = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // Check for new nodes containing thinking markers
        mutation.addedNodes.forEach(node => {
          if (this.containsThinkingMarkers(node)) {
            hasRelevantChanges = true;
          }
        });
      } else if (mutation.type === 'characterData') {
        if (this.containsThinkingMarkers(mutation.target)) {
          hasRelevantChanges = true;
        }
      }
    }

    if (hasRelevantChanges) {
      console.log('Relevant changes detected, processing...');
      this.processCurrentContent();
    }

    this.isProcessing = false;
  }

  /**
   * Checks if a node contains thinking markers
   * @param {Node} node - Node to check
   * @returns {boolean} True if contains markers
   */
  containsThinkingMarkers(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.includes('&lt;think&gt;') ||
             node.textContent.includes('&lt;/think&gt;');
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      return node.textContent.includes('&lt;think&gt;') ||
             node.textContent.includes('&lt;/think&gt;');
    }
    return false;
  }

  /**
   * Processes all current content on the page
   */
  processCurrentContent() {
    try {
      const ranges = this.detector.scanDocument();
      if (ranges.length > 0) {
        // Preserve scroll position and measure content heights before modifying
        const scrollAnchor = this.captureScrollAnchor();
        const heightMeasurements = this.measureContentHeights(ranges);

        const processingResults = this.styler.wrapThinkingBlocks(ranges);

        // Mark ranges as processed
        ranges.forEach(range => {
          this.detector.markAsProcessed(range);
        });

        // Restore scroll position with height compensation
        this.restoreScrollPositionWithHeightAdjustment(scrollAnchor, heightMeasurements, processingResults);
      }
    } catch (error) {
      console.error('Error processing content', error);
    }
  }

  /**
   * Measures the height of content that will be replaced
   * @param {Array} ranges - Ranges that will be processed
   * @returns {Object} Height measurement data
   */
  measureContentHeights(ranges) {
    let totalOriginalHeight = 0;
    const rangeHeights = [];

    ranges.forEach((range, index) => {
      let rangeHeight = 0;

      // Measure height of all elements in the range
      range.elements.forEach(element => {
        if (element && element.offsetHeight) {
          rangeHeight += element.offsetHeight;
          // Also account for margins
          const computedStyle = window.getComputedStyle(element);
          rangeHeight += parseFloat(computedStyle.marginTop) + parseFloat(computedStyle.marginBottom);
        }
      });

      rangeHeights.push(rangeHeight);
      totalOriginalHeight += rangeHeight;
    });

    console.log(`Measured content heights - Total original: ${totalOriginalHeight}px`);

    return {
      totalOriginalHeight,
      rangeHeights,
      timestamp: Date.now()
    };
  }

  /**
   * Captures the current scroll anchor point for position preservation
   * @returns {Object} Scroll anchor information
   */
  captureScrollAnchor() {
    if (!this.scrollContainer) return null;

    const scrollTop = this.getScrollPosition();
    const scrollContainer = this.scrollContainer === window ? document.documentElement : this.scrollContainer;

    // Find a stable reference element in the viewport
    const viewportHeight = scrollContainer.clientHeight || window.innerHeight;
    const targetY = scrollTop + (viewportHeight * 0.3); // 30% down from top of viewport

    // Find the element at this position
    let anchorElement = null;
    let anchorOffset = 0;

    // Look for elements in the virtuoso container
    const virtuosoContainer = document.querySelector('[data-testid="virtuoso-item-list"]');
    if (virtuosoContainer) {
      const items = virtuosoContainer.querySelectorAll('[data-index]');

      for (const item of items) {
        const rect = item.getBoundingClientRect();
        const itemTop = rect.top + scrollTop;

        if (itemTop <= targetY && (itemTop + rect.height) >= targetY) {
          anchorElement = item;
          anchorOffset = targetY - itemTop;
          break;
        }
      }
    }

    // Fallback to document-based search
    if (!anchorElement) {
      const elements = document.elementsFromPoint(
        scrollContainer.clientWidth / 2,
        viewportHeight * 0.3
      );

      anchorElement = elements.find(el =>
        el.offsetHeight > 10 &&
        el !== scrollContainer &&
        !el.classList.contains('think-inside-box-container')
      );

      if (anchorElement) {
        const rect = anchorElement.getBoundingClientRect();
        anchorOffset = (viewportHeight * 0.3) - rect.top;
      }
    }

    console.log('Captured scroll anchor', {
      scrollTop,
      anchorElement: anchorElement?.tagName,
      anchorOffset,
      dataIndex: anchorElement?.getAttribute('data-index')
    });

    return {
      scrollTop,
      anchorElement,
      anchorOffset,
      timestamp: Date.now()
    };
  }

  /**
   * Restores scroll position using the captured anchor
   * @param {Object} scrollAnchor - Previously captured scroll anchor
   */
  restoreScrollPosition(scrollAnchor) {
    if (!scrollAnchor || !scrollAnchor.anchorElement || !this.scrollContainer) {
      return;
    }

    // Use requestAnimationFrame to ensure DOM has been updated
    requestAnimationFrame(() => {
      try {
        const anchorElement = scrollAnchor.anchorElement;

        // Check if anchor element still exists and is visible
        if (!document.contains(anchorElement)) {
          console.log('Anchor element no longer exists, using fallback');
          this.fallbackScrollRestore(scrollAnchor);
          return;
        }

        const rect = anchorElement.getBoundingClientRect();
        const currentScrollTop = this.getScrollPosition();

        // Calculate where the anchor element should be
        const desiredAnchorTop = rect.top + currentScrollTop - scrollAnchor.anchorOffset;

        // Calculate the difference and adjust
        const scrollDifference = desiredAnchorTop - (currentScrollTop + rect.top - scrollAnchor.anchorOffset);

        if (Math.abs(scrollDifference) > 5) { // Only adjust if difference is significant
          const newScrollTop = currentScrollTop + scrollDifference;

          // Smooth scroll to new position
          if (this.scrollContainer === window) {
            window.scrollTo({
              top: newScrollTop,
              behavior: 'instant' // Use instant to avoid user confusion
            });
          } else {
            this.scrollContainer.scrollTop = newScrollTop;
          }

          console.log(`Restored scroll position (adjusted by ${scrollDifference.toFixed(1)}px)`);
        }
      } catch (error) {
        console.warn('Error restoring scroll position:', error);
        this.fallbackScrollRestore(scrollAnchor);
      }
    });
  }

  /**
   * Restores scroll position with height-based adjustments for content changes
   * @param {Object} scrollAnchor - Previously captured scroll anchor
   * @param {Object} heightMeasurements - Original content height data
   * @param {Object} processingResults - Results from styling operation
   */
  restoreScrollPositionWithHeightAdjustment(scrollAnchor, heightMeasurements, processingResults) {
    if (!scrollAnchor || !this.scrollContainer) {
      return;
    }

    // Use requestAnimationFrame to ensure DOM has been updated and containers are measured
    requestAnimationFrame(() => {
      // Wait a bit more for container heights to stabilize
      setTimeout(() => {
        try {
          this.performHeightAdjustedRestore(scrollAnchor, heightMeasurements, processingResults);
        } catch (error) {
          console.warn('Error in height-adjusted restore:', error);
          this.restoreScrollPosition(scrollAnchor);
        }
      }, 50);
    });
  }

  /**
   * Performs the actual height-adjusted scroll restoration
   * @param {Object} scrollAnchor - Previously captured scroll anchor
   * @param {Object} heightMeasurements - Original content height data
   * @param {Object} processingResults - Results from styling operation
   */
  performHeightAdjustedRestore(scrollAnchor, heightMeasurements, processingResults) {
    const currentScrollTop = this.getScrollPosition();
    let totalHeightDifference = 0;

    // Calculate the actual height difference between original content and new containers
    if (processingResults.containers && processingResults.containers.length > 0) {
      let totalNewHeight = 0;

      // Measure actual container heights
      processingResults.containers.forEach((container, index) => {
        if (container && document.contains(container)) {
          const containerHeight = container.offsetHeight;
          const computedStyle = window.getComputedStyle(container);
          const fullHeight = containerHeight +
            parseFloat(computedStyle.marginTop || 0) +
            parseFloat(computedStyle.marginBottom || 0);

          totalNewHeight += fullHeight;

          console.log(`Container ${index} actual height: ${fullHeight}px`);
        }
      });

      // Calculate the difference: negative means content got smaller (condensed)
      totalHeightDifference = totalNewHeight - heightMeasurements.totalOriginalHeight;

      console.log(`Height difference calculation:
        Original: ${heightMeasurements.totalOriginalHeight}px
        New: ${totalNewHeight}px
        Difference: ${totalHeightDifference}px`);
    }

    // Determine if we need anchor-based or height-based adjustment
    if (scrollAnchor.anchorElement && document.contains(scrollAnchor.anchorElement)) {
      // Use anchor-based restoration with height compensation
      this.performAnchorBasedRestore(scrollAnchor, totalHeightDifference);
    } else {
      // Use height-based restoration as fallback
      this.performHeightBasedRestore(scrollAnchor, totalHeightDifference);
    }
  }

  /**
   * Performs anchor-based restoration with height compensation
   * @param {Object} scrollAnchor - Previously captured scroll anchor
   * @param {number} totalHeightDifference - Total height change in content
   */
  performAnchorBasedRestore(scrollAnchor, totalHeightDifference) {
    const anchorElement = scrollAnchor.anchorElement;
    const rect = anchorElement.getBoundingClientRect();
    const currentScrollTop = this.getScrollPosition();

    // Calculate where the anchor should be positioned
    const desiredScrollTop = scrollAnchor.scrollTop;

    // For content above the anchor, we need to adjust for height changes
    // If content got smaller (negative difference), we should scroll up less
    // If content got larger (positive difference), we should scroll down more
    const heightAdjustment = this.calculateHeightAdjustmentForAnchor(
      scrollAnchor,
      totalHeightDifference
    );

    const adjustedScrollTop = desiredScrollTop + heightAdjustment;

    if (Math.abs(adjustedScrollTop - currentScrollTop) > 5) {
      this.scrollToPosition(adjustedScrollTop);

      console.log(`Anchor-based restore:
        Original scroll: ${scrollAnchor.scrollTop}px
        Height adjustment: ${heightAdjustment}px
        Final scroll: ${adjustedScrollTop}px`);
    }
  }

  /**
   * Calculates height adjustment needed based on anchor position
   * @param {Object} scrollAnchor - Previously captured scroll anchor
   * @param {number} totalHeightDifference - Total height change in content
   * @returns {number} Height adjustment to apply
   */
  calculateHeightAdjustmentForAnchor(scrollAnchor, totalHeightDifference) {
    // If we don't have height difference data, return 0
    if (Math.abs(totalHeightDifference) < 5) {
      return 0;
    }

    // For virtual scrolling environments like React Virtuoso,
    // most content changes happen above the current viewport
    // So we typically need to adjust by most of the height difference

    // Use a factor based on how far down the page we are
    const scrollTop = scrollAnchor.scrollTop;
    const scrollContainer = this.scrollContainer === window ? document.documentElement : this.scrollContainer;
    const scrollHeight = scrollContainer.scrollHeight;

    // Calculate what portion of the page we've scrolled through
    const scrollRatio = Math.min(1, scrollTop / Math.max(1, scrollHeight - scrollContainer.clientHeight));

    // Apply most of the height difference, weighted by scroll position
    // More scroll = more likely that changes are above us = more adjustment needed
    const adjustmentFactor = 0.7 + (scrollRatio * 0.3); // 70% to 100% of the difference

    return totalHeightDifference * adjustmentFactor;
  }

  /**
   * Performs height-based restoration as fallback
   * @param {Object} scrollAnchor - Previously captured scroll anchor
   * @param {number} totalHeightDifference - Total height change in content
   */
  performHeightBasedRestore(scrollAnchor, totalHeightDifference) {
    const currentScrollTop = this.getScrollPosition();

    // Simple height-based adjustment
    // If content got smaller, scroll up by some portion of the difference
    // If content got larger, scroll down by some portion of the difference
    const adjustment = totalHeightDifference * 0.8; // Use 80% of the height difference

    const targetScrollTop = Math.max(0, scrollAnchor.scrollTop + adjustment);

    if (Math.abs(targetScrollTop - currentScrollTop) > 5) {
      this.scrollToPosition(targetScrollTop);

      console.log(`Height-based restore:
        Original scroll: ${scrollAnchor.scrollTop}px
        Height adjustment: ${adjustment}px
        Final scroll: ${targetScrollTop}px`);
    }
  }

  /**
   * Utility method to scroll to a specific position
   * @param {number} scrollTop - Target scroll position
   */
  scrollToPosition(scrollTop) {
    const clampedScrollTop = Math.max(0, scrollTop);

    if (this.scrollContainer === window) {
      window.scrollTo({
        top: clampedScrollTop,
        behavior: 'instant'
      });
    } else {
      this.scrollContainer.scrollTop = clampedScrollTop;
    }
  }

  /**
   * Fallback scroll restoration method
   * @param {Object} scrollAnchor - Previously captured scroll anchor
   */
  fallbackScrollRestore(scrollAnchor) {
    if (!scrollAnchor || !this.scrollContainer) return;

    // Simple fallback: restore original scroll position
    if (this.scrollContainer === window) {
      window.scrollTo({
        top: scrollAnchor.scrollTop,
        behavior: 'instant'
      });
    } else {
      this.scrollContainer.scrollTop = scrollAnchor.scrollTop;
    }

    console.log('Used fallback scroll restoration');
  }

  /**
   * Stops monitoring
   */
  stopMonitoring() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Clean up scroll monitoring
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.handleScroll.bind(this));
    }

    // Clean up intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    clearTimeout(this.processingTimeout);
    clearTimeout(this.scrollTimeout);
    console.log('Monitoring stopped');
  }
}

// Export for use by main script
window.ThinkBlockMonitor = ThinkBlockMonitor;
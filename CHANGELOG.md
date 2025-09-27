# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-09-23

### Added
- **Window Focus Recovery**: Automatic re-detection of think blocks when JanitorAI tab regains focus
  - Addresses issue where extension stops working when tab loses focus
  - 500ms delay ensures DOM is ready before re-scanning
  - Triggers manual check function with processed block clearing
- **Floating Control Panel**: Interactive control interface for manual think block detection
  - Single manual check button with visual feedback during processing
  - Position controlled via dropdown in extension settings (top-left, top-right, bottom-left, bottom-right)
  - Theme-aware styling matches selected extension theme
- **Enhanced User Control**: Manual recovery capability without page refresh requirement
- **Settings Integration**: Control panel visibility and position managed through extension popup

### Fixed
- Extension stopping unexpectedly when browser tab loses focus
- Manual recovery requiring full page refresh when extension fails
- Lack of user agency when automatic detection fails
- **Debug Mode Console Output**: Debug messages now respect the debug mode checkbox setting
  - Console output was appearing even when debug mode was disabled
  - Centralized debug utility with verbosity levels (0=critical, 1=info, 2=debug, 3=verbose)
  - Replaced direct console.log calls with debug utility functions

### Technical Implementation
- New `ThinkBlockControlPanel` class with modular design
- Window focus event listener with debounced recovery mechanism
- Semi-transparent floating UI with backdrop blur effects
- Theme-aware control panel styling system
- Integration with existing settings and storage systems
- Proper cleanup and lifecycle management for control panel
- **Debug Utility System**: Centralized debug logging with verbosity control
  - `debug-utils.js` module with debug utility functions
  - Global debug mode and verbosity settings management
  - Console helper functions for runtime debug control

## [1.0.1] - 2025-09-16

### Added
- Initial release of Think Inside the Box Firefox extension
- Automatic detection and styling of `<think></think>` blocks on JanitorAI
- Multiple theme support:
  - Default theme with JanitorAI-compatible dark purple styling
  - Dark theme for low-light environments
  - Minimal theme for clean appearance
  - Custom theme with full color customization
- Advanced settings panel with:
  - Debug mode toggle for troubleshooting
  - Configurable periodic check interval (1-10 seconds)
  - Scroll position memory toggle
- Streaming detection system using UI state monitoring
- Enhanced scroll position preservation with height difference calculations
- React Virtuoso virtual scrolling compatibility
- Live preview in settings popup
- Responsive design for different container sizes

### Changed
- Default container height reduced from 300px to 200px for better proportions
- Default theme colors updated to match JanitorAI's darker purple aesthetic:
  - Background: `#313338` to `#2d2f32` gradient
  - Border: `#5b21b6` (deep purple)
  - Text: `#c6a3ff` (light purple)
  - Markers: `#5b21b6` background with `#c6a3ff` text

### Fixed
- Streaming text detection issues by implementing UI state monitoring
- Content reversion problem during React DOM replacement
- Scroll position jumping during virtual scrolling
- Duplicate detection of think blocks across multiple DOM representations
- Content padding issues preventing bullet points from touching container edges
- Firefox manifest validation errors for extension ID format
- Advanced settings section layout and spacing in popup interface

### Technical Implementation
- MutationObserver with optimized debouncing for different content types
- IntersectionObserver for viewport change detection
- Send button state monitoring to detect streaming phases
    - React virtual DOM behavior addressed through JanitorAI button state detection
- Height measurement system for precise scroll position restoration
    - Optional scroll position memory due to virtual scrolling complexities
- Settings persistence via Chrome storage sync API
- Modular architecture with separate detector, styler, and monitor classes

### Performance Improvements
- Reduced processing frequency during streaming
- Smart content change detection to avoid unnecessary processing
- Conditional scroll position restoration
- Optimized periodic checks with user-configurable intervals
- Enhanced debouncing for React Virtuoso compatibility

### Development
- Comprehensive debug logging system with toggle control
- Improved documentation and user interface
- Mozilla Add-ons validation compliance
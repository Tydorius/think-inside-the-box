# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-16

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
    - React is a bit wonky, but since JanitorAI swaps the button during streaming this let me rely on JAI for the heavy lifting.
- Height measurement system for precise scroll position restoration
    - It's still a bit more jumpy than I'd like, which is why this is now something which can be disabled.
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
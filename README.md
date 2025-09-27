# Think Inside the Box

A Firefox extension that recreates the defunct `<think>` wrapper functionality on JanitorAI chat pages.

## Overview

JanitorAI previously had a feature that automatically wrapped AI thinking blocks in collapsible, styled containers. This extension restores that functionality with enhanced customization options, allowing users to view thinking processes in organized, scrollable boxes.

## Features

- **Automatic Detection**: Identifies and wraps `<think></think>` blocks in real-time
- **Multiple Themes**: Choose from Default (dark purple), Dark, Minimal, or Custom themes
- **Customizable Styling**: Adjust height, font size, colors, and typography
- **Scroll Position Preservation**: Maintains your reading position when blocks are processed
- **React Virtuoso Compatible**: Works seamlessly with JanitorAI's virtual scrolling
- **Live Preview**: See styling changes instantly in the settings panel
- **Streaming Detection**: Intelligently detects when AI responses are streaming to prevent conflicts
- **Advanced Settings**: Configure debug mode, check intervals, and scroll behavior
- **Smart Processing**: Only processes content when DOM is stable, avoiding duplication
- **Window Focus Recovery**: Automatically re-detects thinking blocks when tab regains focus
- **Manual Control Panel**: Floating interface for manual triggering and position control
- **Intelligent Debug System**: Verbosity-controlled debug logging that respects settings

## Installation

### From Mozilla Add-ons (Recommended)
1. Navigate to the add-on [page](https://addons.mozilla.org/en-US/developers/addon/think-inside-the-box)
2. Click 'Add to Firefox'

### Manual Installation
1. Download the latest release from the [Releases page](https://github.com/Tydorius/think-inside-the-box/releases)
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the sidebar
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the extracted download

### From Source
1. Clone this repository:
   ```bash
   git clone https://github.com/Tydorius/think-inside-the-box.git
   ```
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" → "Load Temporary Add-on"
4. Select the `manifest.json` file from the cloned directory

## Usage

1. Navigate to any JanitorAI chat page (`https://janitorai.com/chats/*`)
2. The extension automatically detects and styles thinking blocks
3. Use the **floating control panel** (bottom-right corner by default) for manual control:
   - **Manual Check Button**: Manually scan for new thinking blocks
4. Click the extension icon in the toolbar to access full settings
5. Customize appearance, themes, and behavior as desired

### Settings

- **Enable/Disable**: Toggle the extension on/off
- **Theme Selection**: Choose from predefined themes or create custom styling
- **Height Control**: Adjust maximum container height (default: 200px)
- **Typography**: Customize font size and family
- **Custom Colors**: Set background, border, text, and marker colors (Custom theme)

#### Advanced Settings
- **Debug Mode**: Enable detailed console logging for troubleshooting
- **Debug Verbosity**: Control detail level of debug output (0=critical, 1=info, 2=debug, 3=verbose)
- **Check Interval**: Configure how often to scan for new thinking blocks (1-10 seconds)
- **Scroll Position Memory**: Toggle scroll position preservation during processing
- **Control Panel**: Show/hide floating control panel and set position (top-left, top-right, bottom-left, bottom-right)

## Compatibility

- **Browser**: Firefox (Manifest V3)
- **Website**: JanitorAI chat pages
- **Scrolling**: Optimized for React Virtuoso virtual scrolling

## Development

This extension is built with vanilla JavaScript and uses:
- MutationObserver for real-time content detection
- IntersectionObserver for viewport change detection
- Chrome Extension APIs for settings persistence
- Custom scroll position preservation algorithms

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Mozilla Public License 2.0 - see the [LICENSE](LICENSE) file for details.

## Author

**Tydorius**
- GitHub: [@Tydorius](https://github.com/Tydorius)
- Repository: [think-inside-the-box](https://github.com/Tydorius/think-inside-the-box)

## Support

If you encounter any issues or have questions:
- Check the [Issues page](https://github.com/Tydorius/think-inside-the-box/issues)
- Create a new issue with detailed information about the problem
- Include your Firefox version and any relevant console errors

## Troubleshooting

### Extension Stops Working
If the extension stops detecting thinking blocks:
1. **Use Manual Check**: Click the search button in the floating control panel
2. **Tab Focus**: Switch away from the tab and back - the extension automatically re-scans
3. **Refresh Page**: As a last resort, refresh the JanitorAI chat page

### No Control Panel Visible
The floating control panel can be toggled in the extension settings. If it's hidden, click the extension icon and enable "Control Panel" in Advanced Settings.

### Debug Console Logs
To enable detailed logging for troubleshooting:
1. Open extension settings
2. Enable "Debug Mode" in Advanced Settings
3. Adjust "Debug Verbosity" (2=debug recommended)
4. Open Firefox Developer Tools (F12) and check the Console tab

## Changelog

For detailed version history, see [CHANGELOG.md](CHANGELOG.md).
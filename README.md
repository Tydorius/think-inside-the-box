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

## Installation

### From Mozilla Add-ons (Recommended)
*Mozilla Add-ons link will be added once the extension is approved*

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
3. Click the extension icon in the toolbar to access settings
4. Customize appearance, themes, and behavior as desired

### Settings

- **Enable/Disable**: Toggle the extension on/off
- **Theme Selection**: Choose from predefined themes or create custom styling
- **Height Control**: Adjust maximum container height (default: 200px)
- **Typography**: Customize font size and family
- **Custom Colors**: Set background, border, text, and marker colors (Custom theme)

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

For development documentation, see `DEV_README.md`.

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

## Changelog

### v1.0.0
- Initial release
- Automatic thinking block detection and styling
- Multiple theme support with customization options
- Scroll position preservation
- React Virtuoso compatibility
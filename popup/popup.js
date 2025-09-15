// Popup JavaScript
// Handles settings interface and storage

class SettingsManager {
    constructor() {
        this.defaultSettings = {
            enabled: true,
            theme: 'default',
            maxHeight: 200,
            fontSize: 13,
            fontFamily: 'Consolas, monospace',
            // Custom theme colors
            backgroundColor: '#313338',
            borderColor: '#5b21b6',
            textColor: '#c6a3ff',
            markerColor: '#8e67ff'
        };

        this.currentSettings = { ...this.defaultSettings };
        this.elements = {};

        this.init();
    }

    async init() {
        this.bindElements();
        this.bindEvents();
        await this.loadSettings();
        this.updateUI();
        this.updatePreview();
    }

    bindElements() {
        // Main controls
        this.elements.enabled = document.getElementById('enabled');
        this.elements.theme = document.getElementById('theme');
        this.elements.maxHeight = document.getElementById('maxHeight');
        this.elements.maxHeightValue = document.getElementById('maxHeightValue');
        this.elements.fontSize = document.getElementById('fontSize');
        this.elements.fontSizeValue = document.getElementById('fontSizeValue');
        this.elements.fontFamily = document.getElementById('fontFamily');

        // Custom theme controls
        this.elements.customThemeSettings = document.getElementById('customThemeSettings');
        this.elements.backgroundColor = document.getElementById('backgroundColor');
        this.elements.borderColor = document.getElementById('borderColor');
        this.elements.textColor = document.getElementById('textColor');
        this.elements.markerColor = document.getElementById('markerColor');

        // Buttons and status
        this.elements.saveSettings = document.getElementById('saveSettings');
        this.elements.resetSettings = document.getElementById('resetSettings');
        this.elements.statusMessage = document.getElementById('statusMessage');
        this.elements.preview = document.getElementById('preview');
    }

    bindEvents() {
        // Settings change events
        this.elements.enabled.addEventListener('change', () => this.updatePreview());
        this.elements.theme.addEventListener('change', () => {
            this.toggleCustomTheme();
            this.updatePreview();
        });

        // Range sliders with live updates
        this.elements.maxHeight.addEventListener('input', () => {
            this.elements.maxHeightValue.textContent = this.elements.maxHeight.value + 'px';
            this.updatePreview();
        });

        this.elements.fontSize.addEventListener('input', () => {
            this.elements.fontSizeValue.textContent = this.elements.fontSize.value + 'px';
            this.updatePreview();
        });

        this.elements.fontFamily.addEventListener('change', () => this.updatePreview());

        // Custom theme color changes
        this.elements.backgroundColor.addEventListener('input', () => this.updatePreview());
        this.elements.borderColor.addEventListener('input', () => this.updatePreview());
        this.elements.textColor.addEventListener('input', () => this.updatePreview());
        this.elements.markerColor.addEventListener('input', () => this.updatePreview());

        // Button clicks
        this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        this.elements.resetSettings.addEventListener('click', () => this.resetSettings());
    }

    async loadSettings() {
        try {
            if (chrome.storage && chrome.storage.sync) {
                const stored = await chrome.storage.sync.get();
                this.currentSettings = { ...this.defaultSettings, ...stored };
                console.log('Loaded settings:', this.currentSettings);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.showStatus('Failed to load settings', 'error');
        }
    }

    updateUI() {
        // Update form controls with current settings
        this.elements.enabled.checked = this.currentSettings.enabled;
        this.elements.theme.value = this.currentSettings.theme;
        this.elements.maxHeight.value = this.currentSettings.maxHeight;
        this.elements.maxHeightValue.textContent = this.currentSettings.maxHeight + 'px';
        this.elements.fontSize.value = this.currentSettings.fontSize;
        this.elements.fontSizeValue.textContent = this.currentSettings.fontSize + 'px';
        this.elements.fontFamily.value = this.currentSettings.fontFamily;

        // Update custom theme colors
        this.elements.backgroundColor.value = this.currentSettings.backgroundColor;
        this.elements.borderColor.value = this.currentSettings.borderColor;
        this.elements.textColor.value = this.currentSettings.textColor;
        this.elements.markerColor.value = this.currentSettings.markerColor;

        // Show/hide custom theme section
        this.toggleCustomTheme();
    }

    toggleCustomTheme() {
        const isCustom = this.elements.theme.value === 'custom';
        this.elements.customThemeSettings.style.display = isCustom ? 'block' : 'none';
    }

    updatePreview() {
        const preview = this.elements.preview;
        const isEnabled = this.elements.enabled.checked;

        if (!isEnabled) {
            preview.style.opacity = '0.5';
            preview.innerHTML = '<div style="text-align: center; color: #6c757d;">Extension Disabled</div>';
            return;
        }

        preview.style.opacity = '1';

        // Get current values from form
        const maxHeight = this.elements.maxHeight.value;
        const fontSize = this.elements.fontSize.value;
        const fontFamily = this.elements.fontFamily.value;
        const theme = this.elements.theme.value;

        // Apply theme-specific or custom colors
        let backgroundColor, borderColor, textColor, markerBgColor, markerTextColor;

        switch (theme) {
            case 'dark':
                backgroundColor = 'linear-gradient(145deg, #2d3748, #1a202c)';
                borderColor = '#4a5568';
                textColor = '#e2e8f0';
                markerBgColor = '#4a5568';
                markerTextColor = '#cbd5e0';
                break;
            case 'minimal':
                backgroundColor = '#ffffff';
                borderColor = '#e0e0e0';
                textColor = '#333333';
                markerBgColor = '#f5f5f5';
                markerTextColor = '#666666';
                break;
            case 'custom':
                backgroundColor = this.elements.backgroundColor.value;
                borderColor = this.elements.borderColor.value;
                textColor = this.elements.textColor.value;
                markerBgColor = this.elements.markerColor.value;
                markerTextColor = this.getContrastColor(markerBgColor);
                break;
            default: // default theme - matching JanitorAI's dark purple/slate styling
                backgroundColor = 'linear-gradient(145deg, #313338, #2d2f32)';
                borderColor = '#5b21b6';
                textColor = '#c6a3ff';
                markerBgColor = '#5b21b6';
                markerTextColor = '#c6a3ff';
        }

        // Apply styles to preview
        preview.style.maxHeight = maxHeight + 'px';
        preview.style.fontSize = fontSize + 'px';
        preview.style.fontFamily = fontFamily;
        preview.style.background = backgroundColor;
        preview.style.borderColor = borderColor;
        preview.style.color = textColor;

        // Update marker styles
        const markers = preview.querySelectorAll('.think-inside-box-marker');
        markers.forEach(marker => {
            marker.style.backgroundColor = markerBgColor;
            marker.style.color = markerTextColor;
            marker.style.borderColor = borderColor;
        });
    }

    // Helper function to get contrasting text color
    getContrastColor(hexColor) {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    async saveSettings() {
        try {
            // Gather all settings from form
            const settings = {
                enabled: this.elements.enabled.checked,
                theme: this.elements.theme.value,
                maxHeight: parseInt(this.elements.maxHeight.value),
                fontSize: parseInt(this.elements.fontSize.value),
                fontFamily: this.elements.fontFamily.value,
                backgroundColor: this.elements.backgroundColor.value,
                borderColor: this.elements.borderColor.value,
                textColor: this.elements.textColor.value,
                markerColor: this.elements.markerColor.value
            };

            if (chrome.storage && chrome.storage.sync) {
                await chrome.storage.sync.set(settings);
                this.currentSettings = settings;
                this.showStatus('Settings saved successfully!', 'success');
                console.log('Settings saved:', settings);

                // Notify content scripts about settings change
                this.notifyContentScripts();
            } else {
                throw new Error('Storage not available');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showStatus('Failed to save settings', 'error');
        }
    }

    async resetSettings() {
        this.currentSettings = { ...this.defaultSettings };
        this.updateUI();
        this.updatePreview();
        await this.saveSettings();
        this.showStatus('Settings reset to defaults', 'success');
    }

    showStatus(message, type) {
        const status = this.elements.statusMessage;
        status.textContent = message;
        status.className = `status-message ${type}`;

        // Auto-hide after 3 seconds
        setTimeout(() => {
            status.style.opacity = '0';
        }, 3000);
    }

    async notifyContentScripts() {
        try {
            // Query for JanitorAI tabs and send settings update
            const tabs = await chrome.tabs.query({ url: '*://janitorai.com/chats/*' });

            for (const tab of tabs) {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'SETTINGS_UPDATED',
                    settings: this.currentSettings
                }).catch(() => {
                    // Ignore errors for tabs where content script isn't ready
                });
            }
        } catch (error) {
            console.log('Could not notify content scripts:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup loaded');
    new SettingsManager();
});
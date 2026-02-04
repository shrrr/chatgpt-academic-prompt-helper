# ChatGPT Academic Prompt Helper (Multi-Platform)

> 🚀 Enhanced fork with multi-platform and multi-browser support

A Tampermonkey/Greasemonkey userscript that provides quick access to academic prompts for ChatGPT, Claude.ai, and Gemini.

## ✨ Features

- 📝 Built-in academic prompt templates
- 🌐 Multi-platform support: ChatGPT, Claude.ai, Gemini
- 🔧 Multi-browser support: Chrome, Safari, Firefox, Edge
- ⚡ Keyboard shortcuts (Cmd/Ctrl + Shift + F)
- 🛡️ Stable DOM handling with MutationObserver
- 🍎 Safari-specific optimizations

## 🎯 Improvements Over Original

This is a fork of [ZinYY/chatgpt-academic-prompt-helper](https://github.com/ZinYY/chatgpt-academic-prompt-helper) with the following enhancements:

- ✅ Added support for Claude.ai and Gemini
- ✅ Fixed Safari compatibility issues
- ✅ Improved DOM stability with MutationObserver
- ✅ Enhanced cross-browser compatibility
- ✅ Better error handling and recovery

## 📦 Installation

### Method 1: Direct Install
1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download `chatgpt_academic_helper.js`
3. Drag and drop the file into your userscript manager

### Method 2: Manual Install
1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Create a new userscript
3. Copy and paste the contents of `chatgpt_academic_helper.js`
4. Save

## 🎮 Usage

### Open Prompt Panel
- Click the "学术助手" button on the right side of the page
- Or use keyboard shortcut: `Cmd+Shift+F` (Mac) / `Ctrl+Shift+F` (Windows/Linux)

### Insert Prompt
- Click on any prompt template to insert it into the input field

### Close Panel
- Press `Cmd+Shift+F` / `Ctrl+Shift+F` again
- Press `ESC`
- Click anywhere outside the panel

### Customize Prompts
Edit the `SHORTCUTS` array in `chatgpt_academic_helper.js` to add your own prompts.

## 🛠️ Supported Platforms

- ✅ ChatGPT (chat.openai.com, chatgpt.com)
- ✅ Claude.ai (claude.ai)
- ✅ Gemini (gemini.google.com)

## 🌐 Supported Browsers

- ✅ Chrome
- ✅ Safari
- ✅ Firefox
- ✅ Edge
- ✅ Any browser that supports Tampermonkey/Greasemonkey

## 📝 Credits

- Original project: [ZinYY/chatgpt-academic-prompt-helper](https://github.com/ZinYY/chatgpt-academic-prompt-helper)
- Prompt templates inspired by: [ChatGPT Academic](https://github.com/binary-husky/chatgpt_academic)
- Based on: [ChatGPT Prompt Scripts](https://github.com/winchesHe/chatGPT-prompt-scripts)

## 📄 License

MIT License

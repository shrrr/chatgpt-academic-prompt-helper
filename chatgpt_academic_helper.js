/*!
// ==UserScript==
// @name          ChatGPT-academic-prompt-helper
// @namespace     https://github.com/ZinYY/chatgpt-academic-prompt-helper
// @version       0.1.9
// @description   Fix: inject CSS (no Tailwind on ChatGPT), correct close/isOpen logic, prevent page layout shifting
// @homepage      https://github.com/ZinYY/chatgpt-academic-prompt-helper
// @author        ZinYY
// @match         *://chat.openai.com/*
// @match         *://chatgpt.com/*
// @match         *://claude.ai/*
// @match         *://gemini.google.com/*
// @grant         none
// @license MIT
// ==/UserScript==
*/
(function () {
    "use strict";
    if (document.querySelector("#chatgptHelper")) {
        return;
    }

    // ============ FIX 1: Inject CSS (ChatGPT page doesn't include Tailwind) ============
    const style = document.createElement("style");
    style.textContent = `
#chatgptHelper { all: initial; } /* isolate from page styles (optional but helpful) */
#chatgptHelper, #chatgptHelper * { box-sizing: border-box; font-family: system-ui,-apple-system,Segoe UI,Roboto,Arial,"Noto Sans","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif; }

#chatgptHelperOpen{
  position: fixed;
  top: 50%;
  right: 4px;
  transform: translateY(-50%);
  z-index: 999999;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #fff;
  background: #111827;
  border: 1px solid rgba(255,255,255,.2);
  user-select: none;
  line-height: 1.1;
}
#chatgptHelperOpen:hover{ background:#374151; }

#chatgptHelperMain{
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 384px; /* w-96 */
  z-index: 999998;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 12px;
  color: #f3f4f6;
  background: #111827;
  transform: translateX(100%);
  transition: transform .2s ease;
}

#chatgptHelperHeader{
  padding: 14px 6px;
}
#chatgptHelperHeader a{ color:#93c5fd; text-decoration:none; }
#chatgptHelperHeader a:hover{ text-decoration:underline; }

#chatgptHelperList{
  flex: 0 1 auto;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding: 12px 0;
  border-top: 1px solid rgba(255,255,255,.2);
  border-bottom: 1px solid rgba(255,255,255,.2);
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 0;
  list-style: none;
}
#chatgptHelperList li{
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  background: rgba(255,255,255,.06);
  font-size: 13px;
  line-height: 1.3;
  user-select: none;
}
#chatgptHelperList li:hover{ background: rgba(255,255,255,.14); }

#chatgptHelperFooter{
  display:flex;
  align-items:center;
  padding: 12px 0;
  gap: 8px;
}
#chatgptHelperClose{
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  background: rgba(255,255,255,.06);
  user-select: none;
}
#chatgptHelperClose:hover{ background: rgba(255,255,255,.14); }

#chatgptHelperDonate{
  margin-left: auto;
  font-size: 13px;
}
#chatgptHelperDonate a{
  color:#93c5fd;
  text-decoration:none;
  padding: 8px 10px;
  border-radius: 8px;
}
#chatgptHelperDonate a:hover{ background: rgba(255,255,255,.10); }
`;
    document.head.appendChild(style);

    var SHORTCUTS = [
        [
            "✍️ 学术润色与改写 (专家模式)",
            "<context>\n你是一位拥有多年顶级期刊 (如 IEEE, Nature, Science )编辑经验的资深学术英语润色专家。你的任务是优化一段给定的学术论文草稿,使其达到高水平期刊的发表标准。\n</context>\n<instructions>\n请对提供的文本进行深度润色,具体要求如下: \n1. **语言提升**: \n   - 修正所有拼写、语法和标点错误。\n   - 提升词汇的学术性 (Academic Register ),将口语化或非正式的表达替换为更精准的学术用语。\n   - 优化句式结构,增强句子的连贯性 (Cohesion )和简洁性 (Concision ),避免冗长或晦涩的表达。\n2. **重写要求**: \n   - 在必要时,大胆重写整个句子以改善逻辑流 (Flow ),但必须严格保留原句的核心技术含义 (Technical Meaning )。\n   - 确保语气正式、客观且权威。\n3. **修改说明**: \n   - 必须提供一个详细的 Markdown 表格,列出每一处具体的修改及其理由。\n</instructions>\n<output_requirements>\n请严格按照以下两部分进行输出: \n**Part 1: Polished Version**\n直接展示润色后的完整段落。\n**Part 2: Modification Log**\n使用 Markdown 表格展示修改细节,表格应包含以下三列: \n| Original Fragment (原文片段) | Improved Version (优化版本) | Rationale (修改理由 - 解释语法、选词或逻辑上的改进原因) |\n</output_requirements>",
        ],
    ];

    var rootEle = document.createElement("div");
    rootEle.id = "chatgptHelper";

    // ============ FIX 2: Use our own ids and avoid Tailwind-only classes ============
    rootEle.innerHTML =
        '<div id="chatgptHelperOpen">学<br>术<br>助<br>手</div>' +
        '<div id="chatgptHelperMain">' +
        '  <div id="chatgptHelperHeader">' +
        '    <a href="https://github.com/shrrr/chatgpt-academic-prompt-helper" target="_blank">ChatGPT Academic Helper (ctrl+shift+F)</a>' +
        '  </div>' +
        '  <ul id="chatgptHelperList">' +
        SHORTCUTS.map(function (_a) {
            var label = _a[0],
                value = _a[1];
            return (
                '<li data-value="' +
                encodeURI(value) +
                '">' +
                label +
                "</li>"
            );
        }).join("") +
        "  </ul>" +
        '  <div id="chatgptHelperFooter">' +
        '    <div id="chatgptHelperClose">关闭</div>' +
        "  </div>" +
        "</div>";

    document.body.appendChild(rootEle);

    var chatgptHelperMain = document.querySelector("#chatgptHelperMain");
    var isOpen = false;

    function openChatgptHelper() {
        chatgptHelperMain.style.transform = "translateX(0)";
        isOpen = true;
    }
    function closeChatgptHelper() {
        chatgptHelperMain.style.transform = "translateX(100%)";
        isOpen = false;
    }

    // ============ FIX 3: Robust close/open behavior ============
    // Toggle by clicking the open button
    document
        .querySelector("#chatgptHelperOpen")
        .addEventListener("click", function (e) {
            e.stopPropagation();
            if (!isOpen) openChatgptHelper();
            else closeChatgptHelper();
        });

    // Prevent clicks inside panel from bubbling to document (which closes it)
    chatgptHelperMain.addEventListener("click", function (e) {
        e.stopPropagation();
    });

    // Click outside closes the panel
    document.addEventListener("click", function () {
        if (isOpen) closeChatgptHelper();
    });

    // Close button
    document
        .querySelector("#chatgptHelperClose")
        .addEventListener("click", function (e) {
            e.stopPropagation();
            closeChatgptHelper();
        });

    // ============ Prompt insertion ============
    document
        .querySelector("#chatgptHelperList")
        .addEventListener("click", function (event) {
            var target = event.target;
            if (target && target.nodeName === "LI") {
                var value = target.getAttribute("data-value");
                if (value) {
                    var textareaEle;
                    var hostname = window.location.hostname;
                    if (hostname === "claude.ai") {
                        // Claude.ai input
                        textareaEle = document.querySelector(
                            "div[contenteditable='true']"
                        );
                    } else if (hostname === "gemini.google.com") {
                        // Gemini input
                        textareaEle = document.querySelector(
                            "rich-textarea div[contenteditable='true'], .ql-editor[contenteditable='true']"
                        );
                    } else {
                        // ChatGPT input
                        textareaEle = document.querySelector("#prompt-textarea");
                    }

                    if (textareaEle) {
                        var decodedValue = decodeURI(value);

                        if (hostname === "claude.ai") {
                            // Claude.ai: use textContent to preserve both tags and line breaks
                            textareaEle.textContent =
                                decodedValue + textareaEle.textContent;
                            textareaEle.dispatchEvent(
                                new InputEvent("input", {
                                    bubbles: true,
                                    cancelable: true,
                                })
                            );
                        } else if (hostname === "gemini.google.com") {
                            // Gemini: use textContent to preserve line breaks
                            textareaEle.textContent =
                                decodedValue + textareaEle.textContent;
                            textareaEle.dispatchEvent(
                                new InputEvent("input", {
                                    bubbles: true,
                                    cancelable: true,
                                })
                            );
                            // Also trigger change event for Gemini
                            textareaEle.dispatchEvent(
                                new Event("change", { bubbles: true })
                            );
                        } else {
                            // ChatGPT: escape HTML tags and convert \n to <br>
                            var escapedValue = decodedValue
                                .replace(/&/g, "&amp;")
                                .replace(/</g, "&lt;")
                                .replace(/>/g, "&gt;")
                                .replace(/\n/g, "<br>");
                            textareaEle.innerHTML =
                                escapedValue + textareaEle.innerHTML;
                            textareaEle.dispatchEvent(
                                new Event("input", { bubbles: true })
                            );
                        }

                        setTimeout(function () {
                            textareaEle.focus();
                        }, 200);
                    }
                }
                closeChatgptHelper();
            }
        });

    // ============ Hotkeys ============
    document.addEventListener("keydown", function (event) {
        // Mac: cmd+shift+F
        if (event.metaKey && event.shiftKey && event.code === "KeyF") {
            if (!isOpen) openChatgptHelper();
            else closeChatgptHelper();
        }
        // Windows/Linux: ctrl+shift+F
        if (event.ctrlKey && event.shiftKey && event.code === "KeyF") {
            if (!isOpen) openChatgptHelper();
            else closeChatgptHelper();
        }
        // ESC closes
        if (event.code === "Escape" && isOpen) {
            closeChatgptHelper();
        }
    });
})();
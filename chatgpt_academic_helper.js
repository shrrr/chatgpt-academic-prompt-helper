/*!
// ==UserScript==
// @name          ChatGPT Academic Prompt Helper (Multi-Platform)
// @namespace     https://github.com/shrrr/chatgpt-academic-prompt-helper
// @version       0.2.0
// @description   Academic prompt helper for ChatGPT, Claude, and Gemini. Supports Safari, Chrome, Firefox, Edge. Fork of ZinYY/chatgpt-academic-prompt-helper with multi-platform support.
// @homepage      https://github.com/shrrr/chatgpt-academic-prompt-helper
// @author        shrrr (original: ZinYY)
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

    // Debug logging
    console.log('[ChatGPT Helper] Script starting on:', window.location.hostname);

    if (document.querySelector("#chatgptHelper")) {
        console.log('[ChatGPT Helper] Already loaded, exiting');
        return;
    }

    console.log('[ChatGPT Helper] Initializing...');

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
  -webkit-transform: translateY(-50%);
  z-index: 2147483647;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #fff;
  background: #111827;
  border: 1px solid rgba(255,255,255,.2);
  user-select: none;
  line-height: 1.1;
  pointer-events: auto;
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
            "🀄️⇨🔠 中译英 (long command, 列出参考)",
            "Please translate following sentence to English with academic writing, improve the spelling, grammar, clarity, concision and overall readability. When necessary, rewrite the whole sentence. Further, provide some related authoritative academic examples:\n",
        ],
        [
            "🔠⇨🔠 polish (列出修改)",
            "Below is a paragraph from an academic paper. Polish the writing to meet the academic style, improve the spelling, grammar, clarity, concision and overall readability. When necessary, rewrite the whole sentence. Furthermore, list all modification and explain the reasons to do so in markdown table:\n",
        ],
        [
            "🀄️⇄🔠 学术中英互译",
            "I want you to act as a scientific English-Chinese translator, I will provide you with some paragraphs in one language and your task is to accurately and academically translate the paragraphs only into the other language. Do not repeat the original provided paragraphs after translation. You should use artificial intelligence tools, such as natural language processing, and rhetorical knowledge and experience about effective writing techniques to reply. I'll give you my paragraphs as follows, tell me what language it is written in, and then translate:\n",
        ],
        [
            "✍🏻 解释每步代码的作用",
            "I would like you to serve as a code interpreter with Chinese, and elucidate the syntax and the semantics of the code line-by-line:\n",
        ],
        [
            "模拟编程社区来回答你的问题，并提供解决代码。",
            "I want you to act as a stackoverflow post and respond in Chinese. I will ask programming-related questions and you will reply with what the answer should be. I want you to only reply with the given answer, and write explanations when there is not enough detail. do not write explanations. When I need to tell you something in English, I will do so by putting text inside curly brackets {like this}. My first question is:\n",
        ],
        [
            "担任 AI 写作导师",
            "我想让你做一个 AI 写作导师。我将为您提供一名需要帮助改进其写作的学生，您的任务是使用人工智能工具（例如自然语言处理）向学生提供有关如何改进其作文的反馈。您还应该利用您在有效写作技巧方面的修辞知识和经验来建议学生可以更好地以书面形式表达他们的想法和想法的方法。我的第一个请求是“我需要有人帮我修改我的硕士论文”。",
        ],
        [
            "担任机器学习工程师",
            "我想让你担任机器学习工程师。我会写一些机器学习的概念，你的工作就是用通俗易懂的术语来解释它们。这可能包括提供构建模型的分步说明、使用视觉效果演示各种技术，或建议在线资源以供进一步研究。我的第一个建议请求是“我有一个没有标签的数据集。我应该使用哪种机器学习算法？”",
        ],
        [
            "作为 UX/UI 开发人员",
            "我希望你担任 UX/UI 开发人员。我将提供有关应用程序、网站或其他数字产品设计的一些细节，而你的工作就是想出创造性的方法来改善其用户体验。这可能涉及创建原型设计原型、测试不同的设计并提供有关最佳效果的反馈。我的第一个请求是“我需要帮助为我的新移动应用程序设计一个直观的导航系统。”",
        ],
        [
            "充当表情符号翻译",
            "我要你把我写的句子翻译成表情符号。我会写句子，你会用表情符号表达它。我只是想让你用表情符号来表达它。除了表情符号，我不希望你回复任何内容。当我需要用英语告诉你一些事情时，我会用 {like this} 这样的大括号括起来。我的第一句话是“你好，请问你的职业是什么？”",
        ],
        [
            "充当书面作品的标题生成器",
            "我想让你充当书面作品的标题生成器。我会给你提供一篇文章的主题和关键词，你会生成五个吸引眼球的标题。请保持标题简洁，不超过 20 个字，并确保保持意思。回复将使用主题的语言类型。我的第一个主题是“LearnData，一个建立在 VuePress 上的知识库，里面整合了我所有的笔记和文章，方便我使用和分享。”",
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
    console.log('[ChatGPT Helper] UI elements added to DOM');

    var chatgptHelperMain = document.querySelector("#chatgptHelperMain");
    var chatgptHelperOpen = document.querySelector("#chatgptHelperOpen");
    var isOpen = false;
    var listenersInitialized = false;
    var mutationObserver = null;

    function openChatgptHelper() {
        chatgptHelperMain.style.transform = "translateX(0)";
        isOpen = true;
    }
    function closeChatgptHelper() {
        chatgptHelperMain.style.transform = "translateX(100%)";
        isOpen = false;
    }

    function cleanupEventListeners() {
        if (!listenersInitialized) return;

        console.log('[ChatGPT Helper] Cleaning up event listeners...');

        // Remove all event listeners by cloning and replacing elements
        // This is the most reliable way to remove all listeners
        var oldOpen = document.querySelector("#chatgptHelperOpen");
        var oldMain = document.querySelector("#chatgptHelperMain");
        var oldClose = document.querySelector("#chatgptHelperClose");
        var oldList = document.querySelector("#chatgptHelperList");

        if (oldOpen) {
            var newOpen = oldOpen.cloneNode(true);
            oldOpen.parentNode.replaceChild(newOpen, oldOpen);
        }

        listenersInitialized = false;
        console.log('[ChatGPT Helper] Cleanup complete');
    }

    function setupMutationObserver() {
        // Disconnect existing observer if any
        if (mutationObserver) {
            mutationObserver.disconnect();
        }

        console.log('[ChatGPT Helper] Setting up MutationObserver...');

        mutationObserver = new MutationObserver(function(mutations) {
            // Check if our helper elements are still in the DOM
            var helperExists = document.body.contains(rootEle);
            var openButtonExists = document.body.contains(chatgptHelperOpen);

            if (!helperExists) {
                console.log('[ChatGPT Helper] Helper removed from DOM, re-appending...');
                document.body.appendChild(rootEle);

                // Re-query elements after re-appending
                chatgptHelperMain = document.querySelector("#chatgptHelperMain");
                chatgptHelperOpen = document.querySelector("#chatgptHelperOpen");

                // Re-initialize listeners
                cleanupEventListeners();
                initializeEventListeners();
            } else if (!openButtonExists) {
                console.log('[ChatGPT Helper] Open button detached, re-initializing...');

                // Re-query elements
                chatgptHelperMain = document.querySelector("#chatgptHelperMain");
                chatgptHelperOpen = document.querySelector("#chatgptHelperOpen");

                // Re-initialize listeners
                cleanupEventListeners();
                initializeEventListeners();
            }
        });

        // Observe the entire document body for child list changes
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('[ChatGPT Helper] MutationObserver active');
    }

    // For Gemini, wait for page to be fully ready
    if (window.location.hostname === "gemini.google.com") {
        console.log('[ChatGPT Helper] Gemini detected, waiting for page ready...');

        var checkReady = setInterval(function() {
            var geminiInput = document.querySelector("rich-textarea");
            if (geminiInput) {
                console.log('[ChatGPT Helper] Gemini input found, initializing...');
                clearInterval(checkReady);
                clearTimeout(timeoutHandle);
                initializeEventListeners();
            }
        }, 500);

        // Timeout after 10 seconds
        var timeoutHandle = setTimeout(function() {
            clearInterval(checkReady);
            console.log('[ChatGPT Helper] Timeout, initializing anyway...');
            initializeEventListeners();
        }, 10000);
    } else {
        initializeEventListeners();
    }

    // Setup MutationObserver to detect DOM changes
    setupMutationObserver();

    function initializeEventListeners() {
        if (listenersInitialized) {
            console.log('[ChatGPT Helper] Event listeners already initialized, skipping...');
            return;
        }
        listenersInitialized = true;
        console.log('[ChatGPT Helper] Setting up event listeners...');

        // Re-query elements to ensure we have fresh references
        chatgptHelperMain = document.querySelector("#chatgptHelperMain");
        chatgptHelperOpen = document.querySelector("#chatgptHelperOpen");

        if (!chatgptHelperOpen || !chatgptHelperMain) {
            console.error('[ChatGPT Helper] Required elements not found!');
            listenersInitialized = false;
            return;
        }

        // ============ FIX 3: Robust close/open behavior ============
        // Toggle by clicking the open button
        chatgptHelperOpen.addEventListener("click", function (e) {
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
                            // Gemini input - try multiple strategies
                            console.log('[ChatGPT Helper] Looking for Gemini input...');

                            // Strategy 1: Try to access Shadow DOM directly
                            var richTextarea = document.querySelector("rich-textarea");
                            if (richTextarea) {
                                console.log('[ChatGPT Helper] Found rich-textarea element');
                                if (richTextarea.shadowRoot) {
                                    console.log('[ChatGPT Helper] Accessing shadowRoot...');
                                    textareaEle = richTextarea.shadowRoot.querySelector("div[contenteditable='true']");
                                    if (textareaEle) console.log('[ChatGPT Helper] Found contenteditable in shadowRoot');
                                }
                            }

                            // Strategy 2: Try direct contenteditable search
                            if (!textareaEle) {
                                console.log('[ChatGPT Helper] Trying direct contenteditable search...');
                                textareaEle = document.querySelector("div[contenteditable='true']");
                                if (textareaEle) console.log('[ChatGPT Helper] Found contenteditable directly');
                            }

                            // Strategy 3: Try .ql-editor class
                            if (!textareaEle) {
                                console.log('[ChatGPT Helper] Trying .ql-editor...');
                                textareaEle = document.querySelector(".ql-editor[contenteditable='true']");
                                if (textareaEle) console.log('[ChatGPT Helper] Found .ql-editor');
                            }

                            if (!textareaEle) {
                                console.error('[ChatGPT Helper] Could not find Gemini input element!');
                            }
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
                                console.log('[ChatGPT Helper] Inserting text into Gemini...');

                                // Detect Safari
                                var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                                console.log('[ChatGPT Helper] Safari detected:', isSafari);

                                if (isSafari) {
                                    // Safari-specific: Use Selection API + execCommand
                                    textareaEle.focus();

                                    // Move caret to start
                                    var range = document.createRange();
                                    var sel = window.getSelection();
                                    range.setStart(textareaEle, 0);
                                    range.collapse(true);
                                    sel.removeAllRanges();
                                    sel.addRange(range);

                                    // Insert text using execCommand (more reliable in Safari)
                                    document.execCommand('insertText', false, decodedValue);

                                    // Dispatch comprehensive event sequence
                                    textareaEle.dispatchEvent(new Event('beforeinput', { bubbles: true }));
                                    textareaEle.dispatchEvent(new InputEvent('input', {
                                        bubbles: true,
                                        cancelable: true,
                                        inputType: 'insertText'
                                    }));
                                    textareaEle.dispatchEvent(new Event('change', { bubbles: true }));
                                    textareaEle.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

                                    console.log('[ChatGPT Helper] Text inserted (Safari method)');
                                } else {
                                    // Chrome/Edge: Use existing textContent method
                                    textareaEle.textContent = decodedValue + textareaEle.textContent;
                                    textareaEle.dispatchEvent(new InputEvent("input", {
                                        bubbles: true,
                                        cancelable: true,
                                    }));
                                    textareaEle.dispatchEvent(new Event("change", { bubbles: true }));

                                    console.log('[ChatGPT Helper] Text inserted (Chrome method)');
                                }
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

                            // Improved focus timing
                            var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                            var focusDelay = (isSafari && hostname === "gemini.google.com") ? 500 : 200;

                            setTimeout(function () {
                                textareaEle.focus();
                                console.log('[ChatGPT Helper] Focus applied');

                                // For Safari + Gemini, ensure caret is at end
                                if (isSafari && hostname === "gemini.google.com") {
                                    var range = document.createRange();
                                    var sel = window.getSelection();
                                    range.selectNodeContents(textareaEle);
                                    range.collapse(false); // Collapse to end
                                    sel.removeAllRanges();
                                    sel.addRange(range);
                                }
                            }, focusDelay);
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
    }
})();
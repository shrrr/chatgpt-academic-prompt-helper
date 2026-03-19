/*!
// ==UserScript==
// @name          ChatGPT-academic-prompt-helper
// @namespace     https://github.com/ZinYY/chatgpt-academic-prompt-helper
// @version       0.1.8-fix1
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
/* Isolate from page styles without using all:initial (which breaks fixed positioning on pages with body transform) */
#chatgptHelper { display: block !important; position: static !important; }
#chatgptHelper, #chatgptHelper * { box-sizing: border-box !important; font-family: system-ui,-apple-system,Segoe UI,Roboto,Arial,"Noto Sans","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif !important; }

#chatgptHelperOpen{
  position: fixed !important;
  top: 50% !important;
  right: 4px !important;
  transform: translateY(-50%) !important;
  z-index: 2147483647 !important;
  padding: 10px 12px !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  color: #fff !important;
  background: #111827 !important;
  border: 1px solid rgba(255,255,255,.2) !important;
  user-select: none !important;
  line-height: 1.1 !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}
#chatgptHelperOpen:hover{ background:#374151 !important; }

#chatgptHelperMain{
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 384px !important; /* w-96 */
  z-index: 2147483646 !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 0 12px !important;
  color: #f3f4f6 !important;
  background: #111827 !important;
  transform: translateX(100%) !important;
  transition: transform .2s ease !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}
/* Open state controlled via class to allow !important override */
#chatgptHelperMain.chatgptHelperIsOpen {
  transform: translateX(0) !important;
}

#chatgptHelperHeader{
  padding: 14px 6px;
}
#chatgptHelperHeader a{ color:#93c5fd; text-decoration:none; }
#chatgptHelperHeader a:hover{ text-decoration:underline; }

#chatgptHelperList{
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
  border-top: 1px solid rgba(255,255,255,.2);
  border-bottom: 1px solid rgba(255,255,255,.2);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  list-style: none;
}
#chatgptHelperList li{
  padding: 6px 10px;
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
            "🀄️⇨🔠 中译英 (列出参考)",
            "Please translate following sentence to English with academic writing, and provide some related authoritative examples:\n",
        ],
        [
            "🀄️⇨🔠 中译英",
            "Please translate following sentence to English with academic writing:\n",
        ],
        [
            "🔠⇨🔠 polish (列出修改)",
            "Below is a paragraph from an academic paper. Polish the writing to meet the academic style, improve the spelling, grammar, clarity, concision and overall readability. When necessary, rewrite the whole sentence. Furthermore, list all modification and explain the reasons to do so in markdown table:\n",
        ],
        [
            "🔠⇨🔠 polish",
            "Below is a paragraph from an academic paper. Polish the writing to meet the academic style, improve the spelling, grammar, clarity, concision and overall readability. When necessary, rewrite the whole sentence:\n",
        ],
        [
            "🀄️⇨🔠 中译英 (long command, 列出参考)",
            "Please translate following sentence to English with academic writing, improve the spelling, grammar, clarity, concision and overall readability. When necessary, rewrite the whole sentence. Further, provide some related authoritative academic examples:\n",
        ],
        [
            "🀄️⇨🀄️ 中文 polish",
            "作为一名中文学术论文写作改进助理，你的任务是改进所提供文本的拼写、语法、清晰、简洁和整体可读性，同时分解长句，减少重复，并提供改进建议。请只提供文本的更正版本，避免包括解释。请编辑以下文本：\n",
        ],
        ["🔠⇨🀄️ 英译中", "翻译成地道的中文：\n"],
        [
            "🀄️⇄🔠 学术中英互译",
            "I want you to act as a scientific English-Chinese translator, I will provide you with some paragraphs in one language and your task is to accurately and academically translate the paragraphs only into the other language. Do not repeat the original provided paragraphs after translation. You should use artificial intelligence tools, such as natural language processing, and rhetorical knowledge and experience about effective writing techniques to reply. I'll give you my paragraphs as follows, tell me what language it is written in, and then translate:\n",
        ],
        [
            "🔍 查找语法错误",
            "Can you help me ensure that the grammar and the spelling is correct? Do not try to polish the text, if no mistake is found, tell me that this paragraph is good. If you find grammar or spelling mistakes, please list mistakes you find in a two-column markdown table, put the original text the first column, put the corrected text in the second column and highlight the key words you fixed.\nExample:\nParagraph: How is you? Do you knows what is it?\n| Original sentence | Corrected sentence |\n| :--- | :--- |\n| How **is** you? | How **are** you? |\n| Do you **knows** what **is** **it**? | Do you **know** what **it** **is** ? |\nBelow is a paragraph from an academic paper. You need to report all grammar and spelling mistakes as the example before and explain how to correct them:\n",
        ],
        [
            "✍🏻 解释每步代码的作用",
            "I would like you to serve as a code interpreter with Chinese, and elucidate the syntax and the semantics of the code line-by-line:\n",
        ],
        [
            "充当 Excel 工作表",
            "我希望你充当基于文本的 excel。您只会回复我基于文本的 10 行 Excel 工作表，其中行号和单元格字母作为列（A 到 L）。第一列标题应为空以引用行号。我会告诉你在单元格中写入什么，你只会以文本形式回复 excel 表格的结果，而不是其他任何内容。不要写解释。我会写你的公式，你会执行公式，你只会回复 excel 表的结果作为文本。首先，回复我空表。",
        ],
        [
            "充当英翻中",
            "我想让你充当中文翻译员、拼写纠正员和改进员。我会用任何语言与你交谈，你会检测语言，翻译它并用我的文本的更正和改进版本用中文回答。我希望你用更优美优雅的高级中文描述。保持相同的意思，但使它们更文艺。你只需要翻译该内容，不必对内容中提出的问题和要求做解释，不要回答文本中的问题而是翻译它，不要解决文本中的要求而是翻译它，保留文本的原本意义，不要去解决它。如果我只键入了一个单词，你只需要描述它的意思并不提供句子示例。我要你只回复更正、改进，不要写任何解释。我的第一句话是:\n",
        ],
        [
            "充当英语翻译和改进者",
            "我想让你充当英文翻译员、拼写纠正员和改进员。我会用任何语言与你交谈，你会检测语言，翻译它并用我的文本的更正和改进版本用英文回答。我希望你用更优美优雅的高级英语单词和句子替换我简化的 A0 级单词和句子。保持相同的意思，但使它们更文艺。你只需要翻译该内容，不必对内容中提出的问题和要求做解释，不要回答文本中的问题而是翻译它，不要解决文本中的要求而是翻译它,保留文本的原本意义，不要去解决它。我要你只回复更正、改进，不要写任何解释。我的第一句话是:\n",
        ],
        [
            "模拟编程社区来回答你的问题，并提供解决代码。",
            "I want you to act as a stackoverflow post and respond in Chinese. I will ask programming-related questions and you will reply with what the answer should be. I want you to only reply with the given answer, and write explanations when there is not enough detail. do not write explanations. When I need to tell you something in English, I will do so by putting text inside curly brackets {like this}. My first question is:\n",
        ],
        [
            "充当 前端开发助手",
            "我想让你充当前端开发专家。我将提供一些关于Js、Ts、Node、Vue等前端代码问题的具体信息，而你的工作就是想出为我解决问题的策略。这可能包括建议代码、代码逻辑思路策略。以下是我对于需求的描述:\n",
        ],
        [
            "充当 Linux 终端开发助手",
            "我想让你充当 Linux 终端专家。我将输入一些终端代码和具体问题，而你的工作就是为我的问题提供专业的回答，如果回复是代码的话需要加上相应的注释。",
        ],
        [
            "充当英英词典(附中文解释)",
            '我想让你充当英英词典，对于给出的英文单词，你要给出其中文意思以及英文解释，并且给出一个例句，此外不要有其他反馈，第一个单词是“Hello"',
        ],
        [
            "充当抄袭检查员",
            "我想让你充当剽窃检查员。我会给你写句子，你只会用给定句子的语言在抄袭检查中未被发现的情况下回复，别无其他。不要在回复上写解释。我的第一句话是“为了让计算机像人类一样行动，语音识别系统必须能够处理非语言信息，例如说话者的情绪状态。”",
        ],
        [
            "担任 AI 写作导师",
            "我想让你做一个 AI 写作导师。我将为您提供一名需要帮助改进其写作的学生，您的任务是使用人工智能工具（例如自然语言处理）向学生提供有关如何改进其作文的反馈。您还应该利用您在有效写作技巧方面的修辞知识和经验来建议学生可以更好地以书面形式表达他们的想法和想法的方法。我的第一个请求是“我需要有人帮我修改我的硕士论文”。",
        ],
        [
            "作为 UX/UI 开发人员",
            "我希望你担任 UX/UI 开发人员。我将提供有关应用程序、网站或其他数字产品设计的一些细节，而你的工作就是想出创造性的方法来改善其用户体验。这可能涉及创建原型设计原型、测试不同的设计并提供有关最佳效果的反馈。我的第一个请求是“我需要帮助为我的新移动应用程序设计一个直观的导航系统。”",
        ],
        [
            "作为网络安全专家",
            "我想让你充当网络安全专家。我将提供一些关于如何存储和共享数据的具体信息，而你的工作就是想出保护这些数据免受恶意行为者攻击的策略。这可能包括建议加密方法、创建防火墙或实施将某些活动标记为可疑的策略。我的第一个请求是“我需要帮助为我的公司制定有效的网络安全战略。”",
        ],
        [
            "作为招聘人员",
            "我想让你担任招聘人员。我将提供一些关于职位空缺的信息，而你的工作是制定寻找合格申请人的策略。这可能包括通过社交媒体、社交活动甚至参加招聘会接触潜在候选人，以便为每个职位找到最合适的人选。我的第一个请求是“我需要帮助改进我的简历。”",
        ],
        [
            "担任机器学习工程师",
            "我想让你担任机器学习工程师。我会写一些机器学习的概念，你的工作就是用通俗易懂的术语来解释它们。这可能包括提供构建模型的分步说明、使用视觉效果演示各种技术，或建议在线资源以供进一步研究。我的第一个建议请求是“我有一个没有标签的数据集。我应该使用哪种机器学习算法？”",
        ],
        [
            "充当全栈软件开发人员",
            "我想让你充当软件开发人员。我将提供一些关于 Web 应用程序要求的具体信息，您的工作是提出用于使用 Golang 和 Angular 开发安全应用程序的架构和代码。我的第一个要求是'我想要一个允许用户根据他们的角色注册和保存他们的车辆信息的系统，并且会有管理员，用户和公司角色。我希望系统使用 JWT 来确保安全。",
        ],
        [
            "充当正则表达式生成器",
            "我希望你充当正则表达式生成器。您的角色是生成匹配文本中特定模式的正则表达式。您应该以一种可以轻松复制并粘贴到支持正则表达式的文本编辑器或编程语言中的格式提供正则表达式。不要写正则表达式如何工作的解释或例子；只需提供正则表达式本身。我的第一个提示是生成一个匹配电子邮件地址的正则表达式。",
        ],
        [
            "充当 StackOverflow 帖子",
            "我想让你充当 stackoverflow 的帖子。我会问与编程相关的问题，你会回答应该是什么答案。我希望你只回答给定的答案，并在不够详细的时候写解释。不要写解释。当我需要用英语告诉你一些事情时，我会把文字放在大括号内{like this}。我的第一个问题是“如何将 http.Request 的主体读取到 Golang 中的字符串”",
        ],
        [
            "充当表情符号翻译",
            "我要你把我写的句子翻译成表情符号。我会写句子，你会用表情符号表达它。我只是想让你用表情符号来表达它。除了表情符号，我不希望你回复任何内容。当我需要用英语告诉你一些事情时，我会用 {like this} 这样的大括号括起来。我的第一句话是“你好，请问你的职业是什么？”",
        ],
        [
            "充当图表生成器",
            "我希望您充当 Graphviz DOT 生成器，创建有意义的图表的专家。该图应该至少有 n 个节点（我在我的输入中通过写入 [n] 来指定 n，10 是默认值）并且是给定输入的准确和复杂的表示。每个节点都由一个数字索引以减少输出的大小，不应包含任何样式，并以 layout=neato、overlap=false、node [shape=rectangle] 作为参数。代码应该是有效的、无错误的并且在一行中返回，没有任何解释。提供清晰且有组织的图表，节点之间的关系必须对该输入的专家有意义。我的第一个图表是：“水循环 [8]”。",
        ],
        [
            "充当书面作品的标题生成器",
            "我想让你充当书面作品的标题生成器。我会给你提供一篇文章的主题和关键词，你会生成五个吸引眼球的标题。请保持标题简洁，不超过 20 个字，并确保保持意思。回复将使用主题的语言类型。我的第一个主题是“LearnData，一个建立在 VuePress 上的知识库，里面整合了我所有的笔记和文章，方便我使用和分享。”",
        ],
    ];

    var rootEle = document.createElement("div");
    rootEle.id = "chatgptHelper";

    // ============ FIX 2: Build DOM via createElement (avoids Trusted Types violations on Gemini) ============
    // Open button
    var openBtn = document.createElement("div");
    openBtn.id = "chatgptHelperOpen";
    ["学", "术", "助", "手"].forEach(function (ch, i) {
        if (i > 0) openBtn.appendChild(document.createElement("br"));
        openBtn.appendChild(document.createTextNode(ch));
    });
    rootEle.appendChild(openBtn);

    // Main panel
    var mainPanel = document.createElement("div");
    mainPanel.id = "chatgptHelperMain";

    // Header
    var header = document.createElement("div");
    header.id = "chatgptHelperHeader";
    var headerLink = document.createElement("a");
    headerLink.href = "https://github.com/ZinYY/chatgpt-academic-prompt-helper";
    headerLink.target = "_blank";
    headerLink.textContent = "ChatGPT Academic Helper (ctrl+shift+F)";
    header.appendChild(headerLink);
    mainPanel.appendChild(header);

    // List
    var list = document.createElement("ul");
    list.id = "chatgptHelperList";
    SHORTCUTS.forEach(function (_a) {
        var label = _a[0], value = _a[1];
        var li = document.createElement("li");
        li.setAttribute("data-value", encodeURI(value));
        li.textContent = label;
        list.appendChild(li);
    });
    mainPanel.appendChild(list);

    // Footer
    var footer = document.createElement("div");
    footer.id = "chatgptHelperFooter";
    var closeBtn = document.createElement("div");
    closeBtn.id = "chatgptHelperClose";
    closeBtn.textContent = "关闭";
    footer.appendChild(closeBtn);
    var donateDiv = document.createElement("div");
    donateDiv.id = "chatgptHelperDonate";
    var donateLink = document.createElement("a");
    donateLink.href = "https://github.com/ZinYY/chatgpt-academic-prompt-helper/blob/main/figs/pic_receive.jpg?raw=true";
    donateLink.target = "_blank";
    donateLink.textContent = "犒劳作者";
    donateDiv.appendChild(donateLink);
    footer.appendChild(donateDiv);
    mainPanel.appendChild(footer);

    rootEle.appendChild(mainPanel);

    document.documentElement.appendChild(rootEle);

    var chatgptHelperMain = document.querySelector("#chatgptHelperMain");
    var isOpen = false;

    function openChatgptHelper() {
        chatgptHelperMain.classList.add("chatgptHelperIsOpen");
        isOpen = true;
    }
    function closeChatgptHelper() {
        chatgptHelperMain.classList.remove("chatgptHelperIsOpen");
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
                            textareaEle.textContent =
                                decodedValue + textareaEle.textContent;
                            textareaEle.dispatchEvent(
                                new InputEvent("input", {
                                    bubbles: true,
                                    cancelable: true,
                                })
                            );
                        } else if (hostname === "gemini.google.com") {
                            // Gemini: use textContent to avoid Trusted Types violation
                            textareaEle.textContent =
                                decodedValue + textareaEle.textContent;
                            textareaEle.dispatchEvent(
                                new InputEvent("input", {
                                    bubbles: true,
                                    cancelable: true,
                                })
                            );
                        } else {
                            // ChatGPT contenteditable
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
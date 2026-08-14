document.addEventListener('DOMContentLoaded', function() {
    const codeInput = document.getElementById('js-code');
    const outputBox = document.getElementById('js-output');
    const message = document.getElementById('js-message');
    const runBtn = document.getElementById('run-js-btn');
    const sampleBtn = document.getElementById('sample-js-btn');
    const clearBtn = document.getElementById('clear-js-btn');
    const copyBtn = document.getElementById('copy-js-btn');
    const clearOutputBtn = document.getElementById('clear-output-btn');
    const copyOutputBtn = document.getElementById('copy-output-btn');

    let consoleLogs = [];
    let consoleErrors = [];

    function setMessage(text, type) {
        message.textContent = text;
        message.className = `json-message ${type || ''}`.trim();
    }

    function formatOutput(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2);
            } catch (e) {
                return String(value);
            }
        }
        return String(value);
    }

    function createConsoleElement(type, args) {
        const div = document.createElement('div');
        div.className = `console-line console-${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        const timeSpan = document.createElement('span');
        timeSpan.className = 'console-time';
        timeSpan.textContent = `[${timestamp}]`;
        
        const typeSpan = document.createElement('span');
        typeSpan.className = 'console-type';
        typeSpan.textContent = type.toUpperCase();
        
        const contentSpan = document.createElement('span');
        contentSpan.className = 'console-content';
        contentSpan.textContent = args.map(arg => formatOutput(arg)).join(' ');
        
        div.appendChild(timeSpan);
        div.appendChild(typeSpan);
        div.appendChild(contentSpan);
        
        return div;
    }

    function clearOutput() {
        outputBox.innerHTML = '<div class="output-placeholder">等待运行代码...</div>';
        consoleLogs = [];
        consoleErrors = [];
    }

    function runCode() {
        const code = codeInput.value.trim();
        
        if (!code) {
            setMessage('请输入JavaScript代码。', 'error');
            return;
        }

        clearOutput();
        consoleLogs = [];
        consoleErrors = [];

        // 创建自定义console对象
        const customConsole = {
            log: function(...args) {
                consoleLogs.push({ type: 'log', args });
                const element = createConsoleElement('log', args);
                outputBox.appendChild(element);
            },
            error: function(...args) {
                consoleErrors.push({ type: 'error', args });
                const element = createConsoleElement('error', args);
                outputBox.appendChild(element);
            },
            warn: function(...args) {
                consoleLogs.push({ type: 'warn', args });
                const element = createConsoleElement('warn', args);
                outputBox.appendChild(element);
            },
            info: function(...args) {
                consoleLogs.push({ type: 'info', args });
                const element = createConsoleElement('info', args);
                outputBox.appendChild(element);
            },
            debug: function(...args) {
                consoleLogs.push({ type: 'debug', args });
                const element = createConsoleElement('debug', args);
                outputBox.appendChild(element);
            },
            table: function(...args) {
                consoleLogs.push({ type: 'table', args });
                const element = createConsoleElement('table', args);
                outputBox.appendChild(element);
            }
        };

        try {
            // 使用Function构造函数执行代码，传入自定义console
            const asyncWrapper = new Function('console', `
                return (async () => {
                    ${code}
                })();
            `);

            // 设置执行超时
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('代码执行超时（5秒）')), 5000);
            });

            // 执行代码
            Promise.race([asyncWrapper(customConsole), timeoutPromise])
                .then(result => {
                    if (result !== undefined) {
                        const element = createConsoleElement('result', [result]);
                        outputBox.appendChild(element);
                    }
                    
                    if (consoleLogs.length === 0 && consoleErrors.length === 0 && result === undefined) {
                        outputBox.innerHTML = '<div class="output-placeholder">代码执行完成，无输出</div>';
                    } else {
                        setMessage(`代码执行完成，共 ${consoleLogs.length + consoleErrors.length} 条输出。`, 'success');
                    }
                })
                .catch(error => {
                    const errorElement = createConsoleElement('error', [error.message]);
                    outputBox.appendChild(errorElement);
                    setMessage(`执行错误: ${error.message}`, 'error');
                });

        } catch (error) {
            const errorElement = createConsoleElement('error', [error.message]);
            outputBox.appendChild(errorElement);
            setMessage(`语法错误: ${error.message}`, 'error');
        }
    }

    function loadSample() {
        codeInput.value = `// 示例1：基础输出
console.log('Hello, World!');
console.info('这是一条信息');
console.warn('这是一条警告');

// 示例2：数组操作
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('原始数组:', numbers);
console.log('翻倍后:', doubled);

// 示例3：对象操作
const user = {
    name: '张三',
    age: 25,
    city: '北京'
};
console.log('用户信息:', user);

// 示例4：异步操作
async function fetchData() {
    console.log('开始获取数据...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('数据获取完成！');
    return { status: 'success', data: [1, 2, 3] };
}

fetchData().then(result => {
    console.log('异步结果:', result);
});

// 示例5：计算器
function calculator(a, b, operation) {
    const operations = {
        '+': (x, y) => x + y,
        '-': (x, y) => x - y,
        '*': (x, y) => x * y,
        '/': (x, y) => y !== 0 ? x / y : '除数不能为0'
    };
    
    const result = operations[operation] ? operations[operation](a, b) : '不支持的操作';
    console.log(\`\${a} \${operation} \${b} = \${result}\`);
    return result;
}

calculator(10, 5, '+');
calculator(10, 5, '-');
calculator(10, 5, '*');
calculator(10, 5, '/');`;
        
        setMessage('已加载示例代码。', 'success');
    }

    function copyCode() {
        const code = codeInput.value;
        if (!code) {
            setMessage('没有可复制的代码。', 'error');
            return;
        }
        
        navigator.clipboard.writeText(code).then(() => {
            setMessage('代码已复制。', 'success');
        }).catch(() => {
            setMessage('复制失败，请手动复制。', 'error');
        });
    }

    function copyOutput() {
        const outputText = Array.from(outputBox.querySelectorAll('.console-line'))
            .map(line => {
                const time = line.querySelector('.console-time')?.textContent || '';
                const type = line.querySelector('.console-type')?.textContent || '';
                const content = line.querySelector('.console-content')?.textContent || '';
                return `${time} ${type} ${content}`;
            })
            .join('\n');
        
        if (!outputText || outputBox.querySelector('.output-placeholder')) {
            setMessage('没有可复制的输出结果。', 'error');
            return;
        }
        
        navigator.clipboard.writeText(outputText).then(() => {
            setMessage('输出结果已复制。', 'success');
        }).catch(() => {
            setMessage('复制失败，请手动复制。', 'error');
        });
    }

    // 事件监听
    runBtn.addEventListener('click', runCode);
    sampleBtn.addEventListener('click', loadSample);
    clearBtn.addEventListener('click', () => {
        codeInput.value = '';
        clearOutput();
        setMessage('等待输入JavaScript代码。', '');
    });
    copyBtn.addEventListener('click', copyCode);
    clearOutputBtn.addEventListener('click', clearOutput);
    copyOutputBtn.addEventListener('click', copyOutput);

    // 支持Ctrl+Enter快捷键运行代码
    codeInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            runCode();
        }
    });
});
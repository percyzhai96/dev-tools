document.addEventListener('DOMContentLoaded', function() {
    const cronInput = document.getElementById('cron6-input');
    const parseBtn = document.getElementById('parse-cron6-btn');
    const descriptionOutput = document.getElementById('cron6-description');
    const fieldsOutput = document.getElementById('cron6-fields');
    const nextOutput = document.getElementById('cron6-next');
    const message = document.getElementById('cron6-message');

    const fieldDefs = [
        ['秒', 0, 59],
        ['分钟', 0, 59],
        ['小时', 0, 23],
        ['日期', 1, 31],
        ['月份', 1, 12],
        ['星期', 1, 7]
    ];

    const monthNames = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const weekdayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const weekdayAbbr = { 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6, 'SUN': 7 };

    function setMessage(text, type) {
        message.textContent = text;
        message.className = `json-message ${type || ''}`.trim();
    }

    function parseField(expression, min, max, fieldIndex) {
        const values = new Set();
        const isWeekday = fieldIndex === 5;
        const isDayOfMonth = fieldIndex === 3;

        if (expression === '?') {
            return ['?'];
        }

        expression.split(',').forEach(part => {
            let rawPart = part;
            let hasL = false;
            let hasW = false;
            let nthWeek = null;

            if (isDayOfMonth) {
                if (rawPart.includes('L')) {
                    hasL = true;
                    rawPart = rawPart.replace('L', '');
                }
                if (rawPart.includes('W')) {
                    hasW = true;
                    rawPart = rawPart.replace('W', '');
                }
            }

            if (isWeekday) {
                const hashIndex = rawPart.indexOf('#');
                if (hashIndex !== -1) {
                    const [dayPart, weekPart] = rawPart.split('#');
                    nthWeek = parseInt(weekPart, 10);
                    rawPart = dayPart;
                    if (!Number.isInteger(nthWeek) || nthWeek < 1 || nthWeek > 5) {
                        throw new Error(`第几个星期无效：${part}`);
                    }
                }
            }

            const [rangePart, stepPart] = rawPart.split('/');
            const step = stepPart ? Number(stepPart) : 1;
            if (!Number.isInteger(step) || step <= 0) throw new Error(`步长无效：${part}`);

            let start;
            let end;

            if (rangePart === '*') {
                start = min;
                end = max;
            } else if (rangePart.includes('-')) {
                const [rawStart, rawEnd] = rangePart.split('-').map(v => {
                    if (isWeekday && weekdayAbbr[v.toUpperCase()]) {
                        return weekdayAbbr[v.toUpperCase()];
                    }
                    return Number(v);
                });
                start = rawStart;
                end = rawEnd;
            } else {
                if (isWeekday && weekdayAbbr[rangePart.toUpperCase()]) {
                    start = weekdayAbbr[rangePart.toUpperCase()];
                    end = step > 1 ? max : start;
                } else {
                    start = Number(rangePart);
                    end = step > 1 ? max : start;
                }
            }

            if (!Number.isInteger(start) || !Number.isInteger(end) || start < min || end > max || start > end) {
                throw new Error(`字段范围无效：${part}`);
            }

            for (let value = start; value <= end; value += step) {
                let val = value;
                if (hasL) {
                    values.add('L');
                } else if (hasW) {
                    values.add(`${val}W`);
                } else if (nthWeek !== null) {
                    values.add(`${val}#${nthWeek}`);
                } else {
                    values.add(val);
                }
            }
        });

        return [...values].sort((a, b) => {
            if (a === 'L') return 1;
            if (b === 'L') return -1;
            if (typeof a === 'string' || typeof b === 'string') return 0;
            return a - b;
        });
    }

    function parseCron() {
        const parts = cronInput.value.trim().split(/\s+/);
        if (parts.length !== 6) {
            throw new Error('请输入 6 段 Cron 表达式（秒 分 时 日 月 周）');
        }
        return parts.map((part, index) => parseField(part, fieldDefs[index][1], fieldDefs[index][2], index));
    }

    function describeField(values, fieldIndex) {
        if (values.length === 1 && values[0] === '?') {
            return '不指定';
        }

        if (fieldIndex === 3) {
            const hasL = values.includes('L');
            const hasW = values.some(v => typeof v === 'string' && v.includes('W'));
            const nums = values.filter(v => typeof v === 'number');
            let desc = [];
            if (nums.length > 0) {
                if (nums.length === 31) {
                    desc.push('每个日期');
                } else {
                    desc.push(nums.join(', '));
                }
            }
            if (hasL) desc.push('最后一天(L)');
            if (hasW) {
                const wDays = values.filter(v => typeof v === 'string' && v.includes('W'));
                desc.push(...wDays.map(d => `${d}(最近工作日)`));
            }
            return desc.join('；');
        }

        if (fieldIndex === 5) {
            const hasHash = values.some(v => typeof v === 'string' && v.includes('#'));
            const nums = values.filter(v => typeof v === 'number');
            let desc = [];
            if (nums.length > 0) {
                if (nums.length === 7) {
                    desc.push('每天');
                } else {
                    desc.push(nums.map(v => weekdayNames[v] || v).join(', '));
                }
            }
            if (hasHash) {
                const hashDays = values.filter(v => typeof v === 'string' && v.includes('#'));
                desc.push(...hashDays.map(d => {
                    const [day, week] = d.split('#');
                    return `${weekdayNames[day]}第${week}个`;
                }));
            }
            return desc.join('；');
        }

        if (fieldIndex === 4) {
            if (values.length === 12) {
                return '每个月';
            }
            return values.map(v => monthNames[v] || v).join(', ');
        }

        const min = fieldDefs[fieldIndex][1];
        const max = fieldDefs[fieldIndex][2];
        if (values.length === max - min + 1) {
            return '每个有效值';
        }
        return values.join(', ');
    }

    function getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    function getNearestWeekday(year, month, day) {
        const date = new Date(year, month - 1, day);
        const weekday = date.getDay();

        if (weekday === 0) {
            return day + 1;
        }
        if (weekday === 6) {
            return day - 1;
        }
        return day;
    }

    function getNthWeekdayOfMonth(year, month, weekday, nth) {
        const firstDay = new Date(year, month - 1, 1);
        const firstWeekday = firstDay.getDay();
        const targetWeekday = weekday === 7 ? 0 : weekday;

        let diff = targetWeekday - firstWeekday;
        if (diff < 0) diff += 7;

        let day = 1 + diff + (nth - 1) * 7;
        const daysInMonth = getDaysInMonth(year, month);

        if (day > daysInMonth) {
            return null;
        }
        return day;
    }

    function matches(date, parsed) {
        const second = date.getSeconds();
        const minute = date.getMinutes();
        const hour = date.getHours();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const weekday = date.getDay() || 7;

        if (!parsed[0].includes(second)) return false;
        if (!parsed[1].includes(minute)) return false;
        if (!parsed[2].includes(hour)) return false;

        const dayOfMonth = parsed[3];
        const monthField = parsed[4];
        const dayOfWeek = parsed[5];

        if (!monthField.includes(month)) return false;

        let dayMatch = false;
        let weekMatch = false;

        if (dayOfMonth.includes('?')) {
            dayMatch = true;
        } else {
            if (dayOfMonth.includes('L')) {
                if (day === getDaysInMonth(year, month)) {
                    dayMatch = true;
                }
            }

            const wDays = dayOfMonth.filter(v => typeof v === 'string' && v.includes('W'));
            if (wDays.length > 0) {
                for (const wd of wDays) {
                    const targetDay = parseInt(wd.replace('W', ''), 10);
                    const nearest = getNearestWeekday(year, month, targetDay);
                    if (day === nearest) {
                        dayMatch = true;
                        break;
                    }
                }
            }

            if (!dayMatch) {
                const numDays = dayOfMonth.filter(v => typeof v === 'number');
                if (numDays.includes(day)) {
                    dayMatch = true;
                }
            }
        }

        if (dayOfWeek.includes('?')) {
            weekMatch = true;
        } else {
            const numWeeks = dayOfWeek.filter(v => typeof v === 'number');
            if (numWeeks.includes(weekday)) {
                weekMatch = true;
            }

            const hashDays = dayOfWeek.filter(v => typeof v === 'string' && v.includes('#'));
            if (!weekMatch && hashDays.length > 0) {
                for (const hd of hashDays) {
                    const [targetWeekday, nth] = hd.split('#').map(Number);
                    const targetDay = getNthWeekdayOfMonth(year, month, targetWeekday, nth);
                    if (targetDay === day) {
                        weekMatch = true;
                        break;
                    }
                }
            }
        }

        return dayMatch && weekMatch;
    }

    function nextRuns(parsed, count) {
        const runs = [];
        const cursor = new Date();
        cursor.setMilliseconds(0);
        cursor.setSeconds(cursor.getSeconds() + 1);
        const maxChecks = 60 * 60 * 24 * 366 * 2;
        for (let checked = 0; checked < maxChecks && runs.length < count; checked++) {
            if (matches(cursor, parsed)) {
                runs.push(new Date(cursor));
            }
            cursor.setSeconds(cursor.getSeconds() + 1);
        }
        return runs;
    }

    function renderRows(container, rows) {
        container.innerHTML = rows.map(row => `<div class="result-row"><span>${row.label}</span><strong>${row.value}</strong></div>`).join('');
    }

    function run() {
        try {
            const expression = cronInput.value.trim();
            
            const humanDescription = cronstrue.toString(expression, {
                use24HourTimeFormat: true,
                dayOfWeekStartIndexZero: false,
                locale: 'zh-CN'
            });
            
            descriptionOutput.innerHTML = `<div class="cron-desc-text">${humanDescription}</div>`;

            const parsed = parseCron();
            renderRows(fieldsOutput, parsed.map((values, index) => ({
                label: fieldDefs[index][0],
                value: describeField(values, index)
            })));
            const runs = nextRuns(parsed, 8);
            renderRows(nextOutput, runs.map((date, index) => ({
                label: `#${index + 1}`,
                value: date.toLocaleString('zh-CN', { hour12: false })
            })));
            setMessage(`解析成功，预览 ${runs.length} 次执行时间。`, 'success');
        } catch (error) {
            descriptionOutput.innerHTML = '';
            fieldsOutput.innerHTML = '';
            nextOutput.innerHTML = '';
            setMessage(`错误：${error.message}`, 'error');
        }
    }

    parseBtn.addEventListener('click', run);
    cronInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') run();
    });
    document.querySelectorAll('[data-cron6-sample]').forEach(button => {
        button.addEventListener('click', () => {
            cronInput.value = button.dataset.cron6Sample;
            run();
        });
    });
    run();
});
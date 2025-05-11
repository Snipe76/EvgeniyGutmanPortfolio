const DISPLAY_DEFAULT = '0';
const OPERATORS = ['+', '-', '*', '/'];

const expressionDisplay = document.getElementById('expressionDisplay');
const mainDisplay = document.getElementById('mainDisplay');
const buttons = document.querySelectorAll('.btn');
const settingsBtn = document.getElementById('settingsBtn');
const themeToggle = document.getElementById('themeToggle');
const helpBtn = document.getElementById('helpBtn');
const keyboardShortcuts = document.getElementById('keyboardShortcuts');
const closeShortcuts = document.getElementById('closeShortcuts');

const tabButtons = document.querySelectorAll('.tab-btn');
const calculatorPanels = document.querySelectorAll('.calculator-panel');
const scientificTab = document.getElementById('scientificTab');
const programmerTab = document.getElementById('programmerTab');
const converterTab = document.getElementById('converterTab');
const historyTab = document.getElementById('historyTab');

const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const fontSizeValue = document.getElementById('fontSizeValue');
const decimalPlaces = document.getElementById('decimalPlaces');
const themeButtons = document.querySelectorAll('.theme-btn');
const colorButtons = document.querySelectorAll('.color-btn');
const degButton = document.getElementById('degButton');
const radButton = document.getElementById('radButton');
const soundToggle = document.getElementById('soundToggle');
const hapticToggle = document.getElementById('hapticToggle');

const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const clearHistory = document.getElementById('clearHistory');

const buttonClickSound = document.getElementById('buttonClickSound');

const converterCategory = document.getElementById('converterCategory');
const fromValue = document.getElementById('fromValue');
const fromUnit = document.getElementById('fromUnit');
const toValue = document.getElementById('toValue');
const toUnit = document.getElementById('toUnit');
const swapUnits = document.getElementById('swapUnits');

const baseButtons = document.querySelectorAll('.base-btn');
const wordButtons = document.querySelectorAll('.word-btn');

const DEFAULT_SETTINGS = {
    fontSize: 100,
    decimalPlaces: 'auto',
    theme: 'dark',
    accentColor: '#00c3ff',
    isRadians: false,
    soundEnabled: false,
    hapticEnabled: false,
    confettiEnabled: true,
    buttonEffects: true
};

let settings = { ...DEFAULT_SETTINGS };
let currentExpression = '';
let lastAnswer = 0;
let resultDisplayed = false;
let history = [];
let activeTab = 'scientific';
let currentBase = 'hex';
let currentWordSize = 'qword';
let isPanelOpen = false;

const conversionData = {
    length: {
        units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
        baseUnit: 'm',
        conversions: {
            mm: 0.001,
            cm: 0.01,
            m: 1,
            km: 1000,
            in: 0.0254,
            ft: 0.3048,
            yd: 0.9144,
            mi: 1609.344
        }
    },
    mass: {
        units: ['mg', 'g', 'kg', 'oz', 'lb', 't'],
        baseUnit: 'kg',
        conversions: {
            mg: 0.000001,
            g: 0.001,
            kg: 1,
            oz: 0.0283495,
            lb: 0.453592,
            t: 1000
        }
    },
    temperature: {
        units: ['°C', '°F', 'K'],
        baseUnit: '°C',
        conversions: {
            '°C': {
                to: (c) => c,
                from: (c) => c
            },
            '°F': {
                to: (c) => c * 9 / 5 + 32,
                from: (f) => (f - 32) * 5 / 9
            },
            'K': {
                to: (c) => c + 273.15,
                from: (k) => k - 273.15
            }
        }
    },
    area: {
        units: ['mm²', 'cm²', 'm²', 'km²', 'in²', 'ft²', 'ac', 'ha'],
        baseUnit: 'm²',
        conversions: {
            'mm²': 0.000001,
            'cm²': 0.0001,
            'm²': 1,
            'km²': 1000000,
            'in²': 0.00064516,
            'ft²': 0.092903,
            'ac': 4046.86,
            'ha': 10000
        }
    },
    volume: {
        units: ['ml', 'l', 'in³', 'ft³', 'gal', 'qt', 'pt', 'cup'],
        baseUnit: 'l',
        conversions: {
            'ml': 0.001,
            'l': 1,
            'in³': 0.0163871,
            'ft³': 28.3168,
            'gal': 3.78541,
            'qt': 0.946353,
            'pt': 0.473176,
            'cup': 0.24
        }
    },
    time: {
        units: ['ms', 's', 'min', 'h', 'd', 'wk', 'mo', 'yr'],
        baseUnit: 's',
        conversions: {
            'ms': 0.001,
            's': 1,
            'min': 60,
            'h': 3600,
            'd': 86400,
            'wk': 604800,
            'mo': 2629746,
            'yr': 31556952
        }
    },
    speed: {
        units: ['m/s', 'km/h', 'mph', 'knot', 'ft/s'],
        baseUnit: 'm/s',
        conversions: {
            'm/s': 1,
            'km/h': 0.277778,
            'mph': 0.44704,
            'knot': 0.514444,
            'ft/s': 0.3048
        }
    },
    data: {
        units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
        baseUnit: 'B',
        conversions: {
            'B': 1,
            'KB': 1024,
            'MB': 1048576,
            'GB': 1073741824,
            'TB': 1099511627776,
            'PB': 1125899906842624
        }
    }
};

function factorial(n) {
    if (n < 0 || Math.floor(n) !== n) return 'Error: n must be a non-negative integer';
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function sin(val) {
    return settings.isRadians ? Math.sin(val) : Math.sin(val * Math.PI / 180);
}

function cos(val) {
    return settings.isRadians ? Math.cos(val) : Math.cos(val * Math.PI / 180);
}

function tan(val) {
    return settings.isRadians ? Math.tan(val) : Math.tan(val * Math.PI / 180);
}

function sqrt(val) {
    return Math.sqrt(val);
}

function cbrt(val) {
    return Math.cbrt(val);
}

function ln(val) {
    return Math.log(val);
}

function log(val) {
    return Math.log10(val);
}

function updateDisplay() {
    expressionDisplay.textContent = currentExpression;

    if (resultDisplayed) {
        let formattedResult = mainDisplay.textContent;
        if (settings.decimalPlaces !== 'auto' && !isNaN(parseFloat(formattedResult))) {
            const places = parseInt(settings.decimalPlaces);
            formattedResult = parseFloat(formattedResult).toFixed(places);
            if (places > 0) {
                formattedResult = formattedResult.replace(/\.?0+$/, '');
            }
        }
        mainDisplay.textContent = formattedResult;
    } else {
        mainDisplay.textContent = currentExpression || DISPLAY_DEFAULT;
    }
}

function clearAll() {
    currentExpression = '';
    resultDisplayed = false;
    updateDisplay();
    mainDisplay.textContent = DISPLAY_DEFAULT;
}

function clearEntry() {
    if (resultDisplayed) {
        clearAll();
    } else {
        const lastOperatorIndex = Math.max(
            currentExpression.lastIndexOf('+'),
            currentExpression.lastIndexOf('-'),
            currentExpression.lastIndexOf('*'),
            currentExpression.lastIndexOf('/')
        );

        if (lastOperatorIndex >= 0) {
            currentExpression = currentExpression.substring(0, lastOperatorIndex + 1);
        } else {
            currentExpression = '';
        }
        updateDisplay();
    }
}

function deleteLast() {
    if (resultDisplayed) {
        clearAll();
        return;
    }

    if (currentExpression.length > 0) {
        currentExpression = currentExpression.slice(0, -1);
        updateDisplay();
    }

    if (currentExpression === '') {
        mainDisplay.textContent = DISPLAY_DEFAULT;
    }
}

function appendInput(value) {
    if (resultDisplayed) {
        const isOperator = OPERATORS.includes(value);
        if (isOperator) {
            currentExpression = mainDisplay.textContent;
        } else {
            currentExpression = '';
        }
        resultDisplayed = false;
    }

    if (currentExpression === '0' && value !== '.' && !value.endsWith('(') && value !== 'Math.PI' && value !== 'Math.E' && value !== '-') {
        currentExpression = '';
    }

    if (value === '.') {
        const segments = currentExpression.split(/[+\-*/%^()]/);
        if (segments.length > 0 && segments[segments.length - 1].includes('.')) {
            return;
        }
    }

    currentExpression += value;
    updateDisplay();
}

function calculate() {
    if (!currentExpression || resultDisplayed) return;

    try {
        const expression = currentExpression;

        let evalExpression = currentExpression
            .replace(/Math\.PI/g, Math.PI)
            .replace(/Math\.E/g, Math.E)
            .replace(/sin\(/g, `sin(`)
            .replace(/cos\(/g, `cos(`)
            .replace(/tan\(/g, `tan(`)
            .replace(/sqrt\(/g, `sqrt(`)
            .replace(/cbrt\(/g, `cbrt(`)
            .replace(/log\(/g, `log(`)
            .replace(/ln\(/g, `ln(`)
            .replace(/fact\(/g, `factorial(`)
            .replace(/\^/g, '**')
            .replace(/x²/g, '**2')
            .replace(/1\/x/g, '1/');

        const mathRegex = /^[0-9+\-*/().e\s]+$/;
        if (!mathRegex.test(evalExpression.replace(/sin|cos|tan|sqrt|cbrt|log|ln|factorial|Math\.PI|Math\.E|\*\*/g, ''))) {
            throw new Error('Invalid expression');
        }

        let result = eval(evalExpression);

        if (typeof result !== 'number' || isNaN(result)) {
            throw new Error('Invalid result');
        }

        if (!isFinite(result)) {
            mainDisplay.textContent = 'Error: Division by zero';
            resultDisplayed = true;
            return;
        }

        const resultStr = formatResult(result);
        mainDisplay.textContent = resultStr;
        lastAnswer = result;
        resultDisplayed = true;

        addCalculationEffect();

        addToHistory(expression, resultStr);

    } catch (error) {
        console.error('Calculation error:', error);
        mainDisplay.textContent = 'Error';
        resultDisplayed = true;
    }
}

function formatResult(number) {
    if (settings.decimalPlaces === 'auto') {
        if (Number.isInteger(number)) {
            return number.toString();
        } else {
            return parseFloat(number.toPrecision(10)).toString();
        }
    } else {
        const places = parseInt(settings.decimalPlaces);
        return number.toFixed(places);
    }
}

let memoryValue = 0;

function memoryClear() {
    memoryValue = 0;
}

function memoryRecall() {
    if (resultDisplayed || currentExpression === '') {
        currentExpression = memoryValue.toString();
    } else {
        currentExpression += memoryValue.toString();
    }
    resultDisplayed = false;
    updateDisplay();
}

function memoryAdd() {
    if (resultDisplayed) {
        memoryValue += parseFloat(mainDisplay.textContent);
    } else if (currentExpression) {
        try {
            memoryValue += eval(currentExpression);
        } catch (e) {
            console.error('Error adding to memory:', e);
        }
    }
}

function memorySubtract() {
    if (resultDisplayed) {
        memoryValue -= parseFloat(mainDisplay.textContent);
    } else if (currentExpression) {
        try {
            memoryValue -= eval(currentExpression);
        } catch (e) {
            console.error('Error subtracting from memory:', e);
        }
    }
}

function memoryStore() {
    if (resultDisplayed) {
        memoryValue = parseFloat(mainDisplay.textContent);
    } else if (currentExpression) {
        try {
            memoryValue = eval(currentExpression);
        } catch (e) {
            console.error('Error storing to memory:', e);
        }
    }
}

function addToHistory(expression, result) {
    const entry = {
        expression: expression,
        result: result,
        timestamp: new Date().toISOString()
    };

    history.unshift(entry);

    if (history.length > 50) {
        history.pop();
    }

    saveHistory();

    if (activeTab === 'history') {
        renderHistory();
    }
}

function renderHistory() {
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No calculations yet</div>';
        return;
    }

    history.forEach((entry, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const expressionDiv = document.createElement('div');
        expressionDiv.className = 'history-expression';
        expressionDiv.textContent = entry.expression;

        const resultDiv = document.createElement('div');
        resultDiv.className = 'history-result';
        resultDiv.textContent = '= ' + entry.result;

        historyItem.appendChild(expressionDiv);
        historyItem.appendChild(resultDiv);

        historyItem.addEventListener('click', () => {
            currentExpression = entry.expression;
            updateDisplay();

            setActiveTab('scientific');
        });

        historyList.appendChild(historyItem);
    });
}

function clearHistoryData() {
    history = [];
    localStorage.removeItem('calculator_history');
    renderHistory();
}

function saveHistory() {
    localStorage.setItem('calculator_history', JSON.stringify(history));
}

function setActiveTab(tabName) {
    activeTab = tabName;

    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    calculatorPanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === tabName + 'Panel');
    });

    if (tabName === 'history') {
        renderHistory();
    }

    if (tabName === 'converter') {
        updateConverterUnits();
    }

    if (tabName === 'programmer') {
        adjustProgrammerLayout();
    }
}

function toggleSettingsPanel() {
    settingsPanel.classList.toggle('active');
    isPanelOpen = settingsPanel.classList.contains('active');

    document.body.style.overflow = isPanelOpen ? 'hidden' : '';

    if (isPanelOpen) {
        fontSizeSlider.value = settings.fontSize;
        fontSizeValue.textContent = `${settings.fontSize}%`;
        decimalPlaces.value = settings.decimalPlaces;

        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === settings.theme);
        });

        colorButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === settings.accentColor);
        });

        degButton.classList.toggle('active', !settings.isRadians);
        radButton.classList.toggle('active', settings.isRadians);

        soundToggle.checked = settings.soundEnabled;
        hapticToggle.checked = settings.hapticEnabled;

        const confettiToggle = document.getElementById('confettiToggle');
        if (confettiToggle) {
            confettiToggle.checked = settings.confettiEnabled;
        }

        const buttonEffectsToggle = document.getElementById('buttonEffectsToggle');
        if (buttonEffectsToggle) {
            buttonEffectsToggle.checked = settings.buttonEffects;
        }

        if (!settingsPanel.querySelector('.settings-content-scrollable')) {
            const settingsContent = settingsPanel.querySelector('.settings-content');

            const scrollableContainer = document.createElement('div');
            scrollableContainer.className = 'settings-content-scrollable';

            const settingGroups = settingsContent.querySelectorAll('.setting-group');
            settingGroups.forEach(group => {
                scrollableContainer.appendChild(group);
            });

            settingsContent.appendChild(scrollableContainer);
        }
    }
}

function toggleShortcuts() {
    if (window.innerWidth <= 768) {
        showCalculatorTips();
    } else {
        keyboardShortcuts.classList.toggle('active');
        isPanelOpen = keyboardShortcuts.classList.contains('active');

        document.body.style.overflow = isPanelOpen ? 'hidden' : '';
    }
}

function showCalculatorTips() {
    let tipsOverlay = document.getElementById('calculatorTips');

    if (!tipsOverlay) {
        tipsOverlay = document.createElement('div');
        tipsOverlay.id = 'calculatorTips';
        tipsOverlay.className = 'shortcuts-overlay';

        const tipsContent = document.createElement('div');
        tipsContent.className = 'shortcuts-content';

        tipsContent.innerHTML = `
            <h3>Calculator Tips</h3>
            <div class="tips-list">
                <div class="tip-item">
                    <div class="tip-icon">✓</div>
                    <div class="tip-text">Swipe left/right on tabs to change calculator mode</div>
                </div>
                <div class="tip-item">
                    <div class="tip-icon">✓</div>
                    <div class="tip-text">Long press the equals button for extra options</div>
                </div>
                <div class="tip-item">
                    <div class="tip-icon">✓</div>
                    <div class="tip-text">Double tap the display to copy the result</div>
                </div>
                <div class="tip-item">
                    <div class="tip-icon">✓</div>
                    <div class="tip-text">Use memory buttons (M+, M-, MR) to store calculations</div>
                </div>
                <div class="tip-item">
                    <div class="tip-icon">✓</div>
                    <div class="tip-text">Switch to programmer mode for binary, hex, and octal</div>
                </div>
            </div>
            <button id="closeTips" class="close-shortcuts-btn">Close</button>
        `;

        tipsOverlay.appendChild(tipsContent);
        document.body.appendChild(tipsOverlay);

        document.getElementById('closeTips').addEventListener('click', () => {
            tipsOverlay.classList.remove('active');
            isPanelOpen = false;
            document.body.style.overflow = '';
        });
    }

    tipsOverlay.classList.add('active');
    isPanelOpen = true;
    document.body.style.overflow = 'hidden';
}

function updateSettings() {
    const fontSize = parseInt(settings.fontSize) / 100;
    mainDisplay.style.fontSize = `calc(2.5rem * ${fontSize})`;
    expressionDisplay.style.fontSize = `calc(0.9rem * ${fontSize})`;

    document.body.className = `theme-${settings.theme}`;

    document.documentElement.style.setProperty('--accent-color', settings.accentColor);

    degButton.classList.toggle('active', !settings.isRadians);
    radButton.classList.toggle('active', settings.isRadians);

    const confettiToggle = document.getElementById('confettiToggle');
    if (confettiToggle) {
        confettiToggle.checked = settings.confettiEnabled;
    }

    const buttonEffectsToggle = document.getElementById('buttonEffectsToggle');
    if (buttonEffectsToggle) {
        buttonEffectsToggle.checked = settings.buttonEffects;
    }

    localStorage.setItem('calculator_settings', JSON.stringify(settings));
}

function toggleTheme() {
    const themes = ['dark', 'light', 'neon', 'contrast'];
    const currentIndex = themes.indexOf(settings.theme);
    settings.theme = themes[(currentIndex + 1) % themes.length];

    themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === settings.theme);
    });

    updateSettings();
}

function setAccentColor(color) {
    settings.accentColor = color;

    colorButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === color);
    });

    updateSettings();
}

function toggleAngleUnit() {
    settings.isRadians = !settings.isRadians;
    updateSettings();
}

function setNumberBase(base) {
    currentBase = base;

    baseButtons.forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.base === base);
    });

    updateProgrammerDisplay();
}

function setWordSize(size) {
    currentWordSize = size;

    wordButtons.forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.word === size);
    });

    updateProgrammerDisplay();
}

function updateProgrammerDisplay() {
    let value = 0;

    if (resultDisplayed) {
        value = parseInt(mainDisplay.textContent) || 0;
    } else if (currentExpression) {
        try {
            value = parseInt(eval(currentExpression)) || 0;
        } catch (e) {
            value = 0;
        }
    }

    switch (currentWordSize) {
        case 'byte':
            value = value & 0xFF;
            break;
        case 'word':
            value = value & 0xFFFF;
            break;
        case 'dword':
            value = value & 0xFFFFFFFF;
            break;
        case 'qword':
            break;
    }

    let displayValue = '';
    switch (currentBase) {
        case 'bin':
            displayValue = value.toString(2);
            break;
        case 'oct':
            displayValue = value.toString(8);
            break;
        case 'dec':
            displayValue = value.toString(10);
            break;
        case 'hex':
            displayValue = value.toString(16).toUpperCase();
            break;
    }

    mainDisplay.textContent = displayValue;

    updateBitDisplay(value);
}

function updateBitDisplay(value) {
    let binary = value.toString(2).padStart(64, '0');

    const upperBits = binary.substring(0, 32);
    const formattedUpperBits = formatBitString(upperBits);
    document.querySelector('.bit-row:first-child .bits').textContent = formattedUpperBits;

    const lowerBits = binary.substring(32, 64);
    const formattedLowerBits = formatBitString(lowerBits);
    document.querySelector('.bit-row:last-child .bits').textContent = formattedLowerBits;
}

function formatBitString(bitStr) {
    let formatted = '';
    for (let i = 0; i < bitStr.length; i += 8) {
        formatted += bitStr.substring(i, i + 8) + ' ';
    }
    return formatted.trim();
}

function updateConverterUnits() {
    const category = converterCategory.value;
    const data = conversionData[category];

    fromUnit.innerHTML = '';
    toUnit.innerHTML = '';

    data.units.forEach(unit => {
        const fromOption = document.createElement('option');
        fromOption.value = unit;
        fromOption.textContent = unit;
        fromUnit.appendChild(fromOption);

        const toOption = document.createElement('option');
        toOption.value = unit;
        toOption.textContent = unit;
        toUnit.appendChild(toOption);
    });

    if (data.units.length >= 2) {
        fromUnit.value = data.units[0];
        toUnit.value = data.units[1];
    }

    convertUnits();
}

function convertUnits() {
    const category = converterCategory.value;
    const data = conversionData[category];
    const from = fromUnit.value;
    const to = toUnit.value;
    const value = parseFloat(fromValue.value);

    if (isNaN(value)) {
        toValue.value = '';
        return;
    }

    let result;

    if (category === 'temperature') {
        const toCelsius = data.conversions[from].from(value);
        result = data.conversions[to].to(toCelsius);
    } else {
        const valueInBaseUnit = value * data.conversions[from];
        result = valueInBaseUnit / data.conversions[to];
    }

    toValue.value = result.toPrecision(10);
}

function swapConversionUnits() {
    const tempUnit = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = tempUnit;

    const tempValue = fromValue.value;
    fromValue.value = toValue.value;
    toValue.value = tempValue;

    if (fromValue.value) {
        convertUnits();
    }
}

function playClickSound() {
    if (settings.soundEnabled) {
        buttonClickSound.currentTime = 0;
        buttonClickSound.play().catch(e => console.log('Error playing sound:', e));
    }
}

function hapticFeedback() {
    if (settings.hapticEnabled && navigator.vibrate) {
        navigator.vibrate(10);
    }
}

function loadSavedData() {
    const savedSettings = localStorage.getItem('calculator_settings');
    if (savedSettings) {
        try {
            const parsed = JSON.parse(savedSettings);
            settings = { ...DEFAULT_SETTINGS, ...parsed };
        } catch (e) {
            console.error('Error loading settings:', e);
            settings = { ...DEFAULT_SETTINGS };
        }
    }

    const savedHistory = localStorage.getItem('calculator_history');
    if (savedHistory) {
        try {
            history = JSON.parse(savedHistory);
        } catch (e) {
            console.error('Error loading history:', e);
            history = [];
        }
    }

    updateSettings();
    initEventListeners();
}

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        playClickSound();
        hapticFeedback();
        setActiveTab(btn.dataset.tab);
    });
});

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        playClickSound();
        hapticFeedback();

        if (settings.buttonEffects) {
            addButtonAnimation(btn);
        }

        const value = btn.dataset.value;
        const action = btn.dataset.action;
        const input = btn.dataset.input;

        if (value) {
            appendInput(value);
        } else if (action) {
            switch (action) {
                case 'all-clear':
                    clearAll();
                    break;
                case 'clear-entry':
                    clearEntry();
                    break;
                case 'delete':
                    deleteLast();
                    break;
                case 'calculate':
                    calculate();
                    break;
                case 'percent':
                    appendInput('*0.01');
                    break;
                case 'memory-clear':
                    memoryClear();
                    break;
                case 'memory-recall':
                    memoryRecall();
                    break;
                case 'memory-add':
                    memoryAdd();
                    break;
                case 'memory-subtract':
                    memorySubtract();
                    break;
                case 'memory-store':
                    memoryStore();
                    break;
                case 'backspace':
                    let val = fromValue.value;
                    if (val.length > 0) {
                        fromValue.value = val.slice(0, -1);
                        convertUnits();
                    }
                    break;
                case 'clear':
                    fromValue.value = '';
                    toValue.value = '';
                    break;
                case 'convert':
                    convertUnits();
                    break;
            }
        } else if (input) {
            if (activeTab === 'converter') {
                if (input === '-') {
                    fromValue.value = parseFloat(fromValue.value || 0) * -1;
                } else {
                    fromValue.value += input;
                }
                convertUnits();
            }
        }
    });
});

settingsBtn.addEventListener('click', () => {
    playClickSound();
    hapticFeedback();
    toggleSettingsPanel();
});

closeSettings.addEventListener('click', () => {
    playClickSound();
    hapticFeedback();
    toggleSettingsPanel();
});

themeToggle.addEventListener('click', () => {
    playClickSound();
    hapticFeedback();
    toggleTheme();
});

helpBtn.addEventListener('click', () => {
    playClickSound();
    hapticFeedback();
    toggleShortcuts();
});

closeShortcuts.addEventListener('click', () => {
    playClickSound();
    hapticFeedback();
    toggleShortcuts();
});

fontSizeSlider.addEventListener('input', (e) => {
    settings.fontSize = parseInt(e.target.value);
    fontSizeValue.textContent = `${settings.fontSize}%`;
    updateSettings();
});

decimalPlaces.addEventListener('change', (e) => {
    settings.decimalPlaces = e.target.value;
    updateSettings();
    if (resultDisplayed) {
        updateDisplay();
    }
});

themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        playClickSound();
        hapticFeedback();
        settings.theme = btn.dataset.theme;

        themeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        updateSettings();
    });
});

colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        playClickSound();
        hapticFeedback();
        setAccentColor(btn.dataset.color);
    });
});

degButton.addEventListener('click', () => {
    playClickSound();
    hapticFeedback();
    settings.isRadians = false;
    updateSettings();
});

radButton.addEventListener('click', () => {
    playClickSound();
    hapticFeedback();
    settings.isRadians = true;
    updateSettings();
});

soundToggle.addEventListener('change', () => {
    settings.soundEnabled = soundToggle.checked;
    updateSettings();
    if (settings.soundEnabled) {
        playClickSound();
    }
});

hapticToggle.addEventListener('change', () => {
    settings.hapticEnabled = hapticToggle.checked;
    updateSettings();
    if (settings.hapticEnabled) {
        hapticFeedback();
    }
});

clearHistory.addEventListener('click', () => {
    playClickSound();
    hapticFeedback();
    clearHistoryData();
});

converterCategory.addEventListener('change', () => {
    playClickSound();
    hapticFeedback();
    updateConverterUnits();
});

fromValue.addEventListener('input', () => {
    convertUnits();
});

fromUnit.addEventListener('change', () => {
    playClickSound();
    hapticFeedback();
    convertUnits();
});

toUnit.addEventListener('change', () => {
    playClickSound();
    hapticFeedback();
    convertUnits();
});

swapUnits.addEventListener('click', () => {
    playClickSound();
    hapticFeedback();
    swapConversionUnits();
});

baseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        playClickSound();
        hapticFeedback();
        setNumberBase(btn.dataset.base);
    });
});

wordButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        playClickSound();
        hapticFeedback();
        setWordSize(btn.dataset.word);
    });
});

document.addEventListener('keydown', (e) => {
    if (isPanelOpen) {
        if (e.key === 'Escape') {
            if (settingsPanel.classList.contains('active')) {
                toggleSettingsPanel();
            }
            if (keyboardShortcuts.classList.contains('active')) {
                toggleShortcuts();
            }
        }
        return;
    }

    if (/^[0-9]$/.test(e.key)) {
        appendInput(e.key);
    } else if (['+', '-', '*', '/', '.', '(', ')'].includes(e.key)) {
        appendInput(e.key);
    } else if (e.key === '^') {
        appendInput('^');
    } else if (e.key === '%') {
        appendInput('*0.01');
    } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
    } else if (e.key === 'Backspace') {
        deleteLast();
    } else if (e.key === 'Escape') {
        clearAll();
    } else if (e.key === '?') {
        toggleShortcuts();
    } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        if (currentExpression) {
            deleteLast();
        }
    }
});

loadSavedData();
clearAll();
setActiveTab('scientific');
updateConverterUnits();

document.addEventListener('click', handleOutsideClick);
document.addEventListener('touchend', handleOutsideClick);

function handleOutsideClick(e) {
    if (e.type === 'touchend' &&
        (settingsPanel.classList.contains('active') ||
            keyboardShortcuts.classList.contains('active') ||
            document.getElementById('calculatorTips')?.classList.contains('active'))) {
        if (!e.target.closest('.settings-content') &&
            !e.target.closest('.shortcuts-content') &&
            e.target !== settingsBtn &&
            e.target !== helpBtn) {
            e.preventDefault();
        }
    }

    if (settingsPanel.classList.contains('active') &&
        !e.target.closest('.settings-content') &&
        e.target !== settingsBtn &&
        !settingsBtn.contains(e.target)) {
        toggleSettingsPanel();
    }

    if (keyboardShortcuts.classList.contains('active') &&
        !keyboardShortcuts.querySelector('.shortcuts-content').contains(e.target) &&
        e.target !== helpBtn &&
        !helpBtn.contains(e.target)) {
        keyboardShortcuts.classList.remove('active');
        isPanelOpen = false;
        document.body.style.overflow = '';
    }

    const calculatorTips = document.getElementById('calculatorTips');
    if (calculatorTips && calculatorTips.classList.contains('active') &&
        !calculatorTips.querySelector('.shortcuts-content').contains(e.target) &&
        e.target !== helpBtn &&
        !helpBtn.contains(e.target)) {
        calculatorTips.classList.remove('active');
        isPanelOpen = false;
        document.body.style.overflow = '';
    }
}

window.addEventListener('resize', () => {
    if (activeTab === 'programmer') {
        adjustProgrammerLayout();
    }
});

function adjustProgrammerLayout() {
    const programmerPanel = document.getElementById('programmerPanel');
    const bitDisplay = programmerPanel.querySelector('.bit-display');
    const bitRows = bitDisplay.querySelectorAll('.bit-row');
    const programmerButtons = programmerPanel.querySelector('.programmer-buttons');

    programmerPanel.style.maxWidth = '100%';
    programmerPanel.style.overflowX = 'auto';

    bitDisplay.style.maxWidth = '100%';
    bitDisplay.style.overflowX = 'auto';

    if (window.innerWidth <= 480) {
        bitRows.forEach(row => {
            const bits = row.querySelector('.bits');
            if (!bits.dataset.fullBits) {
                bits.dataset.fullBits = bits.textContent;
            }

            const fullBits = bits.dataset.fullBits;
            const compactBits = fullBits.replace(/\s/g, '').substring(0, 16) + '...';
            bits.textContent = compactBits;

            row.style.overflowX = 'auto';
            row.style.whiteSpace = 'nowrap';
        });

        programmerButtons.style.gridTemplateColumns = 'repeat(3, 1fr)';
        programmerButtons.style.gap = '5px';

        const buttons = programmerButtons.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.style.padding = '8px 4px';
            btn.style.fontSize = '0.85rem';
        });
    } else {
        bitRows.forEach(row => {
            const bits = row.querySelector('.bits');
            if (bits.dataset.fullBits) {
                bits.textContent = bits.dataset.fullBits;
            }
            row.style.overflowX = '';
            row.style.whiteSpace = '';
        });

        programmerButtons.style.gridTemplateColumns = '';
        programmerButtons.style.gap = '';

        const buttons = programmerButtons.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.style.padding = '';
            btn.style.fontSize = '';
        });
    }
}

function addButtonAnimation(button) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';

    const size = Math.max(button.offsetWidth, button.offsetHeight);
    ripple.style.width = ripple.style.height = `${size}px`;

    ripple.style.left = `50%`;
    ripple.style.top = `50%`;
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.style.transform = 'translate(-50%, -50%) scale(1)';
        ripple.style.opacity = '0';

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }, 10);
}

function addCalculationEffect() {
    if (!resultDisplayed) return;

    mainDisplay.classList.add('result-flash');

    setTimeout(() => {
        mainDisplay.classList.remove('result-flash');
    }, 500);

    if (settings.confettiEnabled && Math.random() < 0.3) {
        createConfetti();
    }
}

function createConfetti() {
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti';

        const size = Math.random() * 8 + 6;
        const color = `hsl(${Math.random() * 360}, 80%, 60%)`;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = color;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${mainDisplay.offsetTop - 10}px`;
        particle.style.animationDelay = `${Math.random() * 0.5}s`;

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 3000);
    }
}

buttonEffectsToggle.addEventListener('change', () => {
    settings.buttonEffects = buttonEffectsToggle.checked;
    updateSettings();
    if (buttonEffectsToggle.checked) {
        addButtonAnimation(buttonEffectsToggle.closest('.setting-item'));
    }
});

confettiToggle.addEventListener('change', () => {
    settings.confettiEnabled = confettiToggle.checked;
    updateSettings();
    if (confettiToggle.checked) {
        createConfettiDemo();
    }
});

function createConfettiDemo() {
    const particleCount = 20;
    const settingsPanel = document.querySelector('.settings-content');

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti';

        const size = Math.random() * 6 + 4;
        const color = `hsl(${Math.random() * 360}, 80%, 60%)`;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = color;
        particle.style.left = `${50 + (Math.random() * 40 - 20)}%`;
        particle.style.top = `${confettiToggle.getBoundingClientRect().top - settingsPanel.getBoundingClientRect().top}px`;
        particle.style.animationDelay = `${Math.random() * 0.2}s`;
        particle.style.animationDuration = '1.5s';

        settingsPanel.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 1500);
    }
}

function initEventListeners() {
    let lastTap = 0;
    mainDisplay.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;

        if (tapLength < 500 && tapLength > 0) {
            copyDisplayValue();
            e.preventDefault();
        }
        lastTap = currentTime;
    });

    mainDisplay.addEventListener('dblclick', copyDisplayValue);

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('touchend', handleOutsideClick);

    const calculatorWrapper = document.querySelector('.calculator-wrapper');
    let touchstartX = 0;
    let touchendX = 0;

    calculatorWrapper.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    });

    calculatorWrapper.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    });

    function handleSwipeGesture() {
        const threshold = 75;
        const tabs = ['scientific', 'programmer', 'converter', 'history'];
        const currentTabIndex = tabs.indexOf(activeTab);

        if (touchendX < touchstartX - threshold) {
            const nextTabIndex = (currentTabIndex + 1) % tabs.length;
            setActiveTab(tabs[nextTabIndex]);
            playClickSound();
            if (settings.hapticEnabled) hapticFeedback();
        }

        if (touchendX > touchstartX + threshold) {
            const prevTabIndex = (currentTabIndex - 1 + tabs.length) % tabs.length;
            setActiveTab(tabs[prevTabIndex]);
            playClickSound();
            if (settings.hapticEnabled) hapticFeedback();
        }
    }
}

function copyDisplayValue() {
    const textToCopy = mainDisplay.textContent;

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => showCopyFeedback('Copied!'))
            .catch(err => showCopyFeedback('Failed to copy'));
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = 0;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            showCopyFeedback(successful ? 'Copied!' : 'Failed to copy');
        } catch (err) {
            showCopyFeedback('Failed to copy');
        }

        document.body.removeChild(textArea);
    }
}

function showCopyFeedback(message) {
    let feedbackElement = document.getElementById('copyFeedback');

    if (!feedbackElement) {
        feedbackElement = document.createElement('div');
        feedbackElement.id = 'copyFeedback';
        feedbackElement.className = 'copy-feedback';
        document.body.appendChild(feedbackElement);
    }

    feedbackElement.textContent = message;
    feedbackElement.classList.add('active');

    setTimeout(() => {
        feedbackElement.classList.remove('active');
    }, 2000);
} 
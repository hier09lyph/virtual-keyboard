let keyboardLang = localStorage.getItem('keyboardLanguage')
  ? localStorage.getItem('keyboardLanguage')
  : 'ru';

const header = document.createElement('div');
header.classList = 'header';
document.body.append(header);

const textarea = document.createElement('textarea');
textarea.classList = 'textarea';
textarea.cols = 88;
textarea.rows = 10;
document.body.append(textarea);

setInterval(() => {
  textarea.focus();
}, 0);

const keyboard = document.createElement('div');
keyboard.className = 'keyboard';
document.body.append(keyboard);

const description = document.createElement('p');
description.className = 'description';
document.body.append(description);

function createDescriptionLanguage(ru, en) {
  return keyboardLang === 'ru' ? ru : en;
}

function descriptionLanguage() {
  header.innerHTML = createDescriptionLanguage(
    'Виртуальная клавитура',
    'Virtual Keyboard',
  );
  textarea.placeholder = createDescriptionLanguage(
    'Виртуальная клавитару создана в ОС Windows',
    'The virtual keyboard was created in Windows',
  );
  description.innerHTML = createDescriptionLanguage(
    'Для переключения языка раскладки клавиатуры используйте комбинацию клавиш: Left Ctrl + Left Alt',
    'To switch the language combination: Left Ctrl + Left Alt',
  );
}

descriptionLanguage();

let keyboardLayout;
const keyboardButtons = [];

let unshifted = true;
let iscapsLockPressed = false;
let isLeftAltPressed = false;
let isLeftCtrlPressed = false;

function clenKeyboard() {
  while (keyboard.firstChild) {
    keyboard.removeChild(keyboard.firstChild);
  }
}

function updateTextarea(symbol, n) {
  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;
  const currentValue = textarea.value;
  const newValue = currentValue.substring(0, startPos)
    + symbol
    + currentValue.substring(endPos);
  textarea.value = newValue;
  textarea.setSelectionRange(startPos + n, startPos + n);
}

function deleteFunc() {
  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;
  const currentValue = textarea.value;
  const newValue = currentValue.substring(0, startPos) + currentValue.substring(endPos + 1);
  textarea.value = newValue;
  textarea.setSelectionRange(startPos, startPos);
}

function backspaceFunc() {
  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;
  const currentValue = textarea.value;
  const newValue = currentValue.substring(0, startPos - 1) + currentValue.substring(endPos);
  textarea.value = newValue;
  textarea.setSelectionRange(startPos - 1, startPos - 1);
}
function generateKeyboard(layout, notUpperCase) {
  layout.forEach((keyData) => {
    // eslint-disable-next-line no-use-before-define
    const key = new KeyboardButton(keyData);
    if (notUpperCase) {
      keyboard.appendChild(key.element);
    } else {
      keyboard.appendChild(key.elementShifted);
    }
    keyboardButtons.push(key);
  });
}

function pressShift(pressed, eventCode) {
  unshifted = unshifted === false;
  const onCapsLock = iscapsLockPressed;
  if (pressed) {
    clenKeyboard();
    generateKeyboard(keyboardLayout[keyboardLang], unshifted);

    const shiftButton = document.querySelector(`.${eventCode}`);
    shiftButton.classList.add('pressed');
  } else {
    clenKeyboard();
    generateKeyboard(keyboardLayout[keyboardLang], unshifted);
  }
  if (onCapsLock) {
    const capsLockButton = document.querySelector('.CapsLock');
    capsLockButton.classList.add('pressed');
    iscapsLockPressed = true;
  }
}

function pressCapsLock() {
  if (iscapsLockPressed) {
    unshifted = true;
    clenKeyboard();
    generateKeyboard(keyboardLayout[keyboardLang], unshifted);
    const capsLockButton = document.querySelector('.CapsLock');
    capsLockButton.classList.remove('pressed');
    iscapsLockPressed = false;
  } else {
    unshifted = false;
    clenKeyboard();
    generateKeyboard(keyboardLayout[keyboardLang], unshifted);
    const capsLockButton = document.querySelector('.CapsLock');
    capsLockButton.classList.add('pressed');
    iscapsLockPressed = true;
  }
}

class KeyboardButton {
  constructor(keyData) {
    this.eventCode = keyData.eventCode;
    this.type = keyData.type;
    this.character = keyData.character;
    this.alternativeCharacter = keyData.alternativeCharacter;
    this.element = this.createButtonElement(true);
    this.elementShifted = this.createButtonElement(false);
  }

  createButtonElement(notUpperCase) {
    const button = document.createElement('div');
    if (this.type === 'functional' || this.type === 'spacing') {
      button.className = `${this.eventCode} key`;
    } else {
      button.className = 'key';
    }

    if (notUpperCase) {
      button.textContent = this.character;
      if (this.character === 'Delete') {
        button.textContent = 'Del';
      }
    } else {
      if (this.type === 'changeable') {
        button.textContent = this.alternativeCharacter;
      } else if (this.type === 'letter') {
        button.textContent = this.character.toUpperCase();
      } else {
        button.textContent = this.character;
      }

      if (this.character === 'Delete') {
        button.textContent = 'Del';
      }
    }
    button.addEventListener('click', () => {
      if (this.eventCode === 'Tab') {
        this.onButtonClick('\t');
      } else if (this.eventCode === 'Space') {
        this.onButtonClick(' ');
      } else if (this.eventCode === 'Enter') {
        this.onButtonClick('Enter');
      } else {
        this.onButtonClick(button.textContent);
      }
    });
    button.addEventListener('mousedown', () => {
      button.classList.add('pressed');
      setTimeout(() => {
        button.classList.remove('pressed');
      }, 300);
      if (this.eventCode === 'ShiftLeft' || this.eventCode === 'ShiftRight') {
        const { eventCode } = this;
        pressShift(true, eventCode);
      }
      if (this.eventCode === 'Delete') {
        deleteFunc();
      }
      if (this.eventCode === 'Backspace') {
        backspaceFunc();
      }
    });

    button.addEventListener('mouseup', () => {
      if (this.eventCode === 'ShiftLeft' || this.eventCode === 'ShiftRight') {
        const { eventCode } = this;
        pressShift(false, eventCode);
      }
      if (this.eventCode === 'CapsLock') {
        pressCapsLock();
      }
    });

    return button;
  }

  onButtonClick(text) {
    if (text === 'Enter') {
      updateTextarea(`${'\n'}`, 1);
    } else if (this.type !== 'functional') {
      if (text === '    ') {
        updateTextarea(text, 4);
      } else {
        updateTextarea(text, 1);
      }
    }
  }
}

async function generateKeyboardData() {
  try {
    const response = await fetch('assets/keyboard.json');
    const data = await response.json();
    keyboardLayout = data;

    generateKeyboard(keyboardLayout[keyboardLang], unshifted);
  } catch (error) {
    console.error(error);
  }
}

generateKeyboardData();

function addPressedClass(elements) {
  elements.forEach((element) => {
    element.classList.add('pressed');
    setTimeout(() => {
      element.classList.remove('pressed');
    }, 300);
  });
}

function switchLanguage(keyboardLanguage) {
  clenKeyboard();
  descriptionLanguage();
  generateKeyboard(keyboardLayout[keyboardLanguage], unshifted);
  const altLeftButton = document.querySelector('.AltLeft');
  const cntrLeftButton = document.querySelector('.ControlLeft');
  addPressedClass([altLeftButton, cntrLeftButton]);
  localStorage.setItem('keyboardLanguage', keyboardLanguage);
}

function findKeyByEventCode(eventCode, keyboardBut) {
  const key = keyboardBut.find((keyBtn) => keyBtn.eventCode === eventCode);
  key?.element.classList.add('pressed');
  setTimeout(() => {
    key?.element.classList.remove('pressed');
  }, 200);
  return null;
}

window.addEventListener('keydown', (event) => {
  findKeyByEventCode(event.code, keyboardButtons);

  if (event.code === 'Tab') {
    event.preventDefault();
    updateTextarea('\t', 1);
  }

  if (event.key.length === 1) {
    event.preventDefault();
    for (let i = 0; i < keyboardButtons.length; i += 1) {
      if (
        keyboardButtons[i].eventCode === event.code
        && keyboard.children[i] !== undefined
      ) {
        updateTextarea(keyboard.children[i].textContent, 1);
        keyboard.children[i].classList.add('pressed');
        setTimeout(() => {
          keyboard.children[i].classList.remove('pressed');
        }, 200);
      }
    }
  }

  if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
    const eventCode = event.code;
    pressShift(true, eventCode);
  }

  if (event.code === 'CapsLock') {
    pressCapsLock();
  }

  if (event.code === 'AltLeft') {
    event.preventDefault();
    isLeftAltPressed = true;
  }

  if (event.code === 'ControlLeft') {
    event.preventDefault();
    isLeftCtrlPressed = true;
  }
  if (isLeftAltPressed && isLeftCtrlPressed) {
    isLeftAltPressed = true;
    isLeftCtrlPressed = true;
    if (keyboardLang === 'ru') {
      keyboardLang = 'en';
      switchLanguage(keyboardLang);
    } else {
      keyboardLang = 'ru';
      switchLanguage(keyboardLang);
    }
  }
});

window.addEventListener('keyup', (event) => {
  if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
    const eventCode = event.code;
    pressShift(false, eventCode);
  }

  if (event.code === 'AltLeft') {
    isLeftAltPressed = false;
    const altLeftButton = document.querySelector('.AltLeft');
    altLeftButton.classList.add('pressed');
  }

  if (event.code === 'ControlLeft') {
    isLeftCtrlPressed = false;
    const cntrLeftButton = document.querySelector('.ControlLeft');
    cntrLeftButton.classList.add('pressed');
  }
});

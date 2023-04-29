let keyboardLang = localStorage.getItem("keyboardLanguage")
  ? localStorage.getItem("keyboardLanguage")
  : "ru";

const header = document.createElement("div");
header.classList = "header";
document.body.append(header);

const textarea = document.createElement("textarea");
textarea.classList = "textarea";
textarea.cols = 88;
textarea.rows = 10;
document.body.append(textarea);



setInterval(() => {
  textarea.focus();
}, 0);

const keyboard = document.createElement("div");
keyboard.className = "keyboard";
document.body.append(keyboard);

const description = document.createElement("p");
description.className = "description";
document.body.append(description);

function descriptionLanguage(){
  header.innerHTML = createDescriptionLanguage("Виртуальная клавитура", "Virtual Keyboard");
  textarea.placeholder = createDescriptionLanguage("Виртуальная клавитару создана в ОС Windows", "The virtual keyboard was created in Windows");
  description.innerHTML = createDescriptionLanguage("Для переключения языка раскладки клавиатуры используйте комбинацию клавиш: Left Ctrl + Left Alt", "To switch the language combination: Left Ctrl + Left Alt")
}

function createDescriptionLanguage(ru,en){
  return keyboardLang == 'ru'? ru: en; 
}

descriptionLanguage()

let keyboardLayout;
let keyboardButtons = [];

let unshifted = true;
let iscapsLockPressed = false;
let isLeftAltPressed = false;
let isLeftCtrlPressed = false;

async function generateKeyboardData() {
  try {
    const response = await fetch("assets/keyboard.json");
    const data = await response.json();
    keyboardLayout = data;
    console.log(keyboardLayout[keyboardLang]);
    generateKeyboard(keyboardLayout[keyboardLang], unshifted);
  } catch (error) {
    console.error(error);
  }
}

generateKeyboardData();

class KeyboardButton {
  constructor(keyData) {
    this.eventCode = keyData.eventCode;
    this.type = keyData.type;
    this.character = keyData.character;
    this.alternativeCharacter = keyData.alternativeCharacter;
    this.element = this.createButtonElement(true);
    this.elementShifted = this.createButtonElement(false);
  }

  createButtonElement(unshifted) {
    const button = document.createElement("div");
    if (this.type == "functional" || this.type == "spacing") {
      button.className = `${this.eventCode} key`;
    } else {
      button.className = "key";
    }

    if (unshifted) {
      button.textContent = this.character;
      if (this.character == "Delete") {
        button.textContent = "Del";
      }
    } else {
      if (this.type == "changeable") {
        button.textContent = this.alternativeCharacter;
      } else if (this.type == "letter") {
        button.textContent = this.character.toUpperCase();
      } else {
        button.textContent = this.character;
      }

      if (this.character == "Delete") {
        button.textContent = "Del";
      }
    }
    button.addEventListener("click", () => {
      if (this.eventCode === "Tab") {
        this.onButtonClick("    ");
      } else if (this.eventCode === "Space") {
        this.onButtonClick(" ");
      } else if (this.eventCode === "Enter") {
        this.onButtonClick("Enter");
      } else {
        this.onButtonClick(button.textContent);
      }
    });
    button.addEventListener("mousedown", () => {
      button.classList.add("pressed");
      setTimeout(() => {
        button.classList.remove("pressed");
      }, 300);
      if (this.eventCode === "ShiftLeft" || this.eventCode === "ShiftRight") {
        let eventCode = this.eventCode;
        pressShift(true, eventCode);
      }
      if (this.eventCode === "Delete"){
        deleteFunc()
      }
      if (this.eventCode === "Backspace"){
        backspaceFunc()
      }
    });

    button.addEventListener("mouseup", () => {
      // button.classList.remove("pressed");
      if (this.eventCode === "ShiftLeft" || this.eventCode === "ShiftRight") {
        let eventCode = this.eventCode;
        pressShift(false, eventCode);
      }
      if (this.eventCode === "CapsLock") {
        pressCapsLock();
      }
    });

    return button;
  }

  onButtonClick(text) {
    if (text == "Enter") {
      updateTextarea(`${"\n"}`,1)
    } else if (this.type !== "functional") {
      text === '    '? updateTextarea(text,4):updateTextarea(text,1)
    }
  }
}

function generateKeyboard(layout, unshifted) {
  layout.forEach((keyData) => {
    const key = new KeyboardButton(keyData);
    if (unshifted) {
      keyboard.appendChild(key.element);
    } else {
      keyboard.appendChild(key.elementShifted);
    }
    keyboardButtons.push(key);
  });
}

function pressShift(pressed, eventCode) {
  if (pressed) {
    unshifted = false;
    clenKeyboard();
    generateKeyboard(keyboardLayout[keyboardLang], unshifted);

    let shiftButton = document.querySelector("." + `${eventCode}`);
    shiftButton.classList.add("pressed");
  } else {
    unshifted = true;
    clenKeyboard();
    generateKeyboard(keyboardLayout[keyboardLang], unshifted);
  }
}

function pressCapsLock() {
  if (iscapsLockPressed) {
    unshifted = true;
    clenKeyboard();
    generateKeyboard(keyboardLayout[keyboardLang], unshifted);
    let capsLockButton = document.querySelector(".CapsLock");
    capsLockButton.classList.remove("pressed");
    iscapsLockPressed = false;
  } else {
    unshifted = false;
    clenKeyboard();
    generateKeyboard(keyboardLayout[keyboardLang], unshifted);
    let capsLockButton = document.querySelector(".CapsLock");
    capsLockButton.classList.add("pressed");
    iscapsLockPressed = true;
  }
}

function switchLanguage(keyboardLang) {
  clenKeyboard();
  descriptionLanguage()
  generateKeyboard(keyboardLayout[keyboardLang], unshifted);
  let altLeftButton = document.querySelector(".AltLeft");
  let cntrLeftButton = document.querySelector(".ControlLeft");
  addPressedClass([altLeftButton, cntrLeftButton]);
  localStorage.setItem("keyboardLanguage", keyboardLang);
}

function addPressedClass([...arg]) {
  for (let element of arg) {
    element.classList.add("pressed");
    setTimeout(() => {
      element.classList.remove("pressed");
    }, 300);
  }
}

function clenKeyboard() {
  while (keyboard.firstChild) {
    keyboard.removeChild(keyboard.firstChild);
  }
}

function findKeyByEventCode(eventCode, keyboardButtons) {
  for (let key of keyboardButtons) {
    if (key.eventCode === eventCode) {
      key.element.classList.add("pressed");
      setTimeout(() => {
        key.element.classList.remove("pressed");
      }, 200);
    }
  }
  return null;
}

window.addEventListener("keydown", (event) => {
  findKeyByEventCode(event.code, keyboardButtons);

  if (event.code === "Tab") {
    event.preventDefault()
    updateTextarea('    ',4)
  }

  if (event.key.length == 1) {
    event.preventDefault();
    for (let i = 0; i < keyboardButtons.length; i++) {
      if (
        keyboardButtons[i].eventCode === event.code &&
        keyboard.children[i] !== undefined
      ) {
        updateTextarea(keyboard.children[i].textContent,1);
        keyboard.children[i].classList.add("pressed");
        setTimeout(() => {
          keyboard.children[i].classList.remove("pressed");
        }, 200);
      }
    }
  }

  if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
    let eventCode = event.code;
    pressShift(true, eventCode);
  }

  if (event.code === "CapsLock") {
    pressCapsLock();
  }

  if (event.code === "AltLeft") {
    event.preventDefault()
    isLeftAltPressed = true;
  }

  if (event.code === "ControlLeft") {
    event.preventDefault()
    isLeftCtrlPressed = true;
  }
  if (isLeftAltPressed && isLeftCtrlPressed) {
    console.log(111);
    isLeftAltPressed = true;
    isLeftCtrlPressed = true;
    if (keyboardLang === "ru") {
      keyboardLang = "en";
      switchLanguage(keyboardLang);
    } else {
      keyboardLang = "ru";
      switchLanguage(keyboardLang);
    }
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
    let eventCode = event.code;
    pressShift(false, eventCode);
  }

  if (event.code === "AltLeft") {
    isLeftAltPressed = false;
    let altLeftButton = document.querySelector(".AltLeft");
    altLeftButton.classList.add("pressed");
  }

  if (event.code === "ControlLeft") {
    isLeftCtrlPressed = false;
    let cntrLeftButton = document.querySelector(".ControlLeft");
    cntrLeftButton.classList.add("pressed");
  }
});

function updateTextarea(symbol,n){
const startPos = textarea.selectionStart;
const endPos = textarea.selectionEnd;
const currentValue = textarea.value;
const newValue = currentValue.substring(0, startPos) + symbol + currentValue.substring(endPos);
textarea.value = newValue;
textarea.setSelectionRange(startPos + n, startPos + n);
}

function deleteFunc(){
  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;
  const currentValue = textarea.value;
  const newValue = currentValue.substring(0, startPos) + currentValue.substring(endPos+1);
  textarea.value = newValue;
  textarea.setSelectionRange(startPos, startPos);
  }

  function backspaceFunc(){
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const currentValue = textarea.value;
    const newValue = currentValue.substring(0, startPos-1) + currentValue.substring(endPos);
    textarea.value = newValue;
    textarea.setSelectionRange(startPos-1, startPos-1);
    }


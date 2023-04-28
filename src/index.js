const header = document.createElement("div");
header.classList = "header";
header.innerHTML = "Virtual Keyboard";
document.body.append(header);

const textarea = document.createElement("textarea");
textarea.classList = "textarea";
textarea.cols = 88;
textarea.rows = 10;
textarea.placeholder = "The virtual keyboard was created in Windows";
document.body.append(textarea);

setInterval(() => {
  textarea.focus();
}, 0);

const keyboard = document.createElement("div");
keyboard.className = "keyboard";
document.body.append(keyboard);

const description = document.createElement("p");
description.className = "description";
description.innerHTML = "To switch the language combination: left ctrl + alt";
document.body.append(description);

let keyboardLayout;
let keyboardButtons = [];
let keyboardLang = localStorage.getItem("keyboardLanguage")
  ? localStorage.getItem("keyboardLanguage")
  : "ru";
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
      if (this.eventCode === "ShiftLeft" || this.eventCode === "ShiftRight") {
        let eventCode = this.eventCode;
        pressShift(true, eventCode);
      }
    });

    button.addEventListener("mouseup", () => {
      button.classList.remove("pressed");
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
      textarea.value += `${"\n"}`;
    } else if (this.type !== "functional") {
      textarea.value += text;
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
    }, 200);
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

  if (event.key.length == 1) {
    event.preventDefault();
    for (let i = 0; i < keyboardButtons.length; i++) {
      if (
        keyboardButtons[i].eventCode === event.code &&
        keyboard.children[i] !== undefined
      ) {
        textarea.value += keyboard.children[i].textContent;
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
    isLeftAltPressed = true;
  }

  if (event.code === "ControlLeft") {
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

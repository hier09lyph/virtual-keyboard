const header = document.createElement("div");
header.classList = "header";
header.innerHTML = "Virtual Keyboard";
document.body.append(header);

const textarea = document.createElement("textarea");
textarea.classList = "textarea"
textarea.cols = 90;
textarea.rows = 10;
textarea.placeholder = "The virtual keyboard was created in Windows";
document.body.append(textarea);

const keyboard = document.createElement("div");
keyboard.className = "keyboard";
document.body.append(keyboard);

const description = document.createElement("p");
description.className = "description";
description.innerHTML = "To switch the language combination: left ctrl + alt";
document.body.append(description);
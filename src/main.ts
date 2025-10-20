//import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import "./style.css";

document.body.innerHTML = `
  <h1>[App Title]</h1>
`;

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
document.body.append(canvas);

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("ctx is null");
}

document.body.append(document.createElement("br"));
//buttons go better below canvas

function createButton(label: string, clickHandler: () => void) {
  const button = document.createElement("button");
  button.innerText = label;
  button.addEventListener("click", clickHandler);
  document.body.appendChild(button);
  return button;
}

createButton("clear", () => {
  drawnLines = [];
  undoneLines = [];
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

createButton("undo", () => {
  if (drawnLines.length > 0) {
    const last = drawnLines.pop();
    if (last) undoneLines.push(last);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

createButton("redo", () => {
  if (undoneLines.length > 0) {
    const line = undoneLines.pop();
    if (line) drawnLines.push(line);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

document.body.append(document.createElement("br"));
//brushes go below buttons
/*
createButton("thin", () => {
  ctx.lineWidth = 1;
});

createButton("thick", () => {
  ctx.lineWidth = 5;
});
document.body.append(document.createElement("br"));
//stamps go below brushes
createButton("🦇", () => {
  //stamp functionality to be added
});
*/

const cursor = { active: false, x: 0, y: 0 };

interface Point {
  x: number;
  y: number;
}

let drawnLines: Point[][] = [];
let currentLine: Point[] | null = null;
let undoneLines: Point[][] = [];

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;

  //add points to array
  currentLine = [{ x: e.offsetX, y: e.offsetY }];
  undoneLines = [];
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active && currentLine) {
    //add points to array
    currentLine.push({ x: e.offsetX, y: e.offsetY });
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

canvas.addEventListener("mouseup", () => {
  if (currentLine && currentLine.length > 0) {
    drawnLines.push(currentLine);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
  currentLine = null;
  cursor.active = false;
});

canvas.addEventListener("drawing-changed", redraw);
function redraw() {
  if (!ctx) {
    throw new Error("ctx is null");
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw all completed lines
  drawnLines.forEach((line) => {
    if (line.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(line[0]!.x, line[0]!.y);
    for (let i = 1; i < line.length; i++) {
      ctx.lineTo(line[i]!.x, line[i]!.y);
    }
    ctx.stroke();
  });

  // Draw current (in-progress) line, if exists
  if (currentLine && currentLine.length >= 2) {
    ctx.beginPath();
    ctx.moveTo(currentLine[0]!.x, currentLine[0]!.y);
    for (let i = 1; i < currentLine.length; i++) {
      ctx.lineTo(currentLine[i]!.x, currentLine[i]!.y);
    }
    ctx.stroke();
  }
}

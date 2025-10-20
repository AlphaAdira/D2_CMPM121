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

const currentStyle = {
  width: 1,
  color: "#f00",
};

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
createButton("thin", () => {
  currentStyle.width = 1;
  currentStyle.color = "#f00";
});

createButton("thick", () => {
  currentStyle.width = 5;
  currentStyle.color = "#00f";
});
/*
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
interface Line {
  points: Point[];
  width: number;
  color: string;
}
let drawnLines: Line[] = [];
let currentLine: Point[] | null = null;
let undoneLines: Line[] = [];

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  ctx.lineWidth = currentStyle.width;
  ctx.strokeStyle = currentStyle.color;

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
    drawnLines.push({
      points: currentLine,
      width: currentStyle.width,
      color: currentStyle.color,
    });
  }
  currentLine = null;
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  cursor.active = false;
});

canvas.addEventListener("drawing-changed", redraw);
function redraw() {
  if (!ctx) {
    throw new Error("ctx is null");
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw all recorded lines with their original style
  drawnLines.forEach((line) => {
    if (line.points.length < 2) return;

    ctx.lineWidth = line.width;
    ctx.strokeStyle = line.color;
    ctx.beginPath();
    ctx.moveTo(line.points[0]!.x, line.points[0]!.y);
    for (let i = 1; i < line.points.length; i++) {
      ctx.lineTo(line.points[i]!.x, line.points[i]!.y);
    }
    ctx.stroke();
  });

  // Draw current preview line with current style
  if (currentLine && currentLine.length >= 2) {
    ctx.lineWidth = currentStyle.width;
    ctx.strokeStyle = currentStyle.color;
    ctx.beginPath();
    ctx.moveTo(currentLine[0]!.x, currentLine[0]!.y);
    for (let i = 1; i < currentLine.length; i++) {
      ctx.lineTo(currentLine[i]!.x, currentLine[i]!.y);
    }
    ctx.stroke();
  }
}

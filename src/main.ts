//import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
import "./style.css";

document.body.innerHTML = `
  <h1>[App Title]</h1>
`;

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
document.body.append(canvas);

document.body.append(document.createElement("br"));

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
document.body.append(undoButton);

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
document.body.append(redoButton);

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("commit plz");
}

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
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  //add points to array
  currentLine = [];
  undoneLines = [];
  currentLine.push({ x: cursor.x, y: cursor.y });
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

canvas.addEventListener("drawing-changed", () => {
  const ctx = canvas.getContext("2d")!;
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
});

clearButton?.addEventListener("click", () => {
  drawnLines = [];
  undoneLines = [];
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

undoButton?.addEventListener("click", () => {
  if (drawnLines.length > 0) {
    const lastLine = drawnLines.pop();
    if (lastLine) {
      undoneLines.push(lastLine);
    }
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

redoButton?.addEventListener("click", () => {
  if (undoneLines && undoneLines.length > 0) {
    const lineToRedo = undoneLines.pop();
    if (lineToRedo) {
      drawnLines.push(lineToRedo);
    }
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

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

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  //add points to array
  currentLine = [];
  drawnLines.push(currentLine);
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
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
  currentLine = null;
  cursor.active = false;
});

canvas.addEventListener("drawing-changed", () => {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawnLines.forEach(line => {
    if (line.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(line[0]!.x, line[0]!.y);
    for (let i = 1; i < line.length; i++) {
      ctx.lineTo(line[i]!.x, line[i]!.y);
    }
    ctx.stroke();
  });
});

clearButton?.addEventListener("click", () => {
  drawnLines = [];
  canvas.dispatchEvent(new Event("drawing-changed"));
});

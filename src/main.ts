import batImage from "./bat.png";
import bloodImage from "./blood.webp";
import "./style.css";

document.body.innerHTML = `
  <h1>[App Title]</h1>
`;

const canvasSize = 256;

const canvas = document.createElement("canvas");
canvas.width = canvasSize;
canvas.height = canvasSize;
document.body.append(canvas);

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("ctx is null");
}

const currentStyle = {
  width: 3,
  color: "#fff",
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
  stickers = [];
  undoStack = [];
  redoStack = [];
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

createButton("undo", () => {
  if (undoStack.length > 0) {
    const lastAction = undoStack.pop()!;
    redoStack.push(lastAction);

    // Remove from the appropriate list
    if (lastAction.type === "line") {
      drawnLines.pop();
    } else if (lastAction.type === "sticker") {
      stickers.pop();
    }
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

createButton("redo", () => {
  if (redoStack.length === 0) return;

  const action = redoStack.pop()!;
  undoStack.push(action);

  if (action.type === "line") {
    drawnLines.push(action.line);
  } else if (action.type === "sticker") {
    stickers.push(action.sticker);
  }

  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

document.body.append(document.createElement("br"));
//brushes go below buttons
type ToolMode = "draw" | "sticker";
let toolMode: ToolMode = "draw"; // default tool

const thinBtn = createButton("thin + red", () => {
  toolMode = "draw";
  console.log(toolMode);
  currentStyle.width = 1;
  currentStyle.color = "#f00";
  removeSelections();
  thinBtn.classList.add("selected");
});

const thickBtn = createButton("thick + blue", () => {
  toolMode = "draw";
  console.log(toolMode);
  currentStyle.width = 3;
  currentStyle.color = "#00f";
  removeSelections();
  thickBtn.classList.add("selected");
});

const eraserBtn = createButton("eraser", () => {
  toolMode = "draw";
  console.log(toolMode);
  currentStyle.width = 5;
  currentStyle.color = "#fff";
  removeSelections();
  eraserBtn.classList.add("selected");
});

document.body.append(document.createElement("br"));
//stamps go below brushes
interface Sticker {
  x: number;
  y: number;
  url: string; // path to the image
}
const bat_url = batImage;
const blood_url = bloodImage;
let currentSticker = bat_url;

const batSticker = createButton("🦇", () => {
  toolMode = "sticker";
  currentSticker = bat_url;
  console.log(toolMode);
  removeSelections();
  batSticker.classList.add("selected");
});

const bloodSticker = createButton("🩸", () => {
  toolMode = "sticker";
  currentSticker = blood_url;
  console.log(toolMode);
  removeSelections();
  bloodSticker.classList.add("selected");
});

function removeSelections() {
  batSticker.classList.remove("selected");
  bloodSticker.classList.remove("selected");
  thinBtn.classList.remove("selected");
  thickBtn.classList.remove("selected");
  eraserBtn.classList.remove("selected");
}

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
type Action =
  | { type: "line"; line: Line }
  | { type: "sticker"; sticker: Sticker };

let undoStack: Action[] = [];
let redoStack: Action[] = [];
let drawnLines: Line[] = [];
let currentLine: Point[] | null = null;
let stickers: Sticker[] = [];

canvas.addEventListener("click", (e) => {
  if (toolMode === "sticker") {
    // Create the sticker first
    const newSticker: Sticker = {
      x: e.offsetX,
      y: e.offsetY,
      url: currentSticker,
    };

    // Add to drawing
    stickers.push(newSticker);

    // Add to undo stack — now TS knows newSticker is valid ✅
    undoStack.push({
      type: "sticker",
      sticker: newSticker,
    });

    redoStack = []; // Clear redo stack on new action
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

canvas.addEventListener("mousedown", (e) => {
  if (toolMode == "draw") {
    cursor.active = true;
  }
  ctx.lineWidth = currentStyle.width;
  ctx.strokeStyle = currentStyle.color;

  //add points to array
  currentLine = [{ x: e.offsetX, y: e.offsetY }];
  redoStack = [];
});

let currentPreview: ToolPreview | null = null;
canvas.addEventListener("mousemove", (e) => {
  if (cursor.active && currentLine) {
    // Drawing mode: add to line
    currentLine.push({ x: e.offsetX, y: e.offsetY });
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  } else {
    // Hover mode: update preview
    currentPreview = makeCirclePreview(
      e.offsetX,
      e.offsetY,
      currentStyle.width,
      currentStyle.color,
    );
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

canvas.addEventListener("mouseup", () => {
  endOfLine();
});

canvas.addEventListener("mouseleave", () => {
  currentPreview = null;
  endOfLine();
});

function endOfLine() {
  if (currentLine && currentLine.length > 0) {
    const newLine = {
      points: currentLine,
      width: currentStyle.width,
      color: currentStyle.color,
    };
    drawnLines.push(newLine);
    undoStack.push({ type: "line", line: newLine });
    redoStack = [];
  }
  currentLine = null;
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  cursor.active = false;
}

canvas.addEventListener("drawing-changed", redraw);
function redraw() {
  if (!ctx) {
    throw new Error("ctx is null");
  }
  // Draw all lines (existing code)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawnLines.forEach((line) => {
    ctx.lineWidth = line.width;
    ctx.strokeStyle = line.color;
    if (line.points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(line.points[0]!.x, line.points[0]!.y);
    for (let i = 1; i < line.points.length; i++) {
      ctx.lineTo(line.points[i]!.x, line.points[i]!.y);
    }
    ctx.stroke();
  });

  // Draw current line (if in progress)
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

  // Draw all stickers
  stickers.forEach((sticker) => {
    const img = new Image();
    img.src = sticker.url;
    // Optional: set size
    const size = 32;
    ctx.drawImage(
      img,
      sticker.x - size / 2,
      sticker.y - size / 2,
      size,
      size,
    );
  });

  // Draw tool preview (only if not drawing)
  if (!cursor.active && currentPreview) {
    currentPreview.draw(ctx);
  }
}

interface ToolPreview {
  draw(ctx: CanvasRenderingContext2D): void;
}
function makeCirclePreview(
  x: number,
  y: number,
  radius: number,
  color: string,
): ToolPreview {
  return {
    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      if (color != "#fff") {
        ctx.fillStyle = color;
      } else {
        ctx.fillStyle = "#ccc"; // make eraser visible on white bg
      }
      ctx.fill();
    },
  };
}

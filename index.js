let paperplanes = [];
window.planes = paperplanes;

let isPressed = false;
let allowDrawing = true;
let arrangeWayout = false;
let animatePlanes = false;

let isMobileDevice;

window.preventDraw = true;

function setup() {
  isMobileDevice = isMobile();

  if (!isMobileDevice) {
    document.querySelector(
      "#background"
    ).style.backgroundImage = "none";

    return;
  }

  // Set canvas size
  const canvas = createCanvas(
    innerWidth,
    innerHeight,
    WEBGL
  );

  window.NUMBER_OF_COLUMNS = 15;

  window.addEventListener("resize", () => {
    resizeCanvas(innerWidth, innerHeight);
    isMobileDevice = isMobile();

    setPaperplanes(
      canvas.width / (NUMBER_OF_COLUMNS - 1),
      NUMBER_OF_COLUMNS
    );
  });

  setPaperplanes(
    canvas.width / (NUMBER_OF_COLUMNS - 1),
    NUMBER_OF_COLUMNS
  );

  function setPaperplanes(
    spacing,
    numberOfColumns
  ) {
    const numberOfRows = Math.ceil(
      canvas.height / spacing
    );

    const numberOfPlanes =
      numberOfColumns * numberOfRows;

    for (let i = 0; i < numberOfPlanes; i++) {
      const columnIndex = i % numberOfColumns;
      const rowIndex = Math.floor(
        i / numberOfColumns
      );

      const START_X = -width / 2;
      const START_Y = -height / 2;

      const x = START_X + spacing * columnIndex;
      const y = START_Y + spacing * rowIndex;

      const paperplane = new Paperplane(
        x,
        y,
        columnIndex,
        rowIndex
      );

      if (!paperplanes[rowIndex]) {
        paperplanes[rowIndex] = [];
      }

      paperplanes[rowIndex][columnIndex] =
        paperplane;
    }
  }

  // 마우스 프레스 되면 값을 추가한다
  canvas.touchStarted((e) => {
    if (!allowDrawing) {
      e.preventDefault();
      return;
    }

    isPressed = true;
  });

  canvas.touchEnded(() => {
    const result = evaluateDrawing();

    if (!result.isValid) {
      resetPaperplanes();
    } else {
      // 1. prevent more drawing
      allowDrawing = false;

      // 2. arrange the way out of planes
      arrangeWayout = true;

      // 3. animate the planes
      _.flatten(paperplanes).forEach(
        (paperplane) => {
          // paperplane.animate();
        }
      );
    }

    isPressed = false;

    mouseX = 0;
    mouseY = 0;
  });

  canvas.mouseReleased((e) => {
    if (!allowDrawing) {
      e.preventDefault();
      return;
    }

    isPressed = false;

    mouseX = 0;
    mouseY = 0;
  });
}

function draw() {
  if (!isMobileDevice) {
    clear();

    return;
  }

  if (window.preventDraw) {
    return;
  }

  const backgroundElement =
    document.querySelector("#background");

  if (
    getComputedStyle(backgroundElement)
      .backgroundImage === "none"
  ) {
    backgroundElement.style.backgroundImage = `url("/images/through-love.webp")`;
  }

  background(255);

  perspective();

  _.flatten(paperplanes).forEach((paperplane) => {
    if (allowDrawing) {
      paperplane.update();
    }

    paperplane.show();
  });

  if (isPressed) {
    window.mouseHoveredDuration += 1;
  }

  if (arrangeWayout) {
    const toppestPlane = _.flatten(
      paperplanes
    ).find((el) => el.type === "paperplane");

    if (!toppestPlane) return;

    toppestPlane.arrangeWayOut();

    arrangeWayout = false;
  }
}

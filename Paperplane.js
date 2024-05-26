class Paperplane {
  static width = 4;
  static height = 10;
  static tailHeight = 3;
  static numberOfVertices = 10;

  constructor(x = 0, y = 0, columnIndex, rowIndex) {
    this.position = createVector(x, y, 0);

    this.angle = -90;
    this.opacity = 1;
    this.mouseInPosition = createVector(0, 0);
    this.mouseOutPosition = createVector(0, 0);

    this.type = "point";

    this.setVertices();
    this.targetVertices = [];

    this.columnIndex = columnIndex;
    this.rowIndex = rowIndex;
    this.isGoingDown = false;
    this.angleConfirmed = false;
  }

  reset() {
    this.setType("point");
    this.isGoingDown = false;
    this.resetAngleConfirmed();
  }

  setType(type) {
    this.type = type;
  }

  createCircleVertices() {
    const vertices = [];

    const CIRCLE_RADIUS = Paperplane.width * 0.15;

    for (let i = 0; i < Paperplane.numberOfVertices; i++) {
      const angle = (TWO_PI / Paperplane.numberOfVertices) * i;
      const x = cos(angle) * CIRCLE_RADIUS;
      const y = sin(angle) * CIRCLE_RADIUS;

      const vector = createVector(x, y, 0);

      vertices.push(vector);
    }

    return vertices;
  }

  createPaperplaneVertices() {
    const topPoint = createVector(0, -Paperplane.height / 2, 0);
    const leftPoint = createVector(-Paperplane.width, Paperplane.height / 2, 0);
    const rightPoint = createVector(Paperplane.width, Paperplane.height / 2, 0);

    const innerTailPoint = createVector(
      lerp(leftPoint.x, rightPoint.x, 0.5),
      topPoint.y + Paperplane.height - Paperplane.tailHeight
    );

    const vertices = [];

    vertices.push(
      topPoint,
      rightPoint,
      innerTailPoint,
      p5.Vector.lerp(innerTailPoint, leftPoint, 0.1),
      p5.Vector.lerp(innerTailPoint, leftPoint, 0.2),
      p5.Vector.lerp(innerTailPoint, leftPoint, 0.3),
      p5.Vector.lerp(innerTailPoint, leftPoint, 0.5),
      p5.Vector.lerp(innerTailPoint, leftPoint, 0.6),
      p5.Vector.lerp(innerTailPoint, leftPoint, 0.7),
      leftPoint
    );

    return vertices;
  }

  setVertices() {
    const vertices = this.createCircleVertices();

    this.vertices = vertices;

    this.circleVertices = this.createCircleVertices();
    this.paperplaneVertices = this.createPaperplaneVertices();
  }

  mutateVertices() {
    if (this.type === "point") {
      this.targetVertices = this.circleVertices;
    } else if (this.type === "paperplane") {
      this.targetVertices = this.paperplaneVertices;
    }

    this.vertices = this.targetVertices;

    // for (let i = 0; i < Paperplane.numberOfVertices; i++) {
    //   this.vertices[i].x = lerp(
    //     this.vertices[i].x,
    //     this.targetVertices[i].x,
    //     0.1
    //   );

    //   this.vertices[i].y = lerp(
    //     this.vertices[i].y,
    //     this.targetVertices[i].y,
    //     0.1
    //   );
    // }
  }

  drawVertices() {
    blendMode(REMOVE);

    beginShape();

    for (let i = 0; i < Paperplane.numberOfVertices; i++) {
      const { x, y } = this.vertices[i];

      vertex(x, y);
    }

    endShape(CLOSE);

    blendMode(BLEND);
  }

  checkToMouseIn() {
    const { x, y } = this.position;

    const webGLMouseX = mouseX - width / 2;
    const webGLMouseY = mouseY - height / 2;

    push();
    strokeWeight(10);
    // set pointColor
    stroke(255, 0, 0);
    point(webGLMouseX, webGLMouseY);
    pop();

    const distance = dist(x, y, webGLMouseX, webGLMouseY);

    const isMouseInCanvas = mouseX > 0 && mouseY > 0;

    if (!isMouseInCanvas) {
      return false;
    }

    if (!window.mouseHoveredDuration) {
      window.mouseHoveredDuration = 0;
    }

    const effectArea = Math.floor(canvas.width / devicePixelRatio / 20);
    const isMouseIn = distance < effectArea;

    if (isMouseIn) {
      this.mouseInPosition = createVector(webGLMouseX, webGLMouseY);
      this.setType("progress");
    } else if (this.type === "progress" && !this.angleConfirmed) {
      this.mouseOutPosition = createVector(webGLMouseX, webGLMouseY);

      const dx = this.mouseOutPosition.x - this.mouseInPosition.x;
      const dy = this.mouseOutPosition.y - this.mouseInPosition.y;

      this.angle = atan2(dy, dx) + 90;

      this.setType("paperplane");
      this.setAngleConfirmed();
    }

    return isMouseIn;
  }

  setAngleConfirmed() {
    const isGoingDown = this.angle < 270 && this.angle > 90;

    if (isGoingDown) {
      this.isGoingDown = true;
    }

    this.angleConfirmed = true;

    this.setUpperNeigborPlane();
    this.setBottomNeighborPlanes();
  }

  resetAngleConfirmed() {
    this.angleConfirmed = false;
  }

  setUpperNeigborPlane() {
    const { columnIndex, rowIndex } = this;
    const planes = window.planes;

    const upperRow = planes[rowIndex - 1];

    if (!upperRow) return;

    const hasAlreadyConfirmedUpperNode = upperRow.some(
      (node) => node.angleConfirmed
    );

    if (hasAlreadyConfirmedUpperNode) return;

    const hasUpperLimit = planes
      .slice(0, rowIndex)
      .some((row) => row.some((node) => node.angleConfirmed));

    if (!hasUpperLimit) return;

    // lerp the columnIndex between the closest confirmed and the current node
    let closestConfirmedTopNode;

    planes
      .slice(0, rowIndex)
      .reverse()
      .find((row) =>
        row.find((node) => {
          if (node.angleConfirmed) {
            closestConfirmedTopNode = node;
            return true;
          }
        })
      );

    const lerpedColumnIndex = Math.floor(
      lerp(closestConfirmedTopNode.columnIndex, columnIndex, 0.5)
    );

    const topNode = planes[rowIndex - 1][lerpedColumnIndex];

    if (topNode && !topNode.angleConfirmed) {
      topNode.angle = this.angle;
      topNode.setType("paperplane");
      topNode.setAngleConfirmed();
    }
  }

  setBottomNeighborPlanes() {
    const { columnIndex, rowIndex } = this;
    const planes = window.planes;

    const bottomRow = planes[rowIndex + 1];

    if (!bottomRow) return;

    const hasAlreadyConfirmedBottomNode = bottomRow.some(
      (node) => node.angleConfirmed
    );

    if (hasAlreadyConfirmedBottomNode) return;

    const hasBottomLimit = planes
      .slice(rowIndex + 1)
      .some((row) => row.some((node) => node.angleConfirmed));

    if (!hasBottomLimit) return;

    // lerp the columnIndex between the closest confirmed and the current node
    let closestConfirmedBottomNode;

    planes.slice(rowIndex + 1).find((row) =>
      row.find((node) => {
        if (node.angleConfirmed) {
          closestConfirmedBottomNode = node;
          return true;
        }
      })
    );

    const lerpedColumnIndex = Math.floor(
      lerp(closestConfirmedBottomNode.columnIndex, columnIndex, 0.5)
    );

    const bottomNode = planes[rowIndex + 1][lerpedColumnIndex];

    if (bottomNode && !bottomNode.angleConfirmed) {
      bottomNode.angle = this.angle;
      bottomNode.setType("paperplane");
      bottomNode.setAngleConfirmed();
    }
  }

  show() {
    fill(0);
    stroke(0);

    push();

    translate(this.position.x, this.position.y);
    this.rotate();
    this.mutateVertices();
    this.drawVertices();
    pop();
  }

  update() {
    this.checkToMouseIn();
  }

  rotate() {
    angleMode(DEGREES);

    // const mappedAngle = map(this.angle, -PI, PI, -PI * 0.5, PI * 0.5);

    rotate(this.angle);
  }

  animate() {}
}

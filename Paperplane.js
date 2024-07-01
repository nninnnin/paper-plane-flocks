class Paperplane {
  static width = 4;
  static height = 10;
  static tailHeight = 3;
  static numberOfVertices = 10;
  static directionGuideAngle = 10;

  constructor(
    x = 0,
    y = 0,
    columnIndex,
    rowIndex
  ) {
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

    this.targetAngle = 0;
    this.angleLerpRatio = 0.2;
  }

  reset() {
    this.setType("point");
    this.isGoingDown = false;
    this.angleConfirmed = false;
    this.angle = -90;
    this.targetAngle = 0;
  }

  setType(type) {
    this.type = type;
  }

  createCircleVertices() {
    const vertices = [];

    const CIRCLE_RADIUS = Paperplane.width * 0.15;

    for (
      let i = 0;
      i < Paperplane.numberOfVertices;
      i++
    ) {
      const angle =
        (TWO_PI / Paperplane.numberOfVertices) *
        i;

      const x = cos(angle) * CIRCLE_RADIUS;
      const y = sin(angle) * CIRCLE_RADIUS;

      const vector = createVector(x, y, 0);

      vertices.push(vector);
    }

    return vertices;
  }

  createPaperplaneVertices() {
    const topPoint = createVector(
      0,
      -Paperplane.height / 2,
      0
    );
    const leftPoint = createVector(
      -Paperplane.width,
      Paperplane.height / 2,
      0
    );
    const rightPoint = createVector(
      Paperplane.width,
      Paperplane.height / 2,
      0
    );

    const innerTailPoint = createVector(
      lerp(leftPoint.x, rightPoint.x, 0.5),
      topPoint.y +
        Paperplane.height -
        Paperplane.tailHeight
    );

    const vertices = [];

    vertices.push(
      topPoint,
      rightPoint,
      innerTailPoint,
      p5.Vector.lerp(
        innerTailPoint,
        leftPoint,
        0.1
      ),
      p5.Vector.lerp(
        innerTailPoint,
        leftPoint,
        0.2
      ),
      p5.Vector.lerp(
        innerTailPoint,
        leftPoint,
        0.3
      ),
      p5.Vector.lerp(
        innerTailPoint,
        leftPoint,
        0.5
      ),
      p5.Vector.lerp(
        innerTailPoint,
        leftPoint,
        0.6
      ),
      p5.Vector.lerp(
        innerTailPoint,
        leftPoint,
        0.7
      ),
      leftPoint
    );

    return vertices;
  }

  setVertices() {
    const vertices = this.createCircleVertices();

    this.vertices = vertices;

    this.circleVertices =
      this.createCircleVertices();
    this.paperplaneVertices =
      this.createPaperplaneVertices();
  }

  mutateVertices() {
    if (this.type === "point") {
      this.targetVertices = this.circleVertices;
    } else if (this.type === "paperplane") {
      this.targetVertices =
        this.paperplaneVertices;
    }

    if (window.animateMutation) {
      for (
        let i = 0;
        i < Paperplane.numberOfVertices;
        i++
      ) {
        this.vertices[i].x = lerp(
          this.vertices[i].x,
          this.targetVertices[i].x,
          0.1
        );

        this.vertices[i].y = lerp(
          this.vertices[i].y,
          this.targetVertices[i].y,
          0.1
        );
      }
    } else {
      this.vertices = this.targetVertices;
    }
  }

  drawVertices() {
    blendMode(REMOVE);

    beginShape();

    for (
      let i = 0;
      i < Paperplane.numberOfVertices;
      i++
    ) {
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

    const distance = dist(
      x,
      y,
      webGLMouseX,
      webGLMouseY
    );

    const isMouseInCanvas =
      mouseX > 0 && mouseY > 0;

    if (!isMouseInCanvas) {
      return false;
    }

    if (!window.mouseHoveredDuration) {
      window.mouseHoveredDuration = 0;
    }

    const effectArea = Math.floor(
      canvas.width / devicePixelRatio / 20
    );
    const isMouseIn = distance < effectArea;

    if (isMouseIn) {
      this.mouseInPosition = createVector(
        webGLMouseX,
        webGLMouseY
      );
      this.setType("progress");
    } else if (
      this.type === "progress" &&
      !this.angleConfirmed
    ) {
      this.mouseOutPosition = createVector(
        webGLMouseX,
        webGLMouseY
      );

      const dx =
        this.mouseOutPosition.x -
        this.mouseInPosition.x;
      const dy =
        this.mouseOutPosition.y -
        this.mouseInPosition.y;

      this.angle = atan2(dy, dx) + 90;

      this.setType("paperplane");
      this.setAngleConfirmed();
    }

    return isMouseIn;
  }

  setAngle(angle) {
    this.angle = angle;
  }

  setTargetAngle(angle) {
    this.targetAngle = angle;
  }

  setAngleConfirmed() {
    const isGoingDown =
      this.angle < 270 && this.angle > 90;

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

    const hasAlreadyConfirmedUpperNode =
      upperRow.some(
        (node) => node.angleConfirmed
      );

    if (hasAlreadyConfirmedUpperNode) return;

    const hasUpperLimit = planes
      .slice(0, rowIndex)
      .some((row) =>
        row.some((node) => node.angleConfirmed)
      );

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
      lerp(
        closestConfirmedTopNode.columnIndex,
        columnIndex,
        0.5
      )
    );

    const topNode =
      planes[rowIndex - 1][lerpedColumnIndex];

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

    const hasAlreadyConfirmedBottomNode =
      bottomRow.some(
        (node) => node.angleConfirmed
      );

    if (hasAlreadyConfirmedBottomNode) return;

    const hasBottomLimit = planes
      .slice(rowIndex + 1)
      .some((row) =>
        row.some((node) => node.angleConfirmed)
      );

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
      lerp(
        closestConfirmedBottomNode.columnIndex,
        columnIndex,
        0.5
      )
    );

    const bottomNode =
      planes[rowIndex + 1][lerpedColumnIndex];

    if (
      bottomNode &&
      !bottomNode.angleConfirmed
    ) {
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

  isToppestPlane() {
    const isPlane = this.type === "paperplane";

    if (!isPlane) return;

    const topperRows = window.planes.slice(
      0,
      this.rowIndex
    );

    function checkRowHasPlane(row) {
      return row.some(
        (el) => el.type === "paperplane"
      );
    }

    function hasTopperRowsHasPlane(rows) {
      for (let i = 0; i < rows.length; i++) {
        const hasRowContainsPlane =
          checkRowHasPlane(rows[i]);

        if (hasRowContainsPlane) return true;
      }

      return false;
    }

    return !hasTopperRowsHasPlane(topperRows);
  }

  static adjustColIndex(colIndex) {
    let adjustedIndex = colIndex;

    if (colIndex < 0) {
      adjustedIndex = 0;
    }

    if (colIndex >= window.NUMBER_OF_COLUMNS) {
      adjustedIndex =
        window.NUMBER_OF_COLUMNS - 1;
    }

    return adjustedIndex;
  }

  changeTopperNodeToPlane(colIndex, angle) {
    const topperRowIndex = this.rowIndex - 1;
    const hasTopperRow =
      window.planes[topperRowIndex]?.length > 0;
    if (!hasTopperRow) return;

    let adjustedColIndex =
      Paperplane.adjustColIndex(colIndex);

    window.planes[topperRowIndex][
      adjustedColIndex
    ].setType("paperplane");
    window.planes[topperRowIndex][
      adjustedColIndex
    ].setAngle(angle);
  }

  getNextAngle() {
    return lerp(
      this.angle,
      this.targetAngle,
      this.angleLerpRatio
    );
  }

  arrangeTargetAngle() {
    console.log(
      `현재 row index: ${this.rowIndex} / col index: ${this.columnIndex}`
    );

    console.log("현재 angle", this.angle);

    console.log(
      "다음 angle",
      this.getNextAngle()
    );

    console.log("다음 col index");

    // 이 상태로 간다면~

    const 왼쪽코너에치우친경우 =
      this.columnIndex < 4;

    const 오른쪽코너에치우친경우 =
      window.NUMBER_OF_COLUMNS -
        this.columnIndex <
      3;

    const restWayoutRows = window.planes.slice(
      0,
      this.rowIndex
    );

    if (왼쪽코너에치우친경우) {
      restWayoutRows.forEach((row) => {
        row.forEach((node) =>
          node.setTargetAngle(40)
        );
      });

      return;
    }

    if (오른쪽코너에치우친경우) {
      restWayoutRows.forEach((row) => {
        row.forEach((node) =>
          node.setTargetAngle(-40)
        );
      });

      return;
    }

    const 너무변화가없는경우 =
      this.angle <= 10 && this.targetAngle === 0;

    if (너무변화가없는경우) {
      if (this.angle > 0) {
        restWayoutRows.forEach((row) => {
          row.forEach((node) =>
            node.setTargetAngle(-40)
          );
        });
      } else {
        restWayoutRows.forEach((row) => {
          row.forEach((node) =>
            node.setTargetAngle(40)
          );
        });
      }

      return;
    }
  }

  arrangeWayOut(endCallback) {
    const hasTopperRow =
      window.planes[this.rowIndex - 1]?.length >
      0;

    if (!hasTopperRow) {
      window.animateMutation = false;

      return;
    } else {
      window.animateMutation = true;
    }

    const topperRowIndex = this.rowIndex - 1;
    let topperPlaneColIndex;

    // 왼쪽으로
    if (
      this.angle <=
      -Paperplane.directionGuideAngle
    ) {
      const leftColIndex = this.columnIndex - 1;
      topperPlaneColIndex = leftColIndex;

      console.log(this.targetAngle);

      this.arrangeTargetAngle();
      const lerpedAngle = lerp(
        this.angle,
        this.targetAngle,
        this.angleLerpRatio
      );

      this.changeTopperNodeToPlane(
        leftColIndex,
        lerpedAngle
      );
    }

    // 가운데로
    if (
      this.angle >
        -Paperplane.directionGuideAngle &&
      this.angle < Paperplane.directionGuideAngle
    ) {
      const colIndex = this.columnIndex;
      topperPlaneColIndex = colIndex;

      this.arrangeTargetAngle();
      const lerpedAngle = lerp(
        this.angle,
        this.targetAngle,
        this.angleLerpRatio
      );

      this.changeTopperNodeToPlane(
        colIndex,
        lerpedAngle
      );
    }

    // 오른쪽으로
    if (
      this.angle >= Paperplane.directionGuideAngle
    ) {
      const rightColIndex = this.columnIndex + 1;
      topperPlaneColIndex = rightColIndex;

      this.arrangeTargetAngle();
      const lerpedAngle = lerp(
        this.angle,
        this.targetAngle,
        this.angleLerpRatio
      );

      this.changeTopperNodeToPlane(
        rightColIndex,
        lerpedAngle
      );
    }

    const adjustedColIndex =
      Paperplane.adjustColIndex(
        topperPlaneColIndex
      );
    const topperPlane =
      window.planes[topperRowIndex][
        adjustedColIndex
      ];

    setTimeout(() => {
      topperPlane.arrangeWayOut(endCallback);
    }, 300);
  }

  animate() {}
}

class Paperplane {
  static width = 10;
  static height = 20;
  static numberOfVertices = 10;

  constructor(x = 0, y = 0, index = null) {
    this.position = createVector(x, y, 0);

    this.angle = 0;
    this.type = "point";

    this.setVertices();
    this.targetVertices = [];

    this.index = index;
  }

  setType(type) {
    this.type = type;
  }

  createCircleVertices() {
    const vertices = [];

    const CIRCLE_RADIUS = Paperplane.width * 0.3;

    for (let i = 0; i < Paperplane.numberOfVertices; i++) {
      const angle = (TWO_PI / Paperplane.numberOfVertices) * i;
      const x = cos(angle) * CIRCLE_RADIUS + this.position.x;
      const y = sin(angle) * CIRCLE_RADIUS + this.position.y;

      const vector = createVector(x, y, 0);

      vertices.push(vector);
    }

    return vertices;
  }

  createPaperplaneVertices() {
    const topPoint = createVector(
      0 + this.position.x,
      -Paperplane.height / 2 + this.position.y,
      0
    );
    const leftPoint = createVector(
      -Paperplane.width + this.position.x,
      Paperplane.height / 2 + this.position.y,
      0
    );
    const rightPoint = createVector(
      Paperplane.width + this.position.x,
      Paperplane.height / 2 + this.position.y,
      0
    );

    const INNER_TAIL_LENGTH = 10;

    const innerTailPoint = createVector(
      lerp(leftPoint.x, rightPoint.x, 0.5),
      topPoint.y + Paperplane.height - INNER_TAIL_LENGTH
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

    for (let i = 0; i < Paperplane.numberOfVertices; i++) {
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
  }

  drawVertices() {
    beginShape();

    for (let i = 0; i < Paperplane.numberOfVertices; i++) {
      const { x, y } = this.vertices[i];

      vertex(x, y);
    }

    endShape(CLOSE);
  }

  checkToMouseIn() {
    const { x, y } = this.position;

    const webGLMouseX = mouseX - width / 2;
    const webGLMouseY = mouseY - height / 2;

    // console.log(webGLMouseX, webGLMouseY);

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

    const isMouseIn = distance < 80;

    if (isMouseIn) {
      // mouse in 당시의 마우스 x 위치와 캔버스의 중심 x 위치를 비교하여 각도를 계산
      const angle = atan2(webGLMouseY - y, webGLMouseX - x);
      this.angle = angle;

      this.setType("paperplane");
    } else {
      // this.setType("point");
    }

    return isMouseIn;
  }

  show() {
    fill(255);
    stroke(255);

    this.mutateVertices();
    this.drawVertices();
  }

  update() {
    this.checkToMouseIn();
    this.rotate();
  }

  rotate() {
    rotateY(this.angle);
  }
}

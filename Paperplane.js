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

    const vertices = [];

    vertices.push(topPoint);
    vertices.push(leftPoint);
    vertices.push(rightPoint);

    // add vertices for the tail
    const tailPoint1 = createVector(
      -Paperplane.width + this.position.x,
      Paperplane.height / 2 + this.position.y,
      0
    );
    const tailPoint2 = createVector(
      -Paperplane.width + this.position.x,
      -Paperplane.height / 2 + this.position.y,
      0
    );
    const tailPoint3 = createVector(
      -Paperplane.width * 1.5 + this.position.x,
      0 + this.position.y,
      0
    );

    vertices.push(tailPoint1);
    vertices.push(tailPoint2);
    vertices.push(tailPoint3);

    // push other vertices to complete the paperplane same as the length of the number of vertices of circle
    for (let i = 0; i < Paperplane.numberOfVertices - 6; i++) {
      // x and y are on the line of the shape of the paperplane
      const x = lerp(
        leftPoint.x,
        rightPoint.x,
        (i + 1) / (Paperplane.numberOfVertices - 6)
      );
      const y = lerp(
        leftPoint.y,
        rightPoint.y,
        (i + 1) / (Paperplane.numberOfVertices - 6)
      );

      const vector = createVector(x, y, 0);

      vertices.push(vector);
    }

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

    const distance = dist(x, y, webGLMouseX, webGLMouseY);

    const isMouseIn = distance < 50;

    if (isMouseIn) {
      this.setType("paperplane");
    } else {
      this.setType("point");
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
  }
}

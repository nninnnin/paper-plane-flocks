class Paperplane {
  static width = 10;
  static height = 20;
  static circleVerticeNumbers = 20;

  constructor(x = 0, y = 0) {
    this.position = createVector(x, y, 0);

    this.angle = 0;
    this.type = "point";

    this.setVertices();
    this.targetVertices = [];
  }

  setType(type) {
    this.type = type;
  }

  createCircleVertices() {
    const vertices = [];

    for (let i = 0; i < Paperplane.circleVerticeNumbers; i++) {
      const angle = (TWO_PI / Paperplane.circleVerticeNumbers) * i;
      const x = Paperplane.width * cos(angle);
      const y = Paperplane.width * sin(angle);

      const vector = createVector(x, y, 0).mult(0.5);

      vertices.push(vector);
    }

    return vertices;
  }

  createPaperplaneVertices() {
    const vertices = [];

    const topPoint = createVector(0, -Paperplane.height / 2, 0);
    const leftPoint = createVector(-Paperplane.width, Paperplane.height / 2, 0);
    const rightPoint = createVector(Paperplane.width, Paperplane.height / 2, 0);

    for (let i = 0; i < Paperplane.circleVerticeNumbers; i++) {
      if (!vertices.includes(topPoint)) {
        vertices.push(topPoint);
        continue;
      }

      if (!vertices.includes(leftPoint)) {
        vertices.push(leftPoint);
        continue;
      }

      if (!vertices.includes(rightPoint)) {
        vertices.push(rightPoint);
        continue;
      }

      // randomly push top, left, right
      const randomIndex = Math.floor(random(0, 3));
      if (randomIndex === 0) {
        vertices.push(topPoint);
      } else if (randomIndex === 1) {
        vertices.push(leftPoint);
      } else {
        vertices.push(rightPoint);
      }
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

    // Lerp
    for (let i = 0; i < Paperplane.circleVerticeNumbers; i++) {
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
    for (let i = 0; i < Paperplane.circleVerticeNumbers; i++) {
      const { x, y } = this.vertices[i];
      vertex(x, y);
    }
    endShape(CLOSE);
  }

  show() {
    fill(255);
    stroke(255);

    this.mutateVertices();
    this.drawVertices();
  }
}

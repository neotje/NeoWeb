var cnv;

var flock;

function setup() {
  //createCanvas(
  //  document.getElementById("birds").clientHeight,
  //  document.getElementById("birds").clientWidth
  //);
  cnv = createCanvas(windowWidth, windowHeight);

  background(20);

  flock = new Flock(100);
}

function draw() {
  background(20)
  flock.update();
}

class Flock {
  constructor(amount) {
    this.boids = [];

    this.addBoids(amount);
  }

  addBoids(amount){
    for (var i = 0; i < amount; i++) {
      this.boids.push(new Boid());
    }
  }

  update() {
    for (let b of this.boids) {
      b.update(this.boids);
    }
  }
}

class Boid {
  constructor() {
    this.acc = createVector(0, 0)
    //this.p = createVector(random(0, windowWidth), random(0, windowHeight));
    this.p = createVector(windowWidth / 2, windowHeight / 2);
    this.v = createVector(random(-1, 1), random(-1, 1));
    this.r = 5.0;
    this.maxSpeed = 3;
    this.maxForce = 0.025;
  }

  update(boids) {
    let sep = this.sep(boids);   // Separation
    let ali = this.align(boids);  // alignment
    let cen = this.center(boids);

    sep.mult(1.5);
    ali.mult(1.0);
    cen.mult(1.0);

    // Add the force vectors to acceleration
    this.addForce(sep);
    this.addForce(ali);
    this.addForce(cen);

    this.v.add(this.acc);
    this.v.limit(this.maxSpeed)
    this.p.add(this.v);

    if (this.p.x < -this.r)  this.p.x = width + this.r;
    if (this.p.y < -this.r)  this.p.y = height + this.r;
    if (this.p.x > width + this.r) this.p.x = -this.r;
    if (this.p.y > height + this.r) this.p.y = -this.r;

    this.draw();
  }

  addForce(force) {
    this.acc.add(force);
  }

  sep(boids) {
    let minSep = 30;
    let steer = createVector(0, 0);
    let count = 0;

    for (let b of boids) {
      let d = p5.Vector.dist(this.p, b.p);

      if (d > 0 && d < minSep) {
        let delta = p5.Vector.sub(this.p, b.p);
        delta.normalize();
        delta.div(d);
        steer.add(delta);
        count++;
      }
    }

    if (count > 0) {
      steer.div(count)
    }

    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.v);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  align(boids) {
    let maxDist = 60;
    let sum = createVector(0,0);
    let count = 0;

    for (let b of boids) {
      let d = p5.Vector.dist(this.p, b.p);

      if (d > 0 && d < maxDist) {
        sum.add(b.v);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);

      let steer = p5.Vector.sub(sum, this.v);
      steer.limit(this.maxForce);

      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  center(boids) {
    let maxDist = 60;
    let sum = createVector(0, 0);
    let count = 0;

    for (let b of boids) {
      let d = p5.Vector.dist(this.p, b.p);

      if (d > 0 && d < maxDist) {
        sum.add(b.v);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);

      let target = p5.Vector.sub(sum, this.p);
      target.normalize();
      target.mult(this.maxSpeed);

      let steer = p5.Vector.sub(target, this.v);
      steer.limit(this.maxForce);

      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  draw() {
    // Draw a triangle rotated in the direction of velocity
    let theta = this.v.heading() + radians(90);
    fill(256);
    stroke(256);
    push();
    translate(this.p.x, this.p.y);
    rotate(theta);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    pop();
  }
}

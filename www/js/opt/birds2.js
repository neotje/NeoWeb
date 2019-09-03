var cnv;

var flock;

var play = true;

function setup() {
  //createCanvas(
  //  document.getElementById("birds").clientHeight,
  //  document.getElementById("birds").clientWidth
  //);
  cnv = createCanvas(windowWidth, windowHeight);

  background(20);

  flock = new Flock();
  flock.addBoids(100)
}

function draw() {
  if (play) {
    background(20)
    flock.update();
  }
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

class obj {
  constructor(){
    this.p = createVector(windowWidth/3, windowHeight/3);
    this.r = 100.0;
  }

  update(){
    circle(this.p.x, this.p.y, this.r);
  }
}

class Boid {
  constructor() {
    this.acc = createVector(0, 0)
    //this.p = createVector(random(0, windowWidth), random(0, windowHeight));
    this.p = createVector(random(windowWidth), random(windowHeight));
    this.v = createVector(random(0, 1), random(0, 1));
    this.r = 5.0;
    this.maxSpeed = 5;
    this.maxForce = 0.06;

    this.minSep = 35;
    this.maxAli = 80;
    this.maxCen = 80;

    this.color = random(100, 256)
  }

  update(boids) {
    let sep = this.sep(boids);   // Separation
    let ali = this.align(boids);  // alignment
    let cen = this.center(boids);

    sep.mult(1.6);
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
    let minSep = this.minSep;
    let steer = createVector(0, 0);
    let count = 0;

    for (let b of boids) {
      let d = p5.Vector.dist(this.p, b.p);

      if (d > 0 && d < b.r + minSep) {
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
    let maxDist = this.maxAli;
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
    let maxDist = this.maxCen;
    let sum = createVector(0, 0);
    let count = 0;

    for (let b of boids) {
      let d = p5.Vector.dist(this.p, b.p);

      if (d > 0 && d < maxDist) {
        sum.add(b.p);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);

      let target = p5.Vector.sub(this.p, sum);
      target.normalize();
      target.mult(this.maxSpeed);

      let steer = p5.Vector.sub(this.v, target);
      steer.limit(this.maxForce);

      stroke("red");
      //line(this.p.x, this.p.y, this.p.x + (sum.x * 100), this.p.y + (sum.y * 100));
      //console.log(sum.x, sum.y);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  draw() {
    // Draw a triangle rotated in the direction of velocity
    let theta = this.v.heading() + radians(90);
    fill(this.color);
    stroke(this.color);
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

var cnv;

var flock;
var light;

var boundries = [];

var play = true;

function setup() {
  //createCanvas(
  //  document.getElementById("birds").clientHeight,
  //  document.getElementById("birds").clientWidth
  //);
  cnv = createCanvas(windowWidth, windowHeight);

  background(20);

  collideDebug(true)

  flock = new Flock();
  flock.addBoids(100);

  light = new Light(width/2, 0, 30);
  light.add(2000);

  light2 = new Light(width/2 + 5, 0, 40);
  light2.add(2000);

  frameRate(60);

  setInterval(function(){
    if (frameRate() < 60) {
      //pixelDensity(frameRate()/60);
    }
  },10);
}

function draw() {
  var hit;
  if (play) {
    background(20)
    flock.update();
    light.update(flock.boids);
    //light2.update(flock.boids);
  }

  fill(255);
  textSize(32);
  //text(round(frameRate()), 10, 30);
}

function addRay(x1, y1, x2, y2) {
  rays.push(new Ray(x1, y1, x2, y2));
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

class Light {
  constructor(x, y, color){
    this.x = x;
    this.y = y;

    this.color = color

    this.rays = [];
  }

  add(amount) {
    for (var i = 0; i < amount; i++) {
      this.rays.push(new Ray(this.x, this.y, 0))
    }

    for (var i = 0; i < this.rays.length; i++) {
      this.rays[i].a = i * (TWO_PI/this.rays.length);
    }
  }

  update(boids) {
    for (let r of this.rays) {
      r.update();
    }

    for (let b of boids) {
      for (let r of this.rays) {
        var hit1 = collideLineLine(r.x, r.y, r.p.x, r.p.y, b.body.p1.x, b.body.p1.y, b.body.p2.x, b.body.p2.y, true);
        var hit2 = collideLineLine(r.x, r.y, r.p.x, r.p.y, b.body.p2.x, b.body.p2.y, b.body.p3.x, b.body.p3.y, true);
        var hit3 = collideLineLine(r.x, r.y, r.p.x, r.p.y, b.body.p3.x, b.body.p3.y, b.body.p1.x, b.body.p1.y, true);

        var d1 = 20000;
        if (hit1.x) {
          d1 = p5.Vector.dist(createVector(r.x, r.y), createVector(hit1.x, hit1.y));
        }
        var d2 = 20000;
        if (hit2.x) {
          var d2 = p5.Vector.dist(createVector(r.x, r.y), createVector(hit2.x, hit2.y));
        }
        var d3 = 20000;
        if (hit3.x) {
          var d3 = p5.Vector.dist(createVector(r.x, r.y), createVector(hit3.x, hit3.y));
        }

        if (d1 < d2 && d1 < d3) {
          r.p = createVector(hit1.x, hit1.y);
          continue;
        }
        if (d2 < d1 && d2 < d3) {
          r.p = createVector(hit2.x, hit2.y);
          continue;
        }
        if (d3 < d2 && d3 < d1) {
          r.p = createVector(hit3.x, hit3.y);
          continue;
        }
      }
    }

    fill(this.color);
    stroke(this.color);
    beginShape();
    for (let r of this.rays) {
      vertex(r.p.x, r.p.y);
    }
    endShape(CLOSE);
  }
}

class Ray {
  constructor(x, y, a){
    this.x = x;
    this.y = y;
    this.p = createVector(2000,2000).rotate(this.a);
    this.a = a
  }

  update(){
    //line(this.x, this.y, this.p.x, this.p.y);
    //stroke(150);
    this.p = createVector(2000,2000).rotate(this.a);
  }
}

class Boid {
  constructor() {
    this.acc = createVector(0, 0)
    //this.p = createVector(random(0, windowWidth), random(0, windowHeight));
    this.p = createVector(random(windowWidth), random(windowHeight));
    this.v = createVector(random(0, 1), random(0, 1));
    this.r = 5.0;
    this.maxSpeed = 3;
    this.maxForce = 0.06;

    this.body = [];

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

    var a = this.r * 2;

    beginShape(TRIANGLES);
    vertex(0, -this.r * 2);
    vertex(-this.r, a);
    vertex(this.r, a);
    endShape(CLOSE);

    //addBoundry(this.p.x, this.p.y - (this.r * 2), this.p.x - this.r, this.p.y + a, theta);
    //addBoundry(this.p.x - this.r, this.p.y + a, this.p.x + this.r, this.p.y + a, theta);

    this.body = {
      p1: createVector(0, -this.r * 2).rotate(theta).add(this.p.x, this.p.y),
      p2: createVector(-this.r, a).rotate(theta).add(this.p.x, this.p.y),
      p3: createVector(this.r, a).rotate(theta).add(this.p.x, this.p.y)
    }
    //this.body = [
    //  createVector(0, -this.r * 2).rotate(theta).add(this.p.x, this.p.y),
    //  createVector(-this.r, a).rotate(theta).add(this.p.x, this.p.y),
    //  createVector(this.r, a).rotate(theta).add(this.p.x, this.p.y)
    //];
    pop();
  }
}

// Collision Avoidance: avoid collisions with nearby flockmates
// Velocity Matching: attempt to match velocity with nearby flockmates
// Flock Centering: attempt to stay close to nearby flockmates

var canvas;
var ctx;

var backgroundColor = "#333";

var lastTime;
var deltaTime;
var currentTime;
var fps;

var centerB;

var birds = [];
var amount = 100;

$(document).ready(function(){
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";

  canvas.height = document.getElementById("birds").clientHeight;
  canvas.width = document.getElementById("birds").clientWidth;

  for (var i = 0; i < amount; i++) {
    birds.push(new Bird(i, randomNumber(0, canvas.width), randomNumber(0, canvas.height), i));
  }

  lastTime = performance.now();

  //loop();
});

class Bird {
  constructor(id, x = 0, y = 0, a = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.a = -(Math.PI * 0.25);
    this.targetA = a;
    this.speed = randomNumber(200, 300);
    this.turnRate = 5;
    this.acc = 3;
    this.range = 200;

    this.dx = this.speed * Math.cos(this.a);
    this.dy = this.speed * Math.sin(this.a);

    this.view = new Path2D();
  }

  update(dt) {
    if (this.x > canvas.width + 50) {
      this.x = 0;
    }
    if (this.x < -50) {
      this.x = canvas.width;
    }


    if (this.y > canvas.height + 50) {
      this.y = 0;
    }
    if (this.y < -50) {
      this.y = canvas.height;
    }


    if (this.a > this.targetA) {
      this.a -= this.turnRate * dt;
    }
    if (this.a < this.targetA) {
      this.a += this.turnRate * dt;
    }

    if (this.speed > this.targetSpeed) {
      this.a -= this.acc * dt;
    }
    if (this.speed < this.targetSpeed) {
      this.a += this.acc * dt;
    }

    var closest = this.range;
    var closestBird;
    for (var b of birds) {
      if (b.id =! this.id) {
        if(ctx.isPointInPath(this.view, b.x, b.y)) {
          var angle = this.a + Math.atan2(b.y - this.y, b.x - this.x);

          this.targetA = (this.targetA + angle) / 2;

          if (distance(this.x, this.y, b.x, b.y) < closest && distance(this.x, this.y, b.x, b.y) > 15) {
            closestBird = b;
          }
        }
      }
    }

    if (closestBird) {
      this.targetSpeed = closestBird.speed;
      this.targetA = closestBird.targetA
    }

    this.dx = this.speed * Math.cos(this.a);
    this.dy = this.speed * Math.sin(this.a);

    this.x += this.dx * dt;
    this.y += this.dy * dt;
  }

  draw(){
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x + this.radius * Math.cos(this.a - (0.9*Math.PI)),
      this.y + this.radius * Math.sin(this.a - (0.9*Math.PI))
    );
    ctx.lineTo(
      this.x + this.radius * Math.cos(this.a - (1.1*Math.PI)),
      this.y + this.radius * Math.sin(this.a - (1.1*Math.PI))
    );
    ctx.lineTo(this.x, this.y);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();

    //ctx.beginPath()
    //ctx.moveTo(this.x, this.y);
    //ctx.lineTo(
    //  this.x + this.radius * Math.cos(this.targetA),
    //  this.y + this.radius * Math.sin(this.targetA)
    //);
    //ctx.strokeStyle = "red";
    //ctx.stroke();
    //ctx.closePath();

    this.view = new Path2D();

    this.view.moveTo(this.x, this.y);
    this.view.arc(this.x, this.y, this.range, this.a - (0.75 * Math.PI), this.a + (0.75 * Math.PI))
    this.view.lineTo(this.x, this.y)

    //ctx.strokeStyle = "red";
    //ctx.stroke(this.view);
  }
}

function distance(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;

  return Math.sqrt( a*a + b*b );
}

function randomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function center(list) {
  var totalX = 0;
  var totalY = 0;

  for (b of birds) {
    totalX += b.x;
    totalY += b.y;
  }

  return {x: totalX / list.length, y: totalY / list.length};
}

function loop(){
  currentTime = performance.now();
  deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  fps = 1 / deltaTime;
  //console.log(fps);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  centerB = center(birds);
  ctx.fillStyle = "red";
  ctx.fillRect(centerB.x-5, centerB.y-5, 5, 5);

  for (var i = 0; i < birds.length; i++) {
    birds[i].update(deltaTime);
  }

  for (var i = 0; i < birds.length; i++) {
    birds[i].draw();
  }

  window.requestAnimationFrame(loop);
  //setTimeout(loop);
}

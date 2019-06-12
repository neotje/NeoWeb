$(document).ready(function() {
  $("#tshoot .game").hide();

  canvas = document.getElementById("tshootCanvas");
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
});

window.addEventListener("keydown", function(e) {
  // space and arrow keys
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault();
  }
}, false);

var interval = 10;
var ctx;
var canvas;
var singePlayerInterval;
var stopGame = false;
var lastTime;
var currentTime;
var deltaTime;

var keys = {
  up: {
    key: "w",
    pressed: false
  },
  down: {
    key: "s",
    pressed: false
  },
  left: {
    key: "a",
    pressed: false
  },
  right: {
    key: "d",
    pressed: false
  },
  exit: {
    key: "Escape",
    pressed: false
  }
}

function keyDownHandler(e) {
  for (let key in keys) {
    if (keys[key].key == e.key) {
      keys[key].pressed = true;
      //console.log(keys[key]);
    }
  }
}

function keyUpHandler(e) {
  for (let key in keys) {
    if (keys[key].key == e.key) {
      keys[key].pressed = false;
      //console.log(keys[key]);
    }
  }
}

function mouseClickHandler() {
  bullets.add(player.angle);
}

var mouse = {
  x: 0,
  y: 0,
  update: function(evt) {
    mousePos = getMousePos(canvas, evt);
    mouse.x = mousePos.x;
    mouse.y = mousePos.y;
  }
};

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

var player = {
  x: 0,
  y: 0,
  angle: 0,
  radius: 20,
  speed: 200,
  score: 0,
  level: 0,
  lastscore: 0,
  nextscore: 1,
  lives: 3,
  color: "white",
  draw: function() {
    // game info text
    $("#tshoot .game .info .lives").text(player.lives);
    $("#tshoot .game .info .score").text(player.score);
    $("#tshoot .game .info .level").text(player.level);
    // calculating
    player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

    if (player.nextscore == player.score) {
      player.level += 1;
      player.lastscore = player.nextscore;
      player.nextscore = player.nextscore * 2;

      enemys.spawn();
    }

    // movement
    if (keys.up.pressed && player.y > player.radius) {
      player.y -= player.speed * deltaTime;
    }
    if (keys.down.pressed && player.y < (canvas.height - player.radius)) {
      player.y += player.speed * deltaTime;
    }

    if (keys.left.pressed && player.x > player.radius) {
      player.x -= player.speed * deltaTime;
    }
    if (keys.right.pressed && player.x < (canvas.width - player.radius)) {
      player.x += player.speed * deltaTime;
    }

    // drawing
    ctx.beginPath();
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 2;
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    // gun
    ctx.beginPath();
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 4;
    ctx.moveTo(player.x + (Math.cos(player.angle) * 10), player.y + (Math.sin(player.angle) * 10));
    ctx.lineTo(player.x + (Math.cos(player.angle) * 30), player.y + (Math.sin(player.angle) * 30))
    ctx.stroke();
    ctx.closePath();
  }
};

var enemys = {
  list: [],
  add: function(level) {
    var e = new function() {
      this.x;
      this.y;
      this.level = level;
      this.rotate = 0;
      this.rotateSpeed = Math.PI / (this.level / 4);
      this.speed = 95 * Math.pow(0.8, this.level) + 30;
      this.radius = 20;

      this.draw = function() {
        // calculate angle toward player
        var angle = Math.atan2((player.y - this.y), (player.x - this.x));

        // calculate new position
        var Dx = this.speed * Math.cos(angle);
        var Dy = this.speed * Math.sin(angle);
        this.x += Dx * deltaTime;
        this.y += Dy * deltaTime;

        // detect collision with player
        if (circleCollision(player.x, player.y, player.radius, this.x, this.y, this.radius)) {
          player.score += this.level;
          this.level = 0;
          player.lives -= 1;
        }
        // apply rotation
        this.rotate += this.rotateSpeed * deltaTime;

        genShape(this.x, this.y, this.radius, this.level + 2, this.rotate);
      }
    }

    // generate spawn side
    var spawnSide = randomNumber(1, 4);
    //console.log("spawn", spawnSide);

    if (spawnSide == 1) {
      e.x = -50;
      e.y = randomNumber(0, canvas.height);
    }
    if (spawnSide == 2) {
      e.y = -50;
      e.x = randomNumber(0, canvas.width);
    }
    if (spawnSide == 3) {
      e.x = canvas.width + 50;
      e.y = randomNumber(0, canvas.height);
    }
    if (spawnSide == 4) {
      e.y = canvas.height + 50;
      e.x = randomNumber(0, canvas.width);
    }

    // add new enemy to enemys list
    enemys.list.push(e);
  },
  draw: function() {
    // draw every enemy
    for (var i = 0; i < enemys.list.length; i++) {
      enemys.list[i].draw();

      // check if enemy level is 0
      if (enemys.list[i].level == 0) {
        enemys.list.splice(i, 1);
      }
    }
  },
  spawn: function() {
    //console.log("nextScore", player.nextscore);
    var levels = genRandomNumbers(1, player.level, player.nextscore - player.lastscore);
    //console.log("total", total(levels));
    //console.log("delta", player.nextscore - player.lastscore);
    for (level of levels) {
      enemys.add(level);
    }
  }
}

var bullets = {
  list: [],
  add: function(angle) {
    var b = new function() {
      this.x = player.x + (Math.cos(player.angle) * 25);
      this.y = player.y + (Math.sin(player.angle) * 25);
      this.angle = angle;
      this.speed = 400;
      this.destroy = false;

      this.dx = this.speed * Math.cos(this.angle);
      this.dy = this.speed * Math.sin(this.angle);


      this.draw = function() {
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.destroy = true;
        }

        for (enemy of enemys.list) {
          if (circleCollision(this.x, this.y, 1, enemy.x, enemy.y, enemy.radius)) {
            enemy.level -= 1;

            enemy.speed = 95 * Math.pow(0.8, enemy.level) + 30;
            enemy.rotateSpeed = Math.PI / (enemy.level / 4);

            player.score += 1;
            this.destroy = true
          }
        }

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - (Math.cos(this.angle) * 15), this.y - (Math.sin(this.angle) * 15));
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.closePath();

        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;
      }
    }

    bullets.list.push(b);
  },
  draw: function() {
    for (var i = 0; i < bullets.list.length; i++) {
      var bullet = bullets.list[i];

      bullet.draw();

      if (bullet.destroy) {
        bullets.list.splice(i, 1);
      }
    }
  }
}

function total(list) {
  var t = 0;
  for (num of list) {
    t += num;
  }
  return t;
}

function genRandomNumbers(min, max, sum) {
  var numbers = [];
  var loop = true;

  while (loop) {
    numbers.push(randomNumber(min, max));

    if (total(numbers) > sum) {
      numbers.pop();
    }
    if (total(numbers) == sum) {
      loop = false;
    }
  }
  return numbers;
}

function genShape(x, y, r, s, rotate = 0, color = "white") {
  sRadius = (Math.PI * 2) / s;
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.moveTo(x + (Math.cos(0 + rotate) * r), y + (Math.sin(0 + rotate) * r));
  for (var i = 1; i <= s; i++) {
    ctx.lineTo(x + (Math.cos(i * sRadius + rotate) * r), y + (Math.sin(i * sRadius + rotate) * r));
  }
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

function randomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function circleCollision(x1, y1, r1, x2, y2, r2) {
  var dx = x1 - x2;
  var dy = y1 - y2;
  var distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < r1 + r2) {
    return true;
  } else {
    return false;
  }
}

function CheckCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  if (x1 < x2 + w2 && x2 < x1 + w1 && y1 < y2 + h2 && y2 < y1 + h1) {
    return true;
  } else {
    return false;
  }
}

function singePlayerDraw(time) {
  currentTime = performance.now();
  deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (keys.exit.pressed) {
    keys.exit.pressed = false;
    stopSingleplayer();
  }
  if (stopGame) {
    stopGame = false;
    return;
  }

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  bullets.draw();
  player.draw();
  enemys.draw();

  window.requestAnimationFrame(singePlayerDraw);
}

function resetSinglePlayer() {
  enemys.list = [];
  bullets.list = [];
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.angle = 0;
  player.lives = 3;
  player.score = 0;
  player.level = 1;
  player.lastscore = 0;
  player.nextscore = 1;
}

function startSingleplayer() {
  resetSinglePlayer();

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
  canvas.addEventListener("mousedown", mouseClickHandler, false)
  canvas.addEventListener("mousemove", mouse.update, false);

  $("#tshoot .menu").hide(function() {
    $("#tshoot .game").show(function() {
      enemys.spawn();
      lastTime = performance.now();
      window.requestAnimationFrame(singePlayerDraw);
    });
  });
}

function stopSingleplayer() {
  stopGame = true;

  document.removeEventListener("keydown", keyDownHandler);
  document.removeEventListener("keyup", keyUpHandler);
  canvas.removeEventListener("click", mouseClickHandler)
  canvas.removeEventListener("mousemove", mouse.update);


  $("#tshoot .game").hide(300, function() {
    $("#tshoot .menu").show(300);
  });
}
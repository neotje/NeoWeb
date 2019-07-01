$(document).ready(function() {
  game.jq = $("#tshoot .game");
  game.jq.hide();

  game.canvas = document.getElementById("tshootCanvas");
  game.ctx = game.canvas.getContext("2d");
  game.ctx.imageSmoothingQuality = "low";

  $("#tshoot .menu .setName").hide();
  $("#tshoot .menu .controls").hide();
  $("#tshoot .menu .main").hide();
  $("#tshoot .menu .scoreboard").hide();

  $("#tshoot .menu .setName").submit(function() {
    menu.setName($("#tshoot .menu .setName input").val(), menu.gotoMain);
  });

  if ($(window).height < 720 || $(window).width() < 1280) {
    notifier.show("Compatibility issue", "Your screen is too small to display this game properly.", 10000, "red");
  }
});

firebase.auth().onAuthStateChanged(function(loginUser) {
  if (loginUser) {
    user.doc().collection("tshoot").doc("settings").onSnapshot(function(doc) {
      game.userData = doc.data();

      for (var keyAction in game.userData.keys) {
        game.keys[keyAction].key = game.userData.keys[keyAction];
      }

      game.ctx.imageSmoothingQuality = game.userData.graphics;
    });

    menu.checkUser();
  }
});

window.addEventListener("keydown", function(e) {
  // space and arrow keys
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault();
  }
}, false);

function isEven(value) {
  if (value % 2 == 0)
    return true;
  else
    return false;
}

function randomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

class Player {
  constructor() {
    this.type = "player";
    this.destroy = false;

    this.x = game.canvas.width / 2;
    this.y = game.canvas.height / 2;
    this.angle = 0;
    this.radius = 20;
    this.speed = 200;


    this.beams = 1;
    this.damage = 1;
    this.bulletSpeed = 300

    this.color = "white";

    this.lives = 3;
    this.score = 0;

    this.name = "";
    this.ID = user.current().uid;

    let This = this;

    game.canvas.addEventListener("mousedown", function() {
      game.shoot(This);
    }, false);
  }

  update(dt) {
    this.angle = Math.atan2(game.mouse.y - this.y, game.mouse.x - this.x);

    if (this.ID == user.current().uid) {
      if (game.keys.up.pressed) {
        this.y -= this.speed * dt;
      }
      if (game.keys.down.pressed) {
        this.y += this.speed * dt;
      }
      if (game.keys.left.pressed) {
        this.x -= this.speed * dt;
      }
      if (game.keys.right.pressed) {
        this.x += this.speed * dt;
      }

      $("#tshoot .game .info .lives").text(this.lives);
      $("#tshoot .game .info .score").text(this.score);
      game.score = this.score;
    }

    if (this.lives <= 0) {
      this.destroy = true;
    }

    if (this.x < this.radius) {
      this.x = this.radius;
    }
    if (this.x > game.canvas.width - this.radius) {
      this.x = game.canvas.width - this.radius;
    }
    if (this.y < this.radius) {
      this.y = this.radius;
    }
    if (this.y > game.canvas.height - this.radius) {
      this.y = game.canvas.height - this.radius;
    }
  }

  draw(ctx) {
    // drawing
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    // gun
    var startR = 40 / this.beams;

    if (!isEven(this.beams)) {
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      //ctx.lineWidth = 4;
      ctx.moveTo(this.x + (Math.cos(this.angle) * 10), this.y + (Math.sin(this.angle) * 10));
      ctx.lineTo(this.x + (Math.cos(this.angle) * 30), this.y + (Math.sin(this.angle) * 30));
      ctx.stroke();
      ctx.closePath();
    }

    for (var i = 1; i <= this.beams / 2; i++) {
      var rX = Math.cos(this.angle + (0.5 * Math.PI)) * (i * startR - (0.5 * startR));
      var rY = Math.sin(this.angle + (0.5 * Math.PI)) * (i * startR - (0.5 * startR));

      ctx.beginPath();
      ctx.strokeStyle = this.color;
      //ctx.lineWidth = 4;
      ctx.moveTo(this.x + (Math.cos(this.angle) * 10) + rX, this.y + (Math.sin(this.angle) * 10) + rY);
      ctx.lineTo(this.x + (Math.cos(this.angle) * 30) + rX, this.y + (Math.sin(this.angle) * 30) + rY);
      ctx.stroke();
      ctx.closePath();
    }

    for (var i = 1; i <= this.beams / 2; i++) {
      var rX = Math.cos(this.angle - (0.5 * Math.PI)) * (i * startR - (0.5 * startR));
      var rY = Math.sin(this.angle - (0.5 * Math.PI)) * (i * startR - (0.5 * startR));

      ctx.beginPath();
      ctx.strokeStyle = this.color;
      //ctx.lineWidth = 4;
      ctx.moveTo(this.x + (Math.cos(this.angle) * 10) + rX, this.y + (Math.sin(this.angle) * 10) + rY);
      ctx.lineTo(this.x + (Math.cos(this.angle) * 30) + rX, this.y + (Math.sin(this.angle) * 30) + rY);
      ctx.stroke();
      ctx.closePath();
    }


    // Name
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.font = "16px Roboto";
    ctx.textAlign = "center";
    ctx.fillText(this.name, this.x, this.y + 40);
    ctx.closePath();
  }
}

class Bullet {
  constructor(origin, speed, damage) {
    this.type = "bullet";
    this.origin = origin;
    this.destroy = false;

    this.x;
    this.y;
    this.angle;
    this.dx;
    this.dy;
    this.speed = speed;
    this.damage = damage;

    if (this.origin.type == "player") {
      this.x = this.origin.x + (Math.cos(this.origin.angle) * 20);
      this.y = this.origin.y + (Math.sin(this.origin.angle) * 20);
      this.angle = this.origin.angle;
      this.dx = this.speed * Math.cos(this.angle);
      this.dy = this.speed * Math.sin(this.angle);
    }
  }

  update(dt) {
    if (this.x < 0 || this.x > game.canvas.width || this.y < 0 || this.y > game.canvas.height) {
      this.destroy = true;
    }

    this.x += this.dx * dt;
    this.y += this.dy * dt;

    // check for collissions
    for (let entity of game.entities) {
      if (this.origin.type == "enemy" && entity.type == "player") {
        var d = game.distance(this.x, this.y, entity.x, entity.y);
        if (d < entity.radius) {
          entity.lives -= this.damage;
          entity.score -= this.damage;
          this.destroy = true;
        }
      }

      if (this.origin.type == "player" && entity.type == "enemy") {
        var d = game.distance(this.x, this.y, entity.x, entity.y);
        if (d < entity.radius) {
          entity.level -= this.damage;
          entity.lastInteraction = this.origin;
          this.origin.score += this.damage;
          this.destroy = true;
        }
      }
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - (Math.cos(this.angle) * 10), this.y - (Math.sin(this.angle) * 10));
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.closePath();
  }
}

class Enemy {
  constructor(level) {
    this.type = "enemy";
    this.destroy = false;

    this.level = level;
    this.origLevel = level;

    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.speed = 175;
    this.radius = 20;
    this.target;
    this.targets = [];
    this.distances = [];
    this.lastInteraction;
  }

  update(dt) {
    // check for collissions
    for (let entity of game.entities) {
      if (entity.type == "player") {
        // calculate distance to player
        var d = game.distance(this.x, this.y, entity.x, entity.y);

        if (d < this.radius + entity.radius) {
          entity.lives -= 1;
          entity.score += this.level;

          this.level = 0;
          this.lastInteraction = entity;
          this.lastInteraction.score += this.origLevel;


        } else {
          this.targets.push({
            distance: d,
            entity: entity
          });
          this.distances.push(d);
        }
      }
    }

    // get closest player
    var minDistance = Math.min(...this.distances);
    for (let target of this.targets) {
      if (target.distance == minDistance) {
        this.target = target.entity;
        break;
      }
    }

    if (this.level <= 0) {
      var random = randomNumber(0, 100);

      //console.log(random);

      if (random >= 0 && random <= 15) {
        var u = new Upgrade("speed", this.x, this.y);
        game.entities.push(u);
      }
      if (random > 15 && random <= 20 && game.beams < 10) {
        var u = new Upgrade("beams", this.x, this.y);
        game.entities.push(u);
      }
      if (random > 20 && random <= 25) {
        var u = new Upgrade("damage", this.x, this.y);
        game.entities.push(u);
      }
      if (random > 25 && random <= 30) {
        var u = new Upgrade("life", this.x, this.y);
        game.entities.push(u);
      }
      game.addEnemy(game.level);

      this.destroy = true;
    }

    if (this.target) {
      this.angle = Math.atan2((this.target.y - this.y), (this.target.x - this.x));
    }

    // calculate new position
    var Dx = this.speed * Math.cos(this.angle);
    var Dy = this.speed * Math.sin(this.angle);
    this.x += Dx * dt;
    this.y += Dy * dt;
  }

  draw(ctx) {
    var sRadius = (Math.PI * 2) / (this.level + 2);
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(this.x + (Math.cos(0 + this.angle) * this.radius), this.y + (Math.sin(0 + this.angle) * this.radius));
    for (var i = 1; i <= this.level + 2; i++) {
      ctx.lineTo(this.x + (Math.cos(i * sRadius + this.angle) * this.radius), this.y + (Math.sin(i * sRadius + this.angle) * this.radius));
    }
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.closePath();
  }
}

class Upgrade {
  constructor(upgrade, x, y) {
    this.type = "upgrade";
    this.upgrade = upgrade;
    this.x = x;
    this.y = y;

    this.time = 0;

    this.radius = 20;
  }

  applyUpgrade(entity) {
    if (this.upgrade == "speed") {
      entity.bulletSpeed += 10;
    }
    if (this.upgrade == "beams") {
      entity.beams += 1;
    }
    if (this.upgrade == "damage") {
      entity.damage += 1;
    }
    if (this.upgrade == "life") {
      entity.lives += 1;
    }
  }

  update(dt) {
    this.time += dt;

    if (this.time > 3) {
      this.destroy = true;
    }
    for (let entity of game.entities) {
      if (entity.type == "player" && game.distance(this.x, this.y, entity.x, entity.y) < (this.radius + entity.radius)) {
        this.applyUpgrade(entity);
        game.level += 1;
        game.addEnemy(game.level);
        this.destroy = true;
      }
    }
  }

  draw(ctx) {
    if (this.upgrade == "speed") {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.moveTo(this.x, this.y - 5);
      ctx.lineTo(this.x + 10, this.y + 5);
      ctx.moveTo(this.x, this.y - 5);
      ctx.lineTo(this.x - 10, this.y + 5);
      ctx.strokeStyle = "yellow";
      ctx.stroke();
      ctx.closePath();
    }
    if (this.upgrade == "beams") {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.moveTo(this.x, this.y - 10);
      ctx.lineTo(this.x, this.y + 10);
      ctx.moveTo(this.x + 5, this.y - 10);
      ctx.lineTo(this.x + 5, this.y + 10);
      ctx.moveTo(this.x - 5, this.y - 10);
      ctx.lineTo(this.x - 5, this.y + 10);
      ctx.strokeStyle = "red";
      ctx.stroke();
      ctx.closePath();
    }
    if (this.upgrade == "damage") {
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.moveTo(this.x, this.y - 10);
      ctx.lineTo(this.x, this.y + 10);
      ctx.strokeStyle = "red";
      ctx.stroke();
      ctx.closePath();
    }
    if (this.upgrade == "life") {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.moveTo(this.x, this.y - 10);
      ctx.lineTo(this.x, this.y + 10);
      ctx.moveTo(this.x - 10, this.y);
      ctx.lineTo(this.x + 10, this.y);
      ctx.strokeStyle = "green";
      ctx.stroke();
      ctx.closePath();
    }
  }
}

const game = new function() {
  var lastTime;
  var currentTime;
  var deltaTime;
  var stop = false;

  this.jq;
  this.canvas;
  this.ctx;
  this.fps;

  this.score;
  this.playerCount;
  this.level = 1;

  this.damage = 1;
  this.beams = 1;
  this.speed = 400;

  this.mode;
  this.roomID;

  this.userData = "";

  this.entities = [];

  this.keys = {
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

  this.mouse = {
    x: 0,
    y: 0,
    update: function(evt) {
      mousePos = getMousePos(game.canvas, evt);
      game.mouse.x = mousePos.x;
      game.mouse.y = mousePos.y;
    }
  };

  this.distance = function(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;

    return Math.sqrt(a * a + b * b);
  }

  this.addEnemy = function(level) {
    var e = new Enemy(level);

    // generate spawn side
    var spawnSide = randomNumber(1, 4);
    //console.log("spawn", spawnSide);

    if (spawnSide == 1) {
      e.x = -50;
      e.y = randomNumber(0, game.canvas.height);
    }
    if (spawnSide == 2) {
      e.y = -50;
      e.x = randomNumber(0, game.canvas.width);
    }
    if (spawnSide == 3) {
      e.x = game.canvas.width + 50;
      e.y = randomNumber(0, game.canvas.height);
    }
    if (spawnSide == 4) {
      e.y = game.canvas.height + 50;
      e.x = randomNumber(0, game.canvas.width);
    }

    game.entities.push(e);
  }

  this.uploadUserData = function(callback = function() {}) {
    user.doc().collection("tshoot").doc("settings").update(game.userData)
      .then(callback);
  }

  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  function keyDownHandler(e) {
    for (let key in game.keys) {
      if (game.keys[key].key == e.key) {
        game.keys[key].pressed = true;
        //console.log(game.keys[key]);
      }
    }
  }

  function keyUpHandler(e) {
    for (let key in game.keys) {
      if (game.keys[key].key == e.key) {
        game.keys[key].pressed = false;
        //console.log(game.keys[key]);
      }
    }
  }

  function reset() {
    game.level = 1;

    for (let action in game.keys) {
      game.keys[action].pressed = false;
    }

    game.entities = [];

    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);

    var p = new Player();
    p.name = user.current().displayName;
    game.entities.push(p);

    game.addEnemy(game.level);
  }

  function randomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min);
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

  this.shoot = function(This) {
    //console.log("shooting");

    var startR = 40 / This.beams;
    console.log(This);

    if (!isEven(This.beams)) {
      var b = new Bullet(This, This.bulletSpeed, This.damage);
      game.entities.push(b);
    }

    for (var i = 1; i <= This.beams / 2; i++) {
      var b = new Bullet(This, This.bulletSpeed, This.damage);

      b.x += Math.cos(This.angle + (0.5 * Math.PI)) * (i * startR - (0.5 * startR));
      b.y += Math.sin(This.angle + (0.5 * Math.PI)) * (i * startR - (0.5 * startR));

      game.entities.push(b);
    }

    for (var i = 1; i <= This.beams / 2; i++) {
      var b = new Bullet(This, This.bulletSpeed, This.damage);

      b.x += Math.cos(This.angle - (0.5 * Math.PI)) * (i * startR - (0.5 * startR));
      b.y += Math.sin(This.angle - (0.5 * Math.PI)) * (i * startR - (0.5 * startR));

      game.entities.push(b);
    }
  }

  this.start = function(mode = "singleplayer", roomID = null) {
    if ($(window).height < 720 || $(window).width() < 1280) {
      notifier.show("Compatibility issue", "Your screen is too small to display this game properly. You can try to adjust the page zoom.", 10000, "red");
      return;
    }

    this.mode = mode;
    this.roomID = roomID;

    //game.loadConf();

    document.addEventListener("keydown", keyDownHandler, false);
    //$(document).keydown(keyDownHandler);
    document.addEventListener("keyup", keyUpHandler, false);
    //$(document).keyup(keyUpHandler);
    game.canvas.addEventListener("mousemove", game.mouse.update, false);

    reset();

    $("#tshoot .menu").hide(function() {
      $("#tshoot .game").show(function() {
        lastTime = performance.now();
        window.requestAnimationFrame(game.loop);
      });
    });
  }

  this.stop = function() {
    stop = true;

    document.removeEventListener("keydown", keyDownHandler);
    document.removeEventListener("keyup", keyUpHandler);
    game.canvas.removeEventListener("mousemove", game.mouse.update);
    game.canvas.removeEventListener("mousedown", game.shoot);

    if (game.score > game.userData.highscore) {
      game.userData.highscore = game.score;
      game.uploadUserData();
      menu.gotoGameOver(true);
    } else {
      menu.gotoGameOver(false);
    }
  }

  this.loop = function() {
    if (stop) {
      return;
    }
    currentTime = performance.now();
    deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    game.fps = 1 / deltaTime;

    game.ctx.fillStyle = "black";
    game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

    // check if a entity needs to be destroyed;
    for (let i in game.entities) {
      if (game.entities[i].destroy == true) {
        //console.log("destroyed", game.entities[i]);
        game.entities.splice(i, 1);
      }
    }

    // get player count
    game.playerCount = 0;
    for (let entity of game.entities) {
      if (entity.type == "player") {
        game.playerCount += 1;
      }
    }

    if (game.playerCount == 0 || game.keys.exit.pressed) {
      game.stop();
    }

    // update every entity;
    for (let entity of game.entities) {
      entity.update(deltaTime);
    }
    // draw every entity;
    for (let entity of game.entities) {
      entity.draw(game.ctx);
    }

    window.requestAnimationFrame(game.loop);
  }
}

const menu = new function() {
  this.userData;

  this.checkUser = function() {
    var This = this;

    user.doc().collection("tshoot").doc("settings").get().then(function(doc) {
      var obj = doc.data();

      if (obj == undefined || obj.highscore == undefined || obj.keys == undefined || obj.graphics == undefined) {
        user.doc().collection("tshoot").doc("settings").set({
          name: null,
          highscore: 0,
          graphics: "high",
          keys: {
            up: "w",
            down: "s",
            left: "a",
            right: "d",
            exit: "Escape"
          }
        }).then(menu.checkUser);
        return;
      }

      if (user.current().displayName == null || user.current().displayName == "") {
        menu.gotoSetName();
      } else {
        menu.gotoMain();
      }
    });
  }

  this.setName = function(name, callback = function() {}) {
    user.current().updateProfile({
      displayName: name
    }).then(callback);
  }

  this.getKey = function(action) {
    menu.action = action;

    for (let action in game.userData.keys) {
      $("#tshoot .menu .controls .list ." + menu.action + " button").text(game.userData.keys[action]);
    }

    $("#tshoot .menu .controls .list ." + menu.action + " button").text("...");

    function updateKeyConf(e) {
      game.userData.keys[menu.action] = e.key;
      game.uploadUserData();
      $("#tshoot .menu .controls .list ." + menu.action + " button").text(e.key);
      document.removeEventListener("keyup", updateKeyConf);
    }

    document.addEventListener("keyup", updateKeyConf, false);
  }

  this.submitScore = function(callback = function() {}) {
    var db = firebase.firestore();

    var score = {};

    score[user.current().uid.substring(0, 4)] = {
      name: user.current().displayName,
      score: game.score
    };

    db.collection("tshoot").doc("Scoreboard").update(score).then(callback);
  }

  this.gotoMain = function() {
    $("#tshoot .menu .setName").hide();
    $("#tshoot .menu .controls").hide();
    $("#tshoot .menu .gameOver").hide();
    $("#tshoot .menu .main").show();
    $("#tshoot .menu .scoreboard").hide();
  }
  this.gotoSetName = function() {
    $("#tshoot .menu .setName").show();
    $("#tshoot .menu .controls").hide();
    $("#tshoot .menu .gameOver").hide();
    $("#tshoot .menu .main").hide();
    $("#tshoot .menu .scoreboard").hide();
  }
  this.gotoControls = function() {
    try {
      document.removeEventListener("keyup", updateKeyConf);
    } catch (e) {
      console.warn(e);

    }

    $("#tshoot .controls .up button").text(game.userData.keys.up);
    $("#tshoot .controls .down button").text(game.userData.keys.down);
    $("#tshoot .controls .left button").text(game.userData.keys.left);
    $("#tshoot .controls .right button").text(game.userData.keys.right);
    $("#tshoot .controls .exit button").text(game.userData.keys.exit);

    $("#tshoot .menu .setName").hide();
    $("#tshoot .menu .controls").show();
    $("#tshoot .menu .gameOver").hide();
    $("#tshoot .menu .main").hide();
    $("#tshoot .menu .scoreboard").hide();
  }
  this.gotoScoreBoard = function() {
    var db = firebase.firestore();
    db.collection("tshoot").doc("Scoreboard").get().then(function(doc) {
      var scoresObj = doc.data();
      var scoresArr = [];

      //console.log(scoresObj);

      for (let player in scoresObj) {
        scoresObj[player].id = player;
        scoresArr.push(scoresObj[player]);
      }

      scoresArr = scoresArr.sort(function(a, b) {
        return b.score - a.score
      });

      //console.log(scoresArr);

      $("#tshoot .menu .scoreboard table").html("<tr><th>#</th><th>name</th><th>score</th></tr>");

      for (var i = 1; i <= scoresArr.length; i++) {
        var score = scoresArr[i - 1];

        if (score.id == user.current().uid.substring(0, 4)) {
          $("#tshoot .menu .scoreboard table").append("<tr style='background-color: #4CAF50'><td>" + i + "</td><td>" + score.name + "</td><td>" + score.score + "</td></tr>");
          continue;
        }
        $("#tshoot .menu .scoreboard table").append("<tr><td>" + i + "</td><td>" + score.name + "</td><td>" + score.score + "</td></tr>");
      }

      $("#tshoot .menu .setName").hide();
      $("#tshoot .menu .controls").hide();
      $("#tshoot .menu .gameOver").hide();
      $("#tshoot .menu .main").hide();
      $("#tshoot .menu .scoreboard").show();
    });
  }
  this.gotoGameOver = function(newHighScore) {
    if (newHighScore) {
      $("#tshoot .menu .gameOver .score").text("New High Score: " + game.score);
      menu.submitScore();
    } else {
      $("#tshoot .menu .gameOver .score").text("Score: " + game.score);
    }

    $("#tshoot .menu .setName").hide();
    $("#tshoot .menu .controls").hide();
    $("#tshoot .menu .main").hide();
    $("#tshoot .menu .scoreboard").hide();
    $("#tshoot .game").hide();
    $("#tshoot .menu").show();
    $("#tshoot .menu .gameOver").show();
  }
}
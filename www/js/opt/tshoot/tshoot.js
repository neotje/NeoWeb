$(document).ready(function() {
  game.jq = $("#tshoot .game");
  game.jq.hide();

  game.canvas = document.getElementById("tshootCanvas");
  game.ctx = game.canvas.getContext("2d");
  game.ctx.imageSmoothingQuality = "high";

  $("#tshoot .menu .main").hide();
  $("#tshoot .menu .setName").hide();

  $("#tshoot .menu .setName").submit(function() {
    menu.setName($("#tshoot .menu .setName input").val(), menu.gotoMain);
  });
});

firebase.auth().onAuthStateChanged(function(loginUser) {
  if (loginUser) {
    user.doc().collection("tshoot").doc("settings").onSnapshot(function(doc) {
      user.doc().collection("tshoot").doc("settings").get().then(function(doc) {
        menu.userData = doc.data();
      });
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

class Gamemanager {
  constructor(host) {
    this.type == "manager";

    this.host = host;
  }

  update(dt) {
    var playerCount = 0

    for (let entity of game.entities) {
      // check if entity is a player
      if (entity.type == "player") {
        // check the amount of lives of the entity
        if (entity.lives == 0) {
          // destroy entity
          entity.destroy = true;

          // save score if it is your entity
          if (entity.ID == user.current().uid) {
            game.score = entity.score;
          }
        }
      }
    }
  }
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

    this.color = "white";

    this.lives = 3;
    this.score = 0;

    this.name = "";
    this.ID = user.current().uid;
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

    if (user.current().uid == this.ID) {
      $("#tshoot .game .info .lives").text(this.lives);
      $("#tshoot .game .info .score").text(this.score);
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
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    ctx.moveTo(this.x + (Math.cos(this.angle) * 10), this.y + (Math.sin(this.angle) * 10));
    ctx.lineTo(this.x + (Math.cos(this.angle) * 30), this.y + (Math.sin(this.angle) * 30));
    ctx.stroke();
    ctx.closePath();

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
  constructor(uid) {
    this.type = "bullet";
    this.player;
    this.destroy = false;

    this.x;
    this.y;
    this.angle;
    this.dx;
    this.dy;
    this.speed = 400;

    for (let entity of game.entities) {
      if (entity.type == "player" && entity.ID == uid) {
        this.player = entity;
        this.x = this.player.x + (Math.cos(this.player.angle) * 20);
        this.y = this.player.y + (Math.sin(this.player.angle) * 20);
        this.angle = this.player.angle;
        this.dx = this.speed * Math.cos(this.angle);
        this.dy = this.speed * Math.sin(this.angle);
        break;
      }
    }
  }

  update(dt) {
    if (this.x < 0 || this.x > game.canvas.width || this.y < 0 || this.y > game.canvas.height) {
      this.destroy = true;
    }

    this.x += this.dx * dt;
    this.y += this.dy * dt;
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
    this.destroy = "false";

    this.level = level;

    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.speed = 95 * Math.pow(0.8, this.level) + 30;
    this.radius = 20;
    this.target;
    this.targets = [];
    this.distances = []
  }

  update(dt) {
    for (let entity of game.entities) {
      if (entity.type == "player") {
        // calculate distance to player
        var d = game.distance(this.x, this.y, entity.x, entity.y);

        if (d < this.radius + entity.radius) {
          entity.lives -= 1;
          entity.score += this.level;
          this.destroy = true;
        } else {
          this.targets.push({
            distance: d,
            entity: entity
          });
          this.distances.push(d);
        }
      }
      if (entity.type == "bullet") {
        var d = game.distance(this.x, this.y, entity.x, entity.y);
        if (d < this.radius) {
          this.level -= 1;
          entity.player.score += 1;
          entity.destroy = true;
        }
      }
    }

    var minDistance = Math.min(...this.distances);

    for (let target of this.targets) {
      if (target.distance == minDistance) {
        this.target = target.entity;
        break;
      }
    }

    if (this.level <= 0) {
      this.destroy = true;
    }

    this.angle = Math.atan2((this.target.y - this.y), (this.target.x - this.x));

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
  this.userName = "";
  this.action = "";

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

  this.shoot = function() {
    var b = new Bullet(user.current().uid);

    game.entities.push(b);
  }

  this.addEnemy = function(level) {
    var e = new Enemy(level);

    game.entities.push(e);
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
        console.log(game.keys[key]);
      }
    }
  }

  function keyUpHandler(e) {
    for (let key in game.keys) {
      if (game.keys[key].key == e.key) {
        game.keys[key].pressed = false;
        console.log(game.keys[key]);
      }
    }
  }

  function reset() {
    game.entities = [];

    var p = new Player();

    p.name = game.userName;

    game.entities.push(p);
  }

  this.start = function() {
    menu.loadConf();

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    game.canvas.addEventListener("mousemove", game.mouse.update, false);
    game.canvas.addEventListener("mousedown", game.shoot, false);

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

    for (let entity of game.entities) {
      if (entity.type == "player" && entity.ID == user.current().uid) {
        game.score = entity.score
      }
    }

    menu.gotoGameOver(game.score, game.userName);
  }

  this.loop = function() {
    currentTime = performance.now();
    deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    game.fps = 1 / deltaTime;

    game.ctx.fillStyle = "black";
    game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

    if (game.keys.exit.pressed) {
      game.stop();
    }

    for (let i in game.entities) {
      if (game.entities[i].destroy == true) {
        console.log("destroyed", game.entities[i]);
        game.entities.splice(i, 1);
      }
    }

    for (let entity of game.entities) {
      entity.update(deltaTime);
    }
    for (let entity of game.entities) {
      entity.draw(game.ctx);
    }

    if (stop == false) {
      window.requestAnimationFrame(game.loop);
    }
  }
}

const menu = new function() {
  this.userData;

  this.loadConf = function() {
    for (var keyAction in menu.userData.keys) {
      game.keys[keyAction].key = menu.userData.keys[keyAction];
    }

    game.userName = menu.userData.name;

    game.ctx.imageSmoothingQuality = menu.userData.graphics;
  }

  this.uploadConf = function(callback = function() {}) {
    user.doc().collection("tshoot").doc("settings").update(menu.userData)
      .then(callback);
  }

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

      if (obj.name == null || obj.name == "") {
        menu.gotoSetName();
      } else {
        menu.gotoMain();
      }
    });
  }

  this.setName = function(name, callback = function() {}) {
    user.doc().collection("tshoot").doc("settings").update({
      name: name
    }).then(callback);
  }

  this.getKey = function(action) {
    menu.action = action;

    for (let action in this.userData.keys) {
      $("#tshoot .menu .controls .list ." + menu.action + " button").text(this.userData.keys[action]);
    }

    $("#tshoot .menu .controls .list ." + menu.action + " button").text("...");

    function updateKeyConf(e) {
      menu.userData.keys[menu.action] = e.key;
      menu.uploadConf();
      $("#tshoot .menu .controls .list ." + menu.action + " button").text(e.key);
      document.removeEventListener("keyup", updateKeyConf);
    }

    document.addEventListener("keyup", updateKeyConf, false);
  }

  this.gotoMain = function() {
    $("#tshoot .menu .setName").hide();
    $("#tshoot .menu .controls").hide();
    $("#tshoot .menu .main").show();
  }
  this.gotoSetName = function() {
    $("#tshoot .menu .setName").show();
    $("#tshoot .menu .controls").hide();
    $("#tshoot .menu .main").hide();
  }
  this.gotoControls = function() {
    try {
      document.removeEventListener("keyup", updateKeyConf);
    } catch (e) {}

    $("#tshoot .menu .setName").hide();
    $("#tshoot .menu .controls").show();
    $("#tshoot .menu .main").hide();

    for (let action in this.userData.keys) {
      $("#tshoot .menu .controls .list ." + action + " button").text(this.userData.keys[action]);
    }
  }
}
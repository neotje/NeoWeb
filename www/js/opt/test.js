var amount = 500;
var turnFraction = 0.00000;
var radius = 5

function setup(){
  cnv = createCanvas(windowWidth, windowHeight);

  setInterval(function(){
    turnFraction = turnFraction + 0.00001;
  }, 1);

  frameRate(140)

  setInterval(function(){
    if (frameRate() - 20 < 60) {
      //pixelDensity(frameRate()/60);
    }
  },10);

  amount = height;
}

function draw(){
  background(0);
  for (var i = 0; i < amount; i++) {
    var dst = i / (amount - 1.0);
    var angle = 2 * PI * turnFraction * i;

    var x = dst * cos(angle) * (amount);
    var y = dst * sin(angle) * (amount);

    circle(width/2 + x, height/2 + y, radius);
    //line(width/2, height/2, width/2 + x, height/2 + y);
    //point(width/2 + x, height/2 + y);
    fill(255);
    stroke(255);
  }

  textSize(32);
  text(round(frameRate()), 10, 30);
  textSize(16);
  text(turnFraction, 10, 48);
  fill(0);
}

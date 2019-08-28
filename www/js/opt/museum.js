var colors = [
  "w3-pink",
  "w3-purple",
  "w3-indigo",
  "w3-blue",
  "w3-teal",
  "w3-yellow",
  "w3-orange",
  "w3-gray"
];

var Duration = {
  card: 500
}

$(document).ready(function() {
  $("form").submit(function(e) {
    e.preventDefault();
  });

  var url = new URL(document.location.href);
  var q = url.searchParams.get("q");
  var c = colors[Math.floor(Math.random() * (colors.length-1))];

  $(".top").addClass(c);
  $(".control-button").addClass(c);

  if (getCookie("difficulty") == "") {
    $(".options").prepend(`
      <p>
        <input class="w3-radio" type="radio" name="option" value="easy" required>
        <label>makkelijk</label>
      </p>
      <p>
        <input class="w3-radio" type="radio" name="option" value="hard" required>
        <label>moeilijk</label>
      </p>
    `);
    $(".control-button").text("Ok");
    $(".question").text("Moeilijkheid");
    anime({
      targets: ".w3-display-middle",
      duration: Duration.card,
      opacity: 1,
      left: "50%",
      easing: "easeOutQuart",
      complete: function(){
        anime({
          targets: ".control-button",
          duration: 300,
          opacity: 1,
          easing: "linear"
        });
      }
    });
    return;
  }

  if (getCookie("answer" + q) == "good") {
    $.getJSON("./config.json", function(data){
      var url = new URL(document.location.href);
      var q = url.searchParams.get("q");

      if (data.questions[getCookie("difficulty")][q]) {
        var data = data.questions[getCookie("difficulty")][q];

        $(".letter").text(data.letter);
        $("form").hide();
        $(".good").show();
      }
    });
  }

  if (getCookie("answer" + q) == "wrong") {
    $("form").hide();
    $(".wrong").show();
  }

  $.getJSON("./config.json", function(data) {
    //console.log(data.questions[q]);
    console.log(data);
    if (data.questions[getCookie("difficulty")][q]) {
      var question = data.questions[getCookie("difficulty")][q];
      $(".question").text(question.question);

      for (var key in question.options) {
        var option = question.options[key];

        //console.log(key, option);

        $(".options").prepend(`
          <p>
            <input class="w3-radio" type="radio" name="option" value="`+key+`" required>
            <label>`+option+`</label>
          </p>
        `);
      }
    }
    anime({
      targets: ".w3-display-middle",
      duration: Duration.card,
      opacity: 1,
      left: "50%",
      easing: "easeOutQuart",
      complete: function(){
        if (data.questions[getCookie("difficulty")][q]) {
          //$(".control-button").fadeIn(300);
          anime({
            targets: ".control-button",
            duration: 300,
            opacity: 1,
            easing: "linear"
          })
        }
      }
    });
  });
});

function check() {
  finalAnswer = document.forms["answers"]["option"].value;

  if (finalAnswer == "easy" || finalAnswer == "hard") {
    setCookie("difficulty", finalAnswer, 1);
    goto(document.location.href);
    return;
  }

  $.getJSON("./config.json", function(data){
    var url = new URL(document.location.href);
    var q = url.searchParams.get("q");

    //console.log(data.questions[q]);

    if (data.questions[getCookie("difficulty")][q]) {
      var data = data.questions[getCookie("difficulty")][q];

      anime({
        targets: ".w3-display-middle",
        left: "200%",
        easing: "easeInQuart",
        duration: Duration.card,
        direction: "alternate",
        loop: 1,
        loopComplete: function(){
          console.log(finalAnswer, data.answer);

          $("form").hide();

          if (finalAnswer == data.answer) {
            $(".letter").text(data.letter);
            $(".good").show();
            setCookie("answer" + q, "good", 2);
          } else {
            $(".wrong").show();
            setCookie("answer" + q, "wrong", 2);
          }
        }
      });
    }
  });
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname,cvalue,exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";";
}

function delete_cookie( name ) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function reset() {
  delete_cookie("answer");
  for (var i = 0; i < 100; i++) {
    delete_cookie("answer" + i);
  }
  delete_cookie('difficulty');
  goto(document.location.href);
}

function goto(url) {
  anime({
    targets: ".w3-display-middle",
    left: "200%",
    easing: "easeInQuart",
    duration: Duration.card,
    complete: function(){
      document.location.href = url;
    }
  });
}

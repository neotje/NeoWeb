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

    $(".question").text("Moeilijkheid");
    $(".w3-display-middle").fadeIn(300);
    return;
  }

  if (getCookie("answer" + q) == "good") {
    $.getJSON("./config.json", function(data){
      var url = new URL(document.location.href);
      var q = url.searchParams.get("q");

      if (data.questions[getCookie("difficulty")][q]) {
        var data = data.questions[getCookie("difficulty")][q];

        $("form").hide(300, function() {
          $(".letter").text(data.letter);
          $(".good").show(300);
        });
      }
    });
  }

  if (getCookie("answer" + q) == "wrong") {
    $("form").hide(300, function() {
      $(".wrong").show(300);
    });
  }

  $.getJSON("./config.json", function(data) {
    //console.log(data.questions[q]);
    console.log(data);
    if (data.questions[getCookie("difficulty")][q]) {
      var data = data.questions[getCookie("difficulty")][q];
      $(".question").text(data.question);

      for (var key in data.options) {
        var option = data.options[key];

        //console.log(key, option);

        $(".options").prepend(`
          <p>
            <input class="w3-radio" type="radio" name="option" value="`+key+`">
            <label>`+option+`</label>
          </p>
        `);
      }
    }

    $(".w3-display-middle").fadeIn(300);
  });
});

function check() {
  finalAnswer = document.forms["answers"]["option"].value;

  if (finalAnswer == "easy" || finalAnswer == "hard") {
    setCookie("difficulty", finalAnswer, 1);
    document.location.href = document.location.href;
    return;
  }

  $.getJSON("./config.json", function(data){
    var url = new URL(document.location.href);
    var q = url.searchParams.get("q");

    //console.log(data.questions[q]);

    if (data.questions[getCookie("difficulty")][q]) {
      var data = data.questions[getCookie("difficulty")][q];

      console.log(finalAnswer, data.answer);
      if (finalAnswer == data.answer) {
        $("form").hide(300, function() {
          $(".letter").text(data.letter);
          $(".good").show(300);
        });

        setCookie("answer" + q, "good", 2);
      } else {
        $("form").hide(300, function() {
          $(".wrong").show(300);
        });

        setCookie("answer" + q, "wrong", 2);
      }
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
}

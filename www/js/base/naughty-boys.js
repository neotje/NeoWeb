const naughty = new function() {
  var keys = {};
  var combinations = [
    ["Control", "Shift", "J"],
    ["Control", "J"],
    ["F12"],
    ["Control", "Shift", "K"],
    ["Control", "K"],
  ];

  var specialAccess = [
    "neotje111@gmail.com"
  ];

  this.getKeys = function() {
    return keys;
  }


  $.getJSON("./config.json", function(config) {
    if (config.naughtyBoys) {
      document.addEventListener("keydown", keyDown, false);
      document.addEventListener("keyup", keyUp, false);

      $(window).resize(function() {
        if (user.current() && specialAccess.includes(user.current().email)) {
          console.log("Welcome back master");
          notifier.show("Special access granted", "You have access to developer tools", 5000, "green");

          document.removeEventListener("keydown", keyDown);
          document.removeEventListener("keyup", keyUp);
          $(window).unbind("resize");
        } else {
          console.log("naughty boy detected");
          $("body").html("you sneaky bastard!");
          return;
        }
      })
    }
  });

  function keyDown(e) {
    keys[e.key] = true;

    for (let comb of combinations) {
      var hit = false;

      for (let cKey of comb) {
        if (keys[cKey] == true) {
          hit = true;
        } else {
          hit = false;
          break;
        }
      }

      if (hit == true && user.current() && specialAccess.includes(user.current().email)) {
        console.log("Welcome back master");
        notifier.show("Special access granted", "You have access to developer tools", 5000, "green");

        document.removeEventListener("keydown", keyDown);
        document.removeEventListener("keyup", keyUp);
        $(window).unbind("resize");

        return;
      }

      if (hit == true) {
        console.log("naughty boy detected");
        $("body").html("you sneaky bastard!");
        return;
      }
    }
  }

  function keyUp(e) {
    keys[e.key] = false;
  }
}
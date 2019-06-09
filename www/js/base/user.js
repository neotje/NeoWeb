firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    user.currrent = user
  } else {
    $.getJSON("./config.json", function(data) {
      if (data.user.required) {
        user.showAuthForm();
      }
    });
  }
});

$(document).ready(function() {
  $("#user").hide();

  $("#user .container .topMenu .login").click(function() {
    user.formSwitchTo("login");
  });
  $("#user .container .topMenu .register").click(function() {
    user.formSwitchTo("register");
  });
})

const user = new function() {
  let This = this;
  this.current;

  this.formSwitchTo = function(form) {
    if (form == "login") {
      $("#user .container .topMenu .login").css("border-bottom-color", "var(--Secondary");
      $("#user .container .topMenu .register").css("border-bottom-color", "white");

      $("#user .container .forms .register").hide(300, function() {
        $("#user .container .forms .login").show(300);
      });
    }
    if (form == "register") {
      $("#user .container .topMenu .register").css("border-bottom-color", "var(--Secondary");
      $("#user .container .topMenu .login").css("border-bottom-color", "white");

      $("#user .container .forms .login").hide(300, function() {
        $("#user .container .forms .register").show(300);
      });
    }
  }

  this.showAuthForm = function() {
    This.formSwitchTo("login");
    $("#user").show(300);
    topMenu.showTopMenuCloseAuthBtn();
  }

  this.hideAuthForm = function() {
    $("#user").hide(300);
    topMenu.showTopMenuAuthBtn();
  }
}
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
  $("#topMenu .authBtn").hide();
  $("#topMenu .user").hide();
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

      $("#user .container .forms .register").hide();
      $("#user .container .forms .login").show();
    }
    if (form == "register") {
      $("#user .container .topMenu .register").css("border-bottom-color", "var(--Secondary");
      $("#user .container .topMenu .login").css("border-bottom-color", "white");

      $("#user .container .forms .login").hide();
      $("#user .container .forms .register").show();
    }
  }

  this.showAuthForm = function() {
    This.formSwitchTo("login");
    $("#user").show();
  }
}
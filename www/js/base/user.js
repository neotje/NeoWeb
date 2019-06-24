const user = new function() {
  var db = firebase.firestore();
  var provider = new firebase.auth.GoogleAuthProvider();

  let This = this;
  this.current = function() {
    return firebase.auth().currentUser;
  }

  this.doc = function() {
    return db.collection('users').doc(this.current().uid);
  }

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

  this.showAuthForm = function(callback = function() {}) {
    This.formSwitchTo("login");
    $("#user").show(300, callback);
  }

  this.hideAuthForm = function(callback = function() {}) {
    $("#user").hide(300, callback);
  }

  this.login = function() {
    var email = $("#user .container .forms .login .email").val();
    var password = $("#user .container .forms .login .password").val();

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      notifier.show("Login Failed", "Please try again.", 10000, "red");
    }).then(function() {
      notifier.show("Login Succesfull", "", 10000, "green");
    });
  }

  this.google = function() {
    firebase.auth().signInWithPopup(provider).then(function(result) {
      notifier.show("Login Succesfull", "", 6000, "green");
      user.hideAuthForm();
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      notifier.show("Login Failed", errorMessage, 10000, "red");
    });
  }

  this.logout = function() {
    firebase.auth().signOut().then(function() {
      $.getJSON("./config.json", function(data) {
        if (data.user.required) {
          window.location.href = "/";
        } else {
          window.location.href = window.location.pathname;
        }
      });
    }).catch(function(error) {

    });
  }

  this.register = function() {
    var email = $("#user .container .forms .register .email").val();
    var password = $("#user .container .forms .register .password").val();
    var rPassword = $("#user .container .forms .register .rPassword").val();

    if (password == rPassword) {
      firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        notifier.show("Registration Failed", "Please try again.", 10000, "red");
      });
    } else {
      notifier.show("password", "Please check your password.", 10000, "red");
    }
  }
}

firebase.auth().onAuthStateChanged(function(loginUser) {
  if (loginUser) {
    user.currrent = loginUser;
    user.hideAuthForm();

    if (loginUser.emailVerified == false) {
      notifier.show("Email verification", "Please check your inbox!", 10000, "red");
      loginUser.sendEmailVerification();
      firebase.auth().signOut();
      user.showAuthForm();
      topMenu.showTopMenuCloseAuthBtn();
    }
  } else {
    $.getJSON("./config.json", function(data) {
      if (data.user.required) {
        user.showAuthForm();
        notifier.show("Authentication required", "This page requires you to login or register.", 10000);
      }
    });
  }
});

$(document).ready(function() {
  $("form").submit(function(e) {
    e.preventDefault();
  });

  $("#user").hide();

  $("#user .container .topMenu .login").click(function() {
    user.formSwitchTo("login");
  });
  $("#user .container .topMenu .register").click(function() {
    user.formSwitchTo("register");
  });

  $("#user .container .forms .login").submit(function() {
    user.login();
  });
  $("#user .container .forms .register").submit(function() {
    user.register();
  });
});
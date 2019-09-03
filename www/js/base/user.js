const user = new function() {
  var db = firebase.firestore();
  var provider = new firebase.auth.GoogleAuthProvider();

  function checkURL(url) {
    return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
  }

  let This = this;
  this.current = function() {
    return firebase.auth().currentUser;
  }

  this.doc = function() {
    return db.collection('users').doc(this.current().uid);
  }

  this.formSwitchTo = function(form, instant = false) {
    var duration1 = 75;
    var duration2 = 150;

    if (instant) {
      duration1 = 1;
      duration2 = 1;
    }
    if (form == "login") {
      $("#user .container .topMenu .login").css("border-bottom-color", "var(--Secondary");
      $("#user .container .topMenu .register").css("border-bottom-color", "white");

      $("#user .container .forms .register").fadeOut(duration1, function() {
        $("#user .container .forms .login").fadeIn(duration2);
      });
    }
    if (form == "register") {
      $("#user .container .topMenu .register").css("border-bottom-color", "var(--Secondary");
      $("#user .container .topMenu .login").css("border-bottom-color", "white");

      $("#user .container .forms .login").fadeOut(duration1, function() {
        $("#user .container .forms .register").fadeIn(duration2);
      });
    }
  }

  this.showAuthForm = function(callback = function() {}) {
    This.formSwitchTo("login", true);
    $("#user").css("opacity", "0");
    $("#user").show();

    anime({
      targets: "#user",
      opacity: [0,1],
      duration: 250,
      easing: "cubicBezier(.4, 0, .2, 1)",
      complete: callback
    });
  }

  this.hideAuthForm = function(callback = function() {}) {
    anime({
      targets: "#user",
      opacity: [1,0],
      duration: 200,
      easing: "cubicBezier(.4, 0, .2, 1)",
      complete: function(){
        $("#user").hide();
        callback();
      }
    });
  }

  this.login = function() {
    var email = $("#user .container .forms .login .email").val();
    var password = $("#user .container .forms .login .password").val();

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      notifier.show("Login Failed", "Please try again. <a style='color: blue; text-decoration: underline;' onclick='user.forgotPassword()'>Forgot password</a>", 10000, "red");
      console.error(error);
    }).then(function() {
      if (firebase.auth().currentUser) {
        notifier.show("Login Succesfull", "", 10000, "green");
      }
    });
  }

  this.forgotPassword = function() {
    var email = $("#user .container .forms .login .email").val();

    firebase.auth().sendPasswordResetEmail(email)
      .then(function() {
        notifier.show("Check your Mailbox", "Password reset mail has been send to: " + email, 10000, "green");
      })
      .catch(function(error) {
        console.error(error);
        notifier.show("Reset password request error", "Check if you filled in the correct email or this email doesn't have a account registered.", 10000, "red");
      });
  }

  this.newPassword = function() {
    var password = $("#settings .passwordForm .newPassword").val()
    this.current().updatePassword(password).then(function() {
      notifier.show("Password changed", "", 10000, "green");
    }).catch(function(error) {
      console.error(error);

      if (error.code == "auth/weak-password") {
        notifier.show("Password change error", "password is too weak.", 10000, "red");
      }
      if (error.code == "auth/requires-recent-login") {
        notifier.show("Password change error", "Please logout and then login. for security reasons.", 10000, "red");
      }
    });
  }

  this.updateProfile = function() {
    var name = $("#settings .profileForm .displayName").val();
    var photo = $("#settings .profileForm .photoURL").val();

    if (checkURL(photo)) {
      this.current().updateProfile({
        displayName: name,
        photoURL: photo
      }).then(function() {
        notifier.show("Profile update Succesfull!", "", 10000, "green");

        topMenu.showTopMenuUser();
      }, function(error) {
        notifier.show("Something went wrong", "", 10000, "red");

      });
    } else {
      notifier.show("Photo URL error", "Check if you have a valid URL to a photo. suported formats: jpeg, jpg, gif or png", 10000, "red");

    }
  }

  this.google = function() {
    firebase.auth().signInWithPopup(provider).then(function(result) {
      notifier.show("Login Succesfull", "", 6000, "green");
      user.hideAuthForm();
    }).catch(function(error) {
      console.error(error);

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
      console.error(error);

    });
  }

  this.register = function() {
    var email = $("#user .container .forms .register .email").val();
    var password = $("#user .container .forms .register .password").val();
    var rPassword = $("#user .container .forms .register .rPassword").val();

    if (password == rPassword) {
      firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        console.error(error);

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

    Sentry.configureScope((scope) => {
      scope.setUser({
        "email": user.current().email,
        "id": user.current().uid
      });
    });

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

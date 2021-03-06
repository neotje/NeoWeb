firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    topMenu.showTopMenuUser();
  } else {
    $.getJSON("./config.json", function(data) {
      if (data.user.required == false) {
        topMenu.showTopMenuAuthBtn();
      }
    });
  }
});

const topMenu = new function() {
  this.showTopMenuAuthBtn = function() {
    $("#topMenu .user").hide(300);
    $("#topMenu .authCloseBtn").hide(300, function() {
      $("#topMenu .authBtn").show(300);
    });
  }

  this.showTopMenuCloseAuthBtn = function() {
    $("#topMenu .user").hide(300);
    $("#topMenu .authBtn").hide(300, function() {
      $("#topMenu .authCloseBtn").show(300);
    });
  }

  this.showTopMenuUser = function() {
    if (user.current().photoURL == null || user.current().photoURL == "") {} else {
      $("#topMenu .user img").attr("src", user.current().photoURL);

    }

    $("#topMenu .user .name").text(user.current().displayName);

    $("#topMenu .authCloseBtn").hide(300);
    $("#topMenu .authBtn").hide(300, function() {
      $("#topMenu .user").show(300);
    });
  }
}

$(document).ready(function() {
  $("#topMenu .authBtn").hide();
  $("#topMenu .authCloseBtn").hide();
  $("#topMenu .user").hide();

  $("#topMenu .authBtn").click(function() {
    topMenu.showTopMenuCloseAuthBtn();
    user.showAuthForm();
  });
  $("#topMenu .authCloseBtn").click(function() {
    user.hideAuthForm();
    topMenu.showTopMenuAuthBtn();
  });
});
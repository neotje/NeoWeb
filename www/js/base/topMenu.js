firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    topMenu.showTopMenuUser();
  } else {
    $.getJSON("./config.json", function(data) {
      if (data.user.required == false) {
        topMenu.showTopMenuButton();
      }
    });
  }
});

$(document).ready(function() {
  $("#topMenu .authBtn").click(user.showAuthForm);
});

const topMenu = new function() {
  this.showTopMenuButton = function() {
    $("#topMenu .user").hide();
    $("#topMenu .authBtn").show();
  }

  this.showTopMenuUser = function() {
    $("#topMenu .user").show();
    $("#topMenu .authBtn").hide();
  }
}
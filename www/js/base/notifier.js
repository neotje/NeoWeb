$(document).ready(function() {
  $("body").append("<div id='notify'></div>")
});

const notifier = new function() {
  let count = 0;
  this.activeNotifications = [];
  let lastID = "";

  this.show = function(title, message, duration = 10000, color) {
    var id = "n" + count;
    count++;

    var newN = new notification(title, message, duration, color, id);
    newN.show();

    this.activeNotifications.push(newN);
    lastID = id;

    return newN;
  }

  this.get = function(id) {
    for (var n in this.activeNotifications) {
      if (n.id == id) {
        return n;
      }
    }
    return false;
  }
}

class notification {
  constructor(title, message, duration, color, id) {
    this.title = title;
    this.message = message;
    this.duration = duration;
    this.color = color;
    this.id = id;
  }

  show() {
    let This = this;

    $("#notify")[0].insertAdjacentHTML("beforeend", "<div id='" + this.id + "' style='color: " + this.color + "'><h6>" + this.title + "</h4><p>" + this.message + "</p></div>");
    $("#" + this.id).click(this.remove);

    setTimeout(function() {
      This.remove(This);
    }, this.duration);
  }

  remove(This) {
    console.log("removing", this.id);
    anime({
      targets: "#" + This.id,
      duration: 400,
      scale: 0,
      opacity: 0,
      easing: "cubicBezier(.25, .8, .25, 1)",
      complete: function() {
        for (var i = 0; i < notifier.activeNotifications.length; i++) {
          var notification = notifier.activeNotifications[i];

          if (notification.id == This.id) {
            notifier.activeNotifications.splice(i, 1);
          }
        }

        var element = document.getElementById(This.id);
        if (!element) return;
        element.parentNode.removeChild(element);
      }
    });
  }
}
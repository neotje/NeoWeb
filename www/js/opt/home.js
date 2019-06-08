const home = new function() {
  this.genSize = function() {
    $("#home .cover").height((0.75 * $(window).height()) + "px");
    $("#home .container .featured .items").height((0.9 * $("#home .container .featured .items .item").width()) + "px");
  }

  this.genFeatured = function() {
    $.getJSON("./config.json", function(data) {
      for (let item in data.featured) {
        var props = data.featured[item];
        var elem = $("#home .container .featured .items ." + item);

        elem.attr("onclick", "window.location.href = '" + props.link + "'")
        elem.children("img").attr("src", props.img);
        elem.children("h6").text(props.title);
        elem.children("p").text(props.description);
      }
    });
  }
}

$(window).resize(function() {
  home.genSize()
});

$(document).ready(function() {
  home.genFeatured();
});

scriptManager.onload(function() {
  home.genSize();
  anime({
    targets: "#home .cover img",
    duration: 3000,
    opacity: 1,
    easing: "cubicBezier(.25, .8, .25, 1)"
  });
});
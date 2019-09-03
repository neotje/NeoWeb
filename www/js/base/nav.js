const nav = new function () {
  this.gotoProject = function(url, elem){
    var $item = $("."+elem + " img");
    console.log(elem);
    console.log($item);
    $item
      .css("width", $item.width() + "px")
      .css("height", $item.height() + "px")
      .css("position", "absolute")
      .css("z-index", "1000")
      .css("top", $("."+elem + " img")[0].offsetTop + "px")
      .css("left", $("."+elem + " img")[0].offsetLeft + "px");

    anime({
      targets: "."+elem + " img",
      width: "100vw",
      height: "100vh",
      top: document.scrollingElement.scrollTop,
      left: 0,
      //translateX: "-50%",
      //translateY: "-50%",
      easing: "cubicBezier(.4, 0, .2, 1)",
      duration: 250,
      complete: function(){
        anime({
          targets: "body",
          opacity: [1, 0],
          easing: "cubicBezier(.4, 0, .2, 1)",
          duration: 100,
          complete: function () {
            window.location.href = url;
          }
        });
      }
    });
  };
};

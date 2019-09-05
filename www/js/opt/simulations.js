$(document).ready(function() {
  sims.genSize();
  sims.genList();
});
$(window).resize(function() {
  sims.genSize();
});

const sims = new function() {

  this.loadSim = function(url) {
    $("#simulations iframe")[0].src = url + "?var=" + Math.random();
    window.scrollTo(0, $("#simulations iframe")[0].offsetTop - 56)
  }

  this.genSize = function() {
    $("#simulations .grid .item").height((0.9 * $("#simulations .grid .item").width()) + "px");
  }

  this.genList = function() {
    $.getJSON("./config.json", function(data) {
      var i = 0;
      for (let title in data.sims) {
        var props = data.sims[title];

        let itemClass = "item-" + i;
        let url = props.link

        var html = "<div class='item item-"+i+"'";
        html += "><img src='";
        html += props.img;
        html += "'><h6>";
        html += title;
        html += "</h6>";
        html += "<p class='subtext'>";
        html += props.description;
        html += "</p></div>";

        var $item = $(html);
        //$item.off("click");
        $item.click(function(){
          sims.loadSim(url);
        });
        $("#simulations .grid").append($item);

        i++;
      }
    });
  }
}

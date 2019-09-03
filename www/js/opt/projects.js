$(document).ready(function() {
  projects.genSize();
  projects.genList();
});
$(window).resize(function() {
  projects.genSize();
});

const projects = new function() {
  this.genSize = function() {
    $("#projects .grid .item").height((0.9 * $("#projects .grid .item").width()) + "px");
  }

  this.genList = function() {
    $.getJSON("./config.json", function(data) {
      var i = 0;
      for (let title in data.projects) {
        var props = data.projects[title];

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
          nav.gotoProject(url, itemClass);
        });
        $("#projects .grid").append($item);

        i++;
      }
    });
  }
}

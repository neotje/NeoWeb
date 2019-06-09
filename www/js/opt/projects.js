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
      for (let title in data.projects) {
        var props = data.projects[title];

        var html = "<div class='item' onclick='window.location.href = \"";
        html += props.link;
        html += "\"'><img src='";
        html += props.img;
        html += "'><h6>";
        html += title;
        html += "</h6>";
        html += "<p class='subtext'>";
        html += props.description;
        html += "</p></div>";

        $("#projects .grid").append(html);
      }
    });
  }
}
var link = "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UC1IOQj8KcZv4N5OU-ja2dYA&maxResults=50&order=date&safeSearch=none&type=video&key=AIzaSyBshVsKztLIRLbwmLELrOZbp7J5Wp0ufqg";
var seekOffset;

$(document).ready(function() {
  seekOffset = $(window).height() - $("#topMenu").height() - ($("#videos h2").height()) - $("#footer").height();

  $.getJSON(link, function(response) {
    var items = response.items;

    for (let item of items) {
      var id = item.id.videoId;
      var imgSrc = item.snippet.thumbnails.medium.url;
      var title = item.snippet.title;
      var link = "https://www.youtube.com/watch?v=" + id;

      $("#videos .grid")
        .append("<div id='" + id + "'></div>")

        .children("#" + id)
        .addClass("item")
        .attr("onclick", "window.open('" + link + "', '_blank')")
        .attr("style", "opacity:0; transform: translateY(50px);")
        .append("<img/>")

        .children("img")
        .attr("src", imgSrc)

        .parent()
        .append("<h6></h6>")

        .children("h6")
        .text(title);
    }

    var animation = anime({
      targets: "#videos .grid .item",
      opacity: 1,
      autoplay: false,
      delay: anime.stagger(100),
      translateY: 0
    });

    animation.seek(animation.duration * (($(document).scrollTop() + seekOffset) / ($(document).height() - $(window).height() + seekOffset)));

    $(document).scroll(function() {
      animation.seek(animation.duration * (($(document).scrollTop() + seekOffset) / ($(document).height() - $(window).height() + seekOffset)));
    });
  });
});
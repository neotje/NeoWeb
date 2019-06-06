const scriptManager = new function() {
  var baseScriptsURL = "/js/base/";
  var optScriptsURL = "/js/opt/";
  var libScriptsURL = "/js/lib/";

  var baseScriptsToLoad = [
    "topMenu.js"
  ];
  var libScriptsToLoad = [
    "anime.js"
  ];
  var styleSheetsToLoad =[
    "/css/base/color.css",
    "/css/base/typography.css",
    "/css/base/normalize.css"
  ]

  function load() {
    // load base script.
    for (script of baseScriptsToLoad) {
      $.getScript(baseScriptsURL + script)
        .done(function() {
          console.log("Loaded: " + script);
        })
        .fail(function() {
          console.error("Failed to load: " + script);
        })
    }

    // load lib scripts
    for (script of libScriptsToLoad) {
      $.getScript(libScriptsURL + script)
        .done(function() {
          console.log("Loaded: " + script);
        })
        .fail(function() {
          console.error("Failed to load: " + script);
        })
    }

    for (url of styleSheetsToLoad) {
      var link = document.createElement("link");
      link.href = url;
      link.type = "text/css";
      link.rel = "stylesheet";

      document.getElementsByTagName("head")[0].appendChild(link);
    }
  }

  load();

  this.onload = function() {}

  this.reload = function() {
    load();

    this.onload();
  }

  this.loadOptScript = function(script, callback = function() {}) {
    $.getScript(optScriptsURL + script)
      .done(function() {
        console.log("Loaded: " + script);
        callback();
      })
      .fail(function() {
        console.error("Failed to load: " + script);
      });
  }

  this.syncLoadOptScript = function(script) {
    $.ajax({
      url: optScriptsURL + script,
      dataType: "script",
      async: false
    });
  }

  this.loadStyleSheet = function(url) {
    var link = document.createElement("link");
    link.href = url;
    link.type = "text/css";
    link.rel = "stylesheet";

    document.getElementsByTagName("head")[0].appendChild(link);
  }
}

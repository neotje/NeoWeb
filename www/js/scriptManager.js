// hide body
$("html").hide();

const scriptManager = new function() {
  var onloadCallbacks = [
    function() {
      console.log("test");
    }
  ]

  var baseScriptsURL = "/js/base/";
  var optScriptsURL = "/js/opt/";
  var libScriptsURL = "/js/lib/";

  var baseScriptsToLoad = [
    "topMenu.js",
    "user.js"
  ];
  var libScriptsToLoad = [
    "anime.js",
    "firebase.js"
  ];
  var CDNscriptsToload = [
    "https://www.gstatic.com/firebasejs/6.1.1/firebase-app.js",
    "https://www.gstatic.com/firebasejs/6.1.1/firebase-auth.js",
    "https://www.gstatic.com/firebasejs/6.1.1/firebase-firestore.js"
  ]
  var styleSheetsToLoad = [
    "https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "/css/base/color.css",
    "/css/base/typography.css",
    "/css/base/normalize.css",
    "/css/base/topMenu.css"
  ]

  function dispatchOnloadEvent() {
    console.log("event happened");
    console.log(onloadCallbacks);
    for (callback of onloadCallbacks) {
      callback();
    }
  }

  function load() {
    let This = this;

    // disable ajax async function.
    $.ajaxSetup({
      async: true
    });
    var urlList = []

    $.getJSON(window.location.pathname + "config.json", function(data) {
        // load stylesheets
        for (url of styleSheetsToLoad.concat(data.stylesheets)) {
          var link = document.createElement("link");
          link.href = url;
          link.type = "text/css";
          link.rel = "stylesheet";

          document.getElementsByTagName("head")[0].appendChild(link);
          console.log("Loaded stylesheet: ", url);
        }

        // add cdn script to list
        for (script of CDNscriptsToload) {
          urlList.push(script);
        }
        // add lib scripts to list
        for (script of libScriptsToLoad) {
          urlList.push(libScriptsURL + script);
        }
        // add lib scripts defined in config
        for (script of data.scripts.lib) {
          urlList.push(libScriptsURL + script)
        }
        // add base script to list
        for (script of baseScriptsToLoad) {
          urlList.push(baseScriptsURL + script);
        }
        // add opt script to list
        for (script of data.scripts.opt) {
          urlList.push(optScriptsURL + script);
        }

        var gets = [];

        $.each(urlList, function(i) {
          gets.push($.getScript(this));
        });

        $.when.apply($, gets).then(dispatchOnloadEvent);
      })
      .fail(function() {
        // load stylesheets
        for (url of styleSheetsToLoad) {
          var link = document.createElement("link");
          link.href = url;
          link.type = "text/css";
          link.rel = "stylesheet";

          document.getElementsByTagName("head")[0].appendChild(link);
          console.log("Loaded stylesheet: ", url);
        }

        // add cdn script to list
        for (script of CDNscriptsToload) {
          urlList.push(script);
        }
        // add lib scripts to list
        for (script of libScriptsToLoad) {
          urlList.push(libScriptsURL + script);
        }
        // add base script to list
        for (script of baseScriptsToLoad) {
          urlList.push(baseScriptsURL + script);
        }

        $.each(urlList, function(i) {
          gets.push($.getScript(this));
        });

        $.when.apply($, gets).then(dispatchOnloadEvent);
      });

    // reset ajaxSetup
    $.ajaxSetup({
      async: true
    });
  }

  this.onload = function(callback) {
    onloadCallbacks.push(callback);
  }

  this.reload = function() {
    // hide body
    $("html").hide();

    load();

    this.onload(function() {
      // show body
      $("html").show();
    });
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

scriptManager.reload();
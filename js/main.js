(function() {
  var myGraph = new Graph({
    canvasId: 'paint',
    xlabel: 'Depth(mm)',
    ylabel: 'Force(N)',
    maxX: 12,
    maxY: 15,
    unitsPerTick: 1
  });
  log('myGraph');
  log(myGraph);

  window.exportData = function exportData() {
    log('exportData');
    var plots = myGraph.exportData();
    var filename = document.getElementById('filename').value || 'force';
    alasql("SELECT * INTO CSV('" + filename + ".csv') FROM ?", [plots]);
  };

  window.clearUserInput = function clearUserInput() {
    log("clearUserInput");
    myGraph.clearUserInput();
  }

  document.addEventListener("mouseout", function(e) {
    e = e ? e : window.event;
    var from = e.relatedTarget || e.toElement;
    if (!from || from.nodeName == "HTML") {
      log("left window");
      myGraph.canvas.removeEventListener('mousemove', myGraph.onPaintRef, false);
    }
  });

  /**
   * Remove first 3 row
   *
   * @param {array} arr - The array of the plots from csv
   */
  function removeHeader(arr) {
    for(i = 0; i < 3; i++) {
      arr.shift();
    }
    return arr
  };

  window.loadFile = function loadFile(event) {
    log('event');
    log(event);
    var files = event.target.files;
    var filename = files[0].name;
    alasql('SELECT * FROM CSV(?, {headers: false})', [event],function(data) {
      // Process data here
      log(data);
      arr = removeHeader(data);
      log(arr);
      myGraph.drawLineFromArray(filename, arr);
    });
  };
}());

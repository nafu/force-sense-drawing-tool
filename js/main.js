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
    var plots = [].concat(myGraph.plots);
    log('exportData');
    log('plots = ', plots);
    log('myGraph.plots = ', myGraph.plots);
    plots.unshift(['x', 'y']);
    var filename = 'force';
    alasql("SELECT * INTO CSV('" + filename + ".csv') FROM ?", [plots]);
    plots = []
  };

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
    alasql('SELECT * FROM CSV(?, {headers: false})', [event],function(data) {
      // Process data here
      log(data);
      arr = removeHeader(data);
      log(arr);
      myGraph.drawLineFromArray(arr);
    });
  };
}());

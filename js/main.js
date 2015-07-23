(function() {
  function Graph(config) {
    // user defined properties

    // canvas
    this.canvas = document.getElementById(config.canvasId);
    var sketch = document.querySelector('#sketch');
    var sketch_style = getComputedStyle(sketch);
    this.canvas.width = parseInt(sketch_style.getPropertyValue('width'));
    this.canvas.height = parseInt(sketch_style.getPropertyValue('height'));

    // graph
    this.xlabel = config.xlabel;
    this.ylabel = config.ylabel;
    this.maxX = config.maxX;
    this.maxY = config.maxY;
    this.unitsPerTick = config.unitsPerTick;
    this.originX = 50;
    this.originY = this.canvas.height - 50;

    // user interaction
    this.mouse = {x: 0, y: 0};
    this.last_mouse = {x: 0, y: 0};

    // user drawing plots
    this.plots = []

    // constants
    this.minX = 0;
    this.minY = 0;
    this.axisColor = '#aaa';
    this.font = '8pt Calibri';
    this.tickSize = 20;
    this.strokeStyle = 'blue'

    // relationships
    graphWidth = this.canvas.width - this.originX;
    graphHeight = this.originY;
    this.context = this.canvas.getContext('2d')
    this.rangeX = this.maxX - this.minX;
    this.rangeY = this.maxY - this.minY;
    this.unitX = this.canvas.width / this.rangeX;
    this.unitY = this.canvas.height / this.rangeY;
    this.centerX = Math.round(graphWidth / 2) + this.originX;
    this.centerY = Math.round(graphHeight / 2);
    this.scaleX = graphWidth / this.rangeX;
    this.scaleY = graphHeight / this.rangeY;

    var _self = this;
    this.setupInitialContext();
    this.constructEventListner(_self);
    this.drawXAxis();
  }

  Graph.prototype.setupInitialContext = function() {
    var context = this.context;
    context.lineWidth = 5;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.strokeStyle = this.strokeStyle;
  }

  Graph.prototype.constructEventListner = function(_self) {
    /* Mouse Capturing Work */
    this.canvas.addEventListener('mousemove', function(e) {
      log(_self.last_mouse);
      _self.last_mouse.x = _self.mouse.x;
      _self.last_mouse.y = _self.mouse.y;

      _self.mouse.x = e.pageX - this.offsetLeft;
      _self.mouse.y = e.pageY - this.offsetTop;
    }, false);

    this.onPaintRef = _self.onPaint.bind(_self);

    // Touch
    this.canvas.addEventListener('touchmove', _self.onPaintRef, false);

    // Mouse
    this.canvas.addEventListener('mousedown', function() {
      log('canvas mousedown')
      this.addEventListener('mousemove', _self.onPaintRef, false);
    }, false);
    this.canvas.addEventListener('mouseup', function() {
      log('canvas mouseup')
      this.removeEventListener('mousemove', _self.onPaintRef, false);
    }, false);
    this.canvas.addEventListener('mouseout', function() {
      log('canvas mouseout')
      this.removeEventListener('mousemove', _self.onPaintRef, false);
    }, false);
  }

  Graph.prototype.onPaint = function() {
    var context = this.context;
    context.beginPath();
    context.moveTo(this.last_mouse.x, this.last_mouse.y);
    context.lineTo(this.mouse.x, this.mouse.y);
    context.closePath();
    context.stroke();
    log('mouse.x = ' + this.mouse.x);
    log('mouse.y = ' + this.mouse.y);
    this.plots.push([this.mouse.x, 600 - this.mouse.y]);
    log('plots = ' + this.plots);
  }

  Graph.prototype.drawXAxis = function() {
    log('drawXAxis');
    var axisX = this.originX;
    var axisY = this.originY;
    var context = this.context;
    context.save();
    context.beginPath();
    context.moveTo(axisX, axisY);
    context.lineTo(this.canvas.width, this.originY);
    context.strokeStyle = this.axisColor;
    context.lineWidth = 2;
    context.stroke();

    // draw tick marks
    var xPosIncrement = this.unitsPerTick * this.unitX;
    var xPos = axisX;
    var unit = 0;
    context.font = this.font;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    log('xPos');
    log(xPos);
    log('unit');
    log(unit);
    while(xPos < this.canvas.width) {
      log('while');
      context.moveTo(xPos, axisY - this.tickSize / 2);
      context.lineTo(xPos, axisY);
      context.stroke();
      context.fillText(unit, xPos, axisY + 3);
      unit += this.unitsPerTick;
      xPos = Math.round(xPos + xPosIncrement);
      log('while')
      log('xPos');
      log(xPos);
      log('unit');
      log(unit);
    }

    // draw x-axis label
    context.fillText(this.xlabel, this.centerX, axisY + 3 + 15)

    context.restore();
  }

  Graph.prototype.drawLineFromArray = function(arr) {
    var context = this.context;
    // Change strokeStyle for imported data
    context.strokeStyle = this.getRandomColor();
    context.beginPath();
    log('arr[0]');
    log(arr[0]);
    context.moveTo(this.convertXToGraphPoint(arr[0]['1']), this.convertYToGraphPoint(arr[0]['3']));
    arr.shift();
    for(i = 0; i < arr.length; i++) {
      var dot = arr[i]
      log('dot');
      log(dot);
      log("dot['1'], dot['3']");
      log(dot['1'] + ',' + dot['3']);
      // Check if data is empty because perforation data have empty data at last line
      if(dot['1'].length == 0 || dot['3'].length == 0) { continue; }
      context.lineTo(this.convertXToGraphPoint(dot['1']), this.convertYToGraphPoint(dot['3']));
    }
    context.stroke();
    // Change back strokeStyle as default
    context.strokeStyle = this.strokeStyle;
  };

  Graph.prototype.getRandomColor = function() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  Graph.prototype.convertXToGraphPoint = function(x) {
    // TODO:
    // - Use origin x of coordinates instead of fixed value(147)
    // - Use correct scale according to range of values
    x_origin = 147;
    x_scale = 50;
    return x_origin + (x * x_scale)
  }

  Graph.prototype.convertYToGraphPoint = function(y) {
    // TODO:
    // - Use origin y of coordinates instead of fixed value(512)
    // - Use correct scale according to range of values
    y_origin = 512;
    y_scale = 50;
    return y_origin - (y * y_scale)
  }

  var myGraph = new Graph({
    canvasId: 'paint',
    xlabel: 'Depth(mm)',
    ylabel: 'Force(N)',
    maxX: 10,
    maxY: 10,
    unitsPerTick: 1
  });
  log('myGraph');
  log(myGraph);

  window.exportData = function exportData() {
    log('exportData');
    log('plots = ', plots);
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

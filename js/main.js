(function() {
  function Graph(config) {
    // user defined properties
    this.canvas = document.getElementById(config.canvasId);
    var sketch = document.querySelector('#sketch');
    var sketch_style = getComputedStyle(sketch);
    this.canvas.width = parseInt(sketch_style.getPropertyValue('width'));
    this.canvas.height = parseInt(sketch_style.getPropertyValue('height'));

    this.minX = config.minX;
    this.minY = config.minY;
    this.maxX = config.maxX;
    this.maxY = config.maxY;
    this.unitsPerTick = config.unitsPerTick;

    // constants
    this.axisColor = '#aaa';
    this.font = '8pt Calibri';
    this.tickSize = 20;
    this.strokeStyle = 'blue'

    // relationships
    this.context = this.canvas.getContext('2d')
    this.rangeX = this.maxX - this.minX;
    this.rangeY = this.maxY - this.minY;
    this.unitX = this.canvas.width / this.rangeX;
    this.unitY = this.canvas.height / this.rangeY;
    this.centerX = Math.round(Math.abs(this.minX = this.rangeX) * this.canvas.width);
    this.centerY = Math.round(Math.abs(this.minY = this.rangeY) * this.canvas.height);
    this.iteration = (this.maxX - this.minX) / 1000;
    this.scaleX = this.canvas.width / this.rangeX;
    this.scaleY = this.canvas.height / this.rangeY;

    this.drawImage();

    this.mouse = {x: 0, y: 0};
    this.last_mouse = {x: 0, y: 0};

    this.plots = []

    var _self = this;
    /* Mouse Capturing Work */
    this.canvas.addEventListener('mousemove', function(e) {
      log(_self.last_mouse);
      _self.last_mouse.x = _self.mouse.x;
      _self.last_mouse.y = _self.mouse.y;

      _self.mouse.x = e.pageX - this.offsetLeft;
      _self.mouse.y = e.pageY - this.offsetTop;
    }, false);

    var context = this.context;
    /* Drawing on Paint App */
    context.lineWidth = 5;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.strokeStyle = this.strokeStyle;

    this.onPaintRef = _self.onPaint.bind(_self);
    // Touch
    this.canvas.addEventListener('touchmove', this.onPaintRef, false);

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

  Graph.prototype.drawImage = function() {
    var context = this.context;
    var xy_axis_img = new Image();
    xy_axis_img.onload = function () {
      context.drawImage(xy_axis_img, 10, 50, 600, 523);
    }
    xy_axis_img.src = 'img/xy.png';
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

  var myGraph = new Graph({canvasId: 'paint'});

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

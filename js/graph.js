function Graph(config) {
  // user defined properties

  // canvas
  this.canvas = document.getElementById(config.canvasId);
  var sketch = document.querySelector('#sketch');
  var sketch_style = getComputedStyle(sketch);
  this.canvas.width = parseInt(sketch_style.getPropertyValue('width')) * 2;
  this.canvas.height = parseInt(sketch_style.getPropertyValue('height')) * 2;
  this.canvas.style.width = sketch_style.getPropertyValue('width');
  this.canvas.style.height = sketch_style.getPropertyValue('height');
  log(this.canvas);
  log(this.canvas.style.width);
  log(this.canvas.style.height);

  // graph
  this.xlabel = config.xlabel;
  this.ylabel = config.ylabel;
  this.maxX = config.maxX;
  this.maxY = config.maxY;
  this.unitsPerTick = config.unitsPerTick;
  this.originX = 70;
  this.originY = parseInt(this.canvas.style.height) - 50;

  // user interaction
  this.mouse = {x: 0, y: 0};
  this.last_mouse = {x: 0, y: 0};

  // user drawing plots
  this.plots = []

  // imported plots
  this.imported_plots = []

  // constants
  this.minX = 0;
  this.minY = 0;
  this.axisColor = '#aaa';
  this.font = '8pt Calibri';
  this.tickSize = 20;
  this.strokeStyle = 'blue'
  this.legend_font = '12pt Calibri';

  // relationships
  graphWidth = parseInt(this.canvas.style.width) - this.originX;
  graphHeight = this.originY;
  this.context = this.canvas.getContext('2d');
  this.rangeX = this.maxX - this.minX;
  this.rangeY = this.maxY - this.minY;
  this.unitX = graphWidth / this.rangeX;
  this.unitY = graphHeight / this.rangeY;
  this.centerX = Math.round(graphWidth / 2) + this.originX;
  this.centerY = Math.round(graphHeight / 2);
  this.scaleX = graphWidth / this.rangeX;
  this.scaleY = graphHeight / this.rangeY;
  log('scaleX');
  log(this.scaleX);
  log('scaleY');
  log(this.scaleY);

  var _self = this;
  this.setupInitialContext();
  this.constructEventListner(_self);
  this.drawXAxis();
  this.drawYAxis();
}

Graph.prototype.setupInitialContext = function() {
  var context = this.context;
  context.lineWidth = 5;
  context.lineJoin = 'round';
  context.lineCap = 'round';
  context.strokeStyle = this.strokeStyle;
  context.scale(2, 2);
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
  context.lineTo(parseInt(this.canvas.style.width), this.originY);
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
  while(xPos < parseInt(this.canvas.style.width)) {
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

Graph.prototype.drawYAxis = function() {
  log('drawYAxis');
  var axisX = this.originX;
  var axisY = this.originY;
  var context = this.context;
  context.save();
  context.beginPath();
  context.moveTo(axisX, axisY);
  context.lineTo(axisX, 0);
  context.strokeStyle = this.axisColor;
  context.lineWidth = 2;
  context.stroke();

  // draw tick marks
  var yPosIncrement = this.unitsPerTick * this.unitY;
  log('yPosIncrement')
  log(yPosIncrement)
  var yPos = axisY;
  var unit = 0;
  context.font = this.font;
  context.textAlign = 'right';
  context.textBaseline = 'middle';
  log('yPos');
  log(yPos);
  log('unit');
  log(unit);
  while(yPos > 0) {
    log('while');
    context.moveTo(axisX, yPos);
    context.lineTo(axisX + this.tickSize / 2, yPos);
    context.stroke();
    context.fillText(unit, axisX - 3, yPos);
    unit += this.unitsPerTick;
    yPos = Math.round(yPos - yPosIncrement);
    log('while')
    log('yPos');
    log(yPos);
    log('unit');
    log(unit);
  }

  // draw x-axis label
  context.fillText(this.ylabel, axisX - 3 - 15, this.centerY);

  context.restore();
}

Graph.prototype.drawLineFromArray = function(filename, arr) {
  var context = this.context;
  // Change strokeStyle for imported data
  context.strokeStyle = this.getRandomColor();
  context.beginPath();
  this.imported_plots.push({title: filename, data: arr});
  log('this.imported_plots');
  log(this.imported_plots);
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

  this.addLegend(filename, this.imported_plots.length);

  // Change back strokeStyle as default
  context.strokeStyle = this.strokeStyle;
};

Graph.prototype.addLegend = function(title, graph_number) {
  // legend constants
  legendX = 200;
  legendY = 50;
  legend_unit = 10;

  // relationships
  legendY += (legend_unit + 3) * (graph_number - 1);

  // legend square mark
  var context = this.context;
  context.beginPath();
  context.rect(legendX, legendY, legend_unit, legend_unit);
  context.fillStyle = context.strokeStyle;
  context.fill();

  // legend text
  context.font = this.legend_font;
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillStyle = 'black';
  context.fillText(title, legendX + legend_unit + 3, legendY + legend_unit / 2);
}

Graph.prototype.getRandomColor = function() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

Graph.prototype.convertXToGraphPoint = function(x) {
  return this.originX + (x * this.scaleX)
}

Graph.prototype.convertYToGraphPoint = function(y) {
  return this.originY - (y * this.scaleY)
}

Graph.prototype.exportData = function() {
  var plots = [].concat(this.plots);
  plots.unshift(['x', 'y']);
  return plots;
}

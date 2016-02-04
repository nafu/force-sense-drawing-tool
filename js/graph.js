/**
 * @fileOverview 力覚電子カルテ用グラフ描画クラス
 *
 * @author Fumiya Nakamura
 * @version 1.0.0
 */

/**
 * グラフを作成します。
 *
 * @class 力覚カルテ（グラフ）のクラスです。<br>
 * 力覚カルテの情報を保持し、それらを取り扱う機能を保有します。
 *
 * @param {Hash} config 設定情報
 *
 * @example
 * var myOptions = {
 *   canvasId: 'layer1',  // グラフを描画するcanvas要素のid
 *   xlabel: 'Depth(mm)', // x軸のラベル
 *   ylabel: 'Force(N)',  // y軸のラベル
 *   maxX: 12,            // x軸の最大値
 *   maxY: 12,            // y軸の最大値
 *   unitsPerTick: 1      // 目盛り間隔
 * }
 * var myGraph = new Graph(myOptions);
 */
function Graph(config) {
  // user defined properties

  // canvas
  /**
   * 参照するcanvas要素
   * @return {HTMLCanvasElement}
   */
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
  /**
   * x軸のラベル
   * @return {String}
   */
  this.xlabel = config.xlabel;
  /**
   * y軸のラベル
   * @return {String}
   */
  this.ylabel = config.ylabel;
  /**
   * x軸の最大値
   * @return {Number}
   */
  this.maxX = config.maxX;
  /**
   * y軸の最大値
   * @return {Number}
   */
  this.maxY = config.maxY;
  /**
   * 目盛り間隔
   * @return {Number}
   */
  this.unitsPerTick = config.unitsPerTick;
  /**
   * 原点のx位置（左上の位置が0）
   * @return {Number}
   */
  this.originX = 70;
  /**
   * 原点のy位置（左上の位置が0）
   * @return {Number}
   */
  this.originY = parseInt(this.canvas.style.height) - 50;

  // user interaction
  /**
   * 現在のマウス位置（canvas位置に応じて調整する）
   * @return {Hash}
   */
  this.mouse = {x: 0, y: 0};
  /**
   * 直前のマウス位置
   * @return {Hash}
   */
  this.last_mouse = {x: 0, y: 0};

  // user drawing plots
  /**
   * ユーザーが描画したグラフの位置データの配列
   * @return {Array}
   */
  this.plots = []

  // imported plots
  /**
   * 読み込んだグラフの位置データの配列
   * @return {Array}
   */
  this.imported_plots = []

  // constants
  this.minX = 0;
  this.minY = 0;
  this.axisColor = '#aaa';
  this.font = '14pt Calibri';
  this.tickSize = 20;
  this.strokeStyle = 'blue'
  this.legend_font = '21pt Calibri';

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

    // Calibrate relative position x = 100, y = 70
    _self.mouse.x = e.pageX - this.offsetLeft - 100;
    _self.mouse.y = e.pageY - this.offsetTop - 70;
  }, false);

  this.onPaintRef = _self.onPaint.bind(_self);

  // Touch
  this.canvas.addEventListener('touchstart', function(e) {
    log('touchstart');
    log(_self.last_mouse);
    // Calibrate relative position x = 100, y = 70
    _self.mouse.x = e.touches[0].pageX - this.offsetLeft - 100;
    _self.mouse.y = e.touches[0].pageY - this.offsetTop - 70;

    _self.last_mouse.x = _self.mouse.x;
    _self.last_mouse.y = _self.mouse.y;
  }, false);

  this.canvas.addEventListener('touchmove', function(e) {
    log('touchmove');
    log(_self.last_mouse);
    _self.last_mouse.x = _self.mouse.x;
    _self.last_mouse.y = _self.mouse.y;

    // Calibrate relative position x = 100, y = 70
    _self.mouse.x = e.touches[0].pageX - this.offsetLeft - 100;
    _self.mouse.y = e.touches[0].pageY - this.offsetTop - 70;
  }, false);

  this.canvas.addEventListener('touchstart', function() {
    log('canvas touchstart')
    this.addEventListener('touchmove', _self.onPaintRef, false);
  }, false);
  this.canvas.addEventListener('touchend', function() {
    log('canvas touchend')
    this.removeEventListener('touchmove', _self.onPaintRef, false);
  }, false);
  this.canvas.addEventListener('touchcancel', function() {
    log('canvas touchcancel')
    this.removeEventListener('touchmove', _self.onPaintRef, false);
  }, false);
  this.canvas.addEventListener('touchleave', function() {
    log('canvas touchleave')
    this.removeEventListener('touchmove', _self.onPaintRef, false);
  }, false);

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
  this.plots.push([this.mouse.x, this.mouse.y]);
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

  // draw y-axis label
  context.translate(axisX - 14 /* axis font size */ - 14 /* label font size */, this.centerY - 14 /* label font size */ * 3);
  context.rotate(-0.5*Math.PI);
  context.fillText(this.ylabel, 0, 0);

  context.restore();
}

Graph.prototype.drawLineFromArray = function(filename, arr) {
  var context = this.context;
  // Change strokeStyle for imported data
  context.strokeStyle = this.getRandomColor(this.imported_plots.length);
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
  legend_unit = 20;

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

Graph.prototype.getRandomColor = function(seed) {
  // Comment out below codes if you want to fix colors.
  // This feature would be better to be provided as an option,
  // but this won't be used as a normal use in the current thinking.
  // That's why I just put these line as a comment,
  // although it might be a bad idea as an software engineer.
  //
  // seed = typeof seed !== 'undefined' ? seed : 0;
  // if (seed == 0) {
  //   return '#103FFB';
  // }
  // return '#00B866';
  //
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
  for (i = 0; i < plots.length; i++) {
    canvas_data = plots[i]
    x = (canvas_data[0] - this.originX) / this.unitX
    y = (this.originY - canvas_data[1]) / this.unitY
    plots[i] = this.roundExportData(x, y);
  }
  plots.unshift(['x', 'y']);
  return plots;
}

Graph.prototype.roundExportData = function(x, y) {
  return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
}

Graph.prototype.clearUserInput = function() {
  log('Graph.clearUserInput');
  var context = this.context;
  context.clearRect(0, 0, parseInt(this.canvas.style.width), parseInt(this.canvas.style.height));
  this.plots = []
}

(function() {
  /** Constants */
  var DEFAULT_STROKE_STYLE = 'blue';

  var canvas = document.querySelector('#paint');
  var ctx = canvas.getContext('2d');

  var sketch = document.querySelector('#sketch');
  var sketch_style = getComputedStyle(sketch);
  canvas.width = parseInt(sketch_style.getPropertyValue('width'));
  canvas.height = parseInt(sketch_style.getPropertyValue('height'));

  var mouse = {x: 0, y: 0};
  var last_mouse = {x: 0, y: 0};

  var plots = []

  var xy_axis_img = new Image();
  xy_axis_img.onload = function () {
    ctx.drawImage(xy_axis_img, 10, 50, 600, 523);
  }
  xy_axis_img.src = 'img/xy.png';

  /* Mouse Capturing Work */
  canvas.addEventListener('mousemove', function(e) {
    last_mouse.x = mouse.x;
    last_mouse.y = mouse.y;

    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
  }, false);

  /* Drawing on Paint App */
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = DEFAULT_STROKE_STYLE;

  function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Mouse
  canvas.addEventListener('mousedown', function(e) {
    canvas.addEventListener('mousemove', onPaint, false);
  }, false);

  canvas.addEventListener('mouseup', function() {
    canvas.removeEventListener('mousemove', onPaint, false);
  }, false);

  canvas.addEventListener('mouseout', function() {
    log('canvas mouseout')
    canvas.removeEventListener('mousemove', onPaint, false);
  }, false);

  // Touch
  canvas.addEventListener('touchmove', onPaint, false);

  var onPaint = function() {
    ctx.beginPath();
    ctx.moveTo(last_mouse.x, last_mouse.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.closePath();
    ctx.stroke();
    log('mouse.x = ' + mouse.x);
    log('mouse.y = ' + mouse.y);
    plots.push([mouse.x, 600 - mouse.y]);
    log('plots = ' + plots);
  };

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
      canvas.removeEventListener('mousemove', onPaint, false);
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

  function drawLineFromArray(arr) {
    // Change strokeStyle for imported data
    ctx.strokeStyle = getRandomColor();
    ctx.beginPath();
    log('arr[0]');
    log(arr[0]);
    ctx.moveTo(convertXToGraphPoint(arr[0]['1']), convertYToGraphPoint(arr[0]['3']));
    arr.shift();
    for(i = 0; i < arr.length; i++) {
      var dot = arr[i]
      log('dot');
      log(dot);
      log("dot['1'], dot['3']");
      log(dot['1'] + ',' + dot['3']);
      // Check if data is empty because perforation data have empty data at last line
      if(dot['1'].length == 0 || dot['3'].length == 0) { continue; }
      ctx.lineTo(convertXToGraphPoint(dot['1']), convertYToGraphPoint(dot['3']));
    }
    ctx.stroke();
    // Change back strokeStyle as default
    ctx.strokeStyle = DEFAULT_STROKE_STYLE;
  };

  function convertXToGraphPoint(x) {
    // TODO:
    // - Use origin x of coordinates instead of fixed value(147)
    // - Use correct scale according to range of values
    x_origin = 147;
    x_scale = 50;
    return x_origin + (x * x_scale)
  }

  function convertYToGraphPoint(y) {
    // TODO:
    // - Use origin y of coordinates instead of fixed value(512)
    // - Use correct scale according to range of values
    y_origin = 512;
    y_scale = 50;
    return y_origin - (y * y_scale)
  }

  window.loadFile = function loadFile(event) {
    alasql('SELECT * FROM CSV(?, {headers: false})', [event],function(data) {
      // Process data here
      log(data);
      arr = removeHeader(data);
      log(arr);
      drawLineFromArray(arr)
    });
  };
}());

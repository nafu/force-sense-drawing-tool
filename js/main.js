/**
 * @fileOverview 力覚電子カルテ用メインファイル
 *
 * @author Fumiya Nakamura
 * @version 1.0.0
 */

(function() {
  // Common options
  var options = {
    xlabel: 'Depth(mm)',
    ylabel: 'Force(N)',
    maxX: 12,
    maxY: 12,
    unitsPerTick: 1
  }

  // Background canvas options
  var backgroundOptions = options;
  backgroundOptions['canvasId'] = 'layer1';
  var backgroundGraph = new Graph(backgroundOptions);

  // Main canvas options - User drawing
  var myOptions = options;
  myOptions['canvasId'] = 'layer2';
  var myGraph = new Graph(myOptions);

  log('myGraph');
  log(myGraph);

  /**
   * ユーザーが描画した力覚データを出力する
   *
   * @namespace window
   * @function exportData
   */
  window.exportData = function exportData() {
    log('exportData');
    var plots = myGraph.exportData();
    var filename = document.getElementById('filename').value || 'force';
    alasql("SELECT * INTO CSV('" + filename + ".csv') FROM ?", [plots]);
  };

  /**
   * ユーザーが描画した力覚データを削除する
   *
   * @namespace window
   * @function clearUserInput
   */
  window.clearUserInput = function clearUserInput() {
    log("clearUserInput");
    myGraph.clearUserInput();
  }

  /**
   * mouseoutイベントを定義する
   * mouseが描画領域から外れた時にmousemoveイベントを削除する
   */
  document.addEventListener("mouseout", function(e) {
    e = e ? e : window.event;
    var from = e.relatedTarget || e.toElement;
    if (!from || from.nodeName == "HTML") {
      log("left window");
      myGraph.canvas.removeEventListener('mousemove', myGraph.onPaintRef, false);
    }
  });

  /**
   * 力覚データベースのヘッダーを取り除く
   *
   * @param {array} arr 力覚データベースCSVファイルから生成した配列
   */
  function removeHeader(arr) {
    for(i = 0; i < 3; i++) {
      arr.shift();
    }
    return arr
  };

  /**
   * 力覚データベースを読み込み、描画する
   *
   * @namespace window
   * @function loadFile
   */
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
      backgroundGraph.drawLineFromArray(filename, arr);
    });
  };
}());

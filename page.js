var tab = catelogs[0].tag;
var data = {};
var moveReady = true;
var editable = window.location.hash == '#edit';


if (editable == false) {
  $("#container").addClass('no-edit');
}

for (var i = 0; i < catelogs.length; i++) {
  var tag = catelogs[i].tag;
  for (var j = 0; j < catelogs[i].columns.length; j++) {
    var tmp = catelogs[i].columns[j];
    console.log(typeof tmp)
    if (typeof tmp === 'string') {
      catelogs[i].columns[j] = { field: "f" + j, header: tmp };
    }
    if (typeof tmp === 'object') {
      catelogs[i].columns[j] = { field: tmp.field, header: tmp.header };
    }
  }
  data[tag] = {};
  data[tag].array = [];
  data[tag].history = [];
  data[tag].redos = [];
}

function set() {
  var container = $("#container");
  container.html("");

  var tabs = $("<ul id='tabs'></ul>");
  container.append(tabs);

  for (var i = 0; i < catelogs.length; i++) {
    var tag = catelogs[i].tag;
    var isActive = tag == tab;
    var li = $("<li></li>");
    li.html(catelogs[i].title);
    li.attr('tag', tag);
    if (isActive) li.addClass('active');
    tabs.append(li);

    if (tag == tab) {
      var addButton = $("<div id='add'>添加</div>");
      container.append(addButton);

      var undoButton = $("<div id='undo' class='do-button'>撤销</div>");
      var canUndo = data[tag].history.length >= 2;
      if (!canUndo) undoButton.addClass("disabled");
      container.append(undoButton);

      var redoButton = $("<div id='redo' class='do-button'>恢复</div>");
      var canRedo = data[tag].redos.length >= 1;
      if (!canRedo) redoButton.addClass("disabled");
      container.append(redoButton);

      var table = drawTable(catelogs[i], data[tag].array);
      container.append(table);
    }
  }
}

function send() {
  var obj = { tab: tab };
  for (var i = 0; i < catelogs.length; i++) {
    var tag = catelogs[i].tag;
    obj[tag] = data[tag].array;
  }
  var str = JSON.stringify(obj);
  saveData(str);
  
}

function pushHistory() {
  var historyStr = JSON.stringify(data[tab].array);
  if (historyStr != data[tab].history[data[tab].history.length - 1]) {
    data[tab].history.push(historyStr);
    data[tab].redos = [];
  }
}

function saveAndReload() {
  pushHistory();
  send();
  set();
}

function save() {
  pushHistory();   
  send();
}

$(function () {
  loadData(function (__data__) {
    if (__data__) {
      if (__data__.tab) tab = __data__.tab;
      for (var i = 0; i < catelogs.length; i++) {
        var tag = catelogs[i].tag;
        if (__data__[tag]) {
          data[tag].array = __data__[tag];
          data[tag].history.push(JSON.stringify(__data__[tag]));
        }
      }
    }
    set();
  });

  $("#container").on('click', '#add', function () {
    var maxId = getMaxId(data[tab].array);
    data[tab].array.push({ id: maxId + 1 });
    saveAndReload();
  });

  $("#container").on('click', '#undo', function () {
    var history = data[tab].history;
    if (history.length <= 1) return;
    var tmp = history.pop();
    data[tab].redos.push(tmp);
    var str = history[history.length - 1];
    data[tab].array = JSON.parse(str);
    send();
    set();
  });

  $("#container").on('click', '#redo', function () {
    var history = data[tab].history;
    var redos = data[tab].redos;
    if (redos.length == 0) return;
    var str = redos.pop();
    history.push(str);
    data[tab].array = JSON.parse(str);
    send();
    set();
  });

  $("#container").on('focus', '.editable', function () {
    //editing = true;
  })

  $("#container").on('blur', '.editable', function () {
    //editing = false;
    var t = $(this);
    var id = t.attr('row-id');
    var field = t.attr('field');
    var text = t.html();

    var array = data[tab].array;
    for (var i = 0; i < array.length; i++) {
      if (array[i].id == id && text) {
        array[i][field] = text;
        save();
        return;
      }
    }
  })

  $("#container").on('click', 'cite', function (e) {
    if (confirm("确认删除该项吗?")) {
      var t = $(this);
      var id = t.attr('row-id');

      var array = data[tab].array;
      for (var i = 0; i < array.length; i++) {
        if (array[i].id == id) {
          array.splice(i, 1);
          saveAndReload();
          return;
        }
      }
    }
    e.stopPropagation();
  }) 

  $("#container").on('dblclick', '.order', function (e) {
    if (confirm("确认删除该项吗?")) {
      var t = $(this);
      var id = t.attr('row-id');
      console.log(id);
      var array = data[tab].array;
      for (var i = 0; i < array.length; i++) {
        if (array[i].id == id) {
          array.splice(i, 1);
          saveAndReload();
          return;
        }
      }
    }
    e.stopPropagation();
  }) 

  $("#container").on('click', '.operation', function (e) {
    e.stopPropagation();
  })

  $("#container").on('click', '#tabs li', function () {
    var t = $(this);
    var tag = t.attr('tag');
    tab = tag;
    send();
    set();
  })

  $("#container").on('keydown', '.editable', function (e) {    
    if ((e.keyCode == 83 || e.keyCode == 13) && e.ctrlKey) {
      e.preventDefault()
      $(this).blur();
    }
  })

  if (false) {
    $(document).bind('keydown', function (e) {    
      if (e.keyCode == 46 && e.ctrlKey) {
        e.preventDefault();
        var name;
        for (var i = 0; i < catelogs.length; i++) {
          if (tab == catelogs[i].tag) name = catelogs[i].title;
        }
        if (confirm("您正在试图删除【" + name + "】下的全部内容，确定继续吗？")) {
          data[tab].array = [];
          saveAndReload();
          return;
        }
      }
    })
  }

  $("#container").on('click', '.insert', function (e) {
    var t = $(this);
    var index = t.attr('row-index');
    var maxId = getMaxId(data[tab].array);
    data[tab].array.splice(index, 0, { id: maxId + 1 });
    saveAndReload();
  })

  $("#container").on('click', '.move-up', function () {
    var t = $(this);
    var index = parseInt(t.attr('row-index'));
    var arr = data[tab].array;
    if (index == 0) return; 
    arr.splice(index - 1, 0, arr.splice(index, 1)[0]);
    moveReady = false;
    saveAndReload();
  })

  $("#container").on('click', '.move-down', function () {
    var t = $(this);
    var index = parseInt(t.attr('row-index'));
    var arr = data[tab].array;
    if (index == arr.length - 1) return;
    arr.splice(index, 0, arr.splice(index + 1, 1)[0]);
    moveReady = false;
    saveAndReload();
  })

  $("#container").on('mouseenter', '.move', function () {
    //if (editing) return;
    if (!moveReady) return;
    var t = $(this);
    var id = t.attr('row-id');
    t.addClass('active-move');
    $("#tr-" + id).prev().addClass('active-row'); 
  })

  $("#container").on('mouseleave', '.move', function () {
    $(".active-move").removeClass('active-move');
    $(".active-row").removeClass('active-row');
    moveReady = true;
  })

  $("#container").on('mouseenter', '.insert', function () {
    //if (editing) return;    
    var t = $(this);    
    t.addClass('active-insert');    
  })

  $("#container").on('mouseleave', '.insert', function () {
    $(".active-insert").removeClass('active-insert');
  }) 
});
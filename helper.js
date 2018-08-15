
function formatterDateTime() {
  var date = new Date()
  var month = date.getMonth() + 1
  var datetime = date.getFullYear()
    + ""
    + (month >= 10 ? month : "0" + month)
    + ""
    + (date.getDate() < 10 ? "0" + date.getDate() : date
      .getDate())
    + ""
    + (date.getHours() < 10 ? "0" + date.getHours() : date
      .getHours())
    + ""
    + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date
      .getMinutes())
    + ""
    + (date.getSeconds() < 10 ? "0" + date.getSeconds() : date
      .getSeconds());
  return datetime;
} 

function setCookie(value) {
  var exp = new Date();
  exp.setTime(exp.getTime() + 1000 * 60 * 60 * 24 * 365 * 100);
  document.cookie = "data=" + escape(value) + ";expires=" + exp.toGMTString();
}

function getCookie() {
  var arr, reg = new RegExp("(^| )data=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg))
    return unescape(arr[2]);
  else
    return null;
} 

function loadData(callback) {
  $.ajax({
    type: 'post',
    url: 'https://route.showapi.com/870-1',
    dataType: 'json',
    data: {
      "showapi_timestamp": formatterDateTime(),
      "showapi_appid": '72622',
      "showapi_sign": '79dd033686ca4ed88bd9998c827b70f6',
      "type": "get",
      "key": "demozj" + key,
      "value": "",
      "expire": ""
    },
    success: function (result) {
      if (result.showapi_res_code != 0) {
        var data = getCookie();
        if (data) {
          var json = JSON.parse(data);
          if (callback) callback(json);
        }      
        return;
      }
      var data = result.showapi_res_body.value;  
      if (data) {
        setCookie(data);
        var json = JSON.parse(data);
        if (callback) callback(json);
      } else {
        if (callback) callback();
      }      
    },
    error: function () {
      var data = getCookie();
      if (data) {
        var json = JSON.parse(data);
        if (callback) callback(json);
      }      
    }
  })
}

var cachePostData = null;
var lastOperateDate = Date.now();
var busy = false;

function saveData(str) {

  var send = function () {
    lastOperateDate = Date.now();
    busy = false;
    $.ajax({
      type: 'post',
      url: 'https://route.showapi.com/870-1',
      dataType: 'json',
      data: {
        "showapi_timestamp": formatterDateTime(),
        "showapi_appid": '72622',
        "showapi_sign": '79dd033686ca4ed88bd9998c827b70f6',
        "type": "set",
        "key": "demozj" + key,
        "value": cachePostData,
        "expire": ""
      },
      success: function (result) {

      }
    })
  }

  cachePostData = str;
  if (busy) return;
  var now = Date.now();
  var interval = now - lastOperateDate;
  if (interval < 1100) {
    busy = true;
    setTimeout(send, 1100 - interval);
  } else {
    send();    
  }
}

function getMaxId(array) {
  var maxId = 0;
  for (var i = 0; i < array.length; i++) {
    var item = array[i];
    if (item.id > maxId) maxId = item.id;
  }
  return maxId;
}
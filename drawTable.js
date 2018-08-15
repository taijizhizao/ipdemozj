
function drawTable(catelog, data) {
  var table = $("<table id='table'></table>");

  var tr = $("<tr></tr>"); 
  table.append(tr);

  var th = $("<th  class='order-header'>序号</th>");
  tr.append(th);

  for (var i = 0; i < catelog.columns.length; i++) {
    th = $("<th></th>");
    th.html(catelog.columns[i].header);
    tr.append(th);
  }

  th = $("<th class='operation-header'>操作</th>");
  tr.append(th);

  for (var i = 0; i < data.length; i++) {

    if (!data[i] || !data[i].id) return;

    tr = $("<tr></tr>");
    tr.attr('id', 'tr-' + data[i].id);
    table.append(tr);

    var td = $("<td class='order'></td>");
    td.attr('row-id', data[i].id);
    td.html((i + 1).toString());
    tr.append(td);

    var insert = $("<div class='hide-button insert' title='插入行'></div>");
    insert.attr('row-index', i);
    td.append(insert);

    for (var j = 0; j < catelog.columns.length; j++) {
      if (editable) {
        td = $("<td contenteditable='true' class='editable'></td>");
      } else {
        td = $("<td></td>");
      }
      
      td.attr('row-id', data[i].id);
      td.attr('field', catelog.columns[j].field);
      td.attr('rowIndex', i)
      td.attr('columnIndex', j)
      td.html(data[i][catelog.columns[j].field]);
      tr.append(td);
    }

    td = $("<td class='operation'></td>");
    tr.append(td);

    var cite = $("<cite title='删除'></cite>");  
    cite.attr('row-id', data[i].id);
    td.append(cite);

    var move = $("<div class='move'></div>");
    move.attr('row-id', data[i].id);
    td.append(move); 

    var moveUp = $("<div class='move-up' title='上移'></div>");
    moveUp.attr('row-index', i);
    if (i == 0) moveUp.addClass('disabled');
    move.append(moveUp);

    var moveDown = $("<div class='move-down' title='下移'></div>");
    moveDown.attr('row-index', i);
    if (i == data.length - 1) moveDown.addClass('disabled'); 
    move.append(moveDown);
  }

  return table;
}
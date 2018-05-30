// namespace
var mafin = {};
/*
// basic definitions
mafin.templates = {
  'table': 'assets/html/table.html',
  'row': 'assets/html/tr.html',
  'td': 'assets/html/td.html',
  'icon': 'assets/html/icon.html'
};

mafin.wrapper = $('#wrapper form');

// clear, load & create matrix
mafin.initiate = function () {
  //
}

// matrix
//  initiate
mafin.matrix.initiate = function () {
  //
}

// update
mafin.matrix.update = function () {

}

mafin.figure.generate = function (figure) {

}
*/

// deprecated

// getHtml
mafin.getHtml = function (url, name) {
    if(typeof this.html === 'undefined')
    {
      this.html = {};
    }

    if(typeof mafin.html[name] === 'undefined')
    {
      $.ajax({
        url: url,
        success: function (data)
        {
          mafin.html[name] = $(data.activeElement);
        }
      });
    }
}

// make icon
mafin.makeFigure = function (figure, base, state) {
    // define states

    if(typeof state === 'undefined')
    {
      state = {
        'figure': 0,
        'size': 0,
        'color': 0,
        'position': 0,
        'rotation': 0
      }
    }

    if(typeof state !== 'object')
    {
      prev = state;

      state = {
        'figure': prev,
        'size': prev,
        'color': prev,
        'position': prev,
        'rotation': prev
      }
    }

    if(typeof state.figure === 'undefined') {
      state.figure = 0;
    }

    if(typeof state.size === 'undefined') {
      state.size = 0;
    }

    if(typeof state.color === 'undefined') {
      state.color = 0;
    }

    if(typeof state.position === 'undefined') {
      state.position = 0;
    }

    if(typeof state.rotation === 'undefined') {
      state.rotation = 0;
    }

    // get current (state-related) properties
    symbol = (typeof figure.figure === 'object') ? figure.figure[state.figure]: figure.figure;
    size = (typeof figure.size === 'object') ? figure.size[state.size]: figure.size;
    color = (typeof figure.color === 'object') ? figure.color[state.color]: figure.color;
    position = (typeof figure.position === 'object') ? figure.position[state.position]: figure.position;
    rotation = (typeof figure.rotation === 'object') ? figure.rotation[state.rotation]: figure.rotation;

    // position definitions
    positions = {
      1: "top left",
      2: "top center",
      3: "top right",
      4: "middle left",
      5: "middle center",
      6: "middle right",
      7: "bottom left",
      8: "bottom center",
      9: "bottom right"
    };

    // add classes
    base.addClass(symbol);
    base.addClass(size);
    base.addClass(color);
    base.addClass(positions[position]);
    base.addClass("r" + rotation);

    return { 'base': base, 'states': state };
}

// create matrix
mafin.createMatrix = function (matrix, container) {
  // preparation
  this.cells = {};
  this.cellIds = {};
  this.table = {};
  this.mode = matrix.mode;

  // preload all files
  $.when(
    this.getHtml('assets/html/table.html', 'table'),
    this.getHtml('assets/html/tr.html', 'tr'),
    this.getHtml('assets/html/td.html', 'td'),
    this.getHtml('assets/html/icon.html', 'icon')
  ).then(function () {
    // prepare the matrix creation
    mafin.table = mafin.html.table.clone();

    var counter = 0;

    // iterate the lines
    matrix.cells.forEach(function (line) {
        // create the line
        tr = mafin.html.tr.clone();

        // iterate the cells
        line.forEach(function (cell) {
          // define current cell state & prepare states
          cell.states = 0;
          states = {};

          // check if a specific ID was given and store as searchable index
          if(typeof cell.id !== 'undefined' && cell.id !== null && typeof cell.id !== 'integer')
          {
            mafin.cellIds[counter] = cell.id;
          }

          // create the cell
          td = mafin.html.td.clone();

          // prepare

          // add figures if necessary
          if(matrix.mode === 'application' || cell.type !== 'rule-defining') {
            // iterate figures if necessary
            if(typeof cell.figures.figure === 'string')
            {
              fig = mafin.makeFigure(cell.figures, mafin.html.icon.clone(), cell.state);
              states[0] = fig.states;
              td.append(fig.base);
            }
            else
            {
              figN = 0;
              cell.figures.forEach(function (figure) {
                fig = mafin.makeFigure(figure, mafin.html.icon.clone(), cell.state);
                states[figN] = fig.states;
                td.append(fig.base);
                figN++;
              });
            }

            // add data
            td.data('states', states);
          }
          else
          {
            td.html(' ');
            td.data('states', 0);
          }

          // add properties
          td.addClass(cell.type);
          td.data('id', counter);

          // insert & save cell for the future
          tr.append(td);
          mafin.cells[counter] = cell;

          counter++;
        });

        // insert into table
        mafin.table.append(tr);
    });
    // insert matrix in DOM
    $('#wrapper > form').html(mafin.table);
  });
}

// react to click
mafin.changeStates = function (element) {
  // get properties
  cellId = element.data('id');
  states = element.data('states');
  cell = mafin.cells[id];

  // load files
  $.when(
    this.getHtml('assets/html/table.html', 'table'),
    this.getHtml('assets/html/tr.html', 'tr'),
    this.getHtml('assets/html/td.html', 'td'),
    this.getHtml('assets/html/icon.html', 'icon')
  ).then(function () {
    // clear cell
    element.html(' ');

    // change cell
    if(typeof cell.figures.figure === 'undefined')
    {
      // iterate figures
      cell.figures.forEach(function (figure, id) {
        for (var property in states[id]) {
          if(++states[id][property] >= figure[property].length) {
            states[id][property] = 0;
          }
        };

        // insert cell content
        element.append(mafin.makeFigure(figure, mafin.html.icon.clone(), states[id]).base);
      });
    }
    else
    {
      states[0].forEach(function (state, property, arr) {
        if(++state >= cell.figures.figure[property].length) {
          state = 0;
        }

        // set current state
        arr[property] = state;
      });

      // insert cell content
      element.append(mafin.makeFigure(cell.figures, mafin.html.icon.clone(), arr).base);

      // TODO: debug single figure cells
    }

    // insert data
    element.data('states', states);

    // find cells that are changed
    mafin.cells.forEach(function (scell, id) {
      // iterate figures
      if(scell.figures.figure === 'undefined')
      {

      }
      else
      {
        // get eigendynamics
        if(typeof scell.figures.eigendynamics === 'object')
        {
          //
        }

        // get any influenced properties
        if(typeof scell.influenced[cellId] === 'object')
        {

        }
      }
    });
  });
}


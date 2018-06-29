// namespace
var mafin = {};

// configurations
mafin.template = "elcol.icon";
mafin.properties = {
  "names": [
    "figure",
    "size",
    "position",
    "rotation",
    "color"
  ],
  "position": [
    "top left",     "top center",     "top right",
    "middle left",  "middle center",  "middle right",
    "bottom left",  "bottom center",  "bottom right"
  ],
  "rotation": {
    45: "r45",
    90: "r90",
    135: "r135",
    180: "r180",
    225: "r225",
    270: "r270",
    315: "r315"
  }
};

// register hooks
comproso.hooks.beforeElementCreation.push(function (element) {
  // check if applicable
  if(element.type === 'cell' && typeof element.mafin !== 'undefined') {
    // create the element
    return mafin.createElement(element);
  } else {
    return element;
  }
});

// click event hook
comproso.hooks.clickEvent.push(function (element, elements) {
  if($(element).hasClass('mafin-input')) {
    $(element).toggleClass('selected');
  }
});

// press of the submit button
comproso.hooks.submitEvent.push(function () {
  // get relevant elements
  $(".mafin-input.selected").each(function () {

    // get relevant data
    mafinData = $(this).data('mafin');
    icons = [];

    // update figures
    for(var figure in mafinData.figures) {
      icons.push(mafin.createIcon(mafin.updateStates(mafinData.figures[figure])));
    }

    // create elements
    $(this).html("");
    comproso.createElements(icons, $(this));

    // identify influenced elements
    if(typeof mafinData.influences !== 'undefined' && mafinData.influences != null) {
      // loop through output variables
      $(".mafin-output").each(function () {
        // loop through figures
        outputMafinData = $(this).data("mafin");

        // continue if output variable is targeted
        if(mafinData.influences === "all" || typeof mafinData.influences.all !== 'undefined' || typeof mafinData.influences[$(this).attr('id')] !== 'undefined') {
          icons = [];

          // temporarily minimize the available properties
          if(mafinData.influences === "all") {
            props = Array(outputMafinData.figures.length).fill(mafin.properties.names);
          } else if(typeof mafinData.influences.all !== 'undefined') {
            // TODO: validation function that verifies & returns given properties
            props = Array(outputMafinData.figures.length).fill(mafinData.influences.all);
          } else {
            // define variables
            props = [];
            cell = mafinData.influences[$(this).attr('id')];

            // all vs. specific figures
            if(cell === "all" || typeof cell[0] === 'string') {
              // all figures
              // get properties
              if(cell === "all" || cell[0] === "all") {
                cell = mafin.properties.names;
              }

              // fill properties
              props = Array(outputMafinData.figures.length).fill(cell);
            } else {
              // loop through figures
              for(var figureId in cell) {
                props[figureId] = (cell[figureId] === "all") ? mafin.properties.names : cell[figureId];
              }
            }
          }

          // create icons
          icons = [];

          // change icons
          for(var figure in outputMafinData.figures) {
            icons.push(mafin.createIcon(mafin.updateStates(outputMafinData.figures[figure], props[figure])));
          }

          // implement changes
          $(this).html("");
          comproso.createElements(icons, $(this));
        }
      });
    }
  });

  // perform eigendynamics
  $('.eigendynamic[class*=\"mafin\"]').each(function () {
    // get eigendynamics
    dynMafinData = $(this).data('mafin');

    icons = [];

    // get eigendynamics per figure
    for(var figure in dynMafinData.figures) {
      // check if eigendynamics are applicable
      if(typeof dynMafinData.figures[figure]['eigendynamics'] !== 'undefined') {
        // specific eigendynamics
        // get eigendynamics
      } else  if (typeof dynMafinData.eigendynamics !== 'undefined' && dynMafinData.eigendynamics != null) {
        // global eigendynamics
        // TODO
      }
    }

    // implement changes
    $(this).html("");
    comproso.createElements(icons, $(this));
  });

  // remove selections
  $('.mafin-input.selected').removeClass('selected');
});

// press of the reset button
comproso.hooks.resetEvent.push(function () {
  $('.mafin-input, .mafin-output').each(function () {
    // get relevant data
    mafinData = $(this).data('mafin');
    icons = [];

    // update figures
    for(var figure in mafinData.figures) {

      // TODO update states
      if(typeof mafinData.figures[figure]['states'] !== 'undefined') {
        for(var state in mafinData.figures[figure]['states']) {
          mafinData.figures[figure]['states'][state] = 0;
        }
      }

      icons.push(mafin.createIcon(mafinData.figures[figure]));
    }

    $(this).html("");

    comproso.createElements(icons, $(this));
  });

  $('.mafin-input.selected').removeClass('selected');
});

// create a Mafin Element
mafin.createElement = function (element) {
    // add click event
    if(typeof element.events !== 'undefined' && !element.events.includes('click')) {
      element.events.push('click');
    }

    // define variables
    icons = [];
    eigendynamics = false;

    // add data if necessary
    if(typeof element.data === 'undefined') {
      element.data = {};
    }

    // handle rule-defining
    if(element.mafin.type !== "rule-defining" || comproso.config.mode === "assessment") {
      // loop throug figures
      for(var figure in element.mafin.figures) {
        if(typeof element.mafin.figures[figure]['eigendynamics'] !== 'undefined' && element.mafin.figures[figure]['eigendynamics'] != null) {
          eigendynamics = true;
        }
        // add icon to icons
        icons.push(mafin.createIcon(element.mafin.figures[figure]));
      }
    }

    // apply changes
    element.subitems = icons;

    // data information
    element.data.mafin = element.mafin;

    // apply general changes
    if(typeof element.attributes === 'undefined') {
      element.attributes = {
        "class": ""
      }
    } else if(typeof element.attributes.class === 'undefined') {
      element.attributes.class = "";
    }

    element.attributes.class += " mafin-" + element.mafin.type ;

    // add eigendynamics
    if(eigendynamics) {
      element.attributes.class += " eigendynamic";
    }

    // return element
    return element;
}

// create an Icon
mafin.createIcon = function (figure) {
  // create icon
  icon = {
    "type": "icon",
    "template": mafin.template,
    "attributes": {
      "class": ""
    },
    "data": {
      "states": {}
    }
  };

  // loop through properties
  for(var property in mafin.properties.names) {
    // define classes
    classes = "";

    // check for different states
    if(typeof figure[mafin.properties.names[property]] === 'object') {
      // get current state
      if(typeof figure['states'] === 'undefined') {
        figure['states'] = {};
      }

      if(typeof figure['states'][mafin.properties.names[property]] !== 'undefined') {
        propValue = figure[mafin.properties.names[property]][figure['states'][mafin.properties.names[property]]];
      } else {
        propValue = figure[mafin.properties.names[property]][0];
        figure['states'][mafin.properties.names[property]] = 0;
      }
    } else {
      propValue = figure[mafin.properties.names[property]];
    }

    // replace property if necessary
    if(typeof mafin.properties[mafin.properties.names[property]] !== 'undefined') {
      if(mafin.properties.names[property] === "position") {
        propValue--;
      }

      classes += " " + mafin.properties[mafin.properties.names[property]][propValue];
    } else {
      classes += " " + propValue;
    }

    // add class
    icon.attributes.class += " " + classes;
  }

  // return response
  return icon;
}

// update MaFIN states
mafin.updateStates = function (figure, statesToUpdate) {
  // check states to update
  if(typeof statesToUpdate === 'undefined' || statesToUpdate === 'all' || statesToUpdate[0] === 'all') {
    statesToUpdate = mafin.properties.names;
  }

  // update states
  if(statesToUpdate != null) {
    for(var state in statesToUpdate) {
      // validate states
      if(mafin.properties.names.includes(statesToUpdate[state])) {
        // validate changeability
        if(typeof figure[statesToUpdate[state]] === 'object') {
          // set figures
          if(typeof figure.states === 'undefined') {
            figure.states = {};
          }

          // set current state
          currentState = (typeof figure['states'][statesToUpdate[state]] !== 'undefined') ? figure['states'][statesToUpdate[state]] : 0;
          currentState = (++currentState >= figure[statesToUpdate[state]].length) ? 0 : currentState;

          // save state
          figure['states'][statesToUpdate[state]] = currentState;
        }
      }
    }
  }

  // return response
  return figure;
}

// extract

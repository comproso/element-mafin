var comproso = {};

// definitions
comproso.wrapper = '#wrapper > form';
comproso.actionWrapper = '#pageActions';
comproso.events = ["click", "submit", "reset", "back"];
comproso.debug = false;

// define subsections
comproso.namespaces = [];
comproso.templates = {};
comproso.register = [];
comproso.initiate = {};
comproso.config = {};
comproso.hooks = {
  'beforeElementCreation': [],
  'afterElementsCreation': [],
};

// add additional hooks
for(var event in comproso.events) {
  comproso.hooks[comproso.events[event] + 'Event'] = [];
}

// run comproso
comproso.run = function () {
  // start handling and main background processes
  this.initiate.handling();

  $.ajax({
    contentType: "application/json",
    dataType: "json",
    mimeType: "application/json",
    url: $(this.wrapper).attr('action'),
    data: function () {
      return "";
    },
    error: function (jqXHR, textStatus, errorThrown) {
      if(comproso.debug !== 'undefined' && comproso.debug)
      {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }
    },
    beforeSend: function (jqXHR) {
      // process before sending
    },
    success: this.runOnSuccess
  });
}

// start handling and main background processes
comproso.initiate.handling = function () {
  // identify action handlers and prevent default action
  $(comproso.actionWrapper + " input").on('click', function (event) {
    var type = ($(this).attr('type') === 'button') ? "back" : $(this).attr('type');

    // trigger different actions
    if(["submit", "reset", "back"].includes(type)) {
      comproso.initiate.hook(type + "Event");
    }
  });
}

// run on success
comproso.runOnSuccess =  function (data, textStatus, jqXHR) {
  // block sight, if activated
  // TODO

  // define basic configuration
  comproso.config = data.config;

  // create items
  comproso.createElements(data.elements);

  // register
  comproso.initiate.events(data.elements);

  // unblock sight, if activated
  // TODO

  // start assessing time
  // TODO
}

// create all items
comproso.createElements = function (elements, container) {
  // default values
  if(typeof container === 'undefined') {
    container = $(this.wrapper);
  }

  for(var elementId in elements) {
    // add basic functionalities
    if(typeof elements[elementId]['events'] === 'undefined') {
      elements[elementId]['events'] = [];
    }

    if(typeof elements[elementId]['attributes'] === 'undefined') {
      elements[elementId]['attributes'] = {
        'class': ""
      };
    }

    // initiate hook
    elements[elementId] = comproso.initiate.hook('beforeElementCreation', elements[elementId]);

    // get template & make it a jQuery object
    element = $(this.templates[elements[elementId]['template']]).clone();

    // data
    if(typeof elements[elementId]['id'] !== 'undefined') {
      element.attr('id', elements[elementId]['id']);
    }
    /*element.data('type', elements[elementId]['type']);
    element.data('template', elements[elementId]['template']);
    element.data('events', elements[elementId]['events']);
    element.data('position', elements[elementId]['position']);
    element.data('attributes', (typeof elements[elementId]['attributes'] !== 'undefined') ? elements[elementId]['attributes'] : {});
    */

    if(typeof elements[elementId]['data'] !== 'undefined') {
      for(var attribute in elements[elementId]['data']) {
          element.data(attribute, elements[elementId]['data'][attribute]);
      }
    }

    // attributes
    if(typeof elements[elementId]['attributes'] !== 'undefined') {
      for(var attribute in elements[elementId]['attributes']) {
        if(attribute === 'class') {
          element.addClass(elements[elementId]['attributes'][attribute]);
        } else {
          element.attr(attribute, elements[elementId]['attributes'][attribute]);
        }
      }
    }

    // add type as class
    element.addClass(elements[elementId]['type']);

    // content
    if(typeof elements[elementId]['content'] !== 'undefined' && elements[elementId]['content'] !== null) {
      element.html(elements[elementId]['content']);
    }

    // check for subitems
    if(typeof elements[elementId].subitems !== 'undefined' && elements[elementId].subitems !== null) {
      // run this for every subitem
      element = this.createElements(elements[elementId].subitems, element);
    }

    // register events
    for(var event in comproso.events) {
      if(elements[elementId]['events'].includes(comproso.events[event])) {
        element.addClass(comproso.events[event] + "able");
      }
    }

    // add item to container
    if(typeof element.position !== 'undefined' && element.position === "prepend") {
      container.prepend(element);
    } else {
      container.append(element);
    }
  }

  // final hook
  container = comproso.initiate.hook('afterElementsCreation', container);

  return container;
}

// register a comproso namespace
comproso.register.namespace = function (namespace) {
  comproso.namespaces.push(namespace);
}

// register template
comproso.register.templates = function (templates) {
  for(var template in templates) {
    comproso.templates[template] = templates[template];
  }
}

// register & run hooks
comproso.initiate.hook = function (namespace, variable, argument) {
  // argument is optional
  if(typeof argument === 'undefined') {
    argument = null;
  }

  for(var hook in comproso.hooks[namespace]) {
    variable = comproso.hooks[namespace][hook](variable, argument);
  }

  // return result
  return variable;
}

// load namespaces
comproso.initiate.namespace = function (namespace) {
  //console.log(namespace);

  // run initiate hook
  if(typeof comproso.hooks.initiate[namespace] !== 'undefined') {
    comproso.hooks.initiate[namespace]();
  }

  // load HTML templates
  if(typeof comproso.namespaces[namespace] !== 'undefined') {
    //
  }
}

// register Evenets
comproso.initiate.events =  function (elements, container) {
  // default values
  if(typeof container === 'undefined') {
    container = comproso.wrapper;
  }

  // initiate global events
  $(comproso.events).each(function () {
    var ev = this.toString();

    $(container + " ." + ev + "able").not("[type=\"hidden\"]").on(ev, function () {
      element = this;
      element = comproso.initiate.hook(ev + "Event", element, elements);
    });
  });
  /*for(var event in comproso.events) {
    $(container + " ." + comproso.events[event] + "able").not("[type=\"hidden\"]").on(comproso.events[event], function () {
      console.log(comproso.events[event] + 'event triggered');
      element = this;
      element = comproso.initiate.hook(comproso.events[event] + "Event", element, elements);
    });
  }*/

  // register events predefined by elements
  // TODO

  // register elements hook
  //comproso.initiate.hook();
}

define(['../util/class_util'], function(classUtil) {

  "use strict";

  //--------------------------------------------------------------------------
  //
  //  internal helper for all EventDispatcher objects
  //
  //--------------------------------------------------------------------------

  var sortOnPriority = function(event1, event2) {
    return event1.priority - event2.priority;
  };

  var createEvent = function(type, listener, scope, options) {
    return {
      type: type,
      listener: listener,
      scope: scope,
      priority: options.priority || 0,
      once: !!options.once,
      regExp: !!options.regExp
    };
  };

  var hasEvent = function(events, listener) {
    var registered = false;

    //check, if the event type has already a relationship to the listener
    if (events.length > 0) {
      for (var i = 0, len = events.length; i<len; i+=1) {
        if (events[i].listener === listener) {
          registered = true;
          break;
        }
      }
    }

    return registered;
  };

  var regExpToString = function(exp) {
    var result = exp.toString();
    return result.substring(1, result.lastIndexOf('/'));
  };

  //--------------------------------------------------------------------------
  //
  //  construct
  //
  //--------------------------------------------------------------------------

  /**
   * The EventDispatcher class allows any function to be an event target and as such,
   * to use the methods of the EventDispatcher functionality. It is the base class for
   * all classes that dispatch events.
   *
   * @example
   * <pre>
   * var dispatcher = new EventDispatcher();
   * dispatcher.on('signal', function(event, meta) {
   *   console.log(meta.type); //signal
   *   console.log(event); //{foo: 'bar'}
   * });
   * disaptcher.dispatch('signal', {foo: 'bar'});
   * </pre>
   *
   * <pre>
   * //it also allows to listen to regular expression
   * </pre>
   *
   * @constructor EventDispatcher
   * @name EventDispatcher
   */
  var EventDispatcher = function() {    
    this._events = {};
    this._eventsRegExp = {};
    return this;
  };

  var proto = EventDispatcher.prototype = {};

  //--------------------------------------------------------------------------
  //
  //  public methods
  //
  //--------------------------------------------------------------------------

  /**
   * Register an event listener function to an EventDispatcher object to
   * receives notification with an event as payload and some metadata that
   * describes the event in more detail. 
   *
   * <p>
   * After register an event listener, it is not possible to change the priority,
   * To change a listener's priority, remove the listener using <i>off</i> and add
   * it again.
   * </p>
   *
   * @param {String|RegExp} type The type of the event.
   * A special event type is <i>*</i>. It allows listen to all event types that became
   * dispatched by the EventDispatcher reference.
   * @param {function(Object, Object)} listener The listener function that is called
   * when an event is dispatched.
   * @param {Object=} [scope=this] Spefifies the <i>this</i> reference in the listener funnction.
   * The default scope is the EventDispatcher reference.
   * @param {int=} [priority=0] The priority level of the event listener. The priority is 
   * designated by a signed 32-bit integer. All listeners with priority n are processed 
   * before listeners with a priority of n+1. If two or more listeners share the same
   * priority, they are processed in the order in which they were added. 
   * The default priority is 0.
   *
   * @returns {EventDispatcher} the EventDispatcher reference
   * @see EventDispatcher#once
   * @see EventDispatcher#off
   *
   * @name on
   * @function
   * @memberOf EventDispatcher#
   */
  proto.on = function(type, listener, scope, priority) {
    if(!type || !listener) {
      return;
    }
    
    this._addListener(type, listener, scope, {priority: priority});
    return this;
  };

  /**
   * Register an event listener function to an EventDispatcher object.
   * Adding an event listener once became removed after receiving a signal one time.
   *
   * @param {String|RegExp} type The type of the event.
   * @param {function(Object, Object)} listener The listener function that is called
   * when an event is dispatched.
   * @param {Object=} [scope=this] Spefifies the <i>this</i> reference in the listener function.
   * @param {int=} [priority=0] The priority level of the event listener.
   *
   * @returns {EventDispatcher} the EventDispatcher reference
   * @see EventDispatcher#on
   * @see EventDispatcher#off
   *
   * @name once
   * @function
   * @memberOf EventDispatcher#
   */
  proto.once = function(type, listener, scope, priority) {
    if(!type || !listener) {
      return;
    }

    this._addListener(type, listener, scope, {priority: priority, once: true});
    return this;
  };

  /**
   * Unregister an event listener function from an EventDispatcher.
   *
   * @param {String} type The type of the event.
   * @param {function(Object, Object)} listener The listener function that is called.
   *
   * @returns {EventDispatcher} the EventDispatcher reference
   * @see EventDispatcher#on
   *
   * @name off
   * @function
   * @memberOf EventDispatcher#
   */
  proto.off = function (type, listener) {
    if(!type || !listener) {
      return;
    }
    
    var events = this.getListenerByType(type);
    for (var i = 0, len = events.length; i<len; i+=1) {
      if (events[i].listener === listener) { 
        events.splice(i, 1);
        if (events.length === 0) {
          delete this._events[type];
        }
        break;
      }
    }
    return this;
  };

  /**
   * Dispatches an event into the event flow.
   *
   * @param {String} type The event type to dispatch.
   * @param {Object} payload The payload object that is triggered as the first parameter.
   *
   * @returns {Boolean} Returns true if a listener is registrated for the event type.
   * Otherwise the return value is false.
   *
   * @fires Events#Event
   *
   * @name dispatch
   * @function
   * @memberOf EventDispatcher#
   */
  proto.dispatch = function(type, payload) {
    if (!type) {
      return false;
    }

    var event;
    var eventsRegExp = this._eventsRegExp;

    //append concrete and the 'all' (*) listener
    var events = this.getListenerByType(type)
      .concat(this.getListenerByType('*'));

    //append regexp listener
    for (var regExpString in eventsRegExp) {
      if (eventsRegExp.hasOwnProperty(regExpString)) {
        if (type.match(new RegExp(regExpString))) {
          events = events.concat(eventsRegExp[regExpString]);
        }
      }
    }

    //invoke gethered listener
    for (var i = 0, len = events.length; i<len; i+=1) {
      event = events[i];
      event.listener.call(event.scope, payload || {}, {target: this, type: type});

      if (event.once) {
        this.off(type, event.listener);
      }
    }

    return events.length > 0;
  };

  /**
   * Checks whether the EventDispatcher reference has any listeners registered
   * for a specific type of event.
   *
   * @param {String} type An event type.
   * @returns {Boolean} Returns true if a listener is known by the event type.
   * Otherwise the return value is false.
   *
   * @name hasListener
   * @function
   * @memberOf EventDispatcher#
   */
  proto.hasListener = function(type) {
    var result = false;
    if (type) {
      result = this.getListenerByType(type).length > 0;
    }
    return result;
  };

  //--------------------------------------------------------------------------
  //
  //  internal methods
  //
  //--------------------------------------------------------------------------

  /**
   * Get the list of all defined event listeners by an event type.
   * @private
   * @ignore
   */
  proto.getListenerByType = function(type) {
    var result;
    var events = this._events;
    var eventType = type;

    if (type) {
      if (type.constructor.name === 'RegExp') {
        events = this._eventsRegExp;
        eventType = regExpToString(type);
      }
      result = events[eventType];
    }
    return result || [];
  };

  /**
   * Add an event listener target.
   * @private
   * @ignore
   */
  proto._addListener = function(type, listener, scope, options) {
    var events = this.getListenerByType(type);
    var eventType = type;

    if (events.length === 0) {
      if (type.constructor.name === 'RegExp') {
        eventType = regExpToString(type);
        events = this._eventsRegExp[eventType] = [];
        options.regExp = true;
      } else {
        events = this._events[eventType] = [];
      }
    }

    if (!hasEvent(events, listener)) {
      events.push(createEvent(eventType, listener, scope || this, options));
      events.sort(sortOnPriority);
    }

    return this;
  };

  return EventDispatcher;
});

//--------------------------------------------------------------------------
//
//  events
//
//--------------------------------------------------------------------------

/**
 * @namespace Events
 */

/**
 * An event is described as a set of two values that are called with an event listener
 * function invoked by the <i>dispatch</i> method of an <i>EventDispatcher</i> instance.
 * One of them is the payload and the other is metadata.
 *
 * @event Events#Event
 * 
 * @see Events
 * @see EventDispatcher
 */

 /**
  * The first argument of the listener that acts as a vehicle to transport event
  * informations.
  *
  * @example
  * <pre>
  * var dispatcher = new EventDispatcher();
  * dispatcher.on('eventType', function(payload, metadata) {
  *   console.log(payload === 42); //true
  * });
  * dispatcher.dispatch('eventType', 42);
  * </pre>
  *
  * @name payload
  * @field
  * @type *
  * @memberOf Events#
  */

  /**
  * The second argument of the listener that adds usefull informations about
  * the occured event.
  *
  * @example
  * <pre>
  * var dispatcher = new EventDispatcher();
  * dispatcher.on('eventType', function(payload, metadata) {
  *   //includes the event type as a string
  *   console.log(metadata.type); //logs 'eventType'
  * 
  *   //includes the dispatcher reference of type EventDispatcher
  *   console.log(dispatcher === metadata.target); //true
  * });
  * dispatcher.dispatch('eventType');
  * </pre>
  *
  * @name metadata
  * @field
  * @type {Object}
  * @memberOf Events#
  */

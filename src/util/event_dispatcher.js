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

  var createEvent = function(type, listener, scope, priority) {
    return {
      type: type,
      listener: listener,
      scope: scope,
      priority: priority || 0
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
   * var sum = 0;
   * var dispatcher = new EventDispatcher();
   * dispatcher.on('add', function(event, meta) {
   *   sum += event.value;
   *   if (sum > 10) {
   *     meta.target.off(meta.type);
   *   }   
   * });
   * disaptcher.dispatch('add', {value: 2});
   * </pre>
   *
   * @constructor EventDispatcher
   * @name EventDispatcher
   */
  var EventDispatcher = function() {    
    this._events = {};
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
   * @param {String} type The type of the event.
   * A special event type is <i>*</i>. It allows listen to all event types that became
   * dispatched by the EventDispatcher reference.
   * @param {function(Object, Object)} listener The listener function that is called
   * when an event is dispatched.
   * @param {Object=} scope  Spefifies the <i>this</i> reference in the listener funnction.
   * The default scope is the EventDispatcher reference.
   * @param {int=} priority The priority level of the event listener. The priority is 
   * designated by a signed 32-bit integer. All listeners with priority n are processed 
   * before listeners with a priority of n+1. If two or more listeners share the same
   * priority, they are processed in the order in which they were added. 
   * The default priority is 0.
   *
   * @returns {EventDispatcher} the EventDispatcher reference
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
    
    var events = this.getListenerByType(type);

    if (events.length === 0) {
      events = this._events[type] = [];
    }

    if (!hasEvent(events, listener)) {
      events.push(createEvent(type, listener, scope || this, priority));
      events.sort(sortOnPriority);
    }

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
    var events = this.getListenerByType(type).concat(this.getListenerByType('*'));

    for (var i = 0, len = events.length; i<len; i+=1) {
      event = events[i];
      event.listener.call(event.scope, payload, {target: this, type: type});
    }

    return events.length > 0;
  };

  /**
   * Get the list of all defined event listeners by an event type.
   * @private
   * @ignore
   */
  proto.getListenerByType = function(type) {
    var result;

    if (type) {
      result = this._events[type];
    }   
    return result || [];
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

define(['../../util/event_dispatcher', '../../util/class_util'], function(EventDispatcher, classUtil) {

  "use strict";

  /**
   * A Nature is the command centre of a runner. A nature is responsible for:
   *
   * <li>Add functionality to a runner by adding traits</li>
   * <li>Forward events to other runner references by the runner attitude or the nature itself</li>
   * <li>Invoke controller methods of a runner or a nested runner</li>
   *
   * <p>A nature has by default no or less functionlity. They are added by traits. Traits are simple 
   * objects that are mixed into the prototype chain of a nature. A trait can access the following 
   * properties and capabilities:</p>
   *
   * <li>the nature reference by using <i>this</i></li>
   * <li>the plugin or application controller of the runner by using <i>this.controller</i></li>
   * <li>the runner id by using <i>this.getId()</i></li>
   * <li>attached trait methods by calling a mixin method</li>
   * <li>nested traits of other runners by calling the namespace of another runner</li>
   * <li>add and remove traits from a trait method by calling <i>this.addTrait/removeTrait</i></li>
   *
   * @example
   * <pre>
   * var nature = new Nature('nature');
   * nature.addTrait({log: function(value){console.log(value);}});
   * nature.log('Hello World'); //logs 'Hello World';
   * </pre>
   *
   * @param {String} runnerId The name (id) of a runner implementation.
   * The id should be unique to locate the module in hierarchy.
   *
   * @see Module
   * @see Sandbox
   *
   * @fires Events#NatureEvent
   * @fires Events#AttitudeEvent
   * 
   * @constructor Nature
   * @extends EventDispatcher
   * @name Nature
   */
  var Nature = function(runnerId) {
    EventDispatcher.call(this);
    this._id = runnerId;

    //--------------------------------------------------------------------------
    //
    //  public properties
    //
    //--------------------------------------------------------------------------

    /**
     * The reference to the plugin or application controller of the runner.
     *
     * @name controller
     * @field
     * @type Object
     * @memberOf Nature#
     */
    this.controller = undefined;
    return this;
  };

  var proto = Nature.prototype = classUtil.extend(EventDispatcher);

  //--------------------------------------------------------------------------
  //
  //  public methods
  //
  //--------------------------------------------------------------------------

  /**
   * Get the name (id) of the runner implementation.
   *
   * @name getId
   * @function
   * @memberOf Nature#
   */
  proto.getId = function() {
    return this._id;
  };
  
  /**
   * Add a trait.
   *
   * @param {Object} value A collection of methods to mixin.
   *
   * @name addTrait
   * @function
   * @memberOf Nature#
   */
  proto.addTrait = function(value) {
    classUtil.mixin(this, value);
  };

  /**
   * Remove a trait.
   *
   * @param {Object} value A collection of methods to mixout.
   *
   * @name removeTrait
   * @function
   * @memberOf Nature#
   */
  proto.removeTrait = function(value) {
    classUtil.mixout(this, value);
  };

  return Nature;
});

/**
 * An AttitudeEvent is dispatched when a <i>Nature</i> submits a notification due to
 * a state transition or state detail update in the <i>Attitude</i> of a <i>Runner</i>
 * implementation. It can submit any event type and the metadata looks the same like a
 * regular event. The playload is always defined as a <i>State</i> object.
 *
 * @event Events#AttitudeEvent
 * @see Events
 * @see Nature
 * @see Attitude
 * @see State
 */

/**
 * A NatureEvent is dispatched when a <i>Nature</i> submits a notification. The event
 * structure doesn`t differ from a regular event. It can submit any event type, any
 * payload and the metadata object looks the same.
 * A nature event is defined as an event that is dispatched by a trait of the nature.
 *
 * @event Events#NatureEvent
 * @see Events
 * @see Nature
 */

define(['../../util/lodash'], function(lodash) {

  "use strict";

  /**
   * An Attitude is the state machine of a runner. An attitude is responsible for:
   *
   * <li>Changing the state of a runner</li>
   * <li>Prepare state transitions</li>
   * <li>Updating details of the current state</li>
   * <li>Allow the controller to submit notifications</li>
   * <li>Send notifications to the nature of a runner</li>
   *
   * <p>An attitude has by default no or less functionlity. They are added by defining state transitions.</p>
   *
   * @example
   * <pre>
   * var attitude = new Attitude('nature', {play: ['pause'], pause: ['play', 'stop'], stop:['play']});
   * console.log(attitude.currentState.name); //inital state is 'stateless' 
   * attitude.currentState.play({url: 'myvideo.mp4'}); //state is 'play'
   * attitude.currentState.stop(); //transition not allowed, state is 'play'
   * attitude.currentState.pause(); //state is 'pause'
   * attitude.currentState.stop(); //state is 'stop'
   * </pre>
   *
   * @param {function(Object)=} notifyFn A method that is invoked on a state change or detail update.
   * If the function is not defined to notifications are submited.
   * @param {Object=} states A collection of states and allowed transitions.
   * @param {String=} initialState The initial state of the attitude. The default state is <i>stateless<i>.
   * It is always allowed to translate from and to the initial state.
   *
   * @see Module
   * @see Sandbox
   * 
   * @constructor Attitude
   * @name Attitude
   */
  var Attitude = function(notifyFn, states, initialState) {
    this._notifyFn = notifyFn;
    this._states = {};
    this._transitions = {};

    //--------------------------------------------------------------------------
    //
    //  public properties
    //
    //--------------------------------------------------------------------------

    /**
     * The current state of the Attitude.
     *
     * @name currentState
     * @field
     * @type State
     * @memberOf Attitude#
     */
    this.currentState = undefined;

    this.setStates(states, initialState);
    return this;
  };

  var forEach = lodash.forEach;
  var uniq = lodash.uniq;
  var indexOf = lodash.indexOf;
  var merge = lodash.merge;

  var proto = Attitude.prototype = {};

  //--------------------------------------------------------------------------
  //
  //  public methods
  //
  //--------------------------------------------------------------------------

  /**
   * Evaluate if the current state can translate to another.
   *
   * @param {String} stateName The name of a state.
   * @preturns {Boolean} true when the transition can perform otherwise false.
   *
   * @name canChange
   * @function
   * @memberOf Attitude#
   */
  proto.canChange = function(stateName) {
    return this.hasState(stateName) && stateName !== this.currentState.name && indexOf(this._transitions[this.currentState.name], stateName) > -1; 
  };

  /**
   * Evaluate if a state is available.
   *
   * @param {String} stateName The name of a state.
   * @preturns {Boolean} true when the state is available otherwise false.
   *
   * @name hasState
   * @function
   * @memberOf Attitude#
   */
  proto.hasState = function(stateName) {
    return this._states[stateName] !== undefined;
  };

  /**
   * Remove all states and capable transitions except the initial state.
   * After unset states the current state became the initial state. New
   * states and transitions can be added again using <i>setStates</i>
   *
   * @see Attitude#setStates
   *
   * @name unsetStates
   * @function
   * @memberOf Attitude#
   */
  proto.unsetStates = function() {
    this._transitions = {};
    this.setStates();
  };

  /**
   * Add states and capable transitions with the initial state.
   *
   * @param {Object=} transitions A collection of states and allowed transitions.
   * @param {String=} initialState The initial state of the attitude. The default state is <i>stateless<i>.
   * It is always allowed to translate from and to the initial state.
   *
   * @see Attitude#unsetStates
   *
   * @name setStates
   * @function
   * @memberOf Attitude#
   */
  proto.setStates = function(transitions, initialState) {
    initialState = initialState || 'stateless';
    transitions = this._prepareTransitions(transitions, initialState);

    var allStatesNames =  this._getAllStateNames(transitions, initialState);
    var state;
    var self = this;

    if(!transitions[initialState]) {
      transitions[initialState] = allStatesNames;  
    }

    forEach(allStatesNames, function(stateName) {
      state = { name: stateName };
      forEach(allStatesNames, function(stateName) {
        if (state.name === stateName) {
          state[stateName] = function(stateDetail) {
            self._notify(stateName, stateDetail);
            return false; 
          };
        } else if (indexOf(transitions[state.name], stateName) > -1) {
          state[stateName] = function(stateDetail) {
            self._notify(stateName, stateDetail);
            return true;
          };
        } else { 
          state[stateName] = function() { 
            return false; 
          }; 
        }
      });
      this._states[stateName] = state;
    }, this);
    
    this.currentState = this._states[initialState];
  };

  //--------------------------------------------------------------------------
  //
  //  internal methods
  //
  //--------------------------------------------------------------------------

  /**
   * Merge details, update the current state and send a notification if defined.
   * @private
   * @ignore
   */
  proto._notify = function(stateName, stateDetail) {
    var target = this._states[stateName];
    var notifyFn = this._notifyFn;
    target.detail = merge(target.detail || this.currentState.detail || {}, stateDetail);
    this.currentState = target;
    if (notifyFn) {
      notifyFn(target);
    }
  }

  /**
   * Prepare the incoming transition for the attitude by creating an initial state object.
   * @private
   * @ignore
   */
  proto._prepareTransitions = function(transitions, initialState) {
    var initState = {};
    initState[initialState] = [];

    transitions = merge({}, transitions || initState);
    this._transitions = transitions;
    this._states = {};
    return transitions;
  };

  /**
   * Retrieve all unique state names and append the initial state 
   * to allow the transition to all states.
   * @private
   * @ignore
   */
  proto._getAllStateNames = function(transitions, initialState) {
    var allStatesNames =  [];
    forEach(transitions, function(transition, transitionName) {

      //make initialState allowed
      if (!transition[initialState]) {
        transition.push(initialState);  
      }      
      allStatesNames = allStatesNames.concat(transition);
      allStatesNames.push(transitionName);
    });
    return uniq(allStatesNames);
  };  

  return Attitude;
});

//--------------------------------------------------------------------------
//
//  internal State
//
//--------------------------------------------------------------------------

/**
 * A state object describes a capable state of an <i>Attitude</i>. 
 * @see Attitude 
 * @namespace State
 */

/**
 * Holds a collection of properties that are bounded to the state.
 *
 * @name detail
 * @field
 * @type {Object}
 * @memberOf State#
 */

 /**
  * The name of the state.
  *
  * @name name
  * @field
  * @type {String}
  * @memberOf State#
  */

 /**
  * There is no real transition method in a State. It is used here as a namspace
  * for all available methods that can perform a transition.
  *
  * @param {Object=} detail The detail a state object should be merged with.
  * By default the detail is an empty object. Performing a transition will merge
  * the details of the currentstate with the new state unless the new state already
  * has details.
  * @returns {Boolean} Returns true if the transition is allowed otherwise false.
  * Translating to the same state is not allowed and returns <i>false</i> but the
  * details will be updated and the <i>Runner</i> implementation will be informed.
  *
  * @name transition
  * @function
  * @memberOf State#
  */

define(['./irunner', '../composite/component_base', './identity/nature', './identity/attitude', '../util/class_util', '../util/lodash'],
  function(IRunner, ComponentBase, Nature, Attitude, classUtil, lodash) {

  "use strict";

  /**
   * A Module is an implemation of <i>IRunner</i>.
   * It exaclty controls one plugin or application controller by
   * defining a <i>Nature</i> to inform other runner references and
   * an <i>Attitude</i> to allow controller interactions.
   *
   * @example
   * <pre>
   * var appController = {
   *   qualify: function(attitude, data) { attitude.currentState.start(); },
   *   onStarted: function() { console.log('started'); }
   * };
   * var module = new Module('myRunner');
   * module.setup(appController, {
   *   states: {start: []},
   *   traits: [{onStart: function() { this.controller.onStarted(); }}]
   * });
   * module.nature.on('start', function(){
   *   module.nature.onStarted(); //logs 'started';
   * });
   * module.init(); 
   * </pre>
   *
   * @param {String} moduleId The name (id) of the module.
   * The id should be unique to locate the module in hierarchy.
   *
   * @see Nature
   * @see Module
   * 
   * @constructor Module
   * @extends IRunner
   * @extends ComponentBase
   * @name Module
   */
  var Module = function(moduleId) {
    ComponentBase.call(this, moduleId);

    this._traits = undefined;
    this._states = undefined;
    this._initialState = undefined;
    this._initiated = false;
    this._controller = undefined;

    //--------------------------------------------------------------------------
    //
    //  public properties
    //
    //--------------------------------------------------------------------------

    /**
     * The nature of a Module.
     * The nature allows interaction with other <i>IRunner</i> implementations and
     * their nature.
     *
     * @name nature
     * @field
     * @type Nature
     * @memberOf Module#
     */
    this.nature = undefined;

    /**
     * The attitude of a Module.
     * The attitude allows a controller to send notifactions.
     *
     * @name attitude
     * @field
     * @type Attitude
     * @memberOf Module#
     */
    this.attitude = undefined;    
    return this;
  };

  classUtil.implement(Module, [IRunner]);
  var _super = ComponentBase.prototype;
  var forEach = lodash.forEach;
  var proto = Module.prototype = classUtil.extend(ComponentBase);

  //--------------------------------------------------------------------------
  //
  //  implementation of IRunner
  //
  //--------------------------------------------------------------------------

  /**
   * Prepare a module by the application or plugin dependencies.
   * After setup the module can initiate.
   * <p><b>implements </b><i>IRunner#setup</i></p>
   *
   * @param {Object} controller The application or plugin controller.
   * @param {Object} resource An abstract <i>RunnerResource</i>
   * The resource includes properties to setup a module. A module
   * can only handle state and trait definition. All other informations
   * are not part of a Module and aren`t handle.
   * @returns {Module} the Module instance 
   *
   * @name setup
   * @function
   * @memberOf Module#
   */
  proto.setup = function(controller, resource) {
    if (resource) {
      this._traits = lodash.clone(resource.traits);
      this._states = lodash.clone(resource.states);
      this._initialState = resource.initialState;      
    }
    this._controller = controller;
    return this;
  };

  /**
   * Initiate or Reinitiate the module.
   * <p><b>implements </b><i>IRunner#init</i></p>
   *
   * @param {Object} details A controller setup.
   * The controller became qualified with the defined details.
   * @returns {Module} the Module instance
   *
   * @name init
   * @function
   * @memberOf Module#
   */
  proto.init = function(details) {
    if (!this._initiated) {
      var self = this;
      var nature = this.nature;
      var attitude = this.attitude;
      var controller = this._controller;

      if (!nature) {
        nature = this.nature = new Nature(this.getId());
      }

      if (!attitude) {
        attitude = this.attitude = new Attitude(function(state) {
          self.nature.dispatch(state.name, state);
        });
      }

      nature.controller = controller;
      attitude.setStates(this._states, this._initialState);

      forEach(this._traits, function(trait) {
        nature.addTrait(trait);
      });

      if (controller && typeof controller.qualify === 'function') {
        controller.qualify(attitude, details);
      }
      this._initiated = true;
    }
    return this;
  };

  /**
   * Reset a module to the initial state.
   * After resetting it is possible to inject a new setup
   * and reinit the module.
   * <p><b>implements </b><i>IRunner#reset</i></p>
   *
   * @name reset
   * @function
   * @memberOf Module#
   */
  proto.reset = function() {
    if(this._initiated) {
      var nature = this.nature;
      var attitude = this.attitude;
      var controller = this._controller;      

      forEach(this._traits, function(trait) {
        nature.removeTrait(trait);
      });
      
      attitude.unsetStates(); 

      if (controller && typeof controller.disqualify === 'function') {
        controller.disqualify();
      }
      this._initiated = false;
    }
    return this;
  };

  /**
   * Dispose a module.
   * After disposing a module it is completly destroyed for garbage collection.
   * It is not possible to reinitiate the module.
   * <p><b>implements </b><i>IRunner#dispose</i></p>
   *
   * @name dispose
   * @function
   * @memberOf Module#
   */
  proto.dispose = function() {
    this.reset();
    this.nature = undefined;
    this.attitude = undefined;
    this._traits = undefined;
    this._states = undefined;
    this._initialState = undefined;
    this._controller = undefined;
    _super.dispose.call(this);
    return this;
  };

  return Module;
});
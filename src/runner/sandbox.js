define(['./irunner', '../composite/composite_base', './identity/nature', './identity/attitude', '../util/cache', '../util/class_util', '../util/lodash'],
  function(IRunner, CompositeBase, Nature, Attitude, Cache, classUtil, lodash) {

  "use strict";

  /**
   * A Sandbox is an implemation of <i>IRunner</i>.
   * It controls multiple plugins or applications that runs in an <i>IRunner</i>
   * implementation by defining a <i>Nature</i> to inform other runner references and
   * an <i>Attitude</i> to allow controller interactions.
   *
   * @example
   * <pre>
   * var appController = {
   *   qualify: function(attitude, data) { attitude.currentState.start(); },
   *   onStarted: function() { console.log('started'); }
   * };
   * var invoker = new Module('invoker');
   * invoker.setup(null, {
   *   states: {start: []}
   * });
   * var receiver = new Module('receiver');
   * receiver.setup(appController, {
   *   traits: [{onStart: function() { this.controller.onStarted(); }}]
   * });
   * var sandbox = new Sandbox('negotiator');
   * sandbox.addChild(invoker);
   * sandbox.addChild(receiver);
   * sandbox.setup(null, {
   *  events: {invoker: {start: ['receiver.onStart']}}
   * });
   * sandbox.init(); 
   * invoker.attitude.start(); // logs 'started';
   * </pre>
   *
   * @param {String} sandboxId The name (id) of the module.
   * The id should be unique to locate the module in hierarchy.
   *
   * @see Nature
   * @see Module
   * 
   * @constructor Sandbox
   * @extends IRunner
   * @extends CompositeBase
   * @name Sandbox
   */
  var Sandbox = function(sandboxId) {
    CompositeBase.call(this, sandboxId, true);
    this._traits = undefined;
    this._states = undefined;
    this._initialState = undefined;    
    this._controller = undefined;
    this._events = undefined;    
    this._initiated = false;

    //--------------------------------------------------------------------------
    //
    //  public properties
    //
    //--------------------------------------------------------------------------

    /**
     * The nature of a Sandbox.
     * The nature allows interaction with other <i>IRunner</i> implementations and
     * their nature. The sandbox nature will also provide all traits from the subordinated
     * runner references in namespaces.
     *
     * @example
     * <pre>
     * var sandbox = new Sandbox('sandbox');
     * var module = new Module('module');
     * module.setup(null, {
     *  traits: [{load: function(){ console.log('loading'); }}]
     * });
     *
     * sandbox.addChild(module);
     * sandbox.init();
     * sansbox.nature.module.load(); //logs 'loading'
     * </pre>
     *
     * @name nature
     * @field
     * @type Nature
     * @memberOf Sandbox#
     */
    this.nature = undefined;

    /**
     * The attitude of a Sandbox.
     * The attitude allows a controller to send notifactions.
     *
     * @name attitude
     * @field
     * @type Attitude
     * @memberOf Sandbox#
     */
    this.attitude = undefined;

    /**
     * Caches the invoked methods of a nature caused by
     * a state change in the attitude to prevent look up.
     *
     * @name cache
     * @field
     * @type Cache
     * @memberOf Sandbox#
     */
    this.cache = undefined;    
    return this;
  };

  classUtil.implement(Sandbox, [IRunner]);
  var forEach = lodash.forEach;
  var clone = lodash.clone;
  var _super = CompositeBase.prototype;
  var proto = Sandbox.prototype = classUtil.extend(CompositeBase);

  //--------------------------------------------------------------------------
  //
  //  implementation of IRunner
  //
  //--------------------------------------------------------------------------

  /**
   * Prepare a sandbox by the application or plugin dependencies.
   * After setup the sandbox can initiate.
   * <p><b>implements </b><i>IRunner#setup</i></p>
   *
   * @param {Object} controller The application or plugin controller.
   * @param {Object} resource An abstract <i>RunnerResource</i>
   * The resource includes properties to setup a sandbox. A sandbox
   * can handle state, trait, childs and event definitions. 
   * @returns {Sandbox} the Sandbox instance 
   *
   * @name setup
   * @function
   * @memberOf Sandbox#
   */
  proto.setup = function(controller, resource) {
    if (resource) {
      this._traits = lodash.clone(resource.traits);
      this._states = lodash.clone(resource.states);
      this._events = lodash.clone(resource.events);
      this._initialState = resource.initialState;      
    }
    this._controller = controller;
    return this;
  };

  /**
   * Initiate or Reinitiate the sandbox.
   * <p><b>implements </b><i>IRunner#init</i></p>
   *
   * @param {Object} details A controller setup.
   * The controller became qualified with the defined details.
   * @returns {Sandbox} the Sandbox instance
   *
   * @name init
   * @function
   * @memberOf Sandbox#
   */
  proto.init = function(details) {
    if (!this._initiated) {
      var self = this;
      var nature = this.nature;
      var attitude = this.attitude;
      var controller = this._controller;

      if (!this.cache) {
        this.cache = new Cache();
      }

      if (!nature) {
        nature = this.nature = new Nature(this.getId());
      }

      if (!attitude) {
        attitude = this.attitude = new Attitude(function(state) {
          self._handleEvent(state, {target:self.nature, type: state.name});
        });
      }

      nature.controller = controller;
      attitude.setStates(this._states, this._initialState);

      forEach(this._traits, function(trait) {
        nature.addTrait(trait);
      });

      forEach(this._childs, function(child) {
        child.init(details);
        this._setRoute(true, child, nature);
      }, this);

      if (controller && typeof controller.qualify === 'function') {
        controller.qualify(attitude, details);
      }
      this._initiated = true;
    }
    return this;
  };

  /**
   * Reset a sandbox to the initial state.
   * After resetting it is possible to inject a new setup
   * and reinit the sandbox.
   * <p><b>implements </b><i>IRunner#reset</i></p>
   *
   * @name reset
   * @function
   * @memberOf Sandbox#
   */
  proto.reset = function() {
    if(this._initiated) {
      var nature = this.nature;
      var attitude = this.attitude;
      var controller = this._controller;  

      forEach(this._childs, function(child) {        
        this._setRoute(false, child, nature);
        child.reset();
      }, this);    

      forEach(this._traits, function(trait) {
        nature.removeTrait(trait);
      });
      
      attitude.unsetStates();
      this.cache.expire();

      if (controller && typeof controller.disqualify === 'function') {
        controller.disqualify();
      }
      this._initiated = false;
    }
    return this;
  };

  /**
   * Dispose a sandbox.
   * After disposing a sandbox it is completly destroyed for garbage collection.
   * It is not possible to reinitiate the sandbox.
   * <p><b>implements </b><i>IRunner#dispose</i></p>
   *
   * @name dispose
   * @function
   * @memberOf Sandbox#
   */
  proto.dispose = function() {
    this.reset();
    this.nature = undefined;
    this.attitude = undefined;
    this.cache = undefined;
    this._traits = undefined;
    this._states = undefined;
    this._events = undefined;
    this._initialState = undefined;    
    this._controller = undefined;
    _super.dispose.call(this);
    return this;
  };

  //--------------------------------------------------------------------------
  //
  //  overrides of CompositeBase
  //
  //--------------------------------------------------------------------------

  /**
   * Add an <i>IRunner</i> implementation to a sandbox.
   * A sandbox will also initiate the runner to add if the sandbox is already initiated
   * and set the routing to the runner to receive events and invoke commands.
   * <p><b>overrides </b><i>CompositeBase#addChild</i></p>
   *
   * @param {IRunner} module The runner to add.
   * @param {uint=} index Advises the sandbox to add the runner
   * at a specific index.
   * @returns {Sandbox} Returns the sandbox reference where <i>addChild</i>
   * was invoked.
   *
   * @name addChild
   * @function
   * @memberOf Sandbox#
   */
  proto.addChild = function(module, index) {
    if (this._initiated) {
      module.init();
      this._setRoute(true, module);
    }
    _super.addChild.call(this, module, index);
  };

  /**
   * Remove an <i>IRunner</i> from a sandbox.
   * A sandbox will also reset the runner to remove and unset the routing 
   * to prevent events and command invokation.
   * <p><b>overrides </b><i>CompositeBase#removeChild</i></p>
   *
   * @param {IRunner | String | uint} child The runner or 
   * the identifier of a runner to remove.
   * @param {Boolean=} deep Advises the sandbox to process also nested sanboxes
   * to remove a runner.
   * @returns {IRunner} Returns the removed runner.
   * If no runner was found the returned value is <i>null</i>.
   *
   * @name removeChild
   * @function
   * @memberOf Sandbox#
   */
  proto.removeChild = function(module, deep) {
    if (! classUtil.is.call(module, IRunner)) {
      module = this.getChild(module, deep);
    }

    if (module) {
      this._setRoute(false, module);
      module.reset();
      module = _super.removeChild.call(this, module, deep);
    }
    return module;
  };

  //--------------------------------------------------------------------------
  //
  //  internal methods
  //
  //--------------------------------------------------------------------------

  /**
   * Set or unset the routing to a subordianted runner.
   * @private
   * @ignore
   */
  proto._setRoute = function(enable, module, nature) {
    var moduleNature = module.nature;
    nature = nature || this.nature;

    if(enable) {
      moduleNature.on('*', this._handleEvent, this, Infinity);
      nature[module.getId()] = moduleNature;
    } else {
      moduleNature.off('*', this._handleEvent);
      nature[module.getId()] = undefined;
    }
  };

  /**
   * Delegate an incoming event from a subordinated nature.
   * @private
   * @ignore
   */
  proto._handleEvent = function(event, meta) {    
    this._resolveDestinations(event, meta);
    this.nature.dispatch(meta.type, event);
  };

  /**
   * Process the event mapping.
   * @private
   * @ignore
   */
  proto._resolveDestinations = function(event, meta) {
    var originId = meta.target.getId();
    var eventType = meta.type;
    var cacheKey = originId + '-' + eventType;
    var cache = (this.cache) ?this.cache.getValueByKey(cacheKey) :undefined;
    var origin;

    if (!cache && this._events) {

      //allow notification from the own nature
      if(originId === this.getId()) {
        originId = 'nature';
      }
      origin = this._events[originId];

      if (origin) {
        cache = this._updateCache(cacheKey, origin[eventType]);
      }      
    }

    forEach(cache, function(item) {
      item.fn.call(item.nature, event, meta);
    });
  };

  /**
   * Cache often used function calls.
   * @private
   * @ignore
   */
  proto._updateCache = function(cacheKey, events) {
    var index, chain, len, context, cache;
    var nature = this.nature;

    if (events) {
      cache = this.cache
        .setValueByKey(cacheKey, [])
        .getValueByKey(cacheKey);

      forEach(events, function(event) {
        index = 0;
        chain = event.split('.');
        len = chain.length;
        context = nature;

        while(index < len - 1) {
          context = context[chain[index]];
          index++;
        }          
        cache.push({nature: context, fn: context[chain[len - 1]]});
      });
    }
    return cache;
  };

  return Sandbox;
});
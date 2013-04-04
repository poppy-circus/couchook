define(['../composite/composite_base', '../util/lodash', '../util/class_util'], 
  function(CompositeBase, lodash, classUtil) {

  "use strict";

  /**
   * A RunnerResource includes all necessary values to create <i>IRunner</i>
   * objects from a <i>Factory</i>. It is also a composition that allows building
   * complex runner hierarchies.
   *
   * @param {String} id The composite id.
   * The id should be unique to locate a composition in hierarchy.
   * @param {Boolean=} isRoot True if the composite is a top level item
   * and false if not. The default is false.
   *
   * @see IRunner
   * @see RunnerFactory
   * 
   * @constructor RunnerResource
   * @extends CompositeBase
   * @name RunnerResource
   */
  var RunnerResource = function(id, isRoot) {
    CompositeBase.call(this, id, isRoot);

    //--------------------------------------------------------------------------
    //
    //  public properties
    //
    //--------------------------------------------------------------------------

    /**
     * An application- or plugin controller where a runner operates on.
     *
     * <p>A controller should implement 2 methods. If the controller doesn`t implement
     * these methods the <i>Runner</i> won`t fail. The methods aren`t called in this case.</p>
     * <li>qualify</li>
     * <li>disqualify</li>
     * 
     * @example
     * <pre>
     * var controller = {
     *   //called when the init method of a runner is called
     *   //with the attitude state changes and method invokation of other runners can be performed
     *   //data can include properties that might be important for an application or plugin controller
     *   qualify: function(attitude, data){},
     *   
     *   //called when the reset/dispose method of a runner is called
     *   disqualify: function()
     * };
     * </pre>
     *
     * @name controller
     * @field
     * @type {Object}
     * @memberOf RunnerResource#
     */
    this.controller = undefined;

    /**
     * A collection of interative patterns that are used by the controller.
     * Traits will define the <i>nature</i> of a runner instance and this
     * will allow the connection to other runner references.
     *
     * <p>The next example would define a Load- and a simple DisplayTrait.</p>
     *
     * @example
     * <pre>
     * var traits: [
     *   {load: function(){}, unload: function(){}},
     *   {show: function(){}, hide: function(){}}
     * ];
     * </pre>
     *
     * @name traits
     * @field
     * @type Array
     * @memberOf RunnerResource#
     */
    this.traits = undefined;

    /**
     * A collection of transitions a runner can perform.
     * States will define the <i>attitude</i> of a runner instance and grant
     * a controller to change the state of a runner.
     *
     * <p>The next example would define a simple state transition.</p>
     *
     * @example
     * <pre>
     * var states: {
     *   play: ['pause'],
     *   stop: ['play'],
     *   pause: ['play', 'stop']
     * };
     * </pre>     
     *
     * @name states
     * @field
     * @type Object
     * @memberOf RunnerResource#
     */
    this.states = undefined;

    /**
     * A collection of instructions on how a state change of a runner attitude
     * affects the nature of a runner.
     *
     * <p>The next example shows a simple mapping.</p>
     *
     * @example
     * <pre>
     * var events: {
     *   //a runner with the id `loader` changes the state to `onLoaded`
     *   //this will cause a runner with id `player` to play   
     *   loader: {onLoaded: ['player.play']},
     *
     *   //everything became initiated by the own nature of a parent runner
     *   nature: {init: ['loader.load']}
     * };
     * </pre>
     *
     * @name events
     * @field
     * @type Object
     * @memberOf RunnerResource#
     */
    this.events = undefined;

    /**
     * The initial state of a runner attitude.
     *
     * @name initialState
     * @field
     * @type String
     * @memberOf RunnerResource#
     */
    this.initialState = undefined;

    /**
     * Define whether a runner can control subordinated runners or not.
     * If a runner in composition has childs attached this value is ignored
     * and the runner is always allowed to control other runner objects.
     * The default value is false.
     *
     * @name initialState
     * @field
     * @type Boolean
     * @memberOf RunnerResource#
     */
    this.forceContainer = false;
    return this;
  };

  var _super = CompositeBase.prototype;
  var forEach = lodash.forEach;  
  var proto = RunnerResource.prototype = classUtil.extend(CompositeBase);

  //--------------------------------------------------------------------------
  //
  //  public methods
  //
  //--------------------------------------------------------------------------

  /**
   * Add a resource to the composition with the available properties of a <i>RunnerResource</i>.
   *
   * @param {String} id The name (id) of the runner.
   * @param {Object=} controller A reference to the application / plugin controller.
   * @param {Array=} traits A list of exposed runner methods (nature).
   * @param {Object=} states Available transitions of the internal state machine (attitude).
   * @param {Object=} events An event map between state change and a trait method (nature).
   * @param {String=} The initial state of the state machine (attitude).
   * @returns {RunnerResource} the added resource
   *
   * @throws {Error} an error if a resource with the id already exist.
   * @throws {Error} an error if the id argument is undefined.
   *
   * @example
   * <pre>
   * var resources = new RunnerResource('root', true);
   * var resource = resources.addResource('myPlugin');
   * console.log(resources.getChild(0).getId() === resource.getId()); //true
   * </pre>
   *
   * @name addResource
   * @function
   * @memberOf RunnerResource#
   */
  proto.addResource = function(id, controller, traits, states, events, initialState) {
    var detail;

    if(id) {
      if (this.getChild(id, true)) {
        throw new Error('detail with the id `' + id + '` already defined');
      } else {
        detail = new RunnerResource(id);
        detail.controller = controller;
        detail.traits = traits;
        detail.states = states;
        detail.events = events;
        detail.initialState = initialState;
        this.addChild(detail);
      }      
    } else {
      throw new Error('id not defined');
    }
    return detail;
  };

  /**
   * Add a resource to the composition with an abstract <i>RunnerResource</i>.
   * To add a resource directly use <i>addChild</i>
   *
   * @param {Object} detail The properties of a <i>RunnerResource</i>
   * @returns {RunnerResource} the added resource
   *
   * @example
   * <pre>
   * var resources = new RunnerResource('root', true);
   * var resource = resources.addResource({id: 'myPlugin'});
   * console.log(resources.getChild(0).getId() === resource.getId()); //true
   * </pre>
   *
   * @name importResource
   * @function
   * @memberOf RunnerResource#
   */
  proto.importResource = function(detail) {
    var result;
    if (detail) {
      result = this.addResource(detail.id, detail.controller, detail.traits, detail.states, detail.events, detail.initialState);      
      if(result) {
        result.forceContainer = !!detail.forceContainer;
        forEach(detail.childs, function(child) {
          result.importResource(child);
        });
      }      
    }    
    return result;
  };

  /**
   * Convert a <i>RunnerResource</i> to an abstract <i>RunnerResource</i>.
   * @returns {Object} the abstract resource
   *
   * @example
   * <pre>
   * var resources = new RunnerResource('root', true);
   * console.log(resources.toObject()); //{id: 'root'}
   * </pre>
   *
   * @name toObject
   * @function
   * @memberOf RunnerResource#
   */
  proto.toObject = function() {
    var len = this.numChildren();
    var detail = {id: this.getId()};

    if (this.controller) {
      detail.controller = this.controller;
    }

    if (this.traits) {
      detail.traits = this.traits;
    }

    if (this.states) {
      detail.states = this.states;
    }

    if (this.events) {
      detail.events = this.events;
    }

    if (this.initialState) {
      detail.initialState = this.initialState;
    }

    if (this.forceContainer) {
      detail.forceContainer = this.forceContainer;
    }

    if (len > 0) {
      detail.childs = [];
      for (var i = 0; i < len; i+=1) {
        detail.childs.push(this.getChild(i).toObject());
      }
    }
    return detail;
  };

  return RunnerResource;
});

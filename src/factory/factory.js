define(['./factory_item_collection'], function(FactoryItemCollection) {

  "use strict";

  /**
   * The Factory allows clients to create different artifacts by a set of properties.
   * Artifacts are mostly class instances and the properties are descibed by a resource object.
   *
   * @example
   * <pre>
   * var ParserFactory = function() {
   *   Factory.call(this);
   *   this.handler.addChild({
   *     canHandle: function(resource) { return resource.xml === true; },
   *     create: function(resource, root) { return new XmlParserArtifact(); }
   *   });
   *   this.handler.addChild({
   *     canHandle: function(resource) { return resource.json === true; },
   *     create: function(resource, root) { return new JsonParserArtifact(); }
   *   });
   *   return this;
   * };
   *
   * var parser = new ParserFactory().create({json: true});
   * </pre>
   * 
   * @constructor Factory
   * @name Factory
   */
  var Factory = function() {

    //--------------------------------------------------------------------------
    //
    //  public properties
    //
    //--------------------------------------------------------------------------

    /**
     * Collection of available handlers which process a resource to create an artifact.
     *
     * @name handler
     * @type FactoryItemCollection
     * @memberOf Factory#
     */
    this.handler = new FactoryItemCollection('handler');

    /**
     * Collection of available handlers which process a resource to create a wrapper
     * of an artifact.
     *
     * @example
     * <pre>
     * var factory = new Factory()
     * factory.handler.addChild({
     *   canHandle: function(resource){ return resource === 'sayHello'; },
     *   create: function(resource, artifact){ return 'Hello World'; }
     * });
     * factory.wrapper.addChild({
     *   canHandle: function(resource){ return resource === 'sayHello'; },
     *   create: function(resource, artifact){ return artifact + ', i`am the wrapper'; }
     * });
     * 
     * factory.create('sayHello'); //returns 'Hello World, i`am the wrapper'
     * </pre>
     *
     * @name wrapper
     * @type FactoryItemCollection
     * @memberOf Factory#
     */
    this.wrapper = new FactoryItemCollection('wrapper');
    return this;
  };

  var proto = Factory.prototype = {};

  /**
   * Create an artifact by the attached handler and wrapper items.
   *
   * @param {Object} resource An object that inlcudes several parameters to evaluate
   * the creation of the object.
   * @param {?} artifact An object to wrap.
   *
   * @returns {?} the result of the cration process.
   * <p> At first the <i>canHandle</i> function of the </i>handlers</i> are invoked.
   * They are called in same order as they are aligned in the composition. When
   * a handler returns true the <i>create</i> method is ivoked and the first step
   * of the creation process is completed. Next step processes the same for the
   * <i>wrapper</i> items. All wrappers that return <i>true</i> will wrap up the
   * previous created artifact. Finally the result or <i>null</i> if no handler
   * can create an artifact is returned</p>
   *
   * @name create
   * @function
   * @memberOf Factory#
   */
  proto.create = function(resource, artifact) {
    var result = artifact;
    var handler = artifact ?this.wrapper :this.handler;
    var factoryItem;

    for (var i=0, len = handler.numChildren(); i < len; i+=1){
      factoryItem = handler.getChild(i);
      if (factoryItem.canHandle(resource)) {
        result = factoryItem.create(resource, result);
        if (!artifact) {          
          result = this.create(resource, result);
          break;
        }        
      }
    }
    return result;
  };
  return Factory;
});
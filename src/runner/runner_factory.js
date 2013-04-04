define(['../runner/sandbox', '../runner/module', '../factory/factory', '../util/class_util'], 
  function(Sandbox, Module, Factory, classUtil) {

  "use strict";

  /**
   * A RunnerFactory create references which implement the <i>IRunner</i> interface
   * to define applications or plugins.
   *
   * <p>By default a RunnerFactory can create two types of runners.</p>
   * <li>Module</li>
   * <li>Sandbox</li>
   * <p>A sandbox became created when the resource includes further childs or it is forced.
   * All other cases will create a module as long as the resource and the resource id are defined.</p>
   *
   * <p>To invoke the factory the <i>create</i> method should be called with an abstract <i>RunnerResource</i>.
   *
   * @see IRunner
   * @see RunnerResource
   * 
   * @constructor RunnerFactory
   * @extends Factory
   * @name RunnerFactory
   */
  var RunnerFactory = function() {
    Factory.call(this);

    //sandbox creator
    this.handler.addChild({
      canHandle: function(resource) {
        return resource && resource.id && ((resource.childs && resource.childs.length > 0) || resource.forceContainer);
      },
      create: function(resource, root) {
        return new Sandbox(resource.id)
          .setup(resource.controller, resource);
      }
    });

    //module creator
    this.handler.addChild({
      canHandle: function(resource) {
        return resource && resource.id;
      },
      create: function(resource, root) {
        return new Module(resource.id)
          .setup(resource.controller, resource);
      }
    });
    return this;
  };

  RunnerFactory.prototype = classUtil.extend(Factory);
  return RunnerFactory;
});

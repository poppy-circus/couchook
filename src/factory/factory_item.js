define(['./ifactory_item', '../composite/component_base', '../util/class_util'], 
  function(IFactoryItem, ComponentBase, classUtil) {

  "use strict";

  /**
   * The base implementation of an <i>IFactoryItem</i>. A FactoryItem
   * can be aligned in a <i>FactoryItemCollection</i>.
   *
   * <p>
   * In more detail the FactoryItem is a wrapper of a generic object
   * that matches the <i>IFactoryItem</i> interaface. To allow alignment
   * in a composition (FactoryItemCollection) a factory item must also
   * implement the <i>IComponent</i> interface. 
   * </p>
   *
   * @param {function(this:FactoryItem, ?):boolean} canHandleFn A method that evaluates if it is possible
   * to create an object.
   * @param {function(this:FactoryItem, ?, ?):?} createFn A method that creates the result object.
   *
   * @example
   * <pre>
   * var collection = new FactoryItemCollection();
   * var item;
   * collection.addChild({
   *   canHandle: function(resource){ return true; },
   *   create: function(resource, artifact){ return 'Hello World'; }
   * });
   * 
   * item = collection.getChild(0);
   * item.canHandle(); //returns true
   * item.create(); //returns 'Hello World'
   * item instanceOf FactoryItem //returns true
   * </pre>
   *
   * @see FactoryItemCollection
   * @see Factory
   * 
   * @constructor FactoryItem
   * @extends IFactoryItem
   * @extends ComponentBase
   * @name FactoryItem
   */
  var FactoryItem = function(canHandleFn, createFn) {
    ComponentBase.call(this, 'factoryItem' + FactoryItem.ITEM_COUNT);
    FactoryItem.ITEM_COUNT += 1;
    this._canHandleFn = canHandleFn;
    this._createFn = createFn;
    return this;
  };

  //--------------------------------------------------------------------------
  //
  //  class properties
  //
  //--------------------------------------------------------------------------

  /**
   * Factory item count to create unique component ids.
   * @private
   * @ignore
   */
  FactoryItem.ITEM_COUNT = 0;


  classUtil.implement(FactoryItem, [IFactoryItem]);
  var proto = FactoryItem.prototype = classUtil.extend(ComponentBase);

  //--------------------------------------------------------------------------
  //
  //  implementation of IFactoryItem
  //
  //--------------------------------------------------------------------------

  /**
   * Evaluate the creation of an object.
   * <p><b>implements </b><i>FactoryItem#canHandle</i></p>
   *
   * @param {?} resource An object that inlcudes several parameters to evaluate
   * the creation of the object.
   *
   * @returns {Boolean} true if the item can ceate an object by the given resource
   * otherwise false
   *
   * @name canHandle
   * @function
   * @memberOf FactoryItem#
   */
  proto.canHandle = function(resource) {
    return this._canHandleFn(resource);
  };

  /**
   * Create an object.
   * <p><b>implements </b><i>FactoryItem#create</i></p>
   *
   * @param {?} resource An object that inlcudes several parameters where the
   * creation process was evaluated on. A resource can be reused to configure the
   * created object.
   * @param {?} artifact The result of a priviously created object for wrapping purpose.
   * A factory can wrap created items over and over again. Therefore the previous object
   * is provided in the create method.
   *   
   * @returns {?} the create object
   *
   * @example
   * <pre>
   * var factory = new Factory();
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
   * @see Factory
   *
   * @name create
   * @function
   * @memberOf FactoryItem#
   */
  proto.create = function(resource, artifact) {
    return this._createFn(resource, artifact);
  };

  return FactoryItem;
});
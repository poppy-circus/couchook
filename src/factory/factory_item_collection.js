define(['../composite/composite_base', './ifactory_item', './factory_item', '../composite/icomponent', '../util/class_util'], 
  function(CompositeBase, IFactoryItem, FactoryItem, IComponent, classUtil) {

  "use strict";

  /**
   * The FactoryItemCollection is a concrete composition where factory
   * items are aligned to.
   *
   * @param {String} id the name of the factory collection.
   * It became the id of the composition.
   *
   * @see FactoryItem
   * @see Factory
   * 
   * @constructor FactoryItemCollection
   * @extends CompositeBase
   * @name FactoryItemCollection
   */
  var FactoryItemCollection = function(id) {
    CompositeBase.call(this, id, true);
    return this;
  };

  var _super = CompositeBase.prototype;
  var proto = FactoryItemCollection.prototype = classUtil.extend(CompositeBase);

  //--------------------------------------------------------------------------
  //
  //  overrides of CompositeBase
  //
  //--------------------------------------------------------------------------

  /**
   * Adds a new factory item component to the composition of a factory item collection.
   * <p><b>overrides </b><i>CompositeBase#addChild</i></p>
   *
   * @param {FactoryItem|IFactoryItem} child The factory item to add.
   * A FactoryItemColelction performs certain kinds of normalisations while adding a
   * factory item component. The child must implement <i>IFactoryItem</i> otherwise
   * an error is thrown. If the child also implements <i>IComponent</i> it will be added
   * directly otherwise otherwise a new instance of <i>FactoryItem</i> became created.
   * @param {uint=} index Advises the composition to add the component
   * at a specific index.
   * @returns {FactoryItemCollection} the factory item collectionr reference
   *
   * @throws {Error} an error if the IFactoryItem implementation of the child is missing.
   *
   * @name addChild
   * @function
   * @memberOf FactoryItemCollection#
   */
  proto.addChild = function(child, index) {
    if (classUtil.is.call(child, IFactoryItem)) {
      if (classUtil.is.call(child, IComponent)) {
        _super.addChild.call(this, child, index);
      } else {
        _super.addChild.call(this, new FactoryItem(child.canHandle, child.create), index);
      }      
    } else {
      throw new Error('IFactoryItem implementation missing');
    }
  };

  return FactoryItemCollection;
});

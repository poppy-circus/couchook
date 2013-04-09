define(['./icomposite', './component_base', '../util/lodash', '../util/class_util'], function(IComposite, ComponentBase, lodash, classUtil) {

  "use strict";

  var forEach = lodash.forEach;
  var indexOf = lodash.indexOf;
  var lastIndexOf = lodash.lastIndexOf;

  /**
   * The base implementation of an <i>IComposite</i>. A composite
   * can be aligned in a composite hierarchy and can hold subordinated 
   * components and compositions.
   *
   * @param {String} compositeId The composite id.
   * The id should be unique to locate a composition in hierarchy.
   * @param {Boolean=} isRoot True if the composite is a top level item
   * and false if not. The default is false.
   * 
   * @constructor CompositeBase
   * @extends IComposite
   * @extends ComponentBase
   * @name CompositeBase
   */
  var CompositeBase = function(compositeId, isRoot) {
    ComponentBase.call(this, compositeId, isRoot);
    this._childs = [];    
    return this;
  };

  classUtil.implement(CompositeBase, [IComposite]);
  var proto = CompositeBase.prototype = classUtil.extend(ComponentBase);

  //--------------------------------------------------------------------------
  //
  //  overrides of ComponentBase
  //
  //--------------------------------------------------------------------------

  /**
   * Check if the composite is a container.
   * The default is <i>true</i>.
   * <p><b>overrides </b><i>ComponentBase#isContainer</i></p>
   *
   * @returns {Boolean} True if it is a container
   * and false if not.
   *
   * @name isContainer
   * @function
   * @memberOf CompositeBase#
   */
  proto.isContainer = function() {
    return true;
  };

  /**
   * Set the parent of a component.
   * The parent became defined by adding a component to a composite.
   * This will also update all subordianted coponenta to target a new
   * root reference.
   * @private
   * @ignore
   */
  proto.setParent = function(value) {
    var self = this;
    this._parent = value;
    this._root = null;

    forEach(this._childs, function(child){
      child.setParent(self);
    });
  };

  /**
   * Destroy the composite. This will remove the dependencies to the parent and root node
   * like <i>ComponnetBase</i> but additional invoke the dispose method of all subordinated
   * components.
   * <p><b>overrides </b><i>ComponentBase#dispose</i></p>
   *
   * @name dispose
   * @function
   * @memberOf CompositeBase#
   */
  proto.dispose = function() {
    var child;
    this.setParent();

    while(this.numChildren() > 0) {
      child = this.getChild(0);
      child.dispose();
      this.removeChild(child, true);
    }
  };

  //--------------------------------------------------------------------------
  //
  //  implementation of IComposite
  //
  //--------------------------------------------------------------------------

  /**
   * Get the amount of added components in a composition.
   * <p><b>implements </b><i>IComposite#numChildren</i></p>
   *
   * @name numChildren
   * @function
   * @memberOf CompositeBase#
   */
  proto.numChildren = function() {
    return this._childs.length;
  };

  /**
   * Get the depth of the composition.
   * <p><b>implements </b><i>IComposite#getDepth</i></p>
   *
   * @name getDepth
   * @function
   * @memberOf CompositeBase#
   */
  proto.getDepth = function() {
    var depth = 0;
    var container = 0;
    forEach(this._childs, function(child) {
      if (child.isContainer()) {
        container = child.getDepth();
        if (container > depth) {
          depth = container;
        }
      }
    });
    return (this.numChildren() > 0 ?1 :0) + depth;
  };

  /**
   * Get the index of a subordinated child processed with index+=1.
   * <p><b>implements </b><i>IComposite#indexof</i></p>
   *
   * @param {IComponent} child A component to find.
   * @param {uint=} fromIndex An optional index to start with.
   * The default is 0.
   * @returns {int} Returns the index of child. If the child isn`t presented in the composition
   * the return value is -1.
   *
   * @see CompositeBase#lastIndexOf
   *
   * @name indexOf
   * @function
   * @memberOf CompositeBase#
   */
  proto.indexOf = function(child, fromIndex) {   
    return indexOf(this._childs, child, fromIndex);
  };

  /**
   * Get the index of a subordinated child processed with index-=1.
   * <p><b>implements </b><i>IComposite#lastIndexOf</i></p>
   *
   * @param {IComponent} child A component to find.
   * @param {uint=} fromIndex An optional index to start with.
   * The default is 0.
   * @returns {int} Returns the index of child. If the child isn`t presented in the composition
   * the return value is -1.
   *
   * @see CompositeBase#indexOf
   *
   * @name lastIndexOf
   * @function
   * @memberOf CompositeBase#
   */
  proto.lastIndexOf = function(child, fromIndex) {   
    return lastIndexOf(this._childs, child, fromIndex);
  };

  /**
   * Get a component from a compostion.
   * <p><b>implements </b><i>IComposite#getChild</i></p>
   *
   * @param {String|uint} id The index or the name (id) of the component to fetch.
   * @param {Boolean=} deep Advises a composition to search for a component also in
   * nested compostions. The default is <i>false</i>.
   * @returns {IComponent} Returns the component that matches the <i>id</i>. If no
   * component was found the returned value is <i>null</i>.
   *
   * @name getChild
   * @function
   * @memberOf CompositeBase#
   */
  proto.getChild = function(id, deep) {
    var result;
    var childs = this._childs;
    var child;
    var containerChild;

    if (typeof id === 'string') {
      if (this.getId() === id) { //the id argument is this id
        result = this;
      } else { //search in subordinates
        for (var i=0, len = childs.length; i<len; i+=1) {
          child = childs[i];
          
          if (child.getId() === id) {
            result = child;
            break;
          } else if (deep && child.isContainer()) { //the subordinate is a container
            containerChild = child.getChild(id, deep);          
            if (containerChild) {
              result = containerChild;
              break;
            }
          }
        }
      }
    } else {
      result = this._childs[id];
    }    
    
    return result;
  };

  /**
   * Add a component to a compostion.
   * <p><b>implements </b><i>IComposite#addChild</i></p>
   *
   * @param {IComponent} child The component to add.
   * @param {uint=} index Advises the composition to add the component
   * at a specific index.
   * @returns {IComposite} Returns the composite reference where <i>addChild</i>
   * was invoked.
   *
   * @name addChild
   * @function
   * @memberOf CompositeBase#
   */
  proto.addChild = function(child, index) {
    var childs = this._childs;
    var getIndex = function(len) {
      index = (index === undefined) ? len : index;
      return Math.max(0, Math.min(len, index));
    };

    if (child) {      
      childs.splice(getIndex(childs.length), 0, child);
      child.setParent(this);
    }
    return this;
  };

  /**
   * Remove a component from a compostion.
   * <p><b>implements </b><i>IComposite#removeChild</i></p>
   *
   * @param {IComponent | String | uint} child The component or 
   * the identifier of a component to remove.
   * @param {Boolean=} deep Advises the composition to process also nested compositions
   * to remove a component.
   * @returns {IComponent} Returns the removed component.
   * If no component was found the returned value is <i>null</i>.
   *
   * @name removeChild
   * @function
   * @memberOf CompositeBase#
   */
  proto.removeChild = function(child, deep) {
    var childs = this._childs;
    var containerChild;

    if (typeof child === 'string' || typeof child === 'number') {
      child = this.getChild(child, deep);
    }
    
    if (child) {
      for (var i=0, len = childs.length; i<len; i+=1) {
        containerChild = childs[i];
        if (child === containerChild)  {
          childs.splice(i,1);
          containerChild.setParent();
          break;
        } else if (deep && containerChild.isContainer()) {
          containerChild.removeChild(child, deep);
        }
      }
    }    
    return child;
  };  

  return CompositeBase;
});

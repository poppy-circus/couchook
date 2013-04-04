define(['./icomponent', '../util/class_util'], function(IComponent, classUtil) {

  "use strict";

  /**
   * The base implementation of an <i>IComponent</i>. A component
   * can be aligned in a composite hierarchy.
   *
   * @param {String} componentId The component id.
   * The id should be unique to locate a component in hierarchy.
   * @param {Boolean=} isRoot True if the component is a top level item
   * and false if not. The default is false.
   * 
   * @constructor ComponentBase
   * @extends IComponent
   * @name ComponentBase
   */
  var ComponentBase = function(componentId, isRoot) {
    this._id = componentId;
    this._parent = null;
    this._root = null;
    this._isRoot = isRoot || false;
    return this;
  };

  classUtil.implement(ComponentBase, [IComponent]);
  var proto = ComponentBase.prototype = {};

  //--------------------------------------------------------------------------
  //
  //  implementation of IComponent
  //
  //--------------------------------------------------------------------------

  /**
   * Get the id of a compoenent.
   * <p><b>implements </b><i>IComponent#getId</i></p>
   *
   * @returns {String} the component id.
   *
   * @name getId
   * @function
   * @memberOf ComponentBase#
   */
  proto.getId = function() {
    return this._id;
  };

  /**
   * Get the parent of a component.
   * A parent component is defined as the next reference in upper hierarchy.
   * <p><b>implements </b><i>IComponent#getParent</i></p>
   *
   * @returns {IComponent} the parent compoent.
   *
   * @name getParent
   * @function
   * @memberOf ComponentBase#
   */
  proto.getParent = function() {
    return this._parent;
  };

  /**
   * Get the root of a component.
   * A root component is defined as the toplevel reference in upper hierarchy.
   * <p><b>implements </b><i>IComponent#getRoot</i></p>
   *
   * @returns {IComponent} the root compoent.
   *
   * @name getRoot
   * @function
   * @memberOf ComponentBase#
   */
  proto.getRoot = function() {
    var result = this._root;
    var parent;

    if (!result) {
      parent = this._parent;
      if (this.isRoot()) {
        this._root = this;
      } else if (parent) {
        this._root = parent.getRoot();
      }
      result = this._root;
    }
    return result;
  };

  /**
   * Destroy the component. This will basicly remove the
   * dependencies to the parent and root node.
   * <p><b>implements </b><i>IComponent#dispose</i></p>
   *
   * @name dispose
   * @function
   * @memberOf ComponentBase#
   */
  proto.dispose = function() {
    this.setParent();
  };

  //--------------------------------------------------------------------------
  //
  //  public methods
  //
  //--------------------------------------------------------------------------

  /**
   * Set the parent of a component.
   * The parent became defined by adding a component to a composite.
   * @private
   * @ignore
   */
  proto.setParent = function(value) {
    this._parent = value;
    this._root = null;
  };  

  /**
   * Check if the component is a container.
   * The default is <i>false</i>.
   * @returns {Boolean} True if it is a container
   * and false if not.
   *
   * @name isContainer
   * @function
   * @memberOf ComponentBase#
   */
  proto.isContainer = function() {
    return false;
  };

  /**
   * Check if the component is root.
   * The default is <i>false</i>.
   * @returns {Boolean} True if it is root
   * and false if not.
   *
   * @name isRoot
   * @function
   * @memberOf ComponentBase#
   */
  proto.isRoot = function() {
    return this._isRoot;
  };  

  return ComponentBase;
});

/**
 * Interface of a component that can be aligned in a composite structure.
 * Clients can handle this by implementing IComponent.
 *
 * @namespace IComponent
 * @name IComponent
 */
define(function() {

  "use strict";

  //--------------------------------------------------------------------------
  //
  //  interface methods
  //
  //--------------------------------------------------------------------------

  return {
    /**
     * Get the id of a component.
     *
     * @name getId
     * @function
     * @memberOf IComponent#
     */
    getId: 'I',

    /**
     * Get the parent of a component.
     * A parent component is defined as the next reference in upper hierarchy.
     * @see IComposite
     *
     * @name getParent
     * @function
     * @memberOf IComponent#
     */
    getParent: 'I',

    /**
     * Get the root of a component.
     * A root component is defined as the toplevel reference in upper hierarchy.
     *
     * @name getRoot
     * @function
     * @memberOf IComponent#
     */
    getRoot: 'I',

    /**
     * Destroy the component.
     *
     * @name dispose
     * @function
     * @memberOf IComponent#
     */
    dispose: 'I'
  };
});

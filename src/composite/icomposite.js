/**
 * Interface of a composite that can be aligned in a composite structure and
 * can hold subodinated composite or compoenent references.
 * Clients can handle this by implementing IComposite.
 *
 * @namespace IComposite
 * @name IComposite
 * @extends IComponent
 *
 * @borrows IComponent#getId as this#getId
 * @borrows IComponent#getParent as this#getParent
 * @borrows IComponent#getRoot as this#getRoot
 * @borrows IComponent#dispose as this#dispose
 */
define(['./icomponent', '../util/lodash'], function(IComponent, lodash) {

  "use strict";

  return lodash.merge({
    /**
     * Get the amount of added components in a composition.
     *
     * @name numChildren
     * @function
     * @memberOf IComposite#
     */
    numChildren: 'I',

    /**
     * Get the index of a subordinated child processed with index+=1.
     *
     * @param {IComponent} child A component to find.
     * @param {uint=} fromIndex An optional index to start with.
     * The default is 0.
     * @returns {int} Returns the index of child. If the child isn`t presented in the composition
     * the return value is -1.
     *
     * @name indexOf
     * @function
     * @memberOf IComposite#
     */
    indexOf: 'I',

    /**
     * Get the index of a subordinated child processed with index-=1.
     *
     * @param {IComponent} child A component to find.
     * @param {uint=} fromIndex An optional index to start with.
     * The default is 0.
     * @returns {int} Returns the index of child. If the child isn`t presented in the composition
     * the return value is -1.
     *
     * @name lastIndexOf
     * @function
     * @memberOf IComposite#
     */
    lastIndexOf: 'I',

    /**
     * Get a component from a compostion.
     *
     * @param {String|uint} id The index or the name (id) of the component to fetch.
     * @param {Boolean=} deep Advises a composition to search for a component also in
     * nested compostions. The default is <i>false</i>.
     * @returns {IComponent} Returns the component that matches the <i>id</i>. If no
     * component was found the returned value is <i>null</i>.
     *
     * @name getChild
     * @function
     * @memberOf IComposite#
     */
    getChild: 'I',

    /**
     * Add a component to the composition.
     *
     * @param {IComponent} child The component to add.
     * @param {uint=} index Advises the composition to add the component
     * at a specific index.
     * @returns {IComposite} Returns the composite reference where <i>addChild</i>
     * was invoked.
     *
     * @name addChild
     * @function
     * @memberOf IComposite#
     */
    addChild: 'I',

    /**
     * Remove a component from the composition.
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
     * @memberOf IComposite#
     */
    removeChild: 'I'
  }, IComponent);
});

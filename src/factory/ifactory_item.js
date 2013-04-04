/**
 * Interface of a factory item that can be aligned in a factory item collection.
 * A factory item is used by a factory to create certain objects.
 * Clients can handle this by implementing IFactoryItem.
 *
 * @namespace IFactoryItem
 * @name IFactoryItem
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
     * Check if the factory item can handle a given resource to create
     * an object.
     *
     * @param {?} resource An object that inlcudes several parameters to evaluate
     * the creation of the object.
     *
     * @returns {Boolean} true if the item can ceate an object by the given resource
     * otherwise false
     *
     * @name canHandle
     * @function
     * @memberOf IFactoryItem#
     */
    canHandle: 'I',

    /**
     * Advise the factory item to create an object.
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
     * @name create
     * @function
     * @memberOf IFactoryItem#
     */
    create: 'I'
  };
});

define([], function() {

  "use strict";

  /**
   * A very simple cache object that stores several values by a cache key.
   *
   * @constructor Cache
   * @name Cache
   */
  var Cache = function() {
    this._resource = {};
    return this;
  };

  var proto = Cache.prototype = {};

  //--------------------------------------------------------------------------
  //
  //  public methods
  //
  //--------------------------------------------------------------------------

  /**
   * Get a property by a cache key.
   *
   * @param {String} key The cache key.
   * @returns {*} the cached property.
   *
   * @name getValueByKey
   * @function
   * @memberOf Cache#
   */
  proto.getValueByKey = function(key) {
    return this._resource[key];
  };

  /**
   * Set a property by a cache key.
   *
   * @param {String} key The cache key.
   * @param {!*} value The property to cache.
   * @returns {Cache} the cache object instance
   *
   * @name setValueByKey
   * @function
   * @memberOf Cache#
   */
  proto.setValueByKey = function(key, value) {
    this._resource[key] = value;
    return this;
  };

  /**
   * Removes all entries from the cache.
   * @returns {Cache} the cache object instance
   *
   * @name expire
   * @function
   * @memberOf Cache#
   */
  proto.expire = function() {
    this._resource = {};
    return this;
  };

  return Cache;
});

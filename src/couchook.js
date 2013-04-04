/**
 * @license (Copyright 2013 Tobias Busse <http://www.couchook.poppy-circus.de/>, poppy-circus, https://github.com/poppy-circus/couchook)
 * @copyright <a href="http://www.poppy-circus.de/">poppy-circus</a> 2013
 * @author Tobias Busse
 */
define(['./runner/runner_resource', './runner/runner_factory', './util/lodash'], function(RunnerResource, RunnerFactory, lodash) {

  "use strict";

  /**
   * Couchook is a small tool to build large and scaleable applications. It is focused
   * on decoupling plugins or external libraries by executing the artifact in its own
   * <i>Runner</i>. A runner can adivse the artifact to do something by its <i>Nature</i>
   * and the artifact itself can send notification through the <i>Attitude</i> of a Runner.
   *
   * <p>
   * The application can be extended during runtime by a simple setup of a <i>RunnerResource</i>.
   * It is also possible to initiate an application core at the very beginning.
   * </p>
   *
   * @see IRunner
   * @see RunnerResource
   * @see Nature
   * @see Attitude
   * 
   * @constructor Couchook
   * @name Couchook
   */
  var Couchook = function() {

    //--------------------------------------------------------------------------
    //
    //  public properties
    //
    //--------------------------------------------------------------------------

    /**
     * Includes all available resources and dependencies to predefine the creation
     * of a Runner. Resources is the root node of a composition.
     *
     * @name resources
     * @field
     * @type RunnerResource
     * @memberOf Couchook#
     */
    this.resources = new RunnerResource('root', true);

    /**
     * Includes all available runner implemenations to create.
     *
     * @name factory
     * @field
     * @type RunnerFactory
     * @memberOf Couchook#
     */
    this.factory = new RunnerFactory();
    return this;
  };

  var forEach = lodash.forEach;
  var proto = Couchook.prototype = {};

  //--------------------------------------------------------------------------
  //
  //  public methods
  //
  //--------------------------------------------------------------------------

  /**
   * Create a new <i>Runner</i>.
   *
   * @param {String} id The name (id) of the Runner.
   * The id was previously defined when a new <i>RunnerResource</i>
   * become added to the <i>resources</i> vector. If the id isn't available
   * a simple Runner became created.
   * @param forceContainer {Boolean} Advises the factory to create a Runner that
   * can control multiple artifacts or not. By default this value is ignored.
   * @returns A <i>IRunner</i> implementation.
   *
   * @throws {Error} an error if the id argument is undefined.
   *
   * @see IRunner
   * @see RunnerResource
   *
   * @name create
   * @function
   * @memberOf Couchook#
   */
  proto.create = function(id, forceContainer) {
    var runner;
    var detail;

    if (id) {
      detail = this.resources.getChild(id, true);
      if(! detail) {
        detail = this.resources.addResource(id);        
      }
      detail.forceContainer = !!forceContainer;
      runner = this._resolveCargoResource(detail.toObject());
    } else {
      throw new Error('id not defined');
    }    
    return runner;
  };

  //--------------------------------------------------------------------------
  //
  //  internal methods
  //
  //--------------------------------------------------------------------------

  /**
   * Resolve runner dependencies when a runner became created that includes
   * subordinated runners.
   * @private
   * @ignore
   */
  proto._resolveCargoResource = function(resource) {
    var runner = this.factory.create(resource);
    var child;

    if (runner) {
      forEach(resource.childs, function(child) {
        child = this._resolveCargoResource(child);
        if(child) {
          runner.addChild(child);
        }
      }, this);
    }
    return runner;
  };

  return Couchook;
});

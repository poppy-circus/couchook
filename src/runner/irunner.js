/**
 * The IRunner represents an interface of an application/plugin runner.
 * It assures that all applications or plugins are well decoupled and scaleable.
 *
 * Clients can handle this by implementing IRunner.
 *
 * @namespace IRunner
 * @name IRunner
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
     * Initiate or Reinitiate an application or plugin by a runner.
     *
     * @param {Object} details A controller setup.
     * The controller became qualified with the defined details.
     * @returns {IRunner} the IRunner implementation 
     *
     * @see IRunner#setup
     *
     * @name init
     * @function
     * @memberOf IRunner#
     */
    init: 'I',

    /**
     * Reset a runner to the initial state.
     * After resetting it is possible to inject a new setup
     * and reinit the runner.
     *
     * @see IRunner#dispose
     *
     * @name reset
     * @function
     * @memberOf IRunner#
     */
    reset: 'I',

    /**
     * Prepare a runner by the application or plugin dependencies.
     * After setup the runner can initiate.
     *
     * @param {Object} controller The application or plugin controller.
     * @param {Object} resource An abstract <i>RunnerResource</i>
     * The resource includes all properties to setup a runner.
     * @returns {IRunner} the IRunner implementation 
     *
     * @see IRunner#init
     * @see RunnerResource
     *
     * @name setup
     * @function
     * @memberOf IRunner#
     */
    setup: 'I',

    /**
     * Dispose a runner.
     * After disposing a runner is completly destroyed for garbage collection.
     * It is not possible to reinitiate the runner.
     *
     * @see IRunner#dispose
     *
     * @name reset
     * @function
     * @memberOf IRunner#
     */
    dispose: 'I'
  };
});

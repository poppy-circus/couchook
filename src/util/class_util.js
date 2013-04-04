/**
 * A collection of useful methods to introduce some oop concepts
 * @namespace classUtil
 * @name classUtil
 */
define(['./lodash'], function(lodash) {
    
  var forEach = lodash.forEach;

  return {

    //--------------------------------------------------------------------------
    //
    //  public methods
    //
    //--------------------------------------------------------------------------

    /**
     * Retrieve the prototype chain of a class.
     *
     * @param {Function} Class The class to extend from
     * @returns {Object} returns the prototype chain.
     *
     * @example
     * <pre>
     * var BaseClass = function(){};
     * BaseClass.prototype.hello = function(){return 'hello!';};
     *
     * var MyClass = function(){};
     * MyClass.prototype = classUtil.extend(BaseClass);
     *
     * var myClass = new MyClass();
     * myClass.hello();
     * </pre>
     *
     * @name extend
     * @function
     * @memberOf classUtil#
     */
    extend: function(Class) {
      var Construct = function() {};
      Construct.prototype = Class.prototype;
      return new Construct();
    },

    /**
     * Adds interface placeholder to the prototype chain of a class.
     *
     * @param {Function} Class The class that is going to implement the interface
     * @param {Array} Interfaces A list of interfaces
     *
     * @example
     * <pre>
     * var IEventDispatcher: {on: 'I', off: 'I', dispatch: 'I'};
     * var IComposite: {addChild: 'I', removeChild: 'I', getChild: 'I'};
     *
     * var MyClass = function(){};
     * classUtil.implement(MyClass, [IEventDispatcher, IComposite]);
     *
     * var myClass = new MyClass(); 
     * //finally MyClass has to implement the interface
     * console.log(myClass.on); //returns I
     * </pre>
     *
     * @name implement
     * @function
     * @memberOf classUtil#
     */
    implement: function(Class, Interfaces) {
      forEach(Interfaces, function(Interface) {
        forEach(Interface, function(fn, name) {
          Class.prototype[name] = fn;
        });
      });
    },

    /**
     * Adds methods to the prototype chain of an instance.
     *
     * @param {Object} Instance An object where the methods are mixed in.
     * @param {Object} Mixin A collection of methods
     *
     * @example
     * <pre>
     * var Mixin = {sayHello: function(){return this.value;}};
     * var MyClass = function(){this.value='hello';};
     * var myClass = new MyClass();
     * classUtil.mixin(myClass, Mixin);
     *
     * console.log(myClass.sayHello()); //returns 'hello'
     * </pre>
     *
     * @name mixin
     * @function
     * @memberOf classUtil#
     */
    mixin: function(Instance, Mixin) {
      forEach(Mixin, function(value, name) {
        Instance[name] = value;
      });
    },

    /**
     * Removes methods from the prototype chain of an instance.
     *
     * @param {Object} Instance An object where the methods are mixed out.
     * @param {Object} Mixin A collection of methods
     *
     * @example
     * <pre>
     * var Mixin = {sayHello: function(){return this.value;}};
     * var MyClass = function(){this.value='hello';};
     * var myClass = new MyClass();
     * classUtil.mixin(myClass, Mixin);
     * classUtil.mixout(myClass, Mixin);
     *
     * console.log(myClass.sayHello()); //Error
     * </pre>
     *
     * @name mixout
     * @function
     * @memberOf classUtil#
     */
    mixout: function(Instance, Mixin) {
      forEach(Mixin, function(value, name) {
        Instance[name] = undefined;
      });
    },

    /**
     * Evaluates if an object implements or extends another object.
     *
     * @param {Function|Object} Artifact A class or interface where the object is evaluated on.
     * @returns {Boolean} Returns true if the object implements or extends the artifact otherwise 
     * it returns false.
     *
     * @example
     * <pre>
     * var BaseClass = function(){};
     * var IHello: {sayHello: 'I'};
     * classUtil.implement(BaseClass, [IHello]);
     *
     * var MyClass = function(){};
     * MyClass.prototype = classUtil.extend(BaseClass);
     * classUtil.is.call(new MyClass(), BaseClass); //returns true
     * classUtil.is.call(new MyClass(), IHello); //returns false -> implementation missing
     *
     * BaseClass.prototype.sayHello = function(){};
     * classUtil.is.call(new MyClass(), IHello); //returns true
     * </pre>
     *
     * @name is
     * @function
     * @memberOf classUtil#
     */
    is: function(Artifact) {
      var result = true;

      if (!Artifact) {
        result = false;
      } else if (typeof Artifact === 'object') {
        for (var fn in Artifact) {
          if (this[fn] === 'I' || this[fn] === undefined) {
            result = false;
            break;
          }
        }
      } else if (typeof Artifact === 'function') {
        result = this instanceof Artifact;
      }

      return result;
    }
  };
});

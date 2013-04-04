require(['src/runner/sandbox', 'src/runner/irunner', 'src/runner/module', 'src/composite/composite_base', 'src/runner/identity/nature', 'src/runner/identity/attitude', 'src/util/cache'], 
  function(Sandbox, IRunner, Module, CompositeBase, Nature, Attitude, Cache) {

  describe('Sandbox', function() {

    it('is a class', function() {
      expect(new Sandbox()).toBeInstanceOf(Sandbox);
    });

    it('implements IRunner', function() {
      expect(new Sandbox()).toBeImplementationOf(IRunner);
    });

    it('extends CompositeBase', function() {
      expect(new Sandbox()).toBeInstanceOf(CompositeBase);
    });

    it('is a container', function() {
      expect(new Sandbox().isContainer()).toBeTruthy();
    });

    it('is a root in hierarchy', function() {
      expect(new Sandbox().isRoot()).toBeTruthy();
    });

    describe('public properties', function(){
      var sandbox;

      beforeEach(function() {
        sandbox = new Sandbox('test-sandbox');
      });

      describe('has a property `nature`', function() {
        it('is not defined before initiation', function() {
          expect(sandbox.nature).toBeUndefined();
        });

        it('is available after calling `init`', function() {
          expect(sandbox.init().nature).toBeInstanceOf(Nature);
        });

        it('is available after calling `reset`', function() {
          expect(sandbox.init().reset().nature).toBeInstanceOf(Nature);
        });

        it('is not available after calling `dispose`', function() {
          expect(sandbox.init().dispose().nature).toBeUndefined();
        });
      });

      describe('has a property `attitude`', function() {
        it('is not defined before initiation', function() {
          expect(sandbox.attitude).toBeUndefined();
        });

        it('is available after calling `init`', function() {
          expect(sandbox.init().attitude).toBeInstanceOf(Attitude);
        });

        it('is available after calling `reset`', function() {
          expect(sandbox.init().reset().attitude).toBeInstanceOf(Attitude);
        });

        it('is not available after calling `dispose`', function() {
          expect(sandbox.init().dispose().attitude).toBeUndefined();
        });
      });

      describe('has a property `cache`', function() {
        it('is not defined before initiation', function() {
          expect(sandbox.cache).toBeUndefined();
        });

        it('is available after calling `init`', function() {
          expect(sandbox.init().cache).toBeInstanceOf(Cache);
        });

        it('is available after calling `reset`', function() {
          expect(sandbox.init().reset().cache).toBeInstanceOf(Cache);
        });

        it('is not available after calling `dispose`', function() {
          expect(sandbox.init().dispose().cache).toBeUndefined();
        });
      });
    });

    describe('methods', function() {
      var sandbox;

      beforeEach(function() {
        sandbox = new Sandbox('test-sandbox');
      });

      describe('has a method `setup`', function() {
        it('sets the controller', function() {
          var controller = {};
          sandbox.setup(controller).init();          
          expect(sandbox.nature.controller).toBe(controller);
        });

        it('clones the trait setup of a resource', function() {
          var resource = { traits:[ {load: function(){}} ] };
          sandbox.setup(null, resource).init();          
          expect(sandbox.nature.load).toBe(resource.traits[0].load);
        });

        it('clones the events setup of a resource', function() {
          var spy = jasmine.createSpy('eventmap');
          var resource = {
            events: {nature: {init: ['init']}},
            traits:[{init: spy}]
          };
          sandbox.setup(null, resource).init();
          sandbox.nature.init();        
          expect(spy).toHaveBeenCalled();
        });

        it('clones the state setup of a resource', function() {
          var resource = { states: {loading: []} };
          sandbox.setup(null, resource).init();          
          expect(sandbox.attitude.currentState.loading).toBeDefined();
        });

        it('sets the initial state', function() {
          var resource = {initialState: 'initialState'};
          sandbox.setup(null, resource).init();          
          expect(sandbox.attitude.currentState.name).toBe(resource.initialState);
        });

        it('returns the sandbox reference', function() {
          expect(sandbox.setup()).toBe(sandbox);
        });
      });

      describe('has a method `init`', function() {
        it('qualifies the controller', function() {
          var spy = jasmine.createSpy('qualify');
          var controller = { qualify: spy };
          sandbox.setup(controller);
          sandbox.init();
          expect(spy).toHaveBeenCalled();
        });

        it('qualifies the controller with details', function() {
          var d;
          var spy = jasmine.createSpy('qualify').andCallFake(function(attitude, detail) {
            d = detail;
          });
          var controller = { qualify: spy };
          sandbox.setup(controller);
          sandbox.init({});
          expect(d).toBeDefined();
        });

        it('qualifies the controller with an attitude', function() {
          var a;
          var spy = jasmine.createSpy('qualify').andCallFake(function(attitude, resource) {
            a = attitude;
          });
          var controller = { qualify: spy };
          sandbox.setup(controller);
          sandbox.init();
          expect(a).toBeDefined();
        });

        it('adds traits to the nature', function() {
          var loadTrait = { load: function(){ this.controller.load(); }};

          sandbox.setup({
            qualify: function(){},
            load: function(){}
          }, { traits: [loadTrait] });
          sandbox.init();

          expect(sandbox.nature.load).toBe(loadTrait.load);
        });

        it('adds states to the attitude', function() {
          var a;
          sandbox.setup({
            qualify: function(attitude){ a = attitude; }
          }, { states: {loadState: []} });
          sandbox.init();
          expect(a.currentState.loadState).toBeDefined();
        });

        it('sets the initial state of the attitude', function() {
          var a;
          sandbox.setup({
            qualify: function(attitude){ a = attitude; }
          }, { initialState: 'initial' });
          sandbox.init();
          expect(a.currentState.name).toBe('initial');
        });

        it('sets the controller property of the nature', function() {
          var controller = {
            qualify: function(){}
          };
          sandbox.setup(controller);
          sandbox.init();
          expect(sandbox.nature.controller).toBe(controller);
        });

        it('won`t initiate if the sandbox is already initiated', function() {
          var spy = jasmine.createSpy('init-once');
          var controller = {qualify: spy};
          sandbox.setup(controller);
          sandbox.init();
          sandbox.init();
          expect(spy.callCount).toBe(1);
        });

        it('sets a route to the nature of a subordinated module to submit commands', function() {
          var module = new Module('myModule').init();
          sandbox.addChild(module);
          sandbox.init();
          expect(sandbox.nature.myModule).toBe(module.nature);
        });

        it('initiates a subordinated module if its not initated yet', function() {
          var module = new Module('myModule');
          spyOn(module, 'init').andCallFake(function(){this.nature = new Nature();});
          sandbox.addChild(module);
          sandbox.init();
          expect(module.init).toHaveBeenCalled();
        });

        it('sets a route to the nature of a subordinated module to receive events', function() {
          var spy = jasmine.createSpy('listener');
          var module = new Module('myModule').init();
          sandbox.addChild(module);
          sandbox.init();
          sandbox.nature.on('myEvent', spy);

          module.nature.dispatch('myEvent');
          expect(spy).toHaveBeenCalled();
        });

        it('returns the sandbox reference', function() {
          expect(sandbox.init()).toBe(sandbox);
        });
      });

      describe('has a method `dispose`', function() {
        it('calls function `sandbox.reset`', function() {
          spyOn(sandbox, 'reset');
          sandbox.dispose();
          expect(sandbox.reset).toHaveBeenCalled();
        });

        it('unsets the nature', function() {
          sandbox.init().dispose();
          expect(sandbox.nature).toBeUndefined();
        });

        it('unsets the attitude', function() {
          sandbox.init().dispose();
          expect(sandbox.attitude).toBeUndefined();
        });

        it('unsets the cache', function() {
          sandbox.init().dispose();
          expect(sandbox.cache).toBeUndefined();
        });

        it('returns the sandbox reference', function() {
          expect(sandbox.dispose()).toBe(sandbox);
        });
      });

      describe('has a method `reset`', function() {
        it('removes traits from the nature', function() {
          sandbox.setup(null, { traits:[ {load: function(){}} ] });
          sandbox.init().reset();
          expect(sandbox.nature.load).toBeUndefined();
        });

        it('keeps the controller', function() {
          var controller = {};
          sandbox.setup(controller).init().reset();
          expect(sandbox.nature.controller).toBe(controller);
        });

        it('disqualifies the controller', function() {
          var spy = jasmine.createSpy('disqualify');
          var controller = {
            qualify: function(){},
            disqualify: spy
          };

          sandbox.setup(controller).init().reset();
          expect(spy).toHaveBeenCalled();
        });

        it('sets the attitude to stateless', function() {
          sandbox.setup().init().reset();
          expect(sandbox.attitude.currentState.name).toBe('stateless');
        });

        it('won`t reset if the sandbox is already resetted', function() {
          var spy = jasmine.createSpy('reset-once');
          var controller = {disqualify: spy};
          sandbox.setup(controller).init();
          sandbox.reset();
          sandbox.reset();
          expect(spy.callCount).toBe(1);
        });

        it('resets a subordinated module if its not resetted yet', function() {
          var module = new Module('myModule').init();
          spyOn(module, 'reset');
          sandbox.addChild(module);
          sandbox.init().reset();
          expect(module.reset).toHaveBeenCalled();
        });

        it('removes module command delegation from the sandbox nature', function() {          
          sandbox.addChild(new Module('myModule'));
          sandbox.init().reset();
          expect(sandbox.nature.myModule).toBeUndefined();
        });

        it('removes module event notifications from the sandbox nature', function() {          
          var module = new Module('myModule');
          sandbox.addChild(module);
          sandbox.init().reset();
          expect(module.nature.hasListener('*')).toBe(false);
        });

        it('expires the cache', function() {          
          sandbox.init();
          sandbox.cache.setValueByKey('foo', 'bar');
          sandbox.reset();
          expect(sandbox.cache.getValueByKey('foo')).toBeUndefined();
        });

        it('returns the sandbox reference', function() {
          expect(sandbox.reset()).toBe(sandbox);
        });
      });

      describe('has a method `addChild`', function() {
        it('adds a module to the sandbox', function() {
          sandbox.addChild(new Module('mod'));
          expect(sandbox.numChildren()).toBe(1);
        });

        it('sets a route to the module if the sandbox is already initiated', function() {
          sandbox.init();
          sandbox.addChild(new Module('myModule'));
          expect(sandbox.nature.myModule).toBeDefined();
        });

        it('connects a module after the sandbox was initiated', function() {
          sandbox.init();
          sandbox.addChild(new Module('myModule'));
          expect(sandbox.nature.myModule.getId()).toEqual('myModule');
        });
      });

      describe('has a method `removeChild`', function() {
        it('removes a module from the sandbox', function() {
          var module = new Module('myModule');
          sandbox.init();
          sandbox.addChild(module);
          sandbox.removeChild(module);
          expect(sandbox.numChildren()).toBe(0);
        });

        it('resets the module', function() {
          var module = new Module('myModule').init();
          spyOn(module, 'reset');
          sandbox.init();
          sandbox.addChild(module);
          sandbox.removeChild(module);
          expect(module.reset).toHaveBeenCalled();
        });

        it('removes the connection between module and sandbox nature', function() {
          var module = new Module('myModule');
          sandbox.init();
          sandbox.addChild(module);
          sandbox.removeChild(module);
          expect(sandbox.nature.myModule).toBeUndefined();
        });
      });
    });    

    describe('reinitiation', function() {      
      var Controller = function(){
        this.attitude = undefined;
        this.detail = undefined;
        this.qualify = function(attitude, detail){this.attitude = attitude; this.detail = detail;};
        this.disqualify = function(){this.attitude = undefined; this.detail = undefined;};
      };
      var sandbox;
      var controller;
      var detail = {};
      var resource;

      beforeEach(function() {
        sandbox = new Sandbox('test-sandbox');
        controller = new Controller();
        resource = {
          states: { init: [] },
          traits: [{ init: function(){} }],
          initialState: 'default'
        };

        sandbox
          .setup(controller, resource)
          .init(detail);
      });

      it('qualifies the controller by the attitude again', function() {
        sandbox.reset().init();
        expect(controller.attitude).toBeInstanceOf(Attitude);
      });

      it('qualifies the controller by the detail again', function() {
        sandbox.reset().init(detail);
        expect(controller.detail).toBe(detail);
      });

      it('reinits the states of the attitude', function() {
        sandbox.reset().init();
        expect(typeof sandbox.attitude.currentState.init).toBe('function');
      });

      it('reinits the traits of the nature', function() {
        sandbox.reset().init();
        expect(typeof sandbox.nature.init).toBe('function');
      });

      it('resets the attitude to the initial state', function() {
        sandbox.reset().init();
        expect(sandbox.attitude.currentState.name).toBe('default');
      });

      it('reinitiates with a clear cache', function() {
        sandbox.cache.setValueByKey('foo', 'bar');
        sandbox.reset().init();
        expect(sandbox.cache.getValueByKey('foo')).toBeUndefined();
      });

      it('reinitiates the routing', function() {
        var listener = jasmine.createSpy('listener');
        var module = new Module('myModule');

        sandbox.addChild(module);
        sandbox.nature.on('test', listener);
        sandbox.reset().init();
        module.nature.dispatch('test');
        expect(listener).toHaveBeenCalled();
      });
    });

    describe('event caching', function(){
      var sandbox;
      var module;

      beforeEach(function() {
        sandbox = new Sandbox('sandbox');
        module = new Module('module');
        module.setup(null, {traits: [{execute: function(){ this.dispatch('onExecute'); }}]});
        
        sandbox.addChild(module);        
        sandbox.setup(null, {
          traits: [{onExecuted: function(){}}],
          events: {module: {onExecute: ['onExecuted']}}
        }).init();
      });

      it('caches the event function', function() {
        var cache = sandbox.cache;
        spyOn(cache, 'setValueByKey').andCallFake(function(key, value){
          cache._resource[key] = value;
          return cache;
        });

        module.nature.execute();
        expect(cache.setValueByKey).toHaveBeenCalledWith('module-onExecute', [{nature: sandbox.nature, fn: sandbox.nature.onExecuted}]);
      });

      it('reuses the cache after one call', function() {
        var cache = sandbox.cache;
        module.nature.execute();
        spyOn(cache, 'setValueByKey');
        
        module.nature.execute();
        expect(cache.setValueByKey).not.toHaveBeenCalled();
      });
    });
  });
});

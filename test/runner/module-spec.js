require(['src/runner/module', 'src/runner/irunner', 'src/composite/component_base', 'src/runner/identity/nature', 'src/runner/identity/attitude'],
  function(Module, IRunner, ComponentBase, Nature, Attitude) {

  describe('Module', function() {

    it('is a class', function() {
      expect(new Module()).toBeInstanceOf(Module);
    });

    it('implements IRunner', function() {
      expect(new Module()).toBeImplementationOf(IRunner);
    });

    it('extends ComponentBase', function() {
      expect(new Module()).toBeInstanceOf(ComponentBase);
    });

    it('is a leaf', function() {
      expect(new Module().isContainer()).toBeFalsy();
    });

    it('is a not a root in hierarchy', function() {
      expect(new Module().isRoot()).toBeFalsy();
    });

    describe('public properties', function(){
      var module;

      beforeEach(function() {
        module = new Module('test-module');
      });

      describe('has a property `nature`', function() {
        it('is not defined before initiation', function() {
          expect(module.nature).toBeUndefined();
        });

        it('is available after calling `init`', function() {
          expect(module.init().nature).toBeInstanceOf(Nature);
        });

        it('is available after calling `reset`', function() {
          expect(module.init().reset().nature).toBeInstanceOf(Nature);
        });

        it('is not available after calling `dispose`', function() {
          expect(module.init().dispose().nature).toBeUndefined();
        });
      });

      describe('has a property `attitude`', function() {
        it('is not defined before initiation', function() {
          expect(module.attitude).toBeUndefined();
        });

        it('is available after calling `init`', function() {
          expect(module.init().attitude).toBeInstanceOf(Attitude);
        });

        it('is available after calling `reset`', function() {
          expect(module.init().reset().attitude).toBeInstanceOf(Attitude);
        });

        it('is not available after calling `dispose`', function() {
          expect(module.init().dispose().attitude).toBeUndefined();
        });
      });
    });

    describe('methods', function() {
      var module;

      beforeEach(function() {
        module = new Module('test-module');
      });

      describe('has a method `setup`', function() {
        it('sets the controller', function() {
          var controller = {};
          module.setup(controller).init();          
          expect(module.nature.controller).toBe(controller);
        });

        it('clones the trait setup of a resource', function() {
          var resource = { traits:[ {load: function(){}} ] };
          module.setup(null, resource).init();          
          expect(module.nature.load).toBe(resource.traits[0].load);
        });

        it('clones the state setup of a resource', function() {
          var resource = { states: {loading: []} };
          module.setup(null, resource).init();          
          expect(module.attitude.currentState.loading).toBeDefined();
        });

        it('sets the initial state', function() {
          var resource = {initialState: 'initialState'};
          module.setup(null, resource).init();          
          expect(module.attitude.currentState.name).toBe(resource.initialState);
        });

        it('returns the module reference', function() {
          expect(module.setup()).toBe(module);
        });
      });

      describe('has a method `init`', function() {
        it('qualifies the controller', function() {
          var spy = jasmine.createSpy('qualify');
          var controller = { qualify: spy };
          module.setup(controller);
          module.init();
          expect(spy).toHaveBeenCalled();
        });

        it('qualifies the controller with details', function() {
          var d;
          var spy = jasmine.createSpy('qualify').andCallFake(function(attitude, detail) {
            d = detail;
          });
          var controller = { qualify: spy };
          module.setup(controller);
          module.init({});
          expect(d).toBeDefined();
        });

        it('qualifies the controller with an attitude', function() {
          var a;
          var spy = jasmine.createSpy('qualify').andCallFake(function(attitude, resource) {
            a = attitude;
          });
          var controller = { qualify: spy };
          module.setup(controller);
          module.init();
          expect(a).toBeDefined();
        });

        it('adds traits to the nature', function() {
          var loadTrait = { load: function(){ this.controller.load(); }};

          module.setup({
            qualify: function(){},
            load: function(){}
          }, { traits: [loadTrait] });
          module.init();

          expect(module.nature.load).toBe(loadTrait.load);
        });

        it('adds states to the attitude', function() {
          var a;
          module.setup({
            qualify: function(attitude){ a = attitude; }
          }, { states: {loadState: []} });
          module.init();
          expect(a.currentState.loadState).toBeDefined();
        });

        it('sets the initial state of the attitude', function() {
          var a;
          module.setup({
            qualify: function(attitude){ a = attitude; }
          }, { initialState: 'initial' });
          module.init();
          expect(a.currentState.name).toBe('initial');
        });

        it('sets the controller property of the nature', function() {
          var controller = {
            qualify: function(){}
          };
          module.setup(controller);
          module.init();
          expect(module.nature.controller).toBe(controller);
        });

        it('won`t initiate if the module is already initiated', function() {
          var spy = jasmine.createSpy('init-once');
          var controller = {qualify: spy};
          module.setup(controller);
          module.init();
          module.init();
          expect(spy.callCount).toBe(1);
        });

        it('returns the module reference', function() {
          expect(module.init()).toBe(module);
        });
      });

      describe('has a method `dispose`', function() {
        it('calls function `module.reset`', function() {
          spyOn(module, 'reset');
          module.dispose();
          expect(module.reset).toHaveBeenCalled();
        });

        it('unsets the nature', function() {
          module.init().dispose();
          expect(module.nature).toBeUndefined();
        });

        it('unsets the attitude', function() {
          module.init().dispose();
          expect(module.attitude).toBeUndefined();
        });

        it('returns the module reference', function() {
          expect(module.dispose()).toBe(module);
        });
      });

      describe('has a method `reset`', function() {
        it('removes traits from the nature', function() {
          module.setup(null, { traits:[ {load: function(){}} ] });
          module.init().reset();
          expect(module.nature.load).toBeUndefined();
        });

        it('keeps the controller', function() {
          var controller = {};
          module.setup(controller).init().reset();
          expect(module.nature.controller).toBe(controller);
        });

        it('disqualifies the controller', function() {
          var spy = jasmine.createSpy('disqualify');
          var controller = {
            qualify: function(){},
            disqualify: spy
          };

          module.setup(controller).init().reset();
          expect(spy).toHaveBeenCalled();
        });

        it('sets the attitude to stateless', function() {
          module.setup().init().reset();
          expect(module.attitude.currentState.name).toBe('stateless');
        });

        it('won`t reset if the module is already reesetted', function() {
          var spy = jasmine.createSpy('reset-once');
          var controller = {disqualify: spy};
          module.setup(controller).init();
          module.reset();
          module.reset();
          expect(spy.callCount).toBe(1);
        });

        it('returns the module reference', function() {
          expect(module.reset()).toBe(module);
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
      var module;
      var controller;
      var detail = {};
      var resource;

      beforeEach(function() {
        module = new Module('test-module');
        controller = new Controller();
        resource = {
          states: { init: [] },
          traits: [{ init: function(){} }],
          initialState: 'default'
        };

        module
          .setup(controller, resource)
          .init(detail);
      });

      it('qualifies the controller by the attitude again', function() {
        module.reset().init();
        expect(controller.attitude).toBeInstanceOf(Attitude);
      });

      it('qualifies the controller by the detail again', function() {
        module.reset().init(detail);
        expect(controller.detail).toBe(detail);
      });

      it('reinits the states of the attitude', function() {
        module.reset().init();
        expect(typeof module.attitude.currentState.init).toBe('function');
      });

      it('reinits the traits of the nature', function() {
        module.reset().init();
        expect(typeof module.nature.init).toBe('function');
      });

      it('resets the attitude to the initial state', function() {
        module.reset().init();
        expect(module.attitude.currentState.name).toBe('default');
      });
    });
  });
});

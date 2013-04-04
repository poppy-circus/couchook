require(['src/couchook', 'src/runner/module', 'src/runner/sandbox'], function(CoucHook, Module, Sandbox) {

  describe('couchook usage', function() {
    describe('factory', function() {
      var AppControllerMock = function () {
        this.attitude = null;
        this.qualify = function(attitude, data){this.attitude = attitude;};
        this.load = function(){ this.attitude.currentState.onLoadStart(); };
      };

      var couchook;
      var runner;

      beforeEach(function(){
        couchook = new CoucHook();
      });

      describe('single module', function() {
        beforeEach(function(){
          couchook.resources.addResource(
            'runner', new AppControllerMock(),
            [{load: function(){ this.controller.load(); }}],
            {onLoadStart: []}
          );
          runner = couchook.create('runner').init();
        });

        it('invoke a controller method by the nature of runner', function() {
          spyOn(runner.nature.controller, 'load');
          runner.nature.load();
          expect(runner.nature.controller.load).toHaveBeenCalled();
        });

        it('retrieve an event by the nature of runner', function() {
          var listener = jasmine.createSpy('runner-event');          
          runner.nature.on('onLoadStart', listener);
          runner.nature.load();
          expect(listener).toHaveBeenCalledWith(runner.attitude.currentState, { type: 'onLoadStart', target: runner.nature });
        });
      });

      describe('sandbox with one child', function() { 
        beforeEach(function() {
          couchook.resources.importResource({
            id: 'sandbox',
            childs: [{
              id: 'module',
              controller: new AppControllerMock(),
              traits: [{load: function(){ this.controller.load(); }}],
              states: {onLoadStart: []}
            }]
          });
          runner = couchook.create('sandbox').init();
        });

        it('invoke a controller method of a module by a sandbox nature', function() {
          spyOn(runner.getChild(0).nature.controller, 'load');
          runner.nature.module.load();
          expect(runner.getChild(0).nature.controller.load).toHaveBeenCalled();
        });

        it('retrieve an event by the nature of a sandbox', function() {
          var listener = jasmine.createSpy('runner-event');
          runner.nature.on('onLoadStart', listener);
          runner.nature.module.load();
          expect(listener).toHaveBeenCalledWith(runner.getChild(0).nature.controller.attitude.currentState, { type: 'onLoadStart', target: runner.nature });
        });
      });

      describe('sandbox with more than one child', function() {
        var InvokerControllerMock = function () {
          this.attitude = null;
          this.qualify = function(attitude, resource){this.attitude = attitude;};
          this.load = function(){ this.attitude.currentState.load(); };
        };

        var ReceiverControllerMock = function () {
          this.attitude = null;
          this.qualify = function(attitude, resource){this.attitude = attitude;};
          this.onLoadStateChange = function(state){};
        };

        var NegotiatorControllerMock = function () {
          this.attitude = null;
          this.qualify = function(attitude, resource){this.attitude = attitude;};
          this.init = function(){ this.attitude.currentState.init(); };
        };

        beforeEach(function() {
          couchook.resources.importResource({
            id: 'main',
            childs: [{
              id: 'negotiator',
              traits: [{init: function(){ this.controller.init(); }}],
              controller: new NegotiatorControllerMock(),
              states: {init: []},
              events: {invoker: {load: ['receiver.onLoadStateChange']}, nature: {init: ['invoker.load']}},
              childs: [
                {
                  id: 'invoker',
                  controller: new InvokerControllerMock(),
                  traits: [{load: function(){ this.controller.load(); }}],
                  states: {load: []}
                }, {
                  id: 'receiver',
                  controller: new ReceiverControllerMock(),
                  traits: [{onLoadStateChange: function(event, meta){ this.controller.onLoadStateChange(meta.type); }}]
                }
              ]
            }]
          });
          runner = couchook.create('negotiator').init();
        });

        it('invokes the delegation process by a module', function() {
          var controller = runner.getChild('receiver').nature.controller;
          spyOn(controller, 'onLoadStateChange');
          runner.getChild('invoker').nature.load();
          expect(controller.onLoadStateChange).toHaveBeenCalledWith('load');
        });

        it('invokes the delegation process by a sandbox', function() {
          var controller = runner.getChild('receiver').nature.controller;
          spyOn(controller, 'onLoadStateChange');
          runner.nature.controller.init();
          expect(controller.onLoadStateChange).toHaveBeenCalledWith('load');
        });

        it('invokes the delegation process by a sandbox in upper hierarchy', function() {
          runner = couchook.create('main').init();
          var controller = runner.getChild('receiver', true).nature.controller;
          spyOn(controller, 'onLoadStateChange');
          runner.nature.negotiator.init();
          expect(controller.onLoadStateChange).toHaveBeenCalledWith('load');
        });
      });
    });

    describe('runner', function() {
      describe('Module behavior', function() {      
        var module;
        var controller;
        var resource;

        var Controller = function () {
          this.attitude = null;
          this.qualify = function(attitude, data){this.attitude = attitude;};
          this.load = function(){ this.attitude.currentState.onLoadStart(); };
        };

        beforeEach(function() {
          controller = new Controller();
          resource = {
            traits: [{load: function(){ this.controller.load(); }}],
            states: {onLoadStart: []}
          };

          module = new Module('test-module')
            .setup(controller, resource)
            .init();
        });

        it('invoke a controller method by the nature of module', function() {
          spyOn(controller, 'load');
          module.nature.load();
          expect(controller.load).toHaveBeenCalled();
        });

        it('retrieve an event by the nature of module', function() {
          var listener = jasmine.createSpy('module-event');
          var nature = module.nature;
          
          nature.on('onLoadStart', listener);
          nature.load();
          expect(listener).toHaveBeenCalledWith(module.attitude.currentState, { type: 'onLoadStart', target: nature });
        });
      });

      describe('Behavior between Sandbox and Module', function() { 
        var module;
        var sandbox;
        var controller;
        var resource;

        var Controller = function () {
          this.attitude = null;
          this.qualify = function(attitude, data){this.attitude = attitude;};
          this.load = function(){ this.attitude.currentState.onLoadStart(); };
        };

        beforeEach(function() {
          controller = new Controller();
          resource = {
            traits: [{load: function(){ this.controller.load(); }}],
            states: {onLoadStart: []}
          };
          module = new Module('testModule').setup(controller, resource);
          sandbox = new Sandbox('testSandbox');
          sandbox.addChild(module);
          sandbox.init();
        });

        it('invoke a controller method of a module by a sandbox nature', function() {
          spyOn(controller, 'load');
          sandbox.nature.testModule.load();
          expect(controller.load).toHaveBeenCalled();
        });

        it('retrieve an event by the nature of a sandbox', function() {
          var listener = jasmine.createSpy('sandbox-event');
          sandbox.nature.on('onLoadStart', listener);
          sandbox.nature.testModule.load();
          expect(listener).toHaveBeenCalledWith(controller.attitude.currentState, { type: 'onLoadStart', target: sandbox.nature });
        });
      });

      describe('Behavior between Module and Module aligned in a sandbox', function() {
        var invokerController, receiverController, negotiator, negotiatorController;

        var InvokerController = function () {
          this.attitude = null;
          this.result = {};
          this.qualify = function(attitude, resource){this.attitude = attitude;};
          this.load = function(){ this.attitude.currentState.load(); };
        };

        var ReceiverController = function () {
          this.attitude = null;
          this.qualify = function(attitude, resource){this.attitude = attitude;};
          this.onLoadStateChange = function(state){};
        };

        var NegotiatorController = function () {
          this.attitude = null;
          this.qualify = function(attitude, resource){this.attitude = attitude;};
          this.init = function(){ this.attitude.currentState.init(); };
        };

        beforeEach(function() {
          receiverController = new ReceiverController();
          negotiatorController = new NegotiatorController();
          invokerController = new InvokerController();
          
          negotiator = new Sandbox('negotiator').setup(negotiatorController, {
            traits: [{init: function(){ this.controller.init(); }}],
            states: {init: []},
            events: {invoker: {load: ['receiver.onLoadStateChange']}, nature: {init: ['invoker.load']}}
          });

          negotiator.addChild(new Module('invoker')
            .setup(invokerController, {
              traits: [{load: function(){ this.controller.load(); }}],
              states: {load: []}
            }));

          negotiator.addChild(new Module('receiver')
            .setup(receiverController, {
              traits: [{onLoadStateChange: function(event, meta){ this.controller.onLoadStateChange(meta.type); }}]
            }));

          negotiator.init();
        });

        it('invokes the delegation process by a module', function() {
          spyOn(receiverController, 'onLoadStateChange');
          invokerController.load();
          expect(receiverController.onLoadStateChange).toHaveBeenCalledWith('load');
        });

        it('invokes the delegation process by a sandbox', function() {
          spyOn(receiverController, 'onLoadStateChange');
          negotiatorController.init();
          expect(receiverController.onLoadStateChange).toHaveBeenCalledWith('load');
        });

        it('invokes the delegation process by a sandbox in upper hierarchy', function() {
          spyOn(receiverController, 'onLoadStateChange');          
          var main = new Sandbox('main');
          main.addChild(negotiator);
          main.init();
          main.nature.negotiator.init();
          expect(receiverController.onLoadStateChange).toHaveBeenCalledWith('load');
        });
      });

      describe('moving a module from one sandbox to another', function() {
        var module;
        var sandbox1;
        var sandbox2;

        beforeEach(function() {
          module = new Module('module').init();
          sandbox1 = new Sandbox('sandbox1').init();
          sandbox2 = new Sandbox('sandbox2').init();
          sandbox1.addChild(module);
        });

        it('removes the module dependencies from the orgin sandbox', function() {
          sandbox2.addChild(sandbox1.removeChild(module));
          expect(sandbox1.nature.module).toBeUndefined();
        });

        it('adds the module dependencies to the destination sandbox', function() {
          sandbox2.addChild(sandbox1.removeChild(module));
          expect(sandbox2.nature.module).toBeDefined();
        });
      });
    });
  });
});

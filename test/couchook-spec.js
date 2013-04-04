require(['src/couchook', 'src/runner/runner_resource', 'src/runner/runner_factory', 'src/runner/module', 'src/runner/sandbox'], function(CoucHook, RunnerResource, RunnerFactory, Module, Sandbox) {

  describe('couchook', function() {

    it('is a class', function() {
      expect(new CoucHook()).toBeInstanceOf(CoucHook);
    });

    describe('public properties', function() {
      it('has a property `resources`', function() {
        expect(new CoucHook().resources).toBeInstanceOf(RunnerResource);
      });

      it('has a property `factory`', function() {
        expect(new CoucHook().factory).toBeInstanceOf(RunnerFactory);
      });
    });

    describe('methods', function() {
      var couchook;

      beforeEach(function() {
        couchook = new CoucHook();
      });

      describe('has a method `create`', function() {
        it('creates a module runner by default if the id don`t exists', function() {
          var cargo = couchook.create('id');
          expect(cargo).toBeInstanceOf(Module);
        });

        it('can force a sandbox runner to create if the id don`t exists', function() {
          var runner = couchook.create('id', true);
          expect(runner).toBeInstanceOf(Sandbox);
        });

        it('can create a simple module runner', function() {
          couchook.resources.importResource({id: 'module'});
          var runner = couchook.create('module');
          expect(runner).toBeInstanceOf(Module);
        });

        it('can create a simple sandbox runner', function() {
          couchook.resources.importResource({id: 'sandbox', childs: [{id: 'module'}]});
          var runner = couchook.create('sandbox');
          expect(runner).toBeInstanceOf(Sandbox);
        });

        it('can create a simple sandbox runner with a subordinated module', function() {
          couchook.resources.importResource({id: 'sandbox', childs: [{id: 'module'}]});
          var runner = couchook.create('sandbox');
          expect(runner.getChild(0)).toBeInstanceOf(Module);
        });

        it('throws an exception when the id is not defined', function() {
          var e = new Error('id not defined');
          expect(function() { couchook.create(); }).toThrow(e);
        });
      });
    });
  });
});


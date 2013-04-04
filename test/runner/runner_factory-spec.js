require(['src/runner/runner_factory', 'src/factory/factory', 'src/runner/module', 'src/runner/sandbox'], function(RunnerFactory, Factory, Module, Sandbox) {

  describe('RunnerFactory', function() {

    it('is a class', function() {
      expect(new RunnerFactory()).toBeInstanceOf(RunnerFactory);
    });

    it('extends `Factory`', function() {
      expect(new RunnerFactory()).toBeInstanceOf(Factory);
    });

    describe('handler', function() {
      it('has 2 handler', function() {
        expect(new RunnerFactory().handler.numChildren()).toBe(2);
      });
    });

    describe('wrapper', function() {
      it('has 0 wrapper', function() {
        expect(new RunnerFactory().wrapper.numChildren()).toBe(0);
      });
    });

    describe('resources', function() {
      it('can create a module', function() {
        expect(new RunnerFactory().create({id:'module'})).toBeInstanceOf(Module);
      });

      it('can create a sandbox', function() {
        expect(new RunnerFactory().create({id:'sandbox', childs:[{id:'module'}]})).toBeInstanceOf(Sandbox);
      });

      it('can force a sandbox to create', function() {
        expect(new RunnerFactory().create({id:'sandbox', forceContainer: true})).toBeInstanceOf(Sandbox);
      });

      it('can not create a runner without a resource', function() {
        expect(new RunnerFactory().create()).toBeUndefined();
      });

      it('can not create a runner without a resource id', function() {
        expect(new RunnerFactory().create({})).toBeUndefined();
      });
    });
  });
});


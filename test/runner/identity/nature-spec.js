require(['src/runner/identity/nature', 'src/util/event_dispatcher'], function(Nature, EventDispatcher) {

  describe('Nature', function() {

    it('is a class', function() {
      expect(new Nature()).toBeInstanceOf(Nature);
    });

    it('extends EventDispatcher', function() {
      expect(new Nature()).toBeInstanceOf(EventDispatcher);
    });

    describe('getter and setter', function() {
      var nature;

      beforeEach(function() {
        nature = new Nature('id');
        nature.controller = 'controller';
      });

      describe('has a getter `getId`', function() {
        it('returns the id', function() {
          expect(nature.getId()).toBe('id');
        });
      });

      describe('has a public property `controller`', function() {
        it('returns the controller', function() {
          expect(nature.controller).toBe('controller');
        });
      });
    });

    describe('methods', function() {
      var nature;
      var trait;

      beforeEach(function() {
        nature = new Nature();
        trait = {fn: function() {}};
      });

      describe('has a method `addTrait`', function() {
        it('adds a trait', function() {
          nature.addTrait(trait);
          expect(nature.fn).toBeDefined();
        });
      });

      describe('has a method `removeTrait`', function() {
        it('removes a trait', function() {
          nature.addTrait(trait);
          nature.removeTrait(trait);
          expect(nature.fn).toBeUndefined();
        });
      });
    });
  });
});

require(['src/composite/icomponent', 'src/util/lodash'], function(IComponent, lodash) {

  describe('IComponent', function() {

    it('is an interface', function() {
      expect(typeof IComponent).toBe('object');
    });

    describe('own interface methods', function() {
      lodash.forEach([
        'getId',
        'getParent',
        'getRoot',
        'dispose'], function(value) {

        it('defines an interface for `' + value + '`', function() {
          expect(IComponent[value]).toBe('I');
        });
      });
    });
  });
});

require(['src/runner/irunner', 'src/util/lodash'], function(IRunner, lodash) {

  describe('IRunner', function() {

    it('is an interface', function() {
      expect(typeof IRunner).toBe('object');
    });

    describe('own interface methods', function() {
      lodash.forEach([        
        'init',
        'reset',
        'setup',
        'dispose'], function(value) {

        it('defines an interface for `' + value + '`', function() {
          expect(IRunner[value]).toBe('I');
        });
      });
    });
  });
});

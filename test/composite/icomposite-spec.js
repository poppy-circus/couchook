require(['src/composite/icomposite', 'src/composite/icomponent', 'src/util/lodash'], function(IComposite, IComponent, lodash) {

  describe('IComposite', function() {

    it('is an interface', function() {
      expect(typeof IComposite).toBe('object');
    });

    describe('own interface methods', function() {
      lodash.forEach([
        'numChildren',
        'getDepth',
        'indexOf',
        'lastIndexOf',
        'getChild',
        'addChild',
        'removeChild'], function(value) {
          
        it('defines an interface for `' + value + '`', function() {
          expect(IComposite[value]).toBe('I');
        });
      });
    });

    describe('extends IComponent interface', function() {
      lodash.forEach(IComponent, function(value, key) {
          
        it('defines an interface for `' + key + '`', function() {
          expect(IComposite[key]).toBe('I');
        });
      });
    });
  });
});

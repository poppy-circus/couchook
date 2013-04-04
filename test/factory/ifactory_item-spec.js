require(['src/factory/ifactory_item', 'src/util/lodash'], function(IFactoryItem, lodash) {

  describe('IFactoryItem', function() {

    it('is an interface', function() {
      expect(typeof IFactoryItem).toBe('object');
    });

    describe('own interface methods', function() {
      lodash.forEach([
        'create',
        'canHandle'], function(value) {

        it('defines an interface for `' + value + '`', function() {
          expect(IFactoryItem[value]).toBe('I');
        });
      });
    });
  });
});

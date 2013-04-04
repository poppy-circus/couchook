require(['src/util/cache'], function(Cache) {

  describe('Cache', function() {

    it('is a class', function() {
      expect(new Cache()).toBeInstanceOf(Cache);
    });

    describe('methods', function() {
      describe('has a method `getValueByKey`', function() {
        it('returns the value for a cache key', function() {
          var cache = new Cache().setValueByKey('cacheKey', 'cacheValue');
          expect(cache.getValueByKey('cacheKey')).toBe('cacheValue');
        });
      });

      describe('has a method `setValueByKey`', function() {
        it('sets a value by a cache key', function() {
          var cache = new Cache().setValueByKey('cacheKey', 'cacheValue');
          expect(cache.getValueByKey('cacheKey')).toBe('cacheValue');
        });

        it('returns the cache object instance', function() {
          var cache = new Cache();
          expect(cache.setValueByKey('cacheKey', 'cacheValue')).toBe(cache);
        });
      });

      describe('has a method `expire`', function() {
        it('removes all cached entities', function() {
          var cache = new Cache().setValueByKey('cacheKey', 'cacheValue');
          expect(cache.expire().getValueByKey('cacheKey')).toBeUndefined();
        });

        it('returns the cache object instance', function() {
          var cache = new Cache();
          expect(cache.expire()).toBe(cache);
        });
      });
    });
  });
});

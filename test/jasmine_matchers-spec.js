beforeEach(function() {
  this.addMatchers({
    toBeInstanceOf: function(Constructor) {
      return this.actual instanceof Constructor;
    },

    toBeImplementationOf: function(Interface) {
      var actual = this.actual;
      var result = true;

      for (var fn in Interface) {
        if (actual[fn] === 'I' || actual[fn] === undefined) {
          result = false;
          break;
        }
      }

      this.message = function () {
        return 'Expected ' + actual + ' to implement ' + Interface + '.' + fn;
      };

      return result;
    }
  });
});
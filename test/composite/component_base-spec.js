require(['src/composite/component_base', 'src/composite/icomponent'], function(ComponentBase, IComponent) {

  describe('ComponentBase', function() {

    it('is a class', function() {
      expect(new ComponentBase()).toBeInstanceOf(ComponentBase);
    });

    it('implements IComponent', function() {
      expect(new ComponentBase()).toBeImplementationOf(IComponent);
    });

    it('is a leaf', function() {
      expect(new ComponentBase().isContainer()).toBeFalsy();
    });

    it('is a not a root in hierarchy', function() {
      expect(new ComponentBase().isRoot()).toBeFalsy();
    });
    
    describe('methods', function() {
      var component;

      beforeEach(function() {
        component = new ComponentBase('test-component');
      });

      describe('has a method `dispose`', function() {
        it('unsets the parent', function() {
          var parent = {};
          component.setParent(parent);
          component.dispose();
          expect(component.getParent()).toBeUndefined();
        });
      });

      describe('has a method `getId`', function() {
        it('returns the component id', function() {
          expect(component.getId()).toBe('test-component');
        });
      });

      describe('has a method `isRoot`', function() {
        it('returns always false by default', function() {
          expect(component.isRoot()).toBe(false);
        });

        it('returns true if defined by the constructor', function() {
          expect(new ComponentBase('root', true).isRoot()).toBe(true);
        });
      });

      describe('has a method `isContainer`', function() {
        it('returns always false', function() {
          expect(component.isContainer()).toBe(false);
        });
      });

      describe('has a method `getParent` and `setParent`', function() {
        it('returns the next object in upper hierarchy', function() {
          var parent = {};
          component.setParent(parent);
          expect(component.getParent()).toBe(parent);
        });
      });

      describe('has a method `getRoot`', function() {
        it('returns the root object in upper hierarchy', function() {
          var root = {};
          var parent = {getRoot: function(){return root;}};
          component.setParent(parent);
          expect(component.getRoot()).toBe(root);
        });
      });
    });
  });
});

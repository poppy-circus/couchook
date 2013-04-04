require(['src/composite/composite_base', 'src/composite/component_base'], function(CompositeBase, ComponentBase) {

  describe('CompositeBase', function() {

    it('is a class', function() {
      expect(new CompositeBase()).toBeInstanceOf(CompositeBase);
    });

    it('extends ComponentBase', function() {
      expect(new CompositeBase()).toBeInstanceOf(ComponentBase);
    });

    it('is a container', function() {
      expect(new CompositeBase().isContainer()).toBeTruthy();
    });

    it('is a not a root in hierarchy', function() {
      expect(new CompositeBase().isRoot()).toBeFalsy();
    });

    describe('methods', function() {
      var component;
      var composite;

      beforeEach(function() {
        composite = new CompositeBase('test-composite');
        component = new ComponentBase('test-component');
      });

      describe('has a method `indexOf`', function() {
        beforeEach(function() {
          composite.addChild(component);
        });

        it('returns the index of a child', function() {
          expect(composite.indexOf(component)).toBe(0);
        });

        it('returns the index of a child from a specific start index', function() {
          composite.addChild(component);
          expect(composite.indexOf(component, 1)).toBe(1);
        });

        it('returns -1 if the child is not presented', function() {          
          expect(composite.indexOf(new ComponentBase())).toBe(-1);
        });

        it('returns -1 if the start index is out of range', function() {          
          expect(composite.indexOf(component, 10)).toBe(-1);
        });

        it('normalize the start index of less than 0', function() {          
          expect(composite.indexOf(component, -10)).toBe(0);
        });
      });

      describe('has a method `lastIndexOf`', function() {
        beforeEach(function() {
          composite.addChild(component);
        });

        it('returns the index of a child', function() {
          composite.addChild(component);
          expect(composite.lastIndexOf(component)).toBe(1);
        });

        it('returns the index of a child from a specific start index', function() {
          composite.addChild(component);
          expect(composite.lastIndexOf(component, 0)).toBe(0);
        });

        it('returns -1 if the child is not presented', function() {
          expect(composite.indexOf(new ComponentBase())).toBe(-1);
        });

        it('returns -1 if the start index is out of range', function() {          
          expect(composite.indexOf(component, 10)).toBe(-1);
        });

        it('normalize the start index of less than 0', function() {
          expect(composite.indexOf(component, -10)).toBe(0);
        });
      });

      describe('has a method `getChild`', function() {
        it('returns a subordinated children by an id', function() {
          composite.addChild(component);
          expect(composite.getChild('test-component')).toBe(component);
        });

        it('returns the first subordinated children when they share the same id', function() {
          composite.addChild(component);
          composite.addChild(component);
          expect(composite.getChild('test-component')).toBe(composite.getChild(0));
        });

        it('search for a subordinated children by an id in hierarchy when `deep=true`', function() {
          var composite2 = new CompositeBase('test-composite2');
          composite2.addChild(component);
          composite.addChild(composite2);
          expect(composite.getChild('test-component', true)).toBe(component);
        });
        
        it('won`t search for a subordinated children by an id in hierarchy when `deep=false`', function() {
          var composite2 = new CompositeBase('test-composite2');
          composite2.addChild(component);
          composite.addChild(composite2);
          expect(composite.getChild('test-component')).toBeUndefined();
        });

        it('returns a subordinated children by an index', function() {
          composite.addChild(component);
          expect(composite.getChild(0)).toBe(component);
        });

        it('returns undefined if the index is out of range', function() {
          expect(composite.getChild(10)).toBeUndefined();
        });

        it('returns the 1st component if the index is less than 0', function() {
          composite.addChild(component);
          expect(composite.getChild(-10)).toBeUndefined();
        });

        it('returns the composite itself if the id matches the interal id', function() {          
          expect(composite.getChild('test-composite')).toBe(composite);
        });
      });

      describe('has a method `addChild`', function() {
        it('adds a component', function() {
          composite.addChild(component);
          expect(composite.numChildren()).toBe(1);
        });

        it('adds nothing when component is not defined', function() {
          composite.addChild();
          expect(composite.numChildren()).toBe(0);
        });

        it('adds a component at a specified index', function() {
          var component2 = new ComponentBase('test-component2');
          composite.addChild(component);
          composite.addChild(component2, 0);
          expect(composite.getChild(0)).toBe(component2);
        });

        it('adds a component at 0 if the specified index is less than 0', function() {
          var component2 = new ComponentBase('test-component2');
          composite.addChild(component);
          composite.addChild(component2, -10);
          expect(composite.getChild(0)).toBe(component2);
        });

        it('adds a component at the last position if the specified index is out of range', function() {
          var component2 = new ComponentBase('test-component2');
          composite.addChild(component);
          composite.addChild(component2, 10);
          expect(composite.getChild(1)).toBe(component2);
        });

        it('sets the parent property of a component', function() {
          composite.addChild(component);
          expect(component.getParent()).toBe(composite);
        });

        it('returns the composite reference', function() {
          expect(composite.addChild(component)).toBe(composite);
        });
      });

      describe('has a method `removeChild`', function() {
        it('removes a component', function() {
          composite.addChild(component);
          composite.removeChild(component);
          expect(composite.numChildren()).toBe(0);
        });

        it('removes nothing when component is not defined', function() {
          composite.addChild(component);
          composite.removeChild();
          expect(composite.numChildren()).toBe(1);
        });

        it('sets the parent property of a component to undefined', function() {
          composite.addChild(component);
          composite.removeChild(component);
          expect(component.getParent()).toBeUndefined();
        });

        it('returns the removed component reference', function() {
          composite.addChild(component);
          expect(composite.removeChild(component)).toBe(component);
        });

        it('removes a subordinated children in hierarchy when `deep=true`', function() {
          var composite2 = new CompositeBase('test-composite2');
          composite2.addChild(component);
          composite.addChild(composite2);
          composite.removeChild(component, true);
          expect(composite.getChild(0).numChildren()).toBe(0);
        });
        
        it('won`t remove a subordinated children in hierarchy when `deep=false`', function() {
          var composite2 = new CompositeBase('test-composite2');
          composite2.addChild(component);
          composite.addChild(composite2);
          composite.removeChild(component);
          expect(composite.getChild(0).numChildren()).toBe(1);
        });

        it('removes a child at a specific index', function() {
          composite.addChild(component);
          composite.removeChild(0);
          expect(composite.numChildren()).toBe(0);
        });

        it('removes a child by an id', function() {
          composite.addChild(component);
          composite.removeChild('test-component');
          expect(composite.numChildren()).toBe(0);
        });

        it('removes a subordinated children by id in hierarchy when `deep=true`', function() {
          var composite2 = new CompositeBase('test-composite2');
          composite2.addChild(component);
          composite.addChild(composite2);
          composite.removeChild('test-component', true);
          expect(composite.getChild(0).numChildren()).toBe(0);
        });
      });

      describe('has a method `numChildren`', function() {
        it('returns the amount of added children', function() {
          composite.addChild(component);
          expect(composite.numChildren()).toBe(1);
        });
      });

      describe('has a method `dispose`', function() {
        xit('unsets the parent', function() {
          var parent = {};
          composite.setParent(parent);
          composite.dispose();
          expect(composite.getParent()).toBeUndefined();
        });

        it('unsets all subordinated childs', function() {
          composite.addChild(component);
          composite.addChild(new CompositeBase('test-component2'));
          composite.dispose();
          expect(composite.numChildren()).toBe(0);
        });

        xit('unsets all deep subordinated childs', function() {
          var deepComposite = new CompositeBase('test-deep-composite');
          deepComposite.addChild(component);
          composite.addChild(deepComposite);
          composite.dispose();
          expect(deepComposite.numChildren()).toBe(0);
        });
      });

      describe('has a method `getParent` and `setParent`', function() {
        it('updates the local parent', function() {
          var parent = {};
          composite.setParent(parent);
          expect(composite.getParent()).toBe(parent);
        });

        it('updates the parent of the childs', function() {
          composite.addChild(component);
          component.setParent();
          composite.setParent();
          expect(component.getParent()).toBe(composite);
        });
      });
    });
  });
});

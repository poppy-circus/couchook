require(['src/factory/factory_item_collection', 'src/composite/composite_base', 'src/factory/factory_item'], 
  function(FactoryItemCollection, CompositeBase, FactoryItem) {

  describe('FactoryItemCollection', function() {

    it('is a class', function() {
      expect(new FactoryItemCollection()).toBeInstanceOf(FactoryItemCollection);
    });

    it('extends CompositeBase', function() {
      expect(new FactoryItemCollection()).toBeInstanceOf(CompositeBase);
    });

    describe('methods', function(){
      var collection;

      beforeEach(function() {
        collection = new FactoryItemCollection('collection');
      });

      describe('has a method `addChild`', function() {
        it('adds references that implements `IFactoryItem`', function() {
          collection.addChild({
            canHandle: function(){},
            create: function(){}
          });
          expect(collection.numChildren()).toBe(1);
        });

        it('creates a FactoryItem instance when the reference implements `IFactoryItem`', function() {
          collection.addChild({
            canHandle: function(){},
            create: function(){}
          });
          expect(collection.getChild(0)).toBeInstanceOf(FactoryItem);
        });

        it('won`t create a FactoryItem instance when the reference is a `FactoryItem`', function() {
          var item = new FactoryItem();
          collection.addChild(item);
          expect(collection.getChild(0)).toBe(item);
        });

        it('it throws an error when the reference don`t implement `IFactoryItem`', function() {
          var e = new Error('IFactoryItem implementation missing');
          expect(function() { collection.addChild(); }).toThrow(e);
        });
      });
    });
  });
});

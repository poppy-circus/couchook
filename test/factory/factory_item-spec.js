require(['src/factory/factory_item', 'src/factory/ifactory_item', 'src/composite/component_base'],
  function(FactoryItem, IFactoryItem, ComponentBase) {

  describe('FactoryItem', function() {

    it('is a class', function() {
      expect(new FactoryItem()).toBeInstanceOf(FactoryItem);
    });

    it('implements IFactoryItem', function() {
      expect(new FactoryItem()).toBeImplementationOf(IFactoryItem);
    });

    it('extends ComponentBase', function() {
      expect(new FactoryItem()).toBeInstanceOf(ComponentBase);
    });

    describe('class properties', function(){
      describe('has a property `ITEM_COUNT`', function() {
        it('returns the id', function() {
          expect(FactoryItem.ITEM_COUNT > 0).toBe(true);
        });
      });
    });

    describe('getter and setter', function(){
      var factoryItem;

      beforeEach(function() {
        factoryItem = new FactoryItem();
      });

      describe('has a getter `getId`', function() {
        it('returns the id', function() {
          expect(factoryItem.getId()).toBeDefined();
        });

        it('increments the id per created factory item', function() {
          expect(factoryItem.getId()).toBe('factoryItem'+ (FactoryItem.ITEM_COUNT - 1));
        });
      });
    });

    describe('methods', function(){
      var factoryItem;
      var canHandle;
      var create;

      beforeEach(function() {
        canHandle = jasmine.createSpy('canHandle').andCallFake(function(){return true;});
        create = jasmine.createSpy('create').andCallFake(function(){return 'result';});
        factoryItem = new FactoryItem(canHandle, create);
      });

      describe('has a method `canHandle`', function() {
        it('invokes the external canHandle function', function() {
          var resource = {};
          factoryItem.canHandle(resource);
          expect(canHandle).toHaveBeenCalledWith(resource);
        });

        it('returns the value of the external canHandle function', function() {         
          expect(factoryItem.canHandle()).toBe(true);
        });
      });

      describe('has a method `create`', function() {
        it('invokes the external create function', function() {
          var resource = {};
          var root = {};
          factoryItem.create(resource, root);
          expect(create).toHaveBeenCalledWith(resource, root);
        });

        it('returns the value of the external create function', function() {         
          expect(factoryItem.create()).toBe('result');
        });
      });
    });
  });
});

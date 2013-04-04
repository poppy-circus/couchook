require(['src/factory/factory', 'src/factory/factory_item_collection'], function(Factory, FactoryItemCollection) {

  describe('Factory', function() {

    it('is a class', function() {
      expect(new Factory()).toBeInstanceOf(Factory);
    });

    describe('properties', function() {
      it('has a property `handler`', function() {
        expect(new Factory().handler).toBeInstanceOf(FactoryItemCollection);
      });

      it('has a property `wrapper`', function() {
        expect(new Factory().wrapper).toBeInstanceOf(FactoryItemCollection);
      });
    });

    describe('methods', function() {
      describe('has a method `create`', function() {
        var handler = {canHandle: function(resource) { return resource.type === 'system'; }, create: function(resource) { return 'Hello'; }};

        it('creates an object by a handler', function() {
          var factory = new Factory();
          factory.handler.addChild(handler);
          expect(factory.create({type:'system'})).toBe('Hello');
        });

        it('picks the correct object from the resource', function() {
          var factory = new Factory();
          factory.handler.addChild(handler);
          factory.handler.addChild({canHandle: function(resource) { return resource.type === 'human'; }, create: function(resource) { return 'Nice to meet you'; }});
          expect(factory.create({type:'human' })).toBe('Nice to meet you' );
        });

        it('returns a wrapper of the created object from the handler references', function() {
          var factory = new Factory();
          factory.handler.addChild(handler);
          factory.wrapper.addChild({canHandle: function(resource) { return resource.type === 'system'; }, create: function(resource, root) { return root + ', i am your wrapper'; }});

          expect(factory.create({type:'system'})).toBe('Hello, i am your wrapper');
        });

        it('allows multiple wrapper', function() {
          var factory = new Factory();
          factory.handler.addChild(handler);
          factory.wrapper.addChild({canHandle: function(resource) { return resource.type === 'system'; }, create: function(resource, root) { return root + ', i am your wrapper'; }});
          factory.wrapper.addChild({canHandle: function(resource) { return resource.type === 'system'; }, create: function(resource, root) { return root + ' - nice to meet you'; }});
          expect(factory.create({type:'system'})).toBe('Hello, i am your wrapper - nice to meet you');
        });

        it('returns undefined if no handler matches', function() {
          var factory = new Factory();
          factory.handler.addChild(handler);
          expect(factory.create({type:'unknown'})).toBeUndefined();
        });
      });
    }); 
  });
});


require(['src/util/event_dispatcher'], function(EventDispatcher) {

  describe('EventDispatcher', function() {

    it('is a class', function() {
     expect(new EventDispatcher()).toBeInstanceOf(EventDispatcher);
    });

    describe('methods', function() {
      var dispatcher;

      beforeEach(function() {
        dispatcher = new EventDispatcher();
      });

      describe('has a method `getListenerByType`', function() {
        it('returns an empty array if no listener is defined for a type', function() {
          expect(dispatcher.getListenerByType('type').length).toBe(0);
        });

        it('returns an array of all added event listeners for a type', function() {
          dispatcher.on('type', function(){});
          dispatcher.on('type', function(){});
          expect(dispatcher.getListenerByType('type').length).toBe(2);
        });

        describe('internal event setup', function() {
          var fn = function(){};
          var scope = {};
          beforeEach(function() {
            dispatcher.once('type', fn, scope, 10);
          });

          it('has a property `type`', function() {
            expect(dispatcher.getListenerByType('type')[0].type).toBe('type');
          });

          it('has a property `listener`', function() {
            expect(dispatcher.getListenerByType('type')[0].listener).toBe(fn);
          });

          it('has a property `scope`', function() {
            expect(dispatcher.getListenerByType('type')[0].scope).toBe(scope);
          });

          it('has a property `priority`', function() {
            expect(dispatcher.getListenerByType('type')[0].priority).toBe(10);
          });

          it('has a property `once`', function() {
            expect(dispatcher.getListenerByType('type')[0].once).toBe(true);
          });

          it('has a property `regExp`', function() {
            expect(dispatcher.getListenerByType('type')[0].regExp).toBe(false);
          });
        });
      });

      describe('has a method `hasListener`', function() {
        it('returns `true` if 1 listener is added for a type', function() {
          var fn = function(){};
          dispatcher.on('type', fn);
          expect(dispatcher.hasListener('type')).toBe(true);
        });

        it('returns `true` if multiple listeners are added for a type', function() {
          dispatcher.on('type', function(){});
          dispatcher.on('type', function(){});
          expect(dispatcher.hasListener('type')).toBe(true);
        });

        it('returns `false` if no listener is added for a type', function() {
          expect(dispatcher.hasListener('type')).toBe(false);
        });
      });

      describe('has a method `on`', function() {
        it('adds an event listener', function() {
          dispatcher.on('type', function(){});
          expect(dispatcher.hasListener('type')).toBe(true);
        });

        it('adds an event listener by a regexp', function() {
          dispatcher.on(/\d+/, function(){});
          expect(dispatcher.hasListener(/\d+/)).toBe(true);
        });

        it('adds a special event listener type `*` to receive all dispatched events', function() {
          dispatcher.on('*', function(){});
          expect(dispatcher.hasListener('*')).toBe(true);
        });

        it('won`t add an event listener if the callback is not defined', function() {
          dispatcher.on('type');
          expect(dispatcher.hasListener('type')).toBe(false);
        });

        it('won`t add an event listener if the type is not defined', function() {
          dispatcher.on();
          expect(dispatcher.hasListener('type')).toBe(false);
        });

        it('won`t add an event listener twice', function() {
          var fn = function(){};
          dispatcher.on('type', fn);
          dispatcher.on('type', fn);
          expect(dispatcher.getListenerByType('type').length).toBe(1);
        });

        it('adds differnt event listeners for the same type', function() {
          dispatcher.on('type', function(){});
          dispatcher.on('type', function(){});
          expect(dispatcher.getListenerByType('type').length).toBe(2);
        });

        it('sets the scope if defined', function() {
          var scope = {};
          dispatcher.once('type', function(){}, scope);
          expect(dispatcher.getListenerByType('type')[0].scope).toBe(scope);
        });

        it('sets the scope to the dispatcher reference if not defined', function() {
          dispatcher.on('type', function(){});
          expect(dispatcher.getListenerByType('type')[0].scope).toBe(dispatcher);
        });

        it('returns the event dispatcher reference', function() {
          expect(dispatcher.on('type', function(){})).toBe(dispatcher);
        });
      });

      describe('has a method `once`', function() {
        it('listen to an event just for one time', function() {
          var spy = jasmine.createSpy('listener');
          dispatcher.once('type', spy);
          dispatcher.dispatch('type');
          dispatcher.dispatch('type');
          expect(spy.callCount).toBe(1);
        });

        it('adds an event listener', function() {
          dispatcher.once('type', function(){});
          expect(dispatcher.hasListener('type')).toBe(true);
        });

        it('adds an event listener by a regexp', function() {
          dispatcher.once(/\d+/, function(){});
          expect(dispatcher.hasListener(/\d+/)).toBe(true);
        });

        it('adds a special event listener type `*` to receive all dispatched events', function() {
          dispatcher.once('*', function(){});
          expect(dispatcher.hasListener('*')).toBe(true);
        });

        it('won`t add an event listener if the callback is not defined', function() {
          dispatcher.once('type');
          expect(dispatcher.hasListener('type')).toBe(false);
        });

        it('won`t add an event listener if the type is not defined', function() {
          dispatcher.once();
          expect(dispatcher.hasListener('type')).toBe(false);
        });

        it('won`t add an event listener twice', function() {
          var fn = function(){};
          dispatcher.once('type', fn);
          dispatcher.once('type', fn);
          expect(dispatcher.getListenerByType('type').length).toBe(1);
        });

        it('adds differnt event listeners for the same type', function() {
          dispatcher.once('type', function(){});
          dispatcher.once('type', function(){});
          expect(dispatcher.getListenerByType('type').length).toBe(2);
        });

        it('sets the scope if defined', function() {
          var scope = {};
          dispatcher.once('type', function(){}, scope);
          expect(dispatcher.getListenerByType('type')[0].scope).toBe(scope);
        });

        it('sets the scope to the dispatcher reference if not defined', function() {
          dispatcher.once('type', function(){});
          expect(dispatcher.getListenerByType('type')[0].scope).toBe(dispatcher);
        });

        it('returns the event dispatcher reference', function() {
          expect(dispatcher.once('type', function(){})).toBe(dispatcher);
        });
      });

      describe('has a method `off`', function() {
        it('removes an event listener', function() {
          var fn = function(){};
          dispatcher.on('type', fn);
          dispatcher.off('type', fn);
          expect(dispatcher.hasListener('type')).toBe(false);
        });

        it('removes a special event listener with the type `*`', function() {
          var fn = function(){};
          dispatcher.on('*', fn);
          dispatcher.off('*', fn);
          expect(dispatcher.hasListener('*')).toBe(false);
        });

        it('won`t remove an event listener if the callback is not defined', function() {
          var fn = function(){};
          dispatcher.on('type', fn);
          dispatcher.off('type');
          expect(dispatcher.hasListener('type')).toBe(true);
        });

        it('won`t remove an event listener if the type is not defined', function() {
          var fn = function(){};
          dispatcher.on('type', fn);
          dispatcher.off();
          expect(dispatcher.hasListener('type')).toBe(true);
        });

        it('returns the event dispatcher reference', function() {
          expect(dispatcher.off('type', function(){})).toBe(dispatcher);
        });
      });

      describe('has a method `dispatch`', function() {
        it('triggers an event', function() {
          var fn = jasmine.createSpy('listener');
          dispatcher.on('type', fn);
          dispatcher.dispatch('type');
          expect(fn).toHaveBeenCalled();
        });

        it('triggers an event with further metadata', function() {
          var fn = jasmine.createSpy('listener');
          dispatcher.on('type', fn);
          dispatcher.dispatch('type');
          expect(fn).toHaveBeenCalledWith({}, {target: dispatcher, type: 'type'});
        });

        it('triggers an event with a payload', function() {
          var fn = jasmine.createSpy('listener');
          dispatcher.on('type', fn);
          dispatcher.dispatch('type', {foo: 'bar'});
          expect(fn).toHaveBeenCalledWith({foo: 'bar'}, {target: dispatcher, type: 'type'});
        });

        it('triggers an event for the `RegExp` listeners', function() {
          var fn = jasmine.createSpy('listener');
          dispatcher.on(/\d+/, fn);
          dispatcher.dispatch('12345');
          expect(fn).toHaveBeenCalledWith({}, {target: dispatcher, type: '12345'});
        });

        it('triggers an event for the `*` listeners', function() {
          var fn = jasmine.createSpy('listener');
          dispatcher.on('*', fn);
          dispatcher.dispatch('type', {foo: 'bar'});
          expect(fn).toHaveBeenCalledWith({foo: 'bar'}, {target: dispatcher, type: 'type'});
        });

        it('triggers an event with a default payload', function() {
          var fn = jasmine.createSpy('listener');
          dispatcher.on('type', fn);
          dispatcher.dispatch('type');
          expect(fn).toHaveBeenCalledWith({}, {target: dispatcher, type: 'type'});
        });

        it('trigger events in the correct order', function() {
          var order = [];
          dispatcher.on('*', function(){ order.push('on-all'); }, null, 1);
          dispatcher.on(/\d+/, function(){ order.push('on-reg'); }, null, 2);
          dispatcher.on('12345', function(){ order.push('on'); }, null, 3);
          dispatcher.dispatch('12345');
          expect(order).toBe(['on-all', 'on-reg', 'on']);
        });

        it('won`t triggers if the type is not defined', function() {
          var fn = jasmine.createSpy('listener');
          dispatcher.on('type', fn);
          dispatcher.dispatch();
          expect(fn).not.toHaveBeenCalled();
        });

        it('sets the scope to the event dispatcher by default', function() {
          var scope;
          dispatcher.on('type', function(){scope = this;});
          dispatcher.dispatch('type');
          expect(scope).toBe(scope);
        });

        it('sets the scope to the scope argument of `on` if defined', function() {
          var scope;
          var obj = {};
          dispatcher.on('type', function(){scope = this;}, obj);
          dispatcher.dispatch('type');
          expect(scope).toBe(obj);
        });

        it('returns `false` if no event was triggered', function() {
          expect(dispatcher.dispatch('type')).toBe(false);
        });

        it('returns `true` if at least 1 event was triggered', function() {
          dispatcher.on('type', function(){});
          expect(dispatcher.dispatch('type')).toBe(true);
        });
      });
    });
  });
});

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
            dispatcher.on('type', fn, scope, 10);
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

        it('sorts listener by priority', function() {
          dispatcher.on('type', function(){}, null, 2);
          dispatcher.on('type', function(){}, null, 1);
          expect(dispatcher.getListenerByType('type')[0].priority).toBe(1);
        });

        it('sets the scope to the dispatcher reference if not defined', function() {
          dispatcher.on('type', function(){});
          expect(dispatcher.getListenerByType('type')[0].scope).toBe(dispatcher);
        });

        it('returns the event dispatcher reference', function() {
          expect(dispatcher.on('type', function(){})).toBe(dispatcher);
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

        it('triggers an event with further dispatcher details', function() {
          var fn = jasmine.createSpy('listener');
          dispatcher.on('type', fn);
          dispatcher.dispatch('type');
          expect(fn).toHaveBeenCalledWith(undefined, {target: dispatcher, type: 'type'});
        });

        it('triggers an event with a payload', function() {
          var fn = jasmine.createSpy('listener');
          dispatcher.on('type', fn);
          dispatcher.dispatch('type', {foo: 'bar'});
          expect(fn).toHaveBeenCalledWith({foo: 'bar'}, {target: dispatcher, type: 'type'});
        });

        it('triggers an event for the `*` listeners', function() {
          var fn = jasmine.createSpy('listener');
          dispatcher.on('*', fn);
          dispatcher.dispatch('type', {foo: 'bar'});
          expect(fn).toHaveBeenCalledWith({foo: 'bar'}, {target: dispatcher, type: 'type'});
        });

        it('triggers an event with an undefined payload', function() {
          var fn = jasmine.createSpy('listener');
          dispatcher.on('type', fn);
          dispatcher.dispatch('type');
          expect(fn).toHaveBeenCalledWith(undefined, {target: dispatcher, type: 'type'});
        });

        it('trigger events in the correct order', function() {
          var last = 0;
          dispatcher.on('type', function(){last = 1;}, null, 1);
          dispatcher.on('type', function(){last = 2;}, null, 2);
          dispatcher.dispatch('type');
          expect(last).toBe(2);
        });

        it('wont`t triggers if the type is not defined', function() {
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

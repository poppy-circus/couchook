require(['src/runner/identity/attitude', 'src/util/event_dispatcher', 'src/util/lodash'], function(Attitude, EventDispatcher, lodash) {

  describe('Attitude', function() {

    it('is a class', function() {
      expect(new Attitude()).toBeInstanceOf(Attitude);
    });

    describe('public properties', function() {
      describe('has a property `currentState`', function() {
        it('returns `stateless` by default', function() {
          expect(new Attitude().currentState.name).toBe('stateless');
        });

        it('returns the initial state before any transition', function() {
          expect(new Attitude(null, null, 'myState').currentState.name).toBe('myState');
        });

        it('returns the current state after transition', function() {
          var attitude = new Attitude(null, {newState: ['oldState']}, 'oldState');
          attitude.currentState.newState();
          expect(attitude.currentState.name).toBe('newState');
        });
      });
    });

    describe('methods', function() {
      describe('has a method `hasState`', function() {
        it('returns `false` if the state is not defined', function() {
          expect(new Attitude().hasState('myState')).toBe(false);
        });

        it('returns `true` if the state is defined', function() {
          expect(new Attitude(null, {myState:[]}).hasState('myState')).toBe(true);
        });

        it('returns `true` if the requested state is `stateless`', function() {
          expect(new Attitude().hasState('stateless')).toBe(true);
        });

        it('returns `true` if the requested state represents the initial state ', function() {
          expect(new Attitude(null, null, 'initialState').hasState('initialState')).toBe(true);
        });

        it('returns `false` if the requested state is `null`', function() {
          expect(new Attitude().hasState()).toBe(false);
        });
      });

      describe('has a method `setStates`', function() {
        var attitude;

        beforeEach(function() {
          attitude = new Attitude();
        });

        it('sets a `stateless` state by default as initial state', function() {
          attitude.setStates();
          expect(attitude.hasState('stateless')).toBe(true);
        });

        it('sets an initial state', function() {
          attitude.setStates(null, 'initialState');
          expect(attitude.hasState('initialState')).toBe(true);
        });

        it('sets an initial state as the current state', function() {          
          attitude.setStates(null, 'initialState');
          expect(attitude.currentState.name).toBe('initialState');
        });

        describe('creating transition capabilities', function() {
          var attitude;

          beforeEach(function() {
            attitude = new Attitude();
            attitude.setStates({play: ['pause'], pause: ['play', 'stop'], stop: ['play']}, 'initial');
          });

          it('invalidates a transition to the current state', function() {
            expect(attitude.currentState.initial()).toBe(false);
          });

          describe('it creates function for each transition (example)', function() {
            var transFns = {
              playState: 'play',
              pauseState: 'pause',
              stopState: 'stop',
              initialState: 'initial'
            };

            lodash.forEach(transFns, function(transFn, name) {
              lodash.forEach(['pause', 'play', 'initial', 'stop'], function(fn) {
                it(name + ' has a function `' + fn + '`', function() {
                  attitude.currentState[transFn]();
                  expect(typeof attitude.currentState[fn]).toBe('function');
                });
              });
            });

            describe('appending new states (example)', function() {
              beforeEach(function() {
                attitude.setStates({error: ['play', 'pause', 'stop'], seek: ['play', 'pause']}, 'initial');
              });

              var transFns = {
                playState: 'play',
                pauseState: 'pause',
                stopState: 'stop',
                initialState: 'initial'
              };              

              lodash.forEach(transFns, function(transFn, name) {
                lodash.forEach(['error', 'seek'], function(fn) {
                  it(name + ' appended a function `' + fn + '`', function() {
                    attitude.currentState[transFn]();
                    expect(typeof attitude.currentState[fn]).toBe('function');
                  });
                });
              });
            });
          });

          describe('transition form initial state to another is always allowed (example)', function() {
            it('can translate to `play`', function() {
              expect(attitude.currentState.play()).toBe(true);
            });

            it('can translate to `stop`', function() {
              expect(attitude.currentState.stop()).toBe(true);
            });

            it('can translate to `pause`', function() {
              expect(attitude.currentState.pause()).toBe(true);
            });
          });

          describe('transition to the initial state form another is always allowed (example)', function() {
            it('can translate from `play`', function() {
              attitude.currentState.play();
              expect(attitude.currentState.initial()).toBe(true);
            });

            it('can translate to `stop`', function() {
              attitude.currentState.stop();
              expect(attitude.currentState.initial()).toBe(true);
            });

            it('can translate to `pause`', function() {
              attitude.currentState.pause();
              expect(attitude.currentState.initial()).toBe(true);
            });
          });

          describe('allow a transition from one state to another state if the transition is defined (example)', function() {
            it('can translate from `play to pause`', function() {
              attitude.currentState.play();
              expect(attitude.currentState.pause()).toBe(true);
            });

            it('can translate from `pause to play`', function() {
              attitude.currentState.pause();
              expect(attitude.currentState.play()).toBe(true);
            });

            it('can translate from `pause to stop`', function() {
              attitude.currentState.pause();
              expect(attitude.currentState.play()).toBe(true);
            });

            it('can translate from `stop to play`', function() {
              attitude.currentState.stop();
              expect(attitude.currentState.play()).toBe(true);
            });
          });

          describe('invalidates a transition from one state to another state if the transition is not defined (example)', function() {
            it('can not translate from `play to stop`', function() {
              attitude.currentState.play();
              expect(attitude.currentState.stop()).toBe(false);
            });

            it('can not translate from `stop to pause`', function() {
              attitude.currentState.stop();
              expect(attitude.currentState.pause()).toBe(false);
            });
          });          
        });

        describe('has a method `unsetStates`', function() {
          var attitude;

          beforeEach(function() {
            attitude = new Attitude({play: ['pause'], pause: ['play', 'stop'], stop: ['play']}, 'initial');
          });

          it('resets the attitude to `stateless`', function() {
            attitude.unsetStates();
            expect(attitude.currentState.name).toBe('stateless');
          });

          describe('remove all transitions (example)', function() {
            it('removes `play`', function() {
              attitude.unsetStates();
              expect(attitude.currentState.play).toBeUndefined();
            });

            it('removes `pause`', function() {
              attitude.unsetStates();
              expect(attitude.currentState.pause).toBeUndefined();
            });

            it('removes `stop`', function() {
              attitude.unsetStates();
              expect(attitude.currentState.stop).toBeUndefined();
            });
          });
        });
      });

      describe('has a method `canChange`', function() {
        it('returns `false` if the states are not defined', function() {
          expect(new Attitude(null, null, 'initialState').canChange('myState')).toBe(false);
        });

        it('returns `false` if the state is not defined', function() {
          expect(new Attitude(null, {otherState:[]}, 'initialState').canChange('myState')).toBe(false);
        });

        it('returns `false` if the requested state is `null`', function() {
          expect(new Attitude(null, null, 'initialState').canChange()).toBe(false);
        });

        it('returns `false` when translating to the current state', function() {
          expect(new Attitude().canChange('stateless')).toBe(false);
        });

        it('returns `false` if current state is stateless but the target state is not available', function() {
          expect(new Attitude().canChange('myState')).toBe(false);
        });

        it('returns `true` if current state is stateless', function() {
          expect(new Attitude(null, {myState:[]}).canChange('myState')).toBe(true);
        });

        it('returns `true` if current state is the initial state', function() {
          var attitude = new Attitude(null, {myState:[]}, 'initialState');
          attitude.currentState.myState();
          expect(attitude.canChange('initialState')).toBe(true);
        });

        it('returns `true` when tranlating between a non stateless and another state if defined', function() {
          expect(new Attitude(null, {newState:['initialState']}, 'initialState').canChange('newState')).toBe(true);
        });
      });

    });

    describe('processing a state change', function() {
      it('performs the transition between two states', function() {
        var attitude = new Attitude(null, {newState: ['oldState']}, 'oldState');
        attitude.currentState.newState();
        expect(attitude.currentState.name).toBe('newState');
      });

      it('returns `true` if the transition was executed', function() {
        var attitude = new Attitude(null, {newState: ['oldState']}, 'oldState');
        expect(attitude.currentState.newState()).toBe(true);
      });

      it('allows to set further details', function() {
        var attitude = new Attitude(null, {newState: ['oldState']}, 'oldState');
        var detail = {};
        attitude.currentState.newState(detail);
        expect(attitude.currentState.detail).toEqual(detail);
      });

      it('merges details on multiple state changes', function() {
        var attitude = new Attitude(null, {newState: ['oldState']}, 'oldState');
        attitude.currentState.newState({foo: 'bar'});
        attitude.currentState.oldState();
        attitude.currentState.newState({bar: 'foo'});
        expect(attitude.currentState.detail).toEqual({foo:'bar', bar:'foo'});
      });

      it('merges details from other states', function() {
        var attitude = new Attitude(null, {newState: ['oldState']}, 'oldState');
        attitude.currentState.newState({foo: 'bar'});
        attitude.currentState.oldState();
        expect(attitude.currentState.detail).toEqual({foo:'bar'});
      });

      it('returns `false` if the transition was not executed', function() {
        var attitude = new Attitude(null, {newState: ['oldState']}, 'oldState');
        expect(attitude.currentState.oldState()).toBe(false);
      });
    });

    describe('update state details', function() {
      it('updates the details of a state on a state transition', function() {
        var attitude = new Attitude(null, {newState: ['oldState']}, 'oldState');
        attitude.currentState.newState({foo: 'bar'});
        expect(attitude.currentState.detail).toEqual({foo: 'bar'});
      });

      it('updates the details of a state on without state transition', function() {
        var attitude = new Attitude(null, {newState: ['oldState']}, 'oldState');
        attitude.currentState.newState({foo: 'bar'});
        attitude.currentState.newState({bar: 'foo'});
        expect(attitude.currentState.detail).toEqual({foo: 'bar', bar: 'foo'});
      });
    });

    describe('events', function() {
      it('dispatch an event by the nature if the transition was performed', function() {
        var dispatcher = new EventDispatcher();
        var attitude = new Attitude(function(state) {dispatcher.dispatch(state.name, state);}, {newState: ['oldState']}, 'oldState');
        var listener = jasmine.createSpy('onStateChange');

        dispatcher.on('newState', listener);
        attitude.currentState.newState();
        expect(listener).toHaveBeenCalledWith(attitude.currentState, {type: 'newState', target: dispatcher});
      });

      it('dispatch an event by the nature if the detail of a state updates without a transition', function() {
        var dispatcher = new EventDispatcher();
        var attitude = new Attitude(function(state) {dispatcher.dispatch(state.name, state);}, null, 'oldState');
        var listener = jasmine.createSpy('allEvents');

        dispatcher.on('oldState', listener);
        attitude.currentState.oldState();
        expect(listener).toHaveBeenCalled();
      });

      it('doesn`t dispatch any event by the nature if the transition is not allowed', function() {
        var dispatcher = new EventDispatcher();
        var attitude = new Attitude(function(state) {dispatcher.dispatch(state.name, state);}, {newState: [], oldState: []});
        var listener = jasmine.createSpy('allEvents');

        attitude.currentState.oldState();
        dispatcher.on('newState', listener);
        attitude.currentState.newState();
        expect(listener).not.toHaveBeenCalled();
      });
    });
  });
});

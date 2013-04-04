require(['src/runner/runner_resource', 'src/composite/composite_base'], 
  function(RunnerResource, CompositeBase) {

  describe('RunnerResource', function() {

    it('is a class', function() {
      expect(new RunnerResource()).toBeInstanceOf(RunnerResource);
    });

    it('extends CompositeBase', function() {
      expect(new RunnerResource()).toBeInstanceOf(CompositeBase);
    });

    describe('public properties', function(){
      var details;

      beforeEach(function() {
        details = new RunnerResource('RunnerResource');
      });

      it('has a property `controller`', function() {
        details.controller = 'value';
        expect(details.controller).toBe('value');
      });

      it('has a property `traits`', function() {
        details.traits = 'value';
        expect(details.traits).toBe('value');
      });

      it('has a property `states`', function() {
        details.states = 'value';
        expect(details.states).toBe('value');
      });

      it('has a property `events`', function() {
        details.events = 'value';
        expect(details.events).toBe('value');
      });

      it('has a property `initialState`', function() {
        details.initialState = 'value';
        expect(details.initialState).toBe('value');
      });

      it('has a property `forceContainer`', function() {
        details.forceContainer = 'value';
        expect(details.forceContainer).toBe('value');
      });
    });

    describe('methods', function(){
      var details;

      beforeEach(function() {
        details = new RunnerResource('RunnerResource');
      });

      describe('has a method `addResource`', function() {
        it('adds a new `RunnerResource` to the composition', function() {
          details.addResource('myDetail');
          expect(details.getChild(0)).toBeInstanceOf(RunnerResource);
        });

        it('sets the traits property', function() {
          details.addResource('myDetail', 'controller');
          expect(details.getChild(0).controller).toBe('controller');
        });

        it('sets the controller property', function() {
          details.addResource('myDetail', 'controller', 'traits');
          expect(details.getChild(0).traits).toBe('traits');
        });

        it('sets the states property', function() {
          details.addResource('myDetail', 'controller', 'traits', 'states');
          expect(details.getChild(0).states).toBe('states');
        });

        it('sets the events property', function() {
          details.addResource('myDetail', 'controller', 'traits', 'states', 'events');
          expect(details.getChild(0).events).toBe('events');
        });

        it('sets the initialState property', function() {
          details.addResource('myDetail', 'controller', 'traits', 'states', 'events', 'initialState');
          expect(details.getChild(0).initialState).toBe('initialState');
        });

        it('throws an exception when the id is not defined', function() {
          var e = new Error('id not defined');
          expect(function() { details.addResource(); }).toThrow(e);
        });

        it('throws an exception when the id is already defined', function() {
          var e = new Error('detail with the id `myDetail` already defined');
          details.addResource('myDetail');
          expect(function() { details.addResource('myDetail'); }).toThrow(e);
        });

        it('calls `addChild`', function() {
          spyOn(details, 'addChild');
          details.addResource({id: 'myDetail'});
          expect(details.addChild).toHaveBeenCalled();
        });

        it('returns the detail reference', function() {
          expect(details.addResource('myDetail').getId()).toBe('myDetail');
        });
      });

      describe('has a method `importResource`', function() {
        it('adds a new `RunnerResource` to the composition', function() {
          details.importResource({id: 'myDetail'});
          expect(details.getChild(0)).toBeInstanceOf(RunnerResource);
        });

        it('calls `addResource`', function() {
          spyOn(details, 'addResource');
          details.importResource({id: 'myDetail', controller: 'controller', traits: 'traits', states: 'states', events: 'events', initialState: 'initialState'});
          expect(details.addResource).toHaveBeenCalledWith('myDetail', 'controller', 'traits', 'states', 'events', 'initialState');
        });

        it('returns the detail reference', function() {
          expect(details.importResource({id: 'myDetail'}).getId()).toBe('myDetail');
        });

        describe('resolves childs (example)', function() {
          beforeEach(function() {
            details.importResource({id:'1a', childs:[{id: '2a'}, {id: '2b', childs:[{id: '3a'}, {id: '3b'}, {id: '3c'}]}]});
          });

          it('adds one child to the root detail', function() {
            expect(details.numChildren()).toBe(1);
          });

          it('has the id `1a`', function() {
            expect(details.getChild(0).getId()).toBe('1a');
          });

          it('adds two child to the first detail level', function() {
            expect(details.getChild(0).numChildren()).toBe(2);
          });

          it('has the id `2a`', function() {
            expect(details.getChild(0).getChild(0).getId()).toBe('2a');
          });

          it('has no further childs (2a)', function() {
            expect(details.getChild(0).getChild(0).numChildren()).toBe(0);
          });

          it('has the id `2b`', function() {
            expect(details.getChild(0).getChild(1).getId()).toBe('2b');
          });

          it('adds three child to the second detail level (2b)', function() {
            expect(details.getChild(0).getChild(1).numChildren()).toBe(3);
          });

          it('has the id `3a`', function() {
            expect(details.getChild(0).getChild(1).getChild(0).getId()).toBe('3a');
          });

          it('has no further childs (3a)', function() {
            expect(details.getChild(0).getChild(1).getChild(0).numChildren()).toBe(0);
          });

          it('has the id `3b`', function() {
            expect(details.getChild(0).getChild(1).getChild(1).getId()).toBe('3b');
          });

          it('has no further childs (3b)', function() {
            expect(details.getChild(0).getChild(1).getChild(1).numChildren()).toBe(0);
          });

          it('has the id `3c`', function() {
            expect(details.getChild(0).getChild(1).getChild(2).getId()).toBe('3c');
          });

          it('has no further childs (3c)', function() {
            expect(details.getChild(0).getChild(1).getChild(2).numChildren()).toBe(0);
          });
        });
      });

      describe('has a method `toObject`', function() {
        it('returns the structure of a runner detail as an object', function() {
          var detail = {id:'1a', childs:[{id: '2a'}, {id: '2b', childs:[{id: '3a'}, {id: '3b'}, {id: '3c', controller: 'controller', traits: 'traits', states: 'states', events: 'events', initialState: 'initialState'}]}]};
          details.importResource(detail);
          expect(details.toObject()).toEqual({id:'RunnerResource', childs:[detail]});
        });
      });
    });
  });
});

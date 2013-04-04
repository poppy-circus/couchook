require(['src/util/class_util'], function(classUtil) {

  describe('classUtil', function() {

    it('is an object', function() {
      expect(typeof classUtil).toBe('object');
    });

    describe('methods', function() {
      describe('has a method `extend`', function() {
        var Class1;
        var Class2;

        beforeEach(function() {
          Class1 = function() {};
          Class1.prototype.class1method = function() {};
          Class1.prototype.class1prop = 10;
          Class2 = function() {};
        });

        it('allows checks with instanceof', function() {
          Class2.prototype = classUtil.extend(Class1);
          var class2 = new Class2();
          expect(class2 instanceof Class1).toBe(true);
        });

        describe('mixes prototype properties into inherited class and allows adding own', function() {
          var class2;

          beforeEach(function() {
            Class2.prototype = classUtil.extend(Class1);
            Class2.prototype.class2method = function() {};
            class2 = new Class2();
          });

          it('has defined `class1method`', function() {
            expect(class2.class1method).toBeDefined();
          });

          it('has defined `class2method`', function() {
            expect(class2.class2method).toBeDefined();
          });

          it('has defined `class1prop`', function() {
            expect(class2.class1prop).toBeDefined();
          });
        });
      });

      describe('has a method `implement`', function() {
        var Class;
        var Interface;

        beforeEach(function() {
          Class = function() {};
          Class.prototype.class1method = function() {};
          Interface = {
            interfaceMethod: function(){}
          };
        });

        describe('defines methods to keep the interface', function() {
          var cls;

          beforeEach(function() {
            classUtil.implement(Class, [Interface]);
            Class.prototype.class2method = function() {};
            cls = new Class();
          });

          it('has defined `class1method`', function() {
            expect(cls.class1method).toBeDefined();
          });

          it('has defined `class2method`', function() {
            expect(cls.class2method).toBeDefined();
          });

          it('has defined `interfaceMethod`', function() {
            expect(cls.interfaceMethod).toBeDefined();
          });
        });
      });

      describe('has a method `mixin`', function() {
        var Class;
        var Mixin;

        beforeEach(function() {
          Class = function() {};
          Class.prototype.classmethod = function() {};
          Mixin = {
            mixinmethod: function(){return this;}
          };
        });

        it('adds functionality', function() {
          var cls = new Class();
          classUtil.mixin(cls, Mixin);
          expect(cls.mixinmethod()).toBe(cls);
        });
      });

      describe('has a method `mixout`', function() {
        var Class;
        var Mixin;

        beforeEach(function() {
          Class = function() {};
          Class.prototype.classmethod = function() {};
          Mixin = {
            mixinmethod: function(){return this;}
          };
        });

        it('removes functionality', function() {
          var cls = new Class();
          classUtil.mixin(cls, Mixin);
          classUtil.mixout(cls, Mixin);
          expect(cls.mixinmethod).toBeUndefined();
        });
      });

      describe('has a method `is`', function() {
        var Class;
        var SubClass;
        var Interface;        

        beforeEach(function() {
          Class = function() {};
          SubClass = function() {};
          Class.prototype.classmethod = function() {};          
          SubClass.prototype.subclassmethod = function() {};
          Interface = {
            interfaceMethod: 'I'
          };
        });

        it('returns `true` if a class implements an interface', function() {
          classUtil.implement(Class, Interface);
          Class.prototype.interfaceMethod = function() {};
          var cls = new Class();
          expect(classUtil.is.call(cls, Interface)).toBe(true);
        });

        it('returns `false` if a class doesn`t implement an interface method', function() {
          classUtil.implement(Class, Interface);
          var cls = new Class();
          expect(classUtil.is.call(cls, Interface)).toBe(false);
        });

        it('returns `false` if a class doesn`t implements an interface at all', function() {
          var NoInterface = { nointerfaceMethod: 'I'};
          classUtil.implement(Class, Interface);
          var cls = new Class();
          expect(classUtil.is.call(cls, NoInterface)).toBe(false);
        });

        it('returns `true` if a class extends another class', function() {
          SubClass.prototype = classUtil.extend(Class);
          var cls = new SubClass();
          expect(classUtil.is.call(cls, Class)).toBe(true);
        });

        it('returns `false` if a class doesn`t extends another class', function() {
          var NoClass = function() {};
          NoClass.prototype.noclassmethod = function() {};
          SubClass.prototype = classUtil.extend(Class);
          var cls = new SubClass();
          expect(classUtil.is.call(cls, NoClass)).toBe(false);
        });

        it('returns `false` if the artifact is not defined', function() {
          SubClass.prototype = classUtil.extend(Class);
          var cls = new SubClass();
          expect(classUtil.is.call(cls)).toBe(false);
        });

        it('returns `false` if the scope is wrong', function() {
          SubClass.prototype = classUtil.extend(Class);
          var cls = new SubClass();
          expect(classUtil.is(Class)).toBe(false);
        });
      });
    });
  });
});
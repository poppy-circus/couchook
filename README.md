couchook
========

Couchook is a small tool to build large and scaleable applications. It is focused
on decoupling plugins or external libraries by executing the artifact in its own
Runner. 

The application can be extended during runtime by a simple setup.
It is also possible to initiate an application core at the very beginning.

[http://www.couchook.poppy-circus.de](http://www.couchook.poppy-circus.de)

## Prerequisites

- [Node.js / NPM](http://nodejs.org) >= 0.8 (on OSX: `brew update; brew install node`)
- [Grunt](http://gruntjs.com/) (install via `npm install -g grunt`)

## Project setup

To setup your project for development you have to install several npm `dependencies` and
`devDependencies` which are listed within `package.json`:

~~~bash
cd PROJECT_DIR
npm install
~~~

### Create Documentation

~~~bash
grunt site
~~~

### Build

~~~bash
grunt install
~~~

### Linting & Testing

~~~bash
# default task, will execute lint and jasmine_node
grunt
# just linting
grunt lint
# just testing
grunt jasmine_node
# or
npm test
~~~

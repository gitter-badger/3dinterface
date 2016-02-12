# 3D Interface
This is the beginning of the typescript version of 3D interface : a prototype
for a user-friendly 3D interface allowing to browse 3D scenes / models written
with Node.js.

It is hosted by [OpenShift](https://www.openshift.com/) at
[3dinterface.no-ip.org](http://3dinterface.no-ip.org).

**Note : this is not quite ready yet, lots of functionalityies are missing, but
it should be really simpler to build from nothing. Check [what is supported for
the moment](#what-is-supported-for-the-moment) out.**

## Build
### Prerequisites
To build this project, you'll need some software :
  - [NodeJS and NPM](https://nodejs.org/), because it is nodejs based
  - [Gulp-cli](http://gulpjs.com/), to be able to use the compilation scripts
  - [TSC](http://www.typescriptlang.org/), the typescript compiler
  - [TSD](http://definitelytyped.org/tsd/), a ressource to have type
    definitions for plain javascript modules

... and normally, you should be good with that.

### Building
  - First of all, get the sources and switch to the typescript branch

    ``` sh
    git clone https://github.com/tforgione/3dinterface
    git checkout typescript
    ```
  - Install the compiling modules dependencies

    ``` sh
    npm install
    ```

  - Build everything with gulp

    ``` sh
    gulp
    ```

... and normally, you should be good with that.

### Testing
Now, you probably want to test if everything is working. If everything went
well, you should have a `build` directory at the root of your clone, which
should contain a `server` directory. Go to that directory and start the server
like so

```sh
node server.js
```

You should see lots of logs, and some warnings due to the fact that some of the
binary files are not present on this repository. You can try to go to
[localhost:4000](http://localhost:4000/) and if everything went well, you
should see the index page of the website.

## What is supported for the moment
Huh... for the moment... pretty much nothing. The server should start, and
those two pages should be fully working :

  - the [index](http://localhost:4000/)
  - the [demo of the bouncing cube](http://localhost:4000/boucing/)

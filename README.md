[![Build Status](https://api.travis-ci.org/tforgione/3dinterface.svg?branch=typescript)](https://travis-ci.org/tforgione/3dinterface)
# 3D Interface
This is the beginning of the typescript version of 3D interface : a prototype
for a user-friendly 3D interface allowing to browse 3D scenes / models written
with Node.js.

It is hosted by [OpenShift](https://www.openshift.com/) at
[3dinterface.no-ip.org](http://3dinterface.no-ip.org).

# Prerequisites
  - [Node](https://nodejs.org/en/)
  - [NPM](https://www.npmjs.com/)
  - [TypeScript](http://www.typescriptlang.org/) : `sudo npm install -g typescript@next`
  - [TSD](http://definitelytyped.org/tsd/) : `sudo npm install -g tsd`
  - [Webpack](https://webpack.github.io/docs/) : `sudo npm install -g webpack`

# Install
```sh
make prepare
make
```

# Start server
``` sh
cd server/build
node server.js
```

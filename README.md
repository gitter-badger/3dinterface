# 3D Interface
A prototype for a user-friendly 3D interface allowing to browse 3D scenes /
models written with Node.js.

It is hosted by [OpenShift](https://www.openshift.com/) at
[3dinterface.no-ip.org](http://3dinterface.no-ip.org).

## Database setup
First you need to configure the database. You can create a postgres database
where you want, and you can initialize it by running the script
`sql/backup.pgsql`.

## Nodejs configuration
Then, you have to set up nodejs to access to your database. Basically, you have
to create a file `private.js` at the root of the repository looking like this :

``` javascript
module.exports.url = ... // the url to connect to your database

module.exports.secret = ... // A secret string used to hash stuff
```
## Compiling the static js files
There are two ways to compile the static js files :

  - either you don't mind not minifying the code, and you can use `compiler.sh`
    to compile
  - or you absolutely want to minify the code

First, `cd` to `utils/`. Here you'll find a script `build_all.sh` that, as its
name suggests, builds all. By default, it minifies the code, but you can pass
the option `--dev` to avoid minifying (which is a quite long operation).

If it worked, you should see lots of files in `*.min.js` in your `static/js`
directory, and a `geo.min.js` in your `lib` (at the root of the repository).

## Running the server
As usual with NodeJS, it's quite easy to test. Just ensure you have `node`
installed on your machine, clone this repo somewhere, and then, in the repo do

``` sh
npm install
node server.js
```

You should be able to go to [localhost:4000](http://localhost:4000) and see the
result.

Please note that some static files (some meshes / textures) are not on this
repository (especially the heavy ones).

## Developping
If you want to dev on this project, the `utils/demon.sh` may help you : it is
based on [nodemon](https://github.com/remy/nodemon) (that basically restarts
the server everytime there is a change in the code) and
[inotify](http://man7.org/linux/man-pages/man7/inotify.7.html) (that basically
recompiles everything when there is a modification). To use it, just `cd` to
`utils` and run `demon.sh` (note that it doesn't minify the code since this
operation is heavy and too long to redo everytime there is a change).

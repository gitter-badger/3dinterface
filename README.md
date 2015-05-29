# 3D Interface
A prototype for a user-friendly 3D interface allowing to browse 3D scenes /
models written with Node.js.

It is hosted by [OpenShift](https://www.openshift.com/) at
[3dinterface.no-ip.org](http://3dinterface.no-ip.org).

## To run a local server
### Database setup
First you need to configure the database. You can create a postgres database
where you want, and you can initialize it by running the script
`sql/backup.pgsql`.

### Nodejs configuration
Then, you have to set up nodejs to access to your database. Basically, you have
to create a file `private.js` at the root of the repository looking like this :

``` javascript
module.exports.url = ... // the url to connect to your database

module.exports.secret = ... // A secret string used to hash stuff
```
### Compiling the static js files
There are two ways to compile the static js files :

  - either you don't mind not minifying the code, and you can use `compiler.sh` to compile
  - or you absolutely want to minify the code, and you'll need 
    [closure-compiler](https://github.com/google/closure-compiler)

#### Compiling without minifying
To compile without minifying, simply run
```
make
```
in `static/js`.

#### Compiling and minifying
To compile and minify the js files, you have to run
```
make TYPE=RELEASE
```

If it doesn't work, check in the `Makefile` that the path to `closure-compiler.jar` 
is correct.

#### Check if it worked
If it worked, you should see lots of files in `*.min.js` in your `static/js` directory.

### Running the server
As usual with NodeJS, it's quite easy to test. Just ensure you have `node`
installed on your machine, clone this repo somewhere, and then, in the repo do

``` sh
npm install
node server.js
```

You should be able to go to [localhost:4000](http://localhost:4000) and see the result.

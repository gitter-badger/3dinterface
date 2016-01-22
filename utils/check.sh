#!/bin/bash
cd ..
jshint `find . -name "*.js" | grep -v -e "^./node_modules/" -e "^./js/" -e "./static/" -e "^./doc/" -e "\.min\.js$"| grep -v analyse.js`
jshint js/l3d

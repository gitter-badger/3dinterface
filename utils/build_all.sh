#!/bin/bash

type="RELEASE"

if [ "$1" == "--dev" ] || [ "$1" == "-d" ]; then
    type="DEV"
elif [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo -e "This is the 3dinterface builder"
    echo -e "\t - ./build_all.sh      \t\tBuilds and minify everything needed"
    echo -e "\t - ./build_all.sh --dev\t\tBuilds everything without minifying"
    exit 0
fi

cd ../js
make -j TYPE=$type
cd ../server/geo
make -j TYPE=$type


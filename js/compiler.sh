#!/usr/bin/bash
args=""

while [[ $# > 0 ]]; do
    key="$1"

    case $key in
        --js) args="$args $2"
            shift
            ;;

        --js_output_file)
            output="$2"
            shift
            ;;
    esac

    shift

done

cat $args > $output

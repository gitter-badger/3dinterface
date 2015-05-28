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

if [ -z "$output" ]; then
    cat $args
else
    cat $args > $output
fi

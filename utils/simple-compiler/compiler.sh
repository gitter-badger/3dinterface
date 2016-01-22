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
    for f in $args; do
            cat "$f"
            echo
    done
else
    echo > $output
    for f in $args; do
            cat "$f" >> $output
            echo >> $output
    done
fi

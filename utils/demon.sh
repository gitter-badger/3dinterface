#!/usr/bin/bash

LANG="en_US.utf8"

function my_date {
    date +"%d %b %T -" | tr '\n' ' '
}

function myecho {
    my_date
    echo $@
}

cd ../js
inotifywait -r -e close_write -m . |
    while read path action file; do
        if [ `find . -name $file | wc -l` -ne 0 ]; then
            myecho -e "\033[32m[demonjs] Compiling...\033[0m"
            make -j > /dev/null
            if [ $? -eq 0 ]; then
                my_date
                echo -e "\033[32m[demonjs] Compilation successful\033[0m"
            fi
        fi
    done &

cd ../geo
inotifywait -r -e close_write -m . |
    while read path action file; do
        if [ `find . -name $file | wc -l` -ne 0 ]; then
            myecho -e "\033[32m[demongeo] Compiling...\033[0m"
            make -j > /dev/null
            if [ $? -eq 0 ]; then
                myecho -e "\033[32m[demongeo] Compilation successful\033[0m"
            fi
        fi
    done &

cd ..
nodemon server.js &

function killit {

    killall inotifywait
    # killall nodemon

}

trap "killit" SIGINT SIGTERM

wait

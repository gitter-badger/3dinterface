#!/usr/bin/bash
rm cookies*
for i in `seq 1 8`; do
    casperjs load.js --cookies-file=cookies"$i".txt&
done

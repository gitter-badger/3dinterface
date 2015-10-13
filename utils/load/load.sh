#!/usr/bin/bash
rm -f cookies*
for i in `seq 1 30`; do
    casperjs load.js --cookies-file=cookies"$i".txt&
done

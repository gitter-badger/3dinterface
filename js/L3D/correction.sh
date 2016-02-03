#!/usr/bin/zsh
IFS=$'\n'
for i in `cat correct.txt`; do
    number=`echo $i | cut -d ' ' -f 1`
    str=`echo $i | cut -d ' ' -f 2`
    sed -i.bakup "$number"s/$str/Tools.$str/g $1
done

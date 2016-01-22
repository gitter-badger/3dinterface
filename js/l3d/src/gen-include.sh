echo '// <reference path="../../../typings/tsd.d.ts" />' > Include.ts

for i in `find . -name "*.ts"`; do

    echo "// <reference path=\"$i\" />" >> Include.ts

done

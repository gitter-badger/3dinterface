#!/usr/bin/bash
cd ..
rm -rf doc/out/
typedoc --includes js/l3d/ server/ --out doc/out/ --mode file --module commonjs --name L3D --readme README.md --exclude "server/controllers/*.ts" "server/private.ts" "server/urls.ts" "server/server.ts"

src/bouncing-cube/typings: src/bouncing-cube/typings/typings/.dirstamp src/bouncing-cube/typings/custom/.dirstamp

src/bouncing-cube/typings/typings/.dirstamp: src/bouncing-cube/typings/tsd.json
	$(CD) src/bouncing-cube/typings && $(TSD) install
	$(TOUCH_DIRSTAMP)

src/bouncing-cube/typings/custom/.dirstamp: custom_typings/*
	$(MKDIRP) src/bouncing-cube/typings/custom/
	$(MERGE) custom_typings src/bouncing-cube/typings/custom
	touch $@

src/bouncing-cube/node_modules/.dirstamp: src/bouncing-cube/package.json $(l3d)
	$(CD) src/bouncing-cube/ && $(NPM) install
	$(TOUCH_DIRSTAMP)

src/server/build/static/js/bouncing.min.js: src/bouncing-cube/src/* src/bouncing-cube/node_modules/.dirstamp src/bouncing-cube/tsconfig.json src/bouncing-cube/typings l3d
	$(WEBPACK) --config src/bouncing-cube/config.js

bouncing-cube=src/server/build/static/js/bouncing.min.js


src/bouncing-cube/typings: src/bouncing-cube/typings/typings/.dirstamp src/bouncing-cube/typings/custom/.dirstamp

src/bouncing-cube/typings/typings/.dirstamp: src/bouncing-cube/typings/typings.json
	$(CD) src/bouncing-cube/typings && $(TYPINGS) install
	$(TOUCH_DIRSTAMP)

src/bouncing-cube/typings/custom/.dirstamp: $(CUSTOM_TYPINGS_SRC)
	$(MKDIRP) src/bouncing-cube/typings/custom/
	$(MERGE) custom_typings src/bouncing-cube/typings/custom
	touch $@

src/bouncing-cube/node_modules/.dirstamp: src/bouncing-cube/package.json $(L3D_DEPENDENCY)
	$(CD) src/bouncing-cube/ && $(NPM_UNINSTALL) l3d && $(NPM_INSTALL)
	$(TOUCH_DIRSTAMP)

src/server/build/static/js/bouncing.min.js: $(wildcard src/bouncing-cube/src/*) src/bouncing-cube/node_modules/.dirstamp src/bouncing-cube/tsconfig.json src/bouncing-cube/typings
	$(WEBPACK) --config src/bouncing-cube/config.js

BOUNCING_CUBE_DEPENDENCY=src/server/build/static/js/bouncing.min.js
bouncing-cube: $(BOUNCING_CUBE_DEPENDENCY)


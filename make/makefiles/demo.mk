DEMO_DEPENDENCY=src/demo/build/.dirstamp
demo: $(DEMO_DEPENDENCY)

src/demo/typings/typings/.dirstamp: src/demo/typings/typings.json
	$(CD) src/demo/typings/ && $(TYPINGS) install
	$(TOUCH_DIRSTAMP)

src/demo/typings/custom/.dirstamp: $(CUSTOM_TYPINGS_SRC)
	$(MKDIRP) src/demo/typings/custom
	$(MERGE) ./custom_typings src/demo/typings/custom
	$(TOUCH_DIRSTAMP)

src/demo/typings/.dirstamp: src/demo/typings/typings/.dirstamp src/demo/typings/custom/.dirstamp
	$(TOUCH_DIRSTAMP)

src/demo/node_modules/.dirstamp: src/demo/package.json $(L3D_DEPENDENCY) $(L3DP_DEPENDENCY)
	$(CD) src/demo/ && $(NPM_INSTALL)
	$(TOUCH_DIRSTAMP)

src/demo/build/.dirstamp: $(wildcard src/demo/*.ts) src/demo/node_modules/.dirstamp src/demo/tsconfig.json src/demo/typings/.dirstamp src/demo/config.js
	$(WEBPACK) --config src/demo/config.js
	$(TOUCH_DIRSTAMP)


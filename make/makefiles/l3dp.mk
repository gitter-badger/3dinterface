L3DP_DEPENDENCY=src/l3dp/build/.dirstamp
l3dp: $(L3DP_DEPENDENCY)

src/l3dp/typings: src/l3dp/typings/typings/.dirstamp src/l3dp/typings/custom/.dirstamp

src/l3dp/typings/typings/.dirstamp: src/l3dp/typings/tsd.json
	$(CD) src/l3dp/typings && $(TSD) install
	$(TOUCH_DIRSTAMP)

src/l3dp/typings/custom/.dirstamp: ./custom_typings/*
	$(MKDIRP) src/l3dp/typings/custom/
	$(MERGE) custom_typings src/l3dp/typings/custom
	$(TOUCH_DIRSTAMP)

src/l3dp/node_modules/.dirstamp: src/l3dp/package.json $(L3D_DEPENDENCY) $(CONFIG_DEPENDENCY) $(MTH_COMMONJS_DEPENDENCY)
	$(CD) src/l3dp/ && $(NPM) install
	$(TOUCH_DIRSTAMP)

src/l3dp/build/.dirstamp: src/l3dp/src/* src/l3dp/node_modules/.dirstamp src/l3dp/tsconfig-backend.json src/l3dp/backend.config.js src/l3dp/typings
	$(WEBPACK) --config src/l3dp/backend.config.js
	$(TOUCH_DIRSTAMP)

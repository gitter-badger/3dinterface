L3D_DEPENDENCY=src/l3d/build/.dirstamp
l3d: $(L3D_DEPENDENCY)

src/l3d/typings: src/l3d/typings/typings/.dirstamp src/l3d/typings/custom/.dirstamp

src/l3d/typings/typings/.dirstamp: src/l3d/typings/tsd.json
	$(CD) src/l3d/typings && $(TSD) install
	$(TOUCH_DIRSTAMP)

src/l3d/typings/custom/.dirstamp: ./custom_typings/*
	$(MKDIRP) src/l3d/typings/custom/
	$(MERGE) ./custom_typings src/l3d/typings/custom
	$(TOUCH_DIRSTAMP)

src/l3d/node_modules/.dirstamp: src/l3d/package.json $(MTH_COMMONJS_DEPENDENCY)
	$(CD) src/l3d/ && $(NPM) install
	$(TOUCH_DIRSTAMP)

src/l3d/build/.dirstamp: src/l3d/src/* src/l3d/node_modules/.dirstamp src/l3d/tsconfig-backend.json src/l3d/backend.config.js src/l3d/typings
	$(WEBPACK) --config src/l3d/backend.config.js
	$(TOUCH_DIRSTAMP)

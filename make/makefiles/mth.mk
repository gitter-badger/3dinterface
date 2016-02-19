mth:src/mth/build/.dirstamp
mth=src/mth/build/.dirstamp

src/mth/typings/.dirstamp: src/mth/tsd.json
	$(CD) src/mth/ && $(TSD) install
	$(TOUCH_DIRSTAMP)

src/mth/node_modules/.dirstamp: src/mth/package.json
	$(CD) src/mth/ && $(NPM) install
	$(TOUCH_DIRSTAMP)

src/mth/build/.dirstamp: src/mth/*.ts src/mth/tsconfig.json src/mth/typings/.dirstamp src/mth/node_modules/.dirstamp
	$(CD) src/mth/ && $(TSC)
	$(TOUCH_DIRSTAMP)

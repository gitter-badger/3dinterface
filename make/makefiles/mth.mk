MTH_COMMONJS_DEPENDENCY=src/mth/build/.dirstamp
mth: $(MTH_COMMONJS_DEPENDENCY)

src/mth/typings/.dirstamp: src/mth/typings.json
	$(CD) src/mth/ && $(TYPINGS) install
	$(TOUCH_DIRSTAMP)

src/mth/node_modules/.dirstamp: src/mth/package.json
	$(CD) src/mth/ && $(NPM) install
	$(TOUCH_DIRSTAMP)

src/mth/build/.dirstamp: $(wildcard src/mth/*.ts) src/mth/package.json src/mth/tsconfig.json src/mth/typings/.dirstamp src/mth/node_modules/.dirstamp $(wildcard src/mth/tests/*.ts)
	$(CD) src/mth/ && $(TSC)
	$(TOUCH_DIRSTAMP)

test-mth: $(MTH_COMMONJS_DEPENDENCY)
	nodeunit src/mth/build/tests/main.js

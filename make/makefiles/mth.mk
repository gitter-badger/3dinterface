MTH_COMMONJS_DEPENDENCY=src/mth/build/.dirstamp
mth: $(MTH_COMMONJS_DEPENDENCY)

src/mth/typings/.dirstamp: src/mth/typings.json
	$(CD) src/mth/ && $(TYPINGS) install
	$(TOUCH_DIRSTAMP)

src/mth/build/.dirstamp: src/mth/*.ts src/mth/package.json src/mth/tsconfig.json src/mth/typings/.dirstamp
	$(CD) src/mth/ && $(TSC)
	$(TOUCH_DIRSTAMP)

mth_test: $(MTH_COMMONJS_DEPENDENCY) src/mth/tests/*.ts
	$(NODEUNIT) src/mth/build/tests/main.js

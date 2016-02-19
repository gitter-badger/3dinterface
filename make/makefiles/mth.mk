mth: src/mth/build/.dirstamp

src/mth/typings/.dirstamp: src/mth/tsd.json
	$(CD) src/mth/ && $(TSD) install
	$(TOUCH_DIRSTAMP)

src/mth/build/.dirstamp: src/mth/*.ts src/mth/package.json src/mth/tsconfig.json src/mth/typings/.dirstamp
	$(CD) src/mth/ && $(TSC)
	$(TOUCH_DIRSTAMP)

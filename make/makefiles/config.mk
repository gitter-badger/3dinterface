config: config/build/.dirstamp

config/build/.dirstamp: config/*.ts config/package.json config/tsconfig.json
	$(CD) config && $(TSC)
	$(TOUCH_DIRSTAMP)

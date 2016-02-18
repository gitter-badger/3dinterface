config: src/config/build/.dirstamp

src/config/build/.dirstamp: src/config/*.ts src/config/package.json src/config/tsconfig.json
	$(CD) config && $(TSC)
	$(TOUCH_DIRSTAMP)

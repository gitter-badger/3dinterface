CONFIG_DEPENDENCY=src/config/build/.dirstamp
config: $(CONFIG_DEPENDENCY)

src/config/build/.dirstamp: $(wildcard src/config/*.ts) src/config/package.json src/config/tsconfig.json
	$(CD) src/config/ && $(TSC)
	$(TOUCH_DIRSTAMP)

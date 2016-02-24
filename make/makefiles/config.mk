CONFIG_DEPENDENCY=src/config/build/.dirstamp
config: $(CONFIG_DEPENDENCY)

src/config/build/.dirstamp: $(wildcard src/config/*.ts) src/config/package.json src/config/tsconfig.json
	@$(ECHO) $(STYLE_BUILD)Building TS module "config" $(COLOR_DEFAULT)
	@$(CD) src/config/ && $(TSC)
	@$(TOUCH_DIRSTAMP)
	@$(ECHO) Built module "config"

clean-config:
	@$(RMRF) \
		src/config/build \
		src/server/build/static/js/config.js \
		src/server/build/static/js/config.js.map

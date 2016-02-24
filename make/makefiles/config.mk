CONFIG_DEPENDENCY=src/config/build/.dirstamp
config: $(CONFIG_DEPENDENCY)

src/config/build/.dirstamp: $(call FIND,src/config/,*.js) $(call FIND,src/config/,*.ts) $(call FIND,src/config/*.json) src/config/package.json src/config/tsconfig.json
	@$(call LOG_BUILDING,config)
	@$(CD) src/config/ && $(TSC)
	@$(TOUCH_DIRSTAMP)
	@$(call LOG_BUILT,config)

clean-config:
	@$(RMRF) \
		src/config/build \
		src/server/build/static/js/config.js \
		src/server/build/static/js/config.js.map

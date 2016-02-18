l3dp: l3dp/build/.dirstamp

l3dp/typings: l3dp/typings/typings/.dirstamp l3dp/typings/custom/.dirstamp

l3dp/typings/typings/.dirstamp: l3dp/typings/tsd.json
	$(CD) l3dp/typings && $(TSD) install
	$(TOUCH) $@

l3dp/typings/custom/.dirstamp: ./custom_typings/*
	$(MKDIR) -p l3dp/typings/custom/
	$(MERGE) ./custom_typings ./l3dp/typings/custom
	$(TOUCH) $@

l3dp/node_modules/.dirstamp: l3dp/package.json l3d config
	$(CD) l3dp && $(NPM) install
	$(TOUCH) $@

l3dp/build/.dirstamp: l3dp/src/* l3dp/node_modules/.dirstamp l3dp/tsconfig-backend.json l3dp/backend.config.js l3dp/typings
	$(WEBPACK) --config l3dp/backend.config.js
	$(TOUCH) $@

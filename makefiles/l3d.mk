l3d: l3d/build/.dirstamp

l3d/typings: l3d/typings/typings/.dirstamp l3d/typings/custom/.dirstamp

l3d/typings/typings/.dirstamp: l3d/typings/tsd.json
	$(CD) l3d/typings && tsd install
	$(TOUCH) $@

l3d/typings/custom/.dirstamp: ./custom_typings/*
	$(MKDIRP) l3d/typings/custom/
	$(MERGE) ./custom_typings l3d/typings/custom
	$(TOUCH) $@

l3d/node_modules/.dirstamp: l3d/package.json
	$(CD) l3d && npm install
	$(TOUCH) $@

l3d/build/.dirstamp: l3d/src/* l3d/node_modules/.dirstamp l3d/tsconfig-backend.json l3d/backend.config.js l3d/typings
	$(WEBPACK) --config l3d/backend.config.js
	$(TOUCH) $@

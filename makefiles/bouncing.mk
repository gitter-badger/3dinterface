bouncing-cube/typings: bouncing-cube/typings/typings/.dirstamp bouncing-cube/typings/custom/.dirstamp

bouncing-cube/typings/typings/.dirstamp: bouncing-cube/typings/tsd.json
	$(CD) bouncing-cube/typings && $(TSD) install
	$(TOUCH) $@

bouncing-cube/typings/custom/.dirstamp: custom_typings/*
	$(MKDIRP) bouncing-cube/typings/custom/
	$(MERGE) custom_typings bouncing-cube/typings/custom
	touch $@

bouncing-cube/node_modules/.dirstamp: bouncing-cube/package.json
	$(CD) bouncing-cube && $(NPM) install
	$(TOUCH) $@

server/build/static/js/bouncing.min.js: bouncing-cube/src/* bouncing-cube/node_modules/.dirstamp bouncing-cube/tsconfig.json bouncing-cube/typings
	$(WEBPACK) --config config.js

bouncing-cube: server/build/static/js/bouncing.min.js


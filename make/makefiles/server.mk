server/typings: server/typings/typings/.dirstamp server/typings/custom/.dirstamp

server/typings/typings/.dirstamp: server/typings/tsd.json
	$(CD) server/typings && $(TSD) install
	$(TOUCH) $@

server/typings/custom/.dirstamp: ./custom_typings/*
	$(MKDIRP) server/typings/custom/
	$(MERGE) custom_typings server/typings/custom
	$(TOUCH) $@

server/node_modules/.dirstamp: server/package.json l3d l3dp config
	$(CD) server && $(NPM) install
	$(TOUCH) $@

server/build/.dirstamp: server/src/* server/node_modules/.dirstamp server/typings
	$(CD) server && $(TSC)
	$(TOUCH) $@

server/build/views/.dirstamp: server/src/views/*
	$(MKDIRP) server/build/views/
	$(MERGE) server/src/views server/build/views
	$(TOUCH) $@

server/build/static/.dirstamp: static/*
	$(MKDIRP) server/build/static/
	$(MERGE) static server/build/static/
	$(TOUCH) $@

server/build/controllers/%/views: server/src/controllers/%/views
	$(MKDIRP) $@
	$(MERGE) $< $@
	$(TOUCH) $@

SRC_VIEWS=$(wildcard server/src/controllers/*/views)
OBJ_VIEWS=$(subst src,build,$(SRC_VIEWS))

views: $(OBJ_VIEWS)

server/build/static/js/l3d.js: ./l3d/build/.dirstamp
	$(CD) ./l3d && $(WEBPACK) --config frontend.config.js

server/build/static/js/l3dp.js: ./l3dp/build/.dirstamp
	$(CD) ./l3dp && $(WEBPACK) --config frontend.config.js

server/build/static/js/config.js: ./config/build/.dirstamp
	$(CD) ./config && $(TSC)

server: server/build/.dirstamp server/build/views/.dirstamp server/build/static/.dirstamp views server/build/static/js/l3d.js server/build/static/js/l3dp.js server/build/static/js/config.js

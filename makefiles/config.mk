config: config/build/.dirstamp

config/build/.dirstamp:
	cd config && $(TSC)
	$(TOUCH) $@

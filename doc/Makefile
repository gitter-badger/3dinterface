TYPEDOC=doc/typedoc/bin/typedoc

all:
	cd .. && \
	rm -rf doc/out/ && \
	$(TYPEDOC) js/l3d/src/ server/geo/ server/controllers/prototype/ \
	           --includes js/l3d/ --includes server/geo/ \
	           --out doc/out/ \
	           --mode file \
	           --name L3D \
	           --module commonjs \
	           --readme README.md \
	           -excludeNotExported



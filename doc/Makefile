all:
	cd .. && \
	rm -rf doc/out/ && \
	typedoc js/l3d/src/ server/geo/ \
	        --includes js/l3d/ --includes server/geo/ \
	        --out doc/out/ \
	        --mode file \
	        --module commonjs \
	        --name L3D \
	        --readme README.md \
	        -excludeNotExported

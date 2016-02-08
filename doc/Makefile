TYPEDOC=typedoc

all:
	cd .. && \
	rm -rf doc/out/* && \
	$(TYPEDOC) \
			js/L3D/ server/geo/ server/controllers/prototype/ \
			--exclude server/controllers/prototype/index.ts \
			--exclude server/controllers/prototype/urls.ts \
			--exclude js/L3D/node_modules \
			--exclude server/node_modules \
			--includes js/L3D/ --includes server/geo/ \
			--out doc/out/ \
			--mode file \
			--name L3D \
			--module commonjs \
			--readme README.md

clean:
	rm -rf out

push: all
	ssh pi@dragonrock.no-ip.org "rm -rf web/l3d-doc/typescript"
	scp -r out pi@dragonrock.no-ip.org:web/l3d-doc/typescript

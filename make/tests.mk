TEST_FILES_SRC=$(wildcard src/*/tests/main.ts)

src/%/build/tests/main-cov.js: src/%/build/tests/main.js
	jscoverage $<

test-%: src/%/build/tests/main-cov.js
	nodeunit $<

test: $(TEST_FILES_SRC)
	nodeunit src/mth/build/tests/main-cov.js

coveralls: $(TEST_FILES_SRC)
	nodeunit --reporter=lcov src/mth/build/tests/main-cov.js | coveralls

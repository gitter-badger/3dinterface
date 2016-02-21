TEST_FILES_SRC=$(wildcard src/*/tests/main.ts)
TEST_OBJ=$(subst tests/main.ts,build/tests/main.js,$(TEST_FILES_SRC))
TEST_COV=$(TEST_OBJ:.js=-cov.js)

src/%/build/tests/main-cov.js: src/%/build/tests/main.js $(MTH_COMMONJS_DEPENDENCY)
	jscoverage $<

test-%: src/%/build/tests/main-cov.js
	nodeunit $<

test: $(TEST_COV)
	nodeunit src/mth/build/tests/main-cov.js

coveralls: $(TEST_COV)
	nodeunit --reporter=lcov src/mth/build/tests/main-cov.js | coveralls

# configuration for the test suite
ALL_TESTS = $(shell find tests/ -name '*.test.js')
REPORTER = spec
UI = exports

test:
	@./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout 4000 \
		--ui $(UI) \
		--growl \
		$(ALL_TESTS)

.PHONY: test

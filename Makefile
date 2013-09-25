default: test

MOCHA   = node_modules/.bin/mocha -u tdd --check-leaks
VERSION = $(shell node -pe 'require("./package.json").version')

all: test

.PHONY: release test loc clean no_targets__ help

no_targets__:
help:
	@sh -c "$(MAKE) -rpn no_targets__ | awk -F':' '/^[a-zA-Z0-9][^\$$#\/\\t=]*:([^=]|$$)/ {split(\$$1,A,/ /);for(i in A)print A[i]}' | grep -v '__\$$' | grep -v 'Makefile' | grep -v 'make\[1\]' | sort"

run:
	@./node_modules/node-dev/bin/node-dev lib/server.js

run-test:
	@./node_modules/mpr/bin/mpr run ./test/run.json

tag:
	@git tag -a "v$(VERSION)" -m "Version $(VERSION)"

tag-push: tag
	@git push --tags origin HEAD:master

test: build
	@NODE_ENV=test $(MOCHA) -R spec test/*.coffee --grep @slow --invert

test-slow: build
	@NODE_ENV=test $(MOCHA) -R spec test/*.coffee --grep @slow --timeout 10000

test-all: build
	@NODE_ENV=test $(MOCHA) -R spec test/*.coffee --timeout 10000

loc:
	@find lib/ -name *.js | xargs wc -l

setup:
	@npm install . -d

clean-dep:
	rm -rf node_modules


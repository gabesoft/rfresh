default: test

MOCHA   = node_modules/.bin/mocha -u tdd --check-leaks
VERSION = $(shell node -pe 'require("./package.json").version')

all: test

.PHONY: release test loc clean

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
	@find src/ -name *.js | xargs wc -l

setup:
	@npm install . -d

clean-dep:
	@rm -rf node_modules


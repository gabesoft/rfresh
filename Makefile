default: build

SRC = $(shell find src -name "*.coffee" -type f | sort)
LIB = $(SRC:src/%.coffee=lib/%.js)

COFFEE = node_modules/.bin/coffee --js
MOCHA  = node_modules/.bin/mocha --compilers coffee:coffee-script-redux -u tdd --check-leaks

all: build test
build: $(LIB)

lib/%.js: src/%.coffee
	mkdir -p "$(@D)"
	$(COFFEE) <"$<" >"$@"

.PHONY: release test loc clean

VERSION = $(shell node -pe 'require("./package.json").version')

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
	@find src/ -name *.coffee | xargs wc -l

setup:
	@npm install . -d

clean:
	@rm -rf $(LIB)

clean-lib:
	@rm -rf lib

clean-dep:
	@rm -rf node_modules

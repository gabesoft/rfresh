default: test

VERSION = $(shell node -pe 'require("./package.json").version')

all: test

.PHONY: release test loc clean no_targets__ help

# Run the rfresh server
run:
	@./node_modules/node-dev/bin/node-dev lib/server.js

# Run the rfresh server along with the test server
run-test:
	@echo 'run "open http://localhost:8002/" and make changes to files in test/public'
	@node lib/index.js -p 8003 -r "/::/test/public/" &
	@node test/server.js

# Add a version tag
tag:
	@git tag -a "v$(VERSION)" -m "Version $(VERSION)"

# Add a version tag and push changes to master
tag-push: tag
	@git push --tags origin HEAD:master

# Display line counts per source file
loc:
	@find lib/ -name *.js | xargs wc -l

# Setup npm dependencies
setup:
	@npm install . -d

# Clean npm dependencies
clean-dep:
	$(RM) -r node_modules


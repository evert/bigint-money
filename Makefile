project:=bigint-money
export PATH:=./node_modules/.bin/:$(PATH)

.PHONY: build
build: browser/${PROJECT}.min.js

.PHONY: clean
clean:
	rm -r browser/
	rm -r dist/

.PHONY: test
test: lint
	npx tsx --test

.PHONY: test-debug
test-debug:
	mocha --inspect-brk

.PHONY:lint
lint:
	eslint --quiet 'src/*.ts' 'test/*.ts'

.PHONY:lint-fix
lint-fix: fix

.PHONY:fix
fix:
	eslint --quiet 'src/**/*.ts' 'test/**/*.ts' --fix

.PHONY: tsbuild
tsbuild:
	tsc

.PHONY: watch
watch:
	tsc --watch

.PHONY: browserbuild
browserbuild: tsbuild
	# mkdir -p browser
	# webpack \
	#	--optimize-minimize \
	#	-p \
	#	--display-modules \
	#	--sort-modules-by size

browser/${PROJECT}.min.js: browserbuild

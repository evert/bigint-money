project:=bigint-money
export PATH:=./node_modules/.bin/:$(PATH)

.PHONY: build
build: tsbuild

.PHONY: clean
clean:
	rm -r browser/
	rm -r dist/

.PHONY: test
test: lint
	npx tsx --test test/*.ts

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

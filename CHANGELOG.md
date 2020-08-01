Changelog
=========

1.2.0 (2020-08-01)
------------------

* Added `pow()` operation.


1.1.1 (2020-02-02)
------------------

* Update dependencies


1.1.0 (2019-06-12)
------------------

* `multiply()` and `divide()` can now accept other `Money` objects as
  arguments.


1.0.0 (2019-05-26)
------------------

* Added `abs()` function, to remove the sign from values. (@flaktack)
* Added `sign()` function to find out if a number is postive, negative or
  zero (@flaktack).


0.8.2 (2019-04-03)
------------------

* Don't round numbers when used with `console.log()`.


0.8.1 (2019-03-21)
------------------

* Re-release of 0.8.0 with the correct build artifacts.
* I've also updated `package.json` so we do a correct build before publish, so
  this issue won't happen again.


0.8.0 (2019-03-21)
------------------

* Increased the precision to 20 digits, up from 12. Someone had a need for more
  than 12 digits, and 20 seems like a reasonable new limit.
  Perhaps at one point this will be configurable but picking a good default
  seems like a sane choice right now.


0.7.1 (2019-03-19)
------------------

* Re-release: Stripped all development files from the npm package build. This
  makes the npm package a lot slimmer.


0.7.0 (2019-03-19)
------------------

* Added `isLesserThan`, `isGreaterThan`, `isEqual`, `isLesserThanOrEqual`,
  `isGreaterThanOrEqual` methods.


0.6.4 (2019-02-27)
------------------

* The last release didn't have all it's files correctly built. This version is
  a re-release that's properly built.


0.6.3 (2019-02-27)
------------------

* Regression from "0.6.2": Negative values were still incorrect for the same
  bug.


0.6.2 (2019-02-27)
------------------

* Fixed critical bug in `toFixed()` function. It can round `0.995` to `0.100`
  instead of `1`. This bug only appears when rounding decimals should increase
  the integer part.


0.6.1 (2019-02-25)
------------------

* Added `Round.HALF_TOWARDS_0`, `Round.TRUNCATE`.


0.6.0 (2019-02-23)
------------------

* It's not possible to specify the rounding method. The default is still
  `HALF_TO_EVEN` but a `HALF_AWAY_FROM_0` option has been added.


0.5.0 (2019-01-18)
------------------

* Added a `format()` function that simply returns the currency value as a
  string, with all insignificant 0's removed.


0.4.0 (2019-01-04)
------------------

* This library now adds a `toJSON()` function that has a default serialization
  for JSON files. Example: 1.5 USD will be JSON-stringified as `["1.5", "USD"]`.
* The Money class is now the default export.

0.3.0 (2018-12-13)
------------------

* Support for `divide()`, `multiply()`, `compare()`.
* Added an implementation of the `allocate()` function from Fowler's
  Enterprise Design Patterns.
* Fixed parsing string numbers without a fractional part.
* Added `toSource()` and `fromSource()` methods to easily get access to the
  underlying bigint.
* `Money.value` is now private.
* Nice v8 debugger output. Shows the currency + the symbol.


0.2.0 (2018-12-12)
------------------

* The rounding method everywhere is now 'Bankers rounding', also known as
  'round half to even'. This is a more acceptable rounding for finanical
  purposes.
* Moved some utilities into the `src/util.ts` function.
* Fixed bugs in `toFixed()`.
* Higher test coverage.


0.1.1 (2018-12-11)
------------------

* Fixed bugs.
* More test coverage
* Support for passing negative and floating point-as-string in constructor.
* Readme with docs.


0.1.0 (2018-12-10)
------------------

* First working release. Support for basic arthimetic.
* Temporarily dropped support for a webpack build until they support bigint.


0.0.1 (2018-12-06)
-----------------

* First started working on this.

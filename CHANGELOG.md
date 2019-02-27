Changelog
=========

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

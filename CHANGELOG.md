Changelog
=========

0.3.0 (2018-12-??)
------------------

* Support for `divide()`, `multiply()`, `compare()`.
* Added an implementation of the `allocate()` function from Fowler's
  Enterprise Design Patterns.
* Fixed parsing string numbers without a fractional part.
* Added `toSource()` and `fromSource()` methods to easily get access to the
  underlying bigint.
* `Money.value` is now private.


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

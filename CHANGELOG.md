Changelog
=========

0.3.0 (2018-12-??)
------------------

* Support for `divide()`, `multiply()`, `compare()`.
* Fixed parsing string numbers without a fractional part.


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

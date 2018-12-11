bigint-money
============

This library can be used for doing math with Money. This library
uses the Ecmascript [bigint][2] type. It's written in Typescript,
but can be used by Javascript as well.

`bigint` is really new. As of today, this library only works in
up-to-date versions of Chrome and Firefox.

This library more-or-less follows [Martin Fowler's Money Type][3] from
["Patterns of Enterprise Application Architecture"][4].

Installation
------------

    npm i bigint-money


Usage
-----

Creating a money object.

```javascript
const Money = require('bigint-money');
const foo = new Money('5', 'USD');
```

It's possible to create a new money object with a Number as well

```javascript
const foo = new Money(5, 'USD');
```

However, if you pass it a number that's 'unsafe' such as a float,
an error will be thrown:

```javascript
const foo = new Money(.5, 'USD');
// UnsafeIntegerException
```

Once you have a `Money` object, you can use `toFixed()` to output
a string.

```javascript
const foo = new Money('5', 'USD');
console.log(foo.toFixed(2)); // 5.00
```

You can use `.add()` and `.subtract()` on it:

```javascript
const foo = new Money('5', 'USD');
const bar = foo.add('10');
```

All `Money` objects are immutable. Calling those functions does
not change the original value:

```javascript
console.log(foo.toFixed(2), bar.toFixed(2));
// 5.00 1.00
```

Why is this library needed?
---------------------------

### Floating points and money

Using floating points for money can be problematic when rounding,
you don't always get what you expect.

Because of this, developers tend to multiply their currencies
by a 100, so instead of 5 dollars, they might count 500 cents.

This ensures that there are no rounding problems.

However, this might start to get problematic if a lot of digits
are needed. Javascript automatically converts integers to floats
once they are larger than 9,007,199,254,740,991.

When counting cents instead of dollars, this still gives us a
maximum of 90 trillion dollars. Some financial calculations
require more more precision than cents though.

For example, there are cryptocurrencies such as Monero that
count up 12 digits. This means if we want to precisely count
monero, this gives us a maxium of 9007 monero, which currently
is around $390,000 USD.

Even in traditional accounting and finance, it might be required
to have more significant digits.

### Bigint libraries in javascript

Traditionally this is solved in Javascript by using one of the
'bigint' or bignumber' libraries. Some examples:

* [big-integer](https://www.npmjs.com/package/big-integer)
* [big-number](https://www.npmjs.com/package/big-number)

The way these libraries work is that they use strings for numbers,
split the number up somehow and do arthimetic sometimes 1 digit
at a time.

This is fairly complex, and not very fast.

### Bigint in EcmaScript

Future versions of Ecmascript will have support for a [bigint][1] type. This
type is a new type of 'number', but unlike the 'Number' type it
doesn't automatically convert to floating point numbers and can
be extremely large.

The way you might see a bigint in a source file is like this:

```javascript
const foo = 10n + 5n;
```

The `n` prefix tells the javascript engine this is no `Number`,
but a `Bigint`.

There's a lot more info on the [Google Blog][2].

### This library

There are a lot of Money libraries around. Unlike the libraries that
exist today, this Money library has these features:

1. It use Javascript's native bigint. Which makes it fast.
2. It internally uses 12 digits for precision.
3. Rounding works the way you expect.
4. It more-or-less follows [Martin Fowler's Money Type][3] from
   ["Patterns of Enterprise Application Architecture"][4].

Do not use this library if you need to target older browsers. Modern versions
of Node.js have support for this, as does chrome but Firefox does not (yet).

See [caniuse.com][5] to see an up to date list of browser support.


[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
[2]: https://developers.google.com/web/updates/2018/05/bigint
[3]: https://martinfowler.com/eaaCatalog/money.html
[4]: https://amzn.to/2EezezD "Note: affiliate link"
[5]: https://caniuse.com/#search=bigint

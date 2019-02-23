bigint-money
============

This library can be used for doing math with Money. Key features:

* Uses the the Ecmascript [bigint][2] type.
* Written in Typescript.
* Loosely follows [Martin Fowler's Money Type][3] from
 ["Patterns of Enterprise Application Architecture"][4].
* Faster than Money packages that use non-native bigdecimal libraries.
* All rounding is done via the ["Bankers Rounding"][6] (a.k.a. "round
  half to even") by default, but different rounding strategies can be
  specified.
* Uses 12 decimals for all calculations.

`bigint` is really new. As of today, this library only works in
up-to-date versions of Chrome and Node.js. See [caniuse.com][5].

My advice is to NOT use this with browsers until there's other
browsers than Chrome to support this. It works great with Node.js
10.4 and up though.

Benchmark
---------

Most 'money' libraries on NPM only use 2 digits for precision, or use 
Javacript's "number" and will quickly overflow.

The only comparible library I found was [big-money][7]. It's probably
the best alternative if your Javascript environment doesn't have support
for `bigint` yet.

My simple benchmark calculates a ledger with 1 million entries.

```
        bigint-money  |   big-money
ledger       816 ms   |   43.201 ms
%            100 %    |     5294 %
```

If you want to run it yourself, you can find my test script in the `bench/`
directory.


Installation
------------

    npm i bigint-money

Usage
-----

Creating a money object.

```javascript
const { Money } = require('bigint-money');
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

### Arithmetic

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

You can also pass `Money` objects to `subtract` and `add`:

```javascript
const startBalance = new Money(1000, 'USD');
const salary = new Money(2000, 'USD');
const newBalance = startBalance.add(salary);
```

If you try to add money from different currencies, an error
will be thrown:

```javascript
new Money(1000, 'USD').add( new Money( 50000, 'YEN' ));
// IncompatibleCurencyError
```

Division and multiplication:

```javascript
// Division
const result = new Money(10).divide(3);

// Multiplication
const result = new Money('2000').multiply('1.25');
```

### Comparing objects

Right now the Money object has a single function for comparison.

```javascript
const money1 = new Money('1.00', 'EUR');

money.compare(2); // Returns -1
money.compare(1); // Returns 0
money.compare(0); // Returns 1

money.compare('0.01'); // returns -1
money.compare(new Money('1.000005', 'EUR')); // returns 1

money.compare(new Money('1', 'CAD')); // throws IncompatibleCurrencyError
```

The idea is that if the object is smaller than the passed one, `-1` returned.
`0` is returned if they're equal and `1` is returned if the passed value is
higher.


This makes it easy to sort:

```javascript
const values = [
  new Money('1', 'USD'),
  new Money('2', 'USD')
];

values.sort( (a, b) => a.compare(b) );
```

### Allocate

When splitting money in parts, it might be possible to lose a penny.
For example, when dividing $1 between 3 people, each person gets
`$ 0.33` but there's a spare `$ 0.01`.

The allocate function splits a Money value in even parts, but the
remainder is distributed over the parts round-robin.

```javascript
const earnings = new Money(100, 'USD');

console.log(
  earnings.allocate(3, 2);
);

// Results in 3 Money objects:
//   33.34
//   33.33
//   33.33
```

Splitting debts (negative values) also works as expected.

The second argument of the allocate function is the precision. Basically the
number of digits you are interested in.

For USD and most currencies this is 2. It's required to pass this argument
because the Money object can't guess the desired precision.

### Rounding

By default this library uses 'round half to even' aka 'bankers rounding', but
a different rounding method may be specified in the constructor.

```javascript
import { Money, Round } from 'bigint-money';
const m = new Money(100, 'USD', Round.HALF_AWAY_FROM_0);
```

Common rounding techniques round to the nearest integer, but require a
tie-breaker for the `0.5` case. These are rounding options for that case:

* `Round.HALF_TO_EVEN` - The default
* `Round.BANKERS` - Alias of 'HALF_TO_EVEN'
* `Round.AWAY_FROM_0` - Round away from 0. (up if positive, down if negative)
* `Round.HALF_TOWARDS_0` - Round towards 0. (down if positive, up if negative).

These rounding options don't always go the nearest integer

* `Round.TOWARDS_0` - Always rounds towards 0. This effectively just drops the
  fraction.
* `Round.TRUNCATE` - Alias for `TOWARDS_0`.

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


[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
[2]: https://developers.google.com/web/updates/2018/05/bigint
[3]: https://martinfowler.com/eaaCatalog/money.html
[4]: https://amzn.to/2EezezD "Note: affiliate link"
[5]: https://caniuse.com/#search=bigint
[6]: http://wiki.c2.com/?BankersRounding
[7]: https://www.npmjs.com/package/big-money

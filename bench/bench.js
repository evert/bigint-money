const bigintMoney = require('bigint-money');
const BigMoney = require('bigmoney.js');
const moneyMath = require('money-math');

const benchmarks = [

  {
    name: 'bigint-money',
    test: function(ledger) {

      let m = new bigintMoney.Money(0, 'USD');
      for(const transaction of ledger) {

        switch(transaction[0]) {
          case '+' :
            m = m.add(transaction[1]);
            break;
          case '*' :
            m = m.multiply(transaction[1]);
            break;
        }

      }

      return m.toFixed(2);

    }

  },

  {
    name: 'big-money',
    test: function(ledger) {

      let m = new BigMoney(0, 'USD');
      for(const transaction of ledger) {

        switch(transaction[0]) {
          case '+' :
            m = m.plus(transaction[1]);
            break;
          case '*' :
            m = m.times(transaction[1]);
            break;
        }

      }

      return m.format()

    }

  }

];

const ledger = []; 

for(let ii = 0; ii < 1000000; ii++ ) {

  if (ii % 100 === 0) {

    // interest
    ledger.push(['*', '0.025']);

  } else {

    ledger.push(['+', (Math.random() * 1000000).toFixed(3)]);

  }

}

function runBenchmark(bench) {

  console.log(bench.name);
  const start = Date.now();

  const result = bench.test(ledger);
  const end = Date.now();

  console.log('time: ', end-start);
  console.log('result: ', result);


}

// runBenchmark(benchmarks[0]);
runBenchmark(benchmarks[1]);

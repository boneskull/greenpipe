# greenpipe

> Experimenting with a pipeline-like operator for async iterators and generators

Similar to `stream.pipeline()` or RxJS' `pipe()`.

## Usage

```js
const {greenpipe} = require('greenpipe');
const {createReadStream} = require('fs');

/**
 * Parameter: async iterable of chunks (strings)
 * Result: async iterable of lines (incl. newlines)
 */
async function* chunksToLines(chunksAsync) {
  let previous = '';
  for await (const chunk of chunksAsync) {
    previous += chunk;
    let eolIndex;
    while ((eolIndex = previous.indexOf('\n')) >= 0) {
      // line includes the EOL
      const line = previous.slice(0, eolIndex + 1);
      yield line;
      previous = previous.slice(eolIndex + 1);
    }
  }
  if (previous.length > 0) {
    yield previous;
  }
}

function map(callback) {
  return async function*(iterable) {
    for await (const item of iterable) {
      yield callback(item);
    }
  };
}

const numberLines = (counter = 0) => map(line => `${++counter}: ${line}`);

function collect(count = Infinity) {
  /**
   * @returns a Promise for an Array with the elements
   * in `asyncIterable`
   */
  return async function(asyncIterable) {
    const result = [];
    const iterator = asyncIterable[Symbol.asyncIterator]();
    while (result.length < count) {
      const {value, done} = await iterator.next();
      if (done) break;
      result.push(value);
    }
    return result;
  };
}

(async function() {
  const result = await greenpipe(
    createReadStream('bacon-ipsum.txt', 'utf8'),
    chunksToLines,
    numberLines(),
    collect()
  );

  // result:
  // [
  //   "1: Bacon ipsum dolor amet turducken doner kevin biltong short ribs venison strip\n",
  //   "2: steak. Tenderloin t-bone cupim short ribs pork loin beef biltong ball tip\n",
  //   "3: burgdoggen fatback brisket chicken ground round corned beef leberkas. Capicola\n",
  //   "4: corned beef turducken burgdoggen cow flank kielbasa pork belly pig meatloaf\n",
  //   "5: turkey pastrami prosciutto pork loin. Pork chop frankfurter hamburger, alcatra\n",
  //   "6: short loin sausage chuck.\n"
  // ]
})();
```

const { Xendit } = require('xendit-node');

const xendit = new Xendit({ secretKey: 'dummy' });
console.log(Object.keys(xendit));

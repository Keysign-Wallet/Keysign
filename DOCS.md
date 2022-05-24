## Documentation

This is the documentation on how to use and work with the handshake feature of the keysign browser extension.

### Verify Extension Installation

The first step is to check if the extension is installed on the user's machine. This is fairly easy.

```js
if (leap_keysign) {
	leap_keysign.requestHandshake(() => console.log('Keysign is installed!'));
}
```

Here, `leap_keysign` is the global object added by the extension and `requestHandshake` is a method used communicate with keysign.

The `requestHandshake` method takes in one parameter which is the callback.

### requestTransfer

The second method on the keysign object is `requestTransfer`. It is used to send coins to a specified account.

It takes 4 arguments, `txs`: an array of transactions to process - {to: "accountNumber", amount: 1, memo: "hi"}

`callback`: the callback and `bank`: the url of bank to use (optional) and `code`: any text to be used for signature verification (optional)

```js
leap_keysign.requestTransfer(
    {to: "accountNumber", amount: 1, memo: "hi"},
	res => console.log(res),
	'http://54.177.121.3',
	'randomly generated one time code'
);
```

### requestVerify

The third method on the keysign object is `requestVerify`. It is used to verify that the user owns an account.

This can be useful for keysign logins on websites.

It takes 3 parameters, `accountNumber`: The account number to check (can be an empty string to receive an account of user's choice), and `callback`: the callback, `code`: any text to be used for signature verification (optional)

```js
leap_keysign.requestVerify('fakeAccountNumber', res => console.log(res), 'code');
```

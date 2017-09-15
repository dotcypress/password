# password.now.sh

```js
hash = pbkdf2('SHA256 HMAC'
              password: masterPassword,
              salt: tld + username,
              iterations: 1000 + passwordIndex,
              keySize: 16)
password = hash.map(byte => alphabetRFC1924[byte % alphabetRFC1924.length])
```


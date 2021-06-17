/* eslint-disable no-console */

import * as cryptography from '@liskhq/lisk-cryptography';

const defaultPassword = "elephant tree paris dragon chair galaxy"

// command: npx ts-node test/test-utils/decrypt-passphrase.ts

// Account: 9cabee3d27426676b852ce6b804cb2fdff7cd0b5
// iterations=10
// cipherText=0dbd21ac5c154dbb72ce90a4e252a64b692203a4f8e25f8bfa1b1993e2ba7a9bd9e1ef1896d8d584a62daf17a8ccf12b99f29521b92cc98b74434ff501374f7e1c6d8371a6ce4e2d083489
// iv=98a89678d1ccd054b85e3b3c
// salt=c9cb4e7783cacca6c0e1c210cb9252e1
// tag=5c66c5e75a6241538695fb16d8f0cdc9
// version=1
const encryptedPassphraseA1 = {
  iterations: 10,
  salt: 'c9cb4e7783cacca6c0e1c210cb9252e1',
  cipherText: '0dbd21ac5c154dbb72ce90a4e252a64b692203a4f8e25f8bfa1b1993e2ba7a9bd9e1ef1896d8d584a62daf17a8ccf12b99f29521b92cc98b74434ff501374f7e1c6d8371a6ce4e2d083489',
  iv: '98a89678d1ccd054b85e3b3c',
  tag: '5c66c5e75a6241538695fb16d8f0cdc9',
  version: '1',
};

const decryptedPassphrase = cryptography.decryptPassphraseWithPassword(
  encryptedPassphraseA1,
  defaultPassword
);

console.log(decryptedPassphrase);
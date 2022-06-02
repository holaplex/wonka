import nacl from 'tweetnacl';
import { TextEncoder, TextDecoder } from 'util';
import { randomBytes } from 'crypto';

const nonce = new Uint8Array([...randomBytes(nacl.box.nonceLength)]);

const clientKeys = nacl.box.keyPair();
const serverKeys = nacl.box.keyPair();

const clientBox = nacl.box(
  new TextEncoder().encode('Hello, World'),
  nonce,
  serverKeys.publicKey,
  clientKeys.secretKey,
);

new TextDecoder().decode(
  nacl.box.open(clientBox, nonce, clientKeys.publicKey, serverKeys.secretKey),
); // ?

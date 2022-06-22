import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { TextDecoder } from 'util';

export const decryptEncodedPayload = ({
  boxedMessage,
  clientPublicKey,
  nonce,
}: {
  boxedMessage: string;
  clientPublicKey: string;
  nonce: string;
}) => {
  return new TextDecoder().decode(
    nacl.box.open(
      bs58.decode(boxedMessage),
      bs58.decode(nonce),
      bs58.decode(clientPublicKey),
      bs58.decode(process.env.SERVER_PRIVATE_KEY!),
    ),
  ) as string;
};

// JSON PARSE KEYPAIR
export const encryptPayload = (contents: string, peerPubKeyB58: string) => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const box = nacl.box(
    new TextEncoder().encode(contents),
    nonce,
    bs58.decode(peerPubKeyB58),
    bs58.decode(process.env.SERVER_PRIVATE_KEY!),
  );
  return {
    nonce: bs58.encode(nonce),
    box: bs58.encode(box),
  };
};

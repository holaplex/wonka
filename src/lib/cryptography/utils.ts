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

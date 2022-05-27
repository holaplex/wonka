import { createCipheriv, createDecipheriv } from 'crypto';

const aesEncrypt = (text: string) => {
  // TODO: Use a secrets manager
  const key = new Uint8Array(JSON.parse(process.env.DATA_ENCRYPTION_KEY));
  const iv = new Uint8Array(JSON.parse(process.env.DATA_ENCRYPTION_IV));
  // TODO: Use a secrets manager
  const cipher = createCipheriv('aes256', key, iv);
  const encrypted = `${cipher.update(text, 'utf8', 'base64')}${cipher.final(
    'base64',
  )}`;
  return encrypted;
};

const aesDecrypt = (encrypted: string) => {
  // TODO: Use a secrets manager
  const key = new Uint8Array(JSON.parse(process.env.DATA_ENCRYPTION_KEY));
  const iv = new Uint8Array(JSON.parse(process.env.DATA_ENCRYPTION_IV));
  // TODO: Use a secrets manager
  const decipher = createDecipheriv('aes256', key, iv);
  const decrypted = `${decipher.update(
    encrypted,
    'base64',
    'utf8',
  )}${decipher.final('utf8')}`;
  return decrypted;
};

const aes = (text: TemplateStringsArray) => aesEncrypt(text.join(''));

export { aes, aesEncrypt, aesDecrypt };

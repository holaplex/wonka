import { nonNull, mutationField, arg, objectType, scalarType } from 'nexus';
import { YogaInitialContext } from 'graphql-yoga';
import { NFTStorage } from 'nft.storage';
import fs from 'fs';
export const fromDwebLink = (cid: string): string =>
  `https://${cid}.ipfs.dweb.link`;

export const UploadFileResult = objectType({
  name: 'UploadFileResult',
  description: 'The result for uploading a file',
  definition (t) {
    t.nonNull.string('message', {
      description: 'Upload url of the file',
    });
  },
});

export const UploadScalar = scalarType({
  name: 'Upload',
  asNexusMethod: 'upload',
  description: 'The `Upload` scalar type represents a file upload.',
  sourceType: 'File',
});

export const UploadFile = mutationField('uploadFile', {
  type: 'UploadFileResult',
  args: { file: nonNull(arg({ type: 'Upload' })) },
  async resolve (_, args, ctx: YogaInitialContext) {
    const nftstorage = new NFTStorage({
      token: process.env.NFT_STORAGE_API_KEY,
    });
    let data = '';
    const stream = await args.file.stream();
    stream.on('data', (chunk) => {
      data += chunk;
    });
    stream.on('end', async () => {
      const cid = await nftstorage.storeBlob(new Blob([data]));
      return {
        message: fromDwebLink(cid),
      };
    });
    stream.on('error', (e) => {
      return {
        message: `Error uploading file: ${e.message}`,
      };
    });
  },
});

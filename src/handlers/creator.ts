import express from 'express';
import * as yup from 'yup';
import { graphQLClient } from '../lib/graphql/graphqlClient';
import { getSdk } from '../lib/graphql/sdk';
import { aesEncrypt } from '../lib/encryption/aes';

const creatorRouter = express.Router({});

const creatorSetUpSchema = yup.object().shape({
  name: yup.string().required(),
  keypair: yup.array().of(yup.number()).required(),
  pubKey: yup.string().min(32).max(44).required()
});

creatorRouter.post('/creator/set-up', async (req, res) => {
  try {
    const { name, keypair } = await creatorSetUpSchema.validate(req.body);
    const { addCreator } = getSdk(graphQLClient);
    const result = await addCreator({
      creator: {
        name,
        aes_encrypted_keypair: aesEncrypt(JSON.stringify(keypair)),
      },
    });
    return res.status(200).json({
      data: {
        creator: result.insert_creators_one,
      }
    });
  } catch (error) {
    if (yup.ValidationError.isError(error)) {
      return res.status(400).json({
        message: 'Invalid request body',
        error: error.message,
      });
    }
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
});

export { creatorRouter };

import express from "express";
import * as yup from "yup";

const creatorRouter = express.Router({});

const creatorSetUpSchema = yup.object().shape({
  name: yup.string().required(),
  keypair: yup.array().of(yup.number()).required(),
  // Additional fields for creator go here.
});

creatorRouter.post("/creator/set-up", async (req, res) => {
  try {
    const body = await creatorSetUpSchema.validate(req.body);
    return res.status(200).json({
      message: "OK",
    });
  } catch (error) {
    if (yup.ValidationError.isError(error)) {
      return res.status(400).json({
        message: "Invalid request body",
        error: error.message,
      });
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export { creatorRouter };

import { Router } from 'express';
import { testingController } from "../../../../configs/compositions/testing.composition";

export const testingRouter = Router();

testingRouter.delete('/all-data', testingController.deleteAllData);
import { Router } from "express";
import { securityDevicesController } from "../../../configs/compositions/security-devices.composition";
import { refreshTokenMiddleware } from "../../../shared/infrastructures/middlewares/refresh-token.middleware";

export const securityDevicesRouter = Router();

securityDevicesRouter.get('/devices',
    refreshTokenMiddleware,
    securityDevicesController.getUserDevices
);

securityDevicesRouter.delete('/devices',
    refreshTokenMiddleware,
    securityDevicesController.deleteOtherDevices
);

securityDevicesRouter.delete('/devices/:deviceId',
    refreshTokenMiddleware,
    securityDevicesController.deleteDevice
);
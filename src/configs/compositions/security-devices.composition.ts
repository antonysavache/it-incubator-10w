import { GetUserDevicesUseCase } from "../../modules/auth/application/use-cases/get-user-devices.use-case";
import { DeleteDeviceUseCase } from "../../modules/auth/application/use-cases/delete-device.use-case";
import { DeleteOtherDevicesUseCase } from "../../modules/auth/application/use-cases/delete-other-devices.use-case";
import { SecurityDevicesController } from "../../modules/auth/api/security-devices.controller";
import { deviceCommandRepository, deviceQueryRepository } from "./repositories";

export const getUserDevicesUseCase = new GetUserDevicesUseCase(
    deviceQueryRepository
);

export const deleteDeviceUseCase = new DeleteDeviceUseCase(
    deviceCommandRepository,
    deviceQueryRepository
);

export const deleteOtherDevicesUseCase = new DeleteOtherDevicesUseCase(
    deviceCommandRepository
);

export const securityDevicesController = new SecurityDevicesController(
    getUserDevicesUseCase,
    deleteDeviceUseCase,
    deleteOtherDevicesUseCase
);
import { Request, Response } from 'express';
import { GetUserDevicesUseCase } from '../application/use-cases/get-user-devices.use-case';
import { DeleteDeviceUseCase } from '../application/use-cases/delete-device.use-case';
import { DeleteOtherDevicesUseCase } from '../application/use-cases/delete-other-devices.use-case';
import { JwtService } from '../../../shared/services/jwt.service';
import { RequestWithUser } from '../../../shared/types/express';

export class SecurityDevicesController {
    constructor(
        private getUserDevicesUseCase: GetUserDevicesUseCase,
        private deleteDeviceUseCase: DeleteDeviceUseCase,
        private deleteOtherDevicesUseCase: DeleteOtherDevicesUseCase
    ) {}

    getUserDevices = async (req: RequestWithUser, res: Response) => {
        const result = await this.getUserDevicesUseCase.execute(req.user.id);

        if (result.isFailure()) {
            return res.status(400).json({
                errorsMessages: [{ message: result.getError(), field: 'none' }]
            });
        }

        return res.status(200).json(result.getValue());
    }

    deleteDevice = async (req: RequestWithUser<{ deviceId: string }>, res: Response) => {
        const { deviceId } = req.params;

        const result = await this.deleteDeviceUseCase.execute(deviceId, req.user.id);

        if (result.isFailure()) {
            const error = result.getError();

            if (error === 'Device not found') {
                return res.sendStatus(404);
            }

            if (error === 'Forbidden') {
                return res.sendStatus(403);
            }

            return res.status(400).json({
                errorsMessages: [{ message: error, field: 'none' }]
            });
        }

        return res.sendStatus(204);
    }

    deleteOtherDevices = async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.sendStatus(401);
        }

        const payload = JwtService.verifyToken(refreshToken);

        if (!payload || !payload.deviceId) {
            return res.sendStatus(401);
        }

        const result = await this.deleteOtherDevicesUseCase.execute(
            payload.userId,
            payload.deviceId
        );

        if (result.isFailure()) {
            return res.status(400).json({
                errorsMessages: [{ message: result.getError(), field: 'none' }]
            });
        }

        return res.sendStatus(204);
    }
}
import { Result } from "../../../../shared/infrastructures/result";
import { DeviceCommandRepository } from "../../infrastructure/repositories/device-command.repository";
import { DeviceQueryRepository } from "../../infrastructure/repositories/device-query.repository";

export class DeleteDeviceUseCase {
    constructor(
        private deviceCommandRepository: DeviceCommandRepository,
        private deviceQueryRepository: DeviceQueryRepository
    ) {}

    async execute(deviceId: string, userId: string): Promise<Result<void>> {
        const device = await this.deviceQueryRepository.findByDeviceId(deviceId);

        if (!device) {
            return Result.fail('Device not found');
        }

        if (device.userId !== userId) {
            return Result.fail('Forbidden');
        }

        const deactivated = await this.deviceCommandRepository.deactivateDevice(deviceId);

        if (!deactivated) {
            return Result.fail('Failed to delete device');
        }

        return Result.ok();
    }
}
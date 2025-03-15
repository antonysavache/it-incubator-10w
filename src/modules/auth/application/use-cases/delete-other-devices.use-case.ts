import { Result } from "../../../../shared/infrastructures/result";
import { DeviceCommandRepository } from "../../infrastructure/repositories/device-command.repository";

export class DeleteOtherDevicesUseCase {
    constructor(
        private deviceCommandRepository: DeviceCommandRepository
    ) {}

    async execute(userId: string, currentDeviceId: string): Promise<Result<void>> {
        await this.deviceCommandRepository.deactivateAllUserDevicesExcept(userId, currentDeviceId);
        return Result.ok();
    }
}
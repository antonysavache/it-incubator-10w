import { Result } from "../../../../shared/infrastructures/result";
import { DeviceQueryRepository } from "../../infrastructure/repositories/device-query.repository";
import { DeviceViewModel } from "../../domain/interfaces/device.interface";

export class GetUserDevicesUseCase {
    constructor(
        private deviceQueryRepository: DeviceQueryRepository
    ) {}

    async execute(userId: string): Promise<Result<DeviceViewModel[]>> {
        const devices = await this.deviceQueryRepository.findUserActiveDevices(userId);
        return Result.ok(devices);
    }
}
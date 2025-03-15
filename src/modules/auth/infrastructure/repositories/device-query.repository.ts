import { BaseQueryRepository } from "../../../../shared/infrastructures/repositories/base-query.repository";
import { DeviceDatabaseModel, DeviceViewModel } from "../../domain/interfaces/device.interface";

export class DeviceQueryRepository extends BaseQueryRepository<DeviceDatabaseModel> {
    constructor() {
        super('devices');
    }

    async findByDeviceId(deviceId: string): Promise<DeviceDatabaseModel | null> {
        this.checkInit();
        return this.collection.findOne({ deviceId, isActive: true });
    }

    async findUserActiveDevices(userId: string): Promise<DeviceViewModel[]> {
        this.checkInit();
        const devices = await this.collection.find({
            userId,
            isActive: true
        }).toArray();

        return devices.map(device => ({
            deviceId: device.deviceId,
            ip: device.ip,
            title: device.title,
            lastActiveDate: device.lastActiveDate.toISOString()
        }));
    }
}
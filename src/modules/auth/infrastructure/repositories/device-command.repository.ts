import { BaseCommandRepository } from "../../../../shared/infrastructures/repositories/base-command.repository";
import { DeviceCreateModel, DeviceDatabaseModel } from "../../domain/interfaces/device.interface";
import { ObjectId } from "mongodb";

export class DeviceCommandRepository extends BaseCommandRepository<DeviceDatabaseModel, DeviceCreateModel> {
    constructor() {
        super('devices');
    }

    async updateLastActiveDate(deviceId: string, lastActiveDate: Date, expiresAt: Date): Promise<boolean> {
        this.checkInit();
        const result = await this.collection.updateOne(
            { deviceId },
            { $set: { lastActiveDate, expiresAt } }
        );
        return result.modifiedCount === 1;
    }

    async deactivateDevice(deviceId: string): Promise<boolean> {
        this.checkInit();
        const result = await this.collection.updateOne(
            { deviceId },
            { $set: { isActive: false } }
        );
        return result.modifiedCount === 1;
    }

    async deactivateAllUserDevicesExcept(userId: string, deviceId: string): Promise<number> {
        this.checkInit();
        const result = await this.collection.updateMany(
            { userId, deviceId: { $ne: deviceId }, isActive: true },
            { $set: { isActive: false } }
        );
        return result.modifiedCount;
    }

    async removeExpiredDevices(): Promise<number> {
        this.checkInit();
        const result = await this.collection.deleteMany({
            expiresAt: { $lt: new Date() }
        });
        return result.deletedCount;
    }
}
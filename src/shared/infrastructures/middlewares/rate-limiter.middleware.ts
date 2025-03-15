import { NextFunction, Request, Response } from 'express';

const rateLimiters = new Map<string, Map<string, number[]>>();

export const rateLimiterMiddleware = (endpoint: string) => {
    return (req: Request, res: Response, next: NextFunction): void | Response => {
        const ip = req.ip || '0.0.0.0';

        const key = `${ip}:${endpoint}`;

        if (!rateLimiters.has(endpoint)) {
            rateLimiters.set(endpoint, new Map());
        }

        const endpointLimiter = rateLimiters.get(endpoint)!;
        if (!endpointLimiter.has(key)) {
            endpointLimiter.set(key, []);
        }

        const now = Date.now();
        const timeWindow = 10 * 1000; // 10 seconds
        const timestamps = endpointLimiter.get(key)!;

        const validTimestamps = timestamps.filter(time => now - time < timeWindow);

        if (validTimestamps.length >= 5) {
            console.log(`Rate limit exceeded for ${key}: ${validTimestamps.length} requests`);
            return res.status(429).json({
                message: 'Too many requests, please try again later'
            });
        }

        validTimestamps.push(now);
        endpointLimiter.set(key, validTimestamps);

        next();
    };
};
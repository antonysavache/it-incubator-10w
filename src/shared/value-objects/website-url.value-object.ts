import {Result} from "../infrastructures/result";

export class WebsiteUrl {
    private constructor(private readonly value: string) {}

    static create(url: string): Result<WebsiteUrl> {
        if (!url?.trim()) {
            return Result.fail({
                errorsMessages: [{
                    message: 'Website URL is required',
                    field: 'websiteUrl'
                }]
            });
        }

        if (url.length > 100) {
            return Result.fail({
                errorsMessages: [{
                    message: 'Website URL should not exceed 100 characters',
                    field: 'websiteUrl'
                }]
            });
        }

        const urlRegex = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;
        if (!urlRegex.test(url)) {
            return Result.fail({
                errorsMessages: [{
                    message: 'Invalid website URL format',
                    field: 'websiteUrl'
                }]
            });
        }

        return Result.ok(new WebsiteUrl(url));
    }

    getValue(): string {
        return this.value;
    }
}
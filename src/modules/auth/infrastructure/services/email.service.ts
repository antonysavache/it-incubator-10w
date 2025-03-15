import nodemailer from 'nodemailer';
import { SETTINGS } from '../../../../configs/settings';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: SETTINGS.EMAIL.SMTP.USER,
                pass: SETTINGS.EMAIL.SMTP.PASS
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 5000,
            socketTimeout: 10000
        });
    }

    async sendRegistrationEmail(email: string, confirmationCode: string): Promise<boolean> {
        try {
            console.log(`Attempting to send email to ${email}`);
            const confirmationLink = `${SETTINGS.CLIENT_URL}/confirm-email?code=${confirmationCode}`;

            const mailOptions = {
                from: SETTINGS.EMAIL.SMTP.FROM,
                to: email,
                subject: 'Complete Your Registration',
                html: `
                    <h1>Thank you for your registration</h1>
                    <p>To finish registration please follow the link below:
                        <a href='${confirmationLink}'>complete registration</a>
                    </p>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            return true;
        } catch (error) {
            console.error('Failed to send email. Error:', error);
            if (!this.transporter.isIdle()) {
                await this.transporter.close();
                this.initializeTransporter();
            }
            return false;
        }
    }

    private initializeTransporter() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: SETTINGS.EMAIL.SMTP.USER,
                pass: SETTINGS.EMAIL.SMTP.PASS
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 5000,
            socketTimeout: 10000
        });
    }

    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('Email service connection verified');
            return true;
        } catch (error) {
            console.error('Email service connection failed:', error);
            return false;
        }
    }
}
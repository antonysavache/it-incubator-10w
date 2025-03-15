import {EmailService} from "./email.service";

const emailService = new EmailService();

const testRecipientEmail = "savchenko.anton1999@gmail.com";

async function testEmailSending() {
    try {
        const result = await emailService.sendRegistrationEmail(
            testRecipientEmail,
            "test-code-123"
        );

        if (result) {
            console.log("✅ Email sent successfully!");
        } else {
            console.log("❌ Failed to send email");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

testEmailSending();
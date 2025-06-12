import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
    const resend = new Resend(process.env.RESEND_API_KEY || "");
    try {
        const response = await resend.emails.send({
            from: "Finance App <onboarding@resend.dev>",
            to,
            subject,
            react,
        });
        console.log("Email sent successfully:", response);
        return {
            success: true,
            response,
            message: "Email sent successfully"
        };
    } catch (error) {
        console.error("Error sending email:", error);
        return {
            success: false,
            error: error.message,
        };
    }
}
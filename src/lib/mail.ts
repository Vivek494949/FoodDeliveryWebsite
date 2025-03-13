import nodemailer from "nodemailer"

// Create a transporter using SMTP settings
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email provider (e.g., Gmail, Outlook, SMTP)
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
})

/**
 * Sends an email with the OTP code.
 * @param to Recipient email address.
 * @param otp One-time password to send.
 */
export async function sendEmail(to: string, otp: string) {
  console.log(`(Mail module) Sending OTP to ${to}: ${otp}`)

  try {
    const info = await transporter.sendMail({
      from: `"Donor and Seeker" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
      html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
    })

    console.log(`OTP sent to ${to}. Message ID: ${info.messageId}`)
    return { success: true }
  } catch (error) {
    // Fix: Replace 'any' with a more specific type
    const err = error as Error
    console.error("Error sending email:", err.message)
    return { success: false, error: (error as Error).message }
  }
}

// email.js
import Mailgen from "mailgen";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend and Mailgen
 *
 * @param {{
 *   email: string;
 *   subject: string;
 *   mailgenContent: Mailgen.Content;
 * }} options
 */
const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Code Score",
      link: process.env.DOMAIN,
    },
  });

  const emailHtml = mailGenerator.generate(options.mailgenContent);
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  try {
    await resend.emails.send({
      from: "Code Score <devsagarkumarjhag@codescore.co.in>", // Replace with your verified Resend sender
      to: options.email,
      subject: options.subject,
      html: emailHtml,
      text: emailTextual,
    });
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
  }
};

/**
 * Email content for verifying a user's email
 *
 * @param {string} username
 * @param {string} verificationUrl
 * @returns {Mailgen.Content}
 */
const emailVerificationMailgenContent = (username, verificationUrl) => ({
  body: {
    name: username,
    intro: "Welcome to our app! We're very excited to have you on board.",
    action: {
      instructions:
        "To verify your email please click on the following button:",
      button: {
        color: "#22BC66",
        text: "Verify your email",
        link: verificationUrl,
      },
    },
    outro:
      "Need help, or have questions? Just reply to this email, we'd love to help.",
  },
});

/**
 * Email content for a forgot password reset
 *
 * @param {string} username
 * @param {string} passwordResetUrl
 * @returns {Mailgen.Content}
 */
const forgotPasswordMailgenContent = (username, passwordResetUrl) => ({
  body: {
    name: username,
    intro: "We got a request to reset the password of your account.",
    action: {
      instructions:
        "To reset your password click on the following button or link:",
      button: {
        color: "#22BC66",
        text: "Reset password",
        link: passwordResetUrl,
      },
    },
    outro:
      "Need help, or have questions? Just reply to this email, we'd love to help.",
  },
});

export {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
};

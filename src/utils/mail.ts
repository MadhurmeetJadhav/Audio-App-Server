import nodemailer from "nodemailer";
import path from "path";

import Users from "#/models/users";
import {
  MAILTRAP_PASSWORD,
  MAILTRAP_USER,
  SIGN_IN_URL,
  VERIFICATION_MAIL,
} from "#/utils/variables";
import { generateToken } from "#/utils/helper";
import EmailVerificationToken from "#/models/emailVerificationToken";
import { generateTemplate } from "#/mail/template";

const generateMailTrasprter = () => {
  return nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSWORD,
    },
  });
};

interface Profile {
  name: string;
  email: string;
  userId: string;
}

export const sendVerificationMail = async (token: string, profile: Profile) => {
  const transport = generateMailTrasprter();

  const { name, email, userId } = profile;

  const welcomeMessage = `Hi ${name} , welcome to Audio-App! There are so much things that we do for verified users. Use the given otp to verify your email.`;

  transport?.sendMail({
    to: email,
    from: VERIFICATION_MAIL,
    subject: "Welcome Message",
    html: generateTemplate({
      title: "Welcome to Audio-App",
      message: welcomeMessage,
      logo: "cid:logo",
      banner: "cid:welcome",
      link: "#",
      btnTitle: token,
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo",
      },
      {
        filename: "welcome.png",
        path: path.join(__dirname, "../mail/welcome.png"),
        cid: "welcome",
      },
    ],
  });
};

interface Options {
  email: string;
  link: string;
}
export const resendPasswordLink = async (options: Options) => {
  const transport = generateMailTrasprter();

  const { email, link } = options;

  const resetPasswordMessage = `We just received a request that you forgot your password. No problem you can use the link and create brand new password.`;

  transport?.sendMail({
    to: email,
    from: VERIFICATION_MAIL,
    subject: "Reset Password",
    html: generateTemplate({
      title: "Reset Password",
      message: resetPasswordMessage,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link: link,
      btnTitle: "Reset Password",
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo",
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../mail/forget_password.png"),
        cid: "forget_password",
      },
    ],
  });
};

interface PasswordReset {
  name: string;
  email: string;
}
export const sendPasswordSuccessEmail = async (
  passwordReset: PasswordReset
) => {
  const transport = generateMailTrasprter();

  const { name, email } = passwordReset;

  const resetPasswordMessage = `Dear ${name}, we just updated your new password. You can now sign in with your new password.`;

  transport?.sendMail({
    to: email,
    from: VERIFICATION_MAIL,
    subject: "Password Updated",
    html: generateTemplate({
      title: "Password Updated",
      message: resetPasswordMessage,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link: SIGN_IN_URL,
      btnTitle: "Sign In",
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo",
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../mail/forget_password.png"),
        cid: "forget_password",
      },
    ],
  });
};

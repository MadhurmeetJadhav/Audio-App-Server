const { env } = process as { env: { [key: string]: string } };

export const {
  MONGO_URI,
  MAILTRAP_USER,
  MAILTRAP_PASSWORD,
  VERIFICATION_MAIL,
  PASSWORD_RESET_LINK,
  SIGN_IN_URL,
  JWT_TOKEN,
  CLOUD_NAME,
  CLOUD_KEY,
  CLOUD_SECRETE,
} = env;

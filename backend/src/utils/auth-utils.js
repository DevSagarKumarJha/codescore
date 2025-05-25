import crypto from "crypto";
import jwt from "jsonwebtoken";

const generateToken = () => {
  const unHashedToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = new Date(Date.now() + 20 * 60 * 1000); // 20 mins

  return { unHashedToken, hashedToken, tokenExpiry };
};

const setEmailVerificationToken = async (userId) => {
  const { unHashedToken, hashedToken, tokenExpiry } = generateToken();

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpires: tokenExpiry,
    },
  });

  return unHashedToken;
};

const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      username: payload.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};
const generateRefreshToken = (payload) => {
  return jwt.sign({ id: payload.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export {
  generateToken,
  setEmailVerificationToken,
  generateAccessToken,
  generateRefreshToken,
};

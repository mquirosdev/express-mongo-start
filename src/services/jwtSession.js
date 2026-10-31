import jwt from "jsonwebtoken";

export const createToken = (user) => {
  return jwt.sign(
    {},
    process.env.SECRET_KEY,
    {
      expiresIn: "5h",
      subject: user.id
    }
  )
}

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.SECRET_KEY);
}
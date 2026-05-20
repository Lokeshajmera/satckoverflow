import jwt from "jsonwebtoken";
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    let decodedata = jwt.verify(token, process.env.JWT_SECRET);
    req.userid = decodedata?.id;
    if (!req.userid) return res.status(401).json({ message: "Invalid token structure" });

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};
export default auth
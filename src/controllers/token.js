// get user from the token (refresh front)
export const getUserFromToken = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ user });
  } catch (err) {
    return res.status(401).json({ error: "Invalid Token" });
  }
};

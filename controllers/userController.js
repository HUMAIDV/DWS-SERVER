import User from "../models/User.js";

export const getCurrentUser = async (req, res) => {
  try {
    const auth0Id = req.user.sub; // comes from Auth0 token
    const user = await User.findOne({ auth0Id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

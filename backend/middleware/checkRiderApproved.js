import StoreRider from "../models/StoreRider.js";

export default async function checkRiderApproved(req, res, next) {
  const approved = await StoreRider.findOne({
    rider: req.user._id,
    type: "approved",
  });

  if (!approved) {
    return res.status(403).json({ message: "You are not approved for any store" });
  }

  next();
}

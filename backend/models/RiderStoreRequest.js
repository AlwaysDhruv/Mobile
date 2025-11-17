import mongoose from "mongoose";

const riderStoreSchema = new mongoose.Schema({
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  type: { type: String, enum: ["pending", "approved", "removal_pending"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("RiderStore", riderStoreSchema);

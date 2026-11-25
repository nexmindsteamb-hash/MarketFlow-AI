const { Schema, model } = require("mongoose");

const PLATFORMS = ["facebook", "instagram", "linkedin"];

const campaignSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: Schema.Types.ObjectId, ref: "CompanyContent", required: true, index: true },
    platforms: {
      type: [{ type: String, enum: PLATFORMS }],
      validate: [(v) => v.length > 0, "Pick at least one platform"],
    },
    tone: { type: String, enum: ["professional", "friendly", "energetic"], default: "professional" },
    status: { type: String, enum: ["draft", "active", "completed", "archived"], default: "draft" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Campaign = model("Campaign", campaignSchema);
Campaign.PLATFORMS = PLATFORMS;
module.exports = Campaign;

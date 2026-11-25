const { Schema, model } = require("mongoose");

const generatedContentSchema = new Schema(
  {
    campaign: { type: Schema.Types.ObjectId, ref: "Campaign", required: true, index: true },
    sourceContent: { type: Schema.Types.ObjectId, ref: "CompanyContent", required: true },
    platform: { type: String, enum: ["facebook", "instagram", "linkedin"], required: true },
    caption: { type: String, required: true, trim: true },
    hashtags: [{ type: String, trim: true }],
    model: { type: String, default: "gemini" },
    // Increases each time the admin regenerates content for the same campaign and platform.
    version: { type: Number, default: 1, min: 1 },
    status: { type: String, enum: ["draft", "approved", "rejected"], default: "draft" },
    editedByAdmin: { type: Boolean, default: false },
    // Result of Ninad's factual-consistency check (claims not found in the source text).
    unsupportedClaims: [{ type: String }],
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
  },
  { timestamps: true }
);

generatedContentSchema.index({ campaign: 1, platform: 1, version: 1 }, { unique: true });

/** Saves a new version for a campaign + platform (use for first generation and for regeneration). */
generatedContentSchema.statics.addVersion = async function (data) {
  const last = await this.findOne({ campaign: data.campaign, platform: data.platform }).sort({ version: -1 });
  return this.create({ ...data, version: last ? last.version + 1 : 1 });
};

module.exports = model("GeneratedContent", generatedContentSchema);

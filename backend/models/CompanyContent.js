const { Schema, model } = require("mongoose");
const { sha256 } = require("../utils/crypto");

const TYPES = ["profile", "service", "project", "blog", "other"];
const STATUSES = ["pending", "approved", "rejected"];

const companyContentSchema = new Schema(
  {
    type: { type: String, enum: TYPES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    text: { type: String, required: true, trim: true },
    // Source details: every record must say where it came from.
    sourceUrl: {
      type: String,
      required: true,
      trim: true,
      match: [/^https?:\/\/\S+$/i, "sourceUrl must be a valid http(s) URL"],
    },
    sourceName: { type: String, default: "thenexminds.in" },
    imageRefs: [{ type: String, trim: true }],
    status: { type: String, enum: STATUSES, default: "pending", index: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    editedByAdmin: { type: Boolean, default: false },
    lastSyncedAt: { type: Date, default: Date.now },
    // Identity of an item = type + title + source page. Re-syncing the same item updates it instead of duplicating it.
    contentHash: { type: String, unique: true, immutable: true },
  },
  { timestamps: true }
);

companyContentSchema.statics.makeHash = function ({ type, title, sourceUrl }) {
  const norm = (s) => String(s).trim().toLowerCase().replace(/\/+$/, "");
  return sha256([type, title, sourceUrl].map(norm).join("|"));
};

companyContentSchema.pre("validate", function () {
  if (this.isNew && !this.contentHash) {
    this.contentHash = this.constructor.makeHash(this);
  }
});

/**
 * Used by the extraction/sync module. Inserts new items as "pending".
 * If the item already exists and the text changed at the source, the text is updated
 * and the item goes back to "pending" so the admin must approve it again.
 * Returns { doc, action: "created" | "updated" | "unchanged" }.
 */
companyContentSchema.statics.upsertFromExtraction = async function (item) {
  const contentHash = this.makeHash(item);
  const existing = await this.findOne({ contentHash });
  if (!existing) {
    const doc = await this.create({ ...item, contentHash });
    return { doc, action: "created" };
  }
  existing.lastSyncedAt = new Date();
  if (existing.text.trim() === String(item.text).trim()) {
    await existing.save();
    return { doc: existing, action: "unchanged" };
  }
  existing.text = item.text;
  if (item.imageRefs) existing.imageRefs = item.imageRefs;
  existing.status = "pending";
  existing.approvedBy = undefined;
  existing.approvedAt = undefined;
  await existing.save();
  return { doc: existing, action: "updated" };
};

companyContentSchema.methods.approve = function (userId) {
  this.status = "approved";
  this.approvedBy = userId;
  this.approvedAt = new Date();
  return this.save();
};

companyContentSchema.methods.reject = function () {
  this.status = "rejected";
  this.approvedBy = undefined;
  this.approvedAt = undefined;
  return this.save();
};

const CompanyContent = model("CompanyContent", companyContentSchema);
CompanyContent.TYPES = TYPES;
module.exports = CompanyContent;

const { Schema, model } = require("mongoose");
const { sha256 } = require("../utils/crypto");

const STATUSES = ["draft", "approved", "scheduled", "publishing", "published", "failed", "cancelled"];
// Statuses that count as a live post for duplicate protection. A cancelled or failed post can be recreated.
const LIVE = ["draft", "approved", "scheduled", "publishing", "published"];

const historySchema = new Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    message: { type: String, default: "" },
    at: { type: Date, default: Date.now },
    by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const postSchema = new Schema(
  {
    campaign: { type: Schema.Types.ObjectId, ref: "Campaign", required: true, index: true },
    generatedContent: { type: Schema.Types.ObjectId, ref: "GeneratedContent" },
    account: { type: Schema.Types.ObjectId, ref: "SocialAccount", required: true },
    platform: { type: String, enum: ["facebook", "instagram", "linkedin"], required: true },
    text: { type: String, required: true, trim: true },
    imageRefs: [{ type: String }],
    status: { type: String, enum: STATUSES, default: "draft" },
    scheduledFor: Date,
    publishedAt: Date,
    externalPostId: String,
    errorMessage: String,
    retryCount: { type: Number, default: 0 },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    // Same account + same text = same post. Blocks duplicate posts.
    dedupeKey: { type: String, required: true },
    history: [historySchema],
    metrics: {
      reach: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      fetchedAt: Date,
    },
  },
  { timestamps: true }
);

// Scheduler query: find scheduled posts that are due.
postSchema.index({ status: 1, scheduledFor: 1 });
// Duplicate protection applies to live posts only.
postSchema.index({ dedupeKey: 1 }, { unique: true, partialFilterExpression: { status: { $in: LIVE } } });

postSchema.statics.makeDedupeKey = function ({ account, text }) {
  const norm = String(text).trim().replace(/\s+/g, " ").toLowerCase();
  return sha256(`${account}|${norm}`);
};

postSchema.pre("validate", function () {
  if (!this.dedupeKey || this.isModified("text") || this.isModified("account")) {
    this.dedupeKey = this.constructor.makeDedupeKey(this);
  }
  if (this.status === "scheduled" && !this.scheduledFor) {
    this.invalidate("scheduledFor", "scheduledFor is required when status is scheduled");
  }
});

// Every status change is written to the publishing history automatically.
postSchema.pre("save", function () {
  if (this.isNew || this.isModified("status")) {
    const msg = this._historyMessage || (this.isNew ? "post created" : "");
    this.history.push({ status: this.status, message: msg, by: this._historyBy });
  }
});

/** setStatus("failed", "Access token rejected") then save() */
postSchema.methods.setStatus = function (status, message = "", userId) {
  this.status = status;
  this._historyMessage = message;
  this._historyBy = userId;
  if (status === "published") this.publishedAt = new Date();
  if (status === "failed") this.errorMessage = message;
  return this;
};

/** Posts the scheduler should publish now. */
postSchema.statics.findDue = function (now = new Date()) {
  return this.find({ status: "scheduled", scheduledFor: { $lte: now } });
};

const Post = model("Post", postSchema);
Post.STATUSES = STATUSES;
module.exports = Post;

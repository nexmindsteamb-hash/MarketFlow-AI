const { Schema, model } = require("mongoose");
const { encrypt, decrypt } = require("../utils/crypto");

const socialAccountSchema = new Schema(
  {
    platform: { type: String, enum: ["facebook", "instagram", "linkedin"], required: true },
    accountName: { type: String, required: true, trim: true },
    externalAccountId: { type: String, required: true, trim: true },
    // Encrypted with AES-256-GCM. Never stored in plain text and never returned by default queries.
    accessTokenEnc: { type: String, select: false },
    refreshTokenEnc: { type: String, select: false },
    tokenExpiresAt: Date,
    scopes: [{ type: String }],
    status: { type: String, enum: ["connected", "disconnected", "expired"], default: "connected" },
    // True for the labelled test/simulation mode described in the brief.
    isSimulated: { type: Boolean, default: false },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

socialAccountSchema.index({ platform: 1, externalAccountId: 1 }, { unique: true });

socialAccountSchema.methods.setAccessToken = function (plain) {
  this.accessTokenEnc = encrypt(plain);
};
socialAccountSchema.methods.setRefreshToken = function (plain) {
  this.refreshTokenEnc = encrypt(plain);
};
/** Load the account with .select("+accessTokenEnc") before calling this. */
socialAccountSchema.methods.getAccessToken = function () {
  if (!this.accessTokenEnc) throw new Error("Token not loaded. Query with .select('+accessTokenEnc').");
  return decrypt(this.accessTokenEnc);
};
socialAccountSchema.methods.isTokenExpired = function () {
  return !!this.tokenExpiresAt && this.tokenExpiresAt.getTime() <= Date.now();
};

socialAccountSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.accessTokenEnc;
    delete ret.refreshTokenEnc;
    delete ret.__v;
    return ret;
  },
});

module.exports = model("SocialAccount", socialAccountSchema);

const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    // Never returned by default. Use User.findOne(...).select("+passwordHash") to log in.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "editor"], default: "editor" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

/** Creates a user and stores only the bcrypt hash of the password. */
userSchema.statics.register = async function ({ name, email, password, role }) {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  return this.create({ name, email, passwordHash, role });
};

/** Returns the user if the credentials are valid, otherwise null. */
userSchema.statics.authenticate = async function (email, password) {
  const user = await this.findOne({ email: String(email).toLowerCase(), isActive: true }).select("+passwordHash");
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  user.lastLoginAt = new Date();
  await user.save();
  user.passwordHash = undefined;
  return user;
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = model("User", userSchema);

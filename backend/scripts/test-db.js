/**
 * CRUD + integrity test for the database layer.
 *   node scripts/test-db.js            -> uses MONGO_URI if set, otherwise an in-memory MongoDB
 * Uses clearly fake sample data only.
 */
const assert = require("assert");
const crypto = require("crypto");
const mongoose = require("mongoose");

process.env.TOKEN_ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");

const { connectDB, disconnectDB } = require("../config/db");
const { User, CompanyContent, Campaign, GeneratedContent, SocialAccount, Post } = require("../models");

let passed = 0;
async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log("  PASS  " + name);
  } catch (e) {
    console.log("  FAIL  " + name + "\n        " + e.message);
    process.exitCode = 1;
  }
}
const rejects = async (p, re) => {
  try { await p; } catch (e) { if (!re || re.test(e.message)) return; throw new Error("wrong error: " + e.message); }
  throw new Error("expected rejection");
};

(async () => {
  let mem;
  let uri = process.env.MONGO_URI;
  if (!uri) {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    mem = await MongoMemoryServer.create();
    uri = mem.getUri("marketflow_test");
  }
  await connectDB(uri);
  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((m) => m.init())); // build indexes

  console.log("\nUsers");
  let admin;
  await check("register stores a hash, not the password", async () => {
    admin = await User.register({ name: "Demo Admin", email: "Admin@Example.test", password: "demo-pass-123", role: "admin" });
    const raw = await User.findById(admin._id).select("+passwordHash").lean();
    assert.notStrictEqual(raw.passwordHash, "demo-pass-123");
    assert.ok(raw.passwordHash.startsWith("$2"));
    assert.strictEqual(raw.email, "admin@example.test");
  });
  await check("passwordHash is hidden by default and in JSON", async () => {
    const u = await User.findById(admin._id);
    assert.strictEqual(u.passwordHash, undefined);
    assert.strictEqual(JSON.stringify(admin).includes("passwordHash"), false);
  });
  await check("authenticate accepts the right password, rejects the wrong one", async () => {
    assert.ok(await User.authenticate("admin@example.test", "demo-pass-123"));
    assert.strictEqual(await User.authenticate("admin@example.test", "wrong"), null);
  });
  await check("duplicate email rejected", () => rejects(User.register({ name: "X", email: "admin@example.test", password: "demo-pass-123" }), /duplicate|E11000/i));
  await check("short password rejected", () => rejects(User.register({ name: "X", email: "x@example.test", password: "123" }), /8 characters/));
  await check("invalid role rejected", () => rejects(User.create({ name: "X", email: "y@example.test", passwordHash: "h", role: "owner" }), /role/));

  console.log("\nCompany content");
  const item = { type: "service", title: "Sample Web Service", text: "Sample description of a web service.", sourceUrl: "https://example.test/services/web" };
  let cc;
  await check("create item with source URL and timestamps", async () => {
    const r = await CompanyContent.upsertFromExtraction(item);
    cc = r.doc;
    assert.strictEqual(r.action, "created");
    assert.strictEqual(cc.status, "pending");
    assert.ok(cc.createdAt && cc.updatedAt && cc.contentHash);
  });
  await check("same item again is unchanged, not duplicated", async () => {
    const r = await CompanyContent.upsertFromExtraction({ ...item, sourceUrl: "https://EXAMPLE.test/services/web/" });
    assert.strictEqual(r.action, "unchanged");
    assert.strictEqual(await CompanyContent.countDocuments(), 1);
  });
  await check("direct duplicate insert blocked by unique index", () => rejects(CompanyContent.create(item), /E11000|duplicate/i));
  await check("missing sourceUrl rejected", () => rejects(CompanyContent.create({ type: "blog", title: "No source", text: "t" }), /sourceUrl/));
  await check("bad sourceUrl rejected", () => rejects(CompanyContent.create({ ...item, title: "Other", sourceUrl: "not a url" }), /valid http/));
  await check("approve sets approver and time", async () => {
    await cc.approve(admin._id);
    const f = await CompanyContent.findById(cc._id);
    assert.strictEqual(f.status, "approved");
    assert.strictEqual(String(f.approvedBy), String(admin._id));
  });
  await check("changed text at source resets approval to pending", async () => {
    const r = await CompanyContent.upsertFromExtraction({ ...item, text: "Updated description." });
    assert.strictEqual(r.action, "updated");
    assert.strictEqual(r.doc.status, "pending");
    assert.strictEqual(r.doc.approvedBy, undefined);
    await r.doc.approve(admin._id);
  });

  console.log("\nCampaigns and generated content");
  let camp;
  await check("create campaign referencing content", async () => {
    camp = await Campaign.create({ name: "Sample campaign", content: cc._id, platforms: ["facebook", "linkedin"], createdBy: admin._id });
    const p = await Campaign.findById(camp._id).populate("content");
    assert.strictEqual(p.content.title, "Sample Web Service");
  });
  await check("campaign needs at least one platform", () => rejects(Campaign.create({ name: "n", content: cc._id, platforms: [], createdBy: admin._id }), /platform/i));
  await check("regeneration creates version 2", async () => {
    const base = { campaign: camp._id, sourceContent: cc._id, platform: "facebook", caption: "Caption v1", hashtags: ["#Sample"] };
    const a = await GeneratedContent.addVersion(base);
    const b = await GeneratedContent.addVersion({ ...base, caption: "Caption v2" });
    assert.deepStrictEqual([a.version, b.version], [1, 2]);
  });
  await check("same version twice blocked", () => rejects(GeneratedContent.create({ campaign: camp._id, sourceContent: cc._id, platform: "facebook", caption: "dup", version: 1 }), /E11000|duplicate/i));

  console.log("\nSocial accounts");
  let acct, acct2;
  await check("token stored encrypted, round-trips, hidden by default", async () => {
    acct = new SocialAccount({ platform: "facebook", accountName: "Test Page", externalAccountId: "TEST_1", owner: admin._id, isSimulated: true, scopes: ["pages_manage_posts"] });
    acct.setAccessToken("secret-token-123");
    await acct.save();
    const raw = await SocialAccount.findById(acct._id).select("+accessTokenEnc").lean();
    assert.ok(!raw.accessTokenEnc.includes("secret-token-123"));
    assert.strictEqual((await SocialAccount.findById(acct._id).select("+accessTokenEnc")).getAccessToken(), "secret-token-123");
    const plain = await SocialAccount.findById(acct._id);
    assert.strictEqual(plain.accessTokenEnc, undefined);
    assert.ok(!JSON.stringify(acct).includes("accessTokenEnc"));
  });
  await check("tampered ciphertext is rejected", async () => {
    const a = await SocialAccount.findById(acct._id).select("+accessTokenEnc");
    const parts = a.accessTokenEnc.split(":"); parts[2] = parts[2].replace(/^../, "00");
    a.accessTokenEnc = parts.join(":");
    assert.throws(() => a.getAccessToken());
  });
  await check("same platform account twice blocked", () => rejects(SocialAccount.create({ platform: "facebook", accountName: "Dup", externalAccountId: "TEST_1", owner: admin._id }), /E11000|duplicate/i));
  acct2 = await SocialAccount.create({ platform: "linkedin", accountName: "Test Company", externalAccountId: "TEST_2", owner: admin._id, isSimulated: true });

  console.log("\nPosts");
  let post;
  await check("create post writes first history entry", async () => {
    post = await Post.create({ campaign: camp._id, account: acct._id, platform: "facebook", text: "Sample post text #Sample" });
    assert.strictEqual(post.history.length, 1);
    assert.strictEqual(post.history[0].status, "draft");
  });
  await check("duplicate live post blocked (even with different spacing and case)", () =>
    rejects(Post.create({ campaign: camp._id, account: acct._id, platform: "facebook", text: "  sample   POST text #sample " }), /E11000|duplicate/i));
  await check("same text on another account allowed", async () => {
    await Post.create({ campaign: camp._id, account: acct2._id, platform: "linkedin", text: "Sample post text #Sample" });
  });
  await check("scheduled needs a time", async () => {
    post.setStatus("scheduled", "scheduled by admin");
    await rejects(post.save(), /scheduledFor/);
    post.scheduledFor = new Date(Date.now() - 1000);
    await post.save();
  });
  await check("findDue returns due scheduled post", async () => {
    const due = await Post.findDue();
    assert.strictEqual(due.length, 1);
  });
  await check("failure then retry then publish builds full history", async () => {
    post.setStatus("publishing", "sending"); await post.save();
    post.setStatus("failed", "Access token rejected (simulated)"); await post.save();
    post.retryCount += 1; post.setStatus("publishing", "retry"); await post.save();
    post.externalPostId = "FB_123"; post.setStatus("published", "published OK"); await post.save();
    const f = await Post.findById(post._id);
    assert.deepStrictEqual(f.history.map((h) => h.status), ["draft", "scheduled", "publishing", "failed", "publishing", "published"]);
    assert.ok(f.publishedAt);
    assert.strictEqual(f.errorMessage, "Access token rejected (simulated)");
  });
  await check("cancelled post can be recreated; live duplicate still blocked", async () => {
    const t = "Another sample post";
    const p1 = await Post.create({ campaign: camp._id, account: acct._id, platform: "facebook", text: t });
    p1.setStatus("cancelled", "admin cancelled"); await p1.save();
    const p2 = await Post.create({ campaign: camp._id, account: acct._id, platform: "facebook", text: t });
    await rejects(Post.create({ campaign: camp._id, account: acct._id, platform: "facebook", text: t }), /E11000|duplicate/i);
    assert.ok(p2._id);
  });
  await check("update metrics and delete", async () => {
    await Post.updateOne({ _id: post._id }, { $set: { "metrics.reach": 1200, "metrics.likes": 80 } });
    assert.strictEqual((await Post.findById(post._id)).metrics.reach, 1200);
    await Post.deleteOne({ _id: post._id });
    assert.strictEqual(await Post.findById(post._id), null);
  });

  console.log(`\n${passed} checks passed${process.exitCode ? ", some FAILED" : ""}`);
  await disconnectDB();
  if (mem) await mem.stop();
})().catch((e) => { console.error(e); process.exit(1); });

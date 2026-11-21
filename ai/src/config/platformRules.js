// maxChars: platform limit (see ai/docs/platform-rules.md for sources).
// targetChars, hashtags: project rules for AI output, not official limits.
const platformRules = {
  instagram: { maxChars: 2200, targetChars: 150, minHashtags: 3, maxHashtags: 5, notes: "Line break counts as 2 chars" },
  facebook: { maxChars: 5000, targetChars: 250, minHashtags: 1, maxHashtags: 3, notes: "" },
  linkedin: { maxChars: 3000, targetChars: 600, minHashtags: 3, maxHashtags: 5, notes: "URLs count as 24 chars" },
  x: { maxChars: 280, targetChars: 240, minHashtags: 1, maxHashtags: 2, notes: "URLs count as 23, emoji as 2" },
};

module.exports = { platformRules };
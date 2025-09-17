const { getDB } = require("../config/dbConfig");

exports.upsertToken = async (userId, token, platform = null) => {
  const db = getDB();
  await db.execute(
    `INSERT INTO user_push_tokens (user_id, token, platform)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE platform = VALUES(platform)`,
    [userId, token, platform]
  );
  return { userId, token, platform };
};

exports.removeToken = async (userId, token) => {
  const db = getDB();
  await db.execute(`DELETE FROM user_push_tokens WHERE user_id = ? AND token = ?`, [
    userId,
    token,
  ]);
};

exports.getTokensForUserId = async (userId) => {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT token FROM user_push_tokens WHERE user_id = ?`,
    [userId]
  );
  return rows.map((r) => r.token);
};

exports.removeInvalidTokens = async (tokens) => {
  if (!tokens || tokens.length === 0) return;
  const db = getDB();
  await db.execute(
    `DELETE FROM user_push_tokens WHERE token IN (${tokens
      .map(() => "?")
      .join(",")})`,
    tokens
  );
};



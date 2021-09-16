const db = require("../../data/dbConfig");

function find() {
  return db("users as u").select("u.id", "u.username");
}

function findBy(filter) {
  return db("users as u")
    .select("u.id", "u.username", "u.password")
    .where(filter);
}

function findById(user_id) {
  return db("users as u")
    .select("u.id", "u.username")
    .where("u.id", user_id)
    .first();
}

async function add({ username, password }) {
  let created_user_id;
  await db.transaction(async (trx) => {
    const [user_id] = await trx("users").insert({
      username,
      password,
    });
    created_user_id = user_id;
  });
  const user = await findById(created_user_id);

  return user;
}

module.exports = {
  add,
  find,
  findBy,
  findById,
};

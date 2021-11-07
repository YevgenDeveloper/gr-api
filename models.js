const pool = require('./pool');
const User = {
  fetch(uid) {
    return new Promise(async (resolve, reject) => {
      if (uid.length != 36) reject({error: 'Wrong token'});
      const res = await pool.query(
        'select id, username, role from Users where id = $1;',
        [uid],
      );
      if (res.rows.length == 0) reject({error: 'User does not exists'});
      else resolve(res.rows[0]);
    });
  },
  async users() {
    const res = await pool.query('select * from Users');
    return res.rows;
  },
  async login(username) {
    const res = await pool.query('select * from Users where username = $1;', [
      username,
    ]);
    return res.rows[0];
  },
  async register(name, password, role) {
    const res = await pool.query(
      'INSERT INTO Users VALUES(uuid_generate_v4(), $1, $2, $3) RETURNING id',
      [name, password, role],
    );
    return res.rows[0].id;
  },
};
const Show = {
  async fetch() {
    const res = await pool.query('select * from Shows');
    return res.rows;
  },
  async post(name, starts_at, ends_at, genres, redundancy, color, uid) {
    const res = await pool.query(
      'INSERT INTO Shows VALUES(uuid_generate_v4(), $1, $2, $3, $4, $5, $6) RETURNING id',
      [name, starts_at, ends_at, redundancy, color, uid],
    );
    const id = res.rows[0].id;
    await Promise.all(
      genres.map(async g => {
        await pool.query('select add_genre_show($1, $2)', [id, g]);
      }),
    );
    return id;
  },
};
module.exports = {
  User,
  Show,
};

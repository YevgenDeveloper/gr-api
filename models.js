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
  async login(username, password) {
    const res = await pool.query(
      'select id, username, role from login($1, $2);',
      [username, password],
    );
    return res.rows[0];
  },
  async register(name, password, role, who, whopass) {
    const auth = await pool.query('select * from login($1, $2)', [
      who,
      whopass,
    ]);
    if (auth.rows.length == 0 || auth.rows[0].role != 'admin')
      throw 'You have no rights to create a user';
    const res = await pool.query(
      'INSERT INTO Users VALUES(uuid_generate_v4(), $1, $2, $3) RETURNING id',
      [name, password, role],
    );
    return res.rows[0].id;
  },
};
const Show = {
  async fetch({start, end}) {
    const res = await pool.query(
      'select * from Shows where starts_at::date >= $1 AND ends_at::date <= $2',
      [start, end],
    );
    return res.rows;
  },
  async post({name, dj, starts_at, ends_at, genres, redundancy, color, uid}) {
    const res = await pool.query(
      'INSERT INTO Shows VALUES(uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [name, dj, starts_at, ends_at, redundancy, color, uid],
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
const Event = {
  async fetch() {
    const res = await pool.query('select * from Shows');
    return res.rows;
  },
};
module.exports = {
  User,
  Show,
  Event,
};

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
  async fetch({start}) {
    let genres;
    const res = await pool.query('select * from getshows($1);', [start]);
    await Promise.all(
      res.rows.map(async (row, i) => {
        genres = await pool.query(
          'select genre from shows_genres where id = $1',
          [row.id],
        );
        res.rows[i].genres = [];
        genres.rows.map(col => {
          res.rows[i].genres.push(col.genre);
        });
      }),
    );
    return res.rows;
  },
  async post({name, dj, starts_at, ends_at, genres, redundancy, uid}) {
    const res = await pool.query(
      'INSERT INTO Shows VALUES(uuid_generate_v4(), $1, $2, $3, $4, $5, $6) RETURNING id',
      [name, dj, starts_at, ends_at, redundancy, uid],
    );
    const id = res.rows[0].id;
    await Promise.all(
      genres.map(async g => {
        await pool.query('select add_genre_show($1, $2)', [id, g]);
      }),
    );
    return id;
  },
  async delete({id}) {
    await pool.query('DELETE FROM shows_genres where id = $1', [id]);
    await pool.query('DELETE FROM Shows where id = $1', [id]);
    return 'Event deleted';
  },
  async modify({id, name, dj, starts_at, ends_at, genres, redundancy, uid}) {
    await pool.query(
      'UPDATE Shows SET name = $2, dj = $3, starts_at = $4, ends_at = $5, redundancy = $6, added_by = $7 WHERE id = $1;',
      [id, name, dj, starts_at, ends_at, redundancy, uid],
    );
    return `Event '${name}' Modified`;
  },
};
const Event = {
  async fetch() {
    const res = await pool.query(
      'select * from Events where starts_at::date > now()::date',
    );
    return res.rows;
  },
  async fetchall() {
    const res = await pool.query(
      'select * from Events;',
    );
    return res.rows;
  },
  async post({name, description, starts_at, ends_at, genres, facebook, uid}) {
    const res = await pool.query(
      'INSERT INTO Events VALUES(uuid_generate_v4(), $1, $2, $3, $4, $5, $6) RETURNING id',
      [name, description, starts_at, ends_at, facebook, uid],
    );
    const id = res.rows[0].id;
    await Promise.all(
      genres.map(async g => {
        await pool.query('select add_genre_show($1, $2)', [id, g]);
      }),
    );
    return id;
  },
  async delete({id}) {
    await pool.query('DELETE FROM shows_genres where id = $1', [id]);
    await pool.query('DELETE FROM Events where id = $1', [id]);
    return 'Event deleted';
  },
};
module.exports = {
  User,
  Show,
  Event,
};

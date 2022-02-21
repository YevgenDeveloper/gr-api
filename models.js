const pool = require('./pool');
const api = process.env.API_WEBSITE;
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
  async getday({start}) {
    let genres;
    const res = await pool.query(
      'select * from getshows($1, 0) order by starts_at;',
      [start],
    );
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
  async fetch({start}) {
    let genres;
    const res = await pool.query('select * from getshows($1, 6);', [start]);
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
    await pool.query('DELETE FROM shows_genres where id = $1', [id]);
    await Promise.all(
      genres.map(async g => {
        await pool.query('select add_genre_show($1, $2)', [id, g]);
      }),
    );
    return `Show '${name}' Modified`;
  },
  async print(state) {
    await pool.query("UPDATE Prints SET status = $1 where id = 'shows';", [
      state,
    ]);
    return state;
  },
  async getprint() {
    const res = await pool.query(
      "SELECT status from Prints where id = 'shows';",
    );
    return res.rows[0].status;
  },
};
const Event = {
  async getone({id}) {
    const res = await pool.query('select * from Events where id = $1', [id]);
    if (res.rows.length == 0) return null;
    let genres = await pool.query(
      'select genre from shows_genres where id = $1',
      [id],
    );
    res.rows[0].image = `${api}/upload/${res.rows[0].id}.${
      res.rows[0].imgformat
    }`;
    res.rows[0].genres = [];
    genres.rows.map(col => {
      res.rows[0].genres.push(col.genre);
    });
    return res.rows[0];
  },
  async fetch() {
    let genres;
    const res = await pool.query(
      'select * from Events where ends_at::date > now()::date',
    );
    await Promise.all(
      res.rows.map(async (row, i) => {
        row.image = `${api}/upload/${row.id}.${row.imgformat}`;
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
  async fetchall() {
    const res = await pool.query('select * from Events;');
    await Promise.all(
      res.rows.map(async (row, i) => {
        row.image = `${api}/upload/${row.id}.${row.imgformat}`;
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
  async post({name, description, starts_at, ends_at, genres, facebook, uid}) {
    const res = await pool.query(
      'INSERT INTO Events VALUES(uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [name, description, starts_at, ends_at, facebook, '', uid],
    );
    const id = res.rows[0].id;
    await Promise.all(
      genres.map(async g => {
        await pool.query('select add_genre_show($1, $2)', [id, g]);
      }),
    );
    return id;
  },
  async put({
    id,
    name,
    description,
    starts_at,
    ends_at,
    genres,
    facebook,
    uid,
  }) {
    await pool.query(
      'UPDATE Events SET name = $2, description = $3, starts_at = $4, ends_at = $5, facebook = $6, added_by = $7 WHERE id = $1;',
      [id, name, description, starts_at, ends_at, facebook, uid],
    );
    await pool.query('DELETE FROM shows_genres where id = $1', [id]);
    await Promise.all(
      genres.map(async g => {
        await pool.query('select add_genre_show($1, $2)', [id, g]);
      }),
    );
    return `Event '${name}' Modified`;
  },
  async delete({id}) {
    await pool.query('DELETE FROM shows_genres where id = $1', [id]);
    await pool.query('DELETE FROM Events where id = $1', [id]);
    return 'Event deleted';
  },
  async print(state) {
    await pool.query("UPDATE Prints SET status = $1 where id = 'events';", [
      state,
    ]);
    return state;
  },
  async getprint() {
    const res = await pool.query(
      "SELECT status from Prints where id = 'events';",
    );
    return res.rows[0].status;
  },
};
module.exports = {
  User,
  Show,
  Event,
};

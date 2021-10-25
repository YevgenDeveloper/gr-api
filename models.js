const pool = require('./pool');
const User = {
  fetch(uid) {
    return new Promise(async (resolve, reject) => {
      const res = await pool.query('select * from Users where id = $1;', [uid]);
      console.log(res.rows);
      if (res.rows.length == 0) reject({error: 'User does not exists'});
      else resolve(res.rows[0]);
    });
  },
  async login(username) {
    const res = await pool.query('select * from Users where username = $1;', [
      username,
    ]);
    return res.rows[0];
  },
  async register(name, password) {
    const res = await pool.query(
      'INSERT INTO Users VALUES(uuid_generate_v4(), $1, $2) RETURNING id',
      [name, password],
    );
    return res.rows[0].id;
  },
};
module.exports = {
  User,
};

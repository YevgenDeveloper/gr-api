const pool = require('./pool');
const User = {
  fetch(uid) {
    return new Promise(async (resolve, reject) => {
      if(uid.length != 36) reject({error: 'Wrong token'});
      const res = await pool.query('select * from Users where id = $1;', [uid]);
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
  async register(name, password, role) {
    const res = await pool.query(
      'INSERT INTO Users VALUES(uuid_generate_v4(), $1, $2, $3) RETURNING id',
      [name, password, role],
    );
    return res.rows[0].id;
  },
};
module.exports = {
  User,
};

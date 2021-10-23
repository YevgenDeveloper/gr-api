const pool = require('./pool');
const User = {
  fetch(id) {
    return new Promise((resolve, reject) => {
      resolve({
        id: 'hello ' + id,
      });
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

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
    pool.query('select * from Users', (err, res) => {
      console.log(err);
    });
    return 'jwt';
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

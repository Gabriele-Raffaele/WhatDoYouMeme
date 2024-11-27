import db from '../db/db.mjs';
import crypto from 'crypto';
export default function UserDao() {

this.getUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Users WHERE username = ?';
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve(false);
            } else {
                const user = {id: row.id, username: row.username, name: row.name, email:row.email, birthdate:row.birthdate, image: row.image};
                crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
                    if (err) {
                        reject(err);
                    } else if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)) {
                        resolve(false);
                    } else {
                        resolve(user);
                    }
                }
                );
            }
        }
        );
    }
    );
}

}


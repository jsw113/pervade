const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./prisma/dev.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    // Try ./dev.db
    const db2 = new sqlite3.Database('./dev.db', sqlite3.OPEN_READONLY, (err2) => {
      if (err2) {
        console.log('No local sqlite file found.');
      } else {
        readTables(db2);
      }
    });
  } else {
    readTables(db);
  }
});

function readTables(database) {
  database.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Local SQLite Tables:', tables.map(t => t.name));
    database.all("SELECT id, name, price, imageUrl FROM Product", (err, rows) => {
      if (!err && rows) console.log('Local Products:', rows);
    });
    database.all("SELECT key, value FROM Policy", (err, rows) => {
      if (!err && rows) console.log('Local Policies count:', rows.length);
    });
  });
}

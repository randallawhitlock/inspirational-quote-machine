import Dexie from 'dexie';

export const db = new Dexie('QuotesDB');

db.version(1).stores({
  quotes: '++id, category, quote, author',
});

console.log(db)
console.log(db.version(1))
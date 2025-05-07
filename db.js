const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // ou ton URI Atlas si tu es en ligne
const dbName = 'mon_projet'; // nom de ta base de données

let db;

const connectDB = async () => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connecté à MongoDB');

    db = client.db(dbName);
  } catch (err) {
    console.error('❌ Erreur de connexion à MongoDB:', err);
    process.exit(1);
  }
};

const getDB = () => db;

module.exports = { connectDB, getDB };

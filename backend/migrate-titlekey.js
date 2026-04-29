const mongoose = require('mongoose');
const env = require('./src/config/env');

async function migrate() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('agreementtemplates');

    // Find all documents missing titleKey
    const docsWithoutTitleKey = await collection
      .find({ titleKey: { $exists: false } })
      .toArray();

    console.log(`Found ${docsWithoutTitleKey.length} documents missing titleKey`);

    // Update each document to generate titleKey from title
    let updated = 0;
    for (const doc of docsWithoutTitleKey) {
      if (doc.title) {
        const titleKey = doc.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .substring(0, 100);

        await collection.updateOne(
          { _id: doc._id },
          { $set: { titleKey } }
        );
        updated++;
        console.log(`  ✓ Updated ${doc._id}: titleKey = "${titleKey}"`);
      }
    }

    console.log(`\n✅ Migration complete: ${updated} documents updated`);
    process.exit(0);
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
    console.error(e);
    process.exit(1);
  }
}

migrate();

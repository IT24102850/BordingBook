const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://BoardingBook-app:H%40siruCh%40mika@boardingbook-dev.ivnowe1.mongodb.net/boardingbook?retryWrites=true&w=majority&appName=boardingbook-dev";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('boardingbook');

    const result1 = await db.collection('boardinghouses').updateMany(
      { image: { $regex: "^data:image" } },
      { $set: { 
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
        images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80"]
      }}
    );
    console.log("Boardinghouses updated:", result1.modifiedCount);

    const result2 = await db.collection('rooms').updateMany(
      { image: { $regex: "^data:image" } },
      { $set: { 
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
        images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80"]
      }}
    );
    console.log("Rooms updated:", result2.modifiedCount);

  } finally {
    await client.close();
  }
}
run().catch(console.dir);

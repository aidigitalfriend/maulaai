const { MongoClient } = require("mongodb");
require("dotenv").config();

async function checkUser() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || "ai-agent-platform");
    
    // Find user
    const user = await db.collection("users").findOne({ email: "abcd@xyz.com" });
    console.log("=== USER ===");
    console.log(JSON.stringify(user, null, 2));
    
    if (user) {
      const userId = user._id.toString();
      
      console.log("\n=== AGENT SUBSCRIPTIONS (userId as string) ===");
      const agentSubs1 = await db.collection("agentsubscriptions").find({ userId: userId }).toArray();
      console.log("Count:", agentSubs1.length);
      if (agentSubs1.length > 0) console.log(JSON.stringify(agentSubs1, null, 2));
      
      console.log("\n=== AGENT SUBSCRIPTIONS (userId as ObjectId) ===");
      const { ObjectId } = require("mongodb");
      const agentSubs2 = await db.collection("agentsubscriptions").find({ userId: user._id }).toArray();
      console.log("Count:", agentSubs2.length);
      if (agentSubs2.length > 0) console.log(JSON.stringify(agentSubs2, null, 2));
      
      console.log("\n=== ALL AGENT SUBSCRIPTIONS (first 10) ===");
      const allSubs = await db.collection("agentsubscriptions").find({}).limit(10).toArray();
      console.log("Total in collection:", await db.collection("agentsubscriptions").countDocuments());
      console.log(JSON.stringify(allSubs, null, 2));
      
      console.log("\n=== SUBSCRIPTIONS COLLECTION ===");
      const subs = await db.collection("subscriptions").find({ userId: userId }).toArray();
      console.log("Count:", subs.length);
      if (subs.length > 0) console.log(JSON.stringify(subs, null, 2));
      
      console.log("\n=== TRANSACTIONS ===");
      const trans = await db.collection("transactions").find({ userId: userId }).toArray();
      console.log("Count:", trans.length);
      if (trans.length > 0) console.log(JSON.stringify(trans, null, 2));
    }
  } finally {
    await client.close();
  }
}

checkUser().catch(console.error);

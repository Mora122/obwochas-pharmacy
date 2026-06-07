import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return res.status(500).json({ error: "No MONGODB_URI in env" });
  }
  
  try {
    const atIdx = uri.indexOf("@");
    const afterAt = atIdx > 0 ? uri.substring(atIdx + 1) : "unknown";
    const host = afterAt.split("?")[0];
    
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("admin");
    const ping = await db.command({ ping: 1 });
    
    const clusterName = host.split(".")[0];
    
    res.json({
      success: true,
      host: host,
      clusterName: clusterName,
      ping: ping.ok === 1 ? "connected" : "failed",
      note: "IP whitelist requires Atlas Admin API. Use Atlas UI: Network Access > Add IP > 0.0.0.0/0"
    });
    
    await client.close();
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}

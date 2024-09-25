import { MongoClient } from 'mongodb';
import { User } from "@/lib/models/Users";
import bcrypt from 'bcrypt';

// Connection URL
const url = 'mongodb://127.0.0.1:27017';

// Database Name
const dbName = 'Rankers';

// Collection Name
const collectionName = 'users';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      // Connect to MongoDB
      const client = await MongoClient.connect("mongodb://127.0.0.1:27017");
      const db = client.db("Rankers");
      const collection = db.collection("users");

      // Find the user by email
      const user = await collection.findOne({ email });
      if (!user) {
        await client.close();
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await client.close();
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Remove the password field from the user object before sending it in the response
      const { password: _, ...userWithoutPassword } = user;

      await client.close();
      return res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
    } catch (error) {
      console.error('Signin error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
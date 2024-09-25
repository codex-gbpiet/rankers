import { NextResponse } from "next/server";
import { User } from "@/lib/models/Users";
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Connection URL
const url = 'mongodb://127.0.0.1:27017';

// Database Name
const dbName = 'Rankers';

// Collection Name
const collectionName = 'users';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, email, password, questions } = req.body;

    // Input validation
    if (!username || !email || !password || !questions) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      // Connect to MongoDB
      const client = await MongoClient.connect("mongodb://127.0.0.1:27017");
      const db = client.db("Rankers");
      const collection = db.collection("users");

      // Check if user already exists
      const userExists = await collection.findOne({ email });
      if (userExists) {
        await client.close();
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Hash the password using bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Save the new user to the database
      const newUser = {
        userId: uuidv4(),
        username,
        email,
        password: hashedPassword, // Store hashed password
        createdAt: new Date().toISOString(),
        questions,
      };
      await collection.insertOne(newUser);
      await client.close();

      console.log('New User Created:', newUser);
      return res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
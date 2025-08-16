#!/usr/bin/env node

/**
 * MongoDB Atlas Connection Test Script
 * 
 * This script helps you test your MongoDB Atlas connection before deploying to Render.
 * Run this locally to verify your connection string works.
 */

const { MongoClient } = require('mongodb');

async function testMongoDBConnection() {
  console.log('🔍 MongoDB Atlas Connection Test');
  console.log('================================');
  
  // Get connection string from environment or prompt user
  let MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.log('\n❌ MONGODB_URI environment variable not set');
    console.log('\n💡 To test your connection:');
    console.log('1. Set your connection string:');
    console.log('   export MONGODB_URI="your_connection_string_here"');
    console.log('2. Run this script again:');
    console.log('   node setup-mongodb-test.js');
    console.log('\n📝 Or run with connection string directly:');
    console.log('   MONGODB_URI="your_connection_string" node setup-mongodb-test.js');
    return;
  }
  
  console.log('✅ MONGODB_URI found');
  console.log('🔍 Connection string length:', MONGODB_URI.length);
  console.log('🔍 Starts with:', MONGODB_URI.substring(0, 20) + '...');
  
  // Test connection with Node.js 18 compatible options
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority',
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 60000,
    maxPoolSize: 1,
    minPoolSize: 1,
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  };
  
  console.log('\n🔄 Testing MongoDB Atlas connection...');
  
  try {
    const client = new MongoClient(MONGODB_URI, connectionOptions);
    
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Get database info
    const db = client.db();
    console.log('📊 Database name:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections found:', collections.length);
    
    if (collections.length > 0) {
      console.log('   Collections:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    // Test a simple operation
    const testCollection = db.collection('test');
    const result = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: 'Connection test successful'
    });
    
    console.log('✅ Test document inserted successfully');
    console.log('   Document ID:', result.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Test document cleaned up');
    
    // Close connection
    await client.close();
    console.log('✅ Connection closed successfully');
    
    console.log('\n🎉 MongoDB Atlas connection test PASSED!');
    console.log('✅ Your connection string is working correctly');
    console.log('✅ You can now deploy to Render with confidence');
    
  } catch (error) {
    console.error('\n❌ MongoDB Atlas connection test FAILED!');
    console.error('Error:', error.message);
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your username and password');
    console.log('2. Verify network access is set to 0.0.0.0/0');
    console.log('3. Ensure your connection string format is correct');
    console.log('4. Check if your MongoDB Atlas cluster is running');
    
    console.log('\n📝 Example connection string format:');
    console.log('mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
    
    process.exit(1);
  }
}

// Run the test
testMongoDBConnection().catch(console.error);

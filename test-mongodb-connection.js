const { MongoClient } = require('mongodb');

// Test MongoDB connection with different strategies
async function testMongoDBConnection() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.log('❌ MONGODB_URI environment variable not set');
    return;
  }
  
  console.log('🔍 Testing MongoDB connection...');
  console.log('🔍 MONGODB_URI length:', MONGODB_URI.length);
  console.log('🔍 MONGODB_URI starts with:', MONGODB_URI.substring(0, 20) + '...');
  
  const connectionStrategies = [
    {
      name: 'Default Strategy',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true,
        w: 'majority',
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        maxPoolSize: 10,
        minPoolSize: 1,
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
        directConnection: false,
      }
    },
    {
      name: 'Minimal TLS',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true,
        w: 'majority',
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        maxPoolSize: 1,
        minPoolSize: 1,
        tls: true,
        tlsAllowInvalidCertificates: false,
      }
    },
    {
      name: 'Relaxed TLS',
      options: {
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
      }
    },
    {
      name: 'No TLS Validation',
      options: {
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
        tlsInsecure: true,
      }
    }
  ];

  for (const strategy of connectionStrategies) {
    try {
      console.log(`\n🔄 Testing ${strategy.name}...`);
      const client = new MongoClient(MONGODB_URI, strategy.options);
      
      await client.connect();
      console.log(`✅ ${strategy.name} - SUCCESS!`);
      
      // Test a simple operation
      const db = client.db();
      const collections = await db.listCollections().toArray();
      console.log(`📊 Found ${collections.length} collections`);
      
      await client.close();
      console.log(`✅ ${strategy.name} - Connection closed successfully`);
      
      // If we get here, this strategy works
      console.log(`\n🎉 ${strategy.name} is working! Use this configuration.`);
      return;
      
    } catch (error) {
      console.error(`❌ ${strategy.name} - FAILED:`, error.message);
    }
  }
  
  console.log('\n❌ All connection strategies failed');
  console.log('💡 Try checking your MongoDB Atlas configuration:');
  console.log('   - Network Access (IP whitelist)');
  console.log('   - Database User credentials');
  console.log('   - Connection string format');
}

// Run the test
testMongoDBConnection().catch(console.error);

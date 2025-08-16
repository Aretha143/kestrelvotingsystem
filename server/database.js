const { MongoClient } = require('mongodb');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

let mongoDb = null;
let mongoClient = null;
let sqliteDb = null;

// MongoDB connection string - will be set via environment variable
const MONGODB_URI = process.env.MONGODB_URI;

// Check if MongoDB URI is properly configured
function isMongoDBConfigured() {
  return MONGODB_URI && 
         MONGODB_URI.includes('@') && // Has username/password
         MONGODB_URI.includes('.mongodb.net'); // Is Atlas URL
}

// Log system information for debugging
function logSystemInfo() {
  console.log('🔍 System Info:');
  console.log('   Node.js version:', process.version);
  console.log('   Platform:', process.platform);
  console.log('   Architecture:', process.arch);
  console.log('   OpenSSL version:', process.versions.openssl);
}

// Try to convert mongodb+srv to mongodb format for better compatibility
function getAlternativeConnectionString() {
  if (!MONGODB_URI || !MONGODB_URI.includes('mongodb+srv://')) {
    return null;
  }
  
  try {
    // Extract components from mongodb+srv://
    const url = new URL(MONGODB_URI);
    const username = url.username;
    const password = url.password;
    const hostname = url.hostname;
    const pathname = url.pathname;
    const search = url.search;
    
    // Create multiple alternative formats
    const alternatives = [
      // Standard mongodb:// format
      `mongodb://${username}:${password}@${hostname}:27017${pathname}${search}&tls=true&replicaSet=atlas-${hostname.split('.')[0]}-shard-0&authSource=admin`,
      // Without replica set
      `mongodb://${username}:${password}@${hostname}:27017${pathname}${search}&tls=true&authSource=admin`,
      // With different TLS options
      `mongodb://${username}:${password}@${hostname}:27017${pathname}${search}&tls=true&tlsAllowInvalidCertificates=true&authSource=admin`,
      // Without TLS (for testing)
      `mongodb://${username}:${password}@${hostname}:27017${pathname}${search}&authSource=admin`
    ];
    
    console.log('🔄 Trying alternative connection string formats...');
    return alternatives;
  } catch (error) {
    console.log('⚠️ Could not create alternative connection strings');
    return null;
  }
}

// Validate and log connection string (without sensitive info)
function logConnectionInfo() {
  console.log('🔍 Debug: MONGODB_URI length:', MONGODB_URI ? MONGODB_URI.length : 'undefined');
  console.log('🔍 Debug: MONGODB_URI starts with:', MONGODB_URI ? MONGODB_URI.substring(0, 20) + '...' : 'undefined');
  
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB Atlas not configured, using SQLite fallback');
    console.log('📝 To use MongoDB Atlas, set MONGODB_URI environment variable');
    return;
  }
  
  try {
    const url = new URL(MONGODB_URI);
    console.log(`🔗 Connecting to MongoDB: ${url.protocol}//${url.hostname}${url.pathname}`);
    console.log(`📊 Database: ${url.pathname.replace('/', '') || 'default'}`);
  } catch (error) {
    console.log('⚠️  Could not parse MONGODB_URI format:', error.message);
  }
}

// MongoDB connection options
function getMongoClientOptions() {
  return {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority',
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 60000,
    maxPoolSize: 10,
    minPoolSize: 1,
    // Modern TLS configuration (removed deprecated sslValidate)
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    // Remove deprecated SSL options
    directConnection: false,
  };
}

async function connectToMongoDB() {
  if (mongoClient) {
    return mongoClient;
  }

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const options = getMongoClientOptions();
      mongoClient = new MongoClient(MONGODB_URI, options);

      await mongoClient.connect();
      console.log('✅ Connected to MongoDB Atlas');
      
      mongoDb = mongoClient.db();
      return mongoClient;
    } catch (error) {
      retryCount++;
      console.error(`❌ Failed to connect to MongoDB (attempt ${retryCount}/${maxRetries}):`, error.message);
      
      if (retryCount >= maxRetries) {
        console.error('❌ Max retries reached. Trying alternative connection approaches...');
        
        // Try multiple connection strategies
        const connectionStrategies = [
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
              tlsInsecure: true,
            }
          },
          {
            name: 'No TLS (Insecure)',
            options: {
              useNewUrlParser: true,
              useUnifiedTopology: true,
              retryWrites: true,
              w: 'majority',
              serverSelectionTimeoutMS: 30000,
              socketTimeoutMS: 60000,
              maxPoolSize: 1,
              minPoolSize: 1,
              tls: false,
            }
          }
        ];

        for (const strategy of connectionStrategies) {
          try {
            console.log(`🔄 Trying ${strategy.name} approach...`);
            mongoClient = new MongoClient(MONGODB_URI, strategy.options);
            await mongoClient.connect();
            console.log(`✅ Connected to MongoDB Atlas with ${strategy.name}`);
            
            mongoDb = mongoClient.db();
            return mongoClient;
          } catch (strategyError) {
            console.error(`❌ ${strategy.name} failed:`, strategyError.message);
          }
        }
        
        // Try alternative connection string formats
        const alternativeUris = getAlternativeConnectionString();
        if (alternativeUris && Array.isArray(alternativeUris)) {
          for (let i = 0; i < alternativeUris.length; i++) {
            try {
              console.log(`🔄 Trying mongodb:// format ${i + 1}/${alternativeUris.length}...`);
              mongoClient = new MongoClient(alternativeUris[i], {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                retryWrites: true,
                w: 'majority',
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 60000,
                tls: true,
                tlsAllowInvalidCertificates: false,
              });
              
              await mongoClient.connect();
              console.log(`✅ Connected to MongoDB Atlas with mongodb:// format ${i + 1}`);
              
              mongoDb = mongoClient.db();
              return mongoClient;
            } catch (formatError) {
              console.error(`❌ mongodb:// format ${i + 1} failed:`, formatError.message);
            }
          }
          console.error('❌ All mongodb:// format attempts failed');
        }
        
        console.error('❌ All MongoDB connection attempts failed');
        throw error; // Throw the original error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 3000 * retryCount));
    }
  }
}

// SQLite fallback functions
function getSQLiteDatabase() {
  if (!sqliteDb) {
    const dbPath = process.env.NODE_ENV === 'production' 
      ? '/tmp/voting.db'
      : path.join(__dirname, '../data/voting.db');
    
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening SQLite database:', err.message);
      }
    });
  }
  return sqliteDb;
}

async function initSQLiteDatabase() {
  const database = getSQLiteDatabase();
  
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      // Create staff table
      database.run(`
        CREATE TABLE IF NOT EXISTS staff (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          staff_id TEXT UNIQUE NOT NULL,
          pin TEXT NOT NULL,
          name TEXT NOT NULL,
          position TEXT NOT NULL,
          department TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create campaigns table
      database.run(`
        CREATE TABLE IF NOT EXISTS campaigns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          start_date DATETIME NOT NULL,
          end_date DATETIME NOT NULL,
          is_active BOOLEAN DEFAULT 1,
          is_published BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create votes table
      database.run(`
        CREATE TABLE IF NOT EXISTS votes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          campaign_id INTEGER NOT NULL,
          voter_staff_id TEXT NOT NULL,
          candidate_staff_id TEXT NOT NULL,
          reason TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (campaign_id) REFERENCES campaigns (id),
          FOREIGN KEY (voter_staff_id) REFERENCES staff (staff_id),
          FOREIGN KEY (candidate_staff_id) REFERENCES staff (staff_id),
          UNIQUE(campaign_id, voter_staff_id)
        )
      `);

      // Create admin table
      database.run(`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          email TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default admin if not exists
      database.get("SELECT * FROM admins WHERE username = 'admin'", async (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          const hashedPassword = await bcrypt.hash('KestrelNestGarden@@#$', 10);
          database.run(
            "INSERT INTO admins (username, password_hash, email) VALUES (?, ?, ?)",
            ['admin', hashedPassword, 'admin@kestrelnest.com'],
            (err) => {
              if (err) {
                console.error('Error creating default admin:', err);
              } else {
                console.log('✅ Default admin created (username: admin, password: KestrelNestGarden@@#$)');
              }
            }
          );
        }
      });

      // Insert sample staff if table is empty
      database.get("SELECT COUNT(*) as count FROM staff", (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row.count === 0) {
          const sampleStaff = [
            ['EMP001', '1234', 'Sarah Johnson', 'Server', 'Front of House', 'sarah@kestrelnest.com', '555-0101'],
            ['EMP002', '5678', 'Michael Chen', 'Chef', 'Kitchen', 'michael@kestrelnest.com', '555-0102'],
            ['EMP003', '9012', 'Emily Rodriguez', 'Hostess', 'Front of House', 'emily@kestrelnest.com', '555-0103'],
            ['EMP004', '3456', 'David Kim', 'Sous Chef', 'Kitchen', 'david@kestrelnest.com', '555-0104'],
            ['EMP005', '7890', 'Lisa Thompson', 'Bartender', 'Bar', 'lisa@kestrelnest.com', '555-0105']
          ];

          const insertStaff = database.prepare(`
            INSERT INTO staff (staff_id, pin, name, position, department, email, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);

          sampleStaff.forEach(staff => {
            insertStaff.run(staff);
          });

          insertStaff.finalize((err) => {
            if (err) {
              console.error('Error inserting sample staff:', err);
            } else {
              console.log('✅ Sample staff data inserted');
            }
          });
        }
      });

      // Create indexes for better performance
      database.run("CREATE INDEX IF NOT EXISTS idx_votes_campaign ON votes(campaign_id)");
      database.run("CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_staff_id)");
      database.run("CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active)");
      database.run("CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(is_active)");

      resolve();
    });
  });
}

// MongoDB initialization functions
async function createMongoCollections(database) {
  console.log('📋 MongoDB collections ready');
}

async function createMongoDefaultAdmin(database) {
  const adminsCollection = database.collection('admins');
  
  const existingAdmin = await adminsCollection.findOne({ username: 'admin' });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('KestrelNestGarden@@#$', 10);
    
    await adminsCollection.insertOne({
      username: 'admin',
      password_hash: hashedPassword,
      email: 'admin@kestrelnest.com',
      is_active: true,
      created_at: new Date()
    });
    
    console.log('✅ Default admin created (username: admin, password: KestrelNestGarden@@#$)');
  }
}

async function createMongoSampleStaff(database) {
  const staffCollection = database.collection('staff');
  
  const staffCount = await staffCollection.countDocuments();
  
  if (staffCount === 0) {
    const sampleStaff = [
      {
        staff_id: 'EMP001',
        pin: '1234',
        name: 'Sarah Johnson',
        position: 'Server',
        department: 'Front of House',
        email: 'sarah@kestrelnest.com',
        phone: '555-0101',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        staff_id: 'EMP002',
        pin: '5678',
        name: 'Michael Chen',
        position: 'Chef',
        department: 'Kitchen',
        email: 'michael@kestrelnest.com',
        phone: '555-0102',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        staff_id: 'EMP003',
        pin: '9012',
        name: 'Emily Rodriguez',
        position: 'Hostess',
        department: 'Front of House',
        email: 'emily@kestrelnest.com',
        phone: '555-0103',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        staff_id: 'EMP004',
        pin: '3456',
        name: 'David Kim',
        position: 'Sous Chef',
        department: 'Kitchen',
        email: 'david@kestrelnest.com',
        phone: '555-0104',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        staff_id: 'EMP005',
        pin: '7890',
        name: 'Lisa Thompson',
        position: 'Bartender',
        department: 'Bar',
        email: 'lisa@kestrelnest.com',
        phone: '555-0105',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await staffCollection.insertMany(sampleStaff);
    console.log('✅ Sample staff data inserted');
  }
}

async function createMongoIndexes(database) {
  // Create indexes for better performance
  await database.collection('votes').createIndex({ campaign_id: 1 });
  await database.collection('votes').createIndex({ voter_staff_id: 1 });
  await database.collection('staff').createIndex({ is_active: 1 });
  await database.collection('campaigns').createIndex({ is_active: 1 });
  await database.collection('staff').createIndex({ staff_id: 1 }, { unique: true });
  await database.collection('admins').createIndex({ username: 1 }, { unique: true });
  
  console.log('✅ MongoDB indexes created');
}

// Main database initialization
async function initDatabase() {
  try {
    logSystemInfo();
    logConnectionInfo();
    
    if (isMongoDBConfigured()) {
      // Try MongoDB Atlas
      try {
        await connectToMongoDB();
        const database = mongoDb;

        // Create collections with validation
        await createMongoCollections(database);
        
        // Insert default admin if not exists
        await createMongoDefaultAdmin(database);
        
        // Insert sample staff if collection is empty
        await createMongoSampleStaff(database);
        
        // Create indexes for better performance
        await createMongoIndexes(database);

        console.log('✅ MongoDB database initialized successfully');
        return;
      } catch (mongoError) {
        console.error('❌ MongoDB Atlas connection failed, falling back to SQLite:', mongoError.message);
      }
    }
    
    // Fallback to SQLite
    console.log('🔄 Initializing SQLite database...');
    await initSQLiteDatabase();
    console.log('✅ SQLite database initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Get database instance (MongoDB or SQLite)
function getDatabase() {
  if (mongoDb) {
    return mongoDb; // MongoDB is available
  }
  if (sqliteDb) {
    return sqliteDb; // SQLite fallback
  }
  throw new Error('Database not connected. Call initDatabase() first.');
}

// Helper functions to check database type
function isUsingMongoDB() {
  return !!mongoDb;
}

function isUsingSQLite() {
  return !!sqliteDb;
}

async function closeDatabase() {
  if (mongoClient) {
    await mongoClient.close();
    console.log('✅ MongoDB connection closed');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});

module.exports = {
  getDatabase,
  initDatabase,
  connectToMongoDB,
  closeDatabase,
  getSQLiteDatabase,
  initSQLiteDatabase,
  isUsingMongoDB,
  isUsingSQLite
};

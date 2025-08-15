const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/voting.db');

let db;

function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      }
    });
  }
  return db;
}

async function initDatabase() {
  const database = getDatabase();
  
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
          const hashedPassword = await bcrypt.hash('admin123', 10);
          database.run(
            "INSERT INTO admins (username, password_hash, email) VALUES (?, ?, ?)",
            ['admin', hashedPassword, 'admin@kestrelnest.com'],
            (err) => {
              if (err) {
                console.error('Error creating default admin:', err);
              } else {
                console.log('✅ Default admin created (username: admin, password: admin123)');
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

module.exports = {
  getDatabase,
  initDatabase
};

const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use production database path
const dbPath = '/tmp/voting.db';

console.log('🔄 Updating admin password in production database...');
console.log('Database path:', dbPath);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to production database');
});

async function updateAdminPassword(newPassword) {
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the admin password
    db.run(
      "UPDATE admins SET password_hash = ? WHERE username = 'admin'",
      [hashedPassword],
      function(err) {
        if (err) {
          console.error('❌ Error changing admin password:', err.message);
        } else {
          if (this.changes > 0) {
            console.log('✅ Admin password updated successfully in production!');
            console.log(`New password: ${newPassword}`);
          } else {
            console.log('❌ Admin user not found in production database');
          }
        }
        db.close();
      }
    );
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    db.close();
  }
}

// New admin password
const newPassword = 'KestrelNestGarden@@#$';

updateAdminPassword(newPassword);

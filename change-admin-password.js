const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'data', 'voting.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

async function changeAdminPassword(newPassword) {
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
            console.log('✅ Admin password changed successfully!');
            console.log(`New password: ${newPassword}`);
          } else {
            console.log('❌ Admin user not found');
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

// Get new password from command line argument
const newPassword = process.argv[2];

if (!newPassword) {
  console.log('❌ Please provide a new password');
  console.log('Usage: node change-admin-password.js <new-password>');
  console.log('Example: node change-admin-password.js mynewpassword123');
  process.exit(1);
}

console.log('🔄 Changing admin password...');
changeAdminPassword(newPassword);

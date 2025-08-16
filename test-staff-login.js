#!/usr/bin/env node

/**
 * Staff Login Test Script
 * 
 * This script helps you test staff login and verify staff data in MongoDB.
 * Run this to check if staff credentials are working correctly.
 */

const { MongoClient } = require('mongodb');

async function testStaffLogin() {
  console.log('🔍 Staff Login Test');
  console.log('==================');
  
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.log('\n❌ MONGODB_URI environment variable not set');
    console.log('\n💡 To test staff login:');
    console.log('1. Set your connection string:');
    console.log('   export MONGODB_URI="your_connection_string_here"');
    console.log('2. Run this script again:');
    console.log('   node test-staff-login.js');
    return;
  }
  
  console.log('✅ MONGODB_URI found');
  
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
  
  try {
    const client = new MongoClient(MONGODB_URI, connectionOptions);
    
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas!');
    
    // Get database and collection
    const db = client.db();
    const staffCollection = db.collection('staff');
    
    console.log('\n📊 Staff Database Analysis:');
    console.log('==========================');
    
    // Count total staff
    const totalStaff = await staffCollection.countDocuments({});
    console.log(`Total staff members: ${totalStaff}`);
    
    // Count active staff
    const activeStaff = await staffCollection.countDocuments({ is_active: true });
    console.log(`Active staff members: ${activeStaff}`);
    
    // Count inactive staff
    const inactiveStaff = await staffCollection.countDocuments({ is_active: false });
    console.log(`Inactive staff members: ${inactiveStaff}`);
    
    // Get all staff members
    const allStaff = await staffCollection.find({}).toArray();
    
    if (allStaff.length === 0) {
      console.log('\n❌ No staff members found in database!');
      console.log('💡 You need to create staff members first.');
    } else {
      console.log('\n📋 Staff Members:');
      console.log('================');
      
      allStaff.forEach((staff, index) => {
        console.log(`${index + 1}. ID: ${staff.staff_id}`);
        console.log(`   Name: ${staff.name}`);
        console.log(`   PIN: ${staff.pin}`);
        console.log(`   Position: ${staff.position}`);
        console.log(`   Department: ${staff.department}`);
        console.log(`   Active: ${staff.is_active ? 'Yes' : 'No'}`);
        console.log(`   MongoDB ID: ${staff._id}`);
        console.log('');
      });
      
      // Test login with first active staff member
      const activeStaffMember = allStaff.find(staff => staff.is_active === true);
      
      if (activeStaffMember) {
        console.log('🧪 Testing Login:');
        console.log('================');
        console.log(`Staff ID: ${activeStaffMember.staff_id}`);
        console.log(`PIN: ${activeStaffMember.pin}`);
        console.log(`Name: ${activeStaffMember.name}`);
        
        // Test finding this staff member by credentials
        const foundStaff = await staffCollection.findOne({
          staff_id: activeStaffMember.staff_id,
          pin: activeStaffMember.pin,
          is_active: true
        });
        
        if (foundStaff) {
          console.log('✅ Login test PASSED - Staff member found with credentials');
        } else {
          console.log('❌ Login test FAILED - Staff member not found with credentials');
          console.log('💡 Possible issues:');
          console.log('   - PIN mismatch');
          console.log('   - Staff member is inactive');
          console.log('   - Staff ID format issue');
        }
      } else {
        console.log('❌ No active staff members found for login testing');
      }
    }
    
    // Check for common issues
    console.log('\n🔍 Common Issues Check:');
    console.log('======================');
    
    // Check for staff with missing PIN
    const staffWithoutPin = await staffCollection.countDocuments({ pin: { $exists: false } });
    if (staffWithoutPin > 0) {
      console.log(`❌ Found ${staffWithoutPin} staff members without PIN`);
    }
    
    // Check for staff with missing staff_id
    const staffWithoutId = await staffCollection.countDocuments({ staff_id: { $exists: false } });
    if (staffWithoutId > 0) {
      console.log(`❌ Found ${staffWithoutId} staff members without staff_id`);
    }
    
    // Check for duplicate staff_ids
    const duplicateIds = await staffCollection.aggregate([
      { $group: { _id: "$staff_id", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (duplicateIds.length > 0) {
      console.log(`❌ Found duplicate staff IDs: ${duplicateIds.map(d => d._id).join(', ')}`);
    }
    
    // Close connection
    await client.close();
    console.log('\n✅ Connection closed successfully');
    
  } catch (error) {
    console.error('\n❌ Staff login test FAILED!');
    console.error('Error:', error.message);
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your MongoDB Atlas connection');
    console.log('2. Verify staff data exists in the database');
    console.log('3. Check staff PIN format (should be 4 digits)');
    console.log('4. Ensure staff members are marked as active');
    
    process.exit(1);
  }
}

// Run the test
testStaffLogin().catch(console.error);

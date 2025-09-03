const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'awaken';

async function checkAdminUser() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const adminsCollection = db.collection('admins');

    // Check if any admin users exist
    const adminCount = await adminsCollection.countDocuments();
    console.log(`📊 Found ${adminCount} admin user(s) in database`);

    if (adminCount === 0) {
      console.log('🔧 Creating default admin user...');

      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const defaultAdmin = {
        email: 'admin@awaken.com',
        password: hashedPassword,
        name: 'Admin User',
        createdAt: new Date(),
      };

      const result = await adminsCollection.insertOne(defaultAdmin);
      console.log('✅ Default admin user created:', result.insertedId);
      console.log('📧 Email: admin@awaken.com');
      console.log('🔑 Password: admin123');
    } else {
      // List existing admin users
      const admins = await adminsCollection
        .find({}, { projection: { password: 0 } })
        .toArray();
      console.log('👥 Existing admin users:');
      admins.forEach((admin, index) => {
        console.log(
          `   ${index + 1}. ${admin.email} (${admin.name}) - ID: ${admin._id}`
        );
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkAdminUser().catch(console.error);

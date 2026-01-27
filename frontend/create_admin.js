const PocketBase = require('pocketbase');

async function createAdmin() {
  const pb = new PocketBase('http://localhost:8090');
  
  // Create admin record
  const adminData = {
    name: "System Administrator",
    age: 30,
    role: "admin",
    salary: 0,
    active: true,
    password: "admin123",
    passwordConfirm: "admin123"
  };
  
  try {
    const record = await pb.collection('employees').create(adminData);
    console.log('Admin created successfully:');
    console.log('Reg No:', record.reg_no);
    console.log('Password: admin123');
  } catch (err) {
    console.error('Error creating admin:', err.response);
  }
}

createAdmin();
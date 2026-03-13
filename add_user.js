// Script untuk menambah user baru
// Usage: node add_user.js <username> <password> <name>

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addUser() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node add_user.js <username> <password> <name>');
    console.log('Example: node add_user.js john password123 "John Doe"');
    process.exit(1);
  }
  
  const [username, password, name] = args;
  
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name
      }
    });
    
    console.log('✅ User created successfully!');
    console.log('Username:', user.username);
    console.log('Name:', user.name);
    console.log('ID:', user.id);
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Error: Username already exists!');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

addUser();

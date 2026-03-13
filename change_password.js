// Script untuk ganti password
// Usage: node change_password.js <username> <new_password>

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function changePassword() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node change_password.js <username> <new_password>');
    console.log('Example: node change_password.js admin newpassword123');
    process.exit(1);
  }
  
  const [username, newPassword] = args;
  
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user) {
      console.error('❌ Error: User not found!');
      process.exit(1);
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { username },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Password changed successfully!');
    console.log('Username:', username);
    console.log('New password has been set.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

changePassword();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = 'admin@snmachinery.com';
    const password = 'Adminsn123';
    const name = 'System Admin';
    const phoneNumber = '0780000000';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('User already exists, updating password and verification status...');
      const hashed = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: {
          password: hashed,
          isVerified: true,
          role: 'Admin'
        }
      });
      console.log('Admin user updated:', email);
    } else {
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          phoneNumber,
          role: 'Admin',
          isVerified: true,
          accountType: 'Individual'
        }
      });
      console.log('Admin user created:', { id: user.id, email: user.email, role: user.role });
    }
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
})();

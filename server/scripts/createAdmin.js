const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = 'derrickkubwimana@snmachinery.com';
    const password = 'Derrick123';
    const name = 'Derrick Kubwimana';
    const phoneNumber = '000000000';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('User already exists:', existing.email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        phoneNumber,
        role: 'Admin'
      }
    });

    console.log('Admin user created:', { id: user.id, email: user.email, role: user.role });
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
})();

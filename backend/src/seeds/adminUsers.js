import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import env from '../config/environment.js';
import User from '../models/userModel.js';

const adminUsers = [
  {
    email: 'admin01@herdays.vn',
    fullName: 'HERDAYS Admin 01',
    passwordEnv: 'ADMIN_SEED_01_PASSWORD'
  },
  {
    email: 'admin02@herdays.vn',
    fullName: 'HERDAYS Admin 02',
    passwordEnv: 'ADMIN_SEED_02_PASSWORD'
  },
  {
    email: 'admin03@herdays.vn',
    fullName: 'HERDAYS Admin 03',
    passwordEnv: 'ADMIN_SEED_03_PASSWORD'
  },
  {
    email: 'admin04@herdays.vn',
    fullName: 'HERDAYS Admin 04',
    passwordEnv: 'ADMIN_SEED_04_PASSWORD'
  },
  {
    email: 'admin05@herdays.vn',
    fullName: 'HERDAYS Admin 05',
    passwordEnv: 'ADMIN_SEED_05_PASSWORD'
  }
];

const getSeedPassword = ({ email, passwordEnv }) => {
  const password = process.env[passwordEnv] || process.env.ADMIN_SEED_PASSWORD;

  if (!password || password.length < 8) {
    throw new Error(`${passwordEnv} or ADMIN_SEED_PASSWORD must be at least 8 characters for ${email}`);
  }

  return password;
};

const seedAdminUsers = async () => {
  await mongoose.connect(env.mongodbUri, { dbName: env.mongodbDbName });

  const results = [];

  for (const adminUser of adminUsers) {
    const passwordHash = await bcrypt.hash(getSeedPassword(adminUser), env.bcryptSaltRounds);

    const result = await User.updateOne(
      { email: adminUser.email },
      {
        $set: {
          email: adminUser.email,
          fullName: adminUser.fullName,
          password: passwordHash,
          authProvider: 'local',
          role: 'admin',
          isVerified: true,
          isDisabled: false
        }
      },
      { upsert: true }
    );

    results.push({
      email: adminUser.email,
      created: result.upsertedCount > 0,
      updated: result.modifiedCount > 0
    });
  }

  await mongoose.disconnect();

  results.forEach((result) => {
    const action = result.created ? 'created' : result.updated ? 'updated' : 'unchanged';
    process.stdout.write(`${result.email}: ${action}\n`);
  });
  process.stdout.write(`Seeded ${adminUsers.length} admin users.\n`);
};

seedAdminUsers().catch(async (error) => {
  process.stderr.write(`Unable to seed admin users: ${error.message}\n`);
  await mongoose.disconnect();
  process.exitCode = 1;
});

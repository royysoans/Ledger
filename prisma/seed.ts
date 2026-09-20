import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  await prisma.emailLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  const adminRole = await prisma.role.create({
    data: {
      name: "ADMIN",
      description: "Full administrative system access and oversight",
    },
  });

  const memberRole = await prisma.role.create({
    data: {
      name: "MEMBER",
      description: "Standard registered user with operational permissions",
    },
  });

  const guestRole = await prisma.role.create({
    data: {
      name: "GUEST",
      description: "Read-only access to public metrics",
    },
  });

  const primaryAdmin = await prisma.user.create({
    data: {
      name: "Royston Soans",
      email: "roystonsoans3@gmail.com",
      roleId: adminRole.id,
    },
  });

  const primaryMember = await prisma.user.create({
    data: {
      name: "Jordan Lee",
      email: "member@enterprise.dev",
      roleId: memberRole.id,
    },
  });

  const primaryGuest = await prisma.user.create({
    data: {
      name: "Morgan Public",
      email: "guest@enterprise.dev",
      roleId: guestRole.id,
    },
  });

  const createdUsers = [primaryAdmin, primaryMember, primaryGuest];

  for (let i = 0; i < 7; i++) {
    const role = i % 2 === 0 ? memberRole : guestRole;
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        roleId: role.id,
      },
    });
    createdUsers.push(user);
  }

  const categories = ["Cloud Infrastructure", "API Billing", "Payroll", "Security", "Hardware", "SaaS Licensing"];
  const statuses = ["COMPLETED", "PENDING", "PROCESSING"];

  for (const user of createdUsers) {
    const count = faker.number.int({ min: 2, max: 5 });
    for (let j = 0; j < count; j++) {
      await prisma.transaction.create({
        data: {
          amount: parseFloat(faker.finance.amount({ min: 25, max: 2500, dec: 2 })),
          currency: "USD",
          status: faker.helpers.arrayElement(statuses),
          recipient: faker.company.name(),
          category: faker.helpers.arrayElement(categories),
          reference: `REF-${faker.string.alphanumeric(8).toUpperCase()}`,
          userId: user.id,
          createdAt: faker.date.recent({ days: 30 }),
        },
      });

      await prisma.auditLog.create({
        data: {
          action: faker.helpers.arrayElement(["TRANSACTION_CREATED", "PROFILE_UPDATED", "SESSION_VALIDATED"]),
          details: JSON.stringify({ ip: faker.internet.ip(), userAgent: "Next.js Edge Runtime" }),
          ipAddress: faker.internet.ip(),
          userId: user.id,
        },
      });
    }

    await prisma.emailLog.create({
      data: {
        recipient: user.email,
        subject: "Monthly Statement & Security Digest",
        status: faker.helpers.arrayElement(["DELIVERED", "SENT"]),
        resendId: `msg_${faker.string.alphanumeric(20)}`,
        userId: user.id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

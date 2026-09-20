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

  const createdUsers = [primaryAdmin];

  for (let i = 0; i < 5; i++) {
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

  const primaryTransactions = [
    {
      amount: 14500.0,
      currency: "INR",
      status: "COMPLETED",
      recipient: "Amazon Web Services India",
      category: "Cloud Infrastructure",
      reference: "REF-AWS-9042",
      userId: primaryAdmin.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      amount: 6200.0,
      currency: "INR",
      status: "COMPLETED",
      recipient: "Google Cloud Platform",
      category: "API Billing",
      reference: "REF-GCP-8114",
      userId: primaryAdmin.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
    },
    {
      amount: 75000.0,
      currency: "INR",
      status: "COMPLETED",
      recipient: "Engineering Stipend",
      category: "Payroll",
      reference: "REF-PAY-3301",
      userId: primaryAdmin.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
    },
    {
      amount: 3800.0,
      currency: "INR",
      status: "COMPLETED",
      recipient: "GitHub Enterprise",
      category: "Security",
      reference: "REF-GH-5520",
      userId: primaryAdmin.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60),
    },
  ];

  for (const tx of primaryTransactions) {
    await prisma.transaction.create({ data: tx });
  }

  const categories = [
    "Cloud Infrastructure",
    "API Billing",
    "Payroll",
    "Security",
    "Hardware",
    "SaaS Licensing",
  ];
  const statuses = ["COMPLETED", "PENDING", "PROCESSING"];

  for (const user of createdUsers.slice(1)) {
    const count = faker.number.int({ min: 2, max: 4 });
    for (let j = 0; j < count; j++) {
      await prisma.transaction.create({
        data: {
          amount: parseFloat(faker.finance.amount({ min: 1500, max: 45000, dec: 2 })),
          currency: "INR",
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
          action: faker.helpers.arrayElement([
            "TRANSACTION_CREATED",
            "PROFILE_UPDATED",
            "SESSION_VALIDATED",
          ]),
          details: JSON.stringify({
            ip: faker.internet.ipv4(),
            userAgent: "Next.js Turbopack Client",
          }),
          ipAddress: faker.internet.ipv4(),
          userId: user.id,
        },
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      action: "TRANSACTION_CREATED",
      details: JSON.stringify({
        amount: 14500.0,
        recipient: "Amazon Web Services India",
        currency: "INR",
      }),
      ipAddress: "127.0.0.1",
      userId: primaryAdmin.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "SESSION_AUTHENTICATED",
      details: JSON.stringify({
        email: "roystonsoans3@gmail.com",
        role: "ADMIN",
      }),
      ipAddress: "127.0.0.1",
      userId: primaryAdmin.id,
    },
  });

  await prisma.emailLog.create({
    data: {
      recipient: "roystonsoans3@gmail.com",
      subject: "Transaction Confirmation - ₹14,500.00",
      status: "DELIVERED",
      resendId: "01a0bf7f-efad-777c-a82d-8f827c19ee6d",
      userId: primaryAdmin.id,
    },
  });

  await prisma.emailLog.create({
    data: {
      recipient: "roystonsoans3@gmail.com",
      subject: "Monthly Statement & Security Digest",
      status: "DELIVERED",
      resendId: "01a0bf7f-b88a-777c-b29c-9c927c19ee77",
      userId: primaryAdmin.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

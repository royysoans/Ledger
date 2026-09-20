import { PrismaClient } from "@prisma/client";

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

  const secondaryMember = await prisma.user.create({
    data: {
      name: "Aarav Mehta",
      email: "member@ledgercraft.dev",
      roleId: memberRole.id,
    },
  });

  const secondaryGuest = await prisma.user.create({
    data: {
      name: "Ananya Sharma",
      email: "guest@ledgercraft.dev",
      roleId: guestRole.id,
    },
  });

  const transactionsData = [
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
      userId: secondaryMember.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60),
    },
    {
      amount: 9450.0,
      currency: "INR",
      status: "PENDING",
      recipient: "Apple India Retail",
      category: "Hardware",
      reference: "REF-APL-7741",
      userId: primaryAdmin.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 84),
    },
    {
      amount: 4100.0,
      currency: "INR",
      status: "COMPLETED",
      recipient: "Slack Technologies",
      category: "SaaS Licensing",
      reference: "REF-SLK-1290",
      userId: secondaryMember.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 110),
    },
  ];

  for (const tx of transactionsData) {
    await prisma.transaction.create({ data: tx });
  }

  await prisma.auditLog.create({
    data: {
      action: "TRANSACTION_CREATED",
      details: JSON.stringify({ amount: 14500.0, recipient: "Amazon Web Services India", currency: "INR" }),
      ipAddress: "127.0.0.1",
      userId: primaryAdmin.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "SESSION_AUTHENTICATED",
      details: JSON.stringify({ email: "roystonsoans3@gmail.com", role: "ADMIN" }),
      ipAddress: "127.0.0.1",
      userId: primaryAdmin.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "TRANSACTION_CREATED",
      details: JSON.stringify({ amount: 6200.0, recipient: "Google Cloud Platform", currency: "INR" }),
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

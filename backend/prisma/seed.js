import { PrismaClient, UserRole, VehicleType, PartnerStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

function cents(value) {
  return Math.round(value * 100);
}

async function main() {
  const customerUser = await prisma.user.upsert({
    where: { phone: "+919000000001" },
    update: {},
    create: {
      role: UserRole.CUSTOMER,
      phone: "+919000000001",
      name: "Demo Customer",
      customer: { create: { companyName: "Demo Retail Store", gstNumber: "29ABCDE1234F1Z5" } },
    },
    include: { customer: true },
  });

  const partnerUser = await prisma.user.upsert({
    where: { phone: "+919000000002" },
    update: {},
    create: {
      role: UserRole.PARTNER,
      phone: "+919000000002",
      name: "Ravi Kumar",
      partner: {
        create: {
          status: PartnerStatus.ACTIVE,
          currentLat: 12.9716,
          currentLng: 77.5946,
          vehicles: {
            create: {
              type: VehicleType.TATA_ACE,
              plateNumber: "KA01AB1234",
              capacityKg: 750,
            },
          },
        },
      },
    },
    include: { partner: true },
  });

  const adminUser = await prisma.user.upsert({
    where: { phone: "+919000000003" },
    update: {},
    create: {
      role: UserRole.ADMIN,
      phone: "+919000000003",
      name: "Ops Admin",
    },
  });

  const booking = await prisma.booking.create({
    data: {
      bookingCode: `LDY-${Date.now().toString().slice(-6)}`,
      customerId: customerUser.customer.id,
      partnerId: partnerUser.partner.id,
      vehicleType: VehicleType.TATA_ACE,
      status: "PARTNER_ASSIGNED",
      goodsType: "Retail stock",
      loadWeightKg: 120,
      distanceKm: 11.4,
      quotedFareCents: cents(548),
      stops: {
        create: [
          { type: "PICKUP", address: "Indiranagar, Bengaluru", sequence: 1 },
          { type: "DROP", address: "Koramangala, Bengaluru", sequence: 2 },
        ],
      },
      quote: {
        create: {
          baseFareCents: cents(210),
          distanceCents: cents(278),
          handlingCents: cents(60),
          taxCents: 0,
          totalCents: cents(548),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      },
      payment: {
        create: {
          status: PaymentStatus.AUTHORIZED,
          method: PaymentMethod.UPI,
          provider: "mock",
          amountCents: cents(548),
          providerReference: "mock_pay_seed",
        },
      },
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: adminUser.id,
      action: "SEED_DATABASE",
      entity: "Booking",
      entityId: booking.id,
      metadata: { source: "seed.js" },
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });

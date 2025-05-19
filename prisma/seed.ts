import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1. Create categories
  const categoriesData = [
    { name: "Culture", description: "Lean culture and leadership dimensions" },
    { name: "Process", description: "Lean process and tools dimensions" },
    { name: "Strategy", description: "Strategic alignment and governance" },
    { name: "Performance", description: "Performance measurement and management" },
    { name: "Sustainability", description: "Sustainment and continuous improvement" },
  ];
  const categories: Record<string, { id: string }> = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.create({ data: cat });
    categories[cat.name] = c;
  }

  // 2. Create sectors
  const sectorsData = [
    { name: "Healthcare" },
    { name: "IT" },
    { name: "Logistics" },
    { name: "Manufacturing" },
  ];
  const sectors: Record<string, { id: string }> = {};
  for (const s of sectorsData) {
    const sector = await prisma.sector.create({ data: s });
    sectors[s.name] = sector;
  }

  // 3. Create companies and departments
  const companyA = await prisma.company.create({
    data: {
      name: "HealthCo",
      sectorId: sectors["Healthcare"].id,
      departments: {
        create: [{ name: "Clinical Operations" }, { name: "Administrative" }],
      },
    },
    include: { departments: true },
  });

  const companyB = await prisma.company.create({
    data: {
      name: "TechSoft",
      sectorId: sectors["IT"].id,
      departments: {
        create: [{ name: "Development" }, { name: "QA" }],
      },
    },
    include: { departments: true },
  });

  // 4. Create users
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: "hashedpassword123",
      role: "ADMIN",
      companyId: companyA.id,
    },
  });
  const expertUser = await prisma.user.create({
    data: {
      email: "expert@example.com",
      name: "Expert User",
      password: "hashedpassword123",
      role: "EXPERT",
      companyId: companyA.id,
    },
  });
  const viewerUser = await prisma.user.create({
    data: {
      email: "viewer@example.com",
      name: "Viewer User",
      password: "hashedpassword123",
      role: "VIEWER",
      companyId: companyB.id,
    },
  });

  // 5. Create all 57 dimensions with categories
  // (Add all 57 dimension names + descriptions categorized properly)
  const dimensionData = [
    {
      name: "Leadership Commitment",
      description: "Leadership commitment to Lean principles.",
      categoryId: categories["Culture"].id,
    },
    {
      name: "Coaching and Role Modeling",
      description: "Lean coaching and role modeling practices.",
      categoryId: categories["Culture"].id,
    },
    {
      name: "Value Stream Mapping",
      description: "Mapping processes to identify value and waste.",
      categoryId: categories["Process"].id,
    },
    {
      name: "5S",
      description: "Workplace organization and cleanliness.",
      categoryId: categories["Process"].id,
    },
    {
      name: "Lean Integrated into Corporate Strategy",
      description: "Lean as part of strategic planning.",
      categoryId: categories["Strategy"].id,
    },
    {
      name: "Hoshin Kanri or Strategy Deployment",
      description: "Alignment of goals with Lean initiatives.",
      categoryId: categories["Strategy"].id,
    },
    {
      name: "KPI Definition and Alignment",
      description: "Key performance indicators supporting Lean.",
      categoryId: categories["Performance"].id,
    },
    {
      name: "Daily Management Systems",
      description: "Regular review of operations and metrics.",
      categoryId: categories["Performance"].id,
    },
    {
      name: "Knowledge Sharing Systems",
      description: "Systems to share learning and best practices.",
      categoryId: categories["Sustainability"].id,
    },
    {
      name: "Regular Kaizen Events",
      description: "Frequent continuous improvement events.",
      categoryId: categories["Sustainability"].id,
    },
    // TODO: Add all 57 dimensions here with correct categoryId
  ];

  const dimensions: Record<string, { id: string }> = {};
  for (const dim of dimensionData) {
    const d = await prisma.dimension.create({
      data: {
        name: dim.name,
        description: dim.description,
        categoryId: dim.categoryId,
      },
    });
    dimensions[d.name] = d;
  }

  // 6. Sample maturity descriptors for demonstration (replace with full data)
  const maturityDescriptorsData = [
    {
      dimensionName: "Leadership Commitment",
      sectorName: "Healthcare",
      levels: [
        "Leaders rarely focus on Lean; improvement is ad hoc.",
        "Leaders occasionally review Lean initiatives but lack consistency.",
        "Leaders periodically engage in Lean activities and improvement events.",
        "Leaders actively coach and role model Lean behaviors regularly.",
        "Lean is fully embedded with leadership driving continuous improvement culture.",
      ],
    },
    // Add more descriptors here...
  ];

  for (const descGroup of maturityDescriptorsData) {
    const dim = dimensions[descGroup.dimensionName];
    const sector = sectors[descGroup.sectorName];
    if (!dim || !sector) continue;

    for (let level = 1; level <= descGroup.levels.length; level++) {
      await prisma.maturityDescriptor.create({
        data: {
          dimensionId: dim.id,
          sectorId: sector.id,
          level,
          description: descGroup.levels[level - 1],
        },
      });
    }
  }

  // 7. Create a sample assessment with scores and evidence
  const assessment = await prisma.assessment.create({
    data: {
      companyId: companyA.id,
      departmentId: companyA.departments[0].id,
      expertId: expertUser.id,
      status: "DRAFT",
    },
  });

  await prisma.score.createMany({
    data: [
      {
        assessmentId: assessment.id,
        dimensionId: dimensions["Leadership Commitment"].id,
        level: 3,
        quantitative: null,
        notes: "Leadership somewhat engaged; room for improvement.",
        perception: true,
        auditTrail: "Self-assessed during workshop.",
      },
      {
        assessmentId: assessment.id,
        dimensionId: dimensions["Coaching and Role Modeling"].id,
        level: 2,
        quantitative: null,
        notes: "Coaching is inconsistent and informal.",
        perception: true,
        auditTrail: "Based on supervisor interviews.",
      },
    ],
  });

  await prisma.evidence.create({
    data: {
      assessmentId: assessment.id,
      dimensionId: dimensions["Leadership Commitment"].id,
      fileUrl: "https://example.com/evidence/leadership_gemba_walk.jpg",
      fileType: "image/jpeg",
      uploadedById: expertUser.id,
      notes: "Photo of leadership Gemba walk.",
    },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

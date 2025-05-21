const { PrismaClient } = require("@prisma/client");
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
  const categories = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.create({ data: cat });
    categories[cat.name] = c;
  }

  // 2. Create sectors
  const sectorsData = [
    { name: "Healthcare" },
    { name: "IT & Software" },
    { name: "Logistics" },
    { name: "Manufacturing" },
  ];
  const sectors = {};
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
      sectorId: sectors["IT & Software"].id,
      departments: {
        create: [{ name: "Development" }, { name: "QA" }],
      },
    },
    include: { departments: true },
  });

  // SOFT DELETED COMPANY
  const softDeletedCompany = await prisma.company.create({
    data: {
      name: "SoftDeletedCo",
      sectorId: sectors["Manufacturing"].id,
      deletedAt: new Date(), // Soft deleted
    },
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

  // SOFT DELETED USER
  const softDeletedUser = await prisma.user.create({
    data: {
      email: "deleteduser@example.com",
      name: "Soft Deleted User",
      password: "hashedpassword123",
      role: "VIEWER",
      companyId: companyB.id,
      deletedAt: new Date(), // Soft deleted
    },
  });

  // 5. Create all 57 dimensions with categories
  // (Add all 57 dimension names + descriptions categorized properly)
  const dimensionData = [
    // Culture
    { name: "Leadership Commitment", description: "Active support and advocacy for Lean principles by leadership.", categoryId: categories["Culture"].id },
    { name: "Coaching & Role Modeling", description: "Leaders and managers demonstrate and coach Lean behaviors.", categoryId: categories["Culture"].id },
    { name: "Lean Mindset Adoption", description: "Organization-wide adoption of Lean thinking and continuous improvement.", categoryId: categories["Culture"].id },
    { name: "Employee Empowerment", description: "Employees are trusted and enabled to contribute to improvements.", categoryId: categories["Culture"].id },
    { name: "Psychological Safety", description: "Safe environment for open discussion and experimentation.", categoryId: categories["Culture"].id },
    { name: "Cross-Level Communication", description: "Open communication between all organizational levels.", categoryId: categories["Culture"].id },
    { name: "Lean Training and Education", description: "Providing Lean concepts and skills training for all staff.", categoryId: categories["Culture"].id },
    { name: "Recognition and Celebration", description: "Recognition of Lean achievements to reinforce positive behaviors.", categoryId: categories["Culture"].id },
    { name: "Change Management Readiness", description: "Preparation and support for Lean-driven organizational changes.", categoryId: categories["Culture"].id },
    { name: "Daily Problem-Solving Culture", description: "Continuous, small-scale problem-solving is part of daily work.", categoryId: categories["Culture"].id },
    { name: "Team Engagement in Improvement", description: "Active participation of teams in identifying and implementing improvements.", categoryId: categories["Culture"].id },
  
    // Process
    { name: "Value Stream Mapping", description: "Visualizing and analyzing workflows to identify waste and value.", categoryId: categories["Process"].id },
    { name: "Process Flow Efficiency", description: "Designing processes to minimize delays, bottlenecks, and waste.", categoryId: categories["Process"].id },
    { name: "Standard Work / SOPs", description: "Establishing and following standardized work procedures.", categoryId: categories["Process"].id },
    { name: "Visual Management", description: "Using visual tools for real-time information sharing and control.", categoryId: categories["Process"].id },
    { name: "5S Implementation", description: "Organizing workspaces using 5S (Sort, Set, Shine, Standardize, Sustain).", categoryId: categories["Process"].id },
    { name: "Kanban/Pull Systems", description: "Visual boards and pull-based systems to optimize workflow.", categoryId: categories["Process"].id },
    { name: "Quick Changeover (SMED)", description: "Reducing time and effort needed to switch tasks or projects.", categoryId: categories["Process"].id },
    { name: "Error-Proofing (Poka-Yoke)", description: "Designing processes to prevent or quickly detect errors.", categoryId: categories["Process"].id },
    { name: "Process Transparency", description: "Ensuring process steps, status, and issues are visible to all.", categoryId: categories["Process"].id },
    { name: "Quality-at-Source", description: "Embedding quality checks within the process to catch issues early.", categoryId: categories["Process"].id },
    { name: "Level Loading / Heijunka", description: "Smoothing work to avoid peaks and valleys in flow.", categoryId: categories["Process"].id },
    { name: "TPM (Total Productive Maintenance)", description: "Proactive maintenance of equipment and systems for reliability.", categoryId: categories["Process"].id },
    { name: "End-to-End Value Stream Integration", description: "Connecting all teams and steps for seamless value delivery.", categoryId: categories["Process"].id },
    { name: "Waste Identification and Elimination", description: "Finding and removing activities that don't add value.", categoryId: categories["Process"].id },
    { name: "Handoffs and Queue Reduction", description: "Reducing process handoffs and waiting times.", categoryId: categories["Process"].id },
    { name: "Documentation Discipline", description: "Maintaining accurate, up-to-date documentation for consistency.", categoryId: categories["Process"].id },
    { name: "Digitization of Workflows", description: "Automating and digitizing processes for efficiency.", categoryId: categories["Process"].id },
    { name: "Inventory Management", description: "Efficiently controlling and tracking inventory or work items.", categoryId: categories["Process"].id },
    { name: "Supplier Integration", description: "Collaborating with suppliers to apply Lean principles upstream.", categoryId: categories["Process"].id },
    { name: "Customer Focus in Processes", description: "Designing processes to maximize customer value.", categoryId: categories["Process"].id },
  
    // Strategy
    { name: "Lean Integrated into Corporate Strategy", description: "Aligning Lean principles with business strategy.", categoryId: categories["Strategy"].id },
    { name: "Hoshin Kanri or Strategy Deployment", description: "Cascading strategic goals throughout the organization.", categoryId: categories["Strategy"].id },
    { name: "Policy Deployment", description: "Translating strategy into actionable policies at every level.", categoryId: categories["Strategy"].id },
    { name: "Alignment Across Functions", description: "Coordinating Lean efforts across departments and teams.", categoryId: categories["Strategy"].id },
    { name: "Governance and Accountability", description: "Clear roles and oversight for Lean initiatives.", categoryId: categories["Strategy"].id },
    { name: "Leadership Succession Planning", description: "Ensuring future leaders support and sustain Lean.", categoryId: categories["Strategy"].id },
    { name: "Risk Management", description: "Identifying and mitigating risks in Lean adoption.", categoryId: categories["Strategy"].id },
  
    // Performance
    { name: "KPI Definition and Alignment", description: "Defining metrics aligned with Lean objectives.", categoryId: categories["Performance"].id },
    { name: "Daily Management Systems", description: "Regular routines and tools for process tracking and improvement.", categoryId: categories["Performance"].id },
    { name: "Performance Reviews", description: "Periodic review of Lean progress and outcomes.", categoryId: categories["Performance"].id },
    { name: "Root Cause Analysis", description: "Thoroughly investigating and addressing underlying problems.", categoryId: categories["Performance"].id },
    { name: "Continuous Monitoring", description: "Ongoing process and metric tracking for early detection.", categoryId: categories["Performance"].id },
    { name: "Dashboards and Metrics", description: "Visual displays of key performance indicators.", categoryId: categories["Performance"].id },
    { name: "Process Benchmarking", description: "Comparing processes to best-in-class standards.", categoryId: categories["Performance"].id },
    { name: "Learning from Incidents", description: "Using past mistakes as opportunities for improvement.", categoryId: categories["Performance"].id },
  
    // Sustainability
    { name: "Knowledge Sharing Systems", description: "Platforms and processes for sharing Lean knowledge.", categoryId: categories["Sustainability"].id },
    { name: "Regular Kaizen Events", description: "Ongoing, structured improvement workshops and activities.", categoryId: categories["Sustainability"].id },
    { name: "Sustaining Improvements", description: "Maintaining and embedding improvements over time.", categoryId: categories["Sustainability"].id },
    { name: "Standardization of Improvements", description: "Incorporating successful changes into standard work.", categoryId: categories["Sustainability"].id },
    { name: "Audit and Review Systems", description: "Routine checks to ensure Lean processes are maintained.", categoryId: categories["Sustainability"].id },
    { name: "Continuous Improvement Mindset", description: "A culture of ongoing improvement and innovation.", categoryId: categories["Sustainability"].id },
    { name: "Coaching for Sustainment", description: "Continued coaching to maintain Lean practices.", categoryId: categories["Sustainability"].id },
    { name: "Lean Knowledge Retention", description: "Capturing and retaining Lean expertise within the organization.", categoryId: categories["Sustainability"].id },
    { name: "Talent Development for Lean", description: "Building Lean capabilities through talent growth.", categoryId: categories["Sustainability"].id },
    { name: "Environmental Sustainability", description: "Applying Lean to reduce environmental impact and waste.", categoryId: categories["Sustainability"].id },
    { name: "Community and Stakeholder Engagement", description: "Involving community and stakeholders in Lean transformation.", categoryId: categories["Sustainability"].id }
  ];


  const dimensions = {};
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

  // SOFT DELETED DIMENSION (last one)
  const dimensionKeys = Object.keys(dimensions);
  const lastDimName = dimensionKeys[dimensionKeys.length - 1];
  await prisma.dimension.update({
    where: { id: dimensions[lastDimName].id },
    data: { deletedAt: new Date() }
  });

  // 6. Sample maturity descriptors for demonstration (replace with full data)
  const maturityDescriptorsData = [
    // 1. Leadership Commitment — IT & Software
    {
      dimensionName: "Leadership Commitment",
      sectorName: "IT & Software",
      levels: [
        "Leadership involvement in Lean or Agile practices is minimal, with limited understanding or strategic support. Decisions are mostly reactive, and improvement efforts lack clear sponsorship. Communication about Lean principles is rare or inconsistent, causing confusion among teams. Leadership tends to focus on project delivery over process improvement. Employees often see Lean or Agile as management fads rather than core practices.",
        "Some IT leaders attend Lean or Agile training and support pilot projects in isolated teams. Engagement remains inconsistent and often driven by individual champions rather than organizational mandate. Communication improves but is typically limited to select groups. Leadership begins to recognize the value of continuous improvement but struggles to scale it. Teams have mixed perceptions of Lean/Agile relevance.",
        "Leadership actively sponsors Lean and Agile initiatives, aligning them with strategic IT goals. Regular communication and involvement in retrospectives or improvement cycles are evident. Leaders set clear expectations and allocate resources to support continuous improvement. Engagement cascades beyond project teams into departments. Leadership drives a culture of learning and adaptation.",
        "Lean and Agile thinking are embedded in leadership behaviors and decision-making across IT functions. Leaders coach teams, participate in continuous improvement events, and model desired mindsets. Improvement goals are integrated into performance reviews and strategic planning. Leadership fosters cross-team collaboration and innovation. Lean/Agile principles shape governance and investment decisions.",
        "Leadership fully owns Lean and Agile transformations as strategic priorities, driving sustained cultural change. They empower all levels to innovate and improve, supported by transparent metrics and agile governance. Leaders champion external benchmarking and knowledge sharing. Continuous learning and adaptation are deeply ingrained. Leadership is recognized for driving IT excellence and agility.",
      ],
    },
    // 2. Coaching & Role Modeling — IT & Software
    {
      dimensionName: "Coaching & Role Modeling",
      sectorName: "IT & Software",
      levels: [
        "Coaching in Lean and Agile practices is scarce or absent. Role models of continuous improvement are limited to a few individuals. Feedback tends to be corrective rather than developmental. Teams lack guidance on applying Lean/Agile tools effectively. Coaching is informal and inconsistent.",
        "Some Agile coaches or Lean champions emerge, providing occasional support and guidance. Coaching is reactive, often limited to project phases or specific issues. Role modeling improves but is localized. Teams begin to appreciate coaching but experience variability in quality. Coaching frameworks are undeveloped.",
        "Coaching is integrated into team routines, with dedicated Agile coaches or Lean facilitators supporting multiple projects. Role models consistently demonstrate Lean/Agile behaviors. Coaching includes facilitation of retrospectives, problem-solving, and skills development. Feedback is constructive and focused on growth. Coaching effectiveness is monitored.",
        "Coaching and role modeling are institutionalized, with widespread capability across IT teams. Leaders and coaches collaborate to build capacity and sustain practices. Peer coaching and communities of practice flourish. Coaching is proactive, data-informed, and linked to performance improvement. Role modeling drives cultural norms.",
        "Coaching is a core competency embedded at all organizational levels, fostering a high-performing Lean/Agile culture. Continuous development of coaching skills is prioritized. Coaching outcomes influence talent management and leadership development. The organization is recognized for exemplary coaching and cultural leadership in IT. Coaching innovation sustains competitive advantage.",
      ],
    },
    // 3. Lean Mindset Adoption — IT & Software
    {
      dimensionName: "Lean Mindset Adoption",
      sectorName: "IT & Software",
      levels: [
        "Lean and Agile mindsets are poorly understood or inconsistently applied. Teams focus on delivering outputs rather than optimizing flow or eliminating waste. Continuous improvement is sporadic and lacks strategic alignment. Resistance to Lean/Agile principles exists. Mindset change efforts are minimal.",
        "Awareness of Lean/Agile mindsets grows through training and pilot adoption. Teams begin to recognize the importance of collaboration, iterative delivery, and feedback. Mindset adoption varies across teams and projects. Improvements are mostly event-driven. Skepticism and cultural barriers remain.",
        "Lean/Agile mindsets are actively embraced by most IT teams, influencing daily behaviors and decision-making. Teams apply iterative approaches, prioritize customer value, and focus on waste reduction. Continuous improvement becomes habitual. Leadership and coaching reinforce mindset shifts. Mindset alignment supports collaboration and innovation.",
        "Lean/Agile mindsets are deeply embedded across IT, driving proactive problem-solving, learning, and adaptability. Teams continuously challenge assumptions and experiment with new ways of working. Mindset adoption spans cross-functional teams and partners. Leadership models and reinforces mindset consistently. Mindset underpins strategic agility.",
        "Lean/Agile mindsets define IT culture and identity, enabling rapid adaptation and innovation. Mindset change is sustained through continuous learning, reflection, and external engagement. The organization benchmarks itself as a leader in Lean/Agile cultural transformation. Mindset drives competitive differentiation and business value.",
      ],
    },
    // 4. Employee Empowerment — IT & Software
    {
      dimensionName: "Employee Empowerment",
      sectorName: "IT & Software",
      levels: [
        "Decision-making is centralized, with limited autonomy for developers or teams. Change requests and process improvements require multiple approvals. Employees feel disempowered to experiment or innovate. Suggestion mechanisms are weak or absent. Accountability is top-down.",
        "Some teams gain autonomy to make decisions within defined boundaries. Employees participate in retrospectives and improvement discussions but lack authority to implement changes broadly. Empowerment is inconsistent across teams. Management begins to delegate responsibility. Barriers to empowerment remain.",
        "Teams are empowered to make decisions about their work, process improvements, and tools. Ownership of outcomes is clearly defined. Continuous improvement is part of team responsibilities. Management supports and trusts empowered teams. Empowerment extends across departments.",
        "Employee empowerment is widespread, with distributed authority and accountability. Teams self-organize and prioritize improvements aligned with strategic goals. Management acts as enabler and coach rather than controller. Empowerment is supported by transparent metrics and communication. Employees are motivated to innovate.",
        "Empowerment is a foundational principle, driving innovation, agility, and engagement. Employees at all levels initiate and lead improvements, supported by a culture of psychological safety. Decision-making is decentralized, aligned with organizational purpose. Empowerment is measured and continuously enhanced. The organization excels in enabling autonomy and accountability.",
      ],
    },
    // 5. Psychological Safety — IT & Software
    {
      dimensionName: "Psychological Safety",
      sectorName: "IT & Software",
      levels: [
        "Fear of blame or failure inhibits open communication and experimentation. Mistakes are punished or hidden. Feedback is limited or defensive. Team members hesitate to raise concerns or challenge decisions. Psychological safety is low.",
        "Some leaders encourage open dialogue and learning from mistakes. Psychological safety varies by team or leader. Retrospectives begin to address behaviors and collaboration. Fear and defensiveness persist in parts of the organization. Trust is uneven.",
        "Teams foster safe environments where feedback is constructive and mistakes are treated as learning opportunities. Leaders model vulnerability and openness. Psychological safety is recognized as critical to performance. Teams address interpersonal dynamics proactively. Trust and respect increase.",
        "Psychological safety is deeply embedded in IT teams and leadership behaviors. Open communication and experimentation are norms. Conflict is managed constructively. Feedback flows freely in all directions. Teams recover quickly from failures and innovate confidently.",
        "Psychological safety is a cultural hallmark enabling continuous learning and innovation. The organization actively cultivates and measures safety. Leadership coaching supports safe risk-taking and challenge. Psychological safety extends across teams, departments, and partners. It drives resilience and agility.",
      ],
    },
    // 6. Cross-Level Communication — IT & Software
    {
      dimensionName: "Cross-Level Communication",
      sectorName: "IT & Software",
      levels: [
        "Communication between leadership, managers, and teams is limited and often ineffective. Information flow is primarily top-down, with little feedback or dialogue. Silos hinder collaboration. Communication tools and practices are inconsistent or outdated. Misalignment and misunderstandings are common.",
        "Communication channels improve with scheduled meetings, newsletters, or digital platforms. Some feedback mechanisms are introduced but are sporadic. Cross-level communication remains unstructured and variable. Teams receive information but rarely influence decisions. Transparency is partial.",
        "Structured communication routines exist, including daily stand-ups, sprint reviews, and leadership updates. Two-way communication is fostered, enabling feedback and alignment. Collaboration tools support information sharing. Communication promotes shared understanding of goals and challenges. Cross-level dialogue improves trust.",
        "Communication is proactive, transparent, and integrated across levels and teams. Digital collaboration platforms enable real-time interaction and knowledge sharing. Leaders actively solicit and respond to feedback. Communication supports coordination, problem-solving, and innovation. Organizational alignment is strong.",
        "Communication is seamless, open, and multi-directional, fostering a highly engaged and aligned IT organization. Advanced collaboration technologies and practices enable global coordination. Communication culture supports psychological safety and continuous learning. The organization benchmarks and shares communication best practices externally. Communication excellence drives agility and performance.",
      ],
    },
    // 7. Lean Training and Education — IT & Software
    {
      dimensionName: "Lean Training and Education",
      sectorName: "IT & Software",
      levels: [
        "Lean and Agile training is minimal or absent. Employees lack understanding of principles, tools, and practices. Learning occurs ad hoc and is inconsistent. Training resources and support are limited. Capability gaps hinder Lean adoption.",
        "Basic Lean/Agile training is introduced for some employees, often focused on awareness or tool usage. Training is inconsistent and varies by team. Formal curricula and ongoing learning opportunities are limited. Coaching supplements formal training unevenly. Employee engagement with training is mixed.",
        "Comprehensive Lean/Agile training programs exist with role-based curricula for developers, testers, and leaders. Training combines classroom, online, and on-the-job learning. Coaching and mentoring support skill development. Training effectiveness is evaluated and improved. Learning is linked to performance goals.",
        "Training and education are integrated into talent development and career pathways. Continuous learning culture supports self-directed and peer learning. Advanced training covers Lean leadership, innovation, and change management. Technology-enabled learning platforms enhance access and personalization. Training outcomes influence organizational capability and results.",
        "Lean and Agile education is strategic, continuous, and adaptive. The organization fosters learning agility and innovation through partnerships and benchmarking. Learning analytics guide personalized development. Training is embedded in daily work and leadership practices. The organization is recognized for excellence in Lean/Agile capability building.",
      ],
    },
    // 8. Recognition and Celebration — IT & Software
    {
      dimensionName: "Recognition and Celebration",
      sectorName: "IT & Software",
      levels: [
        "Recognition of Lean/Agile achievements is rare or informal. Contributions to improvement are overlooked. Motivation and morale may be low. Success stories are not shared widely. Recognition lacks structure or consistency.",
        "Some recognition programs begin, often focused on individual achievements or project milestones. Team celebrations occur but are inconsistent. Communication of successes improves but lacks breadth. Recognition is manager-driven and sporadic. Employee motivation is uneven.",
        "Recognition is regular, structured, and includes teams and individuals. Success stories are shared across the organization to build momentum. Peer recognition and formal awards encourage participation. Recognition aligns with Lean/Agile behaviors and outcomes. Engagement and morale improve.",
        "Recognition is embedded in performance management and cultural practices. Leaders celebrate and reinforce continuous improvement contributions. Recognition programs are transparent, inclusive, and aligned with strategic goals. Celebrations foster community and shared purpose. Recognition sustains Lean/Agile momentum.",
        "Recognition is a strategic driver of culture and performance excellence. The organization employs innovative and data-driven recognition methods. Employees are empowered to recognize peers and share success broadly. Recognition extends beyond the organization to partners and customers. Recognition excellence enhances employer brand and competitive advantage.",
      ],
    },
    // 9. Change Management Readiness — IT & Software
    {
      dimensionName: "Change Management Readiness",
      sectorName: "IT & Software",
      levels: [
        "Change initiatives lack planning and leadership support. Employees are resistant or fearful of change. Communication and training are minimal. Change efforts are often reactive and fragmented. Change fatigue or failure is common.",
        "Basic change management practices are introduced, including communication plans and training. Some resistance is managed but not systematically. Change readiness varies across teams. Leaders begin to develop change skills. Change management is project-based.",
        "Structured change management processes support Lean/Agile adoption. Employees receive training and coaching to prepare for changes. Feedback and resistance are actively managed. Change sponsors and champions engage teams. Change readiness improves organization-wide.",
        "Change readiness is integrated into leadership development and business processes. Continuous communication, training, and support foster adaptability. Change impacts are anticipated and mitigated. Employees participate in shaping change. Change management supports strategic agility.",
        "Change readiness is institutionalized as a core organizational capability. Proactive and predictive approaches enable rapid adaptation. The culture embraces change as opportunity. Change leadership is distributed and data-driven. The organization leads in managing complex transformations.",
      ],
    },
    // 10. Daily Problem-Solving Culture — IT & Software
    {
      dimensionName: "Daily Problem-Solving Culture",
      sectorName: "IT & Software",
      levels: [
        "Problem-solving is ad hoc and reactive, often escalating issues without root cause analysis. Teams rely on firefighting rather than prevention. Problem-solving skills and tools are limited. Documentation and learning from problems are rare. Continuous improvement is absent.",
        "Basic problem-solving methods are introduced during retrospectives or improvement events. Teams begin documenting and addressing issues but lack consistency. Supervisors lead problem resolution with limited team involvement. Learning is limited and not standardized. Problem-solving remains event-driven.",
        "Problem-solving is integrated into daily work routines with structured approaches and documentation. Teams apply root cause analysis and Lean tools regularly. Supervisors coach and support problem-solving behaviors. Cross-team collaboration addresses systemic issues. Problem-solving drives incremental improvements.",
        "Advanced problem-solving and data analytics support proactive identification and resolution of issues. Problem-solving is collaborative, continuous, and linked to strategic goals. Knowledge from problem-solving is shared widely. Teams innovate and prevent recurrence. Problem-solving culture is strong.",
        "Problem-solving is a strategic competency leveraging AI, machine learning, and advanced analytics. The organization fosters experimentation and learning from failures. Lessons learned drive innovation and competitive advantage. Problem-solving is embedded in culture and governance. The organization adapts rapidly to complex challenges.",
      ],
    },
        // 11. Team Engagement in Improvement — IT & Software
{
  dimensionName: "Team Engagement in Improvement",
  sectorName: "IT & Software",
  levels: [
    "Team involvement in Lean or Agile initiatives is minimal and often limited to mandatory participation. Employees may feel disengaged or skeptical about the value of continuous improvement. Improvement efforts are mostly driven by management with little grassroots involvement. Communication about improvement goals is sparse or unclear. There is no shared sense of ownership.",
    "Some teams actively participate in retrospectives and improvement events but engagement varies widely. Employees contribute ideas but lack support or follow-through to implement them. Management begins encouraging participation, but cultural barriers limit widespread involvement. Improvement successes are sporadically shared. Motivation fluctuates.",
    "Teams regularly engage in continuous improvement, applying Lean and Agile practices as part of daily work. Employees take ownership of problem-solving and process optimization within their teams. Collaboration across teams increases. Successes are celebrated and communicated to build momentum. Engagement surveys indicate growing involvement.",
    "Engagement is high and widespread, with empowered teams driving improvement initiatives aligned with organizational goals. Cross-team and cross-functional collaboration is common. Employees are motivated by meaningful recognition and growth opportunities. Leadership actively supports and coaches engagement. Continuous improvement becomes part of the culture.",
    "Team engagement is a strategic asset fueling innovation and operational excellence. Teams autonomously initiate and lead improvements with broad organizational support. Engagement is measured, analyzed, and continuously enhanced. Employees are passionate Lean/Agile advocates and culture carriers. The organization excels in sustaining high engagement levels."
  ]
},

// 12. Value Stream Mapping — IT & Software
{
  dimensionName: "Value Stream Mapping",
  sectorName: "IT & Software",
  levels: [
    "Value stream mapping (VSM) is unfamiliar or rarely used. Processes are fragmented, with limited visibility into end-to-end workflows. Bottlenecks and waste remain hidden. Improvement efforts target isolated tasks. Lack of process transparency limits problem-solving.",
    "Some teams begin to apply VSM to specific projects or processes. Maps are often incomplete or outdated. Frontline involvement is limited. Awareness of process flow and waste increases but application is inconsistent. VSM results are not always linked to action plans.",
    "VSM is regularly used across teams to visualize workflows, identify bottlenecks, and prioritize improvements. Cross-functional teams collaborate in mapping exercises. Maps are maintained and updated as living documents. Improvement initiatives are guided by VSM insights. Transparency improves process understanding.",
    "VSM is integrated into organizational improvement frameworks. Value streams extend across departments and include upstream and downstream partners. Data-driven insights enrich maps, enabling predictive analysis. Continuous review and refinement of value streams support strategic decisions. VSM drives alignment and collaboration.",
    "VSM is embedded in IT culture and workflows, supported by real-time data visualization and analytics. End-to-end value streams include external partners and customers. Value stream innovation drives competitive differentiation. The organization shares VSM best practices externally and leads industry standards. Continuous flow and value delivery are optimized dynamically."
  ]
},

// 13. Process Flow Efficiency — IT & Software
{
  dimensionName: "Process Flow Efficiency",
  sectorName: "IT & Software",
  levels: [
    "Process flows are ad hoc and inefficient, often causing delays, rework, and bottlenecks. Handoffs between teams are unclear or inconsistent. Siloed working inhibits flow and collaboration. Work prioritization is unclear. Customer impact is often negative.",
    "Process flows improve with basic standardization and better handoffs in some teams. Workflow visualization tools such as Kanban boards start to be used. Cross-team communication improves but is uneven. Bottlenecks are identified but not always resolved. Efficiency gains are localized.",
    "Process flows are actively managed and optimized using Lean and Agile principles. Work is prioritized based on value and dependencies. Visual management supports flow transparency. Teams collaborate to remove bottlenecks and smooth delivery. Customer outcomes improve.",
    "Process flow efficiency is integrated across teams and functions. Workloads are leveled and synchronized with business priorities. Continuous monitoring and automation optimize flow. Feedback loops enable rapid adjustment to changing demands. Flow efficiency is a key performance indicator.",
    "Near-perfect process flow is sustained through advanced automation, AI, and real-time coordination. Cross-organizational flow integration with partners enhances responsiveness. Continuous innovation improves flow adaptively. Flow excellence drives customer satisfaction and competitive advantage."
  ]
},

// 14. Standard Work / SOPs — IT & Software
{
  dimensionName: "Standard Work / SOPs",
  sectorName: "IT & Software",
  levels: [
    "Standard work and procedures are limited or undocumented. Teams rely on tribal knowledge and informal practices. Variability and errors are frequent. Training is inconsistent. Process quality suffers.",
    "Some processes are documented with basic SOPs or checklists. Usage is uneven and adherence varies by team. Updates and revisions are irregular. Training on standard work begins but lacks depth. Variability decreases marginally.",
    "Documented standard work covers key IT processes such as deployment, testing, and incident management. Teams regularly follow SOPs, which are reviewed and updated with team input. Training aligns with standards. Audits or peer reviews monitor compliance. Standard work supports quality and efficiency.",
    "Standard work is comprehensive, integrated with digital tools, and embedded into daily routines. Continuous improvement updates SOPs dynamically. Deviations trigger immediate review and corrective actions. Training is continuous and role-based. Standard work fosters consistency and agility.",
    "Standard work is adaptive, data-driven, and continuously refined. Digital SOPs support easy access and real-time updates. Training and coaching sustain high compliance. Standard work extends to partners and suppliers. It enables high reliability, innovation, and operational excellence."
  ]
},

// 15. Visual Management — IT & Software
{
  dimensionName: "Visual Management",
  sectorName: "IT & Software",
  levels: [
    "Visual management tools are scarce or absent. Teams rely on verbal or textual communication. Visibility into work status and issues is low. Delays and miscommunication are frequent. Problem identification is reactive.",
    "Basic visual tools such as whiteboards or electronic task boards are introduced in some teams. Work-in-progress and issue status are partially visible. Usage is inconsistent and sometimes manual. Visual management is event-driven rather than continuous. Teams begin to reference visuals.",
    "Visual management is widely adopted using digital Kanban boards, dashboards, and metrics. Workflows and impediments are visible in real time. Teams use visuals to coordinate work and escalate problems. Visual tools support daily stand-ups and retrospectives. Transparency improves collaboration.",
    "Visual management is integrated across IT teams and functions, supporting strategic and operational goals. Advanced dashboards provide predictive insights. Leadership uses visual data to coach and make decisions. Visual management drives rapid response and continuous improvement. Visuals are interactive and role-based.",
    "Visual management is embedded enterprise-wide with real-time, interactive, and predictive capabilities. Data visualization tools integrate multiple data sources and stakeholders. Visual culture fosters transparency, empowerment, and innovation. The organization benchmarks and leads visual management best practices. Visuals drive performance excellence."
  ]
},

// 16. 5S Implementation — IT & Software
{
  dimensionName: "5S Implementation",
  sectorName: "IT & Software",
  levels: [
    "Digital and physical workspaces are cluttered and disorganized, causing inefficiencies. File management, tool usage, and workstation organization are inconsistent. Awareness of 5S principles is low. Workspace optimization is reactive and ad hoc.",
    "Some teams begin applying 5S concepts such as sorting files, labeling repositories, and organizing desks. Practices are inconsistent and localized. Training and coaching on 5S start but lack reach. Benefits are recognized but not fully realized.",
    "5S practices are standardized and routinely applied across IT teams, including digital workspace organization and codebase hygiene. Teams conduct regular audits and continuous improvements. 5S training is embedded in onboarding and development. Workspace efficiency and quality improve.",
    "5S is deeply integrated with Lean/Agile practices and operational excellence programs. Digital tools support sustainment and monitoring. Teams innovate to optimize workflows and eliminate waste. Leadership models and reinforces 5S behaviors. Culture embraces discipline and order.",
    "5S excellence drives continuous innovation and operational agility. Digital and physical workspaces are optimized dynamically using automation and AI. Teams share best practices internally and externally. 5S is a source of pride and competitive differentiation. The organization benchmarks 5S maturity."
  ]
},

// 17. Kanban/Pull Systems — IT & Software
{
  dimensionName: "Kanban/Pull Systems",
  sectorName: "IT & Software",
  levels: [
    "Work management lacks formal pull systems; tasks are assigned in a push manner leading to overload and bottlenecks. Prioritization is unclear and often reactive. Teams struggle with work-in-progress (WIP) limits, causing delays and rework. Workflow visibility is minimal, impairing flow management.",
    "Basic Kanban boards or task queues are introduced in some teams. Work-in-progress limits begin to be recognized but are inconsistently applied. Prioritization improves but remains ad hoc. Pull concepts are understood by a few but not institutionalized. Teams start to see flow benefits.",
    "Kanban and pull systems are broadly implemented with clear WIP limits and prioritized backlogs. Teams use pull signals to manage workload and reduce bottlenecks. Flow metrics like cycle time and lead time are tracked and improved. Collaboration improves across teams managing shared work. Pull systems support sustainable delivery.",
    "Pull systems are integrated across multiple teams and value streams, enabling synchronized workflow management. Advanced visual boards and digital tools provide real-time status and forecasting. Teams dynamically adjust workload based on capacity and demand. Continuous improvement focuses on flow efficiency. Pull systems contribute to predictable and reliable delivery.",
    "Pull systems are optimized with AI-driven demand forecasting and automatic workflow adjustments. Workflows dynamically adapt to changing priorities and capacity. Pull extends beyond IT to customer and supplier collaboration. Continuous innovation sustains flow optimization. Pull systems are recognized as industry best practice."
  ]
},

// 18. Quick Changeover (SMED) — IT & Software
{
  dimensionName: "Quick Changeover (SMED)",
  sectorName: "IT & Software",
  levels: [
    "Changeovers such as environment switches, deployments, or role transitions are slow and error-prone. Procedures are undocumented or informal. Change delays affect productivity and quality. Teams lack awareness of quick changeover concepts.",
    "Basic SMED concepts are introduced to separate internal and external change tasks. Some standardization and checklists are developed. Improvements reduce changeover times in isolated projects. Awareness grows but application is uneven. Changeover delays remain a challenge.",
    "Standardized and documented changeover procedures are widely adopted. Teams train on quick changeover techniques and apply them consistently. Changeover times reduce significantly, improving deployment frequency and responsiveness. Continuous feedback drives further improvements. Changeovers become predictable and less disruptive.",
    "Changeover processes are optimized using automation, scripting, and parallel execution. Procedures are regularly reviewed and improved based on data and operator feedback. Changeovers support agile release cycles and rapid experimentation. Safety and quality are maintained throughout. Changeover excellence is a competitive enabler.",
    "Changeover capability is world-class, leveraging continuous integration/continuous deployment (CI/CD) pipelines, infrastructure as code, and AI-driven automation. Changeovers are near-instantaneous and error-proof. Teams innovate change processes, setting industry standards. Changeover agility drives business responsiveness and innovation speed."
  ]
},

// 19. Error-Proofing (Poka-Yoke) — IT & Software
{
  dimensionName: "Error-Proofing (Poka-Yoke)",
  sectorName: "IT & Software",
  levels: [
    "Errors and defects such as bugs, misconfigurations, or documentation mistakes occur frequently and are detected late. Prevention mechanisms are absent. Issue resolution is reactive and time-consuming. Quality assurance relies heavily on manual inspection.",
    "Basic error-proofing measures like code reviews, checklists, and automated tests are introduced. Awareness of common errors increases. Some defect prevention reduces rework. Implementation of poka-yoke is limited and inconsistent. Quality improves but defects persist.",
    "Error-proofing is embedded into development and operational processes with automated testing, linting, and deployment gates. Teams actively design error prevention into workflows. Root cause analysis drives targeted poka-yoke improvements. Quality metrics improve steadily. Defects and incidents decline.",
    "Advanced error-proofing uses AI-assisted code analysis, automated rollback, and self-healing systems. Error-proofing extends to documentation, configuration, and monitoring. Teams collaborate proactively to prevent errors system-wide. Quality assurance is continuous and integrated. Error-proofing drives reliability and customer satisfaction.",
    "Error-proofing is predictive and adaptive, leveraging machine learning to detect and prevent defects before deployment. Systems self-correct and learn from anomalies. Error-proofing innovation sustains near-zero defect rates. Quality is built-in and continuously improved. The organization sets benchmarks in IT quality assurance."
  ]
},

// 20. Process Transparency — IT & Software
{
  dimensionName: "Process Transparency",
  sectorName: "IT & Software",
  levels: [
    "Processes are opaque with limited visibility into progress, risks, or issues. Stakeholders often rely on informal updates or assumptions. Delays and bottlenecks go unnoticed until problems escalate. Documentation is incomplete or inaccessible. Communication gaps create uncertainty.",
    "Some teams use dashboards, reports, or project management tools to provide partial visibility. Updates occur regularly but may be delayed or incomplete. Transparency varies between projects and teams. Stakeholders gain limited insight into process status and risks. Process understanding improves but is uneven.",
    "Process transparency is widespread with real-time dashboards and collaborative tools. Workflows, impediments, and risks are visible to all relevant stakeholders. Teams use transparency to manage dependencies and escalate issues proactively. Documentation and knowledge repositories are maintained and accessible. Transparency supports coordination and trust.",
    "Process transparency integrates across teams, departments, and tools providing end-to-end visibility. Predictive analytics and alerts highlight risks and performance deviations early. Stakeholders collaborate transparently on adjustments and improvements. Transparency is a cornerstone of governance and continuous improvement. Data quality and access are rigorously managed.",
    "Full transparency is achieved with integrated real-time data, advanced analytics, and collaborative platforms extending beyond the organization. Transparency enables anticipatory management and rapid innovation. Stakeholders at all levels share ownership of process performance. Transparency is a strategic asset and cultural norm. The organization leads in open and accountable operations."
  ]
},
// 21. Quality-at-Source — IT & Software
{
  dimensionName: "Quality-at-Source",
  sectorName: "IT & Software",
  levels: [
    "Quality checks are performed mainly at the end of the development cycle, leading to late discovery of defects. Developers and testers work in silos, and ownership of quality is unclear. Quality issues cause rework and delays. Preventive quality measures are absent or informal.",
    "Basic quality-at-source practices such as unit testing and code reviews are introduced. Teams recognize the importance of early defect detection but struggle with consistent implementation. Quality ownership begins to shift towards developers. Some improvements reduce defects but quality escapes remain.",
    "Quality is built into development workflows through automated testing, continuous integration, and peer reviews. Teams proactively identify and fix defects early. Quality metrics are tracked and used to drive improvements. Ownership of quality is shared across the team. Quality-at-source becomes standard practice.",
    "Advanced quality practices including behavior-driven development, test-driven development, and continuous deployment are widely adopted. Quality is embedded in design and architecture decisions. Teams collaborate closely to prevent defects and ensure customer satisfaction. Quality metrics are linked to business outcomes. Quality culture is strong.",
    "Quality-at-source is predictive and adaptive, leveraging AI-driven testing and monitoring. Defects are prevented or detected before impacting customers. Quality excellence is recognized industry-wide. Continuous learning and innovation drive sustainable quality improvements. Quality is integral to organizational identity."
  ]
},

// 22. Level Loading / Heijunka — IT & Software
{
  dimensionName: "Level Loading / Heijunka",
  sectorName: "IT & Software",
  levels: [
    "Workload is uneven and unpredictable, causing resource overloads and idle times. Project schedules and task assignments are reactive. Prioritization is unclear, leading to context switching and delays. Capacity planning is minimal.",
    "Basic workload leveling techniques begin to be applied in some teams. Backlogs and sprints are planned to smooth work but variability remains. Teams recognize the impact of uneven workloads but struggle to manage it fully. Resource allocation improves but lacks integration.",
    "Level loading is systematically applied using sprint planning, capacity forecasting, and backlog refinement. Work is balanced across teams to optimize flow and reduce multitasking. Load adjustments are made proactively based on feedback and metrics. Resource planning is integrated with demand forecasts.",
    "Level loading is integrated across multiple teams and programs, aligning capacity with strategic priorities. Dynamic adjustments use real-time data and predictive analytics. Teams flexibly allocate resources to manage peak loads and bottlenecks. Level loading supports sustainable pace and high performance.",
    "Level loading is predictive, automated, and optimized through AI and advanced analytics. Workflows dynamically adapt to changing demand and capacity. Level loading spans partners and customers, enabling synchronized delivery. Continuous improvement refines load balancing strategies. Level loading excellence drives agility and competitiveness."
  ]
},

// 23. TPM (Total Productive Maintenance) — IT & Software
{
  dimensionName: "TPM (Total Productive Maintenance)",
  sectorName: "IT & Software",
  levels: [
    "System reliability issues cause frequent outages or slowdowns, impacting productivity. Maintenance and support are reactive. Preventive practices are minimal or absent. Monitoring tools are limited. Downtime is poorly managed.",
    "Basic maintenance and monitoring tools are implemented, supporting incident detection and resolution. Teams begin to schedule preventive maintenance activities. System health data is collected but underutilized. Maintenance processes remain manual and reactive. Reliability improves marginally.",
    "TPM principles are applied to IT infrastructure and software operations. Automated monitoring and alerting detect issues proactively. Teams perform regular preventive maintenance and capacity planning. Reliability and uptime improve. Root cause analysis addresses recurring issues.",
    "TPM is integrated into DevOps and IT service management practices. Predictive maintenance leverages data analytics and AI to anticipate failures. Continuous improvement reduces downtime and enhances resilience. Maintenance processes are automated and optimized. Reliability is a key performance metric.",
    "TPM excellence supports near-zero downtime with self-healing systems and autonomous maintenance. Advanced analytics predict and prevent issues before impact. TPM practices extend across IT supply chains and partners. Reliability is a strategic differentiator. The organization leads in resilient IT operations."
  ]
},

// 24. End-to-End Value Stream Integration — IT & Software
{
  dimensionName: "End-to-End Value Stream Integration",
  sectorName: "IT & Software",
  levels: [
    "IT functions operate in silos with limited coordination across development, testing, deployment, and operations. Processes are fragmented, causing handoff delays and errors. Visibility across the value stream is poor. Customer impact is negative. Accountability is unclear.",
    "Some coordination and integration occur between key IT functions. Shared goals and basic process handoffs improve flow. Information systems begin to support cross-functional collaboration. Value stream awareness grows but remains limited. Process inefficiencies persist.",
    "Value streams are mapped and managed end-to-end, covering development to deployment and support. Cross-functional teams collaborate regularly. Metrics and improvement initiatives focus on flow and customer value. Integration with business and customer processes improves. Accountability is clearly assigned.",
    "End-to-end value stream integration extends to suppliers, partners, and customers. Continuous flow and feedback loops enable rapid response to change. Data and tools support real-time visibility and coordination. Cross-organizational collaboration fosters innovation and alignment. Value stream optimization drives strategic advantage.",
    "Value stream integration is seamless, dynamic, and predictive, supported by digital platforms and AI. The entire ecosystem operates as a unified value delivery network. Collaboration and continuous improvement extend beyond organizational boundaries. The organization benchmarks and shares value stream best practices. Customer-centric flow is optimized continuously."
  ]
},

// 25. Waste Identification and Elimination — IT & Software
{
  dimensionName: "Waste Identification and Elimination",
  sectorName: "IT & Software",
  levels: [
    "Waste such as rework, delays, unnecessary features, and handoffs are common and unrecognized. Processes are inefficient and inconsistent. Teams react to symptoms rather than eliminating root causes. Awareness of Lean waste types is low. Waste reduction is not prioritized.",
    "Teams begin identifying common wastes during retrospectives and improvement events. Some waste reduction initiatives are implemented but often isolated and short-lived. Awareness of waste types grows. Tools for waste identification and elimination are introduced but inconsistently applied. Waste remains a significant challenge.",
    "Waste elimination becomes systematic, supported by Lean tools and data analysis. Teams regularly identify and remove non-value-added activities. Cross-functional collaboration targets systemic waste. Metrics track waste reduction progress. Continuous improvement cycles focus on waste elimination.",
    "Waste elimination is embedded in daily management systems and cultural norms. Advanced analytics identify hidden wastes and improvement opportunities. Waste reduction includes environmental and energy considerations. Continuous learning accelerates waste elimination. Teams are accountable for sustaining waste-free processes.",
    "Waste elimination is strategic and continuous, driving operational excellence and sustainability. Innovation proactively prevents waste before it occurs. The organization benchmarks and shares best practices in waste reduction. Lean culture ensures all employees detect and address waste proactively. Waste minimization supports competitive advantage."
  ]
},

// 26. Handoffs and Queue Reduction — IT & Software
{
  dimensionName: "Handoffs and Queue Reduction",
  sectorName: "IT & Software",
  levels: [
    "Handoffs between teams or departments are frequent, unclear, and error-prone, causing delays and misunderstandings. Queues for code review, testing, or deployment build up, creating bottlenecks. Communication during handoffs is inconsistent or informal, leading to lost information. Teams often work in isolation without a shared understanding of workflows. Customer satisfaction suffers due to delays and quality issues.",
    "Basic protocols for handoffs and queue management are introduced in some teams. Communication improves but remains inconsistent and localized. Queues are monitored sporadically, and delays are sometimes addressed reactively. Awareness of the impact of handoffs and queues on flow grows. Teams start experimenting with improvements but lack standardized processes.",
    "Standardized handoff procedures and queue limits are implemented across teams, reducing errors and delays. Workflows are mapped to identify bottlenecks, and teams collaborate to smooth transitions. Communication during handoffs is structured and transparent. Queue lengths and wait times are regularly monitored and managed. Continuous improvement targets handoff efficiency.",
    "Handoff and queue management are integrated into continuous delivery pipelines and agile workflows. Automated tools reduce manual handoffs and enable real-time queue visibility. Teams proactively balance workloads and coordinate releases. Metrics track queue health and flow efficiency across the value stream. Leadership supports cross-team collaboration to optimize throughput.",
    "Handoffs and queues are minimized through end-to-end automation, integrated toolchains, and predictive workload management. Workflows dynamically adjust to eliminate bottlenecks and delays. Collaboration extends across internal teams and external partners for seamless delivery. Continuous feedback and innovation sustain optimal flow. The organization benchmarks and shares best practices."
  ]
},

// 27. Documentation Discipline — IT & Software
{
  dimensionName: "Documentation Discipline",
  sectorName: "IT & Software",
  levels: [
    "Documentation is incomplete, inconsistent, or outdated. Teams rely heavily on tacit knowledge and verbal communication. Knowledge loss and misunderstandings are common. Documentation is not prioritized or enforced. Training and onboarding are hindered by poor documentation.",
    "Basic documentation standards and templates are introduced. Some teams maintain up-to-date technical and process documentation. Documentation efforts are reactive and vary widely in quality. Employees recognize documentation's importance but struggle with consistency. Documentation reviews and audits begin sporadically.",
    "Documentation discipline is formalized, with clear policies and accountability. Teams maintain comprehensive and current documentation covering code, processes, and configurations. Documentation supports training, compliance, and problem-solving. Automated tools assist with documentation management. Documentation quality is regularly audited.",
    "Documentation is integrated with development workflows and knowledge management systems. Continuous updates are encouraged and facilitated by automation and collaboration platforms. Documentation is accessible, searchable, and standardized across teams. Documentation contributes to process improvement and innovation. Documentation metrics inform management decisions.",
    "Documentation excellence is strategic, continuously improved, and embedded in culture. AI-powered tools auto-generate, validate, and update documentation in real time. Documentation supports compliance, knowledge transfer, and innovation at scale. The organization leads in documentation practices and shares expertise externally. Documentation enables agility and operational excellence."
  ]
},

// 28. Digitization of Workflows — IT & Software
{
  dimensionName: "Digitization of Workflows",
  sectorName: "IT & Software",
  levels: [
    "Workflows are largely manual or fragmented across disconnected tools. Data entry is repetitive and error-prone. Process tracking and reporting are inconsistent or absent. Teams struggle with transparency and efficiency. Digital adoption is minimal.",
    "Selective digitization begins in areas such as issue tracking, source control, and CI/CD pipelines. Some workflows become standardized digitally but lack integration. Teams receive basic training on digital tools. Workflow digitization is project-specific and inconsistent. Manual processes remain prevalent.",
    "Digitization expands across development, testing, deployment, and support workflows. Integrated toolchains enable automation and collaboration. Data capture is systematic, improving transparency and traceability. Digital workflows support continuous improvement and agile practices. Employee digital skills improve.",
    "End-to-end digitization connects IT workflows internally and with business and customer systems. Advanced tools support real-time monitoring, analytics, and decision-making. Automation reduces manual tasks and errors. Teams continuously optimize digital workflows. Digitization aligns with strategic goals.",
    "Digital workflows are intelligent, adaptive, and seamlessly integrated across ecosystems. AI, machine learning, and robotic process automation optimize processes dynamically. Digital transformation fosters innovation, agility, and resilience. The organization leads in digital maturity and shares best practices. Digitization drives business value and competitive advantage."
  ]
},

// 29. Lean Integrated into Corporate Strategy — IT & Software
{
  dimensionName: "Lean Integrated into Corporate Strategy",
  sectorName: "IT & Software",
  levels: [
    "Lean and Agile principles are absent or peripheral in corporate IT strategy. Improvement initiatives are fragmented and tactical. Leadership lacks clear vision or commitment to Lean transformation. Resource allocation is ad hoc. Lean is seen as a toolkit rather than a strategic approach.",
    "Lean concepts begin to appear in strategy discussions and pilot projects. Some leadership awareness and support exist but lack coherence and alignment. Resource planning selectively supports Lean activities. Strategic alignment is limited to isolated initiatives. Lean remains a bottom-up or middle management effort.",
    "Lean is formally embedded in IT strategy with clear goals, roadmaps, and leadership commitment. Improvement initiatives align with business objectives. Resources and governance structures support Lean transformation. Lean metrics are integrated into performance management. Alignment between Lean and corporate strategy strengthens.",
    "Lean drives IT strategic planning, innovation, and capability development. Cross-functional collaboration and customer focus shape Lean initiatives. Leadership sponsors continuous improvement as a strategic imperative. Lean supports organizational agility and growth. Lean is embedded in governance and culture.",
    "Lean transformation is a core pillar of IT's corporate strategy and identity. The organization leads in Lean innovation, culture, and capability. Lean informs investment decisions, partnerships, and customer engagement. Continuous learning and adaptation sustain strategic advantage. The organization benchmarks and influences industry Lean maturity."
  ]
},

// 30. Hoshin Kanri or Strategy Deployment — IT & Software
{
  dimensionName: "Hoshin Kanri or Strategy Deployment",
  sectorName: "IT & Software",
  levels: [
    "Strategy deployment is informal or absent, leading to unclear goals and misaligned initiatives. Communication of strategic priorities is top-down and inconsistent. Departments work independently without shared objectives. Accountability is weak. Lean or Agile goals are not systematically cascaded.",
    "Basic strategy deployment practices are introduced, including goal setting and periodic reviews. Some alignment between strategy and projects exists but is limited. Communication improves but lacks clarity or frequency. Feedback loops are inconsistent. Coordination between departments begins.",
    "Structured strategy deployment processes such as Hoshin Kanri are implemented. Goals cascade through teams with clear metrics and accountability. Regular reviews and adjustments ensure progress. Cross-functional collaboration supports execution. Communication is transparent and consistent.",
    "Strategy deployment is dynamic, data-driven, and integrated with Lean/Agile practices. Real-time metrics and dashboards track progress and risks. Leadership engagement and feedback loops enable rapid course corrections. Strategy aligns with changing market and technology trends. Deployment processes foster innovation and agility.",
    "Strategy deployment is fully integrated, participatory, and adaptive. Continuous alignment and accountability drive sustained Lean transformation success. Digital platforms support transparent communication and progress monitoring. The organization demonstrates strategic agility and leadership. Strategy deployment is a source of competitive advantage."
  ]
},
// 31. Policy Deployment — IT & Software
{
  dimensionName: "Policy Deployment",
  sectorName: "IT & Software",
  levels: [
    "Policies related to Lean, Agile, or continuous improvement are unclear, poorly communicated, or nonexistent. Employees are unaware of expectations or standards. Policy changes are reactive and not aligned with strategy. Compliance and enforcement are inconsistent.",
    "Initial efforts to clarify and communicate relevant policies are made. Some teams develop and adopt policies supporting Lean/Agile practices. Policy deployment varies across the organization. Employees begin to recognize expectations, but application is uneven. Feedback on policies is limited.",
    "Policies are formally deployed and linked to Lean/Agile strategy and performance goals. Teams are trained on relevant policies and understand their importance. Regular reviews ensure policies remain current. Feedback mechanisms enable continuous improvement. Policy adherence is monitored and reported.",
    "Policy deployment is proactive, inclusive, and data-driven. Cross-functional teams participate in policy development and deployment. Policies are integrated into daily work and supported by digital tools. Policy impact is evaluated regularly. Best practices are shared across teams.",
    "Policy deployment is strategic, adaptive, and continuously improved. Digital platforms automate policy communication, training, and compliance monitoring. Employees are engaged in policy innovation and benchmarking. Policy deployment supports agility, risk management, and sustained excellence. The organization leads in policy deployment best practices."
  ]
},

// 32. Alignment Across Functions — IT & Software
{
  dimensionName: "Alignment Across Functions",
  sectorName: "IT & Software",
  levels: [
    "Functions and departments operate independently with limited alignment. Goals, metrics, and priorities are siloed. Collaboration is rare and often forced by crisis. Misalignment causes delays, rework, and conflict. Customers experience inconsistent outcomes.",
    "Some cross-functional collaboration and alignment efforts emerge, often around key projects. Shared goals or metrics are piloted. Alignment varies by initiative and leadership commitment. Communication improves but is inconsistent. Benefits are recognized but limited in scope.",
    "Cross-functional alignment is established through shared objectives, integrated planning, and regular coordination. Teams collaborate on process improvement and problem-solving. Alignment is measured and managed. Customers benefit from more consistent and seamless experiences. Leadership supports and models cross-functional collaboration.",
    "Alignment across functions is dynamic and strategic. Integrated management systems and digital tools support real-time coordination. Cross-functional teams lead key initiatives. Continuous improvement and learning strengthen alignment. Alignment is recognized as essential to performance and innovation.",
    "Cross-functional alignment is a cultural norm and strategic advantage. Structures and systems enable seamless collaboration internally and with external partners. Alignment is continuously optimized based on data and feedback. The organization sets benchmarks for alignment excellence. Customers receive integrated, high-value outcomes."
  ]
},

// 33. Governance and Accountability — IT & Software
{
  dimensionName: "Governance and Accountability",
  sectorName: "IT & Software",
  levels: [
    "Governance structures and accountability for Lean or Agile initiatives are absent or unclear. Roles and responsibilities are undefined or ignored. Decision-making is ad hoc and lacks transparency. Performance is not measured or managed. Issues escalate slowly and unpredictably.",
    "Basic governance and accountability mechanisms are introduced, often focused on project delivery. Roles and responsibilities begin to be defined. Performance reviews and progress tracking are piloted. Accountability is inconsistent and depends on individual leaders. Transparency is limited.",
    "Formal governance structures are established for Lean/Agile management. Roles, responsibilities, and escalation paths are clear and communicated. Regular reviews track progress and address issues. Accountability is embedded in daily management. Governance supports continuous improvement.",
    "Governance is integrated and agile, enabling rapid decision-making and adaptation. Digital tools provide real-time visibility and tracking. Cross-functional accountability is emphasized. Leadership models transparency and accountability. Governance aligns with strategy and customer needs.",
    "Governance and accountability are strategic and continuously improved. Autonomous teams operate within clear guardrails. Digital governance platforms enable dynamic oversight and learning. The organization is recognized for governance excellence and agility. Governance drives sustained success and innovation."
  ]
},

// 34. Leadership Succession Planning — IT & Software
{
  dimensionName: "Leadership Succession Planning",
  sectorName: "IT & Software",
  levels: [
    "Succession planning is informal or absent. Leadership transitions are disruptive and unplanned. Talent pipelines are weak. Knowledge and culture loss occurs during transitions. The organization relies on ad hoc recruitment.",
    "Some leaders identify and mentor potential successors, but processes are inconsistent. Development plans for future leaders exist in select areas. Succession discussions occur but lack structure. Knowledge transfer is limited. Leadership gaps persist.",
    "Succession planning is formalized with structured talent identification, development, and transition processes. Future leaders are provided targeted learning and growth opportunities. Knowledge transfer and culture continuity are prioritized. Succession planning supports stability and growth.",
    "Succession planning is integrated with leadership development and workforce planning. High-potential talent pools are actively managed. Cross-functional and diverse leadership development is emphasized. Data and feedback guide succession strategies. The organization adapts smoothly to leadership changes.",
    "Succession planning is a strategic advantage, ensuring a resilient and adaptive leadership pipeline. AI-driven analytics support predictive talent management. Leadership succession sustains Lean/Agile culture and innovation. The organization benchmarks and shares best practices. Leadership transitions are seamless and value-adding."
  ]
},

// 35. Risk Management — IT & Software
{
  dimensionName: "Risk Management",
  sectorName: "IT & Software",
  levels: [
    "Risk management is reactive and inconsistent. Risks are identified late or only after issues arise. Processes for risk assessment and mitigation are poorly defined or absent. Teams are unprepared for disruptions. Risk awareness is low.",
    "Basic risk management practices are introduced, such as risk registers and issue tracking. Some teams conduct risk assessments, but application is inconsistent. Risk communication and escalation improve but remain informal. Mitigation efforts are often ad hoc.",
    "Risk management is formalized with systematic identification, assessment, and mitigation. Risks are regularly reviewed and managed throughout project and process lifecycles. Risk ownership is defined. Lessons learned from risks inform improvements. Risk management supports business continuity.",
    "Risk management is integrated with strategic planning and daily management. Predictive analytics and real-time monitoring enable proactive risk mitigation. Cross-functional teams collaborate on risk reduction. Risk culture supports innovation and resilience. Risk management is a performance differentiator.",
    "Risk management is dynamic, adaptive, and predictive. AI and automation enable real-time risk detection and response. Risk management extends across the value chain and ecosystem. The organization is a benchmark for risk excellence. Risk management sustains innovation and competitive advantage."
  ]
},

// 36. KPI Definition and Alignment — IT & Software
{
  dimensionName: "KPI Definition and Alignment",
  sectorName: "IT & Software",
  levels: [
    "Key performance indicators (KPIs) are undefined, poorly aligned, or not tracked. Teams lack visibility into performance. Metrics are inconsistent or focused on activity rather than outcomes. Decision-making is based on opinion rather than data. Accountability is weak.",
    "Basic KPIs are defined for some teams or projects. Metrics focus on delivery, quality, or customer satisfaction. Tracking and reporting are inconsistent. Alignment of KPIs with organizational goals is limited. Data quality varies. Teams begin to use metrics in decision-making.",
    "KPIs are defined, tracked, and aligned across teams and projects. Metrics cover value, flow, quality, and customer outcomes. KPIs support decision-making and continuous improvement. Dashboards and reports provide transparency. KPI alignment strengthens accountability and performance.",
    "KPI management is integrated and data-driven, with automated tracking and visualization. KPIs cascade from strategy to daily operations. Teams use metrics for proactive management and learning. KPI reviews drive alignment and performance improvement. Metrics inform investment and resource allocation.",
    "KPI excellence is strategic and continuously optimized. Advanced analytics and AI drive insight and prediction. KPI alignment spans the value chain, partners, and customers. The organization benchmarks KPI practices. Metrics drive business value, agility, and competitiveness."
  ]
},

// 37. Daily Management Systems — IT & Software
{
  dimensionName: "Daily Management Systems",
  sectorName: "IT & Software",
  levels: [
    "Daily management is unstructured or ad hoc. Teams lack regular routines for performance review, issue escalation, or continuous improvement. Communication is inconsistent. Operational problems persist unresolved. Management relies on firefighting.",
    "Basic daily management routines such as stand-ups and check-ins are introduced. Teams review progress and address issues, but routines are not standardized. Problem escalation and resolution improve but remain inconsistent. Learning from daily management is limited.",
    "Structured daily management systems are adopted, including standardized meetings, dashboards, and issue tracking. Teams regularly review performance, escalate problems, and share learnings. Daily management supports alignment and continuous improvement. Communication and accountability improve.",
    "Daily management is integrated and automated with real-time dashboards, alerts, and collaboration tools. Teams use data for proactive management and learning. Escalation and issue resolution are rapid and effective. Daily management sustains operational excellence. Leaders coach and support daily routines.",
    "Daily management systems are intelligent, adaptive, and predictive. AI and automation drive proactive management and learning. Systems connect teams, partners, and customers. Daily management sustains high performance and innovation. The organization benchmarks daily management best practices."
  ]
},

// 38. Performance Reviews — IT & Software
{
  dimensionName: "Performance Reviews",
  sectorName: "IT & Software",
  levels: [
    "Performance reviews are infrequent, subjective, or disconnected from Lean/Agile goals. Feedback is limited and backward-looking. Improvement opportunities are missed. Employees see reviews as compliance rather than development. Recognition and accountability are weak.",
    "Some teams conduct regular performance reviews focused on delivery or individual contribution. Feedback is more structured but still inconsistent. Lean/Agile behaviors are occasionally recognized. Review outcomes are not always linked to development or improvement plans. Employees see some value in reviews.",
    "Performance reviews are systematic, objective, and aligned with Lean/Agile goals. Teams and individuals receive regular feedback on behaviors and results. Reviews inform development plans and improvement initiatives. Recognition and accountability are strengthened. Performance reviews support engagement and learning.",
    "Performance reviews are integrated with real-time feedback, coaching, and data analytics. Reviews focus on outcomes, behaviors, and continuous improvement. Employees participate in self and peer reviews. Review outcomes inform talent management and succession planning. Performance reviews drive growth and culture.",
    "Performance reviews are continuous, personalized, and predictive. AI-driven feedback and analytics support individual and team development. Reviews align with strategy and customer value. Performance management sustains high engagement and innovation. The organization leads in performance review practices."
  ]
},

// 39. Root Cause Analysis — IT & Software
{
  dimensionName: "Root Cause Analysis",
  sectorName: "IT & Software",
  levels: [
    "Problem-solving focuses on symptoms rather than root causes. Issues recur, causing frustration and inefficiency. Teams lack structured tools or methods for root cause analysis. Solutions are often short-term fixes. Learning from problems is limited.",
    "Basic root cause analysis tools such as '5 Whys' or fishbone diagrams are introduced in some teams. Application is inconsistent and learning is localized. Teams begin to document problems and solutions. Root cause analysis is event-driven.",
    "Root cause analysis is systematic and embedded in improvement routines. Teams use structured methods to analyze incidents, defects, or failures. Solutions address underlying causes and are verified for effectiveness. Learning from problems is shared across teams. Root cause analysis drives process improvement.",
    "Root cause analysis is integrated with data analytics, automation, and continuous improvement systems. Teams proactively identify and address systemic issues. Cross-team collaboration enhances learning and prevention. Root cause analysis informs strategy and risk management. Improvement cycles are rapid and sustained.",
    "Root cause analysis is predictive and adaptive, leveraging AI and machine learning to prevent problems before they occur. The organization continuously learns from internal and external sources. Root cause analysis is a source of competitive advantage. The organization benchmarks and leads best practices."
  ]
},

// 40. Continuous Monitoring — IT & Software
{
  dimensionName: "Continuous Monitoring",
  sectorName: "IT & Software",
  levels: [
    "Monitoring of systems, processes, and outcomes is sporadic or manual. Issues are detected late, causing disruptions or failures. Metrics are limited or not tracked in real time. Teams rely on reactive problem-solving. Continuous improvement is hindered.",
    "Basic monitoring tools and practices are adopted in select areas. Teams monitor key metrics or system health, but data is limited or siloed. Alerts and dashboards improve visibility but are not always acted on. Monitoring supports incident response but is inconsistent.",
    "Continuous monitoring is implemented across systems, processes, and teams. Automated tools provide real-time data and alerts. Monitoring informs proactive management and improvement. Teams act on insights to prevent issues. Continuous monitoring supports reliability and performance.",
    "Continuous monitoring is integrated with analytics, automation, and business processes. Teams use predictive and prescriptive insights to optimize performance and mitigate risks. Monitoring extends across the value chain and customer experience. Continuous monitoring drives agility and competitiveness.",
    "Continuous monitoring is intelligent, adaptive, and strategic. AI and advanced analytics enable anticipatory management. Monitoring systems support innovation and transformation. The organization benchmarks monitoring practices. Continuous monitoring sustains high performance and resilience."
  ]
},
// 41. Dashboards and Metrics — IT & Software
{
  dimensionName: "Dashboards and Metrics",
  sectorName: "IT & Software",
  levels: [
    "Dashboards and metrics are absent or rarely used. Performance data is not visible to teams or leaders. Decisions rely on intuition or anecdotal evidence. Issues are identified late. Accountability and improvement are limited.",
    "Basic dashboards and metrics are introduced in select teams. Performance data is collected but not consistently shared or used. Metrics focus on activity rather than value. Dashboards are static and updated manually. Use of metrics to drive improvement is sporadic.",
    "Dashboards and metrics are standardized, automated, and widely used. Real-time performance data is visible to teams and leaders. Metrics cover value delivery, flow, and quality. Dashboards support decision-making and continuous improvement. Teams regularly review metrics to manage performance.",
    "Advanced dashboards integrate data from multiple systems and provide predictive and prescriptive insights. Dashboards are interactive and tailored to user roles. Metrics are aligned with strategy and customer value. Dashboards support proactive management and learning. Performance outcomes improve.",
    "Dashboards and metrics are intelligent, adaptive, and strategic. AI-driven analytics provide real-time insights across the value chain. Dashboards support innovation, agility, and competitiveness. The organization leads in dashboard and metrics practices. Data-driven culture is embedded."
  ]
},

// 42. Process Benchmarking — IT & Software
{
  dimensionName: "Process Benchmarking",
  sectorName: "IT & Software",
  levels: [
    "Process benchmarking is not practiced. Teams lack awareness of internal or external best practices. Improvement efforts are isolated and based on intuition. Competitive or industry standards are ignored. Learning is limited.",
    "Basic internal benchmarking begins, comparing performance across teams or projects. Some external comparisons are made, but methods are informal. Benchmarking data is collected sporadically. Teams begin to recognize the value of learning from others. Improvements are ad hoc.",
    "Process benchmarking is systematic and embedded in improvement routines. Teams compare processes and outcomes to internal and external benchmarks. Best practices are identified and adopted. Benchmarking informs goal setting and improvement initiatives. Learning accelerates.",
    "Advanced benchmarking includes industry, competitor, and cross-sector comparisons. Digital tools automate data collection and analysis. Teams participate in benchmarking networks and share best practices. Benchmarking drives innovation and strategic alignment. Outcomes are measured and sustained.",
    "Benchmarking is strategic, predictive, and continuous. AI and analytics enable real-time benchmarking across the ecosystem. The organization leads and influences industry benchmarking. Benchmarking outcomes drive transformation and competitive advantage. Benchmarking culture is sustained and recognized."
  ]
},

// 43. Learning from Incidents — IT & Software
{
  dimensionName: "Learning from Incidents",
  sectorName: "IT & Software",
  levels: [
    "Incidents, failures, or defects are managed reactively, with limited documentation or analysis. Teams may hide mistakes or assign blame. Lessons learned are not shared. Problems recur due to lack of learning. Culture discourages openness.",
    "Some teams begin documenting incidents and sharing lessons learned. Root cause analysis is performed on major issues. Learning is localized and often informal. Management starts to encourage transparency. Improvement actions are sometimes tracked.",
    "Learning from incidents is systematic, with structured reviews and root cause analysis. Lessons are shared across teams. Incident data informs improvement initiatives. Blame-free culture is promoted. Continuous learning reduces recurrence of problems.",
    "Learning from incidents is integrated with data analytics, automation, and knowledge management. Teams proactively seek opportunities to learn from near misses and small incidents. Learning outcomes drive process, technology, and behavior change. Learning culture is strong and visible.",
    "Learning from incidents is predictive, adaptive, and strategic. AI and advanced analytics identify learning opportunities in real time. Organization-wide systems capture, share, and act on lessons learned. Learning from incidents drives resilience, innovation, and competitive advantage."
  ]
},

// 44. Knowledge Sharing Systems — IT & Software
{
  dimensionName: "Knowledge Sharing Systems",
  sectorName: "IT & Software",
  levels: [
    "Knowledge is siloed within teams or individuals. Sharing of best practices, lessons learned, or technical expertise is informal or absent. Teams rely on tacit knowledge. Documentation and knowledge repositories are limited. Onboarding and problem-solving are hindered.",
    "Basic knowledge sharing systems such as wikis, forums, or shared drives are introduced. Some teams share documentation or lessons, but usage is inconsistent. Knowledge is sometimes outdated or hard to find. Management begins to encourage sharing. Benefits are localized.",
    "Knowledge sharing is formalized and supported by digital platforms. Teams regularly contribute to and use knowledge repositories. Best practices and lessons learned are captured and shared. Knowledge sharing supports onboarding, problem-solving, and innovation. Knowledge management is part of daily work.",
    "Advanced knowledge sharing systems integrate with workflows, automation, and collaboration tools. Knowledge is curated, updated, and easily accessible. Communities of practice and peer learning flourish. Knowledge sharing drives continuous improvement and agility. Leadership supports a knowledge-driven culture.",
    "Knowledge sharing is intelligent, adaptive, and predictive. AI curates and delivers knowledge in real time based on need. The organization leads in knowledge management practices. Knowledge sharing drives innovation, resilience, and market leadership. Knowledge culture is sustained and benchmarked."
  ]
},

// 45. Regular Kaizen Events — IT & Software
{
  dimensionName: "Regular Kaizen Events",
  sectorName: "IT & Software",
  levels: [
    "Kaizen or continuous improvement events are rare, ad hoc, or absent. Teams do not regularly review or improve processes. Improvement relies on crisis or external mandates. Momentum is lacking. Employees see improvement as management's job.",
    "Some teams hold periodic Kaizen events or retrospectives. Participation varies and outcomes are mixed. Events are often project-driven rather than continuous. Improvement actions may not be tracked or sustained. Employees begin to see the value of involvement.",
    "Regular Kaizen events are scheduled and integrated into team routines. Teams proactively identify and address improvement opportunities. Outcomes are tracked and celebrated. Employees participate actively in Kaizen. Continuous improvement is visible and valued.",
    "Kaizen is embedded in culture and management systems. Teams lead cross-functional Kaizen events. Digital tools support idea generation, prioritization, and implementation. Improvement actions are monitored and sustained. Leadership supports and recognizes Kaizen success.",
    "Kaizen is continuous, data-driven, and strategic. AI and advanced analytics identify opportunities for improvement in real time. Kaizen culture drives innovation, engagement, and competitiveness. The organization benchmarks Kaizen practices and leads in improvement excellence."
  ]
},

// 46. Sustaining Improvements — IT & Software
{
  dimensionName: "Sustaining Improvements",
  sectorName: "IT & Software",
  levels: [
    "Improvements are rarely sustained. Gains from projects or events erode over time. Standardization and follow-up are lacking. Teams revert to old habits. Employees are skeptical about continuous improvement.",
    "Some improvements are sustained through basic documentation or supervision. Follow-up is inconsistent. Standardization is limited and rarely updated. Management occasionally reviews improvement outcomes. Sustainability is variable.",
    "Processes are in place to sustain improvements, including standardized work, regular audits, and performance monitoring. Teams review and reinforce improvement outcomes. Training and coaching support sustainment. Improvement gains are measured and celebrated.",
    "Sustainment is integrated with digital tools, automation, and daily management systems. Teams continuously monitor, adjust, and improve processes to retain gains. Leadership reinforces sustainment through recognition and accountability. Sustainability is a performance metric.",
    "Sustaining improvements is strategic and adaptive. AI and advanced analytics monitor process performance and trigger sustainment actions. The organization benchmarks sustainment practices and supports a culture of continuous improvement. Gains are institutionalized and drive long-term value."
  ]
},

// 47. Standardization of Improvements — IT & Software
{
  dimensionName: "Standardization of Improvements",
  sectorName: "IT & Software",
  levels: [
    "Improvements are localized and not standardized across teams or projects. Teams work with varying processes and tools. Best practices are rarely shared. Lack of standardization leads to variability and errors. Improvement gains are not fully realized.",
    "Some improvements are standardized within teams or projects. Standard work is documented but not always updated or shared. Adoption of best practices is inconsistent. Management begins to promote standardization. Employees recognize the value but face barriers.",
    "Standardization of improvements is systematic and cross-functional. Teams collaborate to document and adopt best practices. Standard work is maintained, updated, and audited. Standardization supports quality, efficiency, and learning. Improvement gains are sustained and scaled.",
    "Standardization is integrated with digital platforms and automation. Standard work is easily accessible, continuously updated, and embedded in workflows. Cross-team collaboration ensures rapid adoption of improvements. Standardization supports agility and innovation.",
    "Standardization is strategic, adaptive, and intelligent. AI and advanced analytics support dynamic standardization and sharing of improvements. The organization benchmarks and leads in standardization practices. Standardization drives operational excellence and competitiveness."
  ]
},

// 48. Audit and Review Systems — IT & Software
{
  dimensionName: "Audit and Review Systems",
  sectorName: "IT & Software",
  levels: [
    "Audit and review systems are absent, informal, or reactive. Compliance is rarely checked. Issues are detected late or not at all. Employees see audits as punitive or irrelevant. Improvements are not tracked.",
    "Basic audit and review processes are introduced in some teams. Compliance is checked periodically but coverage and rigor are limited. Audit findings are inconsistently addressed. Employees begin to understand the value of audits.",
    "Audit and review systems are formalized and cover key processes and controls. Audits are scheduled, objective, and linked to improvement actions. Results are communicated and tracked. Employees are engaged in audit preparation and follow-up.",
    "Audit and review systems are integrated with digital tools, automation, and risk management. Audits are data-driven, continuous, and predictive. Employees participate in audit design and execution. Audit outcomes drive improvement and learning.",
    "Audit and review systems are strategic, adaptive, and intelligent. AI and advanced analytics enable real-time auditing and benchmarking. The organization leads in audit and review practices. Audits support transparency, accountability, and sustained excellence."
  ]
},

// 49. Continuous Improvement Mindset — IT & Software
{
  dimensionName: "Continuous Improvement Mindset",
  sectorName: "IT & Software",
  levels: [
    "Continuous improvement is not part of daily thinking. Employees focus on routine work and resist change. Improvement is seen as extra work or management's responsibility. Mindset hinders innovation and adaptation.",
    "Some employees and teams develop a basic improvement mindset, often driven by specific leaders or projects. Improvement activities are sporadic and not sustained. Mindset shifts are localized and fragile. Management begins to model improvement thinking.",
    "Continuous improvement mindset is evident across teams. Employees seek and act on improvement opportunities regularly. Learning, experimentation, and feedback are valued. Mindset supports agility and performance. Management reinforces improvement behaviors.",
    "Continuous improvement mindset is embedded in culture and supported by systems, training, and leadership. Employees challenge the status quo and drive change proactively. Innovation and learning are continuous and systematic. Mindset supports resilience and competitiveness.",
    "Continuous improvement mindset is strategic, adaptive, and continuously developed. The organization leads in improvement culture and innovation. Employees are empowered to drive change at all levels. Mindset sustains high performance and market leadership."
  ]
},

// 50. Coaching for Sustainment — IT & Software
{
  dimensionName: "Coaching for Sustainment",
  sectorName: "IT & Software",
  levels: [
    "Coaching to sustain improvements is absent or informal. Teams revert to old practices after changes. Coaches, if any, are focused on implementation rather than sustainment. Employees lack support for sustaining gains.",
    "Some coaching is provided to sustain improvements but is inconsistent and limited to key teams. Coaches support follow-up and review. Sustainment is uneven. Employees begin to see the value of coaching for sustainment.",
    "Coaching for sustainment is systematic, structured, and widely available. Coaches help teams embed improvements into daily work. Sustainment progress is tracked. Employees are encouraged and supported to maintain gains.",
    "Coaching for sustainment is integrated with management systems, automation, and digital tools. Coaches support continuous adaptation and learning. Sustainment is reinforced through coaching, recognition, and accountability.",
    "Coaching for sustainment is strategic, adaptive, and benchmarked. AI and advanced analytics support personalized coaching and sustainment actions. The organization leads in coaching for sustainment. Coaching drives resilience and long-term value."
  ]
},
// 51. Lean Knowledge Retention — IT & Software
{
  dimensionName: "Lean Knowledge Retention",
  sectorName: "IT & Software",
  levels: [
    "Lean knowledge is lost when employees leave or projects end. Documentation and sharing are inconsistent. Organizational memory is weak. Relearning and repeated mistakes are common. Retention is not prioritized.",
    "Some teams begin to retain Lean knowledge through documentation or knowledge bases. Retention is localized and dependent on individual effort. Onboarding includes some Lean content. Knowledge is at risk during transitions.",
    "Lean knowledge retention is systematic, supported by formal documentation, training, and knowledge sharing systems. Knowledge is transferred during onboarding and handovers. Retention is monitored and reviewed regularly.",
    "Lean knowledge retention is integrated with digital platforms, automation, and knowledge management. AI supports curation and distribution of Lean knowledge. Employees contribute to retention efforts. Retention is part of talent and succession planning.",
    "Lean knowledge retention is strategic, adaptive, and benchmarked. The organization leads in Lean knowledge management and sharing. Retention drives continuous improvement, innovation, and resilience. Knowledge is retained and grown across generations."
  ]
},

// 52. Talent Development for Lean — IT & Software
{
  dimensionName: "Talent Development for Lean",
  sectorName: "IT & Software",
  levels: [
    "Talent development for Lean is absent or ad hoc. Employees lack structured learning paths for Lean or Agile skills. Career progression is unrelated to Lean capability. Talent gaps hinder improvement efforts.",
    "Some Lean talent development activities are introduced, such as training or workshops. Talent identification and development are limited. Employees have uneven access to development opportunities. Management begins to recognize Lean skills.",
    "Talent development for Lean is formalized with structured learning paths, coaching, and career development. Employees receive feedback and recognition for Lean capability. Lean talent supports improvement and innovation.",
    "Talent development is integrated with recruitment, performance management, and succession planning. Employees are supported to grow Lean expertise at all levels. Talent pipelines are managed proactively. Leadership models and rewards Lean development.",
    "Talent development for Lean is strategic, adaptive, and continuously improved. The organization leads in Lean talent development and capability building. Employees drive Lean innovation and culture. Talent development sustains performance and competitiveness."
  ]
},

// 53. Environmental Sustainability — IT & Software
{
  dimensionName: "Environmental Sustainability",
  sectorName: "IT & Software",
  levels: [
    "Environmental sustainability is not considered in IT strategy, processes, or projects. Resource consumption and waste are unmanaged. Employees lack awareness of environmental impact.",
    "Some environmental sustainability initiatives are piloted, such as energy-efficient hardware or e-waste reduction. Awareness and engagement are limited. Impact is localized and not measured. Management begins to recognize sustainability importance.",
    "Environmental sustainability is integrated into IT processes and projects. Metrics track energy use, waste, and resource efficiency. Teams participate in sustainability improvement initiatives. Results are reported and recognized.",
    "Environmental sustainability is strategic, supported by digital tools, automation, and analytics. IT aligns with corporate sustainability goals. Employees are engaged in sustainability innovation and advocacy. Sustainability performance drives value.",
    "Environmental sustainability is embedded in IT culture, strategy, and operations. AI and advanced analytics optimize resource use and minimize impact. The organization leads in sustainable IT practices. Sustainability is a source of competitive advantage and brand value."
  ]
},

// 54. Community and Stakeholder Engagement — IT & Software
{
  dimensionName: "Community and Stakeholder Engagement",
  sectorName: "IT & Software",
  levels: [
    "Engagement with community, customers, or stakeholders is minimal or absent. Feedback is rare and reactive. IT is seen as isolated or unresponsive. External relationships are transactional.",
    "Some stakeholder engagement occurs through surveys, forums, or pilot programs. Feedback is collected but not always acted on. Engagement is inconsistent and not strategic. Value of external input is recognized.",
    "Stakeholder engagement is systematic and supports continuous improvement. Regular feedback loops inform IT strategy, projects, and processes. Communities of practice are established. Engagement outcomes are communicated and acted on.",
    "Stakeholder engagement is integrated with governance, performance management, and innovation. Partnerships with customers, community, and industry drive improvement and learning. Engagement is proactive, inclusive, and sustained.",
    "Community and stakeholder engagement is strategic, adaptive, and benchmarked. The organization leads in collaborative improvement and innovation. Engagement drives value, reputation, and influence. IT is recognized as a trusted partner and leader."
  ]
},

// 55. Customer Focus in Processes — IT & Software
{
  dimensionName: "Customer Focus in Processes",
  sectorName: "IT & Software",
  levels: [
    "Customer needs and feedback are rarely considered in IT processes or projects. Value delivery is not prioritized. Customer satisfaction is not measured. IT operates in isolation from customers.",
    "Some customer focus initiatives are introduced, such as user surveys or feedback sessions. Customer input informs projects inconsistently. Employees begin to recognize customer value. Customer satisfaction is measured in select areas.",
    "Customer focus is embedded in IT processes and improvement initiatives. Regular feedback informs design, delivery, and support. Metrics track customer value and satisfaction. Customer needs drive prioritization and improvement.",
    "Customer focus is integrated with strategy, governance, and performance management. Cross-functional teams collaborate with customers to co-create value. Customer advocacy is part of culture and leadership. Customer focus drives differentiation.",
    "Customer focus in processes is strategic, adaptive, and benchmarked. The organization leads in customer-centric IT practices. Customer insight drives continuous improvement, innovation, and competitiveness. Customer value is sustained and recognized."
  ]
},

// 56. Supplier Integration — IT & Software
{
  dimensionName: "Supplier Integration",
  sectorName: "IT & Software",
  levels: [
    "Suppliers are managed transactionally, with limited communication or collaboration. Integration with IT processes is minimal. Supplier performance and improvement are not tracked. Relationships are price-focused.",
    "Some supplier integration initiatives are piloted, such as joint projects or information sharing. Collaboration is inconsistent and ad hoc. Supplier performance is measured in select areas. Value of integration is recognized.",
    "Supplier integration is systematic and aligned with IT strategy and processes. Collaboration includes joint improvement and innovation initiatives. Supplier metrics and feedback inform performance management. Integration supports value and risk management.",
    "Supplier integration is proactive, strategic, and supported by digital tools. Joint governance, knowledge sharing, and performance improvement are routine. Suppliers are engaged as partners in value creation. Integration extends to risk and sustainability.",
    "Supplier integration is intelligent, adaptive, and benchmarked. The organization leads in supplier collaboration and innovation. AI and analytics support integrated management. Supplier integration drives resilience, value, and competitiveness."
  ]
},

// 57. Inventory Management — IT & Software
{
  dimensionName: "Inventory Management",
  sectorName: "IT & Software",
  levels: [
    "Inventory management for hardware, software, or digital assets is informal or absent. Visibility, control, and tracking are limited. Losses and inefficiencies are common. Inventory data is unreliable or unavailable.",
    "Basic inventory management practices and tools are introduced. Asset tracking and reporting improve but are not comprehensive. Inventory control is localized. Data quality and usage vary. Losses decrease but challenges remain.",
    "Inventory management is formalized and supported by digital systems. Inventory data is accurate, accessible, and updated regularly. Processes for procurement, usage, and disposal are standardized. Inventory supports efficiency and risk management.",
    "Inventory management is integrated with IT and business processes. Automation, analytics, and real-time tracking enhance control and optimization. Inventory planning supports demand, capacity, and lifecycle management. Inventory management drives value.",
    "Inventory management is intelligent, predictive, and strategic. AI and advanced analytics optimize inventory and prevent losses. Inventory integrates with partners and supply chain. The organization leads in inventory management practices. Inventory management supports innovation, resilience, and competitiveness."
  ]
},

// 1. Leadership Commitment — Logistics & Supply Chain
{
  dimensionName: "Leadership Commitment",
  sectorName: "Logistics",
  levels: [
    "Leaders in logistics see Lean primarily as a temporary cost-cutting initiative, with little long-term engagement. Their involvement is limited to crisis management when delivery failures or stockouts occur. Lean efforts are disconnected and sporadic, with unclear expectations communicated to staff. There is minimal visible leadership presence on the warehouse floor or in transportation operations. Employees often perceive Lean as a management trend rather than a sustained strategy.",
    "Some logistics leaders participate in Lean training or pilot improvement projects, usually reacting to specific operational challenges. Support is inconsistent and often symbolic, with few follow-up actions after events. Gemba walks and shop-floor visits begin but happen irregularly and lack structured coaching. Communication about Lean is top-down and limited, causing frontline teams to feel disconnected from leadership goals. Lean awareness grows slowly but is not yet embedded.",
    "Leaders actively sponsor Lean initiatives targeting key supply chain metrics such as on-time delivery and inventory accuracy. Regular performance reviews include Lean objectives, and managers conduct purposeful Gemba walks to understand frontline issues. Feedback loops improve, enabling two-way communication between staff and management. Cross-functional collaboration starts breaking down silos between warehousing, transport, and procurement functions. Lean becomes more visible as a strategic priority.",
    "Lean leadership is fully integrated into logistics operations and strategic planning. Senior leaders coach middle managers regularly and participate in continuous improvement activities. Lean metrics are embedded into dashboards and business reviews, ensuring alignment with corporate goals. Resources are dedicated to sustaining Lean projects across the supply chain, including supplier engagement. Leadership visibly champions Lean culture, driving employee motivation and innovation in operational processes.",
    "Leadership in logistics owns and drives Lean as a core strategic imperative, fostering a culture of continuous improvement and accountability. Decision-making is data-driven, leveraging real-time analytics and predictive tools to anticipate and resolve supply chain challenges proactively. Leaders empower teams at all levels to innovate and sustain improvements independently. The organization benchmarks itself externally and collaborates with suppliers and customers to extend Lean principles beyond internal operations. Lean becomes integral to the company’s identity and competitive advantage."
  ]
},

// 2. Coaching & Role Modeling — Logistics & Supply Chain
{
  dimensionName: "Coaching & Role Modeling",
  sectorName: "Logistics",
  levels: [
    "Coaching is minimal or absent; supervisors focus on task completion and meeting immediate targets. Feedback is often reactive and centered on errors rather than development. Lean language and behaviors are rarely modeled by leadership or supervisors. Problem-solving is mostly handled by supervisors themselves without involving operators. Lean principles are unfamiliar or seen as irrelevant by frontline staff.",
    "Some supervisors attend Lean workshops and begin experimenting with basic coaching during improvement events. Coaching remains informal and inconsistent, usually reactive to issues rather than proactive. Role modeling is limited to certain leaders or isolated teams. Peer learning and mentoring are sporadic and lack structure. Operators receive little guidance on Lean thinking or problem-solving methods outside events.",
    "Coaching becomes an expected part of supervisors’ roles, linked to regular Gemba walks and team huddles. Leaders use standardized coaching questions and provide feedback focused on root cause analysis and Lean tools. Visual coaching boards and checklists support development efforts. Operators begin documenting small improvements and sharing best practices. Coaching conversations encourage reflection and skill building within teams.",
    "Managers receive formal Lean coaching training and mentor frontline supervisors regularly. Coaching is data-informed, focusing on continuous development and accountability. Role modeling of Lean behaviors becomes routine across shifts and departments. Coaching extends beyond immediate teams, promoting cross-functional learning. Visual tools and skill matrices are widely used to track progress and identify development needs.",
    "Coaching is a strategic competency deeply embedded at all levels of the logistics organization. Master coaches support leadership development and frontline capability building. Lean language and behaviors are consistently modeled by leaders, reinforcing a culture of learning and continuous improvement. Coaching outcomes are tracked and linked to performance metrics and career progression. Peer coaching and mentoring networks thrive, sustaining Lean adoption company-wide."
  ]
},

// 3. Lean Mindset Adoption — Logistics & Supply Chain
{
  dimensionName: "Lean Mindset Adoption",
  sectorName: "Logistics",
  levels: [
    "Lean is viewed as a temporary program or cost-cutting exercise with little relevance to daily logistics work. Problem-solving is reactive, limited to firefighting disruptions or errors. Lean tools and concepts are unknown or inconsistently applied. Continuous improvement is not part of the organizational mindset. Employees feel disconnected from Lean goals.",
    "Awareness of Lean tools like PDCA and 5 Whys begins, with occasional use during improvement events. Problem-solving is still event-driven and not embedded in daily operations. Successes are not widely shared, limiting organizational learning. Lean language is used sporadically and inconsistently. Employees remain skeptical of Lean’s long-term value.",
    "Lean thinking starts to permeate daily conversations in logistics teams. Operators regularly apply problem-solving tools to address workflow issues and delays. Visual management supports Lean principles, and improvement ideas are actively collected and reviewed. Teams begin taking ownership of continuous improvement in their work areas. Collaboration between departments increases.",
    "Lean mindset is well established and integrated into logistics operations. Teams proactively challenge existing processes and seek to reduce waste and variability. Lean principles are routinely used in meetings, planning, and decision-making. Cross-functional collaboration is strong, with teams working together to improve end-to-end supply chain flow. Continuous improvement behaviors are widespread.",
    "Lean mindset is deeply ingrained and defines how logistics operates. Continuous improvement is instinctive, and teams innovate proactively to improve performance and customer satisfaction. Data-driven experimentation and learning cycles are common. Lean language and behaviors are consistent at all organizational levels. The company is recognized as a Lean leader in the logistics industry."
  ]
},

// 4. Employee Empowerment — Logistics & Supply Chain
{
  dimensionName: "Employee Empowerment",
  sectorName: "Logistics",
  levels: [
    "Operators have limited autonomy and decision-making authority. Suggestions for improvements are discouraged or ignored. Processes are rigid, with changes dictated top-down. There are no formal systems for collecting or implementing frontline ideas. Employees feel disengaged from improvement efforts.",
    "Operators begin voicing ideas during team meetings, but implementation is inconsistent and dependent on supervisors. Ownership of improvements remains unclear, with many ideas stalling due to lack of follow-through. Suggestion systems may be informal or ineffective. Cross-training is limited. Employees remain cautious about raising issues.",
    "Operators lead daily stand-up meetings and implement minor process changes within their teams. Visual boards track ideas, actions, and results, increasing transparency. Supervisors encourage idea sharing and recognize small wins. Cross-training improves workforce flexibility. Empowerment grows but may still be confined within individual teams.",
    "Operators are cross-trained and rotate between stations, taking responsibility for team performance and improvements. Formal suggestion systems with regular follow-up are in place and trusted. Teams set targets for implemented improvements and mentor newer employees. Empowerment extends across departments, promoting wider collaboration. Psychological safety supports open communication.",
    "Empowered employees independently identify and drive improvements across the supply chain. They co-design workflows, participate in planning, and lead structured improvement projects. The organization fosters a culture of autonomy and innovation, encouraging risk-taking within safe boundaries. Empowerment is reinforced by recognition programs and continuous learning opportunities. Employees take strategic ownership of operational excellence."
  ]
},

// 5. Psychological Safety — Logistics & Supply Chain
{
  dimensionName: "Psychological Safety",
  sectorName: "Logistics",
  levels: [
    "Fear of blame dominates, and mistakes are hidden or ignored. Open dialogue about errors or process issues is rare. Employees hesitate to raise concerns or challenge the status quo. There are no formal forums for honest discussion or learning. The culture inhibits innovation and improvement.",
    "Some supervisors encourage feedback, but the environment remains inconsistent. Discussions of problems may occur privately but are avoided in group settings. Blame culture persists unintentionally. Improvement initiatives are largely top-down. Employees are wary of being vulnerable.",
    "Teams hold open debriefs after incidents, focusing on learning rather than blame. Supervisors model vulnerability by admitting mistakes and encouraging input. Mistakes are treated as opportunities to improve systems and processes. Psychological safety increases, supporting more honest communication. Near-miss reporting begins to rise.",
    "Psychological safety is embedded in daily team huddles and problem-solving meetings. Leaders actively model and reinforce a safe environment for sharing ideas and concerns. Structured forums exist to discuss breakdowns and near-misses constructively. Employees trust that raising issues leads to support, not punishment. Transparency in communication is high.",
    "Psychological safety is a core organizational value, fully integrated into hiring, training, and leadership development. Teams confidently challenge unsafe or inefficient practices without fear. Feedback flows freely in all directions and is embraced as part of continuous improvement. The culture promotes bold experimentation and innovation. The logistics organization is resilient and adaptable."
  ]
},

// 6. Cross-Level Communication — Logistics & Supply Chain
{
  dimensionName: "Cross-Level Communication",
  sectorName: "Logistics",
  levels: [
    "Communication is primarily top-down, with limited opportunity for frontline operators to provide feedback. Important information often gets delayed or distorted as it moves through layers. Team meetings focus on task assignments rather than open dialogue. Feedback loops are weak or nonexistent, hindering timely problem-solving. Collaboration between shifts and departments is minimal.",
    "Some formal communication channels exist, such as monthly newsletters or bulletin boards, but participation is largely passive. Frontline feedback is collected sporadically, often informally, with little visible follow-up. Cross-shift communication improves slightly but remains inconsistent. Escalation of issues can be slow and unclear. Communication is still largely one-way.",
    "Daily tiered meetings and shift huddles establish structured two-way communication between operators and supervisors. Visual boards track key issues and progress on improvement actions. Supervisors begin representing operator concerns in management meetings. Communication across departments becomes more frequent and intentional. Teams start to build trust through regular updates.",
    "Real-time escalation boards and issue trackers connect frontline teams with engineers and managers. Problems are addressed promptly, often in cross-functional meetings. Standardized visual tools support consistent communication, and frontline staff are invited to participate in reviews. Digital platforms may start to supplement face-to-face interactions. Communication is transparent and fosters collaboration.",
    "Communication systems fully integrate frontline teams with leadership via digital and in-person channels. Feedback is traceable, timely, and leads to measurable action. Operators are engaged in strategic planning and problem-solving at all levels. Cross-department and cross-site communication is seamless, fostering a unified Lean culture. Open, honest dialogue drives continuous improvement."
  ]
},

// 7. Lean Training and Education — Logistics & Supply Chain
{
  dimensionName: "Lean Training and Education",
  sectorName: "Logistics",
  levels: [
    "Lean training is minimal or absent, with most employees unfamiliar with Lean terminology or tools. Learning occurs informally and inconsistently, often only during audits or crisis responses. There is no structured curriculum or ongoing education plan. Employees lack confidence in Lean concepts and how to apply them. Training resources are scarce.",
    "Basic Lean training modules are introduced, often during onboarding or improvement events. Some operators and supervisors gain exposure to fundamental Lean tools such as 5S and PDCA, but application is inconsistent. Training focuses more on compliance than capability building. Refresher sessions are rare. Staff engagement with Lean education remains low.",
    "Role-based training plans are established for operators, supervisors, and engineers, covering problem-solving tools, visual management, and safety integration. Training combines classroom instruction with on-the-job coaching and simulations. Teams begin applying learned skills in active improvement projects. Supervisors coach and reinforce Lean practices regularly. Training is tracked and linked to performance.",
    "Structured Lean education pathways, including certifications like Yellow Belt, are available across the supply chain. Internal facilitators lead simulations and Kaizen training sessions. Learning is tied to career progression and improvement goals. Continuous development is embedded into organizational practices, supported by learning management systems. Training outcomes are evaluated for effectiveness.",
    "Lean education is a strategic priority with a dedicated Lean academy or center of excellence. Partnerships with external experts bring in benchmarking and innovation. Training is adaptive, data-driven, and integrated with daily work and strategic initiatives. All employees continuously upgrade Lean competencies, and coaching is part of leadership development. Lean learning culture permeates the organization."
  ]
},

// 8. Recognition and Celebration — Logistics & Supply Chain
{
  dimensionName: "Recognition and Celebration",
  sectorName: "Logistics",
  levels: [
    "Improvement efforts receive little to no formal recognition, leading to low motivation among staff. Managers may acknowledge meeting output targets but rarely celebrate Lean-related achievements. There are no structured systems for sharing success stories. Employee contributions to Lean are often overlooked. Recognition is informal and inconsistent.",
    "Occasional “Employee of the Month” or spot awards exist but rarely highlight Lean efforts specifically. Recognition tends to focus on individual performance rather than team-based improvements. Celebrations are infrequent, low visibility, and not linked to Lean outcomes. Motivation for continuous improvement remains weak. Peer-to-peer recognition is limited.",
    "Teams and individuals are recognized regularly in meetings and newsletters for specific Lean improvements. Small rewards and informal acknowledgments encourage participation. Success stories are shared to build momentum and reinforce Lean values. Peer recognition begins to gain traction, fostering camaraderie. Recognition supports growing engagement.",
    "Formal recognition programs are established, linking continuous improvement achievements to plant or corporate goals. Awards, bonuses, or time off are given for sustained improvements. Celebrations are timely, public, and involve leadership participation. Recognition is tied to both results and Lean behaviors. The culture of appreciation motivates ongoing involvement.",
    "Recognition is deeply embedded into performance management and leadership reviews. Annual Lean summits celebrate organizational and team excellence. Peer-nominated awards and data-driven achievements reinforce participation and innovation. Employees take pride in driving improvements, and recognition sustains a high-performing Lean culture. Celebrations include external benchmarking and community engagement."
  ]
},

// 9. Change Management Readiness — Logistics & Supply Chain
{
  dimensionName: "Change Management Readiness",
  sectorName: "Logistics",
  levels: [
    "Resistance to change is common, fueled by poor communication, lack of training, and fear of disruption. Change initiatives are introduced abruptly without staff involvement. Employees often revert to old habits, undermining improvements. Training and support for change are minimal or absent. Change is seen as a burden rather than an opportunity.",
    "Changes are piloted in isolated areas but with limited follow-up or feedback mechanisms. Operators receive instructions but lack understanding of the rationale behind changes. Communication about upcoming changes is often unclear or inconsistent. Resistance persists due to low transparency and limited involvement. Training on new processes is ad hoc.",
    "Structured change processes include risk assessments, impact analyses, and operator input during planning. Training programs accompany rollouts, improving staff readiness. Feedback loops allow adjustments based on frontline experiences. Change leaders emerge across value streams to guide transitions. Employees begin accepting change as part of continuous improvement.",
    "Change management is proactive, with roadmaps developed in collaboration with operators and stakeholders. Simulation and pilot programs prepare teams for major shifts. Pre- and post-implementation reviews capture lessons learned and enable continuous refinement. Visual tools and communication plans support smooth transitions. Resistance is actively managed and minimized.",
    "Change readiness is institutionalized and tracked as a core competency. Leaders coach teams through transitions, using real-time feedback and data-driven adjustments. Cross-functional collaboration ensures minimal disruption during change. Continuous improvement and change are inseparable, with teams innovating and iterating proactively. The organization quickly adapts to evolving conditions."
  ]
},

// 10. Daily Problem-Solving Culture — Logistics & Supply Chain
{
  dimensionName: "Daily Problem-Solving Culture",
  sectorName: "Logistics",
  levels: [
    "Problem-solving is reactive and informal, often limited to crisis response. There are few standardized tools or processes, and issues frequently recur. Operators rely on supervisors to fix problems without deeper analysis. Documentation of problems and solutions is minimal. Continuous improvement is not part of daily work.",
    "Basic problem-solving tools like 5 Whys and root cause analysis are introduced during improvement events. Teams begin documenting issues and countermeasures but focus remains event-driven. Supervisors handle most problem resolution with limited team involvement. Feedback on problem status is inconsistent. Learning from problems is limited.",
    "Structured problem-solving is integrated into daily work with regular use of Lean tools. Teams lead investigations into issues, documenting findings and tracking actions. Visual management supports identification and escalation of problems. Supervisors coach teams in problem-solving methodologies. Cross-functional collaboration begins for complex issues.",
    "Problem-solving is embedded into daily management systems with clear escalation protocols. Teams link issues to key performance indicators and monitor resolution progress. Leaders model A3 thinking and systematic countermeasure development. Knowledge sharing and standard work updates result from problem-solving outcomes. Continuous learning accelerates improvement cycles.",
    "Problem-solving is a cultural norm, with cross-functional teams collaborating continuously to anticipate and resolve systemic issues. Advanced analytical tools and data-driven methods are routinely used. Teams proactively identify risks and implement preventative measures. Lessons learned are systematically shared organization-wide. Problem-solving drives innovation and operational excellence."
  ]
},

// 11. Team Engagement in Improvement — Logistics & Supply Chain
{
  dimensionName: "Team Engagement in Improvement",
  sectorName: "Logistics",
  levels: [
    "Team involvement in Lean or improvement activities is minimal, with limited awareness or opportunity to participate. Improvement efforts tend to be led by management without frontline input. Employees may feel disengaged or skeptical about Lean initiatives. Communication about Lean is often one-way and does not encourage participation. There is little sense of ownership at the team level.",
    "Some teams participate in isolated Kaizen events or improvement meetings but engagement is inconsistent. Team members may contribute ideas but often lack support to implement them. Awareness of Lean’s benefits grows but is not widespread. Leadership involvement varies by department or shift. Collaboration remains limited.",
    "Teams regularly engage in improvement activities, including Kaizen events and daily problem-solving meetings. Members take ownership of small-scale improvements and share successes. Cross-functional collaboration increases, with teams beginning to mentor others. Engagement is fostered through recognition and coaching. A culture of continuous learning starts to emerge.",
    "Teams become self-directed in managing improvement projects and share best practices across units. Engagement is high and spans all roles, with employees actively seeking opportunities to optimize workflows. Cross-department initiatives are common, breaking down silos. Coaching and peer support sustain momentum. Teams take pride in contributing to organizational goals.",
    "Teams drive innovation throughout the supply chain, proactively identifying improvement opportunities and disseminating successful practices organization-wide. Engagement includes participation in strategic initiatives and external benchmarking. Recognition programs and leadership coaching reinforce sustained involvement. Continuous improvement is intrinsic to team culture. Teams are seen as key contributors to competitive advantage."
  ]
},

// 12. Value Stream Mapping — Logistics & Supply Chain
{
  dimensionName: "Value Stream Mapping",
  sectorName: "Logistics",
  levels: [
    "There is little understanding or documentation of end-to-end material flow or logistics processes. Bottlenecks and waste often go unnoticed or unmanaged. Improvement efforts focus on isolated tasks rather than overall flow. Lack of process visibility limits problem-solving and coordination. Value streams are siloed and disconnected.",
    "Some departments begin to map parts of their processes, typically within warehouses or transportation routes. Maps may be outdated or incomplete, with limited frontline involvement. Value stream concepts are introduced but not consistently applied. Waste and delays are identified sporadically. Coordination across functions remains limited.",
    "Value stream mapping is used regularly to visualize and analyze logistics flows, involving cross-functional teams including frontline staff. Maps highlight waste, delays, and bottlenecks, guiding targeted improvements. Teams begin to align metrics and goals with flow efficiency. Mapping exercises become part of standard improvement activities. Awareness of end-to-end process impact increases.",
    "Comprehensive, dynamic value stream maps are maintained and updated across all supply chain functions. Data-driven insights inform redesigns to optimize flow and reduce waste. Cross-functional collaboration is strong, with shared accountability for value delivery. Maps integrate supplier and customer touchpoints where applicable. Continuous improvement leverages mapping outputs.",
    "Value stream maps are fully integrated with real-time data systems, supporting predictive analytics and seamless coordination. Logistics processes operate as a synchronized, end-to-end system delivering maximal customer value. Cross-organizational collaboration extends mapping beyond internal boundaries to suppliers and partners. Continuous redesign and innovation are driven by value stream insights. The organization benchmarks and shares best practices externally."
  ]
},

// 13. Process Flow Efficiency — Logistics & Supply Chain
{
  dimensionName: "Process Flow Efficiency",
  sectorName: "Logistics",
  levels: [
    "Material and information flow in logistics is erratic and uncoordinated, leading to frequent delays, redundancies, and rework. Bottlenecks cause shipping delays and stock imbalances. Processes are reactive, with little emphasis on flow or timing. Cross-department communication is weak. Operational inefficiencies negatively impact customer satisfaction.",
    "Targeted efforts focus on streamlining individual functions such as warehouse picking or route scheduling. Communication between some departments improves, reducing waiting times and unnecessary handoffs. Basic flow improvements are introduced but remain isolated. Workflow standardization is limited. Operators begin to recognize flow issues but lack tools for systemic improvement.",
    "Logistics processes are increasingly streamlined with smoother transitions between functions. Pull systems and basic Heijunka principles are applied to level workloads and reduce bottlenecks. Standard work supports consistent flow, and visual management highlights abnormalities. Cross-functional teams collaborate to improve end-to-end processes. Customer impact is considered in flow redesign.",
    "Process flow is integrated across the entire supply chain, from procurement through delivery. Advanced scheduling and resource leveling reduce variability and waiting times. Real-time tracking supports rapid response to disruptions. Continuous flow is maintained through coordinated planning and execution. Flow efficiency is a key performance metric at all levels.",
    "Near-perfect process flow is sustained using predictive scheduling, automation, and dynamic resource allocation. Processes adapt in real-time to demand fluctuations and supply variability. Cross-company collaboration optimizes end-to-end supply chain flow. Innovations such as autonomous material handling and AI-driven logistics are leveraged. Process flow excellence drives competitive differentiation."
  ]
},

// 14. Standard Work / SOPs — Logistics & Supply Chain
{
  dimensionName: "Standard Work / SOPs",
  sectorName: "Logistics",
  levels: [
    "Logistics tasks lack standardized procedures, resulting in variability and errors. Work instructions are often missing, outdated, or ignored. Training is informal, and practices differ widely across teams and shifts. Quality and safety are impacted by inconsistent execution. Documentation discipline is low.",
    "Some standard operating procedures (SOPs) exist but are inconsistently used and poorly maintained. Frontline staff may be aware of some protocols but do not consistently follow them. Updates to SOPs are infrequent and unstructured. Training on SOPs is limited. Variation persists.",
    "Documented SOPs cover key logistics processes and are posted or accessible at workstations. Teams follow these procedures regularly, and updates reflect continuous improvements. Training aligns with current standards. Compliance is monitored but may lack rigor. Frontline staff contribute to SOP revisions.",
    "SOPs are comprehensive, regularly reviewed, and embedded into daily work with visual aids and timing standards. Audits and coaching reinforce adherence. Deviations are systematically investigated and corrected. SOPs integrate safety, quality, and efficiency considerations. Continuous improvement is linked to SOP updates.",
    "Standard work is dynamic, continuously improved based on real-time feedback and analytics. Digital tools support instant access and updates to SOPs. Training and retraining are rapid and integrated into workflows. SOPs extend to suppliers and partners to ensure consistency across the value stream. Best practices are shared and benchmarked externally."
  ]
},

// 15. Visual Management — Logistics & Supply Chain
{
  dimensionName: "Visual Management",
  sectorName: "Logistics",
  levels: [
    "Visual cues and displays are minimal or absent in logistics operations. Operators rely on verbal instructions and memory, leading to confusion and errors. Performance data is not visible or is outdated. Problems are often detected too late. Visual management is not part of the work culture.",
    "Basic visual controls such as signage, labels, or safety posters appear sporadically. Some work areas display hand-written charts or metrics but are often neglected. Visuals are not integrated with workflows or improvement processes. Operators seldom use visual information to guide work. The impact on performance is limited.",
    "Visual management boards are established to display key performance indicators and daily goals. Color-coded alerts and problem escalation tools begin to be used. Operators reference visuals during meetings and shift changes. Visual tools support early detection and resolution of abnormalities. Teams take ownership of maintaining visuals.",
    "Visual management is standardized across logistics operations, integrating real-time dashboards and digital displays. Visual controls guide workflow, inventory levels, and quality monitoring. Leaders use visual data to coach teams and support decision-making. Visual tools facilitate rapid escalation of issues and problem-solving. Visual management is a key enabler of continuous improvement.",
    "Visual management is fully digital, interactive, and accessible organization-wide. Data flows automatically to displays from logistics execution and ERP systems. Visuals support predictive decision-making and strategic alignment. Visitors and new employees can instantly understand current status and priorities. Visual management drives transparency, accountability, and operational excellence."
  ]
},

// 16. 5S Implementation — Logistics & Supply Chain
{
  dimensionName: "5S Implementation",
  sectorName: "Logistics",
  levels: [
    "Workspaces in warehouses and transport hubs are cluttered and disorganized, causing inefficiencies and safety hazards. Tools and materials lack designated locations, leading to wasted time searching or replacing items. Cleanliness and order are inconsistent across shifts and teams. There is little awareness of 5S principles. Improvement efforts are sporadic and unstructured.",
    "Basic 5S activities like sorting and labeling begin in some areas but lack sustainability. Red-tag events occur irregularly with limited follow-up. Visual aids such as posters are displayed but adherence varies. Teams start recognizing the benefits of organization but do not embed it into daily routines. Audits and accountability are minimal.",
    "5S standards are documented and practiced regularly in most logistics zones. Work areas have clear tool and material placements, and visual controls guide organization. Teams conduct daily cleanups and resets, improving safety and efficiency. Audits begin to track compliance and highlight improvement opportunities. Engagement grows across shifts.",
    "5S is sustained through formal audits, metrics, and team ownership across warehouses and transportation areas. Continuous improvements focus on ergonomics, waste elimination, and workflow optimization. Visual management integrates 5S status with performance boards. Training reinforces 5S as standard practice. The culture embraces workplace discipline and order.",
    "The logistics operation exemplifies 5S excellence, benchmarking against best-in-class facilities. Innovation in workplace organization supports rapid adjustments and safety improvements. Digital tools aid sustainment and monitoring of 5S compliance. Teams proactively identify and solve 5S-related challenges. The workplace environment reflects and reinforces Lean culture and pride."
  ]
},

// 17. Kanban/Pull Systems — Logistics & Supply Chain
{
  dimensionName: "Kanban/Pull Systems",
  sectorName: "Logistics",
  levels: [
    "Inventory management is largely manual and reactive, causing frequent shortages or overstocking. There are no formal pull systems or signals to trigger replenishment. Communication between warehouses and procurement is limited. Stockouts and excess inventory cause inefficiencies and customer dissatisfaction. Waste due to poor material flow is common.",
    "Simple pull systems like Kanban cards or reorder points are implemented in isolated areas. Replenishment is somewhat more predictable but still relies heavily on manual tracking. Communication improves but is inconsistent, causing delays in responding to stock needs. Staff begin recognizing the value of pull-based inventory control but lack full adoption. Systems are not yet integrated.",
    "Kanban or pull systems are established across multiple logistics functions to better align inventory with demand. Teams monitor inventory levels visually and respond proactively to replenishment signals. Communication between procurement, warehousing, and transport improves. Pull systems reduce waste and buffer stock. Teams are trained in pull principles.",
    "Pull systems are integrated across the entire supply chain, connecting suppliers, warehouses, and distribution centers. Digital Kanban systems support real-time tracking and automated replenishment. Inventory carrying costs decrease as stock levels align closely with actual consumption. Communication is seamless, enabling rapid response to demand changes. Pull systems support just-in-time delivery.",
    "Pull systems are optimized with predictive analytics and automation, ensuring precise, just-in-time delivery of materials and goods. Integration with supplier and customer systems enables end-to-end visibility and flow synchronization. Autonomous material handling and replenishment technologies are deployed. Continuous improvement teams monitor and refine pull processes. Inventory levels are minimized without compromising service."
  ]
},

// 18. Quick Changeover (SMED) — Logistics & Supply Chain
{
  dimensionName: "Quick Changeover (SMED)",
  sectorName: "Logistics",
  levels: [
    "Changeovers for equipment, loading docks, or transport scheduling are lengthy and unpredictable, causing downtime and delays. Procedures are informal or undocumented. Delays disrupt workflows and reduce capacity utilization. Employees are reactive to changeover problems. No formal methods exist to reduce setup times.",
    "Basic SMED principles are introduced, separating internal and external setup tasks. Checklists and visual aids support standardization. Some improvements reduce changeover times in pilot areas. Staff awareness increases but practices are not yet widespread or consistent. Changeover variability remains an issue.",
    "Standardized changeover procedures are documented and followed in key logistics processes. Visual controls and training support consistent application. Changeover times decrease measurably, improving throughput and scheduling reliability. Feedback mechanisms encourage continuous improvement. Teams actively participate in refining procedures.",
    "Changeover processes are audited regularly and continuously improved based on operator input and data analysis. Simulation training helps prepare staff for rapid changeovers. Improvements extend across multiple sites and functions. Changeovers are synchronized with demand fluctuations to optimize capacity. Safety and quality remain paramount.",
    "Rapid, error-free changeovers are achieved consistently, maximizing equipment and facility utilization. Advanced technologies and automation support swift transitions. Changeover performance is benchmarked externally and drives competitive advantage. Continuous innovation sustains rapid adaptability. Changeover excellence enables high responsiveness to customer needs."
  ]
},

// 19. Error-Proofing (Poka-Yoke) — Logistics & Supply Chain
{
  dimensionName: "Error-Proofing (Poka-Yoke)",
  sectorName: "Logistics",
  levels: [
    "Errors in order picking, labeling, or documentation are frequent and detected late, causing rework and customer dissatisfaction. No formal error-proofing systems are in place. Quality checks rely mainly on inspection rather than prevention. Staff may be blamed for errors. Processes are vulnerable to human mistakes.",
    "Basic error-proofing measures such as checklists, labels, or simple visual cues are introduced in some areas. Operators rely on reminders rather than physical mistake-proofing devices. Training raises awareness of common errors. Quality escapes remain high. Error-proofing is discussed during improvement events but not widely implemented.",
    "Error-proofing devices and processes are integrated into critical logistics tasks such as barcode scanning and automated verification. Teams identify error-prone steps during Kaizen events and implement poka-yoke solutions. Operators are trained to recognize and address potential mistakes proactively. Error rates begin to decline. Error-proofing becomes part of continuous improvement discussions.",
    "Error-proofing is embedded in process design and standard work, supported by audits and monitoring. Advanced technologies like RFID and automated alerts reduce errors further. Operators contribute to designing and maintaining poka-yoke solutions. Quality escapes are rare in error-proofed processes. Continuous feedback ensures systems remain effective.",
    "Error-proofing is fully integrated with real-time data analytics and AI systems predicting and preventing errors before they occur. New processes and technologies are evaluated for mistake-proofing before deployment. Teams innovate poka-yoke solutions collaboratively across functions and suppliers. Quality is built into logistics operations, not inspected afterward. The culture prioritizes prevention."
  ]
},

// 20. Process Transparency — Logistics & Supply Chain
{
  dimensionName: "Process Transparency",
  sectorName: "Logistics",
  levels: [
    "Logistics processes are largely opaque, leading to confusion and inefficiencies. Operators and managers lack clear visibility into workflow status, inventory levels, and order progress. Issues are discovered late, resulting in reactive firefighting. Process documentation and communication are limited. Decision-making is often based on incomplete or outdated information.",
    "Some workflow charts, process maps, and visual boards are introduced to increase clarity. Transparency is limited to certain functions or shifts. Updates are often manual and delayed. Frontline staff have partial insight into process status but lack comprehensive understanding. Communication gaps persist between departments.",
    "Process transparency improves with accessible, up-to-date workflow status displays and performance dashboards. Teams regularly review process data in meetings to identify bottlenecks or deviations. Cross-functional visibility increases, enabling better coordination. Technology supports more timely updates. Process clarity supports proactive management.",
    "Real-time process status updates are available to all relevant staff and leadership. Continuous monitoring highlights abnormalities promptly. Integrated digital systems link warehouse management, transportation, and inventory data. Transparency fosters accountability and collaborative problem-solving. Data-driven decision-making is routine.",
    "Full visibility across all logistics operations and external partners is achieved through advanced digital platforms. Transparency supports predictive analytics and strategic planning. Open communication channels ensure issues are resolved quickly and collaboratively. Process data is shared with suppliers and customers, enabling seamless coordination. Transparency is a competitive advantage and driver of continuous improvement."
  ]
},

// 21. Quality-at-Source — Logistics & Supply Chain
{
  dimensionName: "Quality-at-Source",
  sectorName: "Logistics",
  levels: [
    "Quality issues such as incorrect shipments, damaged goods, or documentation errors are often detected late, usually after customers report problems. There is minimal frontline involvement in identifying or correcting defects. Quality checks rely heavily on end-of-process inspections, leading to rework and delays. Responsibility for quality is seen as the QA department’s job, not an operator’s. Preventative actions are rare.",
    "Frontline staff begin to be trained and encouraged to identify and correct defects immediately during their work. Basic quality checks become part of standard tasks, such as verifying shipment accuracy before dispatch. Root cause analysis is occasionally performed but not systematically. Teams are more aware of their role in quality but lack formal tools or processes. Early detection of issues is improving but inconsistent.",
    "Quality-at-source practices are embedded into daily work, with operators empowered to stop processes and correct errors immediately. Quality checks are integrated into standard operating procedures, supported by visual controls and error-proofing devices. Teams regularly use root cause analysis to prevent recurrence. Continuous feedback loops enable timely quality improvements. Quality ownership spreads throughout logistics functions.",
    "Real-time monitoring and alerts support quality control at every process step. Frontline staff actively participate in quality improvement teams and audits. Advanced data analytics identify quality trends and focus improvement efforts. Continuous quality feedback is part of team huddles and management reviews. The culture emphasizes proactive prevention and accountability for quality.",
    "Quality is proactively ensured through predictive analytics, AI-based monitoring, and embedded safeguards. Every logistics team member prioritizes quality at the source, with empowerment to innovate solutions. Integrated digital systems provide immediate quality insights supporting decision-making. Quality metrics are a core part of performance evaluations and strategic planning. The organization is recognized for excellence in logistics quality management."
  ]
},

// 22. Level Loading / Heijunka — Logistics & Supply Chain
{
  dimensionName: "Level Loading / Heijunka",
  sectorName: "Logistics",
  levels: [
    "Workloads and shipment schedules are uneven and unpredictable, leading to peaks and troughs in labor demand. This variability causes bottlenecks, overtimes, or idle times, impacting service reliability. Scheduling is reactive with little coordination between departments. Capacity constraints are frequently unmanaged. Employees experience burnout or downtime.",
    "Basic leveling techniques are applied within certain teams or shifts to smooth workloads. Departments begin to coordinate schedules to reduce extreme fluctuations. Some planning considers demand patterns but lacks granularity or real-time adjustments. Variability remains a challenge. Communication about workload balancing is inconsistent.",
    "Level loading is actively managed across multiple logistics functions, balancing resources and workflows to reduce bottlenecks. Production and shipment schedules are smoothed using Heijunka principles. Coordination between warehousing, transport, and procurement improves. Real-time data helps identify workload imbalances. Teams adjust plans proactively.",
    "System-wide leveling integrates capacity planning, resource allocation, and customer demand management. Predictive analytics support demand forecasting and workload smoothing. Flexibility in staffing and equipment deployment enhances responsiveness. Variability is minimized across the supply chain, improving flow and employee experience. Level loading is a key operational focus.",
    "Level loading is dynamic and predictive, enabled by AI-driven scheduling and autonomous resource management. Workloads are continuously balanced across sites, shifts, and functions in real-time. Employees experience steady, manageable workloads, enhancing morale and performance. Demand-capacity synchronization extends through supplier and customer networks. Level loading excellence supports superior service delivery and operational efficiency."
  ]
},

// 23. TPM (Total Productive Maintenance) — Logistics & Supply Chain
{
  dimensionName: "TPM (Total Productive Maintenance)",
  sectorName: "Logistics",
  levels: [
    "Equipment breakdowns, vehicle downtime, and maintenance are reactive and unplanned, causing frequent disruptions. Maintenance is informal and often delayed. Operators lack ownership or involvement in upkeep. Downtime data is not tracked or analyzed. Equipment reliability negatively impacts operations and safety.",
    "Planned maintenance schedules are introduced but are inconsistently followed. Operators perform basic equipment checks. Some downtime tracking begins. Maintenance teams conduct routine inspections but lack proactive strategies. Spare parts availability is irregular. Collaboration between operators and technicians is limited.",
    "TPM pillars such as autonomous maintenance and planned maintenance are implemented. Operators take responsibility for daily equipment checks and minor upkeep. Downtime causes are logged and analyzed. Preventive maintenance reduces breakdown frequency. Collaboration between maintenance and operations improves. Equipment reliability increases.",
    "TPM is fully integrated into logistics operations with cross-functional teams driving continuous improvement in maintenance. Overall Equipment Effectiveness (OEE) is tracked and reviewed regularly. Maintenance is predictive, based on usage data and condition monitoring. Operators and technicians work closely to optimize equipment performance. Root causes of failures are systematically addressed.",
    "TPM is a cultural norm with maintenance embedded in all levels of logistics operations. Predictive maintenance uses IoT sensors and data analytics to anticipate failures before they occur. Equipment design incorporates maintainability features. Continuous training ensures high capability in maintenance practices. Equipment reliability supports near-zero downtime and operational excellence."
  ]
},

// 24. End-to-End Value Stream Integration — Logistics & Supply Chain
{
  dimensionName: "End-to-End Value Stream Integration",
  sectorName: "Logistics",
  levels: [
    "Logistics departments work in silos with little coordination or shared goals. Poor communication leads to delays, redundancies, and errors in handoffs between functions. Supply chain visibility is limited. Accountability is fragmented. Customer service suffers from disjointed processes.",
    "Some efforts are made to improve coordination between key functions such as warehousing and transportation. Cross-functional meetings and basic process handoffs begin. Shared KPIs are introduced but not fully aligned. Integration is limited to internal departments. External collaboration is minimal.",
    "Workflows, metrics, and improvement goals are aligned across logistics functions. Cross-functional teams collaborate regularly to improve end-to-end flow and reduce waste. Information systems support data sharing internally. Accountability for value delivery is shared. Customer satisfaction metrics influence operations.",
    "Logistics processes are aligned with suppliers and customers, creating a coordinated value stream. Integrated planning and execution improve responsiveness and reduce delays. Performance metrics cascade through the entire supply chain. Continuous improvement initiatives are cross-organizational. Collaboration fosters innovation.",
    "End-to-end value stream integration extends beyond the company to include suppliers, partners, and customers in a seamless ecosystem. Real-time data sharing and synchronized processes optimize flow and service delivery. Joint improvement projects drive innovation and value creation. The supply chain operates as a unified, customer-centric network. The organization is a benchmark for value stream integration."
  ]
},

// 25. Waste Identification and Elimination — Logistics & Supply Chain
{
  dimensionName: "Waste Identification and Elimination",
  sectorName: "Logistics",
  levels: [
    "Waste such as excess motion, waiting, overprocessing, and defects is largely unmanaged and unrecognized. Teams may be unaware of waste types or their impact on logistics costs and service. Improvement efforts focus on firefighting rather than waste reduction. Processes are inefficient, leading to delays and increased expenses. Waste reduction is not part of the culture.",
    "Staff begin identifying common wastes during Kaizen events or targeted improvement projects. Some efforts to reduce motion, waiting, or excess inventory are initiated but not sustained. Awareness of waste types grows but tools and methods are inconsistently applied. Results are uneven, and waste often recurs. Cultural resistance to change persists.",
    "Waste elimination becomes systematic, supported by Lean tools such as value stream mapping and 5S. Cross-functional teams regularly analyze processes to detect and reduce waste. Data supports identification and prioritization of waste reduction initiatives. Teams celebrate waste reduction successes. Continuous improvement cycles target waste elimination.",
    "Waste reduction is embedded in daily management systems with clear accountability. Metrics track waste elimination progress, and improvements are sustained. Advanced techniques like root cause analysis and poka-yoke target persistent wastes. Waste identification includes environmental and energy considerations. The culture prioritizes efficiency and resource optimization.",
    "Waste elimination is a strategic priority driving operational excellence and sustainability. Innovative methods continuously identify and prevent waste before it impacts operations. The organization benchmarks and shares best practices in waste reduction. Lean culture ensures all employees proactively detect and address waste. Waste minimization contributes to cost leadership and environmental stewardship."
  ]
},

// 26. Handoffs and Queue Reduction — Logistics & Supply Chain
{
  dimensionName: "Handoffs and Queue Reduction",
  sectorName: "Logistics",
  levels: [
    "Handoffs between warehouses, transport teams, and other departments are frequent, inconsistent, and error-prone, causing delays and information loss. There are no standardized handoff protocols, and queues for loading, unloading, or processing are common. Communication is fragmented, leading to confusion and inefficiency. Delays in one area cascade through the supply chain. Customer service suffers due to unpredictability.",
    "Structured handoff tools and communication standards are introduced in some areas, reducing errors. Teams begin to coordinate schedules to minimize queues, but efforts are patchy and lack broad application. Handoffs improve within departments but remain problematic across functions. Feedback about handoff quality is inconsistent. Queue lengths and wait times are measured sporadically.",
    "Standardized handoff protocols are implemented across major logistics functions. Communication during transitions is clearer and more reliable, supported by checklists and digital tools. Scheduling and process flow coordination reduce queues and waiting times significantly. Teams monitor handoff metrics closely and address issues proactively. Cross-functional collaboration improves continuity.",
    "Handoffs are minimized and seamlessly managed with real-time coordination between warehouses, transport, and suppliers. Queue reduction strategies are integrated into operational planning and performance reviews. Teams use predictive analytics to anticipate and resolve bottlenecks before they occur. Quality and timeliness of handoffs are continuously improved. Customer satisfaction metrics reflect improved flow.",
    "Handoffs and queues are nearly eliminated through end-to-end process integration and automation. Real-time digital systems synchronize activities across the entire supply chain, ensuring smooth transitions. Continuous monitoring and rapid response prevent bottlenecks. The organization collaborates with partners to optimize handoffs beyond internal operations. Handoff excellence supports superior service and agility."
  ]
},

// 27. Documentation Discipline — Logistics & Supply Chain
{
  dimensionName: "Documentation Discipline",
  sectorName: "Logistics",
  levels: [
    "Documentation of shipments, inventory, and process steps is incomplete, inconsistent, or delayed. Paper-based records or informal notes cause errors and inefficiencies. Lack of standardized forms or procedures hampers accuracy and traceability. Compliance risks increase due to poor documentation. Staff rely heavily on memory or verbal instructions.",
    "Documentation standards are introduced and enforced through basic training and audits. Digital record-keeping may start in some areas but is inconsistent. Accuracy and timeliness improve, but gaps remain. Frontline accountability for documentation grows slowly. Data retrieval and sharing are limited.",
    "Documentation is disciplined and standardized across logistics functions. Electronic systems support real-time data entry and retrieval. Staff are trained and accountable for accurate, timely documentation. Audits and feedback loops reinforce compliance. Documentation supports operational control and customer requirements.",
    "Documentation is fully integrated with digital workflows and ERP systems. Real-time visibility into shipment status, inventory, and process compliance is available. Errors and omissions are rare due to validation and automation. Continuous monitoring ensures data quality and accessibility. Documentation supports decision-making and regulatory compliance.",
    "Documentation is seamless, automated, and error-proofed across all logistics processes. Advanced digital tools integrate documentation with operational systems and analytics. Data accuracy is near 100%, supporting real-time decision-making and traceability. The organization continuously improves documentation practices and shares best practices. Documentation excellence enhances transparency and customer trust."
  ]
},

// 28. Digitization of Workflows — Logistics & Supply Chain
{
  dimensionName: "Digitization of Workflows",
  sectorName: "Logistics",
  levels: [
    "Workflows are mostly manual or paper-based, leading to delays, errors, and lack of visibility. Processes rely on informal communication and physical paperwork. Digital tools are limited or fragmented. Data collection and sharing are inefficient. Manual tasks increase operational risks and costs.",
    "Selective digitization begins in certain logistics areas, such as barcode scanning or inventory tracking. Basic digital tools support specific functions but are not integrated. Staff receive some training on digital processes. Workflow digitization is project-based and inconsistent. Data silos persist.",
    "Digital workflows are implemented more broadly, connecting key logistics functions such as order processing, warehousing, and transportation. Systems integrate to enable better data sharing and process automation. Training supports widespread adoption. Digital tools improve accuracy, speed, and traceability. Workflow standardization increases.",
    "End-to-end digitization connects workflows across the entire supply chain, supported by comprehensive IT infrastructure. Real-time data capture and analysis enhance responsiveness and efficiency. Mobile access and user-friendly interfaces support frontline operators. Digital processes are continuously refined through feedback and improvement cycles. Integration with supplier and customer systems improves collaboration.",
    "Fully integrated, intelligent digital workflows automate logistics operations end-to-end. AI and machine learning optimize processes dynamically. Workflow digitization supports predictive analytics, autonomous decision-making, and real-time adjustment to demand changes. The organization leads in digital innovation and shares expertise externally. Digitization drives operational excellence and competitive advantage."
  ]
},

// 29. Lean Integrated into Corporate Strategy — Logistics & Supply Chain
{
  dimensionName: "Lean Integrated into Corporate Strategy",
  sectorName: "Logistics",
  levels: [
    "Lean principles are largely absent from corporate strategy and planning. Improvement efforts are fragmented, reactive, and disconnected from organizational goals. Leadership does not articulate a vision for Lean transformation. Resource allocation for Lean initiatives is minimal or ad hoc. Lean is perceived as a short-term program or cost-cutting tool.",
    "Lean is recognized as a potential improvement approach, with isolated pilot projects aligned to specific operational issues. Some strategic discussions include Lean terminology, but commitment is limited. Resource planning begins to consider Lean initiatives selectively. Leadership awareness grows but lacks full integration. Lean remains a tactical rather than strategic focus.",
    "Lean is formally integrated into corporate strategy, with clear goals linked to operational performance and customer satisfaction. Leadership communicates Lean’s role in achieving business objectives. Resources are allocated systematically to support Lean deployment across logistics functions. Strategic reviews include Lean metrics. Alignment between Lean initiatives and corporate priorities improves.",
    "Lean thinking is embedded deeply in strategy development and execution. Cross-functional collaboration supports holistic Lean transformation across the supply chain. Lean goals influence capital investments, technology adoption, and supplier management. Leadership regularly reviews Lean progress and adjusts plans dynamically. Lean culture supports strategic agility.",
    "Lean principles shape the organization’s long-term vision and competitive strategy. Lean transformation drives innovation, customer value creation, and sustainable growth. The company benchmarks against industry leaders and continuously evolves its Lean approach. Lean is a core component of corporate identity and governance. Strategy deployment is agile, inclusive, and data-driven."
  ]
},

// 30. Hoshin Kanri or Strategy Deployment — Logistics & Supply Chain
{
  dimensionName: "Hoshin Kanri or Strategy Deployment",
  sectorName: "Logistics",
  levels: [
    "Strategy deployment is informal or absent, resulting in inconsistent goal alignment and disconnected improvement efforts. Communication of strategic priorities is top-down and unclear. Departments operate independently with little coordination. Lean objectives, if present, are not cascaded systematically. Accountability for strategy execution is weak.",
    "Basic strategy deployment tools are introduced, and some efforts are made to cascade goals to departments. Strategy communication improves but lacks clarity or regularity. Improvement projects begin to align with organizational priorities. Departments start sharing information but coordination remains limited. Feedback mechanisms are inconsistent.",
    "Structured strategy deployment processes, such as Hoshin Kanri, are implemented to align goals across functions. Regular reviews ensure progress tracking and accountability. Cross-functional teams participate in strategy execution. Lean objectives are cascaded through performance management systems. Communication and collaboration improve.",
    "Strategy deployment is dynamic and data-driven, with real-time monitoring of key metrics. Cross-functional leadership engagement and feedback loops enable adaptive planning. Improvement initiatives are aligned with strategic priorities and continuously refined. Strategy is communicated clearly and consistently throughout the organization. Lean principles guide execution and governance.",
    "Strategy deployment is fully integrated, agile, and participatory at all organizational levels. Continuous alignment, adjustment, and accountability drive Lean transformation success. Digital platforms support transparent strategy communication and progress tracking. The organization demonstrates strategic agility and innovation. Lean strategy deployment is a source of competitive advantage."
  ]
},

// 31. Supplier Collaboration — Logistics & Supply Chain
{
  dimensionName: "Supplier Collaboration",
  sectorName: "Logistics",
  levels: [
    "Supplier interactions are primarily transactional, focused on purchase orders and deliveries with little engagement in improvement efforts. Communication is limited, and supplier issues like delays or quality problems are handled reactively. There is no structured process for joint problem-solving or Lean integration. Supplier performance variability disrupts flow regularly. Partnerships lack transparency and trust.",
    "Some basic supplier scorecards and performance tracking are in place. Suppliers receive forecasts and participate in occasional meetings. Collaboration on quality or delivery issues is limited and mostly reactive. Lean concepts are introduced to a few key suppliers. Data sharing is informal and not timely. Supplier variability still affects operations significantly.",
    "Regular reviews align supplier expectations and performance goals. Joint problem-solving initiatives begin, focusing on delivery reliability and quality improvements. Suppliers adopt some Lean practices, supported by shared metrics and collaboration tools. Communication channels are more open, enabling better coordination. Continuous improvement efforts include supplier input.",
    "Strong partnerships exist with key suppliers, including joint planning and Lean integration. Suppliers participate actively in improvement events and innovation initiatives. Data sharing is real-time and comprehensive. Collaborative governance ensures alignment of objectives and rapid resolution of issues. Suppliers are seen as extensions of the logistics Lean system.",
    "Supplier collaboration is strategic and embedded in overall Lean supply chain management. Suppliers and logistics teams co-develop processes, technologies, and innovations that drive mutual benefits. Digital integration enables seamless real-time data exchange. Continuous joint improvement programs enhance supply chain resilience and performance. The organization leads in fostering Lean supplier networks."
  ]
},

// 32. Customer Focus — Logistics & Supply Chain
{
  dimensionName: "Customer Focus",
  sectorName: "Logistics",
  levels: [
    "Logistics teams have limited awareness of customer needs or expectations. Work is focused on internal processes rather than customer outcomes. Customer feedback is rare or handled only by sales or customer service departments. Delivery errors and delays occur frequently without root cause investigation. Customer satisfaction is not tracked or prioritized.",
    "Customer data such as complaints and delivery metrics are shared occasionally with logistics teams. Teams begin to understand the impact of their work on customer satisfaction but lack systematic processes to act on feedback. Improvements focus mainly on fixing visible issues. Customer-centric thinking is growing but not embedded. Communication between logistics and customer service is inconsistent.",
    "Customer KPIs such as on-time delivery and order accuracy are tracked regularly by logistics teams. Root cause analysis of customer complaints is integrated into problem-solving efforts. Teams participate in voice-of-customer reviews and use feedback to prioritize improvements. Customer focus is a recognized goal across logistics functions. Cross-functional collaboration with customer-facing departments improves.",
    "Logistics operations proactively align with customer priorities and expectations. Customer satisfaction metrics influence daily management and strategic decisions. Teams participate in product launches and service design to incorporate logistics feasibility and customer impact. Continuous improvement efforts target customer value creation. Customer focus is embedded in the culture.",
    "Customer focus is deeply ingrained and drives all logistics strategies and operations. The organization uses advanced analytics and direct customer engagement to anticipate and exceed expectations. Logistics teams innovate solutions that enhance customer experience and loyalty. Customer feedback cycles are rapid and embedded in continuous improvement. The company is recognized for logistics excellence and customer-centricity."
  ]
},

// 33. Performance Measurement and Metrics — Logistics & Supply Chain
{
  dimensionName: "Performance Measurement and Metrics",
  sectorName: "Logistics",
  levels: [
    "Performance data is limited, outdated, or inconsistent, hindering effective management. Key logistics metrics such as delivery times, inventory accuracy, or equipment uptime are not systematically tracked. Decisions are often based on intuition or anecdotal information. Reporting is irregular and not transparent. Accountability for performance is weak.",
    "Basic KPIs are defined and tracked in some areas, such as shipment punctuality or stock levels. Data collection is often manual or delayed. Some teams begin using performance data in meetings and problem-solving but analysis is superficial. Metrics focus on output rather than process quality or efficiency. Visibility of performance varies across functions.",
    "A balanced set of logistics performance metrics is consistently tracked, including quality, delivery, cost, and safety indicators. Data collection is increasingly automated and timely. Teams use metrics to identify improvement opportunities and monitor project outcomes. Dashboards and visual management tools support regular performance reviews. Accountability is reinforced through targets and feedback.",
    "Performance measurement is integrated across logistics functions with real-time data and advanced analytics. Metrics are linked to strategic goals and customer satisfaction. Teams proactively use data to anticipate issues and drive continuous improvement. Performance discussions occur regularly at all organizational levels. Metrics evolve to reflect process improvements and innovation.",
    "Performance measurement is predictive, comprehensive, and fully embedded in decision-making processes. Advanced analytics, benchmarking, and AI support continuous refinement of metrics and targets. Performance data is transparent and drives accountability across the supply chain. The organization uses performance insights to lead industry standards and share best practices externally."
  ]
},

// 34. Sustainability and Environmental Responsibility — Logistics & Supply Chain
{
  dimensionName: "Sustainability and Environmental Responsibility",
  sectorName: "Logistics",
  levels: [
    "Environmental considerations are minimal or absent from logistics operations. Waste generation, energy use, and emissions are not tracked or managed. Sustainability is not part of the organizational agenda. Compliance with regulations is reactive rather than proactive. Employees have limited awareness of environmental impact.",
    "Basic sustainability initiatives such as waste reduction programs or energy-saving measures are introduced in isolated areas. Some data on environmental impact is collected but not systematically analyzed. Awareness of sustainability grows slowly among leadership and staff. Compliance efforts focus on meeting legal requirements. Sustainability is not fully integrated into logistics processes.",
    "Sustainability goals are incorporated into logistics planning and performance metrics. Initiatives focus on reducing carbon footprint, optimizing routes, and minimizing waste. Teams engage in continuous improvement projects with environmental benefits. Supplier sustainability practices are assessed and encouraged. Employee training includes environmental responsibility.",
    "Environmental sustainability is a strategic priority, integrated into supply chain design and execution. Advanced technologies and data analytics optimize energy use, emissions, and material consumption. Collaboration with suppliers and customers supports shared sustainability goals. Continuous monitoring and reporting ensure progress and transparency. The organization fosters a culture of environmental stewardship.",
    "Sustainability drives innovation and competitive advantage across logistics operations. The organization pioneers green logistics practices, including renewable energy use, electric fleets, and circular economy models. Sustainability metrics are fully integrated with financial and operational KPIs. Stakeholder engagement and reporting exceed industry standards. The company is recognized as a leader in sustainable supply chain management."
  ]
},

// 35. Continuous Improvement Culture — Logistics & Supply Chain
{
  dimensionName: "Continuous Improvement Culture",
  sectorName: "Logistics",
  levels: [
    "Continuous improvement (CI) efforts are sporadic, isolated, and often driven by external consultants or management mandates. Employees are generally passive participants. Improvement activities lack structure or follow-through. Successes are not widely shared or celebrated. Lean principles are poorly understood.",
    "CI activities such as Kaizen events or suggestion programs begin to take root in some departments. Participation increases but remains uneven and often event-driven. Management supports improvement but struggles with sustaining momentum. Communication about CI is improving but lacks consistency. Employees start to see the value of improvement efforts.",
    "CI is integrated into daily work, with teams regularly identifying, prioritizing, and implementing improvements. Structured problem-solving and Lean tools are widely used. Improvement projects link to performance metrics and strategic goals. Successes are communicated and recognized. Leadership actively coaches and supports CI.",
    "A strong CI culture permeates the organization, with all employees empowered and accountable for improvement. CI is embedded in processes, training, and performance management. Cross-functional collaboration accelerates problem-solving and innovation. Continuous learning and adaptation are norms. The organization systematically captures and shares best practices.",
    "CI is a core organizational competency and competitive advantage. The culture fosters experimentation, innovation, and rapid iteration. Improvement cycles are relentless, supported by advanced analytics and digital tools. The company leads its industry in Lean maturity and operational excellence. CI is woven into every aspect of logistics and business strategy."
  ]
},

// 36. Visual Performance Management — Logistics & Supply Chain
{
  dimensionName: "Visual Performance Management",
  sectorName: "Logistics",
  levels: [
    "Performance data is rarely displayed or accessible to frontline staff. Operators and supervisors lack visibility into key metrics such as shipment accuracy, inventory levels, or equipment uptime. Discussions on performance focus primarily on output rather than quality or process improvement. Visual tools like boards or dashboards are absent or underutilized. Performance management is largely reactive and inconsistent.",
    "Some basic visual management tools, such as whiteboards or printed charts, are introduced in limited areas. Metrics like daily shipments or error rates are displayed but often outdated or incomplete. Frontline teams occasionally reference these visuals during meetings. Ownership of visual tools is unclear, leading to inconsistent maintenance and engagement. Improvements in performance visibility are incremental.",
    "Visual management boards are regularly updated and widely used across logistics teams. Metrics align with operational and strategic goals, including quality, delivery, and safety indicators. Visual cues such as color-coding help quickly identify abnormalities and trigger problem-solving. Visual management is integrated into daily meetings and huddles. Teams take responsibility for maintaining accurate and meaningful visuals.",
    "Digital visual performance management systems provide real-time data accessible to all relevant personnel. Visuals support proactive decision-making and continuous improvement initiatives. Leaders use visual data to coach teams and drive accountability. Metrics evolve dynamically based on business needs and improvement cycles. Visual management fosters transparency and collaboration across departments.",
    "Visual performance management is fully integrated with enterprise systems, offering interactive, real-time dashboards across sites and functions. Predictive analytics inform decision-making and highlight potential issues before they impact operations. Visualization of strategy deployment cascades performance goals throughout the organization. Visual tools promote a culture of transparency, empowerment, and continuous learning. The organization benchmarks and shares best practices externally."
  ]
},

// 37. Risk Management and Mitigation — Logistics & Supply Chain
{
  dimensionName: "Risk Management and Mitigation",
  sectorName: "Logistics",
  levels: [
    "Risk identification and mitigation are informal and reactive. Logistics teams address problems as they occur, with limited foresight or contingency planning. Risks such as supply disruptions, equipment failures, or safety incidents are not systematically tracked. Communication about risks is sporadic. The organization is vulnerable to unexpected disruptions.",
    "Basic risk registers and assessments are introduced in key areas. Some contingency plans exist but are limited in scope and application. Teams begin to recognize and communicate potential risks. Training on risk awareness is sporadic. Risk management activities are largely manual and inconsistent.",
    "Structured risk management processes are implemented across logistics functions. Risks are regularly identified, assessed, and prioritized using formal tools. Mitigation plans are developed and monitored. Cross-functional teams collaborate to reduce exposure to common logistics risks. Incident data informs continuous improvement in risk practices.",
    "Risk management is integrated into daily operations and strategic planning. Advanced analytics predict potential risks, enabling proactive mitigation. Training and communication foster a culture of risk awareness and responsibility. Lessons learned from incidents drive improvements. Risk management supports operational resilience.",
    "Risk management is predictive, comprehensive, and embedded in all logistics processes. Real-time monitoring and AI-driven analytics anticipate disruptions and enable rapid response. Collaboration with suppliers and partners enhances supply chain resilience. The organization continuously improves risk frameworks and shares knowledge. Risk management is a competitive advantage."
  ]
},

// 38. Employee Development and Career Pathways — Logistics & Supply Chain
{
  dimensionName: "Employee Development and Career Pathways",
  sectorName: "Logistics",
  levels: [
    "Employee development is ad hoc with limited formal training or career planning. Growth opportunities are unclear, leading to low motivation and high turnover. Skills development focuses on immediate job tasks rather than long-term capability building. Supervisors rarely coach or mentor. Employee engagement in learning is minimal.",
    "Basic training programs and some career pathways are introduced. Employees receive occasional coaching and skill development support. Awareness of career options grows, but progression processes lack structure. Training is primarily classroom-based with limited hands-on application. Engagement in development varies.",
    "Structured development programs and clear career pathways exist for operators, supervisors, and managers. Training combines classroom, on-the-job coaching, and Lean skill development. Mentoring and performance feedback support growth. Employees are encouraged to participate in improvement projects as part of development. Retention improves.",
    "Employee development is integrated with Lean culture and business objectives. Leadership development programs include Lean coaching and strategic thinking. Continuous learning is supported through formal and informal channels. Career progression aligns with skill mastery and contribution to improvement. Succession planning identifies and prepares future leaders.",
    "Development and career pathways are proactive, personalized, and aligned with organizational strategy. Advanced training, certification, and leadership development programs are widely available. The organization fosters a learning culture that encourages innovation and growth at all levels. Employee development metrics inform workforce planning. The company is recognized as an employer of choice in logistics."
  ]
},

// 39. Information Technology Integration — Logistics & Supply Chain
{
  dimensionName: "Information Technology Integration",
  sectorName: "Logistics",
  levels: [
    "IT systems are fragmented, with limited integration between warehousing, transportation, and procurement functions. Data silos cause inefficiencies and errors. Manual data entry and paper-based processes prevail. IT support is reactive and uncoordinated. Visibility into operations is limited.",
    "Basic IT systems such as Warehouse Management Systems (WMS) or Transportation Management Systems (TMS) are introduced in parts of the operation. Some integration exists but is limited in scope and reliability. Staff receive minimal training on IT tools. Data sharing between systems remains manual and inconsistent. IT initiatives are project-based.",
    "IT systems are more broadly deployed and integrated across major logistics functions. Real-time data capture improves accuracy and decision-making. System training is comprehensive and supported by help resources. Data flows more seamlessly between systems, supporting end-to-end process visibility. IT supports continuous improvement initiatives.",
    "Advanced IT integration connects logistics operations internally and with external partners. Cloud-based platforms, APIs, and digital dashboards provide real-time visibility and analytics. Systems support automation, workflow digitization, and predictive analytics. IT strategy aligns with business goals. Continuous IT improvement is embedded in governance.",
    "IT is fully integrated, intelligent, and strategic, enabling autonomous logistics operations. Artificial intelligence, machine learning, and blockchain technologies support transparency, traceability, and optimization. Real-time collaboration with suppliers and customers is seamless. IT drives innovation and competitive advantage. The organization leads in digital logistics transformation."
  ]
},

// 40. Cross-Functional Collaboration — Logistics & Supply Chain
{
  dimensionName: "Cross-Functional Collaboration",
  sectorName: "Logistics",
  levels: [
    "Collaboration between logistics functions (warehousing, transportation, procurement) is limited and siloed. Departments work independently with minimal communication. Joint problem-solving is rare. Conflicts or misunderstandings between functions are common. Collaboration is seen as optional rather than necessary.",
    "Some cross-functional meetings and improvement projects are initiated, often driven by management. Collaboration improves but is inconsistent and sometimes superficial. Communication channels develop slowly. Teams begin sharing data and coordinating schedules. Trust between functions is fragile.",
    "Regular cross-functional teams collaborate on planning, problem-solving, and process improvements. Shared goals and metrics align efforts. Communication is open and constructive. Teams work together to resolve issues impacting multiple functions. Collaboration contributes to improved logistics performance.",
    "Cross-functional collaboration is embedded in daily operations and strategic initiatives. Teams use joint problem-solving methods and continuous improvement processes. Communication is seamless, supported by digital platforms. Trust and mutual accountability are strong. Collaboration drives innovation and agility.",
    "Collaboration spans internal departments, suppliers, and customers, forming integrated logistics networks. Cross-functional teams lead enterprise-wide improvement and innovation initiatives. Shared digital tools enable transparency and real-time coordination. Collaboration is a cultural norm and competitive advantage. The organization is recognized for partnership excellence."
  ]
},

// 41. Knowledge Management and Best Practice Sharing — Logistics & Supply Chain
{
  dimensionName: "Knowledge Management and Best Practice Sharing",
  sectorName: "Logistics",
  levels: [
    "Knowledge sharing is informal and sporadic, relying heavily on individual experience. Best practices are not documented or communicated consistently. Lessons learned from problems or improvements are rarely shared beyond immediate teams. Organizational memory is weak, leading to repeated mistakes and inefficiencies. Training is mostly reactive and inconsistent.",
    "Some efforts to document and share best practices emerge, often in response to specific issues. Informal communities of practice or knowledge-sharing sessions begin to form. Communication channels are limited and not standardized. Lessons learned are shared within departments but seldom across the organization. Knowledge retention is partial.",
    "Best practice repositories and structured knowledge management systems are established. Regular forums and workshops facilitate sharing of successes and lessons learned across logistics functions. Employees actively contribute and access knowledge resources. Knowledge transfer is incorporated into training and onboarding. Continuous improvement benefits from shared learning.",
    "Knowledge management is integrated into business processes and supported by digital platforms. Cross-functional and cross-site knowledge sharing is routine. Best practices are benchmarked against industry standards and adapted. Leadership promotes a culture of continuous learning and open information exchange. Knowledge assets are protected and leveraged strategically.",
    "Knowledge management is a strategic asset driving innovation and operational excellence. Advanced technologies such as AI support capturing, curating, and disseminating logistics knowledge in real time. The organization fosters a global learning network including suppliers and partners. Best practice sharing accelerates improvement cycles and competitive advantage. Learning agility is embedded in the culture."
  ]
},

// 42. Safety Culture — Logistics & Supply Chain
{
  dimensionName: "Safety Culture",
  sectorName: "Logistics",
  levels: [
    "Safety practices are minimal and reactive, with accidents and incidents often caused by unsafe conditions or behaviors. Safety training is limited or inconsistent. Employees may feel unsafe or reluctant to report hazards. Safety policies exist but are poorly enforced. Incident investigations focus on blame rather than prevention.",
    "Basic safety protocols and training programs are implemented. Hazard reporting increases but may still be informal or inconsistent. Safety incidents begin to decrease as awareness grows. Supervisors emphasize compliance but may lack coaching skills. Safety is recognized as important but not yet ingrained in daily behaviors.",
    "Safety culture develops with active employee participation in hazard identification and risk mitigation. Safety committees and regular audits support continuous improvement. Near-miss reporting and root cause analysis become standard. Leadership visibly supports safety initiatives. Training and communication reinforce safe behaviors.",
    "Safety is integrated into all logistics processes and daily management systems. Proactive hazard controls and safety performance metrics drive behavior change. Employees are empowered to stop work for safety concerns. Safety leadership is visible and accountable. Continuous learning from incidents and data analysis reduces risks.",
    "Safety culture is exemplary, characterized by zero harm philosophy and proactive risk management. Advanced technologies support hazard detection and prevention. Safety excellence is recognized internally and externally. The organization fosters psychological safety and continuous safety innovation. Safety performance drives operational excellence and reputation."
  ]
},
// 43. Innovation Capability — Logistics & Supply Chain
{
  dimensionName: "Innovation Capability",
  sectorName: "Logistics",
  levels: [
    "Innovation efforts are rare and often limited to reactive problem solving. There is little support or structure for creative ideas or experimentation. Employees may be hesitant to propose changes due to fear of failure or lack of incentives. Innovation is not a strategic priority. Processes are largely traditional and incremental.",
    "Some isolated innovation initiatives occur, often driven by specific projects or external consultants. Teams experiment with new ideas but lack systematic evaluation or support. Leadership begins to recognize the importance of innovation but struggles to embed it culturally. Innovation efforts are sporadic and uncoordinated.",
    "Innovation capability grows with structured programs encouraging idea generation and experimentation. Cross-functional teams collaborate on pilot projects and improvements. Resources and time are allocated for innovation activities. Successes are celebrated and shared. Innovation begins to influence logistics processes and technology adoption.",
    "Innovation is integrated into the continuous improvement culture and strategic planning. The organization fosters creativity, risk-taking, and learning from failure. Collaborative partnerships with suppliers, customers, and technology providers enhance innovation. Advanced tools and methodologies support rapid prototyping and scaling. Innovation contributes significantly to competitive advantage.",
    "Innovation is a core organizational competency and cultural norm. The logistics operation continuously pioneers new technologies, processes, and business models. Innovation ecosystems extend beyond the company to include external partners and industry consortia. The organization systematically measures and rewards innovation impact. Logistics innovation leads industry transformation."
  ]
},

// 44. Workforce Flexibility and Multi-Skilling — Logistics & Supply Chain
{
  dimensionName: "Workforce Flexibility and Multi-Skilling",
  sectorName: "Logistics",
  levels: [
    "Workforce roles are rigid and narrowly defined, limiting flexibility and adaptability. Cross-training is minimal or absent. Employees perform repetitive tasks without exposure to other functions. Staffing challenges arise during peak periods or disruptions. The workforce is vulnerable to turnover and skill shortages.",
    "Some cross-training programs are introduced, often in response to operational needs. Multi-skilling is encouraged but limited to specific teams or roles. Employees begin to understand the benefits of flexibility but may lack motivation or support. Workforce planning remains reactive. Scheduling is inflexible.",
    "Structured multi-skilling programs are implemented, enabling employees to perform multiple tasks and rotate across functions. Flexibility improves response to demand variability and reduces bottlenecks. Workforce planning incorporates skills availability and development. Employees are motivated through recognition and development opportunities. Scheduling adapts to workload fluctuations.",
    "Workforce flexibility is embedded in logistics operations with ongoing multi-skilling and competency development. Cross-functional teams optimize labor deployment based on demand and skills. Training is continuous and linked to career pathways. Workforce agility supports innovation and improvement initiatives. Scheduling and resource allocation are dynamic and data-driven.",
    "Workforce flexibility is strategic and optimized through predictive analytics and real-time workforce management systems. Employees are highly skilled, empowered, and engaged in continuous learning. Multi-skilling supports seamless operations and rapid adaptation to change. Workforce strategy aligns with business goals and innovation. The organization is recognized for talent development and workforce excellence."
  ]
},

// 45. Data-Driven Decision Making — Logistics & Supply Chain
{
  dimensionName: "Data-Driven Decision Making",
  sectorName: "Logistics",
  levels: [
    "Decisions are primarily based on intuition, experience, or limited data. Data collection is inconsistent and often inaccurate. Reporting is delayed, hindering timely responses. There is limited analytical capability or culture of data use. Decision-making is reactive and fragmented.",
    "Basic data collection and reporting systems support decision-making in select areas. Managers begin using metrics to monitor performance and identify issues. Data accuracy and timeliness improve but are still limited. Analytical skills and tools are underdeveloped. Decisions are increasingly informed but not fully data-driven.",
    "Data-driven decision-making is established across logistics functions with regular use of performance metrics and analysis. Data visualization and dashboards support monitoring and problem-solving. Analytical capabilities are developed, including root cause analysis and forecasting. Decisions are proactive and aligned with strategic goals. Data quality and governance improve.",
    "Advanced analytics and business intelligence tools enable predictive and prescriptive decision-making. Data is integrated across systems for comprehensive insights. Cross-functional teams collaborate on data interpretation and action planning. Data literacy is widespread, and decision-making is evidence-based and agile. Continuous improvement is guided by data trends.",
    "Data-driven decision-making is embedded into the organizational DNA, supported by AI, machine learning, and real-time analytics. Decisions are optimized continuously, balancing operational efficiency, customer needs, and strategic objectives. The organization leads in data innovation and shares insights externally. Data governance and security are exemplary. Data culture drives competitive advantage."
  ]
},

// 46. Employee Engagement and Ownership — Logistics & Supply Chain
{
  dimensionName: "Employee Engagement and Ownership",
  sectorName: "Logistics",
  levels: [
    "Employee engagement is low, with limited motivation or connection to organizational goals. Frontline workers often feel like cogs in the machine, with little sense of ownership over their work or improvement initiatives. Communication is mostly one-way from management, and feedback mechanisms are lacking. Turnover may be high, and absenteeism common. Engagement is not measured or prioritized.",
    "Some efforts to engage employees through suggestion programs or team meetings begin. Employees are encouraged to share ideas, but follow-up and implementation are inconsistent. Communication improves but remains largely top-down. Engagement levels vary widely between teams and locations. Recognition and rewards for engagement are sporadic.",
    "Employee engagement is actively fostered through regular two-way communication, empowerment in problem-solving, and involvement in improvement projects. Teams take ownership of local processes and contribute to broader goals. Engagement surveys and feedback mechanisms are used to monitor morale and participation. Recognition programs reinforce positive behaviors. Engagement contributes to operational improvements.",
    "Engagement is deeply embedded in culture and leadership practices. Employees are encouraged and enabled to take initiative, innovate, and lead improvements. Leadership coaches and supports employees consistently. High engagement correlates with improved performance metrics and retention. Employee voice is influential in decision-making and strategy.",
    "Employee engagement is a strategic priority and a source of competitive advantage. Ownership and accountability are ingrained at all levels, with employees actively shaping logistics operations and culture. Engagement metrics are closely monitored and linked to business outcomes. The organization fosters a culture of trust, respect, and continuous dialogue. Employees are brand ambassadors and champions of Lean principles."
  ]
},

// 47. Governance and Accountability — Logistics & Supply Chain
{
  dimensionName: "Governance and Accountability",
  sectorName: "Logistics",
  levels: [
    "Governance structures are unclear or ineffective, with limited accountability for Lean initiatives or logistics performance. Roles and responsibilities are poorly defined. Performance issues are addressed inconsistently. There is little oversight or follow-through on improvement projects. Decision-making lacks transparency.",
    "Basic governance mechanisms, such as committees or steering groups, are formed to oversee Lean activities. Accountability begins to be assigned but enforcement is uneven. Roles and responsibilities are clarified but not fully embraced. Some performance reviews include Lean or logistics metrics. Governance processes are informal.",
    "Clear governance frameworks define roles, responsibilities, and escalation paths for logistics and Lean initiatives. Regular reviews monitor progress and ensure accountability. Governance includes cross-functional participation and leadership sponsorship. Performance and improvement outcomes are tracked systematically. Transparency improves decision-making and resource allocation.",
    "Governance is formalized and integrated with organizational strategy and risk management. Accountability is reinforced through performance contracts and incentives. Governance processes include continuous feedback and adjustment. Cross-functional collaboration supports holistic oversight. Governance drives sustainable Lean deployment and operational excellence.",
    "Governance is agile, data-driven, and embedded at all organizational levels. Accountability is transparent, consistent, and linked to strategic outcomes. Governance structures foster innovation, collaboration, and rapid decision-making. Continuous improvement and risk management are integral to governance. The organization is recognized for exemplary governance practices."
  ]
},

// 48. Customer-Centric Process Design — Logistics & Supply Chain
{
  dimensionName: "Customer-Centric Process Design",
  sectorName: "Logistics",
  levels: [
    "Process design focuses primarily on internal efficiency without considering customer needs or experiences. Customer requirements are not systematically captured or incorporated. Processes are rigid and reactive, leading to customer complaints and dissatisfaction. Feedback loops from customers are limited or absent. Customer-centric thinking is minimal.",
    "Some processes begin to incorporate customer feedback and requirements. Design changes address specific complaints or issues but lack holistic consideration. Customer data is collected sporadically and used reactively. Process improvements prioritize operational convenience over customer value. Collaboration with customer-facing teams is limited.",
    "Processes are designed and improved with regular input from customers and frontline staff. Customer journey mapping and value stream mapping include customer touchpoints. Improvements aim to enhance customer satisfaction, reduce lead times, and improve service quality. Customer feedback is systematically gathered and incorporated. Cross-functional collaboration supports customer-centric design.",
    "Customer-centric process design is standard practice, aligned with strategic customer value propositions. Processes are flexible, adaptive, and designed to exceed customer expectations. Real-time customer feedback informs continuous improvement. Collaboration extends to suppliers and partners to ensure end-to-end customer experience. The organization proactively anticipates customer needs.",
    "Customer-centric design is embedded in organizational culture and innovation strategy. Processes evolve continuously based on deep customer insights and predictive analytics. Customer co-creation and partnerships drive process innovation. The organization leads industry standards in customer experience excellence. Customer-centricity is a key competitive differentiator."
  ]
},

// 49. Resource Optimization — Logistics & Supply Chain
{
  dimensionName: "Resource Optimization",
  sectorName: "Logistics",
  levels: [
    "Resource use (labor, equipment, space) is inefficient and poorly managed. Overstaffing or understaffing is common, and equipment downtime reduces productivity. Space utilization is suboptimal, causing congestion and delays. Resource allocation is reactive and based on short-term needs. Waste and costs are high.",
    "Basic resource planning tools and scheduling improve labor and equipment utilization. Teams begin identifying resource bottlenecks and reallocating as needed. Space management is addressed in some areas but not comprehensively. Resource optimization efforts are localized and not sustained. Efficiency gains are inconsistent.",
    "Resource optimization is systematic, supported by workforce management systems and equipment maintenance plans. Space utilization is monitored and improved through layout redesigns. Resource allocation aligns with demand forecasts and operational priorities. Continuous improvement initiatives target resource waste reduction. Metrics track resource productivity.",
    "Advanced analytics and automation optimize resource deployment dynamically. Labor, equipment, and space are flexibly allocated to balance workload and maximize throughput. Cross-functional coordination enhances resource efficiency. Resource optimization supports sustainability goals and cost reduction. Performance targets include resource utilization metrics.",
    "Resource optimization is predictive, continuous, and integrated with business strategy. AI and real-time data adjust resources proactively to changing conditions. The organization achieves high asset utilization with minimal waste. Resource strategies align with innovation and growth objectives. Resource optimization contributes to competitive advantage and sustainability leadership."
  ]
},

// 50. Leadership Development — Logistics & Supply Chain
{
  dimensionName: "Leadership Development",
  sectorName: "Logistics",
  levels: [
    "Leadership development is minimal and unstructured. Supervisors and managers receive limited training focused mainly on operational tasks. Coaching and mentoring are rare. Leadership capabilities are inconsistent, affecting team performance and Lean adoption. Succession planning is absent.",
    "Basic leadership training programs are introduced, covering communication, problem-solving, and Lean awareness. Some coaching and mentoring occur but lack consistency and depth. Leadership development is reactive, often in response to performance issues. Leadership roles and expectations begin to be clarified.",
    "Structured leadership development programs exist, including formal training, coaching, and mentoring. Leadership competencies align with Lean principles and organizational goals. Leadership development is planned and evaluated systematically. Leaders actively support continuous improvement and employee engagement. Succession planning starts.",
    "Leadership development is integrated into talent management and business strategy. Leadership programs include advanced Lean coaching, change management, and strategic thinking. Leaders model Lean behaviors and drive cultural transformation. Continuous leadership assessment and development sustain capability. Succession planning ensures leadership pipeline strength.",
    "Leadership development is proactive, personalized, and aligned with future organizational needs. Leaders at all levels are empowered to innovate and coach Lean culture. Leadership programs incorporate external benchmarking and thought leadership. The organization fosters a community of practice among leaders. Leadership excellence is a core competitive advantage."
  ]
},

// 51. Problem-Solving Methodologies — Logistics & Supply Chain
{
  dimensionName: "Problem-Solving Methodologies",
  sectorName: "Logistics",
  levels: [
    "Problem-solving is mostly reactive and informal, relying on quick fixes rather than systematic approaches. Issues often recur because root causes are not identified or addressed. Employees have limited knowledge of structured problem-solving tools. Solutions tend to focus on symptoms rather than underlying problems. Learning from problems is minimal.",
    "Basic problem-solving techniques such as 5 Whys and PDCA cycles are introduced in select teams. Improvement events focus on resolving immediate issues. Training on methodologies is limited and not standardized. Some teams begin documenting problems and solutions but follow-up is inconsistent. Problem-solving remains largely event-driven.",
    "Structured problem-solving methodologies are widely adopted across logistics functions. Teams use tools such as A3 reports, root cause analysis, and standard work to systematically address issues. Problem-solving is integrated into daily work, with documented actions and results. Supervisors coach teams in effective methodologies. Problem-solving supports continuous improvement.",
    "Advanced problem-solving techniques and data analytics support complex and cross-functional issue resolution. Teams collaborate proactively to anticipate and prevent problems. Problem-solving outcomes are linked to performance metrics and shared broadly. Continuous learning from problems drives innovation. Problem-solving culture is strong and embedded.",
    "Problem-solving is a strategic capability, leveraging AI and predictive analytics to identify risks and opportunities. The organization fosters innovation through experimentation and rapid iteration. Lessons learned are institutionalized and disseminated globally. Problem-solving drives breakthrough improvements and competitive advantage. The culture celebrates challenges as opportunities."
  ]
},

// 52. Change Leadership — Logistics & Supply Chain
{
  dimensionName: "Change Leadership",
  sectorName: "Logistics",
  levels: [
    "Change initiatives are poorly managed, with limited leadership support or clear communication. Employees resist changes due to fear, lack of understanding, or mistrust. Change efforts often fail or stall. There is little planning or follow-up. Change is viewed as disruptive rather than beneficial.",
    "Change leadership skills begin to develop with some training for managers. Communication improves but is inconsistent. Change initiatives are more structured but still lack broad engagement. Leaders struggle to address resistance effectively. Employees have limited involvement in change processes.",
    "Leaders actively lead change efforts, communicating vision and rationale clearly. Stakeholders are engaged early, and resistance is managed proactively. Change management tools and processes support successful adoption. Training and coaching help employees adapt. Change leadership is recognized as critical.",
    "Change leadership is embedded into leadership development and organizational culture. Leaders model adaptability and resilience. Change initiatives are aligned with strategy and involve cross-functional collaboration. Continuous feedback and improvement strengthen change outcomes. The organization embraces change as an opportunity.",
    "Change leadership is a core competency driving agility and transformation. Leaders foster a culture of innovation and continuous adaptation. Change is anticipated and managed proactively using data and insights. The organization thrives in dynamic environments, maintaining competitive advantage. Change leadership excellence is benchmarked and shared."
  ]
},

// 53. Cross-Training and Knowledge Transfer — Logistics & Supply Chain
{
  dimensionName: "Cross-Training and Knowledge Transfer",
  sectorName: "Logistics",
  levels: [
    "Cross-training is minimal or nonexistent. Employees perform narrow roles with little exposure to other functions. Knowledge transfer relies on individual initiative rather than formal programs. Skill gaps create vulnerabilities during absences or turnover. Workforce flexibility is low.",
    "Some cross-training programs are initiated, often informally or in response to staffing needs. Knowledge transfer occurs through shadowing or mentoring but lacks structure. Employees recognize the benefits of cross-training but participation is limited. Workforce flexibility improves slightly. Documentation of skills is inconsistent.",
    "Structured cross-training and knowledge transfer programs are implemented across logistics functions. Training plans and schedules ensure coverage of critical skills. Mentoring and peer coaching support knowledge sharing. Workforce flexibility and coverage improve. Skill documentation is maintained and used for planning.",
    "Cross-training is integrated into workforce development and operational planning. Employees are regularly rotated to build broad capabilities. Knowledge transfer supports continuous improvement and innovation. Technology tools assist skill tracking and learning. Workforce agility enhances operational resilience.",
    "Cross-training and knowledge transfer are strategic priorities supported by advanced learning platforms and personalized development plans. The workforce is highly adaptable, with deep multi-functional skills. Knowledge transfer networks extend across partners and suppliers. Continuous learning is embedded in culture. Workforce capability is a competitive differentiator."
  ]
},

// 54. Visual Controls for Safety and Quality — Logistics & Supply Chain
{
  dimensionName: "Visual Controls for Safety and Quality",
  sectorName: "Logistics",
  levels: [
    "Visual controls related to safety and quality are sparse or absent. Employees rely on verbal instructions or written policies that are not easily accessible. Safety hazards and quality issues may go unnoticed or unaddressed. Training on visual controls is minimal. Incident rates are high.",
    "Basic visual controls such as signage, labels, and warning indicators are implemented in key areas. Employees begin to use visual cues to identify hazards or quality checkpoints. Visual controls are inconsistent and not standardized. Training on their use is limited. Safety and quality improve but remain reactive.",
    "Visual controls for safety and quality are standardized and integrated into workflows. Color-coding, floor markings, and checklists guide employee behavior and inspections. Visual management boards display safety and quality metrics prominently. Employees are trained and accountable for maintaining controls. Incident rates decline.",
    "Visual controls are dynamic and supported by digital technologies such as sensors and alerts. Controls are reviewed and updated regularly based on risk assessments and data analysis. Leadership uses visual data to coach and engage teams. Safety and quality culture is proactive and continuously improving. Visual controls prevent incidents before they occur.",
    "Visual controls are fully integrated with real-time monitoring systems and predictive analytics. Automated alerts and dashboards provide immediate feedback on safety and quality status. Employees and leaders use visual data to drive continuous innovation and risk reduction. The organization benchmarks and shares best practices. Visual control excellence supports world-class safety and quality performance."
  ]
},

// 55. Lean Culture Alignment — Logistics & Supply Chain
{
  dimensionName: "Lean Culture Alignment",
  sectorName: "Logistics",
  levels: [
    "Lean culture is poorly understood or embraced, often viewed as a set of tools rather than a mindset. Employees may be skeptical or resistant. Lean initiatives are project-based with limited sustainability. Communication about Lean values and behaviors is minimal. Cultural change is not managed.",
    "Awareness of Lean culture grows through training and initial engagement efforts. Some teams begin to adopt Lean behaviors, but consistency is lacking. Leadership communicates Lean importance but may lack role modeling. Lean is often seen as separate from daily work. Cultural gaps remain.",
    "Lean culture is established with widespread understanding and adoption of Lean principles and behaviors. Leadership models Lean values consistently. Employees are empowered and engaged in continuous improvement. Lean behaviors are reinforced through recognition and performance management. Culture supports Lean sustainability.",
    "Lean culture is deeply embedded and drives decision-making, problem-solving, and innovation. Cross-functional collaboration and learning are hallmarks. Leaders develop Lean capabilities and coach others. Continuous improvement is part of organizational DNA. Culture adapts dynamically to challenges.",
    "Lean culture is a defining organizational characteristic, driving strategic advantage and resilience. Lean thinking permeates all levels and functions, including partners and suppliers. The organization leads in Lean innovation and culture development. Lean culture is measured, managed, and continuously evolved. It supports excellence and transformation."
  ]
},

// 56. Technology Adoption for Lean — Logistics & Supply Chain
{
  dimensionName: "Technology Adoption for Lean",
  sectorName: "Logistics",
  levels: [
    "Technology use is limited and often disconnected from Lean objectives. Manual processes dominate. Technology adoption is reactive, driven by cost or compliance rather than Lean improvement. Employees may lack skills or confidence in technology. Integration between systems is poor.",
    "Selective adoption of technologies such as barcode scanners or basic warehouse management systems begins. Technology supports some Lean projects but is not fully integrated. Training and support are limited. Technology benefits are realized unevenly. Resistance to change persists.",
    "Technology adoption aligns with Lean objectives, supporting process standardization, visual management, and data collection. Systems integrate to improve workflow and visibility. Employees are trained and engaged in technology use. Technology enables continuous improvement and problem-solving. Investments support Lean strategy.",
    "Advanced technologies such as automation, robotics, and real-time analytics are deployed to enhance Lean processes. Integration across logistics systems supports seamless operations. Technology drives innovation and operational excellence. Change management supports adoption and optimization. Technology ROI is monitored.",
    "Technology adoption is strategic, innovative, and continuous. Emerging technologies such as AI, IoT, and machine learning transform Lean logistics operations. The organization leads in technology-enabled Lean innovation. Digital maturity supports agility, transparency, and sustainability. Technology is a key competitive differentiator."
  ]
},

// 57. Sustainability Metrics and Reporting — Logistics & Supply Chain
{
  dimensionName: "Sustainability Metrics and Reporting",
  sectorName: "Logistics",
  levels: [
    "Sustainability metrics are not defined or tracked in logistics operations. Reporting on environmental impact is minimal or absent. Awareness of sustainability’s importance is low. Compliance with regulations is reactive and limited. Sustainability is not linked to business performance.",
    "Basic sustainability metrics such as energy use, waste generation, or emissions are collected in some areas. Reporting is periodic and focused on compliance. Awareness among employees and leadership grows. Sustainability initiatives are localized and project-based. Data quality and consistency vary.",
    "Comprehensive sustainability metrics are defined, collected, and analyzed across logistics functions. Reporting is regular and supports management decisions. Sustainability goals align with corporate strategy. Employees participate in sustainability initiatives. Continuous improvement targets environmental performance.",
    "Sustainability metrics are integrated with financial and operational KPIs. Reporting is transparent and communicated to stakeholders. Data analytics support identifying improvement opportunities. Sustainability performance influences planning and resource allocation. The organization benchmarks and shares results externally.",
    "Sustainability metrics and reporting are strategic and innovative. Real-time monitoring and predictive analytics enable proactive environmental management. Reporting meets or exceeds industry and regulatory standards. Stakeholder engagement and transparency are exemplary. Sustainability performance drives competitive advantage and reputation."
  ]
}

// 1. Leadership Commitment — Logistics & Supply Chain
{
  dimensionName: "Leadership Commitment",
  sectorName: "Logistics",
  levels: [
    "Leaders in logistics see Lean primarily as a temporary cost-cutting initiative, with little long-term engagement. Their involvement is limited to crisis management when delivery failures or stockouts occur. Lean efforts are disconnected and sporadic, with unclear expectations communicated to staff. There is minimal visible leadership presence on the warehouse floor or in transportation operations. Employees often perceive Lean as a management trend rather than a sustained strategy.",
    "Some logistics leaders participate in Lean training or pilot improvement projects, usually reacting to specific operational challenges. Support is inconsistent and often symbolic, with few follow-up actions after events. Gemba walks and shop-floor visits begin but happen irregularly and lack structured coaching. Communication about Lean is top-down and limited, causing frontline teams to feel disconnected from leadership goals. Lean awareness grows slowly but is not yet embedded.",
    "Leaders actively sponsor Lean initiatives targeting key supply chain metrics such as on-time delivery and inventory accuracy. Regular performance reviews include Lean objectives, and managers conduct purposeful Gemba walks to understand frontline issues. Feedback loops improve, enabling two-way communication between staff and management. Cross-functional collaboration starts breaking down silos between warehousing, transport, and procurement functions. Lean becomes more visible as a strategic priority.",
    "Lean leadership is fully integrated into logistics operations and strategic planning. Senior leaders coach middle managers regularly and participate in continuous improvement activities. Lean metrics are embedded into dashboards and business reviews, ensuring alignment with corporate goals. Resources are dedicated to sustaining Lean projects across the supply chain, including supplier engagement. Leadership visibly champions Lean culture, driving employee motivation and innovation in operational processes.",
    "Leadership in logistics owns and drives Lean as a core strategic imperative, fostering a culture of continuous improvement and accountability. Decision-making is data-driven, leveraging real-time analytics and predictive tools to anticipate and resolve supply chain challenges proactively. Leaders empower teams at all levels to innovate and sustain improvements independently. The organization benchmarks itself externally and collaborates with suppliers and customers to extend Lean principles beyond internal operations. Lean becomes integral to the company’s identity and competitive advantage."
  ]
},

// 2. Coaching & Role Modeling — Logistics & Supply Chain
{
  dimensionName: "Coaching & Role Modeling",
  sectorName: "Logistics",
  levels: [
    "Coaching is minimal or absent; supervisors focus on task completion and meeting immediate targets. Feedback is often reactive and centered on errors rather than development. Lean language and behaviors are rarely modeled by leadership or supervisors. Problem-solving is mostly handled by supervisors themselves without involving operators. Lean principles are unfamiliar or seen as irrelevant by frontline staff.",
    "Some supervisors attend Lean workshops and begin experimenting with basic coaching during improvement events. Coaching remains informal and inconsistent, usually reactive to issues rather than proactive. Role modeling is limited to certain leaders or isolated teams. Peer learning and mentoring are sporadic and lack structure. Operators receive little guidance on Lean thinking or problem-solving methods outside events.",
    "Coaching becomes an expected part of supervisors’ roles, linked to regular Gemba walks and team huddles. Leaders use standardized coaching questions and provide feedback focused on root cause analysis and Lean tools. Visual coaching boards and checklists support development efforts. Operators begin documenting small improvements and sharing best practices. Coaching conversations encourage reflection and skill building within teams.",
    "Managers receive formal Lean coaching training and mentor frontline supervisors regularly. Coaching is data-informed, focusing on continuous development and accountability. Role modeling of Lean behaviors becomes routine across shifts and departments. Coaching extends beyond immediate teams, promoting cross-functional learning. Visual tools and skill matrices are widely used to track progress and identify development needs.",
    "Coaching is a strategic competency deeply embedded at all levels of the logistics organization. Master coaches support leadership development and frontline capability building. Lean language and behaviors are consistently modeled by leaders, reinforcing a culture of learning and continuous improvement. Coaching outcomes are tracked and linked to performance metrics and career progression. Peer coaching and mentoring networks thrive, sustaining Lean adoption company-wide."
  ]
},

// 3. Lean Mindset Adoption — Logistics & Supply Chain
{
  dimensionName: "Lean Mindset Adoption",
  sectorName: "Logistics",
  levels: [
    "Lean is viewed as a temporary program or cost-cutting exercise with little relevance to daily logistics work. Problem-solving is reactive, limited to firefighting disruptions or errors. Lean tools and concepts are unknown or inconsistently applied. Continuous improvement is not part of the organizational mindset. Employees feel disconnected from Lean goals.",
    "Awareness of Lean tools like PDCA and 5 Whys begins, with occasional use during improvement events. Problem-solving is still event-driven and not embedded in daily operations. Successes are not widely shared, limiting organizational learning. Lean language is used sporadically and inconsistently. Employees remain skeptical of Lean’s long-term value.",
    "Lean thinking starts to permeate daily conversations in logistics teams. Operators regularly apply problem-solving tools to address workflow issues and delays. Visual management supports Lean principles, and improvement ideas are actively collected and reviewed. Teams begin taking ownership of continuous improvement in their work areas. Collaboration between departments increases.",
    "Lean mindset is well established and integrated into logistics operations. Teams proactively challenge existing processes and seek to reduce waste and variability. Lean principles are routinely used in meetings, planning, and decision-making. Cross-functional collaboration is strong, with teams working together to improve end-to-end supply chain flow. Continuous improvement behaviors are widespread.",
    "Lean mindset is deeply ingrained and defines how logistics operates. Continuous improvement is instinctive, and teams innovate proactively to improve performance and customer satisfaction. Data-driven experimentation and learning cycles are common. Lean language and behaviors are consistent at all organizational levels. The company is recognized as a Lean leader in the logistics industry."
  ]
},

// 4. Employee Empowerment — Logistics & Supply Chain
{
  dimensionName: "Employee Empowerment",
  sectorName: "Logistics",
  levels: [
    "Operators have limited autonomy and decision-making authority. Suggestions for improvements are discouraged or ignored. Processes are rigid, with changes dictated top-down. There are no formal systems for collecting or implementing frontline ideas. Employees feel disengaged from improvement efforts.",
    "Operators begin voicing ideas during team meetings, but implementation is inconsistent and dependent on supervisors. Ownership of improvements remains unclear, with many ideas stalling due to lack of follow-through. Suggestion systems may be informal or ineffective. Cross-training is limited. Employees remain cautious about raising issues.",
    "Operators lead daily stand-up meetings and implement minor process changes within their teams. Visual boards track ideas, actions, and results, increasing transparency. Supervisors encourage idea sharing and recognize small wins. Cross-training improves workforce flexibility. Empowerment grows but may still be confined within individual teams.",
    "Operators are cross-trained and rotate between stations, taking responsibility for team performance and improvements. Formal suggestion systems with regular follow-up are in place and trusted. Teams set targets for implemented improvements and mentor newer employees. Empowerment extends across departments, promoting wider collaboration. Psychological safety supports open communication.",
    "Empowered employees independently identify and drive improvements across the supply chain. They co-design workflows, participate in planning, and lead structured improvement projects. The organization fosters a culture of autonomy and innovation, encouraging risk-taking within safe boundaries. Empowerment is reinforced by recognition programs and continuous learning opportunities. Employees take strategic ownership of operational excellence."
  ]
},

// 5. Psychological Safety — Logistics & Supply Chain
{
  dimensionName: "Psychological Safety",
  sectorName: "Logistics",
  levels: [
    "Fear of blame dominates, and mistakes are hidden or ignored. Open dialogue about errors or process issues is rare. Employees hesitate to raise concerns or challenge the status quo. There are no formal forums for honest discussion or learning. The culture inhibits innovation and improvement.",
    "Some supervisors encourage feedback, but the environment remains inconsistent. Discussions of problems may occur privately but are avoided in group settings. Blame culture persists unintentionally. Improvement initiatives are largely top-down. Employees are wary of being vulnerable.",
    "Teams hold open debriefs after incidents, focusing on learning rather than blame. Supervisors model vulnerability by admitting mistakes and encouraging input. Mistakes are treated as opportunities to improve systems and processes. Psychological safety increases, supporting more honest communication. Near-miss reporting begins to rise.",
    "Psychological safety is embedded in daily team huddles and problem-solving meetings. Leaders actively model and reinforce a safe environment for sharing ideas and concerns. Structured forums exist to discuss breakdowns and near-misses constructively. Employees trust that raising issues leads to support, not punishment. Transparency in communication is high.",
    "Psychological safety is a core organizational value, fully integrated into hiring, training, and leadership development. Teams confidently challenge unsafe or inefficient practices without fear. Feedback flows freely in all directions and is embraced as part of continuous improvement. The culture promotes bold experimentation and innovation. The logistics organization is resilient and adaptable."
  ]
},

// 6. Cross-Level Communication — Logistics & Supply Chain
{
  dimensionName: "Cross-Level Communication",
  sectorName: "Logistics",
  levels: [
    "Communication is primarily top-down, with limited opportunity for frontline operators to provide feedback. Important information often gets delayed or distorted as it moves through layers. Team meetings focus on task assignments rather than open dialogue. Feedback loops are weak or nonexistent, hindering timely problem-solving. Collaboration between shifts and departments is minimal.",
    "Some formal communication channels exist, such as monthly newsletters or bulletin boards, but participation is largely passive. Frontline feedback is collected sporadically, often informally, with little visible follow-up. Cross-shift communication improves slightly but remains inconsistent. Escalation of issues can be slow and unclear. Communication is still largely one-way.",
    "Daily tiered meetings and shift huddles establish structured two-way communication between operators and supervisors. Visual boards track key issues and progress on improvement actions. Supervisors begin representing operator concerns in management meetings. Communication across departments becomes more frequent and intentional. Teams start to build trust through regular updates.",
    "Real-time escalation boards and issue trackers connect frontline teams with engineers and managers. Problems are addressed promptly, often in cross-functional meetings. Standardized visual tools support consistent communication, and frontline staff are invited to participate in reviews. Digital platforms may start to supplement face-to-face interactions. Communication is transparent and fosters collaboration.",
    "Communication systems fully integrate frontline teams with leadership via digital and in-person channels. Feedback is traceable, timely, and leads to measurable action. Operators are engaged in strategic planning and problem-solving at all levels. Cross-department and cross-site communication is seamless, fostering a unified Lean culture. Open, honest dialogue drives continuous improvement."
  ]
},

// 7. Lean Training and Education — Logistics & Supply Chain
{
  dimensionName: "Lean Training and Education",
  sectorName: "Logistics",
  levels: [
    "Lean training is minimal or absent, with most employees unfamiliar with Lean terminology or tools. Learning occurs informally and inconsistently, often only during audits or crisis responses. There is no structured curriculum or ongoing education plan. Employees lack confidence in Lean concepts and how to apply them. Training resources are scarce.",
    "Basic Lean training modules are introduced, often during onboarding or improvement events. Some operators and supervisors gain exposure to fundamental Lean tools such as 5S and PDCA, but application is inconsistent. Training focuses more on compliance than capability building. Refresher sessions are rare. Staff engagement with Lean education remains low.",
    "Role-based training plans are established for operators, supervisors, and engineers, covering problem-solving tools, visual management, and safety integration. Training combines classroom instruction with on-the-job coaching and simulations. Teams begin applying learned skills in active improvement projects. Supervisors coach and reinforce Lean practices regularly. Training is tracked and linked to performance.",
    "Structured Lean education pathways, including certifications like Yellow Belt, are available across the supply chain. Internal facilitators lead simulations and Kaizen training sessions. Learning is tied to career progression and improvement goals. Continuous development is embedded into organizational practices, supported by learning management systems. Training outcomes are evaluated for effectiveness.",
    "Lean education is a strategic priority with a dedicated Lean academy or center of excellence. Partnerships with external experts bring in benchmarking and innovation. Training is adaptive, data-driven, and integrated with daily work and strategic initiatives. All employees continuously upgrade Lean competencies, and coaching is part of leadership development. Lean learning culture permeates the organization."
  ]
},

// 8. Recognition and Celebration — Logistics & Supply Chain
{
  dimensionName: "Recognition and Celebration",
  sectorName: "Logistics",
  levels: [
    "Improvement efforts receive little to no formal recognition, leading to low motivation among staff. Managers may acknowledge meeting output targets but rarely celebrate Lean-related achievements. There are no structured systems for sharing success stories. Employee contributions to Lean are often overlooked. Recognition is informal and inconsistent.",
    "Occasional “Employee of the Month” or spot awards exist but rarely highlight Lean efforts specifically. Recognition tends to focus on individual performance rather than team-based improvements. Celebrations are infrequent, low visibility, and not linked to Lean outcomes. Motivation for continuous improvement remains weak. Peer-to-peer recognition is limited.",
    "Teams and individuals are recognized regularly in meetings and newsletters for specific Lean improvements. Small rewards and informal acknowledgments encourage participation. Success stories are shared to build momentum and reinforce Lean values. Peer recognition begins to gain traction, fostering camaraderie. Recognition supports growing engagement.",
    "Formal recognition programs are established, linking continuous improvement achievements to plant or corporate goals. Awards, bonuses, or time off are given for sustained improvements. Celebrations are timely, public, and involve leadership participation. Recognition is tied to both results and Lean behaviors. The culture of appreciation motivates ongoing involvement.",
    "Recognition is deeply embedded into performance management and leadership reviews. Annual Lean summits celebrate organizational and team excellence. Peer-nominated awards and data-driven achievements reinforce participation and innovation. Employees take pride in driving improvements, and recognition sustains a high-performing Lean culture. Celebrations include external benchmarking and community engagement."
  ]
},

// 9. Change Management Readiness — Logistics & Supply Chain
{
  dimensionName: "Change Management Readiness",
  sectorName: "Logistics",
  levels: [
    "Resistance to change is common, fueled by poor communication, lack of training, and fear of disruption. Change initiatives are introduced abruptly without staff involvement. Employees often revert to old habits, undermining improvements. Training and support for change are minimal or absent. Change is seen as a burden rather than an opportunity.",
    "Changes are piloted in isolated areas but with limited follow-up or feedback mechanisms. Operators receive instructions but lack understanding of the rationale behind changes. Communication about upcoming changes is often unclear or inconsistent. Resistance persists due to low transparency and limited involvement. Training on new processes is ad hoc.",
    "Structured change processes include risk assessments, impact analyses, and operator input during planning. Training programs accompany rollouts, improving staff readiness. Feedback loops allow adjustments based on frontline experiences. Change leaders emerge across value streams to guide transitions. Employees begin accepting change as part of continuous improvement.",
    "Change management is proactive, with roadmaps developed in collaboration with operators and stakeholders. Simulation and pilot programs prepare teams for major shifts. Pre- and post-implementation reviews capture lessons learned and enable continuous refinement. Visual tools and communication plans support smooth transitions. Resistance is actively managed and minimized.",
    "Change readiness is institutionalized and tracked as a core competency. Leaders coach teams through transitions, using real-time feedback and data-driven adjustments. Cross-functional collaboration ensures minimal disruption during change. Continuous improvement and change are inseparable, with teams innovating and iterating proactively. The organization quickly adapts to evolving conditions."
  ]
},

// 10. Daily Problem-Solving Culture — Logistics & Supply Chain
{
  dimensionName: "Daily Problem-Solving Culture",
  sectorName: "Logistics",
  levels: [
    "Problem-solving is reactive and informal, often limited to crisis response. There are few standardized tools or processes, and issues frequently recur. Operators rely on supervisors to fix problems without deeper analysis. Documentation of problems and solutions is minimal. Continuous improvement is not part of daily work.",
    "Basic problem-solving tools like 5 Whys and root cause analysis are introduced during improvement events. Teams begin documenting issues and countermeasures but focus remains event-driven. Supervisors handle most problem resolution with limited team involvement. Feedback on problem status is inconsistent. Learning from problems is limited.",
    "Structured problem-solving is integrated into daily work with regular use of Lean tools. Teams lead investigations into issues, documenting findings and tracking actions. Visual management supports identification and escalation of problems. Supervisors coach teams in problem-solving methodologies. Cross-functional collaboration begins for complex issues.",
    "Problem-solving is embedded into daily management systems with clear escalation protocols. Teams link issues to key performance indicators and monitor resolution progress. Leaders model A3 thinking and systematic countermeasure development. Knowledge sharing and standard work updates result from problem-solving outcomes. Continuous learning accelerates improvement cycles.",
    "Problem-solving is a cultural norm, with cross-functional teams collaborating continuously to anticipate and resolve systemic issues. Advanced analytical tools and data-driven methods are routinely used. Teams proactively identify risks and implement preventative measures. Lessons learned are systematically shared organization-wide. Problem-solving drives innovation and operational excellence."
  ]
},

// 11. Team Engagement in Improvement — Logistics & Supply Chain
{
  dimensionName: "Team Engagement in Improvement",
  sectorName: "Logistics",
  levels: [
    "Team involvement in Lean or improvement activities is minimal, with limited awareness or opportunity to participate. Improvement efforts tend to be led by management without frontline input. Employees may feel disengaged or skeptical about Lean initiatives. Communication about Lean is often one-way and does not encourage participation. There is little sense of ownership at the team level.",
    "Some teams participate in isolated Kaizen events or improvement meetings but engagement is inconsistent. Team members may contribute ideas but often lack support to implement them. Awareness of Lean’s benefits grows but is not widespread. Leadership involvement varies by department or shift. Collaboration remains limited.",
    "Teams regularly engage in improvement activities, including Kaizen events and daily problem-solving meetings. Members take ownership of small-scale improvements and share successes. Cross-functional collaboration increases, with teams beginning to mentor others. Engagement is fostered through recognition and coaching. A culture of continuous learning starts to emerge.",
    "Teams become self-directed in managing improvement projects and share best practices across units. Engagement is high and spans all roles, with employees actively seeking opportunities to optimize workflows. Cross-department initiatives are common, breaking down silos. Coaching and peer support sustain momentum. Teams take pride in contributing to organizational goals.",
    "Teams drive innovation throughout the supply chain, proactively identifying improvement opportunities and disseminating successful practices organization-wide. Engagement includes participation in strategic initiatives and external benchmarking. Recognition programs and leadership coaching reinforce sustained involvement. Continuous improvement is intrinsic to team culture. Teams are seen as key contributors to competitive advantage."
  ]
},

// 12. Value Stream Mapping — Logistics & Supply Chain
{
  dimensionName: "Value Stream Mapping",
  sectorName: "Logistics",
  levels: [
    "There is little understanding or documentation of end-to-end material flow or logistics processes. Bottlenecks and waste often go unnoticed or unmanaged. Improvement efforts focus on isolated tasks rather than overall flow. Lack of process visibility limits problem-solving and coordination. Value streams are siloed and disconnected.",
    "Some departments begin to map parts of their processes, typically within warehouses or transportation routes. Maps may be outdated or incomplete, with limited frontline involvement. Value stream concepts are introduced but not consistently applied. Waste and delays are identified sporadically. Coordination across functions remains limited.",
    "Value stream mapping is used regularly to visualize and analyze logistics flows, involving cross-functional teams including frontline staff. Maps highlight waste, delays, and bottlenecks, guiding targeted improvements. Teams begin to align metrics and goals with flow efficiency. Mapping exercises become part of standard improvement activities. Awareness of end-to-end process impact increases.",
    "Comprehensive, dynamic value stream maps are maintained and updated across all supply chain functions. Data-driven insights inform redesigns to optimize flow and reduce waste. Cross-functional collaboration is strong, with shared accountability for value delivery. Maps integrate supplier and customer touchpoints where applicable. Continuous improvement leverages mapping outputs.",
    "Value stream maps are fully integrated with real-time data systems, supporting predictive analytics and seamless coordination. Logistics processes operate as a synchronized, end-to-end system delivering maximal customer value. Cross-organizational collaboration extends mapping beyond internal boundaries to suppliers and partners. Continuous redesign and innovation are driven by value stream insights. The organization benchmarks and shares best practices externally."
  ]
},

// 13. Process Flow Efficiency — Logistics & Supply Chain
{
  dimensionName: "Process Flow Efficiency",
  sectorName: "Logistics",
  levels: [
    "Material and information flow in logistics is erratic and uncoordinated, leading to frequent delays, redundancies, and rework. Bottlenecks cause shipping delays and stock imbalances. Processes are reactive, with little emphasis on flow or timing. Cross-department communication is weak. Operational inefficiencies negatively impact customer satisfaction.",
    "Targeted efforts focus on streamlining individual functions such as warehouse picking or route scheduling. Communication between some departments improves, reducing waiting times and unnecessary handoffs. Basic flow improvements are introduced but remain isolated. Workflow standardization is limited. Operators begin to recognize flow issues but lack tools for systemic improvement.",
    "Logistics processes are increasingly streamlined with smoother transitions between functions. Pull systems and basic Heijunka principles are applied to level workloads and reduce bottlenecks. Standard work supports consistent flow, and visual management highlights abnormalities. Cross-functional teams collaborate to improve end-to-end processes. Customer impact is considered in flow redesign.",
    "Process flow is integrated across the entire supply chain, from procurement through delivery. Advanced scheduling and resource leveling reduce variability and waiting times. Real-time tracking supports rapid response to disruptions. Continuous flow is maintained through coordinated planning and execution. Flow efficiency is a key performance metric at all levels.",
    "Near-perfect process flow is sustained using predictive scheduling, automation, and dynamic resource allocation. Processes adapt in real-time to demand fluctuations and supply variability. Cross-company collaboration optimizes end-to-end supply chain flow. Innovations such as autonomous material handling and AI-driven logistics are leveraged. Process flow excellence drives competitive differentiation."
  ]
},

// 14. Standard Work / SOPs — Logistics & Supply Chain
{
  dimensionName: "Standard Work / SOPs",
  sectorName: "Logistics",
  levels: [
    "Logistics tasks lack standardized procedures, resulting in variability and errors. Work instructions are often missing, outdated, or ignored. Training is informal, and practices differ widely across teams and shifts. Quality and safety are impacted by inconsistent execution. Documentation discipline is low.",
    "Some standard operating procedures (SOPs) exist but are inconsistently used and poorly maintained. Frontline staff may be aware of some protocols but do not consistently follow them. Updates to SOPs are infrequent and unstructured. Training on SOPs is limited. Variation persists.",
    "Documented SOPs cover key logistics processes and are posted or accessible at workstations. Teams follow these procedures regularly, and updates reflect continuous improvements. Training aligns with current standards. Compliance is monitored but may lack rigor. Frontline staff contribute to SOP revisions.",
    "SOPs are comprehensive, regularly reviewed, and embedded into daily work with visual aids and timing standards. Audits and coaching reinforce adherence. Deviations are systematically investigated and corrected. SOPs integrate safety, quality, and efficiency considerations. Continuous improvement is linked to SOP updates.",
    "Standard work is dynamic, continuously improved based on real-time feedback and analytics. Digital tools support instant access and updates to SOPs. Training and retraining are rapid and integrated into workflows. SOPs extend to suppliers and partners to ensure consistency across the value stream. Best practices are shared and benchmarked externally."
  ]
},

// 15. Visual Management — Logistics & Supply Chain
{
  dimensionName: "Visual Management",
  sectorName: "Logistics",
  levels: [
    "Visual cues and displays are minimal or absent in logistics operations. Operators rely on verbal instructions and memory, leading to confusion and errors. Performance data is not visible or is outdated. Problems are often detected too late. Visual management is not part of the work culture.",
    "Basic visual controls such as signage, labels, or safety posters appear sporadically. Some work areas display hand-written charts or metrics but are often neglected. Visuals are not integrated with workflows or improvement processes. Operators seldom use visual information to guide work. The impact on performance is limited.",
    "Visual management boards are established to display key performance indicators and daily goals. Color-coded alerts and problem escalation tools begin to be used. Operators reference visuals during meetings and shift changes. Visual tools support early detection and resolution of abnormalities. Teams take ownership of maintaining visuals.",
    "Visual management is standardized across logistics operations, integrating real-time dashboards and digital displays. Visual controls guide workflow, inventory levels, and quality monitoring. Leaders use visual data to coach teams and support decision-making. Visual tools facilitate rapid escalation of issues and problem-solving. Visual management is a key enabler of continuous improvement.",
    "Visual management is fully digital, interactive, and accessible organization-wide. Data flows automatically to displays from logistics execution and ERP systems. Visuals support predictive decision-making and strategic alignment. Visitors and new employees can instantly understand current status and priorities. Visual management drives transparency, accountability, and operational excellence."
  ]
},

// 16. 5S Implementation — Logistics & Supply Chain
{
  dimensionName: "5S Implementation",
  sectorName: "Logistics",
  levels: [
    "Workspaces in warehouses and transport hubs are cluttered and disorganized, causing inefficiencies and safety hazards. Tools and materials lack designated locations, leading to wasted time searching or replacing items. Cleanliness and order are inconsistent across shifts and teams. There is little awareness of 5S principles. Improvement efforts are sporadic and unstructured.",
    "Basic 5S activities like sorting and labeling begin in some areas but lack sustainability. Red-tag events occur irregularly with limited follow-up. Visual aids such as posters are displayed but adherence varies. Teams start recognizing the benefits of organization but do not embed it into daily routines. Audits and accountability are minimal.",
    "5S standards are documented and practiced regularly in most logistics zones. Work areas have clear tool and material placements, and visual controls guide organization. Teams conduct daily cleanups and resets, improving safety and efficiency. Audits begin to track compliance and highlight improvement opportunities. Engagement grows across shifts.",
    "5S is sustained through formal audits, metrics, and team ownership across warehouses and transportation areas. Continuous improvements focus on ergonomics, waste elimination, and workflow optimization. Visual management integrates 5S status with performance boards. Training reinforces 5S as standard practice. The culture embraces workplace discipline and order.",
    "The logistics operation exemplifies 5S excellence, benchmarking against best-in-class facilities. Innovation in workplace organization supports rapid adjustments and safety improvements. Digital tools aid sustainment and monitoring of 5S compliance. Teams proactively identify and solve 5S-related challenges. The workplace environment reflects and reinforces Lean culture and pride."
  ]
},

// 17. Kanban/Pull Systems — Logistics & Supply Chain
{
  dimensionName: "Kanban/Pull Systems",
  sectorName: "Logistics",
  levels: [
    "Inventory management is largely manual and reactive, causing frequent shortages or overstocking. There are no formal pull systems or signals to trigger replenishment. Communication between warehouses and procurement is limited. Stockouts and excess inventory cause inefficiencies and customer dissatisfaction. Waste due to poor material flow is common.",
    "Simple pull systems like Kanban cards or reorder points are implemented in isolated areas. Replenishment is somewhat more predictable but still relies heavily on manual tracking. Communication improves but is inconsistent, causing delays in responding to stock needs. Staff begin recognizing the value of pull-based inventory control but lack full adoption. Systems are not yet integrated.",
    "Kanban or pull systems are established across multiple logistics functions to better align inventory with demand. Teams monitor inventory levels visually and respond proactively to replenishment signals. Communication between procurement, warehousing, and transport improves. Pull systems reduce waste and buffer stock. Teams are trained in pull principles.",
    "Pull systems are integrated across the entire supply chain, connecting suppliers, warehouses, and distribution centers. Digital Kanban systems support real-time tracking and automated replenishment. Inventory carrying costs decrease as stock levels align closely with actual consumption. Communication is seamless, enabling rapid response to demand changes. Pull systems support just-in-time delivery.",
    "Pull systems are optimized with predictive analytics and automation, ensuring precise, just-in-time delivery of materials and goods. Integration with supplier and customer systems enables end-to-end visibility and flow synchronization. Autonomous material handling and replenishment technologies are deployed. Continuous improvement teams monitor and refine pull processes. Inventory levels are minimized without compromising service."
  ]
},

// 18. Quick Changeover (SMED) — Logistics & Supply Chain
{
  dimensionName: "Quick Changeover (SMED)",
  sectorName: "Logistics",
  levels: [
    "Changeovers for equipment, loading docks, or transport scheduling are lengthy and unpredictable, causing downtime and delays. Procedures are informal or undocumented. Delays disrupt workflows and reduce capacity utilization. Employees are reactive to changeover problems. No formal methods exist to reduce setup times.",
    "Basic SMED principles are introduced, separating internal and external setup tasks. Checklists and visual aids support standardization. Some improvements reduce changeover times in pilot areas. Staff awareness increases but practices are not yet widespread or consistent. Changeover variability remains an issue.",
    "Standardized changeover procedures are documented and followed in key logistics processes. Visual controls and training support consistent application. Changeover times decrease measurably, improving throughput and scheduling reliability. Feedback mechanisms encourage continuous improvement. Teams actively participate in refining procedures.",
    "Changeover processes are audited regularly and continuously improved based on operator input and data analysis. Simulation training helps prepare staff for rapid changeovers. Improvements extend across multiple sites and functions. Changeovers are synchronized with demand fluctuations to optimize capacity. Safety and quality remain paramount.",
    "Rapid, error-free changeovers are achieved consistently, maximizing equipment and facility utilization. Advanced technologies and automation support swift transitions. Changeover performance is benchmarked externally and drives competitive advantage. Continuous innovation sustains rapid adaptability. Changeover excellence enables high responsiveness to customer needs."
  ]
},

// 19. Error-Proofing (Poka-Yoke) — Logistics & Supply Chain
{
  dimensionName: "Error-Proofing (Poka-Yoke)",
  sectorName: "Logistics",
  levels: [
    "Errors in order picking, labeling, or documentation are frequent and detected late, causing rework and customer dissatisfaction. No formal error-proofing systems are in place. Quality checks rely mainly on inspection rather than prevention. Staff may be blamed for errors. Processes are vulnerable to human mistakes.",
    "Basic error-proofing measures such as checklists, labels, or simple visual cues are introduced in some areas. Operators rely on reminders rather than physical mistake-proofing devices. Training raises awareness of common errors. Quality escapes remain high. Error-proofing is discussed during improvement events but not widely implemented.",
    "Error-proofing devices and processes are integrated into critical logistics tasks such as barcode scanning and automated verification. Teams identify error-prone steps during Kaizen events and implement poka-yoke solutions. Operators are trained to recognize and address potential mistakes proactively. Error rates begin to decline. Error-proofing becomes part of continuous improvement discussions.",
    "Error-proofing is embedded in process design and standard work, supported by audits and monitoring. Advanced technologies like RFID and automated alerts reduce errors further. Operators contribute to designing and maintaining poka-yoke solutions. Quality escapes are rare in error-proofed processes. Continuous feedback ensures systems remain effective.",
    "Error-proofing is fully integrated with real-time data analytics and AI systems predicting and preventing errors before they occur. New processes and technologies are evaluated for mistake-proofing before deployment. Teams innovate poka-yoke solutions collaboratively across functions and suppliers. Quality is built into logistics operations, not inspected afterward. The culture prioritizes prevention."
  ]
},

// 20. Process Transparency — Logistics & Supply Chain
{
  dimensionName: "Process Transparency",
  sectorName: "Logistics",
  levels: [
    "Logistics processes are largely opaque, leading to confusion and inefficiencies. Operators and managers lack clear visibility into workflow status, inventory levels, and order progress. Issues are discovered late, resulting in reactive firefighting. Process documentation and communication are limited. Decision-making is often based on incomplete or outdated information.",
    "Some workflow charts, process maps, and visual boards are introduced to increase clarity. Transparency is limited to certain functions or shifts. Updates are often manual and delayed. Frontline staff have partial insight into process status but lack comprehensive understanding. Communication gaps persist between departments.",
    "Process transparency improves with accessible, up-to-date workflow status displays and performance dashboards. Teams regularly review process data in meetings to identify bottlenecks or deviations. Cross-functional visibility increases, enabling better coordination. Technology supports more timely updates. Process clarity supports proactive management.",
    "Real-time process status updates are available to all relevant staff and leadership. Continuous monitoring highlights abnormalities promptly. Integrated digital systems link warehouse management, transportation, and inventory data. Transparency fosters accountability and collaborative problem-solving. Data-driven decision-making is routine.",
    "Full visibility across all logistics operations and external partners is achieved through advanced digital platforms. Transparency supports predictive analytics and strategic planning. Open communication channels ensure issues are resolved quickly and collaboratively. Process data is shared with suppliers and customers, enabling seamless coordination. Transparency is a competitive advantage and driver of continuous improvement."
  ]
},

// 21. Quality-at-Source — Logistics & Supply Chain
{
  dimensionName: "Quality-at-Source",
  sectorName: "Logistics",
  levels: [
    "Quality issues such as incorrect shipments, damaged goods, or documentation errors are often detected late, usually after customers report problems. There is minimal frontline involvement in identifying or correcting defects. Quality checks rely heavily on end-of-process inspections, leading to rework and delays. Responsibility for quality is seen as the QA department’s job, not an operator’s. Preventative actions are rare.",
    "Frontline staff begin to be trained and encouraged to identify and correct defects immediately during their work. Basic quality checks become part of standard tasks, such as verifying shipment accuracy before dispatch. Root cause analysis is occasionally performed but not systematically. Teams are more aware of their role in quality but lack formal tools or processes. Early detection of issues is improving but inconsistent.",
    "Quality-at-source practices are embedded into daily work, with operators empowered to stop processes and correct errors immediately. Quality checks are integrated into standard operating procedures, supported by visual controls and error-proofing devices. Teams regularly use root cause analysis to prevent recurrence. Continuous feedback loops enable timely quality improvements. Quality ownership spreads throughout logistics functions.",
    "Real-time monitoring and alerts support quality control at every process step. Frontline staff actively participate in quality improvement teams and audits. Advanced data analytics identify quality trends and focus improvement efforts. Continuous quality feedback is part of team huddles and management reviews. The culture emphasizes proactive prevention and accountability for quality.",
    "Quality is proactively ensured through predictive analytics, AI-based monitoring, and embedded safeguards. Every logistics team member prioritizes quality at the source, with empowerment to innovate solutions. Integrated digital systems provide immediate quality insights supporting decision-making. Quality metrics are a core part of performance evaluations and strategic planning. The organization is recognized for excellence in logistics quality management."
  ]
},

// 22. Level Loading / Heijunka — Logistics & Supply Chain
{
  dimensionName: "Level Loading / Heijunka",
  sectorName: "Logistics",
  levels: [
    "Workloads and shipment schedules are uneven and unpredictable, leading to peaks and troughs in labor demand. This variability causes bottlenecks, overtimes, or idle times, impacting service reliability. Scheduling is reactive with little coordination between departments. Capacity constraints are frequently unmanaged. Employees experience burnout or downtime.",
    "Basic leveling techniques are applied within certain teams or shifts to smooth workloads. Departments begin to coordinate schedules to reduce extreme fluctuations. Some planning considers demand patterns but lacks granularity or real-time adjustments. Variability remains a challenge. Communication about workload balancing is inconsistent.",
    "Level loading is actively managed across multiple logistics functions, balancing resources and workflows to reduce bottlenecks. Production and shipment schedules are smoothed using Heijunka principles. Coordination between warehousing, transport, and procurement improves. Real-time data helps identify workload imbalances. Teams adjust plans proactively.",
    "System-wide leveling integrates capacity planning, resource allocation, and customer demand management. Predictive analytics support demand forecasting and workload smoothing. Flexibility in staffing and equipment deployment enhances responsiveness. Variability is minimized across the supply chain, improving flow and employee experience. Level loading is a key operational focus.",
    "Level loading is dynamic and predictive, enabled by AI-driven scheduling and autonomous resource management. Workloads are continuously balanced across sites, shifts, and functions in real-time. Employees experience steady, manageable workloads, enhancing morale and performance. Demand-capacity synchronization extends through supplier and customer networks. Level loading excellence supports superior service delivery and operational efficiency."
  ]
},

// 23. TPM (Total Productive Maintenance) — Logistics & Supply Chain
{
  dimensionName: "TPM (Total Productive Maintenance)",
  sectorName: "Logistics",
  levels: [
    "Equipment breakdowns, vehicle downtime, and maintenance are reactive and unplanned, causing frequent disruptions. Maintenance is informal and often delayed. Operators lack ownership or involvement in upkeep. Downtime data is not tracked or analyzed. Equipment reliability negatively impacts operations and safety.",
    "Planned maintenance schedules are introduced but are inconsistently followed. Operators perform basic equipment checks. Some downtime tracking begins. Maintenance teams conduct routine inspections but lack proactive strategies. Spare parts availability is irregular. Collaboration between operators and technicians is limited.",
    "TPM pillars such as autonomous maintenance and planned maintenance are implemented. Operators take responsibility for daily equipment checks and minor upkeep. Downtime causes are logged and analyzed. Preventive maintenance reduces breakdown frequency. Collaboration between maintenance and operations improves. Equipment reliability increases.",
    "TPM is fully integrated into logistics operations with cross-functional teams driving continuous improvement in maintenance. Overall Equipment Effectiveness (OEE) is tracked and reviewed regularly. Maintenance is predictive, based on usage data and condition monitoring. Operators and technicians work closely to optimize equipment performance. Root causes of failures are systematically addressed.",
    "TPM is a cultural norm with maintenance embedded in all levels of logistics operations. Predictive maintenance uses IoT sensors and data analytics to anticipate failures before they occur. Equipment design incorporates maintainability features. Continuous training ensures high capability in maintenance practices. Equipment reliability supports near-zero downtime and operational excellence."
  ]
},

// 24. End-to-End Value Stream Integration — Logistics & Supply Chain
{
  dimensionName: "End-to-End Value Stream Integration",
  sectorName: "Logistics",
  levels: [
    "Logistics departments work in silos with little coordination or shared goals. Poor communication leads to delays, redundancies, and errors in handoffs between functions. Supply chain visibility is limited. Accountability is fragmented. Customer service suffers from disjointed processes.",
    "Some efforts are made to improve coordination between key functions such as warehousing and transportation. Cross-functional meetings and basic process handoffs begin. Shared KPIs are introduced but not fully aligned. Integration is limited to internal departments. External collaboration is minimal.",
    "Workflows, metrics, and improvement goals are aligned across logistics functions. Cross-functional teams collaborate regularly to improve end-to-end flow and reduce waste. Information systems support data sharing internally. Accountability for value delivery is shared. Customer satisfaction metrics influence operations.",
    "Logistics processes are aligned with suppliers and customers, creating a coordinated value stream. Integrated planning and execution improve responsiveness and reduce delays. Performance metrics cascade through the entire supply chain. Continuous improvement initiatives are cross-organizational. Collaboration fosters innovation.",
    "End-to-end value stream integration extends beyond the company to include suppliers, partners, and customers in a seamless ecosystem. Real-time data sharing and synchronized processes optimize flow and service delivery. Joint improvement projects drive innovation and value creation. The supply chain operates as a unified, customer-centric network. The organization is a benchmark for value stream integration."
  ]
},

// 25. Waste Identification and Elimination — Logistics & Supply Chain
{
  dimensionName: "Waste Identification and Elimination",
  sectorName: "Logistics",
  levels: [
    "Waste such as excess motion, waiting, overprocessing, and defects is largely unmanaged and unrecognized. Teams may be unaware of waste types or their impact on logistics costs and service. Improvement efforts focus on firefighting rather than waste reduction. Processes are inefficient, leading to delays and increased expenses. Waste reduction is not part of the culture.",
    "Staff begin identifying common wastes during Kaizen events or targeted improvement projects. Some efforts to reduce motion, waiting, or excess inventory are initiated but not sustained. Awareness of waste types grows but tools and methods are inconsistently applied. Results are uneven, and waste often recurs. Cultural resistance to change persists.",
    "Waste elimination becomes systematic, supported by Lean tools such as value stream mapping and 5S. Cross-functional teams regularly analyze processes to detect and reduce waste. Data supports identification and prioritization of waste reduction initiatives. Teams celebrate waste reduction successes. Continuous improvement cycles target waste elimination.",
    "Waste reduction is embedded in daily management systems with clear accountability. Metrics track waste elimination progress, and improvements are sustained. Advanced techniques like root cause analysis and poka-yoke target persistent wastes. Waste identification includes environmental and energy considerations. The culture prioritizes efficiency and resource optimization.",
    "Waste elimination is a strategic priority driving operational excellence and sustainability. Innovative methods continuously identify and prevent waste before it impacts operations. The organization benchmarks and shares best practices in waste reduction. Lean culture ensures all employees proactively detect and address waste. Waste minimization contributes to cost leadership and environmental stewardship."
  ]
},

// 26. Handoffs and Queue Reduction — Logistics & Supply Chain
{
  dimensionName: "Handoffs and Queue Reduction",
  sectorName: "Logistics",
  levels: [
    "Handoffs between warehouses, transport teams, and other departments are frequent, inconsistent, and error-prone, causing delays and information loss. There are no standardized handoff protocols, and queues for loading, unloading, or processing are common. Communication is fragmented, leading to confusion and inefficiency. Delays in one area cascade through the supply chain. Customer service suffers due to unpredictability.",
    "Structured handoff tools and communication standards are introduced in some areas, reducing errors. Teams begin to coordinate schedules to minimize queues, but efforts are patchy and lack broad application. Handoffs improve within departments but remain problematic across functions. Feedback about handoff quality is inconsistent. Queue lengths and wait times are measured sporadically.",
    "Standardized handoff protocols are implemented across major logistics functions. Communication during transitions is clearer and more reliable, supported by checklists and digital tools. Scheduling and process flow coordination reduce queues and waiting times significantly. Teams monitor handoff metrics closely and address issues proactively. Cross-functional collaboration improves continuity.",
    "Handoffs are minimized and seamlessly managed with real-time coordination between warehouses, transport, and suppliers. Queue reduction strategies are integrated into operational planning and performance reviews. Teams use predictive analytics to anticipate and resolve bottlenecks before they occur. Quality and timeliness of handoffs are continuously improved. Customer satisfaction metrics reflect improved flow.",
    "Handoffs and queues are nearly eliminated through end-to-end process integration and automation. Real-time digital systems synchronize activities across the entire supply chain, ensuring smooth transitions. Continuous monitoring and rapid response prevent bottlenecks. The organization collaborates with partners to optimize handoffs beyond internal operations. Handoff excellence supports superior service and agility."
  ]
},

// 27. Documentation Discipline — Logistics & Supply Chain
{
  dimensionName: "Documentation Discipline",
  sectorName: "Logistics",
  levels: [
    "Documentation of shipments, inventory, and process steps is incomplete, inconsistent, or delayed. Paper-based records or informal notes cause errors and inefficiencies. Lack of standardized forms or procedures hampers accuracy and traceability. Compliance risks increase due to poor documentation. Staff rely heavily on memory or verbal instructions.",
    "Documentation standards are introduced and enforced through basic training and audits. Digital record-keeping may start in some areas but is inconsistent. Accuracy and timeliness improve, but gaps remain. Frontline accountability for documentation grows slowly. Data retrieval and sharing are limited.",
    "Documentation is disciplined and standardized across logistics functions. Electronic systems support real-time data entry and retrieval. Staff are trained and accountable for accurate, timely documentation. Audits and feedback loops reinforce compliance. Documentation supports operational control and customer requirements.",
    "Documentation is fully integrated with digital workflows and ERP systems. Real-time visibility into shipment status, inventory, and process compliance is available. Errors and omissions are rare due to validation and automation. Continuous monitoring ensures data quality and accessibility. Documentation supports decision-making and regulatory compliance.",
    "Documentation is seamless, automated, and error-proofed across all logistics processes. Advanced digital tools integrate documentation with operational systems and analytics. Data accuracy is near 100%, supporting real-time decision-making and traceability. The organization continuously improves documentation practices and shares best practices. Documentation excellence enhances transparency and customer trust."
  ]
},

// 28. Digitization of Workflows — Logistics & Supply Chain
{
  dimensionName: "Digitization of Workflows",
  sectorName: "Logistics",
  levels: [
    "Workflows are mostly manual or paper-based, leading to delays, errors, and lack of visibility. Processes rely on informal communication and physical paperwork. Digital tools are limited or fragmented. Data collection and sharing are inefficient. Manual tasks increase operational risks and costs.",
    "Selective digitization begins in certain logistics areas, such as barcode scanning or inventory tracking. Basic digital tools support specific functions but are not integrated. Staff receive some training on digital processes. Workflow digitization is project-based and inconsistent. Data silos persist.",
    "Digital workflows are implemented more broadly, connecting key logistics functions such as order processing, warehousing, and transportation. Systems integrate to enable better data sharing and process automation. Training supports widespread adoption. Digital tools improve accuracy, speed, and traceability. Workflow standardization increases.",
    "End-to-end digitization connects workflows across the entire supply chain, supported by comprehensive IT infrastructure. Real-time data capture and analysis enhance responsiveness and efficiency. Mobile access and user-friendly interfaces support frontline operators. Digital processes are continuously refined through feedback and improvement cycles. Integration with supplier and customer systems improves collaboration.",
    "Fully integrated, intelligent digital workflows automate logistics operations end-to-end. AI and machine learning optimize processes dynamically. Workflow digitization supports predictive analytics, autonomous decision-making, and real-time adjustment to demand changes. The organization leads in digital innovation and shares expertise externally. Digitization drives operational excellence and competitive advantage."
  ]
},

// 29. Lean Integrated into Corporate Strategy — Logistics & Supply Chain
{
  dimensionName: "Lean Integrated into Corporate Strategy",
  sectorName: "Logistics",
  levels: [
    "Lean principles are largely absent from corporate strategy and planning. Improvement efforts are fragmented, reactive, and disconnected from organizational goals. Leadership does not articulate a vision for Lean transformation. Resource allocation for Lean initiatives is minimal or ad hoc. Lean is perceived as a short-term program or cost-cutting tool.",
    "Lean is recognized as a potential improvement approach, with isolated pilot projects aligned to specific operational issues. Some strategic discussions include Lean terminology, but commitment is limited. Resource planning begins to consider Lean initiatives selectively. Leadership awareness grows but lacks full integration. Lean remains a tactical rather than strategic focus.",
    "Lean is formally integrated into corporate strategy, with clear goals linked to operational performance and customer satisfaction. Leadership communicates Lean’s role in achieving business objectives. Resources are allocated systematically to support Lean deployment across logistics functions. Strategic reviews include Lean metrics. Alignment between Lean initiatives and corporate priorities improves.",
    "Lean thinking is embedded deeply in strategy development and execution. Cross-functional collaboration supports holistic Lean transformation across the supply chain. Lean goals influence capital investments, technology adoption, and supplier management. Leadership regularly reviews Lean progress and adjusts plans dynamically. Lean culture supports strategic agility.",
    "Lean principles shape the organization’s long-term vision and competitive strategy. Lean transformation drives innovation, customer value creation, and sustainable growth. The company benchmarks against industry leaders and continuously evolves its Lean approach. Lean is a core component of corporate identity and governance. Strategy deployment is agile, inclusive, and data-driven."
  ]
},

// 30. Hoshin Kanri or Strategy Deployment — Logistics & Supply Chain
{
  dimensionName: "Hoshin Kanri or Strategy Deployment",
  sectorName: "Logistics",
  levels: [
    "Strategy deployment is informal or absent, resulting in inconsistent goal alignment and disconnected improvement efforts. Communication of strategic priorities is top-down and unclear. Departments operate independently with little coordination. Lean objectives, if present, are not cascaded systematically. Accountability for strategy execution is weak.",
    "Basic strategy deployment tools are introduced, and some efforts are made to cascade goals to departments. Strategy communication improves but lacks clarity or regularity. Improvement projects begin to align with organizational priorities. Departments start sharing information but coordination remains limited. Feedback mechanisms are inconsistent.",
    "Structured strategy deployment processes, such as Hoshin Kanri, are implemented to align goals across functions. Regular reviews ensure progress tracking and accountability. Cross-functional teams participate in strategy execution. Lean objectives are cascaded through performance management systems. Communication and collaboration improve.",
    "Strategy deployment is dynamic and data-driven, with real-time monitoring of key metrics. Cross-functional leadership engagement and feedback loops enable adaptive planning. Improvement initiatives are aligned with strategic priorities and continuously refined. Strategy is communicated clearly and consistently throughout the organization. Lean principles guide execution and governance.",
    "Strategy deployment is fully integrated, agile, and participatory at all organizational levels. Continuous alignment, adjustment, and accountability drive Lean transformation success. Digital platforms support transparent strategy communication and progress tracking. The organization demonstrates strategic agility and innovation. Lean strategy deployment is a source of competitive advantage."
  ]
},

// 31. Supplier Collaboration — Logistics & Supply Chain
{
  dimensionName: "Supplier Collaboration",
  sectorName: "Logistics",
  levels: [
    "Supplier interactions are primarily transactional, focused on purchase orders and deliveries with little engagement in improvement efforts. Communication is limited, and supplier issues like delays or quality problems are handled reactively. There is no structured process for joint problem-solving or Lean integration. Supplier performance variability disrupts flow regularly. Partnerships lack transparency and trust.",
    "Some basic supplier scorecards and performance tracking are in place. Suppliers receive forecasts and participate in occasional meetings. Collaboration on quality or delivery issues is limited and mostly reactive. Lean concepts are introduced to a few key suppliers. Data sharing is informal and not timely. Supplier variability still affects operations significantly.",
    "Regular reviews align supplier expectations and performance goals. Joint problem-solving initiatives begin, focusing on delivery reliability and quality improvements. Suppliers adopt some Lean practices, supported by shared metrics and collaboration tools. Communication channels are more open, enabling better coordination. Continuous improvement efforts include supplier input.",
    "Strong partnerships exist with key suppliers, including joint planning and Lean integration. Suppliers participate actively in improvement events and innovation initiatives. Data sharing is real-time and comprehensive. Collaborative governance ensures alignment of objectives and rapid resolution of issues. Suppliers are seen as extensions of the logistics Lean system.",
    "Supplier collaboration is strategic and embedded in overall Lean supply chain management. Suppliers and logistics teams co-develop processes, technologies, and innovations that drive mutual benefits. Digital integration enables seamless real-time data exchange. Continuous joint improvement programs enhance supply chain resilience and performance. The organization leads in fostering Lean supplier networks."
  ]
},

// 32. Customer Focus — Logistics & Supply Chain
{
  dimensionName: "Customer Focus",
  sectorName: "Logistics",
  levels: [
    "Logistics teams have limited awareness of customer needs or expectations. Work is focused on internal processes rather than customer outcomes. Customer feedback is rare or handled only by sales or customer service departments. Delivery errors and delays occur frequently without root cause investigation. Customer satisfaction is not tracked or prioritized.",
    "Customer data such as complaints and delivery metrics are shared occasionally with logistics teams. Teams begin to understand the impact of their work on customer satisfaction but lack systematic processes to act on feedback. Improvements focus mainly on fixing visible issues. Customer-centric thinking is growing but not embedded. Communication between logistics and customer service is inconsistent.",
    "Customer KPIs such as on-time delivery and order accuracy are tracked regularly by logistics teams. Root cause analysis of customer complaints is integrated into problem-solving efforts. Teams participate in voice-of-customer reviews and use feedback to prioritize improvements. Customer focus is a recognized goal across logistics functions. Cross-functional collaboration with customer-facing departments improves.",
    "Logistics operations proactively align with customer priorities and expectations. Customer satisfaction metrics influence daily management and strategic decisions. Teams participate in product launches and service design to incorporate logistics feasibility and customer impact. Continuous improvement efforts target customer value creation. Customer focus is embedded in the culture.",
    "Customer focus is deeply ingrained and drives all logistics strategies and operations. The organization uses advanced analytics and direct customer engagement to anticipate and exceed expectations. Logistics teams innovate solutions that enhance customer experience and loyalty. Customer feedback cycles are rapid and embedded in continuous improvement. The company is recognized for logistics excellence and customer-centricity."
  ]
},

// 33. Performance Measurement and Metrics — Logistics & Supply Chain
{
  dimensionName: "Performance Measurement and Metrics",
  sectorName: "Logistics",
  levels: [
    "Performance data is limited, outdated, or inconsistent, hindering effective management. Key logistics metrics such as delivery times, inventory accuracy, or equipment uptime are not systematically tracked. Decisions are often based on intuition or anecdotal information. Reporting is irregular and not transparent. Accountability for performance is weak.",
    "Basic KPIs are defined and tracked in some areas, such as shipment punctuality or stock levels. Data collection is often manual or delayed. Some teams begin using performance data in meetings and problem-solving but analysis is superficial. Metrics focus on output rather than process quality or efficiency. Visibility of performance varies across functions.",
    "A balanced set of logistics performance metrics is consistently tracked, including quality, delivery, cost, and safety indicators. Data collection is increasingly automated and timely. Teams use metrics to identify improvement opportunities and monitor project outcomes. Dashboards and visual management tools support regular performance reviews. Accountability is reinforced through targets and feedback.",
    "Performance measurement is integrated across logistics functions with real-time data and advanced analytics. Metrics are linked to strategic goals and customer satisfaction. Teams proactively use data to anticipate issues and drive continuous improvement. Performance discussions occur regularly at all organizational levels. Metrics evolve to reflect process improvements and innovation.",
    "Performance measurement is predictive, comprehensive, and fully embedded in decision-making processes. Advanced analytics, benchmarking, and AI support continuous refinement of metrics and targets. Performance data is transparent and drives accountability across the supply chain. The organization uses performance insights to lead industry standards and share best practices externally."
  ]
},

// 34. Sustainability and Environmental Responsibility — Logistics & Supply Chain
{
  dimensionName: "Sustainability and Environmental Responsibility",
  sectorName: "Logistics",
  levels: [
    "Environmental considerations are minimal or absent from logistics operations. Waste generation, energy use, and emissions are not tracked or managed. Sustainability is not part of the organizational agenda. Compliance with regulations is reactive rather than proactive. Employees have limited awareness of environmental impact.",
    "Basic sustainability initiatives such as waste reduction programs or energy-saving measures are introduced in isolated areas. Some data on environmental impact is collected but not systematically analyzed. Awareness of sustainability grows slowly among leadership and staff. Compliance efforts focus on meeting legal requirements. Sustainability is not fully integrated into logistics processes.",
    "Sustainability goals are incorporated into logistics planning and performance metrics. Initiatives focus on reducing carbon footprint, optimizing routes, and minimizing waste. Teams engage in continuous improvement projects with environmental benefits. Supplier sustainability practices are assessed and encouraged. Employee training includes environmental responsibility.",
    "Environmental sustainability is a strategic priority, integrated into supply chain design and execution. Advanced technologies and data analytics optimize energy use, emissions, and material consumption. Collaboration with suppliers and customers supports shared sustainability goals. Continuous monitoring and reporting ensure progress and transparency. The organization fosters a culture of environmental stewardship.",
    "Sustainability drives innovation and competitive advantage across logistics operations. The organization pioneers green logistics practices, including renewable energy use, electric fleets, and circular economy models. Sustainability metrics are fully integrated with financial and operational KPIs. Stakeholder engagement and reporting exceed industry standards. The company is recognized as a leader in sustainable supply chain management."
  ]
},

// 35. Continuous Improvement Culture — Logistics & Supply Chain
{
  dimensionName: "Continuous Improvement Culture",
  sectorName: "Logistics",
  levels: [
    "Continuous improvement (CI) efforts are sporadic, isolated, and often driven by external consultants or management mandates. Employees are generally passive participants. Improvement activities lack structure or follow-through. Successes are not widely shared or celebrated. Lean principles are poorly understood.",
    "CI activities such as Kaizen events or suggestion programs begin to take root in some departments. Participation increases but remains uneven and often event-driven. Management supports improvement but struggles with sustaining momentum. Communication about CI is improving but lacks consistency. Employees start to see the value of improvement efforts.",
    "CI is integrated into daily work, with teams regularly identifying, prioritizing, and implementing improvements. Structured problem-solving and Lean tools are widely used. Improvement projects link to performance metrics and strategic goals. Successes are communicated and recognized. Leadership actively coaches and supports CI.",
    "A strong CI culture permeates the organization, with all employees empowered and accountable for improvement. CI is embedded in processes, training, and performance management. Cross-functional collaboration accelerates problem-solving and innovation. Continuous learning and adaptation are norms. The organization systematically captures and shares best practices.",
    "CI is a core organizational competency and competitive advantage. The culture fosters experimentation, innovation, and rapid iteration. Improvement cycles are relentless, supported by advanced analytics and digital tools. The company leads its industry in Lean maturity and operational excellence. CI is woven into every aspect of logistics and business strategy."
  ]
},

// 36. Visual Performance Management — Logistics & Supply Chain
{
  dimensionName: "Visual Performance Management",
  sectorName: "Logistics",
  levels: [
    "Performance data is rarely displayed or accessible to frontline staff. Operators and supervisors lack visibility into key metrics such as shipment accuracy, inventory levels, or equipment uptime. Discussions on performance focus primarily on output rather than quality or process improvement. Visual tools like boards or dashboards are absent or underutilized. Performance management is largely reactive and inconsistent.",
    "Some basic visual management tools, such as whiteboards or printed charts, are introduced in limited areas. Metrics like daily shipments or error rates are displayed but often outdated or incomplete. Frontline teams occasionally reference these visuals during meetings. Ownership of visual tools is unclear, leading to inconsistent maintenance and engagement. Improvements in performance visibility are incremental.",
    "Visual management boards are regularly updated and widely used across logistics teams. Metrics align with operational and strategic goals, including quality, delivery, and safety indicators. Visual cues such as color-coding help quickly identify abnormalities and trigger problem-solving. Visual management is integrated into daily meetings and huddles. Teams take responsibility for maintaining accurate and meaningful visuals.",
    "Digital visual performance management systems provide real-time data accessible to all relevant personnel. Visuals support proactive decision-making and continuous improvement initiatives. Leaders use visual data to coach teams and drive accountability. Metrics evolve dynamically based on business needs and improvement cycles. Visual management fosters transparency and collaboration across departments.",
    "Visual performance management is fully integrated with enterprise systems, offering interactive, real-time dashboards across sites and functions. Predictive analytics inform decision-making and highlight potential issues before they impact operations. Visualization of strategy deployment cascades performance goals throughout the organization. Visual tools promote a culture of transparency, empowerment, and continuous learning. The organization benchmarks and shares best practices externally."
  ]
},

// 37. Risk Management and Mitigation — Logistics & Supply Chain
{
  dimensionName: "Risk Management and Mitigation",
  sectorName: "Logistics",
  levels: [
    "Risk identification and mitigation are informal and reactive. Logistics teams address problems as they occur, with limited foresight or contingency planning. Risks such as supply disruptions, equipment failures, or safety incidents are not systematically tracked. Communication about risks is sporadic. The organization is vulnerable to unexpected disruptions.",
    "Basic risk registers and assessments are introduced in key areas. Some contingency plans exist but are limited in scope and application. Teams begin to recognize and communicate potential risks. Training on risk awareness is sporadic. Risk management activities are largely manual and inconsistent.",
    "Structured risk management processes are implemented across logistics functions. Risks are regularly identified, assessed, and prioritized using formal tools. Mitigation plans are developed and monitored. Cross-functional teams collaborate to reduce exposure to common logistics risks. Incident data informs continuous improvement in risk practices.",
    "Risk management is integrated into daily operations and strategic planning. Advanced analytics predict potential risks, enabling proactive mitigation. Training and communication foster a culture of risk awareness and responsibility. Lessons learned from incidents drive improvements. Risk management supports operational resilience.",
    "Risk management is predictive, comprehensive, and embedded in all logistics processes. Real-time monitoring and AI-driven analytics anticipate disruptions and enable rapid response. Collaboration with suppliers and partners enhances supply chain resilience. The organization continuously improves risk frameworks and shares knowledge. Risk management is a competitive advantage."
  ]
},

// 38. Employee Development and Career Pathways — Logistics & Supply Chain
{
  dimensionName: "Employee Development and Career Pathways",
  sectorName: "Logistics",
  levels: [
    "Employee development is ad hoc with limited formal training or career planning. Growth opportunities are unclear, leading to low motivation and high turnover. Skills development focuses on immediate job tasks rather than long-term capability building. Supervisors rarely coach or mentor. Employee engagement in learning is minimal.",
    "Basic training programs and some career pathways are introduced. Employees receive occasional coaching and skill development support. Awareness of career options grows, but progression processes lack structure. Training is primarily classroom-based with limited hands-on application. Engagement in development varies.",
    "Structured development programs and clear career pathways exist for operators, supervisors, and managers. Training combines classroom, on-the-job coaching, and Lean skill development. Mentoring and performance feedback support growth. Employees are encouraged to participate in improvement projects as part of development. Retention improves.",
    "Employee development is integrated with Lean culture and business objectives. Leadership development programs include Lean coaching and strategic thinking. Continuous learning is supported through formal and informal channels. Career progression aligns with skill mastery and contribution to improvement. Succession planning identifies and prepares future leaders.",
    "Development and career pathways are proactive, personalized, and aligned with organizational strategy. Advanced training, certification, and leadership development programs are widely available. The organization fosters a learning culture that encourages innovation and growth at all levels. Employee development metrics inform workforce planning. The company is recognized as an employer of choice in logistics."
  ]
},

// 39. Information Technology Integration — Logistics & Supply Chain
{
  dimensionName: "Information Technology Integration",
  sectorName: "Logistics",
  levels: [
    "IT systems are fragmented, with limited integration between warehousing, transportation, and procurement functions. Data silos cause inefficiencies and errors. Manual data entry and paper-based processes prevail. IT support is reactive and uncoordinated. Visibility into operations is limited.",
    "Basic IT systems such as Warehouse Management Systems (WMS) or Transportation Management Systems (TMS) are introduced in parts of the operation. Some integration exists but is limited in scope and reliability. Staff receive minimal training on IT tools. Data sharing between systems remains manual and inconsistent. IT initiatives are project-based.",
    "IT systems are more broadly deployed and integrated across major logistics functions. Real-time data capture improves accuracy and decision-making. System training is comprehensive and supported by help resources. Data flows more seamlessly between systems, supporting end-to-end process visibility. IT supports continuous improvement initiatives.",
    "Advanced IT integration connects logistics operations internally and with external partners. Cloud-based platforms, APIs, and digital dashboards provide real-time visibility and analytics. Systems support automation, workflow digitization, and predictive analytics. IT strategy aligns with business goals. Continuous IT improvement is embedded in governance.",
    "IT is fully integrated, intelligent, and strategic, enabling autonomous logistics operations. Artificial intelligence, machine learning, and blockchain technologies support transparency, traceability, and optimization. Real-time collaboration with suppliers and customers is seamless. IT drives innovation and competitive advantage. The organization leads in digital logistics transformation."
  ]
},

// 40. Cross-Functional Collaboration — Logistics & Supply Chain
{
  dimensionName: "Cross-Functional Collaboration",
  sectorName: "Logistics",
  levels: [
    "Collaboration between logistics functions (warehousing, transportation, procurement) is limited and siloed. Departments work independently with minimal communication. Joint problem-solving is rare. Conflicts or misunderstandings between functions are common. Collaboration is seen as optional rather than necessary.",
    "Some cross-functional meetings and improvement projects are initiated, often driven by management. Collaboration improves but is inconsistent and sometimes superficial. Communication channels develop slowly. Teams begin sharing data and coordinating schedules. Trust between functions is fragile.",
    "Regular cross-functional teams collaborate on planning, problem-solving, and process improvements. Shared goals and metrics align efforts. Communication is open and constructive. Teams work together to resolve issues impacting multiple functions. Collaboration contributes to improved logistics performance.",
    "Cross-functional collaboration is embedded in daily operations and strategic initiatives. Teams use joint problem-solving methods and continuous improvement processes. Communication is seamless, supported by digital platforms. Trust and mutual accountability are strong. Collaboration drives innovation and agility.",
    "Collaboration spans internal departments, suppliers, and customers, forming integrated logistics networks. Cross-functional teams lead enterprise-wide improvement and innovation initiatives. Shared digital tools enable transparency and real-time coordination. Collaboration is a cultural norm and competitive advantage. The organization is recognized for partnership excellence."
  ]
},

// 41. Knowledge Management and Best Practice Sharing — Logistics & Supply Chain
{
  dimensionName: "Knowledge Management and Best Practice Sharing",
  sectorName: "Logistics",
  levels: [
    "Knowledge sharing is informal and sporadic, relying heavily on individual experience. Best practices are not documented or communicated consistently. Lessons learned from problems or improvements are rarely shared beyond immediate teams. Organizational memory is weak, leading to repeated mistakes and inefficiencies. Training is mostly reactive and inconsistent.",
    "Some efforts to document and share best practices emerge, often in response to specific issues. Informal communities of practice or knowledge-sharing sessions begin to form. Communication channels are limited and not standardized. Lessons learned are shared within departments but seldom across the organization. Knowledge retention is partial.",
    "Best practice repositories and structured knowledge management systems are established. Regular forums and workshops facilitate sharing of successes and lessons learned across logistics functions. Employees actively contribute and access knowledge resources. Knowledge transfer is incorporated into training and onboarding. Continuous improvement benefits from shared learning.",
    "Knowledge management is integrated into business processes and supported by digital platforms. Cross-functional and cross-site knowledge sharing is routine. Best practices are benchmarked against industry standards and adapted. Leadership promotes a culture of continuous learning and open information exchange. Knowledge assets are protected and leveraged strategically.",
    "Knowledge management is a strategic asset driving innovation and operational excellence. Advanced technologies such as AI support capturing, curating, and disseminating logistics knowledge in real time. The organization fosters a global learning network including suppliers and partners. Best practice sharing accelerates improvement cycles and competitive advantage. Learning agility is embedded in the culture."
  ]
},

// 42. Safety Culture — Logistics & Supply Chain
{
  dimensionName: "Safety Culture",
  sectorName: "Logistics",
  levels: [
    "Safety practices are minimal and reactive, with accidents and incidents often caused by unsafe conditions or behaviors. Safety training is limited or inconsistent. Employees may feel unsafe or reluctant to report hazards. Safety policies exist but are poorly enforced. Incident investigations focus on blame rather than prevention.",
    "Basic safety protocols and training programs are implemented. Hazard reporting increases but may still be informal or inconsistent. Safety incidents begin to decrease as awareness grows. Supervisors emphasize compliance but may lack coaching skills. Safety is recognized as important but not yet ingrained in daily behaviors.",
    "Safety culture develops with active employee participation in hazard identification and risk mitigation. Safety committees and regular audits support continuous improvement. Near-miss reporting and root cause analysis become standard. Leadership visibly supports safety initiatives. Training and communication reinforce safe behaviors.",
    "Safety is integrated into all logistics processes and daily management systems. Proactive hazard controls and safety performance metrics drive behavior change. Employees are empowered to stop work for safety concerns. Safety leadership is visible and accountable. Continuous learning from incidents and data analysis reduces risks.",
    "Safety culture is exemplary, characterized by zero harm philosophy and proactive risk management. Advanced technologies support hazard detection and prevention. Safety excellence is recognized internally and externally. The organization fosters psychological safety and continuous safety innovation. Safety performance drives operational excellence and reputation."
  ]
},
// 43. Innovation Capability — Logistics & Supply Chain
{
  dimensionName: "Innovation Capability",
  sectorName: "Logistics",
  levels: [
    "Innovation efforts are rare and often limited to reactive problem solving. There is little support or structure for creative ideas or experimentation. Employees may be hesitant to propose changes due to fear of failure or lack of incentives. Innovation is not a strategic priority. Processes are largely traditional and incremental.",
    "Some isolated innovation initiatives occur, often driven by specific projects or external consultants. Teams experiment with new ideas but lack systematic evaluation or support. Leadership begins to recognize the importance of innovation but struggles to embed it culturally. Innovation efforts are sporadic and uncoordinated.",
    "Innovation capability grows with structured programs encouraging idea generation and experimentation. Cross-functional teams collaborate on pilot projects and improvements. Resources and time are allocated for innovation activities. Successes are celebrated and shared. Innovation begins to influence logistics processes and technology adoption.",
    "Innovation is integrated into the continuous improvement culture and strategic planning. The organization fosters creativity, risk-taking, and learning from failure. Collaborative partnerships with suppliers, customers, and technology providers enhance innovation. Advanced tools and methodologies support rapid prototyping and scaling. Innovation contributes significantly to competitive advantage.",
    "Innovation is a core organizational competency and cultural norm. The logistics operation continuously pioneers new technologies, processes, and business models. Innovation ecosystems extend beyond the company to include external partners and industry consortia. The organization systematically measures and rewards innovation impact. Logistics innovation leads industry transformation."
  ]
},

// 44. Workforce Flexibility and Multi-Skilling — Logistics & Supply Chain
{
  dimensionName: "Workforce Flexibility and Multi-Skilling",
  sectorName: "Logistics",
  levels: [
    "Workforce roles are rigid and narrowly defined, limiting flexibility and adaptability. Cross-training is minimal or absent. Employees perform repetitive tasks without exposure to other functions. Staffing challenges arise during peak periods or disruptions. The workforce is vulnerable to turnover and skill shortages.",
    "Some cross-training programs are introduced, often in response to operational needs. Multi-skilling is encouraged but limited to specific teams or roles. Employees begin to understand the benefits of flexibility but may lack motivation or support. Workforce planning remains reactive. Scheduling is inflexible.",
    "Structured multi-skilling programs are implemented, enabling employees to perform multiple tasks and rotate across functions. Flexibility improves response to demand variability and reduces bottlenecks. Workforce planning incorporates skills availability and development. Employees are motivated through recognition and development opportunities. Scheduling adapts to workload fluctuations.",
    "Workforce flexibility is embedded in logistics operations with ongoing multi-skilling and competency development. Cross-functional teams optimize labor deployment based on demand and skills. Training is continuous and linked to career pathways. Workforce agility supports innovation and improvement initiatives. Scheduling and resource allocation are dynamic and data-driven.",
    "Workforce flexibility is strategic and optimized through predictive analytics and real-time workforce management systems. Employees are highly skilled, empowered, and engaged in continuous learning. Multi-skilling supports seamless operations and rapid adaptation to change. Workforce strategy aligns with business goals and innovation. The organization is recognized for talent development and workforce excellence."
  ]
},

// 45. Data-Driven Decision Making — Logistics & Supply Chain
{
  dimensionName: "Data-Driven Decision Making",
  sectorName: "Logistics",
  levels: [
    "Decisions are primarily based on intuition, experience, or limited data. Data collection is inconsistent and often inaccurate. Reporting is delayed, hindering timely responses. There is limited analytical capability or culture of data use. Decision-making is reactive and fragmented.",
    "Basic data collection and reporting systems support decision-making in select areas. Managers begin using metrics to monitor performance and identify issues. Data accuracy and timeliness improve but are still limited. Analytical skills and tools are underdeveloped. Decisions are increasingly informed but not fully data-driven.",
    "Data-driven decision-making is established across logistics functions with regular use of performance metrics and analysis. Data visualization and dashboards support monitoring and problem-solving. Analytical capabilities are developed, including root cause analysis and forecasting. Decisions are proactive and aligned with strategic goals. Data quality and governance improve.",
    "Advanced analytics and business intelligence tools enable predictive and prescriptive decision-making. Data is integrated across systems for comprehensive insights. Cross-functional teams collaborate on data interpretation and action planning. Data literacy is widespread, and decision-making is evidence-based and agile. Continuous improvement is guided by data trends.",
    "Data-driven decision-making is embedded into the organizational DNA, supported by AI, machine learning, and real-time analytics. Decisions are optimized continuously, balancing operational efficiency, customer needs, and strategic objectives. The organization leads in data innovation and shares insights externally. Data governance and security are exemplary. Data culture drives competitive advantage."
  ]
},

// 46. Employee Engagement and Ownership — Logistics & Supply Chain
{
  dimensionName: "Employee Engagement and Ownership",
  sectorName: "Logistics",
  levels: [
    "Employee engagement is low, with limited motivation or connection to organizational goals. Frontline workers often feel like cogs in the machine, with little sense of ownership over their work or improvement initiatives. Communication is mostly one-way from management, and feedback mechanisms are lacking. Turnover may be high, and absenteeism common. Engagement is not measured or prioritized.",
    "Some efforts to engage employees through suggestion programs or team meetings begin. Employees are encouraged to share ideas, but follow-up and implementation are inconsistent. Communication improves but remains largely top-down. Engagement levels vary widely between teams and locations. Recognition and rewards for engagement are sporadic.",
    "Employee engagement is actively fostered through regular two-way communication, empowerment in problem-solving, and involvement in improvement projects. Teams take ownership of local processes and contribute to broader goals. Engagement surveys and feedback mechanisms are used to monitor morale and participation. Recognition programs reinforce positive behaviors. Engagement contributes to operational improvements.",
    "Engagement is deeply embedded in culture and leadership practices. Employees are encouraged and enabled to take initiative, innovate, and lead improvements. Leadership coaches and supports employees consistently. High engagement correlates with improved performance metrics and retention. Employee voice is influential in decision-making and strategy.",
    "Employee engagement is a strategic priority and a source of competitive advantage. Ownership and accountability are ingrained at all levels, with employees actively shaping logistics operations and culture. Engagement metrics are closely monitored and linked to business outcomes. The organization fosters a culture of trust, respect, and continuous dialogue. Employees are brand ambassadors and champions of Lean principles."
  ]
},

// 47. Governance and Accountability — Logistics & Supply Chain
{
  dimensionName: "Governance and Accountability",
  sectorName: "Logistics",
  levels: [
    "Governance structures are unclear or ineffective, with limited accountability for Lean initiatives or logistics performance. Roles and responsibilities are poorly defined. Performance issues are addressed inconsistently. There is little oversight or follow-through on improvement projects. Decision-making lacks transparency.",
    "Basic governance mechanisms, such as committees or steering groups, are formed to oversee Lean activities. Accountability begins to be assigned but enforcement is uneven. Roles and responsibilities are clarified but not fully embraced. Some performance reviews include Lean or logistics metrics. Governance processes are informal.",
    "Clear governance frameworks define roles, responsibilities, and escalation paths for logistics and Lean initiatives. Regular reviews monitor progress and ensure accountability. Governance includes cross-functional participation and leadership sponsorship. Performance and improvement outcomes are tracked systematically. Transparency improves decision-making and resource allocation.",
    "Governance is formalized and integrated with organizational strategy and risk management. Accountability is reinforced through performance contracts and incentives. Governance processes include continuous feedback and adjustment. Cross-functional collaboration supports holistic oversight. Governance drives sustainable Lean deployment and operational excellence.",
    "Governance is agile, data-driven, and embedded at all organizational levels. Accountability is transparent, consistent, and linked to strategic outcomes. Governance structures foster innovation, collaboration, and rapid decision-making. Continuous improvement and risk management are integral to governance. The organization is recognized for exemplary governance practices."
  ]
},

// 48. Customer-Centric Process Design — Logistics & Supply Chain
{
  dimensionName: "Customer-Centric Process Design",
  sectorName: "Logistics",
  levels: [
    "Process design focuses primarily on internal efficiency without considering customer needs or experiences. Customer requirements are not systematically captured or incorporated. Processes are rigid and reactive, leading to customer complaints and dissatisfaction. Feedback loops from customers are limited or absent. Customer-centric thinking is minimal.",
    "Some processes begin to incorporate customer feedback and requirements. Design changes address specific complaints or issues but lack holistic consideration. Customer data is collected sporadically and used reactively. Process improvements prioritize operational convenience over customer value. Collaboration with customer-facing teams is limited.",
    "Processes are designed and improved with regular input from customers and frontline staff. Customer journey mapping and value stream mapping include customer touchpoints. Improvements aim to enhance customer satisfaction, reduce lead times, and improve service quality. Customer feedback is systematically gathered and incorporated. Cross-functional collaboration supports customer-centric design.",
    "Customer-centric process design is standard practice, aligned with strategic customer value propositions. Processes are flexible, adaptive, and designed to exceed customer expectations. Real-time customer feedback informs continuous improvement. Collaboration extends to suppliers and partners to ensure end-to-end customer experience. The organization proactively anticipates customer needs.",
    "Customer-centric design is embedded in organizational culture and innovation strategy. Processes evolve continuously based on deep customer insights and predictive analytics. Customer co-creation and partnerships drive process innovation. The organization leads industry standards in customer experience excellence. Customer-centricity is a key competitive differentiator."
  ]
},

// 49. Resource Optimization — Logistics & Supply Chain
{
  dimensionName: "Resource Optimization",
  sectorName: "Logistics",
  levels: [
    "Resource use (labor, equipment, space) is inefficient and poorly managed. Overstaffing or understaffing is common, and equipment downtime reduces productivity. Space utilization is suboptimal, causing congestion and delays. Resource allocation is reactive and based on short-term needs. Waste and costs are high.",
    "Basic resource planning tools and scheduling improve labor and equipment utilization. Teams begin identifying resource bottlenecks and reallocating as needed. Space management is addressed in some areas but not comprehensively. Resource optimization efforts are localized and not sustained. Efficiency gains are inconsistent.",
    "Resource optimization is systematic, supported by workforce management systems and equipment maintenance plans. Space utilization is monitored and improved through layout redesigns. Resource allocation aligns with demand forecasts and operational priorities. Continuous improvement initiatives target resource waste reduction. Metrics track resource productivity.",
    "Advanced analytics and automation optimize resource deployment dynamically. Labor, equipment, and space are flexibly allocated to balance workload and maximize throughput. Cross-functional coordination enhances resource efficiency. Resource optimization supports sustainability goals and cost reduction. Performance targets include resource utilization metrics.",
    "Resource optimization is predictive, continuous, and integrated with business strategy. AI and real-time data adjust resources proactively to changing conditions. The organization achieves high asset utilization with minimal waste. Resource strategies align with innovation and growth objectives. Resource optimization contributes to competitive advantage and sustainability leadership."
  ]
},

// 50. Leadership Development — Logistics & Supply Chain
{
  dimensionName: "Leadership Development",
  sectorName: "Logistics",
  levels: [
    "Leadership development is minimal and unstructured. Supervisors and managers receive limited training focused mainly on operational tasks. Coaching and mentoring are rare. Leadership capabilities are inconsistent, affecting team performance and Lean adoption. Succession planning is absent.",
    "Basic leadership training programs are introduced, covering communication, problem-solving, and Lean awareness. Some coaching and mentoring occur but lack consistency and depth. Leadership development is reactive, often in response to performance issues. Leadership roles and expectations begin to be clarified.",
    "Structured leadership development programs exist, including formal training, coaching, and mentoring. Leadership competencies align with Lean principles and organizational goals. Leadership development is planned and evaluated systematically. Leaders actively support continuous improvement and employee engagement. Succession planning starts.",
    "Leadership development is integrated into talent management and business strategy. Leadership programs include advanced Lean coaching, change management, and strategic thinking. Leaders model Lean behaviors and drive cultural transformation. Continuous leadership assessment and development sustain capability. Succession planning ensures leadership pipeline strength.",
    "Leadership development is proactive, personalized, and aligned with future organizational needs. Leaders at all levels are empowered to innovate and coach Lean culture. Leadership programs incorporate external benchmarking and thought leadership. The organization fosters a community of practice among leaders. Leadership excellence is a core competitive advantage."
  ]
},

// 51. Problem-Solving Methodologies — Logistics & Supply Chain
{
  dimensionName: "Problem-Solving Methodologies",
  sectorName: "Logistics",
  levels: [
    "Problem-solving is mostly reactive and informal, relying on quick fixes rather than systematic approaches. Issues often recur because root causes are not identified or addressed. Employees have limited knowledge of structured problem-solving tools. Solutions tend to focus on symptoms rather than underlying problems. Learning from problems is minimal.",
    "Basic problem-solving techniques such as 5 Whys and PDCA cycles are introduced in select teams. Improvement events focus on resolving immediate issues. Training on methodologies is limited and not standardized. Some teams begin documenting problems and solutions but follow-up is inconsistent. Problem-solving remains largely event-driven.",
    "Structured problem-solving methodologies are widely adopted across logistics functions. Teams use tools such as A3 reports, root cause analysis, and standard work to systematically address issues. Problem-solving is integrated into daily work, with documented actions and results. Supervisors coach teams in effective methodologies. Problem-solving supports continuous improvement.",
    "Advanced problem-solving techniques and data analytics support complex and cross-functional issue resolution. Teams collaborate proactively to anticipate and prevent problems. Problem-solving outcomes are linked to performance metrics and shared broadly. Continuous learning from problems drives innovation. Problem-solving culture is strong and embedded.",
    "Problem-solving is a strategic capability, leveraging AI and predictive analytics to identify risks and opportunities. The organization fosters innovation through experimentation and rapid iteration. Lessons learned are institutionalized and disseminated globally. Problem-solving drives breakthrough improvements and competitive advantage. The culture celebrates challenges as opportunities."
  ]
},

// 52. Change Leadership — Logistics & Supply Chain
{
  dimensionName: "Change Leadership",
  sectorName: "Logistics",
  levels: [
    "Change initiatives are poorly managed, with limited leadership support or clear communication. Employees resist changes due to fear, lack of understanding, or mistrust. Change efforts often fail or stall. There is little planning or follow-up. Change is viewed as disruptive rather than beneficial.",
    "Change leadership skills begin to develop with some training for managers. Communication improves but is inconsistent. Change initiatives are more structured but still lack broad engagement. Leaders struggle to address resistance effectively. Employees have limited involvement in change processes.",
    "Leaders actively lead change efforts, communicating vision and rationale clearly. Stakeholders are engaged early, and resistance is managed proactively. Change management tools and processes support successful adoption. Training and coaching help employees adapt. Change leadership is recognized as critical.",
    "Change leadership is embedded into leadership development and organizational culture. Leaders model adaptability and resilience. Change initiatives are aligned with strategy and involve cross-functional collaboration. Continuous feedback and improvement strengthen change outcomes. The organization embraces change as an opportunity.",
    "Change leadership is a core competency driving agility and transformation. Leaders foster a culture of innovation and continuous adaptation. Change is anticipated and managed proactively using data and insights. The organization thrives in dynamic environments, maintaining competitive advantage. Change leadership excellence is benchmarked and shared."
  ]
},

// 53. Cross-Training and Knowledge Transfer — Logistics & Supply Chain
{
  dimensionName: "Cross-Training and Knowledge Transfer",
  sectorName: "Logistics",
  levels: [
    "Cross-training is minimal or nonexistent. Employees perform narrow roles with little exposure to other functions. Knowledge transfer relies on individual initiative rather than formal programs. Skill gaps create vulnerabilities during absences or turnover. Workforce flexibility is low.",
    "Some cross-training programs are initiated, often informally or in response to staffing needs. Knowledge transfer occurs through shadowing or mentoring but lacks structure. Employees recognize the benefits of cross-training but participation is limited. Workforce flexibility improves slightly. Documentation of skills is inconsistent.",
    "Structured cross-training and knowledge transfer programs are implemented across logistics functions. Training plans and schedules ensure coverage of critical skills. Mentoring and peer coaching support knowledge sharing. Workforce flexibility and coverage improve. Skill documentation is maintained and used for planning.",
    "Cross-training is integrated into workforce development and operational planning. Employees are regularly rotated to build broad capabilities. Knowledge transfer supports continuous improvement and innovation. Technology tools assist skill tracking and learning. Workforce agility enhances operational resilience.",
    "Cross-training and knowledge transfer are strategic priorities supported by advanced learning platforms and personalized development plans. The workforce is highly adaptable, with deep multi-functional skills. Knowledge transfer networks extend across partners and suppliers. Continuous learning is embedded in culture. Workforce capability is a competitive differentiator."
  ]
},

// 54. Visual Controls for Safety and Quality — Logistics & Supply Chain
{
  dimensionName: "Visual Controls for Safety and Quality",
  sectorName: "Logistics",
  levels: [
    "Visual controls related to safety and quality are sparse or absent. Employees rely on verbal instructions or written policies that are not easily accessible. Safety hazards and quality issues may go unnoticed or unaddressed. Training on visual controls is minimal. Incident rates are high.",
    "Basic visual controls such as signage, labels, and warning indicators are implemented in key areas. Employees begin to use visual cues to identify hazards or quality checkpoints. Visual controls are inconsistent and not standardized. Training on their use is limited. Safety and quality improve but remain reactive.",
    "Visual controls for safety and quality are standardized and integrated into workflows. Color-coding, floor markings, and checklists guide employee behavior and inspections. Visual management boards display safety and quality metrics prominently. Employees are trained and accountable for maintaining controls. Incident rates decline.",
    "Visual controls are dynamic and supported by digital technologies such as sensors and alerts. Controls are reviewed and updated regularly based on risk assessments and data analysis. Leadership uses visual data to coach and engage teams. Safety and quality culture is proactive and continuously improving. Visual controls prevent incidents before they occur.",
    "Visual controls are fully integrated with real-time monitoring systems and predictive analytics. Automated alerts and dashboards provide immediate feedback on safety and quality status. Employees and leaders use visual data to drive continuous innovation and risk reduction. The organization benchmarks and shares best practices. Visual control excellence supports world-class safety and quality performance."
  ]
},

// 55. Lean Culture Alignment — Logistics & Supply Chain
{
  dimensionName: "Lean Culture Alignment",
  sectorName: "Logistics",
  levels: [
    "Lean culture is poorly understood or embraced, often viewed as a set of tools rather than a mindset. Employees may be skeptical or resistant. Lean initiatives are project-based with limited sustainability. Communication about Lean values and behaviors is minimal. Cultural change is not managed.",
    "Awareness of Lean culture grows through training and initial engagement efforts. Some teams begin to adopt Lean behaviors, but consistency is lacking. Leadership communicates Lean importance but may lack role modeling. Lean is often seen as separate from daily work. Cultural gaps remain.",
    "Lean culture is established with widespread understanding and adoption of Lean principles and behaviors. Leadership models Lean values consistently. Employees are empowered and engaged in continuous improvement. Lean behaviors are reinforced through recognition and performance management. Culture supports Lean sustainability.",
    "Lean culture is deeply embedded and drives decision-making, problem-solving, and innovation. Cross-functional collaboration and learning are hallmarks. Leaders develop Lean capabilities and coach others. Continuous improvement is part of organizational DNA. Culture adapts dynamically to challenges.",
    "Lean culture is a defining organizational characteristic, driving strategic advantage and resilience. Lean thinking permeates all levels and functions, including partners and suppliers. The organization leads in Lean innovation and culture development. Lean culture is measured, managed, and continuously evolved. It supports excellence and transformation."
  ]
},

// 56. Technology Adoption for Lean — Logistics & Supply Chain
{
  dimensionName: "Technology Adoption for Lean",
  sectorName: "Logistics",
  levels: [
    "Technology use is limited and often disconnected from Lean objectives. Manual processes dominate. Technology adoption is reactive, driven by cost or compliance rather than Lean improvement. Employees may lack skills or confidence in technology. Integration between systems is poor.",
    "Selective adoption of technologies such as barcode scanners or basic warehouse management systems begins. Technology supports some Lean projects but is not fully integrated. Training and support are limited. Technology benefits are realized unevenly. Resistance to change persists.",
    "Technology adoption aligns with Lean objectives, supporting process standardization, visual management, and data collection. Systems integrate to improve workflow and visibility. Employees are trained and engaged in technology use. Technology enables continuous improvement and problem-solving. Investments support Lean strategy.",
    "Advanced technologies such as automation, robotics, and real-time analytics are deployed to enhance Lean processes. Integration across logistics systems supports seamless operations. Technology drives innovation and operational excellence. Change management supports adoption and optimization. Technology ROI is monitored.",
    "Technology adoption is strategic, innovative, and continuous. Emerging technologies such as AI, IoT, and machine learning transform Lean logistics operations. The organization leads in technology-enabled Lean innovation. Digital maturity supports agility, transparency, and sustainability. Technology is a key competitive differentiator."
  ]
},

// 57. Sustainability Metrics and Reporting — Logistics & Supply Chain
{
  dimensionName: "Sustainability Metrics and Reporting",
  sectorName: "Logistics",
  levels: [
    "Sustainability metrics are not defined or tracked in logistics operations. Reporting on environmental impact is minimal or absent. Awareness of sustainability’s importance is low. Compliance with regulations is reactive and limited. Sustainability is not linked to business performance.",
    "Basic sustainability metrics such as energy use, waste generation, or emissions are collected in some areas. Reporting is periodic and focused on compliance. Awareness among employees and leadership grows. Sustainability initiatives are localized and project-based. Data quality and consistency vary.",
    "Comprehensive sustainability metrics are defined, collected, and analyzed across logistics functions. Reporting is regular and supports management decisions. Sustainability goals align with corporate strategy. Employees participate in sustainability initiatives. Continuous improvement targets environmental performance.",
    "Sustainability metrics are integrated with financial and operational KPIs. Reporting is transparent and communicated to stakeholders. Data analytics support identifying improvement opportunities. Sustainability performance influences planning and resource allocation. The organization benchmarks and shares results externally.",
    "Sustainability metrics and reporting are strategic and innovative. Real-time monitoring and predictive analytics enable proactive environmental management. Reporting meets or exceeds industry and regulatory standards. Stakeholder engagement and transparency are exemplary. Sustainability performance drives competitive advantage and reputation."
  ]
}



// 1. Leadership Commitment — Manufacturing
{
  dimensionName: "Leadership Commitment",
  sectorName: "Manufacturing",
  levels: [
    "Leadership involvement in improvement is minimal and largely reactive, with little visible presence on the shop floor. Lean or CI initiatives are seen as short-term fixes for crises rather than part of a long-term vision. Employees sense a lack of commitment from leaders, who rarely communicate clear expectations or support sustained change. Improvement efforts are fragmented, and frontline staff view Lean as another management fad.",
    "Some leaders begin participating in Lean trainings or pilot projects, typically in response to specific operational issues. Support is mostly symbolic, with few sustained actions or follow-up after improvement events. Gemba walks and shop-floor visits happen but are infrequent and unstructured, and communication remains mostly top-down. Awareness of Lean slowly increases, but employees feel disconnected from leadership goals.",
    "Leaders actively sponsor Lean initiatives and link them to important manufacturing metrics like quality and delivery. Regular performance reviews include Lean objectives, and managers conduct Gemba walks to engage with frontline teams. Two-way communication improves, and feedback is increasingly valued. Cross-functional collaboration emerges, breaking down some organizational silos and elevating Lean as a business priority.",
    "Lean leadership is fully integrated into both daily operations and strategic planning. Senior leaders coach middle managers and routinely participate in CI activities, dedicating resources to sustain improvements across functions. Lean metrics are visible in dashboards and business reviews, ensuring alignment with corporate goals. Leadership presence is consistent, championing Lean culture and motivating employees to innovate.",
    "Leaders drive Lean as a core strategic imperative and foster a culture of continuous improvement at every level. Decision-making is data-driven, and real-time analytics are used to proactively address manufacturing challenges. Employees are empowered to sustain improvements and innovate independently. The organization collaborates internally and externally to extend Lean principles throughout the supply chain, making continuous improvement integral to its competitive identity."
  ]
},

// 2. Coaching & Role Modeling — Manufacturing
{
  dimensionName: "Coaching & Role Modeling",
  sectorName: "Manufacturing",
  levels: [
    "Coaching is absent or minimal, with supervisors focused solely on task completion and meeting immediate targets. Feedback is generally reactive, given only in response to errors, and opportunities for development are rare. Lean behaviors and language are not demonstrated by leaders or supervisors, making improvement seem irrelevant to frontline staff. Problem-solving and skill development are handled by supervisors alone without involving operators.",
    "Some supervisors attend Lean workshops and begin experimenting with basic coaching during specific improvement events. Coaching is informal, sporadic, and largely reactive, limited to a few leaders or specific teams. Peer learning occurs occasionally but lacks structure, and operators receive little direct support for Lean thinking outside formal events. Role modeling of Lean behaviors is inconsistent and not yet part of daily routines.",
    "Coaching is becoming an expected part of the supervisor's role, integrated into regular Gemba walks and team huddles. Leaders use standardized coaching questions and provide feedback focused on root cause analysis and Lean tools. Visual coaching boards and checklists support skill development, and operators begin sharing small improvements. Coaching conversations help build team reflection, confidence, and Lean capability.",
    "Managers receive formal Lean coaching training and consistently mentor frontline supervisors, making coaching a data-informed, ongoing process. Role modeling of Lean behaviors is routine, visible across all shifts and departments, and extends beyond immediate teams to promote cross-functional learning. Visual tools and skill matrices are used widely to track progress and development needs. Peer mentoring and structured learning are embedded in daily operations.",
    "Coaching is recognized as a core strategic capability and deeply embedded at all organizational levels. Master coaches support leadership and frontline skill-building, with Lean behaviors and language modeled everywhere. Coaching outcomes are measured and linked to both performance metrics and career growth. Peer coaching and mentoring networks flourish, making Lean adoption sustainable and self-reinforcing."
  ]
},

// 3. Lean Mindset Adoption — Manufacturing
{
  dimensionName: "Lean Mindset Adoption",
  sectorName: "Manufacturing",
  levels: [
    "Lean is viewed as a temporary initiative, focused on cutting costs and not seen as relevant to daily manufacturing work. Problem-solving is reactive, limited to putting out fires, with Lean tools and concepts largely unknown. Employees see continuous improvement as someone else’s job, and improvement efforts lack structure or follow-through. There is little sense of shared purpose or engagement.",
    "Awareness of Lean concepts such as PDCA and 5 Whys begins to grow, but their use is limited to special improvement events. Problem-solving is still event-driven, and continuous improvement is not yet part of daily operations. Success stories and lessons learned are not widely shared, limiting organizational learning. Employees remain skeptical about the long-term value of Lean.",
    "Lean thinking starts to be reflected in daily conversations, with operators applying problem-solving tools to address workflow challenges. Visual management and improvement idea boards become common, and best practices are shared among teams. Ownership of small-scale improvements grows, and collaboration across departments increases. Lean is increasingly recognized as part of the organization's operational DNA.",
    "The Lean mindset is well established and actively drives daily manufacturing operations. Teams proactively challenge existing processes to reduce waste and variability, using Lean principles in meetings, planning, and decision-making. Cross-functional collaboration is strong, focused on improving end-to-end flow. Continuous improvement behaviors are widespread, and employees support each other’s development.",
    "Lean thinking is fully ingrained in the culture, with continuous improvement and innovation guiding everything from daily work to strategic planning. Teams instinctively seek ways to improve performance and customer satisfaction, driven by data and experimentation. Lean language and behaviors are consistent at all levels, and the organization is recognized as an industry leader for Lean culture and performance."
  ]
}



// 4. Employee Empowerment — Manufacturing
{
  dimensionName: "Employee Empowerment",
  sectorName: "Manufacturing",
  levels: [
    "Operators have little autonomy and are expected to simply follow instructions, with improvement suggestions discouraged or ignored. Processes are rigid, dictated entirely from the top down, and there are no systems to collect or act on frontline ideas. Employees are disengaged from improvement activities and do not see themselves as contributors to change. The work environment feels controlling and uninspiring.",
    "Operators start to voice ideas in team meetings, but implementation is inconsistent and depends on supervisor support. Ownership for improvements is unclear, and many ideas are not followed through, causing frustration. Suggestion systems may exist but are informal and unreliable, with cross-training opportunities rare. Employees are hesitant to take initiative and remain cautious about raising issues.",
    "Operators begin to lead daily meetings and implement small process changes within their teams, with visible recognition for their efforts. Visual boards track ideas and results, and supervisors encourage sharing and celebrating wins. Cross-training increases workforce flexibility, and empowerment spreads, but may still be limited to specific areas. Employees start to take more initiative in problem-solving and process improvement.",
    "Operators are cross-trained and take responsibility for both team performance and ongoing improvement, supported by formal suggestion systems that ensure ideas are followed up. Teams set their own improvement targets and mentor each other, extending empowerment across departments. Psychological safety and open communication become the norm, supporting risk-taking and learning. Collaboration across the value stream grows stronger.",
    "Employees are fully empowered to design and drive improvements across the manufacturing process, participating in workflow planning and leading major projects. The culture rewards initiative, innovation, and risk-taking within safe boundaries, with continuous learning opportunities for all. Recognition and career growth reinforce empowerment, and employees are strategic partners in achieving operational excellence. Teams take collective ownership for results and drive competitive advantage."
  ]
},

// 5. Psychological Safety — Manufacturing
{
  dimensionName: "Psychological Safety",
  sectorName: "Manufacturing",
  levels: [
    "A climate of blame dominates, making employees reluctant to report mistakes, voice concerns, or challenge current practices. Open dialogue about errors or improvement opportunities is rare, and most issues are hidden to avoid negative consequences. There are no formal forums for honest discussion or learning from failure. The environment suppresses creativity, innovation, and continuous improvement.",
    "Some supervisors begin to encourage feedback, but the environment remains inconsistent and many employees are still wary. Discussions about problems may happen in private but are avoided in groups, and a blame culture persists in subtle ways. Improvement initiatives are top-down and trust is limited. Employees continue to be cautious about speaking up or admitting mistakes.",
    "Teams hold open debriefs after incidents, focusing on learning rather than assigning blame. Supervisors model vulnerability, admit mistakes, and encourage employee input. Mistakes are increasingly seen as learning opportunities, and reporting of near-misses rises. Communication becomes more honest, supporting a culture of improvement.",
    "Psychological safety is embedded in daily routines, including team huddles and problem-solving meetings. Leaders actively reinforce an environment where sharing ideas and concerns is safe, and structured forums encourage constructive discussion. Employees trust that raising issues will lead to support and learning, not punishment. High transparency enables rapid identification and resolution of problems.",
    "Psychological safety is a core value, woven into hiring, training, and leadership practices across the organization. Employees confidently challenge inefficient or unsafe practices and offer feedback in all directions. Experimentation and honest dialogue are celebrated, enabling innovation and continuous improvement. Manufacturing teams are resilient, adaptable, and highly engaged."
  ]
},

// 6. Cross-Level Communication — Manufacturing
{
  dimensionName: "Cross-Level Communication",
  sectorName: "Manufacturing",
  levels: [
    "Communication is largely top-down, with little opportunity for frontline operators to provide feedback or influence decisions. Important information is delayed, filtered, or distorted as it passes through organizational layers. Meetings focus on tasks, not open dialogue, and collaboration across shifts or departments is rare. Employees often feel disconnected from management priorities.",
    "Some formal communication channels exist, such as newsletters or bulletin boards, but employee participation is passive. Feedback from the frontline is collected occasionally and often ignored, leading to frustration. Communication between shifts and departments improves slightly but remains inconsistent and one-way. Issues escalate slowly due to unclear pathways for reporting problems.",
    "Tiered daily meetings and structured huddles establish regular two-way communication between operators and supervisors. Visual boards track issues and progress, and supervisors bring operator concerns to management discussions. Communication across departments becomes more deliberate, building trust through frequent updates. Feedback loops are established, enabling timely problem-solving.",
    "Real-time escalation systems and issue trackers connect frontline teams with engineers and managers for prompt resolution of problems. Standardized visual tools and digital platforms support transparent, consistent communication. Frontline staff are invited to participate in reviews, and collaboration across sites grows. Communication supports both operational flow and continuous improvement.",
    "Communication systems fully integrate frontline teams with leadership through digital and in-person channels, making feedback traceable and actionable. Operators are engaged in strategic planning and problem-solving at all levels, and open dialogue is the cultural norm. Cross-department and cross-site communication is seamless, aligning the entire organization. Transparent, timely communication drives unity and continuous improvement."
  ]
}

// 7. Lean Training and Education — Manufacturing
{
  dimensionName: "Lean Training and Education",
  sectorName: "Manufacturing",
  levels: [
    "Lean training is minimal or absent, with most employees unfamiliar with Lean terminology or concepts. Any learning that occurs is informal, inconsistent, and usually triggered by audits or urgent problems. There is no structured curriculum, ongoing education plan, or resources dedicated to Lean. Employees lack confidence in using Lean tools, and training is not prioritized.",
    "Basic Lean training is introduced, often during onboarding or improvement events, with select operators and supervisors gaining exposure to tools like 5S or PDCA. Training focuses more on compliance than skill-building, and refresher sessions are rare. Application of Lean knowledge is inconsistent, and engagement remains low. Staff begin to develop awareness, but practical understanding is limited.",
    "Role-based training plans are established, covering problem-solving tools and visual management for operators, supervisors, and engineers. Training is delivered through classroom instruction and hands-on coaching, supporting application in active improvement projects. Supervisors reinforce Lean concepts in daily work, and performance is increasingly linked to training outcomes. Employees gain practical skills and start using Lean tools routinely.",
    "Structured Lean education pathways, including certifications and internal facilitators, are available across the manufacturing site. Continuous development is embedded into business practices, and training is tied to career progression. Regular simulations and Kaizen events support practical learning, while learning management systems track participation and effectiveness. Lean education is valued and actively supported by leadership.",
    "Lean training is a strategic priority, anchored by a dedicated academy or center of excellence. Partnerships with external experts bring in benchmarking and innovation, while adaptive, data-driven programs are integrated with daily work. All employees are expected to continuously upgrade their Lean skills, with coaching part of every leadership role. A culture of Lean learning permeates the organization, driving both performance and innovation."
  ]
},

// 8. Recognition and Celebration — Manufacturing
{
  dimensionName: "Recognition and Celebration",
  sectorName: "Manufacturing",
  levels: [
    "Improvement efforts receive little or no recognition, and employee motivation is low. Managers may acknowledge output targets, but Lean achievements go unnoticed. There are no structured systems for sharing success stories or celebrating contributions. Recognition is rare, informal, and inconsistent, leading to disengagement.",
    "Occasional awards or acknowledgments are introduced, but these tend to highlight individual performance rather than Lean improvements. Celebrations are infrequent, low-profile, and not clearly connected to Lean outcomes. Peer recognition is limited, and successes are seldom shared widely. Continuous improvement remains a low priority for recognition.",
    "Teams and individuals are regularly recognized in meetings and newsletters for specific Lean contributions. Small rewards and informal acknowledgments encourage wider participation, and success stories help build momentum. Peer recognition grows, fostering camaraderie and a positive work environment. Recognition is increasingly linked to Lean values and behaviors.",
    "Formal recognition programs are established, tying rewards such as bonuses or time off to continuous improvement achievements. Celebrations are public, timely, and involve leaders at multiple levels. Recognition is both for results and Lean behaviors, and success stories are integrated into business reviews. The culture of appreciation supports high levels of engagement and motivation.",
    "Recognition is embedded into performance management and leadership assessments, with annual Lean summits celebrating excellence. Peer-nominated awards and data-driven recognition reinforce innovation and participation. Employees take pride in their role as Lean leaders, and success is celebrated internally and externally. Recognition sustains a high-performing culture and drives ongoing improvement."
  ]
},

// 9. Change Management Readiness — Manufacturing
{
  dimensionName: "Change Management Readiness",
  sectorName: "Manufacturing",
  levels: [
    "Resistance to change is widespread, driven by poor communication and a lack of training or involvement. Change initiatives are introduced abruptly, with employees reverting to old habits and undermining improvements. Support and preparation for change are minimal, and change is viewed as a burden. Employees feel excluded from decision-making and improvement efforts stall.",
    "Changes are piloted in select areas with limited feedback or staff input. Communication about changes is unclear, and follow-up is inconsistent, creating ongoing resistance. Training is provided only when absolutely necessary, leaving employees uncertain about expectations. Transparency and involvement are still lacking, making change adoption difficult.",
    "Structured processes for managing change are introduced, including risk assessments, operator input, and planned training. Feedback loops are established to adjust plans based on frontline experiences. Change leaders emerge, helping guide teams through transitions, and acceptance of change grows. Employees start seeing change as a part of continuous improvement.",
    "Change management becomes proactive, with roadmaps developed in collaboration with operators and key stakeholders. Simulations and pilot programs prepare teams for upcoming shifts, and pre- and post-implementation reviews capture lessons learned. Visual tools and robust communication plans help ensure smooth transitions and minimize resistance. Change readiness is now part of daily management.",
    "Change readiness is institutionalized and tracked as a core competency, with leaders coaching teams through transitions using real-time data and feedback. Cross-functional collaboration ensures change has minimal disruption and maximum buy-in. Continuous improvement and change are inseparable, and the workforce is skilled in rapid adaptation. The organization thrives in dynamic conditions and rapidly innovates to meet new challenges."
  ]
}

// 10. Daily Problem-Solving Culture — Manufacturing
{
  dimensionName: "Daily Problem-Solving Culture",
  sectorName: "Manufacturing",
  levels: [
    "Problem-solving is mainly reactive and informal, focused on quick fixes when issues arise. Operators rely on supervisors to handle recurring problems, and little documentation exists for solutions or lessons learned. Standardized problem-solving tools are rarely used, and improvement is not part of daily work. The organization lacks a culture of continuous learning from problems.",
    "Basic problem-solving tools such as 5 Whys and root cause analysis are introduced during improvement events, but use remains sporadic. Teams document issues and countermeasures during projects, but involvement is limited and follow-through is inconsistent. Most resolutions are still led by supervisors, with little team engagement in analysis. Learning from problems is not yet systematic.",
    "Structured problem-solving becomes integrated into daily work, and Lean tools are regularly used by teams to address process disruptions. Issues are documented, tracked, and visually managed, with operators actively involved in root cause investigations. Supervisors coach teams in effective methodologies, and cross-functional collaboration grows for complex problems. Learning from issues is now routine, supporting ongoing improvement.",
    "Problem-solving is deeply embedded in management systems, with clear escalation protocols and linkage to key performance indicators. Teams use systematic approaches like A3 thinking, and resolution progress is monitored closely. Lessons learned are shared across functions, leading to updates in standard work and process design. Continuous learning accelerates cycles of improvement and innovation.",
    "Problem-solving is a core organizational competency, with cross-functional teams collaborating to anticipate, prevent, and resolve systemic issues. Advanced analytical tools and data-driven methods support both proactive and preventative actions. Knowledge is widely shared, and continuous improvement is driven by insights from problem-solving at all levels. The culture empowers everyone to drive innovation and operational excellence through robust problem-solving."
  ]
},

// 11. Team Engagement in Improvement — Manufacturing
{
  dimensionName: "Team Engagement in Improvement",
  sectorName: "Manufacturing",
  levels: [
    "Team participation in Lean or improvement activities is minimal, with limited awareness or opportunities for involvement. Most initiatives are led by management, and frontline employees feel disengaged or skeptical about improvement programs. Communication about Lean is one-way and does not invite team input or ownership. There is little motivation for teams to drive change.",
    "Some teams begin to participate in isolated improvement events or meetings, but engagement is inconsistent across the site. Employees may contribute ideas occasionally, but implementation often lacks support or follow-through from leadership. Awareness of Lean grows slowly, but collaboration and ownership remain limited. Team-based improvement is not yet a cultural norm.",
    "Teams regularly engage in improvement activities such as Kaizen events, daily huddles, and problem-solving meetings. Members take increasing ownership of improvements and begin sharing successes and best practices across the floor. Recognition and coaching support team motivation, and cross-functional collaboration begins to take hold. A culture of learning and participation emerges.",
    "Teams become self-directed in managing and executing improvement projects, sharing results and practices across units and shifts. Engagement spans all roles, and employees actively seek out ways to optimize workflows and processes. Cross-department collaboration is routine, breaking down organizational silos. Coaching and peer support sustain high engagement and momentum.",
    "Teams are recognized as key drivers of innovation and improvement throughout the manufacturing operation. Proactive in identifying opportunities and spreading successful practices organization-wide, they contribute to both strategic initiatives and external benchmarking. Engagement programs and leadership coaching reinforce deep team ownership. Continuous improvement is intrinsic to team culture and a source of competitive advantage."
  ]
},

// 12. Value Stream Mapping — Manufacturing
{
  dimensionName: "Value Stream Mapping",
  sectorName: "Manufacturing",
  levels: [
    "There is little understanding or documentation of end-to-end process flow or material movement in manufacturing. Bottlenecks, waste, and inefficiencies go unaddressed, and improvement efforts focus on isolated tasks. The lack of process visibility limits problem-solving and overall coordination. Value streams operate in silos with little collaboration.",
    "Departments begin mapping segments of their processes, typically within their own functional areas. Maps are often incomplete or outdated, and frontline staff have limited involvement in mapping efforts. Value stream concepts are introduced but not consistently applied, and opportunities for improvement are often missed. Coordination across departments remains weak.",
    "Value stream mapping becomes a regular tool for analyzing and visualizing manufacturing flows, with cross-functional teams and operators actively involved. Maps highlight sources of waste, delays, and bottlenecks, guiding focused improvement efforts. Teams begin to align metrics and improvement goals with overall flow efficiency. Mapping exercises are integrated into ongoing Lean activities.",
    "Comprehensive and dynamic value stream maps are maintained across all manufacturing operations and regularly updated using data-driven insights. Cross-functional collaboration is strong, and accountability for value delivery is shared among teams. Supplier and customer touchpoints are included in the maps, ensuring improvements extend beyond internal processes. Continuous improvement leverages mapping outputs to drive system-wide gains.",
    "Value stream maps are fully integrated with real-time digital systems, enabling predictive analytics and seamless coordination across the entire operation. Manufacturing processes operate as a synchronized system, delivering maximum customer value with minimal waste. Mapping extends beyond the company to suppliers and customers, supporting external collaboration. Ongoing innovation and benchmarking are driven by value stream insights."
  ]
}

// 13. Process Flow Efficiency — Manufacturing
{
  dimensionName: "Process Flow Efficiency",
  sectorName: "Manufacturing",
  levels: [
    "Material and information flow is disjointed, causing frequent delays, redundancies, and rework across the factory. Bottlenecks, waiting, and resource conflicts often result in missed schedules and dissatisfied customers. Operational focus is reactive, with teams struggling to coordinate activities between departments. Little effort is made to standardize or optimize the overall flow.",
    "Efforts to streamline specific processes, such as assembly or inspection, begin to emerge within departments, leading to some reduction in waste and delays. Communication between functions slightly improves, and certain workflows become more predictable. However, improvements remain localized, and process standardization is limited. Operators are aware of flow issues but lack tools or authority to address them holistically.",
    "Process flow efficiency is actively managed, with pull systems and standard work introduced to level workloads and minimize bottlenecks. Cross-functional teams work together to smooth transitions between stages and align processes to customer demand. Visual management and data tracking support early detection of disruptions. Customer impact is considered in flow redesign, and continuous improvement targets flow optimization.",
    "Integrated scheduling and resource planning reduce process variability and waiting times throughout the factory. Real-time tracking and advanced planning systems enable teams to respond quickly to issues and maintain continuous flow. Efficiency metrics are widely monitored, and coordinated planning across departments is routine. The organization values flow efficiency as a critical performance driver.",
    "Process flow is highly synchronized and adaptable, supported by predictive analytics, automation, and dynamic resource allocation. Teams across the business and supply chain collaborate to optimize end-to-end flow, leveraging technologies such as robotics and AI-driven scheduling. Operations flex in real time to meet customer demand and mitigate variability. World-class flow efficiency sets the organization apart from competitors."
  ]
},

// 14. Standard Work / SOPs — Manufacturing
{
  dimensionName: "Standard Work / SOPs",
  sectorName: "Manufacturing",
  levels: [
    "Manufacturing tasks are performed without consistent procedures, resulting in variability, errors, and inefficiencies. Work instructions are often missing, outdated, or ignored, leading to confusion and inconsistent outcomes. Training relies on informal methods, and practices differ widely across teams and shifts. Quality, productivity, and safety suffer from this lack of standardization.",
    "Basic standard operating procedures (SOPs) are developed for some processes, but adherence is uneven and updates are infrequent. Frontline staff may be aware of certain protocols but often improvise or bypass steps. Training on SOPs is limited, and compliance monitoring is weak. Variability persists, and improvements are slow to take root.",
    "Documented SOPs are in place for key processes and are accessible at workstations, guiding teams toward consistent performance. Teams follow these procedures regularly, and updates reflect lessons learned from continuous improvement activities. Training is aligned to current standards, and compliance is monitored with feedback loops. Operators contribute to revising SOPs based on their experiences.",
    "Comprehensive SOPs are embedded into daily work, supported by visual aids and clearly defined timing standards. Regular audits and coaching ensure adherence, and deviations are investigated systematically. SOPs integrate quality, safety, and efficiency requirements, serving as living documents for ongoing improvement. Continuous improvement is closely linked to SOP maintenance.",
    "Standard work is dynamic, continuously updated using real-time feedback and digital technologies. Instant access and updates to SOPs are supported by digital tools, ensuring organization-wide consistency. Training and retraining are rapid and seamlessly integrated into workflows. Best practices are shared with suppliers and partners, setting the benchmark for operational excellence."
  ]
},

// 15. Visual Management — Manufacturing
{
  dimensionName: "Visual Management",
  sectorName: "Manufacturing",
  levels: [
    "Visual management tools are largely absent, and operators rely on verbal instructions or memory, which increases confusion and mistakes. Performance data, problems, and priorities are not displayed or are only accessible to management. Teams detect issues too late, resulting in reactive firefighting. Visual cues do not support day-to-day work or improvement.",
    "Basic visual controls such as signage, labels, and simple charts appear sporadically in the factory, providing some guidance on safety and quality. Some departments display hand-written boards, but maintenance is inconsistent and visuals often become outdated. Operators seldom use visuals for daily decision-making. The impact of visual management is minimal and limited to compliance.",
    "Visual management boards are implemented, displaying key metrics, daily goals, and alerts for abnormalities. Teams use color-coding, signals, and visual controls to track performance and escalate issues during meetings. Operators reference visuals to guide workflow, support problem-solving, and detect early warning signs. Maintenance and ownership of visual systems are built into team routines.",
    "Visual management is standardized and integrated throughout the factory, including real-time dashboards and digital displays. Visual tools are used by leaders and teams for coaching, monitoring, and supporting timely decision-making. Visual cues support workflow, inventory levels, and quality checks, driving transparency and accountability. The visual management system becomes a key enabler of Lean practices.",
    "Visual management is fully digital, interactive, and accessible across the organization, with automated data flows from production systems to displays. Visuals support predictive analysis and strategic alignment, making current status and priorities clear to everyone at a glance. Visitors and new employees instantly understand operational performance and improvement priorities. Visual management drives a culture of transparency, empowerment, and continuous improvement."
  ]
}

// 16. 5S Implementation — Manufacturing
{
  dimensionName: "5S Implementation",
  sectorName: "Manufacturing",
  levels: [
    "Work areas are cluttered, disorganized, and lack designated locations for tools and materials, leading to wasted time, accidents, and low morale. Employees have little awareness of 5S, and improvement efforts are uncoordinated and unsustained. Cleanliness and order vary widely between shifts and teams. Productivity and safety suffer from these conditions.",
    "Basic 5S activities, such as sorting and labeling, are introduced in select areas, often through sporadic red-tag events or clean-up drives. Visual aids like posters appear, but adherence is inconsistent and there is little accountability. Teams start recognizing the benefits of organization, but 5S is not embedded in daily routines. Improvements fade over time without regular follow-up.",
    "5S standards are documented and practiced regularly throughout most work zones, with clear locations for tools, materials, and visual controls to reinforce order. Daily cleanups and resets are routine, and teams begin conducting audits to track compliance and spot improvement opportunities. 5S is integrated into new employee training and supported by visible leadership commitment. Engagement and discipline grow across the workforce.",
    "Sustained 5S is ensured by formal audits, dedicated metrics, and team ownership, with continuous improvements addressing ergonomics, efficiency, and waste reduction. Visual management links 5S status to operational performance boards, fostering transparency. 5S practices extend to suppliers and logistics areas for a unified approach. The culture values workplace discipline as a foundation for excellence.",
    "The manufacturing site exemplifies 5S best practices, benchmarking against world-class standards and leveraging digital tools to monitor and sustain organization. Innovation in workplace layout and organization supports rapid changeovers and safety improvements. Employees proactively identify and solve 5S challenges, and results are shared externally. The environment reflects a deep Lean culture and operational pride."
  ]
},

// 17. Kanban/Pull Systems — Manufacturing
{
  dimensionName: "Kanban/Pull Systems",
  sectorName: "Manufacturing",
  levels: [
    "Inventory is managed reactively with frequent stockouts, excess inventory, and inefficient communication between production and suppliers. There are no formal pull systems, and replenishment is manual and error-prone. Production schedules are disrupted by poor material flow and misaligned supply. Waste and customer dissatisfaction are common.",
    "Simple pull systems, such as Kanban cards or reorder points, are piloted in a few areas to trigger material replenishment. Communication and replenishment become more predictable but still depend on manual tracking and interventions. Staff awareness of pull concepts grows but is inconsistent, and systems lack integration. Improvements remain localized.",
    "Kanban or pull systems are established across multiple production lines, allowing teams to visually monitor inventory and respond proactively to replenishment signals. Material flow aligns more closely with actual demand, reducing excess inventory and shortages. Teams are trained in pull principles and communication improves between departments. Waste from overproduction and waiting is reduced.",
    "Pull systems are integrated throughout the manufacturing process, connecting suppliers, workstations, and distribution centers via digital Kanban tools. Real-time tracking and automated replenishment support just-in-time delivery and reduced inventory carrying costs. Seamless communication enables rapid response to changes in demand. Continuous improvement teams monitor and refine pull systems for optimal flow.",
    "Pull systems are optimized with predictive analytics, automation, and end-to-end integration with suppliers and customers. Autonomous replenishment and material handling technologies minimize inventory without risking service levels. Data-driven decision-making anticipates and adapts to demand fluctuations. Pull excellence is a source of competitive advantage, supporting agile and lean operations."
  ]
},

// 18. Quick Changeover (SMED) — Manufacturing
{
  dimensionName: "Quick Changeover (SMED)",
  sectorName: "Manufacturing",
  levels: [
    "Changeovers between products or setups are lengthy, unpredictable, and poorly documented, resulting in downtime and lost productivity. Operators often improvise procedures, leading to frequent errors and safety risks. No formal methods are used to reduce setup times. The impact of changeovers on production schedules is not understood or managed.",
    "Basic SMED concepts are introduced, such as separating internal and external setup tasks and using checklists for changeovers in select processes. Some improvements reduce changeover times, but practices remain inconsistent and adoption is slow. Awareness of setup reduction grows, but progress is limited to isolated pilots. Teams lack training and structured problem-solving.",
    "Standardized changeover procedures are documented and widely adopted, supported by visual aids, training, and feedback loops. Changeover times decrease significantly, enabling more flexible scheduling and better resource utilization. Teams analyze and refine procedures, and data is collected to monitor performance. Changeovers are planned as part of continuous improvement.",
    "Changeover processes are audited and systematically improved based on operator input and performance data. Simulation and cross-training help prepare staff for rapid, safe transitions. Improvements are shared across multiple sites, and changeovers are synchronized with production plans. The focus is on maximizing equipment utilization and minimizing disruptions.",
    "Rapid, error-free changeovers are achieved consistently through advanced technologies and process innovations. Automation and predictive scheduling enable near-instant transitions, supporting high-mix, low-volume manufacturing. Changeover performance is benchmarked against industry leaders and drives responsiveness to customer needs. Excellence in setup reduction enables agile, world-class manufacturing."
  ]
}
// 19. Error-Proofing (Poka-Yoke) — Manufacturing
{
  dimensionName: "Error-Proofing (Poka-Yoke)",
  sectorName: "Manufacturing",
  levels: [
    "Mistakes in assembly, inspection, and documentation occur frequently, with quality issues often discovered only after the fact. There are no formal error-proofing methods in place, and quality relies on final inspection and operator vigilance. Defects are a regular source of customer complaints. Staff view errors as unavoidable rather than preventable.",
    "Simple error-proofing tools, such as checklists, labels, or fixtures, are introduced in select areas to prevent recurring mistakes. Training increases awareness of common errors, but implementation is inconsistent and solutions are often temporary. Operators discuss error-proofing in improvement events, but broader adoption is lacking. Quality escapes remain a concern.",
    "Dedicated error-proofing solutions, such as interlocks, sensors, or automated checks, are integrated into key processes. Teams identify error-prone steps and use root cause analysis to design robust poka-yoke measures. Operators are empowered to stop production if defects are detected early. Quality improves and rework rates decline as error prevention becomes routine.",
    "Error-proofing is embedded in both process design and daily operations, reinforced by systematic audits and real-time monitoring. Advanced technologies, like RFID and digital alerts, are leveraged to catch and prevent errors before they escalate. Employees are trained to continuously identify and implement new poka-yoke solutions. The culture emphasizes prevention over correction.",
    "Error-proofing is fully integrated with intelligent digital systems that predict and prevent mistakes proactively. All new processes and equipment are designed with mistake-proofing as a core principle. Cross-functional teams innovate and share error-proofing methods internally and with partners. High product quality is achieved by building prevention into every step of manufacturing."
  ]
},

// 20. Process Transparency — Manufacturing
{
  dimensionName: "Process Transparency",
  sectorName: "Manufacturing",
  levels: [
    "Production workflows and inventory status are largely hidden from operators and managers, leading to confusion, delays, and poor coordination. Communication is informal, and problems are detected late. Staff work with incomplete or outdated information. Decisions are often reactive and based on guesswork.",
    "Some visual boards, workflow charts, or digital trackers are introduced to provide basic process visibility, typically within specific departments. Updates are manual and often lag behind actual production status. Operators gain limited insight into bottlenecks, but transparency is inconsistent across shifts. Collaboration and timely response remain weak.",
    "Process transparency improves as real-time dashboards and workflow status displays become available across the plant. Teams regularly review process data in meetings, allowing for faster identification of delays, quality issues, and abnormal conditions. Information flow between shifts and departments becomes more reliable. Data-driven discussions support proactive management.",
    "End-to-end process visibility is achieved with integrated digital systems linking production, inventory, and supply chain data. Staff at all levels access up-to-date information, supporting quick decisions and cross-functional collaboration. Transparency is reinforced by clear escalation protocols and routine sharing of key metrics. Continuous improvement is fueled by shared insights.",
    "Process transparency is seamless and organization-wide, powered by advanced digital platforms and predictive analytics. All stakeholders, including suppliers and customers, have access to relevant real-time data for joint decision-making. Openness accelerates problem-solving and innovation. Transparency is a strategic asset, driving trust, agility, and operational excellence."
  ]
},

// 21. Quality-at-Source — Manufacturing
{
  dimensionName: "Quality-at-Source",
  sectorName: "Manufacturing",
  levels: [
    "Quality checks are performed late in the process, with most issues discovered only during final inspection or after shipment. Operators have little responsibility for quality and depend on separate inspection teams. Rework and defects are common, eroding customer trust. Preventative quality practices are virtually absent.",
    "Operators are introduced to basic quality checks at their workstations and begin receiving training in defect detection and correction. Quality-at-source is discussed during meetings, but implementation varies between teams. Early defect detection improves, but systems for immediate corrective action are lacking. Operators’ involvement in quality is growing but not consistent.",
    "Quality-at-source becomes standard practice, with checks built into every process and operators empowered to stop production to address issues. Visual controls, error-proofing devices, and root cause analysis are used to identify and fix problems early. Teams regularly review quality metrics and drive improvement efforts. Quality ownership spreads throughout the plant.",
    "Real-time quality monitoring and analytics provide immediate feedback to operators and supervisors. Cross-functional teams collaborate on quality improvements, and advanced tools support trend analysis and preventative action. Quality performance is discussed in daily meetings and tied to performance reviews. Proactive prevention is the cultural norm.",
    "Quality is proactively designed and managed into every manufacturing process through advanced digital tools and continuous learning. Employees innovate new methods for defect prevention and share best practices internally and externally. Quality metrics drive strategic decisions and customer partnerships. The organization is recognized as a benchmark for quality-at-source excellence."
  ]
}
// 22. Level Loading / Heijunka — Manufacturing
{
  dimensionName: "Level Loading / Heijunka",
  sectorName: "Manufacturing",
  levels: [
    "Production schedules are highly variable, with peaks and troughs in workload causing bottlenecks, overtime, and idle periods. Departments often react to daily demand changes without coordination, leading to resource strain and inconsistent output. Fluctuations disrupt supply chain stability and negatively impact employee morale.",
    "Some teams begin smoothing workload within their departments by planning ahead and sharing resources during peak periods. Simple leveling tools and visual boards are used to track work distribution, though adjustments are still reactive. Efforts to balance production improve but are localized and lack end-to-end integration.",
    "Level loading is actively managed across production lines, with pull systems and standardized work schedules minimizing bottlenecks and delays. Data from demand forecasts informs planning, and resource allocation is adjusted regularly to maintain a steady workflow. Teams collaborate to share best practices for balancing workload.",
    "Heijunka principles are fully embedded in operations, enabling the plant to flexibly adjust capacity and resources in response to demand changes. Cross-functional coordination ensures balanced production flow, with real-time monitoring tools supporting proactive adjustments. Workload variability is minimal, and employee experience is more consistent.",
    "Dynamic, predictive level loading is achieved using advanced analytics, automation, and AI-driven scheduling. Workloads are continuously optimized across the plant and supply chain, enhancing throughput and reducing waste. The organization anticipates demand changes and responds seamlessly, achieving industry-leading efficiency and agility."
  ]
},

// 23. TPM (Total Productive Maintenance) — Manufacturing
{
  dimensionName: "TPM (Total Productive Maintenance)",
  sectorName: "Manufacturing",
  levels: [
    "Maintenance is reactive and unplanned, resulting in frequent equipment breakdowns and unplanned downtime. Operators have little involvement in maintenance, and data on equipment reliability is rarely tracked or analyzed. Production is often disrupted by avoidable failures, increasing costs and safety risks.",
    "Basic maintenance schedules are introduced for critical machines, and operators receive some training on daily checks. Preventive maintenance tasks are inconsistently performed and documentation is incomplete. Collaboration between operators and maintenance teams is limited, but awareness of TPM is increasing.",
    "TPM pillars, such as autonomous maintenance and planned maintenance, are adopted across major equipment areas. Operators take responsibility for routine upkeep and minor repairs, while downtime data is logged and analyzed for continuous improvement. Preventive actions reduce breakdowns, and reliability increases steadily.",
    "TPM is deeply integrated into daily operations, with cross-functional teams leading continuous improvement in equipment care. Advanced tools enable predictive maintenance and real-time monitoring. OEE (Overall Equipment Effectiveness) is tracked and reviewed regularly. Operators and technicians collaborate closely to optimize performance.",
    "TPM is a cultural norm, supported by intelligent digital systems and IoT sensors that anticipate failures before they occur. Maintenance best practices are embedded in new equipment design and shared across the organization. Near-zero unplanned downtime is achieved, enabling world-class productivity and safety."
  ]
},

// 24. End-to-End Value Stream Integration — Manufacturing
{
  dimensionName: "End-to-End Value Stream Integration",
  sectorName: "Manufacturing",
  levels: [
    "Manufacturing departments operate in silos with poor coordination and limited visibility across the value stream. Processes are fragmented, causing delays, rework, and handoff errors. Information sharing is slow, and customer service suffers from disjointed workflows. Accountability is scattered.",
    "Basic cross-departmental meetings and process handoffs are introduced to improve coordination. Some KPIs are shared across teams, and integration efforts are focused on internal operations. Communication improves but remains manual and reactive. Collaboration with suppliers and customers is rare.",
    "Workflows, performance metrics, and improvement goals are aligned across production, supply chain, and support functions. Digital tools support real-time data sharing, and cross-functional teams work together to optimize end-to-end flow. Value stream mapping is used regularly to drive improvements.",
    "Integration extends to suppliers and customers, creating a synchronized and responsive value stream. Planning and execution are coordinated for minimal delays and waste, with shared accountability for value delivery. Continuous improvement projects include external partners for greater impact.",
    "The value stream operates as a seamless, customer-focused ecosystem, enabled by real-time data integration and digital platforms. Joint improvement projects drive innovation, efficiency, and responsiveness across company boundaries. The organization is recognized as a leader in value stream integration."
  ]
}
// 25. Waste Identification and Elimination — Manufacturing
{
  dimensionName: "Waste Identification and Elimination",
  sectorName: "Manufacturing",
  levels: [
    "Waste such as excess inventory, defects, overprocessing, and waiting is rarely identified or managed systematically. Teams often work around visible problems rather than addressing underlying causes, and improvement efforts focus on firefighting. Employees have little awareness of Lean waste types or their impact on costs and quality. Waste reduction is not embedded in daily culture.",
    "Staff start identifying and addressing obvious wastes during improvement events, with some localized success stories. Basic Lean tools like 5S and root cause analysis are occasionally applied, but sustained results are limited. Teams rely on management direction, and waste often re-emerges. Awareness grows, but consistent methods and accountability are lacking.",
    "Waste elimination becomes systematic as teams regularly analyze processes using Lean techniques such as value stream mapping and standardized work. Cross-functional collaboration helps detect and remove waste, and results are communicated to build momentum. Data supports prioritization and tracking of waste reduction initiatives. Continuous improvement cycles start to take hold.",
    "Waste reduction is part of daily management systems, with clear accountability and metrics at all levels. Employees are empowered to identify, report, and resolve waste quickly, using advanced problem-solving methods. Successes are celebrated and best practices are shared across departments. Environmental and sustainability considerations are integrated into waste elimination.",
    "Eliminating waste is a strategic driver of operational excellence and innovation. Predictive analytics and automation prevent waste before it occurs, and the organization benchmarks and adopts best practices from industry leaders. Waste reduction supports competitive advantage, sustainability, and long-term growth. All employees proactively champion waste elimination in every process."
  ]
},

// 26. Handoffs and Queue Reduction — Manufacturing
{
  dimensionName: "Handoffs and Queue Reduction",
  sectorName: "Manufacturing",
  levels: [
    "Handoffs between production steps are frequent, inconsistent, and poorly managed, causing delays, errors, and long queues. There are no standardized protocols for transferring work, and communication breakdowns are common. Queues form at bottlenecks, increasing lead times and reducing throughput. Customer satisfaction is impacted by unpredictable delivery.",
    "Some teams introduce checklists, schedules, or simple tools to improve handoffs and reduce queue times in pilot areas. Communication between shifts and departments improves, but coordination is still informal and patchy. Queue lengths and delays are measured sporadically, and feedback is not always acted upon. Improvements are localized rather than systemic.",
    "Standardized handoff protocols are implemented across key processes, supported by visual controls and digital tracking. Teams coordinate to ensure smoother transitions, minimizing delays and errors. Queues are actively monitored, and actions are taken to address bottlenecks quickly. Cross-functional collaboration helps maintain continuity and flow.",
    "Real-time coordination and predictive tools minimize handoffs and queues throughout the value stream. Teams use data and analytics to anticipate problems and optimize process flow. Continuous improvement projects target persistent handoff challenges, and results are regularly reviewed in management meetings. Customer satisfaction improves as reliability and responsiveness increase.",
    "End-to-end process integration and automation virtually eliminate unnecessary handoffs and queues. Digital systems synchronize production, logistics, and supply chain activities, ensuring seamless flow from raw materials to finished goods. Rapid issue resolution and continuous monitoring prevent bottlenecks. The organization sets industry standards for flow efficiency and customer service."
  ]
},

// 27. Documentation Discipline — Manufacturing
{
  dimensionName: "Documentation Discipline",
  sectorName: "Manufacturing",
  levels: [
    "Documentation of processes, production records, and quality checks is inconsistent, incomplete, or delayed. Paper-based systems and informal note-taking cause errors, confusion, and compliance risks. Teams often rely on memory or verbal instructions, undermining traceability and process control. Standardization of forms and procedures is lacking.",
    "Basic documentation standards are introduced, and staff are trained to record key information accurately. Digital systems are piloted in some areas, but gaps and inconsistencies remain. Audits are conducted to improve compliance, but accountability is still growing. Document retrieval and sharing are slow and sometimes unreliable.",
    "Documentation practices become disciplined and standardized, with electronic records supporting real-time data entry and retrieval. Employees understand the importance of accurate documentation and follow procedures consistently. Regular audits reinforce good habits, and documentation supports operational control and improvement. Information is available for performance reviews and decision-making.",
    "Documentation is fully integrated with digital workflows and enterprise systems, providing real-time visibility and traceability. Errors and omissions are rare due to validation and automation, and continuous monitoring ensures data quality. Documentation supports regulatory compliance, customer requirements, and efficient operations. Teams use documentation insights to drive improvements.",
    "Seamless, automated documentation processes are a hallmark of operational excellence. Advanced digital platforms capture, validate, and analyze data across the entire manufacturing lifecycle. Documentation accuracy supports real-time decision-making and transparency with customers and regulators. Continuous improvement and best practice sharing are enabled by high-quality documentation."
  ]
}
// 28. Digitization of Workflows — Manufacturing
{
  dimensionName: "Digitization of Workflows",
  sectorName: "Manufacturing",
  levels: [
    "Workflows are primarily manual or paper-based, causing frequent delays, errors, and inefficiencies in production and reporting. Data collection and sharing depend on physical records and informal communication, leading to fragmented information and limited process visibility. Digital tools are rare or isolated, and most processes are not standardized. Operational risks and costs are high due to the lack of integrated systems.",
    "Selected areas begin digitizing tasks such as inventory tracking or production scheduling, using basic digital tools or spreadsheets. Staff receive some training on digital workflows, but adoption is uneven and integration between systems is limited. Workflow improvements occur through project-based digitization efforts rather than organization-wide change. Data silos persist, and benefits are realized only in pockets.",
    "Digital workflows are implemented more broadly, connecting core manufacturing functions like order management, scheduling, and quality control. Integrated systems enable better data sharing, automation, and process standardization. Employees are trained in digital tools, which improves traceability and efficiency across the shop floor. Workflow digitization becomes part of daily operations and continuous improvement.",
    "End-to-end digitization links all manufacturing processes and supply chain activities, supported by robust IT infrastructure and user-friendly platforms. Real-time data capture and mobile access enhance responsiveness, while digital workflows support agile adaptation to customer needs. Feedback loops enable rapid refinement of digital processes. Integration with suppliers and customers creates a seamless digital ecosystem.",
    "Fully integrated, intelligent digital workflows drive autonomous operations and predictive management. Artificial intelligence and machine learning optimize processes dynamically, enabling real-time decision-making and adaptation. The organization leads in digital manufacturing innovation, sharing expertise and best practices externally. Digitization is a foundation for operational excellence and strategic growth."
  ]
},

// 29. Lean Integrated into Corporate Strategy — Manufacturing
{
  dimensionName: "Lean Integrated into Corporate Strategy",
  sectorName: "Manufacturing",
  levels: [
    "Lean principles are largely absent from corporate strategy and long-term planning, resulting in fragmented and reactive improvement efforts. Leadership does not set a vision for Lean transformation, and resource allocation for Lean initiatives is limited or inconsistent. Lean is perceived as a short-term fix or compliance measure rather than a strategic driver. Alignment with organizational goals is weak or nonexistent.",
    "Lean is recognized as a potential improvement approach, with pilot projects targeting specific operational issues. Leadership begins discussing Lean in strategic forums, but commitment and resource planning are limited. Lean initiatives remain tactical rather than strategic, and engagement varies across departments. Progress is slow and benefits are not fully realized.",
    "Lean is formally integrated into corporate strategy, with clear objectives tied to performance, quality, and customer satisfaction. Leadership articulates Lean’s role in achieving business goals and allocates resources to support organization-wide deployment. Strategic reviews include Lean metrics, and alignment between initiatives and corporate priorities improves. Lean becomes a visible and shared responsibility.",
    "Lean thinking shapes both strategy development and execution, fostering cross-functional collaboration and enterprise-wide transformation. Capital investments, technology adoption, and supplier relationships are influenced by Lean goals. Leadership actively reviews Lean progress and adapts plans based on results and feedback. Lean culture enables strategic agility and innovation.",
    "Lean is embedded in the company’s long-term vision and defines its competitive strategy. Continuous Lean transformation drives breakthrough innovation, customer value, and sustainable growth. The organization benchmarks against global leaders, evolving Lean practices to stay ahead. Lean is a core part of the corporate identity, enabling agile strategy deployment and industry leadership."
  ]
},

// 30. Hoshin Kanri or Strategy Deployment — Manufacturing
{
  dimensionName: "Hoshin Kanri or Strategy Deployment",
  sectorName: "Manufacturing",
  levels: [
    "Strategy deployment is informal or lacking, with goals and priorities set in a top-down manner and rarely communicated clearly to all levels. Departments work independently, and improvement initiatives are disconnected from organizational objectives. Accountability for execution is weak, and feedback loops are limited. Alignment between daily activities and strategic direction is minimal.",
    "Basic deployment tools such as policy deployment matrices or goal cascades are introduced, aligning select projects to high-level objectives. Some efforts are made to communicate strategy to departments, but clarity and consistency are missing. Improvement projects start to align with priorities, yet coordination across teams remains limited. Strategy execution is monitored only occasionally.",
    "Structured Hoshin Kanri processes align objectives across all manufacturing functions, ensuring regular progress reviews and clear accountability. Cross-functional teams participate in both planning and execution, linking Lean goals to performance management systems. Strategy communication improves, enabling better alignment and coordination. Feedback from teams is used to adjust initiatives.",
    "Strategy deployment is dynamic and data-driven, with real-time tracking of key metrics and flexible adjustment to market or operational changes. Leadership and teams engage in frequent feedback cycles to ensure alignment and remove barriers. Continuous improvement initiatives are consistently tied to strategic priorities. Transparent communication and shared goals drive performance at all levels.",
    "Strategy deployment is fully integrated, agile, and participatory, engaging employees at every level in achieving strategic objectives. Digital platforms provide transparent progress tracking and enable rapid adaptation to change. Continuous alignment and accountability are cultural norms. Lean principles guide both the execution and governance of strategy, delivering a distinct competitive advantage."
  ]
}

// 31. Supplier Collaboration — Manufacturing
{
  dimensionName: "Supplier Collaboration",
  sectorName: "Manufacturing",
  levels: [
    "Supplier relationships are transactional and limited to order fulfillment, with minimal engagement in improvement or innovation. Communication is sporadic, and issues like delays or quality concerns are resolved reactively. Suppliers are rarely involved in strategic planning or problem-solving, and trust is low. Collaboration is not seen as essential to manufacturing performance.",
    "Some suppliers participate in basic performance reviews and receive periodic feedback on delivery and quality. Joint improvement efforts are rare and mostly focused on short-term issues. Lean principles are introduced to a handful of key suppliers, but integration is shallow. Data sharing occurs occasionally, and partnerships remain limited in scope.",
    "Regular alignment meetings and performance reviews foster clearer expectations and shared goals with suppliers. Joint problem-solving and Lean projects become more common, targeting reliability, quality, and cost improvements. Open communication channels enable better coordination, and suppliers are encouraged to adopt Lean practices. Collaboration expands to address systemic issues across the value chain.",
    "Strategic supplier partnerships are established, including active participation in improvement events, innovation projects, and long-term planning. Real-time data sharing and collaborative governance drive rapid response to changing needs. Suppliers are integrated into product development and process optimization efforts. Mutual trust and transparency support joint value creation.",
    "Supplier collaboration is a core component of manufacturing strategy, with partners fully embedded in Lean systems and continuous improvement. Seamless digital integration enables end-to-end visibility, joint innovation, and proactive risk management. Continuous improvement teams include both internal and supplier members, driving breakthrough results. The organization leads the industry in supplier network excellence."
  ]
},

// 32. Customer Focus — Manufacturing
{
  dimensionName: "Customer Focus",
  sectorName: "Manufacturing",
  levels: [
    "Customer needs and expectations are poorly understood, with little feedback reaching production teams. Operations prioritize internal metrics and efficiency over customer outcomes, leading to recurring complaints or dissatisfaction. Customer communication is infrequent and often managed solely by sales or support. Issues are addressed reactively, without root cause investigation.",
    "Customer data, such as complaints or delivery metrics, are shared occasionally with production teams. Some improvements are made to address specific problems, but customer-centric thinking is not yet integrated. Interactions with customers are limited, and cross-functional collaboration to resolve issues is sporadic. Progress in customer satisfaction is incremental.",
    "Customer KPIs—like on-time delivery, product quality, and responsiveness—are tracked and used to guide improvement initiatives. Production teams participate in customer feedback reviews and use insights to prioritize changes. Cross-functional teams collaborate with sales and service to address root causes of complaints. Customer focus is an established organizational goal.",
    "Manufacturing operations proactively align processes and decision-making with customer priorities and expectations. Customer satisfaction metrics are embedded in daily management, and teams contribute to service design and new product introduction. Feedback loops are rapid and transparent, fostering continuous adaptation to customer needs. The culture encourages anticipation of customer requirements.",
    "Customer-centricity is woven into every aspect of manufacturing, from strategy to daily operations. Advanced analytics and direct engagement are used to anticipate and exceed customer expectations, driving innovation. The organization co-develops solutions with customers, setting industry standards for satisfaction and loyalty. Customer feedback drives both incremental improvements and strategic change."
  ]
},

// 33. Performance Measurement and Metrics — Manufacturing
{
  dimensionName: "Performance Measurement and Metrics",
  sectorName: "Manufacturing",
  levels: [
    "Performance data is limited, unreliable, or outdated, hampering effective management and decision-making. Key metrics such as throughput, quality, and uptime are not systematically tracked or communicated. Reporting is irregular and lacks transparency, leaving accountability weak. Management relies on intuition or anecdotal evidence rather than data.",
    "Basic key performance indicators (KPIs) are defined and tracked for select areas, often using manual methods or spreadsheets. Data collection is delayed and analysis is superficial, limiting its usefulness for driving improvement. Some teams begin using metrics in meetings, but focus remains on outputs rather than process quality or efficiency. Visibility of performance varies widely across the operation.",
    "A balanced set of metrics, covering quality, cost, delivery, and safety, is consistently tracked and shared across teams. Automated data collection improves accuracy and timeliness, and dashboards support regular reviews. Performance metrics guide improvement projects and are linked to strategic goals. Accountability is reinforced through clear targets and regular feedback.",
    "Real-time measurement and advanced analytics are integrated throughout manufacturing, supporting predictive management and proactive decision-making. Metrics align with corporate strategy and are cascaded to all levels. Teams use data to anticipate problems, drive continuous improvement, and communicate results openly. Performance reviews are routine and data-driven.",
    "Performance measurement is a strategic capability, utilizing AI, benchmarking, and continuous learning to refine metrics and targets. Data is transparent, predictive, and drives accountability throughout the supply chain. The organization shares insights and best practices externally, influencing industry standards. Performance excellence is a recognized source of competitive advantage."
  ]
}

// 34. Sustainability and Environmental Responsibility — Manufacturing
{
  dimensionName: "Sustainability and Environmental Responsibility",
  sectorName: "Manufacturing",
  levels: [
    "Environmental impact is not tracked, and sustainability is rarely considered in manufacturing decisions. Waste, emissions, and energy use are managed reactively and only to meet minimal compliance. Employees have little awareness of their environmental responsibilities, and improvement is not a priority. Resource consumption remains high and unchecked.",
    "Basic sustainability measures are piloted in select areas, such as recycling programs or energy-saving initiatives. Some environmental data is collected, but analysis and actions are inconsistent. Leadership and staff gradually recognize the importance of sustainability, but integration with operations is weak. Regulatory compliance is the primary motivator for change.",
    "Sustainability goals are established and tracked as part of regular performance reviews. Teams implement initiatives to reduce waste, emissions, and resource consumption, aligning efforts with broader corporate strategies. Employees participate in projects with clear environmental benefits, and suppliers’ sustainability practices are evaluated. Training on environmental responsibility is included in development programs.",
    "Sustainability becomes a strategic focus embedded in manufacturing design, supply chain collaboration, and technology investments. Advanced analytics and automation support energy optimization and waste minimization. Regular reporting and transparent communication engage both employees and stakeholders in continuous progress. External partnerships drive shared environmental goals.",
    "The organization pioneers sustainable manufacturing, leveraging innovation and real-time data to achieve industry-leading environmental performance. Circular economy models, renewable energy, and responsible sourcing are standard practice. Sustainability metrics are integrated into all business decisions, driving both reputation and competitive advantage. The company sets benchmarks for environmental stewardship across the sector."
  ]
},

// 35. Continuous Improvement Culture — Manufacturing
{
  dimensionName: "Continuous Improvement Culture",
  sectorName: "Manufacturing",
  levels: [
    "Improvement activities are sporadic, typically initiated by management or consultants without lasting impact. Employees see continuous improvement as an extra task rather than an integral part of their roles. There is little sharing of successes, and learning is localized and inconsistent. Lean principles are poorly understood and not culturally embedded.",
    "Kaizen events and suggestion schemes begin to take root, with engagement growing in some departments. Improvement is mostly event-driven and momentum is difficult to sustain, as follow-through is weak. Management supports improvement but struggles to involve all levels consistently. Communication about continuous improvement increases but is not yet routine.",
    "Continuous improvement becomes part of daily work, with teams empowered to identify and solve problems regularly. Structured tools and methods support projects linked to performance goals, and successes are recognized across the organization. Leadership coaches and encourages participation, making improvement visible and valued. Collaboration accelerates learning and innovation.",
    "A strong improvement culture permeates the business, with all employees accountable for progress and results. Continuous improvement is woven into processes, training, and performance management, driving operational excellence. Cross-functional teams work together to resolve systemic issues and capture best practices. Adaptation and learning are rapid and systematic.",
    "Continuous improvement is a core organizational competency, powering innovation, agility, and industry leadership. Employees experiment boldly, share learning company-wide, and drive breakthrough results using digital tools and data. Improvement cycles are relentless, and external benchmarking supports sustained excellence. The organization is recognized as a role model for Lean maturity and operational success."
  ]
},

// 36. Visual Performance Management — Manufacturing
{
  dimensionName: "Visual Performance Management",
  sectorName: "Manufacturing",
  levels: [
    "Performance information is rarely displayed or accessible to frontline teams. Operators and supervisors lack visibility into key metrics like output, quality, or downtime, making problem-solving difficult. Visual tools such as boards or dashboards are underused or non-existent. Management focuses on output volume rather than performance improvement.",
    "Basic visual management tools are introduced in select areas, with metrics like daily production and error rates displayed on whiteboards or charts. Updates are irregular, and ownership of visual tools is unclear, resulting in inconsistent engagement. Teams reference visuals during meetings, but the impact on improvement is limited. Maintenance and accuracy of visuals remain issues.",
    "Visual boards and displays become standard across production areas, supporting alignment with goals for safety, quality, and delivery. Color-coded cues highlight abnormalities, and regular updates support rapid problem escalation and resolution. Teams use visuals as part of daily huddles, taking responsibility for accuracy and maintenance. Performance visibility improves motivation and accountability.",
    "Digital visual management systems provide real-time data to all relevant personnel, supporting proactive decisions and continuous improvement. Visuals are integrated with meetings, coaching, and feedback loops, driving transparency across teams. Metrics are adapted dynamically to business needs and evolving targets. Visual management fosters collaboration and rapid problem response.",
    "Visual performance management is fully integrated with enterprise systems, offering interactive dashboards and predictive analytics across all sites and levels. Visual tools cascade strategy and performance targets throughout the organization, driving culture, transparency, and learning. Best practices are benchmarked and shared externally. The organization sets industry standards for visual management excellence."
  ]
}

// 37. Risk Management and Mitigation — Manufacturing
{
  dimensionName: "Risk Management and Mitigation",
  sectorName: "Manufacturing",
  levels: [
    "Risks such as supply disruptions, equipment failures, and safety incidents are managed reactively, with limited foresight or structured planning. Communication about risks is inconsistent, and there is little tracking or documentation of incidents. Contingency plans are rarely developed or updated. The organization remains vulnerable to unexpected events and operational disruptions.",
    "Basic risk registers and assessments are initiated in select areas, and some contingency planning is implemented. Teams begin to recognize and communicate potential risks, but processes are manual and inconsistent. Training on risk awareness is sporadic, and learning from incidents is limited. Risk management efforts are largely isolated and lack cross-functional collaboration.",
    "Structured risk management processes are developed, with regular identification, assessment, and prioritization of risks across the organization. Mitigation plans are created and monitored, and cross-functional teams collaborate to reduce vulnerabilities. Incident data is analyzed to inform continuous improvement. Risk awareness becomes part of daily operations and decision-making.",
    "Risk management is integrated into both daily operations and strategic planning. Advanced analytics and predictive tools are used to identify potential risks proactively, enabling preventive action. Training and open communication foster a strong culture of risk awareness and accountability. Lessons learned from incidents are systematically applied to drive resilience and continuous improvement.",
    "Risk management is comprehensive and predictive, leveraging real-time monitoring, AI-driven analytics, and seamless collaboration with suppliers and partners. Risks are anticipated and mitigated before they impact operations, and knowledge is widely shared to strengthen organizational resilience. Continuous improvement of risk frameworks is the norm. The company is seen as an industry leader in risk management excellence."
  ]
},

// 38. Employee Development and Career Pathways — Manufacturing
{
  dimensionName: "Employee Development and Career Pathways",
  sectorName: "Manufacturing",
  levels: [
    "Formal employee development is limited, with little access to structured training or career planning. Growth opportunities are unclear, leading to low motivation and high turnover. Development efforts are focused on short-term job requirements, not long-term capability. Coaching and mentoring are rare, and learning is mainly reactive.",
    "Basic training programs and some defined career paths are introduced, increasing employee awareness of development opportunities. Coaching and skill development become more frequent, but processes lack consistency and depth. Training is typically classroom-based, with limited hands-on application. Engagement in development activities varies across teams.",
    "Structured development programs and clear career pathways are established for different roles. Training combines classroom learning, on-the-job coaching, and Lean skill development. Mentoring and feedback support growth, and participation in improvement projects is encouraged. Retention improves as employees see a future within the organization.",
    "Employee development aligns with Lean culture and business objectives, including leadership and strategic thinking programs. Continuous learning is supported through formal and informal channels, and career progression is linked to skill mastery and contributions to improvement. Succession planning identifies and prepares future leaders at every level.",
    "Employee development is proactive, personalized, and integral to organizational strategy. Advanced training, certification, and leadership development are accessible to all, fostering a vibrant learning culture. Development metrics guide workforce planning, and employees are encouraged to innovate and grow continuously. The organization is recognized as an employer of choice and a leader in manufacturing talent development."
  ]
},

// 39. Information Technology Integration — Manufacturing
{
  dimensionName: "Information Technology Integration",
  sectorName: "Manufacturing",
  levels: [
    "IT systems are fragmented, with little integration between production, supply chain, and quality functions. Manual data entry and paper-based processes cause inefficiencies, errors, and lack of visibility. IT support is limited and reactive, hindering operational control. Data silos persist across departments.",
    "Basic IT tools, such as Manufacturing Execution Systems (MES) or inventory management software, are introduced in some areas. Partial integration exists, but reliability and user adoption are inconsistent. Staff receive minimal training, and data sharing is often manual. IT improvements are project-based rather than strategic.",
    "IT systems are deployed broadly and begin to integrate across major functions, enabling more seamless data flow and real-time visibility. Training is comprehensive, and staff use digital tools for decision-making and continuous improvement. Data quality improves, supporting end-to-end process control. IT is seen as a valuable enabler of Lean.",
    "Advanced IT integration connects manufacturing operations internally and with external partners via cloud platforms, APIs, and digital dashboards. Systems support workflow automation, predictive analytics, and rapid decision-making. IT strategy is aligned with business goals, and continuous digital improvement is embedded in governance.",
    "Information technology is fully integrated, intelligent, and central to manufacturing strategy. AI, machine learning, and blockchain technologies optimize transparency, traceability, and performance. Real-time digital collaboration with suppliers and customers drives efficiency and innovation. The organization leads the sector in digital manufacturing excellence."
  ]
}

// 40. Cross-Functional Collaboration — Manufacturing
{
  dimensionName: "Cross-Functional Collaboration",
  sectorName: "Manufacturing",
  levels: [
    "Departments such as production, quality, engineering, and supply chain work independently with minimal communication or shared goals. Joint problem-solving is rare, and misunderstandings or conflicts between functions are common. Collaboration is considered optional and is not supported by formal mechanisms. Silos limit the organization’s ability to respond to challenges efficiently.",
    "Some cross-functional meetings and joint improvement projects begin, typically initiated by management to address specific issues. Communication channels are slowly established, but teamwork across functions is still inconsistent and may lack trust. Data and information sharing starts to improve, but collaboration often remains superficial. Success depends heavily on individual relationships rather than systemic support.",
    "Regular cross-functional teams are formed to collaborate on planning, problem-solving, and process optimization. Shared goals and aligned metrics increase cooperation, and communication becomes more open and constructive. Teams work together to address issues that impact multiple functions, driving improvements in product quality and delivery. Collaboration begins to contribute measurably to manufacturing performance.",
    "Cross-functional collaboration becomes deeply embedded in daily operations and strategic initiatives. Joint problem-solving methods and shared digital platforms support seamless teamwork, and mutual accountability is strong. Continuous improvement and innovation projects routinely involve multiple functions. Trust, transparency, and knowledge sharing are standard operating practices.",
    "Collaboration extends beyond internal departments to include suppliers, customers, and external partners, forming integrated value networks. Cross-functional teams lead large-scale innovation and Lean transformation initiatives, enabled by real-time digital tools. Collaboration is a cultural norm and key to organizational agility, resilience, and competitive advantage. The company is recognized for excellence in partnership and cross-enterprise collaboration."
  ]
},

// 41. Knowledge Management and Best Practice Sharing — Manufacturing
{
  dimensionName: "Knowledge Management and Best Practice Sharing",
  sectorName: "Manufacturing",
  levels: [
    "Knowledge sharing relies on informal conversations and individual initiative, with best practices rarely documented or communicated beyond small teams. Lessons learned from problems or improvements are not systematically captured, resulting in repeated mistakes and loss of organizational memory. Training is reactive and inconsistent.",
    "Efforts begin to document and share best practices in response to issues or improvement projects. Informal knowledge-sharing sessions and communities of practice develop within some departments. Communication channels are ad hoc and not standardized. Lessons learned are more likely to remain within individual teams than be shared broadly.",
    "Structured knowledge management systems and best practice repositories are created, facilitating regular sharing of successes and learnings across functions. Employees actively contribute to and access knowledge resources. Knowledge transfer becomes part of onboarding and training, supporting continuous improvement and faster problem resolution.",
    "Knowledge management is integrated with business processes and supported by digital platforms that connect teams across sites and disciplines. Cross-functional and cross-site sharing of best practices is routine, and benchmarking against industry standards drives adaptation. Leadership fosters a culture of learning and open exchange of information.",
    "Knowledge management becomes a strategic asset, leveraging advanced technologies like AI to capture, curate, and disseminate information in real time. A global learning network spans suppliers and partners, accelerating improvement cycles and innovation. Best practice sharing is embedded in the culture and recognized as a source of competitive differentiation and operational excellence."
  ]
},

// 42. Safety Culture — Manufacturing
{
  dimensionName: "Safety Culture",
  sectorName: "Manufacturing",
  levels: [
    "Safety practices are basic and largely reactive, with incidents frequently occurring due to unsafe conditions or behaviors. Training is inconsistent, and employees may feel reluctant to report hazards. Safety policies exist but are poorly enforced, and investigations often focus on blame rather than prevention. The overall environment feels risky and unsupportive.",
    "Basic safety protocols and mandatory training are established, raising awareness and reducing some incidents. Hazard reporting begins to increase, but the process may remain informal and inconsistently followed. Supervisors emphasize compliance but may not always provide coaching or support. Safety is recognized as important but is not yet part of daily habits.",
    "A proactive safety culture emerges, with employees actively participating in hazard identification and risk mitigation. Safety committees and regular audits support continuous improvement, and near-miss reporting and root cause analysis become standard. Leadership visibly champions safety initiatives, and communication reinforces safe behaviors and shared responsibility.",
    "Safety is fully integrated into all manufacturing processes and management systems. Proactive hazard controls, performance metrics, and employee empowerment drive ongoing improvements. Employees are authorized to stop work for safety concerns, and leadership is visible and accountable. Continuous learning from incidents and data analysis significantly reduces risks.",
    "Safety culture is exemplary, embracing a zero-harm philosophy and advanced risk management. Technology supports hazard detection and prevention, and safety excellence is celebrated both internally and externally. Psychological safety encourages open reporting and continuous safety innovation. Outstanding safety performance is a recognized hallmark of the organization."
  ]
}

// 43. Innovation Capability — Manufacturing
{
  dimensionName: "Innovation Capability",
  sectorName: "Manufacturing",
  levels: [
    "Innovation is infrequent and limited to basic problem-solving or incremental improvements, often prompted only by urgent operational needs. Employees hesitate to suggest new ideas due to lack of support, fear of failure, or absence of incentives. Creative thinking is not embedded in the culture, and processes remain largely traditional. Leadership attention to innovation is minimal.",
    "Isolated innovation projects begin to emerge, often championed by specific teams or driven by outside consultants. Leadership starts to acknowledge the importance of innovation, but initiatives are sporadic and lack structure or sustained support. Success depends on individual effort rather than systemic enablers. Innovation is not yet seen as a strategic priority.",
    "Structured programs are established to encourage idea generation, experimentation, and cross-functional collaboration on new solutions. Dedicated resources and time are allocated for innovation activities, and pilot projects become more frequent. Successful innovations are recognized and shared, gradually influencing process improvements and technology adoption. Leadership visibly supports a more innovative mindset.",
    "Innovation is woven into continuous improvement and strategic planning, with creativity and learning from failure actively encouraged. Teams collaborate internally and externally with partners, customers, and technology providers to drive new ideas and solutions. Advanced tools, methodologies, and feedback cycles accelerate experimentation and scaling. Innovation becomes a core driver of operational and business advantage.",
    "Innovation capability is a defining organizational strength, continuously producing new technologies, business models, and process breakthroughs. External partnerships, industry consortia, and open innovation ecosystems are leveraged for maximum impact. Innovation performance is measured and rewarded, and lessons learned are institutionalized and disseminated rapidly. The company is recognized as a manufacturing industry leader and innovator."
  ]
},

// 44. Workforce Flexibility and Multi-Skilling — Manufacturing
{
  dimensionName: "Workforce Flexibility and Multi-Skilling",
  sectorName: "Manufacturing",
  levels: [
    "Roles are narrowly defined, with employees generally assigned repetitive tasks and little exposure to other functions. Cross-training is rare or nonexistent, limiting workforce adaptability during demand changes or disruptions. Scheduling is inflexible, and the organization is vulnerable to turnover and skill shortages. Employees often feel disconnected from broader operations.",
    "Basic cross-training programs and multi-skilling efforts are introduced, usually in response to operational pressures or staffing gaps. Some employees begin to rotate between tasks, but participation and motivation are uneven. Workforce planning remains mostly reactive, and flexibility gains are modest. The benefits of a broader skill set are just starting to be realized.",
    "Structured multi-skilling programs enable employees to perform a wider variety of tasks and rotate across departments. This increases operational agility and reduces bottlenecks, as workforce planning takes skills availability into account. Employees are recognized for versatility, and scheduling adapts better to workload fluctuations. Engagement and motivation improve as skill development opportunities expand.",
    "Workforce flexibility is embedded into daily operations, supported by ongoing training and skill development. Cross-functional teams optimize labor deployment based on real-time needs and demand signals. Career pathways encourage continual learning, while workforce agility supports both innovation and rapid response to change. Scheduling and resource allocation are dynamic and data-driven.",
    "Workforce flexibility becomes a strategic differentiator, with predictive analytics and digital workforce management optimizing skills deployment continuously. Employees are empowered, highly skilled, and engaged in ongoing learning. Multi-skilling supports seamless operations, resilience, and fast adaptation to new technologies. The organization is recognized for talent development and world-class workforce practices."
  ]
},

// 45. Data-Driven Decision Making — Manufacturing
{
  dimensionName: "Data-Driven Decision Making",
  sectorName: "Manufacturing",
  levels: [
    "Decisions are made primarily on intuition or limited historical data, with inconsistent and often inaccurate data collection practices. Reporting is delayed, and there is little analytical capability or culture of data use. Most decision-making remains reactive and fragmented, leading to recurring issues and inefficiencies.",
    "Basic data collection and performance reporting systems are established in key areas, with some managers beginning to use metrics for monitoring and troubleshooting. Data accuracy and timeliness gradually improve, and analytical skills start to develop. Decisions are increasingly informed by data but still lack depth and consistency across the organization.",
    "Data-driven decision making is established as teams regularly use performance metrics, dashboards, and root cause analysis to monitor progress and solve problems. Analytical tools support forecasting and scenario planning, aligning decisions more closely with business goals. Data quality and governance are improving, and continuous improvement is increasingly evidence-based.",
    "Advanced analytics and business intelligence systems enable predictive and prescriptive insights, integrating data from multiple functions for comprehensive views. Cross-functional teams collaborate on data interpretation and action planning, and data literacy is widespread. Real-time data drives proactive decision-making, process optimization, and innovation.",
    "Data-driven culture is embedded throughout the organization, powered by AI, machine learning, and real-time analytics. Decision-making is continuously optimized to balance efficiency, quality, and strategic objectives. The company leads the industry in data innovation, sharing insights externally and setting new standards for data governance, transparency, and business impact."
  ]
}

// 46. Employee Engagement and Ownership — Manufacturing
{
  dimensionName: "Employee Engagement and Ownership",
  sectorName: "Manufacturing",
  levels: [
    "Employee engagement is low, with limited motivation or emotional investment in the company’s success. Workers feel disconnected from organizational goals and have little sense of ownership over their tasks or improvement activities. Communication is mainly top-down and feedback channels are weak or nonexistent. Engagement is rarely measured and not prioritized by leadership.",
    "Initiatives such as suggestion programs or team meetings begin to encourage employee involvement, but follow-through and recognition are inconsistent. Employees occasionally share ideas, but management support is variable and engagement levels fluctuate between departments. Communication starts to become more two-way, yet most improvement ownership remains with supervisors.",
    "Employee engagement is actively cultivated through empowerment in problem-solving, involvement in improvement projects, and recognition programs. Teams take ownership of local processes and contribute meaningfully to operational and strategic goals. Engagement surveys and regular feedback loops are implemented, helping to strengthen morale and participation. Recognition for engagement becomes part of daily management.",
    "Engagement is woven into organizational culture, with employees empowered to take initiative, innovate, and lead improvements. Leadership coaches and supports employee growth, resulting in high engagement scores and improved retention. Employee voices influence decision-making and shape strategy. Ownership and accountability are visible at every level.",
    "Employee engagement and ownership are strategic drivers of competitive advantage, fully integrated into all aspects of the business. Employees are trusted partners in innovation, performance, and culture-building, with their contributions closely tied to organizational outcomes. The culture fosters trust, continuous dialogue, and pride in ownership. Employees are recognized as brand ambassadors and change champions."
  ]
},

// 47. Governance and Accountability — Manufacturing
{
  dimensionName: "Governance and Accountability",
  sectorName: "Manufacturing",
  levels: [
    "Governance structures are unclear or ineffective, with ambiguous roles and limited accountability for results or improvement initiatives. Responsibilities are poorly defined, and follow-up on issues is inconsistent. Performance reviews are rare and decision-making lacks transparency. Improvement projects often stall without oversight.",
    "Basic governance mechanisms, such as steering groups or committees, are introduced to oversee improvement activities. Accountability starts to be assigned, but enforcement is uneven and engagement may be superficial. Roles and expectations are clarified but not consistently practiced. Governance processes remain mostly informal and dependent on leadership style.",
    "Clear governance frameworks define responsibilities, performance expectations, and escalation paths for improvement projects and operations. Regular reviews and reporting cycles ensure accountability, with cross-functional participation and leadership sponsorship. Performance and project outcomes are tracked systematically, supporting transparent and effective decision-making.",
    "Governance is formalized and tightly integrated with business strategy and risk management. Accountability is reinforced through performance contracts, incentive systems, and continuous feedback loops. Governance includes dynamic adjustment of objectives and resources. Collaboration across functions supports holistic oversight and drives sustainable results.",
    "Governance and accountability are agile, data-driven, and pervasive throughout the organization. Roles and responsibilities are transparent, consistently practiced, and tightly linked to strategic objectives. Governance structures promote innovation, collaboration, and rapid decision-making, while continuous improvement and risk management are fully embedded. The company is recognized for governance excellence and benchmark practices."
  ]
},

// 48. Customer-Centric Process Design — Manufacturing
{
  dimensionName: "Customer-Centric Process Design",
  sectorName: "Manufacturing",
  levels: [
    "Process design is primarily focused on internal efficiency, with little consideration for customer needs or end-user experiences. Customer requirements are not systematically captured or integrated, leading to rigid processes and recurring complaints. Feedback from customers is infrequent or ignored, and responsiveness is low.",
    "Some processes begin to incorporate customer feedback in response to specific issues, with occasional adjustments to address complaints. Data collection on customer requirements is sporadic and used mainly for troubleshooting. Collaboration between process teams and customer-facing staff is limited, and improvements tend to prioritize internal convenience.",
    "Processes are regularly improved based on structured input from customers and frontline employees. Customer journey mapping and value stream analysis include customer touchpoints, and improvements focus on reducing lead times and enhancing satisfaction. Feedback systems are established to ensure customer perspectives are considered in process changes.",
    "Customer-centric design becomes standard, with flexible and adaptive processes developed to exceed customer expectations. Real-time customer feedback informs continuous improvement, and collaboration extends to suppliers and partners to optimize end-to-end experiences. The organization proactively anticipates customer needs and integrates them into process design and innovation.",
    "Customer-centricity is embedded in culture and strategy, with process evolution driven by deep customer insights and predictive analytics. Customers co-create solutions, and partnerships drive ongoing innovation. The organization is recognized as an industry leader for customer experience, with processes continuously benchmarked and refined to maintain competitive advantage."
  ]
}

// 49. Resource Optimization — Manufacturing
{
  dimensionName: "Resource Optimization",
  sectorName: "Manufacturing",
  levels: [
    "Resource utilization is inefficient, with frequent overstaffing, bottlenecks, or equipment downtime resulting in high costs and operational delays. Space and assets are poorly managed, leading to congestion, waste, and suboptimal productivity. Resource planning is reactive and lacks alignment with actual demand. There is little visibility or control over resource allocation.",
    "Basic resource planning tools and scheduling begin to address labor, equipment, or space inefficiencies. Some teams identify bottlenecks and adjust allocations, but improvements are localized and unsustained. Space and workforce management become more structured, yet optimization efforts are still inconsistent. Resource efficiency gains are incremental.",
    "Resource optimization becomes systematic, supported by workforce management systems, planned maintenance, and improved space utilization. Resource allocation aligns more closely with production plans and demand forecasts. Cross-functional teams use data to identify and resolve inefficiencies. Metrics track productivity and support ongoing improvement.",
    "Advanced analytics, automation, and digital tools enable dynamic resource allocation, maximizing throughput and minimizing waste. Labor, equipment, and space are flexibly deployed to balance workload and support just-in-time operations. Collaboration across departments enhances overall resource efficiency. Optimization efforts extend to energy use and sustainability goals.",
    "Resource optimization is proactive, continuous, and fully integrated with business strategy. AI and real-time data guide predictive allocation, ensuring high utilization and rapid adaptation to change. Resource deployment supports innovation and growth, while optimization is recognized as a driver of both competitive advantage and sustainability leadership."
  ]
},

// 50. Leadership Development — Manufacturing
{
  dimensionName: "Leadership Development",
  sectorName: "Manufacturing",
  levels: [
    "Leadership development is minimal and unstructured, with managers and supervisors receiving little beyond basic operational training. Coaching and mentoring are rare, leading to inconsistent leadership quality. Succession planning is absent, and leadership skills gaps impact team performance and culture. Development is reactive rather than strategic.",
    "Basic training in communication, problem-solving, and Lean awareness is introduced, with some coaching or mentoring initiatives for frontline leaders. Leadership development occurs mainly in response to identified issues, with uneven depth and consistency. Leadership roles and expectations become clearer, but long-term planning is limited.",
    "Structured leadership development programs are established, including formal training, coaching, and mentoring aligned with Lean and business goals. Leaders are expected to model continuous improvement behaviors and support employee engagement. Development is systematically planned and evaluated. Succession planning is initiated for key roles.",
    "Leadership development is fully integrated with talent management and organizational strategy, including advanced training in Lean coaching, change management, and strategic thinking. Leaders drive cultural transformation, coach teams, and sustain high capability throughout the organization. Leadership assessment and development are ongoing, with robust succession pipelines.",
    "Leadership development is proactive, personalized, and focused on building future capabilities. Leaders at all levels are empowered to innovate and champion Lean culture, with programs featuring external benchmarking and thought leadership. A vibrant leadership community supports continuous learning and agility, making leadership excellence a core differentiator."
  ]
},

// 51. Problem-Solving Methodologies — Manufacturing
{
  dimensionName: "Problem-Solving Methodologies",
  sectorName: "Manufacturing",
  levels: [
    "Problem-solving is informal and reactive, relying on quick fixes rather than structured approaches. Issues frequently recur as root causes are not systematically identified or addressed. Employees have limited exposure to problem-solving tools, and solutions often focus on symptoms. Learning from mistakes is minimal.",
    "Basic methods like 5 Whys and PDCA cycles are introduced in some teams, mostly during improvement events. Documentation of problems and countermeasures begins, but follow-up is inconsistent. Training on structured methodologies is limited, so problem-solving remains largely event-driven. Some progress is made, but sustainability is weak.",
    "Structured problem-solving tools such as A3 reports, root cause analysis, and standard work become widely adopted. Teams regularly use these tools to address recurring issues, document solutions, and track results. Supervisors coach employees in effective methodologies, embedding problem-solving in daily routines. Continuous improvement gains traction.",
    "Advanced analytical techniques and data-driven methods support resolution of complex and cross-functional problems. Teams proactively anticipate and prevent issues, with outcomes linked to performance metrics and shared widely. Continuous learning from problem-solving efforts accelerates innovation. A strong culture of problem-solving emerges.",
    "Problem-solving is a strategic capability powered by AI, predictive analytics, and rapid iteration. The organization celebrates learning from challenges, institutionalizes lessons globally, and fosters experimentation. Breakthrough improvements and innovation are driven by robust problem-solving methodologies, sustaining competitive advantage."
  ]
}

// 52. Change Leadership — Manufacturing
{
  dimensionName: "Change Leadership",
  sectorName: "Manufacturing",
  levels: [
    "Change is poorly managed and often met with resistance, as leaders provide little direction or support. Employees lack understanding of change objectives and are not involved in the process, causing frequent disruptions and failed initiatives. Communication is unclear, and follow-up is rare. Change is viewed as a source of anxiety rather than improvement.",
    "Managers receive some basic training in leading change and begin to communicate intentions more clearly, but engagement remains limited. Change initiatives are more structured, though inconsistent in execution and follow-through. Leaders still struggle to address resistance and build momentum. Employee involvement is mostly reactive.",
    "Leaders actively guide change, communicating the vision and rationale while engaging stakeholders early. Change management tools support structured adoption, and resistance is addressed through coaching and clear feedback. Training helps employees adapt to new ways of working, and successes are recognized. Change leadership is increasingly valued.",
    "Change leadership becomes an organizational strength, embedded in leadership development and cultural norms. Leaders model resilience and adaptability, aligning change initiatives with strategy and involving teams from multiple functions. Continuous feedback and learning cycles strengthen change outcomes. Change is embraced as a growth opportunity.",
    "Change leadership is a core competency driving enterprise-wide agility and innovation. Leaders anticipate change and foster a culture of openness, experimentation, and continuous adaptation. Data and insights guide proactive transformation. The organization thrives in dynamic environments, consistently turning change into competitive advantage."
  ]
},

// 53. Cross-Training and Knowledge Transfer — Manufacturing
{
  dimensionName: "Cross-Training and Knowledge Transfer",
  sectorName: "Manufacturing",
  levels: [
    "Employees work in narrowly defined roles with little exposure to other functions, making the operation vulnerable to absences and turnover. Cross-training is rare, and knowledge transfer relies on informal, ad hoc methods. Skill gaps persist, impacting flexibility and productivity. Learning is siloed and reactive.",
    "Initial cross-training efforts are introduced, often as informal shadowing or short-term solutions to staffing issues. Knowledge transfer is inconsistent and participation is limited, with benefits recognized but not fully realized. Documentation of skills is lacking, and workforce flexibility improves only marginally. Structured programs are not yet in place.",
    "Comprehensive cross-training and structured knowledge transfer programs are rolled out across teams. Training plans ensure critical skills are covered, and mentoring or peer coaching supports capability building. Flexibility and skill coverage improve as employees are encouraged to broaden their competencies. Knowledge documentation supports planning.",
    "Cross-training becomes an integral part of workforce development and operational planning. Employees rotate regularly to build broad capabilities, and technology supports skill tracking and learning. Knowledge transfer drives continuous improvement and innovation, making the workforce resilient to change. Agility becomes a strategic advantage.",
    "Cross-training and knowledge transfer are strategic priorities, supported by advanced learning platforms and individualized development plans. Employees possess deep multi-functional skills, and learning networks extend to suppliers and partners. Continuous knowledge sharing is embedded in the culture, making workforce capability a key competitive differentiator."
  ]
},

// 54. Visual Controls for Safety and Quality — Manufacturing
{
  dimensionName: "Visual Controls for Safety and Quality",
  sectorName: "Manufacturing",
  levels: [
    "Visual controls for safety and quality are minimal or absent, leading employees to rely on verbal instructions and memory. Hazards and quality issues go undetected or unaddressed, and training on visual tools is scarce. Incidents and defects are frequent, with little transparency. Visual management is not prioritized.",
    "Basic signage, labels, and warning indicators are implemented in critical areas, but usage is inconsistent and not standardized. Employees begin using visual cues, but their impact on safety and quality is limited. Training is sporadic, and adherence varies between teams. Improvements are reactive, following incidents.",
    "Standardized visual controls, such as color-coding, floor markings, and checklists, are widely adopted and integrated into workflows. Visual management boards display real-time safety and quality metrics. Employees are trained to maintain and use controls, and incident rates decline. Visuals become part of daily routines.",
    "Digital technologies enhance visual controls, with sensors and alerts supporting dynamic risk prevention. Regular reviews and updates keep controls relevant, and leaders use visual data to engage teams in proactive problem-solving. Safety and quality become cultural norms. Visual management is leveraged for continuous improvement.",
    "Visual controls are fully integrated with real-time monitoring, predictive analytics, and automated feedback. Dashboards and alerts provide immediate visibility of safety and quality status across the operation. Teams and leaders use visual data to drive innovation and minimize risk. Excellence in visual management supports world-class performance."
  ]
}

// 55. Lean Culture Alignment — Manufacturing
{
  dimensionName: "Lean Culture Alignment",
  sectorName: "Manufacturing",
  levels: [
    "Lean is seen as a set of isolated tools rather than a shared mindset, resulting in skepticism and resistance from employees. Initiatives are project-based with little long-term sustainability or cultural traction. Communication about Lean values and behaviors is limited, and change management is weak. The culture remains traditional and slow to evolve.",
    "Awareness of Lean culture begins to grow through basic training and early engagement, with a few teams experimenting with new behaviors. Leadership communicates the importance of Lean but often fails to lead by example. Adoption is patchy and Lean is viewed as something extra, not part of daily work. Cultural change efforts face inconsistency.",
    "Lean culture becomes well understood and embraced by most employees, supported by clear leadership role modeling. Teams are empowered to drive continuous improvement, and Lean behaviors are reinforced through recognition and aligned performance management. Daily work begins to reflect Lean thinking, supporting greater sustainability.",
    "Lean principles are deeply embedded and influence decision-making, collaboration, and innovation throughout the organization. Cross-functional teamwork and ongoing learning are standard. Leaders coach Lean capabilities and nurture a culture of improvement. Cultural resilience and adaptability emerge as the company’s strengths.",
    "Lean culture defines the organization, shaping its strategy, relationships, and reputation. Lean thinking is instinctive at all levels and extends to partners and suppliers. The company sets industry standards for Lean innovation, continuously measuring and evolving culture. Excellence in Lean supports transformation and competitive leadership."
  ]
},

// 56. Technology Adoption for Lean — Manufacturing
{
  dimensionName: "Technology Adoption for Lean",
  sectorName: "Manufacturing",
  levels: [
    "Technology use is limited and unconnected to Lean goals, with manual processes dominating. Adoption is reactive, often driven by compliance or immediate cost rather than process improvement. Employees have little training or confidence in technology, and system integration is poor. Digital tools do not support Lean.",
    "Initial technologies like barcode scanners or basic production tracking are adopted in select areas, often to support specific Lean projects. Integration is incomplete, and benefits are inconsistent across teams. Training and support for new tools are limited, and resistance to change remains common. Technology’s impact is modest.",
    "Technology adoption is guided by Lean objectives, supporting process standardization, data collection, and visual management. Systems are integrated to improve workflow, and employees are trained to use digital tools for problem-solving and continuous improvement. Investments in technology align with Lean strategy.",
    "Advanced technologies such as automation, robotics, and real-time analytics enhance Lean practices and streamline operations. Systems are seamlessly integrated across manufacturing, enabling innovation and operational excellence. Change management ensures smooth adoption and maximizes return on investment. Digital maturity drives improvement.",
    "Technology adoption is strategic, innovative, and continuous, transforming Lean manufacturing through AI, IoT, and machine learning. The organization leads the industry in digital-enabled Lean, achieving unmatched agility, transparency, and sustainability. Technology becomes a central competitive differentiator. Best practices are benchmarked externally."
  ]
},

// 57. Sustainability Metrics and Reporting — Manufacturing
{
  dimensionName: "Sustainability Metrics and Reporting",
  sectorName: "Manufacturing",
  levels: [
    "Sustainability metrics are undefined and untracked, and reporting on environmental impact is rare or non-existent. Employee awareness of sustainability is low, and compliance with regulations is only reactive. Sustainability is not considered in decision-making or operations, remaining disconnected from business performance.",
    "Basic sustainability data such as energy use or waste generation is collected in isolated areas and reported sporadically, usually for compliance. Employee and leadership awareness grows gradually. Initiatives are localized and data consistency is lacking. Sustainability remains peripheral to core business processes.",
    "Comprehensive sustainability metrics are defined, tracked, and analyzed across manufacturing functions. Reporting supports management decisions and is aligned with corporate sustainability goals. Employees engage in sustainability initiatives, and continuous improvement focuses on environmental performance. Progress is monitored and communicated.",
    "Sustainability metrics are fully integrated with operational and financial KPIs, enabling transparent reporting to stakeholders. Advanced data analytics help identify and drive improvement opportunities. Sustainability performance influences planning, resource allocation, and external benchmarking. The culture emphasizes accountability.",
    "Sustainability metrics and reporting are strategic, innovative, and drive proactive environmental management through real-time monitoring and predictive analytics. Reporting meets or exceeds industry standards, supporting exemplary transparency and stakeholder engagement. Sustainability leadership strengthens competitive advantage and reputation."
  ]
}

// 1. Leadership Commitment — Healthcare
{
  dimensionName: "Leadership Commitment",
  sectorName: "Healthcare",
  levels: [
    "Senior leaders view Lean as a short-term project or cost-cutting measure rather than a sustained cultural shift, engaging only during crises or compliance audits. Their presence in clinical and administrative areas is rare, and improvement initiatives often lack visible leadership endorsement. Staff perceive Lean as disconnected from patient care and core operations, with unclear communication and sporadic follow-through. Motivation for lasting change is low, and Lean efforts are rarely sustained beyond initial rollouts.",
    "Some leaders begin to participate in Lean training or sponsor isolated improvement events, usually in response to acute operational challenges. Gemba walks and frontline engagement are occasional and lack consistency or depth, with limited coaching or follow-up. Communication about Lean is mainly one-way, and frontline staff remain skeptical of leadership's commitment to change. While Lean awareness grows, it is not yet integrated into strategy or daily leadership practice.",
    "Leaders become more actively involved, sponsoring Lean initiatives directly linked to clinical quality, patient safety, and operational metrics. Regular performance reviews include Lean objectives, and purposeful Gemba walks create opportunities for two-way feedback. Cross-departmental collaboration improves as silos are challenged, and Lean is increasingly recognized as a strategic priority. Leadership involvement is visible, and staff begin to align with improvement goals.",
    "Lean leadership is fully embedded in both operations and long-term strategic planning, with senior leaders mentoring middle managers and actively coaching frontline teams. Lean metrics are monitored in dashboards and regular business reviews, ensuring sustained focus and resource allocation. Leaders participate in improvement events, champion Lean culture, and model continuous improvement behaviors. Staff feel inspired and supported to innovate and drive operational excellence.",
    "Leadership at all levels owns and drives Lean as a foundational element of the healthcare organization’s mission and vision. Decision-making is data-driven, leveraging real-time analytics to proactively address systemic challenges and opportunities. Leaders empower teams to identify, implement, and sustain improvements, benchmarking against best-in-class organizations. Lean principles extend beyond internal operations to include collaboration with partners, making Lean a hallmark of the organization's reputation and strategic advantage."
  ]
},

// 2. Coaching and Role Modeling — Healthcare
{
  dimensionName: "Coaching and Role Modeling",
  sectorName: "Healthcare",
  levels: [
    "Coaching on Lean principles is absent or extremely limited, with supervisors and managers focused primarily on daily operations, regulatory compliance, and error correction. Leaders rarely model Lean thinking or behaviors, and problem-solving is handled by supervisors alone, excluding frontline staff. Staff see Lean as irrelevant or disconnected from their work, and opportunities for learning or reflection are minimal. There is little to no encouragement for proactive improvement.",
    "Some supervisors and managers attend Lean workshops or improvement events and begin experimenting with basic coaching skills, though these efforts are sporadic and often reactive. Role modeling of Lean practices is limited to a few individuals or teams, and peer learning lacks formal structure. Coaching conversations are rare outside of specific events, and frontline staff receive little guidance on Lean tools or thinking. As a result, Lean concepts spread slowly and unevenly.",
    "Coaching becomes a regular expectation for managers and supervisors, integrated into Gemba walks, daily huddles, and staff meetings. Leaders use structured coaching tools and questions, offering feedback focused on root cause analysis and application of Lean principles. Visual boards and checklists support coaching efforts, and operators document and share small improvements with their teams. Coaching encourages reflection, builds Lean skills, and drives engagement in improvement.",
    "Formal Lean coaching programs are in place, with managers and experienced staff mentoring frontline teams and each other. Coaching is data-driven and focused on ongoing development and accountability, with role modeling of Lean behaviors becoming routine and visible across the organization. Peer learning networks and cross-functional mentoring support knowledge transfer, and visual tools track skill development and coaching outcomes. The coaching culture promotes proactive problem-solving and collaborative learning.",
    "Coaching is recognized as a strategic capability deeply embedded at all levels, supported by master coaches and systematic development programs. Leaders and staff consistently model Lean behaviors, reinforcing a culture of continuous improvement and learning. Coaching effectiveness is measured and tied to both performance metrics and professional growth. Peer coaching and mentoring networks thrive, ensuring Lean is sustained and continuously evolving throughout the organization."
  ]
},

// 3. Lean Mindset Adoption — Healthcare
{
  dimensionName: "Lean Mindset Adoption",
  sectorName: "Healthcare",
  levels: [
    "Lean is widely viewed as a temporary or external program with little practical value for patient care or daily operations. Staff address problems reactively, focusing on immediate fixes rather than systemic improvement. Lean tools and concepts such as PDCA, standard work, or visual management are unknown or inconsistently used. Continuous improvement is not a part of the culture, and staff feel disconnected from Lean goals.",
    "Awareness of Lean grows as tools like 5 Whys and root cause analysis are introduced, but their use remains limited to improvement events or compliance exercises. Problem-solving is still episodic and not part of daily routines, and Lean language is sporadically used. Few successes are shared or celebrated, which limits organizational learning. Staff are cautious, and many remain skeptical about the long-term value of Lean.",
    "Lean thinking becomes visible in daily routines, with staff regularly using structured problem-solving tools to address workflow inefficiencies and patient safety risks. Visual management supports Lean adoption, and teams begin submitting and reviewing improvement ideas. Ownership of continuous improvement spreads among staff, fostering collaboration between clinical, administrative, and support teams. Positive results from Lean efforts encourage broader participation.",
    "Lean mindset is integrated into clinical and operational practice, with teams proactively challenging status quo processes and seeking to reduce waste and variability. Lean principles are routinely applied in meetings, planning, and decision-making, and cross-functional teamwork is the norm. Staff take responsibility for implementing and sharing improvements that enhance patient outcomes and efficiency. Continuous improvement behaviors are embedded throughout the organization.",
    "Lean mindset is deeply ingrained in the culture, guiding how care is delivered, processes are designed, and problems are solved at all levels. Teams instinctively innovate and collaborate to improve patient care and operational performance, leveraging data-driven experimentation and rapid learning cycles. Lean language and behaviors are consistent from frontline to executive leadership. The organization is widely recognized as a model for Lean thinking and continuous improvement in healthcare."
  ]
},

// 4. Employee Empowerment — Healthcare
{
  dimensionName: "Employee Empowerment",
  sectorName: "Healthcare",
  levels: [
    "Frontline staff have minimal decision-making authority and are rarely invited to suggest or implement improvements. Changes to processes and protocols are dictated top-down with little room for adaptation. There are no formal systems for capturing staff ideas, and improvement initiatives are viewed as the responsibility of management. Employees feel disengaged and lack a sense of ownership in patient care improvements.",
    "Staff start to voice suggestions in team meetings or through informal channels, but implementation is uneven and depends on supervisor support. Formal suggestion systems may exist but are poorly utilized, and follow-through on ideas is inconsistent. Cross-training is limited, and staff may still feel hesitant about raising concerns or proposing changes. Empowerment remains confined within individual units or teams.",
    "Staff lead daily huddles, contribute to minor process changes, and use visual management tools to track improvement ideas and outcomes. Supervisors actively encourage participation and recognize staff for innovative contributions. Cross-training is promoted, increasing workforce flexibility and knowledge sharing. Empowerment begins to take hold, though some barriers remain between departments.",
    "Frontline staff are cross-trained, rotate through various roles, and take shared responsibility for team performance and improvement initiatives. Formal suggestion systems are trusted and well-used, with regular feedback and transparent follow-up on ideas. Teams mentor new members and collaborate across departments, supported by a culture of psychological safety. Empowerment extends beyond units to shape organizational practices.",
    "Staff at all levels independently identify, lead, and sustain improvements in both clinical and operational areas. They co-design workflows, participate in planning and policy decisions, and drive major change initiatives. The organization invests in recognition programs and continuous learning to support empowerment. Employees feel a strong sense of ownership over patient care and operational excellence, which is reflected in high engagement and innovation."
  ]
},

// 5. Psychological Safety — Healthcare
{
  dimensionName: "Psychological Safety",
  sectorName: "Healthcare",
  levels: [
    "Fear of blame and negative consequences dominates the workplace, leading to errors being hidden or ignored. Staff avoid raising concerns or reporting near-misses due to distrust or previous punitive responses. Open dialogue about mistakes or process issues is rare, and the culture discourages experimentation. Innovation and improvement are stifled by anxiety and lack of support.",
    "Some supervisors encourage feedback and invite discussion of problems, but efforts are inconsistent and depend on individual personalities. Group settings remain challenging for honest communication, and blame culture persists. Reporting of incidents improves slightly but is often handled quietly or privately. The environment for learning is fragile and easily disrupted.",
    "Teams hold regular debriefs and after-action reviews, focusing on learning from incidents rather than assigning blame. Leaders model vulnerability by sharing their own mistakes and encouraging others to speak openly. Mistakes are increasingly viewed as opportunities to improve systems and prevent future harm. Near-miss and error reporting rates rise, supporting early intervention.",
    "Psychological safety is a visible priority in daily huddles, team meetings, and problem-solving sessions. Leaders consistently reinforce a non-punitive approach to mistakes and actively seek staff input. Structured forums allow for constructive discussion of breakdowns and learning from failures. Transparency and trust grow, enabling teams to communicate and collaborate more effectively.",
    "Psychological safety is deeply embedded in the organizational culture, shaping hiring, training, and leadership development. Staff are confident in challenging unsafe practices, voicing concerns, and proposing innovations without fear of negative repercussions. Feedback and learning flow in all directions and are integrated into continuous improvement cycles. The culture supports bold experimentation and rapid adaptation, contributing to organizational resilience and excellence."
  ]
},
// 6. Cross-Level Communication — Healthcare
{
  dimensionName: "Cross-Level Communication",
  sectorName: "Healthcare",
  levels: [
    "Communication is predominantly top-down, with frontline staff having few channels to provide feedback or raise issues. Important messages are delayed, lost, or misinterpreted as they pass through hierarchical layers. Team meetings focus mostly on immediate tasks, and feedback loops for learning or improvement are weak or absent. Collaboration between shifts, departments, and clinical-administrative teams is limited, undermining coordination.",
    "Some formal communication mechanisms, such as staff newsletters or bulletin boards, are introduced, but participation is passive and feedback from the frontline is sporadic. Information from staff is gathered occasionally through surveys or informal conversations, but follow-up is inconsistent. Cross-shift handovers improve slightly, though communication remains mainly one-way. Escalation of urgent issues is slow, reducing responsiveness.",
    "Daily huddles, multidisciplinary rounds, and tiered meetings create regular, structured opportunities for two-way communication between leadership and staff. Visual boards track problems and actions, enabling timely follow-up and visible progress. Supervisors represent frontline concerns at management forums, and communication across departments becomes intentional. Staff begin to trust that their voices will be heard and issues addressed.",
    "Real-time escalation systems and communication platforms link frontline teams directly with clinical leaders and support services. Issues are rapidly shared and resolved through cross-functional meetings and digital tools, supporting prompt response and learning. Standardized visual tools foster consistent messaging, and frontline staff are routinely invited to contribute in reviews and planning. Transparency and collaboration grow stronger across all organizational levels.",
    "Communication is seamlessly integrated across the organization, with digital and face-to-face channels ensuring feedback is timely, traceable, and leads to action. Frontline staff regularly participate in strategic discussions and problem-solving with senior leaders. Open dialogue is the norm, breaking down barriers between clinical, administrative, and support functions. Effective communication drives unified purpose, accelerates improvement, and strengthens the Lean culture."
  ]
},

// 7. Lean Training and Education — Healthcare
{
  dimensionName: "Lean Training and Education",
  sectorName: "Healthcare",
  levels: [
    "Lean training is minimal or absent, leaving most staff unfamiliar with Lean principles or tools. Learning is informal, occurring only during audits or when problems arise, and there is no structured curriculum for ongoing education. Employees lack confidence in applying Lean to their daily work, and training resources are scarce. As a result, improvement efforts are fragmented and unsustained.",
    "Basic Lean training modules are introduced during onboarding or as part of specific improvement projects. Some staff gain exposure to fundamental Lean concepts like 5S, value stream mapping, or PDCA, but practical application is inconsistent. Training focuses more on compliance than building capability, with few refresher sessions or ongoing learning opportunities. Engagement in Lean education remains low, and adoption is slow.",
    "Role-specific training programs are established for clinicians, administrators, and support staff, covering Lean tools, problem-solving, and visual management. Education blends classroom learning with on-the-job coaching, simulations, and real-world improvement projects. Teams start applying new skills in their areas, and supervisors reinforce learning through regular feedback and coaching. Training is linked to performance goals and professional development.",
    "Structured Lean education pathways, including formal certifications, are available across the organization and tied to career progression. Internal facilitators lead hands-on training and Kaizen simulations, while learning management systems track participation and results. Continuous development is embedded in organizational routines, with outcomes evaluated for effectiveness. Staff at all levels have access to ongoing learning and support for Lean mastery.",
    "Lean education is a strategic priority, supported by a dedicated Lean academy or center of excellence. The organization partners with external experts for benchmarking, advanced training, and innovation. Training is adaptive, data-driven, and integrated with daily work and strategic initiatives. Employees continually upgrade Lean competencies, and learning is deeply woven into leadership and career development. Lean thinking permeates the culture through education."
  ]
},

// 8. Recognition and Celebration — Healthcare
{
  dimensionName: "Recognition and Celebration",
  sectorName: "Healthcare",
  levels: [
    "Improvement efforts receive little formal recognition, resulting in low motivation and engagement among staff. Achievements related to Lean are rarely acknowledged publicly, and successes are not shared or celebrated. Employee contributions often go unnoticed, and recognition is informal and inconsistent. The lack of appreciation undermines continuous improvement.",
    "Occasional spot awards or ‘Employee of the Month’ programs exist, but rarely focus on Lean or team-based achievements. Recognition is primarily for individual performance, with celebrations infrequent and not tied to improvement outcomes. Peer-to-peer recognition is limited, and the impact of these efforts on culture and motivation is minimal. Sustained participation in Lean remains weak.",
    "Teams and individuals are regularly recognized in meetings and internal communications for specific Lean contributions. Informal and formal acknowledgments—such as small rewards, shout-outs, or success stories—build momentum and reinforce Lean values. Peer recognition gains traction, encouraging camaraderie and healthy competition. Recognition supports growing engagement in continuous improvement.",
    "Formal recognition programs link Lean achievements to organizational goals, offering awards, bonuses, or extra time off for sustained improvements. Celebrations are public, timely, and often include leadership participation. Recognition highlights both results and Lean behaviors, promoting role models throughout the organization. A culture of appreciation and pride motivates ongoing participation in improvement.",
    "Recognition and celebration are fully embedded in performance management and leadership evaluation. Annual Lean summits, peer-nominated awards, and data-driven recognition reinforce continuous improvement and innovation. Employees take pride in driving Lean initiatives, and stories of success are shared widely, including with external partners. Celebrations are linked to benchmarking and community engagement, sustaining a high-performing Lean culture."
  ]
},

// 9. Change Management Readiness — Healthcare
{
  dimensionName: "Change Management Readiness",
  sectorName: "Healthcare",
  levels: [
    "Resistance to change is widespread, driven by poor communication, lack of training, and fear of disruption to patient care. Change initiatives are imposed without staff input, often resulting in confusion and a quick return to old habits. Training and support for new processes are minimal or non-existent. Change is seen as a burden, and improvement efforts stall quickly.",
    "Pilot changes are introduced in select areas with limited staff involvement and feedback mechanisms. Communication about upcoming changes is inconsistent, and the rationale behind changes is often unclear to frontline staff. Training is ad hoc, and resistance persists due to lack of transparency and ownership. Improvements are difficult to sustain beyond initial trials.",
    "Structured change management processes include impact analysis, risk assessment, and staff input during planning. Training accompanies change rollouts, improving readiness and acceptance. Feedback loops allow for real-time adjustments based on frontline experience, and change leaders emerge across departments. Employees begin to view change as part of continuous improvement rather than a disruptive event.",
    "Change management is proactive and collaborative, with detailed roadmaps developed together with staff and stakeholders. Simulation and pilot programs prepare teams for major shifts, and pre- and post-implementation reviews ensure lessons learned are integrated. Visual tools and communication plans support smooth transitions, minimizing resistance. Organizational readiness for change becomes a strategic strength.",
    "Change readiness is institutionalized as a core competency, tracked and managed across the organization. Leaders coach teams through transitions using real-time data and feedback, ensuring minimal disruption to operations or patient care. Cross-functional collaboration and adaptive planning make continuous improvement inseparable from change. The organization quickly adapts to new challenges, maintaining high performance and engagement."
  ]
},

// 10. Daily Problem-Solving Culture — Healthcare
{
  dimensionName: "Daily Problem-Solving Culture",
  sectorName: "Healthcare",
  levels: [
    "Problem-solving is mainly reactive and informal, triggered by crises or compliance demands. There are few standardized tools or methods, so recurring issues are common and often addressed only by supervisors. Documentation of problems and solutions is rare, limiting learning and progress. Continuous improvement is not part of daily work for most staff.",
    "Basic Lean problem-solving tools, such as root cause analysis or 5 Whys, are introduced during improvement events or audits. Teams begin to document problems and countermeasures, but involvement is mostly limited to supervisors or quality staff. Problem resolution is event-driven rather than integrated into daily practice. Feedback on issues is inconsistent, limiting organizational learning.",
    "Structured problem-solving is built into daily work routines, with regular use of Lean tools by teams at all levels. Staff lead investigations into clinical and operational problems, documenting findings and tracking actions. Visual management tools support issue identification and escalation, and supervisors coach teams on effective methodologies. Cross-functional collaboration improves problem-solving for complex issues.",
    "Problem-solving is embedded into daily management systems with clear protocols for escalation and follow-up. Issues are linked to performance indicators, and progress is regularly monitored and shared. Leaders model advanced problem-solving techniques such as A3 thinking, ensuring systematic countermeasure development. Knowledge is shared across the organization, accelerating learning cycles.",
    "A proactive, data-driven problem-solving culture is the norm, with cross-functional teams anticipating and addressing systemic risks before they escalate. Advanced analytical tools and predictive methods are used to identify root causes and prevent recurrence. Lessons learned are rapidly disseminated and applied organization-wide, fueling innovation and operational excellence. Continuous improvement is sustained through a relentless focus on effective problem-solving."
  ]
},
// 11. Team Engagement in Improvement — Healthcare
{
  dimensionName: "Team Engagement in Improvement",
  sectorName: "Healthcare",
  levels: [
    "Team participation in improvement activities is minimal, with most initiatives led by management and little awareness or ownership at the frontline. Staff are often passive recipients of change, and skepticism about improvement projects is common. Communication about Lean is top-down, and teams are rarely invited to share ideas or feedback. Improvement culture feels disconnected from daily work.",
    "Some teams join isolated improvement events or meetings, but engagement is inconsistent and support for implementing ideas is limited. Team members may contribute suggestions during events, but there is little follow-up or recognition for participation. Leadership involvement and encouragement varies greatly by department or shift, and collaboration across disciplines is rare. Awareness of the benefits of improvement grows slowly.",
    "Teams regularly participate in Kaizen events, problem-solving sessions, and daily huddles, taking ownership of localized improvements. Cross-functional collaboration increases, with teams sharing learning and successes across units. Recognition and coaching from leaders help foster a culture of continuous learning. Engagement is reinforced by opportunities to lead or mentor others in improvement activities.",
    "Teams are empowered to self-direct improvement projects, manage progress, and share best practices across departments and sites. High engagement spans clinical, administrative, and support staff, and team-driven initiatives are aligned with organizational goals. Coaching, peer support, and visible leadership foster momentum and pride. Teams play an active role in organizational strategy and transformation.",
    "Teams are recognized as drivers of innovation and continuous improvement throughout the healthcare system, proactively seeking opportunities to optimize care and operations. Their engagement extends to external benchmarking, strategic initiatives, and collaboration with partners and patients. Recognition programs, leadership coaching, and a culture of learning sustain high involvement. Team engagement is central to achieving competitive excellence and superior patient outcomes."
  ]
},

// 12. Value Stream Mapping — Healthcare
{
  dimensionName: "Value Stream Mapping",
  sectorName: "Healthcare",
  levels: [
    "There is limited understanding of end-to-end patient flow or healthcare processes, and improvement focuses on isolated tasks rather than system-wide efficiency. Process bottlenecks and waste go unrecognized, with little visibility for staff to identify or address problems. Value stream concepts are not applied, and coordination between departments is weak. Improvement efforts are fragmented and lack data-driven analysis.",
    "Some departments map parts of their workflow, typically within a single ward or function, but maps are often incomplete, outdated, or used only occasionally. Frontline staff involvement in mapping is limited, and waste is identified sporadically. The value stream mapping process is not standardized, and results are rarely shared between departments. Opportunities for improvement are often missed due to lack of a holistic view.",
    "Value stream mapping becomes a regular practice for visualizing patient journeys and clinical workflows, with multidisciplinary teams identifying waste, delays, and inefficiencies. Staff are engaged in mapping exercises, and maps guide targeted improvements across functions. Metrics and goals begin to align with overall process flow and patient value. Mapping drives more coordinated and effective improvement projects.",
    "Dynamic value stream maps are maintained and updated across all major care pathways, integrating clinical, administrative, and support services. Data-driven insights inform redesigns to optimize flow, reduce waste, and improve outcomes. Teams share accountability for value delivery, and supplier and partner touchpoints are increasingly included. Mapping outputs support continuous improvement cycles and innovation.",
    "Value stream mapping is fully integrated with digital health systems, supporting real-time analytics and predictive process improvement. Patient care and operational processes are synchronized end-to-end, delivering maximum value. Collaboration extends across organizational boundaries to include partners and stakeholders. The organization continuously benchmarks and innovates based on value stream insights, achieving exemplary performance."
  ]
},

// 13. Process Flow Efficiency — Healthcare
{
  dimensionName: "Process Flow Efficiency",
  sectorName: "Healthcare",
  levels: [
    "Patient and information flow are erratic, leading to frequent delays, redundancies, and rework. Bottlenecks and handoff failures cause long wait times, inefficiencies, and poor patient experiences. Processes are reactive and often interrupted, with weak communication between departments. Operational inefficiencies negatively impact care quality and staff morale.",
    "Targeted improvements are made to streamline specific functions, such as admissions or discharge, but coordination between teams remains limited. Communication improves in some areas, reducing wait times and unnecessary steps, but process flow improvements are isolated and not sustained. Workflow standards are emerging but inconsistently applied. Staff start to recognize flow problems but lack system-wide solutions.",
    "Clinical and administrative workflows are increasingly streamlined, with smoother transitions between steps and functions. Lean tools like standard work, pull systems, and visual management support the reduction of bottlenecks and delays. Teams work cross-functionally to redesign processes with the patient in mind. Process flow efficiency becomes a key performance focus, improving patient satisfaction.",
    "Flow is managed holistically across care pathways, supported by advanced scheduling, resource leveling, and real-time tracking. Processes are proactively monitored, enabling rapid response to disruptions or changes in patient demand. Continuous flow is supported by robust planning and communication. Flow efficiency is measured and managed at all organizational levels.",
    "Healthcare processes operate as synchronized systems, with automation and predictive scheduling ensuring near-perfect flow. Real-time data and advanced technologies enable dynamic adjustment to patient needs and resource availability. Cross-organization collaboration optimizes patient flow from admission to discharge and beyond. Process flow excellence differentiates the organization in care quality and operational performance."
  ]
},

// 14. Standard Work / SOPs — Healthcare
{
  dimensionName: "Standard Work / SOPs",
  sectorName: "Healthcare",
  levels: [
    "Standardized procedures for clinical and administrative tasks are lacking or inconsistently followed, resulting in variability and risk. Work instructions may be missing, outdated, or ignored, with training often informal or ad hoc. Practice varies widely between teams and shifts, impacting care quality and safety. Documentation is minimal and discipline is low.",
    "Some SOPs exist but are inconsistently used and poorly maintained. Frontline staff are aware of certain protocols but may not reliably follow them, and updates are unstructured or infrequent. Training on SOPs is limited, and variation in practice persists. Compliance is monitored informally, leading to ongoing gaps in care and process execution.",
    "Key processes are covered by documented SOPs, which are accessible and routinely used at the point of care. Teams follow standardized procedures more reliably, and updates are made as improvements are identified. Training aligns with current standards, and compliance is monitored systematically. Staff are increasingly involved in SOP revision and improvement.",
    "SOPs are comprehensive, integrated into daily work, and supported by visual aids and performance standards. Regular audits and coaching ensure adherence, and deviations are quickly investigated and corrected. SOPs embed best practices for quality, safety, and efficiency. Continuous improvement cycles are linked to SOP updates, driving consistency and high reliability.",
    "Standard work is dynamic and continuously improved based on feedback and real-time analytics. Digital tools provide instant access and updates to SOPs, enabling rapid training and compliance across teams. SOPs are extended to include partners and suppliers where relevant, supporting seamless care transitions. Best practices are benchmarked and shared externally, making standardization a hallmark of operational excellence."
  ]
},

// 15. Visual Management — Healthcare
{
  dimensionName: "Visual Management",
  sectorName: "Healthcare",
  levels: [
    "Visual controls and displays are rare, with staff relying on verbal instructions and memory, leading to confusion and preventable errors. Performance data is not visible or outdated, and problems are often detected late. Visual management is not embedded in the work culture. Staff lack tools to recognize or respond to process issues promptly.",
    "Basic visual controls such as signs, labels, or posted checklists are introduced in some areas but are not consistently used or maintained. Some departments display handwritten charts or simple dashboards, but their impact on performance is limited. Visuals are not integrated with daily routines or improvement processes. Staff seldom use visual information to guide care or work decisions.",
    "Visual management boards are established to display key indicators, daily goals, and patient flow information. Color-coded alerts and escalation tools are used to highlight problems and prompt rapid action. Visual management becomes part of shift handovers and team meetings, supporting transparency and accountability. Teams are responsible for updating and maintaining visual tools.",
    "Visual management systems are standardized across clinical and support services, integrating digital dashboards and real-time status updates. Visual controls guide workflow, monitor quality, and facilitate rapid problem escalation. Leaders use visual data to coach teams and drive evidence-based decisions. Visual tools support continuous improvement and are valued by staff.",
    "Visual management is fully digital, interactive, and accessible throughout the organization. Data flows automatically from health information and operational systems to displays, supporting predictive decision-making and strategic alignment. Visitors and new staff can instantly understand status and priorities from visuals. Visual management underpins transparency, engagement, and world-class performance in healthcare delivery."
  ]
},
// 16. 5S Implementation — Healthcare
{
  dimensionName: "5S Implementation",
  sectorName: "Healthcare",
  levels: [
    "Work areas in clinics, wards, and support departments are cluttered and poorly organized, causing inefficiencies, errors, and safety risks. Tools, equipment, and supplies lack clearly designated places, so staff waste time searching or replacing items. Cleanliness and order vary widely, with little awareness of 5S principles or their impact. Any attempts at organization are sporadic, informal, and unsustained.",
    "Some departments start basic 5S activities such as sorting and labeling, but efforts are inconsistent and often limited to compliance initiatives. Red-tag events or clean-up drives occur occasionally, but follow-up and sustainment are weak. Visual aids may be displayed, but adherence is uneven, and accountability is low. Staff begin to notice the benefits of organization, but 5S is not integrated into daily routines.",
    "5S standards are documented and regularly practiced across most clinical and administrative areas. There are clear locations for tools and supplies, supported by visual controls, labels, and standard layouts. Daily cleanups and resets improve workflow and safety, and audits begin to monitor compliance and highlight improvement opportunities. Engagement and understanding of 5S principles increase among staff and supervisors.",
    "5S is sustained through formal audits, metrics, and shared ownership among staff at all levels. Improvements focus on safety, ergonomics, waste elimination, and workflow optimization, driven by frontline involvement. Visual management tools are integrated with 5S status, and ongoing training reinforces 5S as a standard practice. The organization fosters a disciplined culture of organization and efficiency.",
    "Healthcare facilities exemplify 5S excellence, benchmarking their practices against top-performing institutions. Innovation in workspace organization enables rapid adjustments to patient needs, enhances safety, and streamlines care delivery. Digital tools aid in monitoring, training, and sustaining 5S compliance organization-wide. The workplace environment strongly reflects Lean culture and pride in healthcare service."
  ]
},

// 17. Kanban/Pull Systems — Healthcare
{
  dimensionName: "Kanban/Pull Systems",
  sectorName: "Healthcare",
  levels: [
    "Inventory management for medications, supplies, and equipment is manual and reactive, resulting in frequent shortages or overstocking. There are no formal pull systems or visual signals to trigger replenishment, leading to waste and patient care delays. Communication between departments and supply teams is poor, causing inefficiencies and frustration. Material flow is unpredictable and disruptive to daily operations.",
    "Basic pull systems, such as Kanban cards or minimum stock alerts, are introduced in limited areas, making replenishment somewhat more predictable. However, tracking and communication remain largely manual, causing delays in meeting demand. Staff start to recognize the value of pull-based inventory, but adoption is inconsistent and not integrated into broader processes. Kanban systems are not yet digital or standardized.",
    "Kanban or pull systems are established across multiple departments, aligning inventory with actual usage and patient care needs. Teams monitor stock visually and proactively respond to replenishment signals, reducing waste and improving flow. Communication between clinical, support, and supply teams improves, and Kanban principles are included in training. Pull systems support timely, efficient care delivery.",
    "Pull systems are integrated organization-wide, connecting suppliers, pharmacies, clinical units, and storage areas. Digital Kanban solutions enable real-time inventory tracking and automated replenishment, significantly reducing costs and stockouts. Seamless communication allows for rapid adjustment to changing demand, and staff trust and rely on the system. Pull-based processes support high reliability and just-in-time care.",
    "Kanban and pull systems are optimized through predictive analytics, automation, and integration with supplier and partner networks. Advanced technologies ensure precise, just-in-time delivery of all resources, minimizing inventory while maintaining high service levels. The organization continuously improves pull processes and benchmarks best practices externally. Inventory management excellence supports superior patient outcomes and cost leadership."
  ]
},

// 18. Quick Changeover (SMED) — Healthcare
{
  dimensionName: "Quick Changeover (SMED)",
  sectorName: "Healthcare",
  levels: [
    "Changeovers for equipment, treatment rooms, or schedules are lengthy and unpredictable, causing bottlenecks and delays in patient care. Procedures are informal or undocumented, leading to inconsistent results and wasted time. Staff are reactive to changeover challenges, and there are no formal methods to streamline transitions. Overall capacity utilization and patient satisfaction suffer.",
    "Basic SMED concepts are introduced, such as separating internal and external setup tasks, and some use of checklists or visual aids begins. Improvements in changeover times are seen in pilot areas, but practices are not yet consistent or widespread. Staff awareness of quick changeover grows, but variability and inefficiencies remain significant. Feedback from changeovers is not routinely analyzed for learning.",
    "Standardized procedures for changeover are documented and routinely followed in key clinical and support processes. Visual controls, training, and frequent review support consistent execution, reducing downtime and improving reliability. Teams are actively involved in refining changeover procedures, and results are tracked. Overall patient flow and scheduling become more predictable.",
    "Changeover processes are regularly audited and improved through staff feedback and data analysis, with simulation training preparing teams for rapid, safe transitions. Improvements extend across multiple functions, such as operating rooms, labs, and imaging centers. Changeovers are synchronized with demand fluctuations to maximize capacity, and safety and quality are integrated into every step.",
    "Rapid, error-free changeovers are achieved consistently across the healthcare organization, maximizing utilization of resources and enabling agile responses to changing needs. Advanced technologies and automation further accelerate transitions, while external benchmarking drives continuous innovation. Changeover excellence enables high patient throughput, flexibility, and outstanding care quality."
  ]
},

// 19. Error-Proofing (Poka-Yoke) — Healthcare
{
  dimensionName: "Error-Proofing (Poka-Yoke)",
  sectorName: "Healthcare",
  levels: [
    "Mistakes in medication administration, documentation, or patient identification are frequent and often detected late, leading to adverse events and rework. There are no formal systems to prevent or detect errors proactively. Quality control relies mainly on inspections and staff vigilance rather than process design. Blame for errors may fall on individuals rather than system improvements.",
    "Basic error-proofing measures, such as checklists, color-coding, and double-checks, are implemented in select areas. Operators rely on reminders and peer review to catch mistakes, but physical error-proofing devices are rare. Training increases awareness, but quality escapes and near-misses remain common. Error prevention is discussed during improvement projects but not routinely implemented.",
    "Error-proofing devices and robust processes, like barcode scanning or digital verification, are integrated into critical workflows. Teams systematically analyze error-prone steps and implement poka-yoke solutions during improvement events. Staff are trained to recognize potential errors and act to prevent them proactively. Error rates begin to decline, and error-proofing becomes a regular topic in improvement discussions.",
    "Error-proofing is embedded in process and system design, supported by regular audits and technology such as RFID, alerts, and automated checks. Staff actively participate in designing and maintaining mistake-proofing solutions, and feedback loops quickly identify emerging risks. Quality escapes are rare in error-proofed processes, and lessons learned drive ongoing system improvement.",
    "Real-time analytics and AI-enabled systems predict and prevent errors before they occur, ensuring proactive patient safety and quality. All new processes and technologies are evaluated for error-proofing before deployment, and cross-functional teams innovate poka-yoke solutions across the care continuum. Prevention of errors is part of the organizational culture, driving world-class reliability in healthcare."
  ]
},

// 20. Process Transparency — Healthcare
{
  dimensionName: "Process Transparency",
  sectorName: "Healthcare",
  levels: [
    "Care and administrative processes are largely opaque, with staff lacking clear visibility into patient status, resource availability, or workflow progress. Problems and bottlenecks are often discovered late, resulting in reactive responses and poor communication. Documentation and data sharing are minimal, and decision-making relies on incomplete information. Staff and patients feel disconnected from care progress.",
    "Some workflows and process maps are introduced to increase clarity, typically within specific departments or for compliance purposes. Transparency improves in limited areas, but updates are manual and delayed, and most staff have only partial visibility into process status. Communication gaps persist across teams and functions. Timely problem-solving remains difficult.",
    "Transparency improves as up-to-date status displays and dashboards become available for tracking patient flow, resource utilization, and key metrics. Teams review process data regularly to identify bottlenecks, deviations, or opportunities for improvement. Cross-department visibility grows, enabling better coordination and planning. Process clarity enables more proactive management and patient-centered care.",
    "Real-time process status updates and analytics are accessible to all relevant staff, supported by integrated digital systems that connect clinical, support, and administrative data. Abnormalities are highlighted and addressed promptly, and open communication fosters accountability and collaborative problem-solving. Decision-making is routinely data-driven and transparent across teams.",
    "Full transparency is achieved across the care continuum and with external partners through advanced digital platforms and data-sharing agreements. Predictive analytics support strategic planning, rapid response, and continuous improvement. Patients, staff, and partners have access to relevant process information, driving collaboration, trust, and excellence in healthcare outcomes."
  ]
},
// 21. Quality-at-Source — Healthcare
{
  dimensionName: "Quality-at-Source",
  sectorName: "Healthcare",
  levels: [
    "Quality issues such as treatment errors, documentation mistakes, and missed procedures are commonly detected only after the fact, often by external audits or patient complaints. Staff have limited authority or incentive to address quality issues at their point of origin. Quality checks rely heavily on end-of-process inspection, which leads to rework and patient dissatisfaction. Ownership for quality is not shared by frontline staff, and preventive action is rare.",
    "Frontline staff begin receiving basic training and encouragement to detect and correct defects as part of their daily routines, such as medication verification or procedure double-checks. Simple quality checks are added to work processes, but root cause analysis is sporadic and not embedded. Staff awareness of their quality role grows, but there are few formal tools or systems to support early detection. Preventive efforts are inconsistent, and most improvement remains reactive.",
    "Quality-at-source practices are systematically built into daily work, with staff empowered to identify and address issues before they impact patients. Quality checks become routine, integrated into SOPs and visual controls, and supported by regular error-proofing initiatives. Teams use structured problem-solving to prevent recurrence, and feedback loops enable timely improvements. Shared accountability for quality emerges across all care functions.",
    "Real-time monitoring and alerting tools enable quality assurance at every process step, and staff actively participate in ongoing quality improvement teams and internal audits. Data analytics identify emerging trends and direct improvement resources to the highest-risk areas. Continuous feedback is integral to team huddles and reviews, fostering a proactive, prevention-focused culture. Leadership prioritizes early detection and resolution of quality issues.",
    "Quality is assured through advanced predictive analytics, AI-based monitoring, and system-level safeguards that prevent errors before they happen. Every staff member is empowered and expected to innovate quality solutions at the source, with digital systems providing instant feedback. Quality metrics are central to all performance evaluations and strategic decisions. The organization is recognized for exceptional, proactive quality management throughout the healthcare sector."
  ]
},

// 22. Level Loading / Heijunka — Healthcare
{
  dimensionName: "Level Loading / Heijunka",
  sectorName: "Healthcare",
  levels: [
    "Patient workloads and staff schedules are unpredictable, leading to cycles of overload and idle time that create stress and compromise care quality. Peaks and valleys in demand are managed reactively, with little coordination across departments. Scheduling bottlenecks result in delays, long wait times, and inefficient use of resources. Capacity planning is minimal and inflexible.",
    "Basic workload smoothing techniques are piloted within some teams or shifts, such as spreading out appointments or elective procedures. Departments begin to coordinate schedules to reduce extreme workload fluctuations, but real-time adjustment is rare. Variability persists, and communication about workload balancing is inconsistent. Patient experience remains dependent on the day or time of service.",
    "Active level loading is managed across multiple care delivery and support functions, balancing staff assignments and patient flows to minimize bottlenecks. Tools such as visual planning boards and digital scheduling systems help teams anticipate and respond to demand variations. Real-time data supports adjustments to plans, and cross-departmental collaboration improves. Consistency in service quality and patient experience grows.",
    "Organization-wide leveling integrates capacity planning, resource allocation, and demand forecasting using advanced analytics. Staffing and resource flexibility are optimized to match fluctuating needs, and teams collaborate dynamically to adjust to patient volume. Variability is significantly reduced, improving patient flow, staff morale, and operational efficiency. Level loading becomes a key performance metric and operational focus.",
    "Level loading is fully dynamic and predictive, driven by AI-enabled scheduling and real-time workforce management systems. Workloads are continuously balanced across all sites, shifts, and service lines, resulting in consistent, high-quality care and optimal resource use. Demand synchronization extends to partners and the broader healthcare network. The organization is recognized for outstanding capacity management and responsiveness."
  ]
},

// 23. TPM (Total Productive Maintenance) — Healthcare
{
  dimensionName: "TPM (Total Productive Maintenance)",
  sectorName: "Healthcare",
  levels: [
    "Equipment downtime and unplanned failures frequently disrupt care delivery, as maintenance practices are mostly reactive and informal. Operators have little involvement in equipment upkeep, and preventive maintenance is rarely scheduled. Downtime data is not systematically collected or analyzed, leading to recurring reliability problems. Patient safety and care quality are compromised by equipment breakdowns.",
    "Planned maintenance schedules are established for critical equipment, but adherence is inconsistent and often limited by staffing or supply constraints. Operators begin performing basic checks and cleaning, but responsibility for maintenance is still unclear. Some downtime tracking is introduced, and maintenance teams conduct routine inspections. Preventive strategies are only partly effective, and collaboration between departments is limited.",
    "TPM pillars such as autonomous maintenance and planned maintenance become standard, with operators taking ownership of daily checks and basic upkeep. Downtime causes are logged, analyzed, and addressed proactively. Preventive maintenance reduces breakdown frequency, and communication between clinical and maintenance staff improves. Equipment reliability shows measurable improvement.",
    "TPM is fully integrated, with cross-functional teams driving continuous improvement in maintenance practices. Overall Equipment Effectiveness (OEE) is tracked, reviewed, and used to set improvement targets. Predictive maintenance leverages usage data and condition monitoring, optimizing equipment availability and minimizing risk. Operators and technicians collaborate closely to enhance reliability and safety.",
    "TPM is embedded in the organizational culture, supported by IoT sensors, advanced data analytics, and continuous workforce training. Predictive and prescriptive maintenance ensure near-zero downtime and maximum patient safety. Equipment design incorporates ease of maintenance, and all staff are highly capable in maintaining critical assets. The organization achieves benchmark-level equipment reliability, supporting operational excellence."
  ]
},

// 24. End-to-End Value Stream Integration — Healthcare
{
  dimensionName: "End-to-End Value Stream Integration",
  sectorName: "Healthcare",
  levels: [
    "Healthcare departments function in silos, with minimal coordination or shared goals across patient care, administration, and support services. Poor communication causes delays, redundancies, and errors at handoff points, reducing visibility and accountability for patient outcomes. Integration with external partners is rare, and patients experience fragmented care journeys. Improvement efforts focus only on isolated processes.",
    "Some improvement in coordination between key departments—such as labs, pharmacy, and nursing—begins, with limited cross-functional meetings and shared KPIs. Process handoffs are better defined, but integration remains limited to internal teams. External collaboration is rare, and end-to-end accountability is weak. Data and resource sharing is inconsistent.",
    "Workflow alignment and improvement goals are shared across multiple departments and care pathways. Cross-functional teams collaborate to optimize patient flow and reduce delays, and information systems support data sharing internally. Accountability for value delivery becomes shared, and patient satisfaction metrics influence broader operational decisions. The organization takes a holistic view of process improvement.",
    "End-to-end value stream integration includes partners such as primary care, specialty providers, and suppliers, aligning processes, planning, and performance metrics across organizational boundaries. Integrated planning and execution enhance responsiveness and reduce delays, and improvement initiatives are cross-organizational. Continuous improvement leverages insights from the entire value stream.",
    "Value stream integration is seamless, enabled by real-time data sharing, synchronized workflows, and collaborative governance across the healthcare ecosystem. The organization co-innovates with partners and stakeholders, delivering coordinated, patient-centric care at every step. Best practices are shared externally, and performance benchmarks drive industry leadership. Patient journeys are smooth, efficient, and outcomes-focused."
  ]
},

// 25. Waste Identification and Elimination — Healthcare
{
  dimensionName: "Waste Identification and Elimination",
  sectorName: "Healthcare",
  levels: [
    "Common forms of waste—including excess motion, waiting, overprocessing, and errors—are not actively managed or even recognized. Teams are unaware of the impact of waste on cost, safety, and care quality. Efforts to address waste are isolated and reactive, focusing on immediate crises rather than root causes. The organization lacks a culture or systems to systematically reduce inefficiencies.",
    "Staff begin identifying visible wastes during Kaizen events or improvement projects, with isolated initiatives to reduce waiting or excess inventory. Awareness of waste grows, but tools and methods are inconsistently applied. Results are uneven, with some improvements quickly lost due to lack of sustainment. Resistance to change and cultural inertia remain significant barriers.",
    "Waste elimination is systematically pursued, using Lean tools such as value stream mapping and 5S across multiple departments. Cross-functional teams regularly analyze processes to detect and reduce various wastes, supported by data and structured problem-solving. Teams celebrate waste reduction successes, and continuous improvement cycles target persistent inefficiencies. Waste reduction becomes a recognized path to improving care quality and value.",
    "Waste reduction is embedded in management systems, with clear metrics and accountability for progress. Advanced problem-solving methods—including root cause analysis and poka-yoke—target complex or recurring wastes, and environmental considerations are included in waste reduction efforts. The organization prioritizes resource optimization, efficiency, and sustainability in all improvement activities.",
    "Eliminating waste is a strategic driver of operational and clinical excellence. Innovative techniques identify and prevent waste proactively, and all staff are empowered to detect and resolve inefficiencies in real time. The organization shares best practices, benchmarks externally, and uses digital tools for continuous monitoring. Waste minimization is a key pillar of cost leadership and world-class healthcare."
  ]
},
// 26. Handoffs and Queue Reduction — Healthcare
{
  dimensionName: "Handoffs and Queue Reduction",
  sectorName: "Healthcare",
  levels: [
    "Patient handoffs between departments, shifts, or external providers are frequent sources of errors and delays, with no standardized protocols in place. Queues build up for critical resources such as operating rooms, imaging, or discharge, resulting in long patient wait times and workflow disruptions. Communication is fragmented, and problems in one area quickly cascade through the system. There is little measurement or management of handoff quality or queue length.",
    "Structured handoff tools and basic communication standards are introduced in some units, reducing error rates and lost information for select transitions. Teams begin coordinating schedules to minimize queues, but these efforts remain isolated and dependent on local champions. Measurement of queue times and feedback about handoffs is sporadic, and cross-departmental improvement is limited. Progress is uneven and not yet sustained.",
    "Standardized handoff protocols are adopted across major care pathways, with clear checklists and digital documentation supporting reliable transitions. Queue management becomes systematic, with teams using data to adjust workflows and reduce waiting times. Communication improves at transition points, and handoff metrics are tracked and addressed proactively. Cross-functional teams collaborate to streamline patient flow.",
    "Handoffs are proactively managed and minimized wherever possible, supported by real-time tracking and coordination between care units and external partners. Queue reduction strategies are integrated into planning, with advanced analytics used to predict and address potential bottlenecks. Continuous monitoring and improvement of handoffs and queues enhance care continuity, patient satisfaction, and staff efficiency.",
    "Handoffs and queues are nearly eliminated through seamless integration and automation of processes, both internally and with external providers. Real-time digital systems synchronize patient movement, orders, and documentation across the continuum of care. Predictive tools and proactive management prevent bottlenecks before they occur. Excellence in handoff and queue management is recognized as a key driver of healthcare quality, safety, and agility."
  ]
},

// 27. Documentation Discipline — Healthcare
{
  dimensionName: "Documentation Discipline",
  sectorName: "Healthcare",
  levels: [
    "Patient records, treatment notes, and process documentation are inconsistent, incomplete, or delayed, creating risks for safety, compliance, and billing. Reliance on paper charts, informal notes, or memory leads to frequent errors and inefficiencies. There are few standards or accountability measures for documentation. Information gaps compromise care quality and regulatory compliance.",
    "Documentation standards are introduced and reinforced with basic training and periodic audits. Some areas begin transitioning to digital records, but implementation is uneven and data quality varies. Staff accountability for timely and accurate documentation grows, but gaps and inconsistencies remain. Retrieval and sharing of information is still challenging across teams and systems.",
    "Comprehensive documentation discipline is achieved, with standardized electronic medical records and clear protocols followed across departments. Staff are trained and held accountable for accuracy and timeliness, and real-time data entry becomes routine. Audits and feedback loops support ongoing compliance, and documentation is consistently available to support care, billing, and decision-making.",
    "Documentation processes are fully integrated with clinical workflows and information systems, ensuring real-time visibility into patient status, treatment, and outcomes. Automation and validation minimize errors and omissions. Continuous monitoring and data analytics ensure high data quality, enabling advanced reporting and population health management. Documentation excellence supports clinical, operational, and financial goals.",
    "Documentation is seamless, automated, and error-proofed through advanced digital platforms and interoperability with all healthcare systems. Data accuracy approaches 100%, supporting instant decision-making, research, and personalized care. The organization continuously innovates in documentation practices, setting industry benchmarks for transparency, trust, and compliance. Exemplary documentation discipline enhances patient safety and healthcare reputation."
  ]
},

// 28. Digitization of Workflows — Healthcare
{
  dimensionName: "Digitization of Workflows",
  sectorName: "Healthcare",
  levels: [
    "Most workflows in clinical and administrative areas are manual or paper-based, leading to delays, errors, and lack of real-time visibility. Informal communication and physical paperwork dominate, causing inefficiencies and inconsistent data capture. Digital tools are rare, siloed, or underutilized, and process improvements are hindered by manual bottlenecks.",
    "Selective digitization occurs in certain areas, such as electronic prescribing or appointment scheduling, but digital tools are not integrated across workflows. Staff receive limited training, and adoption is project-based and inconsistent. Data silos persist, and end-to-end digital visibility is lacking. Workflow digitization remains piecemeal and slow to expand.",
    "Digital workflows are established for key processes, such as patient intake, test ordering, and care documentation, connecting major functions and improving traceability. Integration between systems enables more efficient data sharing and process automation. Staff are increasingly trained to use digital tools, resulting in improved speed, accuracy, and compliance.",
    "Comprehensive end-to-end digitization connects clinical, support, and administrative workflows across the organization and with external partners. Real-time data capture and analysis support agile response to patient and operational needs. Digital processes are continuously refined based on feedback and performance metrics. Interoperability with partner systems enhances collaboration and patient experience.",
    "Intelligent, fully integrated digital workflows automate healthcare delivery and support functions, leveraging AI, machine learning, and real-time analytics. Workflow digitization enables predictive, adaptive operations and seamless patient journeys. The organization leads the industry in digital health innovation, using technology to drive transformation, value, and excellence in care."
  ]
},

// 29. Lean Integrated into Corporate Strategy — Healthcare
{
  dimensionName: "Lean Integrated into Corporate Strategy",
  sectorName: "Healthcare",
  levels: [
    "Lean principles are not incorporated into strategic planning or organizational goals. Improvement efforts are sporadic, project-driven, and disconnected from overall mission or long-term value creation. Leadership rarely articulates a vision for Lean, and resource allocation for improvement is minimal. Lean is perceived as a temporary program, not a core strategy.",
    "Lean is recognized as a useful improvement approach, with pilot projects aligned to operational problems. Some strategic discussions reference Lean, and leadership awareness grows gradually. Resource planning begins to account for Lean initiatives, but integration remains inconsistent and commitment is shallow. Lean is often viewed as separate from business-as-usual.",
    "Lean is formally integrated into strategic plans and objectives, with clear goals linked to clinical quality, patient safety, and efficiency. Leadership communicates the value of Lean in achieving organizational priorities, and resources are allocated systematically to support Lean deployment. Performance reviews include Lean metrics, and alignment between improvement initiatives and strategy improves.",
    "Lean thinking is embedded in strategy development and execution at all levels, influencing investments, technology adoption, and external partnerships. Cross-functional collaboration is driven by Lean goals, and leadership regularly reviews Lean progress as part of dynamic planning. Lean culture supports strategic agility and proactive adaptation to changing healthcare environments.",
    "Lean principles shape the organization's vision, drive innovation, and create sustainable value. Lean transformation is central to business identity and governance, with the organization benchmarking against industry leaders. Strategy deployment is agile, data-driven, and inclusive, supporting continuous evolution. Lean becomes synonymous with high performance and long-term success."
  ]
},

// 30. Hoshin Kanri or Strategy Deployment — Healthcare
{
  dimensionName: "Hoshin Kanri or Strategy Deployment",
  sectorName: "Healthcare",
  levels: [
    "Strategy deployment is informal or non-existent, leading to fragmented improvement efforts and misalignment between departments. Communication of strategic priorities is top-down and often unclear, resulting in a lack of coordinated action. Lean objectives, if present, are not cascaded systematically, and accountability for execution is weak. Departments operate in isolation.",
    "Basic strategy deployment tools, such as goal cascades and departmental scorecards, are introduced. Some coordination of objectives occurs, but communication is irregular and feedback loops are limited. Improvement projects are occasionally aligned with organizational goals, but sustained alignment and collaboration are lacking. Accountability remains inconsistent.",
    "Structured strategy deployment processes, such as Hoshin Kanri, align goals and improvement priorities across functions. Regular review cycles and cross-functional teams ensure progress tracking and accountability. Lean objectives are cascaded through performance management, and communication becomes more transparent. Collaboration between departments strengthens.",
    "Strategy deployment is dynamic and evidence-based, leveraging real-time metrics and feedback to adapt goals and initiatives. Leadership engagement and structured feedback enable agile planning and response to challenges. All improvement efforts are closely aligned with strategic priorities, and continuous refinement supports organizational agility and resilience.",
    "Strategy deployment is fully integrated, participatory, and data-driven, empowering staff at all levels to contribute to strategic execution. Digital platforms support transparent communication, progress tracking, and rapid adjustment of priorities. The organization demonstrates strategic agility, innovation, and industry leadership. Lean strategy deployment is a recognized driver of healthcare transformation."
  ]
},
// 31. Supplier Collaboration — Healthcare
{
  dimensionName: "Supplier Collaboration",
  sectorName: "Healthcare",
  levels: [
    "Relationships with suppliers are largely transactional, focused on pricing and order fulfillment, with minimal collaboration on quality, delivery, or improvement. Communication is infrequent and typically reactive to issues, resulting in supply variability and risk to patient care. There is little to no joint problem-solving or strategic alignment. Supplier performance is not systematically measured or managed.",
    "Basic supplier performance metrics and scorecards are introduced, and suppliers may be invited to occasional meetings or feedback sessions. Some collaboration on critical issues such as shortages or quality concerns begins, but it is inconsistent and reactive. Data sharing is informal, and joint improvement efforts are limited to a small subset of strategic suppliers. Trust and transparency are developing but fragile.",
    "Regular reviews and structured communication channels align supplier expectations with healthcare requirements. Joint problem-solving initiatives address recurring quality or delivery challenges, and key suppliers are engaged in Lean projects. Performance data and improvement results are shared more openly, enabling proactive management and better supply chain reliability. Continuous improvement efforts include input from both sides.",
    "Strategic partnerships are developed with key suppliers, integrating them into planning, innovation, and Lean transformation initiatives. Real-time data exchange, shared performance goals, and collaborative governance structures support mutual accountability and rapid response to challenges. Suppliers participate in improvement events and innovation pilots, helping drive value and resilience across the supply chain.",
    "Supplier collaboration is a core strategic capability, with digital integration enabling seamless, real-time data sharing, co-development of solutions, and predictive management of supply risks. The organization and its suppliers jointly innovate, benchmark, and continuously improve processes, driving industry-leading performance and resilience. Supplier relationships are characterized by trust, transparency, and shared success."
  ]
},

// 32. Customer Focus — Healthcare
{
  dimensionName: "Customer Focus",
  sectorName: "Healthcare",
  levels: [
    "Patient and community needs are not systematically considered in service design or delivery. Feedback is rarely sought and often handled only by select departments, while care teams focus mostly on internal procedures. Errors and complaints are handled reactively, with limited investigation or learning. Customer experience and satisfaction are not tracked or prioritized.",
    "Basic patient feedback mechanisms such as surveys or suggestion boxes are introduced, and some care teams begin using data from complaints or compliments. The organization starts to understand the impact of care processes on patient outcomes, but systematic action is limited. Communication about the importance of patient experience increases but remains inconsistent. Improvements are often reactive and localized.",
    "Customer KPIs—such as patient satisfaction, safety incidents, and wait times—are tracked and reviewed regularly. Root cause analysis is used to address complaints, and patient feedback becomes a routine input to service improvement. Care teams participate in ‘voice of the customer’ reviews, and improvements are prioritized based on patient value. Cross-departmental collaboration on patient-centered care increases.",
    "Patient focus is embedded in daily operations and strategic planning. Patient satisfaction and outcome metrics influence decisions at all levels. Care design actively involves patients and families, and the organization regularly engages them in planning and improvement efforts. Continuous improvement cycles target patient value creation, and culture increasingly prioritizes patient-centeredness.",
    "Customer focus is deeply ingrained, guiding all strategies, operations, and innovations. Advanced analytics and direct engagement anticipate and exceed patient expectations. The organization partners with patients and communities to co-create care models, proactively sharing feedback and benchmarking customer experience. Healthcare teams are recognized for industry-leading patient-centered care and loyalty."
  ]
},

// 33. Performance Measurement and Metrics — Healthcare
{
  dimensionName: "Performance Measurement and Metrics",
  sectorName: "Healthcare",
  levels: [
    "Measurement of clinical, operational, and financial performance is limited, outdated, or inconsistent, hindering effective management and improvement. Key metrics—such as patient outcomes, safety events, or wait times—are rarely tracked or reported. Data collection is manual, fragmented, and rarely used for decision-making. Accountability is weak.",
    "Basic key performance indicators (KPIs) are established in selected areas, and some data is collected to support reporting or compliance. Performance data is often delayed, manually gathered, and reviewed infrequently. Metrics focus primarily on outputs rather than process quality or outcomes. Staff awareness of performance expectations is growing but inconsistent.",
    "A balanced set of metrics—covering quality, safety, efficiency, and patient experience—is tracked and reviewed regularly across teams. Automated systems improve data timeliness and accuracy, and dashboards support frontline performance management. Teams use metrics for problem-solving and continuous improvement, and accountability is reinforced through feedback and targets.",
    "Performance measurement is integrated across all clinical and administrative functions, with real-time data available to support proactive management and strategic decision-making. Metrics are linked to organizational goals, and advanced analytics are used to identify trends and opportunities. Performance results inform planning and are discussed openly at all levels. Benchmarking and best practice sharing accelerate improvement.",
    "Performance measurement is predictive, comprehensive, and central to organizational culture. AI, advanced analytics, and benchmarking inform continuous target-setting and drive world-class performance. Metrics are transparent, drive accountability, and enable agile responses to emerging challenges. Performance excellence is recognized internally and externally, supporting healthcare leadership."
  ]
},

// 34. Sustainability and Environmental Responsibility — Healthcare
{
  dimensionName: "Sustainability and Environmental Responsibility",
  sectorName: "Healthcare",
  levels: [
    "Environmental considerations are absent from most healthcare operations. Waste, energy use, and emissions are not measured or managed, and compliance is limited to minimal legal requirements. Employees are largely unaware of the organization’s environmental impact. Sustainability is not integrated into decision-making or care delivery.",
    "Basic sustainability initiatives—such as recycling or energy-saving measures—are introduced in selected departments, and some data is collected for compliance reporting. Awareness of environmental responsibility increases among staff and leadership, but efforts remain fragmented and peripheral to core healthcare processes. Progress is slow and localized.",
    "Sustainability goals and metrics are established, incorporated into operations, and linked to improvement initiatives. Teams work on projects to reduce waste, emissions, and resource use, and supplier practices are reviewed for environmental impact. Employee training includes sustainability principles, and the organization begins to track and communicate progress more systematically.",
    "Sustainability and environmental stewardship are embedded in healthcare strategy, design, and daily management. Advanced technologies and analytics optimize resource use and environmental performance. Continuous monitoring and reporting support transparency and accountability, while collaboration with suppliers and communities drives shared progress. The culture prioritizes environmental stewardship.",
    "Sustainability leadership is a core value, driving continuous innovation and industry-leading practices—from renewable energy and waste reduction to circular economy models. Sustainability metrics are integrated with operational and financial KPIs, supporting exemplary stakeholder engagement. The organization is recognized for pioneering sustainable healthcare and sharing best practices across the industry."
  ]
},

// 35. Continuous Improvement Culture — Healthcare
{
  dimensionName: "Continuous Improvement Culture",
  sectorName: "Healthcare",
  levels: [
    "Efforts to improve care and operations are sporadic, event-driven, or initiated by external consultants. Staff engagement in improvement is minimal, and learning from past initiatives is rare. Most changes are reactive, lack follow-through, and do not result in lasting benefit. There is little awareness or understanding of continuous improvement principles.",
    "Continuous improvement (CI) activities—such as Lean events or suggestion programs—emerge in some areas, often driven by management. Participation is inconsistent and momentum is hard to sustain. Communication about CI increases, but successes are not widely celebrated or shared. Employees begin to see the value but may remain skeptical.",
    "Continuous improvement is integrated into daily work, with teams routinely identifying and implementing improvements. Lean tools and problem-solving methodologies are widely used, and successes are recognized. Improvement efforts are linked to strategic and operational metrics, and leadership actively coaches CI. Culture shifts towards greater engagement and accountability.",
    "A strong CI culture permeates the organization, with staff at all levels empowered and accountable for improvement. CI is embedded in training, performance management, and leadership practices. Cross-functional collaboration and knowledge sharing drive innovation, and the organization systematically captures and spreads best practices. Learning agility and adaptation become norms.",
    "Continuous improvement is a core organizational capability and competitive differentiator. CI cycles are rapid and relentless, supported by advanced analytics and digital tools. The organization leads in Lean healthcare maturity and is recognized for operational excellence and innovation. Continuous learning and improvement are woven into every aspect of care and business strategy."
  ]
},
// 36. Visual Performance Management — Healthcare
{
  dimensionName: "Visual Performance Management",
  sectorName: "Healthcare",
  levels: [
    "Performance data is not visually displayed or is inaccessible to most frontline staff. Metrics such as patient wait times, infection rates, or resource usage are rarely communicated, limiting awareness and engagement. Visual management tools like boards or dashboards are virtually absent. Discussions on performance are sporadic and mainly focus on problems after they occur.",
    "Basic visual management tools, such as whiteboards or posted charts, appear in select units to track simple metrics. Updates are often manual and may be infrequent or incomplete. Frontline teams occasionally reference these visuals, but ownership and interpretation vary widely. Efforts to use visual data for improvement are limited and localized.",
    "Visual management boards are maintained and updated regularly in most departments, covering operational, clinical, and patient safety indicators. Teams use visual cues like color-coding to quickly spot issues and discuss them during huddles or meetings. Staff increasingly take responsibility for maintaining and interpreting visuals. Visual management supports early detection and timely response to deviations.",
    "Digital visual performance systems provide real-time data accessible to relevant personnel across the organization. Interactive dashboards and displays are used proactively to drive daily management and support improvement initiatives. Leadership uses visual data to coach and hold teams accountable. Metrics evolve with business needs and are reviewed collaboratively.",
    "Visual performance management is fully integrated with enterprise IT systems, offering organization-wide, real-time, and interactive dashboards. Predictive analytics highlight trends and potential issues before they escalate. Visuals link strategy deployment with day-to-day goals, driving transparency and engagement at all levels. The organization sets industry standards for using visual tools to empower teams and sustain improvement."
  ]
},

// 37. Risk Management and Mitigation — Healthcare
{
  dimensionName: "Risk Management and Mitigation",
  sectorName: "Healthcare",
  levels: [
    "Risk identification and mitigation are informal, sporadic, and largely reactive, with problems addressed only after adverse events occur. There is little foresight or planning for potential disruptions, such as supply chain breakdowns, clinical errors, or safety incidents. Communication about risks is ad hoc and rarely systematic. The organization remains vulnerable to repeat incidents and compliance breaches.",
    "Basic risk registers and assessments are introduced in certain departments, and some contingency plans are created, though often with limited scope. Teams start to recognize and document common risks, and risk awareness training occurs occasionally. Management of risks is mainly manual, and processes are inconsistent across units. Responses are still mostly reactive, but learning begins to take place.",
    "Structured risk management processes are implemented throughout the healthcare organization, with regular identification, assessment, and prioritization of clinical, operational, and compliance risks. Mitigation plans are developed and reviewed, and cross-functional teams collaborate on risk reduction strategies. Incident data is analyzed for patterns, supporting continuous improvement in risk practices. Risk communication improves organization-wide.",
    "Risk management is embedded in strategic planning and daily operations, supported by advanced analytics that predict potential risks and enable proactive mitigation. Regular training and transparent communication foster a culture of risk awareness and ownership. Lessons learned from incidents are systematically captured and drive both process and policy improvements. Risk management underpins resilience and patient safety.",
    "Risk management is predictive, comprehensive, and integral to every process and decision. Real-time monitoring and AI-powered analytics enable the early identification of threats and rapid, coordinated responses. Partnerships with suppliers and stakeholders enhance healthcare system resilience. The organization continuously improves its risk frameworks, benchmarks against global best practices, and is recognized for exemplary risk leadership."
  ]
},

// 38. Employee Development and Career Pathways — Healthcare
{
  dimensionName: "Employee Development and Career Pathways",
  sectorName: "Healthcare",
  levels: [
    "Staff development is ad hoc, with limited formal training or structured career planning. Opportunities for growth and skill advancement are unclear, contributing to low motivation and higher turnover. Training focuses mainly on compliance or immediate job tasks. Supervisors rarely engage in coaching or mentoring. Employees receive little guidance on long-term professional progression.",
    "Basic training programs and some defined career paths are introduced, providing foundational development in clinical and administrative skills. Employees receive periodic coaching and support for skill building, but processes for advancement are not standardized. Training remains largely classroom-based, and on-the-job learning is inconsistent. Engagement in career development varies between departments.",
    "Structured programs for employee development and career progression exist for a range of roles, integrating classroom training, simulation, and hands-on coaching. Formal mentoring, feedback, and competency frameworks support staff growth. Employees are encouraged to participate in improvement initiatives as part of their development. Career progression is more transparent, and retention rates improve.",
    "Employee development is embedded in the organizational culture, aligned with business and quality objectives. Leadership development, clinical specialization, and inter-professional learning are encouraged. Continuous learning is facilitated by online platforms and peer networks. Career advancement is tied to performance and contribution to improvement efforts. Succession planning identifies and prepares future leaders.",
    "Employee development is a strategic priority, supported by personalized pathways, advanced certification programs, and leadership academies. The organization fosters a learning culture that champions innovation, cross-functional mobility, and professional growth at all levels. Metrics inform workforce planning and talent management. The organization is recognized for being an employer of choice and developing industry-leading healthcare talent."
  ]
},

// 39. Information Technology Integration — Healthcare
{
  dimensionName: "Information Technology Integration",
  sectorName: "Healthcare",
  levels: [
    "IT systems are fragmented, with poor integration between departments such as clinical, administrative, and supply chain functions. Data remains siloed, leading to inefficiencies, manual workarounds, and frequent errors. Reliance on paper or legacy systems is common, and support for end users is inconsistent. Real-time visibility into operations is limited.",
    "Basic IT solutions like electronic medical records or supply chain management software are introduced in select areas. Some integration exists, but data sharing between systems is still mostly manual and unreliable. Training for staff on new technology is sporadic. IT projects are often driven by compliance or immediate needs, not strategy. Workflow improvements are incremental.",
    "Comprehensive IT systems are deployed across core functions and increasingly integrated, allowing for real-time data capture and sharing. System training is robust, and help resources are available. End-to-end visibility improves decision-making and coordination. IT teams support Lean and improvement initiatives with technology solutions, and data-driven management becomes more common.",
    "Advanced IT integration connects clinical operations, administrative systems, and external partners via cloud platforms, APIs, and digital dashboards. Automation, predictive analytics, and workflow digitization enable seamless operations and real-time insights. IT strategy is closely aligned with healthcare goals. Continuous IT improvement is part of organizational governance and leadership review.",
    "IT is fully strategic, intelligent, and central to all operations, supporting AI, machine learning, and secure, real-time data exchange with partners, patients, and suppliers. Healthcare teams collaborate seamlessly through digital platforms, and IT underpins innovation and continuous improvement. The organization leads in digital health transformation, setting benchmarks in interoperability and technology-driven care."
  ]
},

// 40. Cross-Functional Collaboration — Healthcare
{
  dimensionName: "Cross-Functional Collaboration",
  sectorName: "Healthcare",
  levels: [
    "Collaboration between healthcare functions such as clinical, administrative, and support teams is limited and siloed. Departments work independently with minimal coordination, leading to duplicated effort, conflicting priorities, and slow problem resolution. Communication breakdowns are common, and collaboration is viewed as optional.",
    "Management initiates some cross-functional projects or meetings, often in response to specific challenges or external requirements. Collaboration improves in isolated cases, but information sharing and teamwork remain inconsistent. Teams begin to share data and coordinate schedules, but trust and accountability are still developing.",
    "Regular cross-functional teams collaborate on process improvement, planning, and problem-solving, with shared goals and metrics aligning efforts. Open communication and mutual respect develop across disciplines, supporting better patient outcomes and operational efficiency. Cross-functional meetings are routine, and teams work together to address system-wide challenges.",
    "Collaboration is embedded in daily operations and strategic projects, with teams using structured problem-solving and continuous improvement methods. Digital tools support transparent communication and coordination. Cross-disciplinary trust and shared accountability drive innovation and agility. Collaboration is a source of organizational strength.",
    "Collaboration extends beyond internal teams to include patients, suppliers, and community partners, forming integrated care networks. Cross-functional teams lead organization-wide transformation and innovation initiatives. Digital platforms enable transparency and real-time information flow. Collaboration is a defining cultural norm, giving the organization a recognized edge in healthcare delivery and outcomes."
  ]
},
// 41. Knowledge Management and Best Practice Sharing — Healthcare
{
  dimensionName: "Knowledge Management and Best Practice Sharing",
  sectorName: "Healthcare",
  levels: [
    "Knowledge sharing is informal, sporadic, and heavily reliant on individual initiative. Best practices and clinical lessons are rarely documented or communicated beyond immediate teams. Repeated mistakes and inefficiencies are common due to weak organizational memory. Training and onboarding are reactive and inconsistent, limiting learning across the system.",
    "Some efforts to document and share best practices begin, often in response to accreditation or specific incidents. Informal communities of practice may emerge, but information channels are inconsistent. Lessons learned are usually contained within departments, and broader organizational knowledge retention is patchy. Communication about new findings is not standardized.",
    "Structured repositories and knowledge management systems are implemented, allowing employees to access and contribute to best practice resources. Regular forums and workshops facilitate cross-department sharing of clinical, safety, and operational learnings. Knowledge transfer is embedded into onboarding and training, supporting continuous improvement and organizational learning.",
    "Knowledge management is integrated into core business processes and enabled by digital platforms. Cross-functional and cross-site knowledge sharing becomes routine, with benchmarking against external standards. Leadership actively promotes a culture of continuous learning and transparency. Knowledge assets are strategically managed, protected, and leveraged for quality care.",
    "Knowledge management is a strategic driver of innovation and excellence, using advanced technologies such as AI to curate and disseminate real-time healthcare knowledge. Networks extend beyond the organization, involving partners, patients, and industry experts. Best practice sharing accelerates improvement, agility, and reputation. Learning agility is embedded at every level."
  ]
},

// 42. Safety Culture — Healthcare
{
  dimensionName: "Safety Culture",
  sectorName: "Healthcare",
  levels: [
    "Safety practices are reactive and inconsistent, with policies often existing only on paper and not enforced. Employees may feel reluctant to report hazards or incidents for fear of blame. Training is sporadic, and investigations focus on identifying fault rather than preventing recurrence. Unsafe conditions and behaviors persist, causing preventable harm.",
    "Basic safety protocols and training programs are rolled out, leading to more consistent hazard reporting and a gradual reduction in incidents. Compliance is emphasized, though coaching and root cause analysis are limited. Employees begin to recognize the importance of safety, but daily behaviors do not always reflect new expectations. Supervisors set the tone for safety improvement.",
    "A proactive safety culture emerges, with staff actively involved in identifying hazards and mitigating risks. Near-miss reporting and structured audits become standard practice, and leadership openly supports safety initiatives. Root cause analysis and corrective actions are routine. Training and communication reinforce safety behaviors, contributing to measurable improvements.",
    "Safety is fully integrated into daily work and management systems. Employees are empowered to stop unsafe work and participate in cross-functional safety teams. Data analytics and continuous learning drive the prevention of incidents. Leadership is visible and accountable, and psychological safety encourages open communication. Safety metrics guide improvement and resource allocation.",
    "The organization is recognized for a zero-harm philosophy, with advanced technologies predicting and preventing risks. Safety is a core value, driving innovation and excellence in care. Psychological safety enables everyone to report concerns without fear. Safety performance is benchmarked externally, and the culture sustains industry-leading outcomes."
  ]
},

// 43. Innovation Capability — Healthcare
{
  dimensionName: "Innovation Capability",
  sectorName: "Healthcare",
  levels: [
    "Innovation is rare and mostly reactive, driven by crises or regulatory requirements. There is little encouragement for creative ideas, and employees fear failure or lack incentives to propose change. Traditional approaches dominate, with innovation viewed as nonessential or risky. Few resources are allocated for improvement.",
    "Occasional innovation initiatives emerge, often led by external consultants or specific projects. Experimentation is allowed in some areas, but there is no systematic support or evaluation. Leadership begins to acknowledge innovation’s importance, but efforts remain fragmented and poorly communicated. Learning from innovation is limited.",
    "Structured innovation programs take root, encouraging cross-functional collaboration and idea generation. Resources and time are allocated for pilots and small-scale improvements. Successes and failures are discussed openly, fostering a more supportive environment. Innovation begins to shape patient care, technology adoption, and operational efficiency.",
    "Innovation is integrated into the organizational culture, with dedicated teams and digital platforms supporting experimentation, prototyping, and scaling of new ideas. Partnerships with patients, suppliers, and technology providers enhance creativity and learning. Leadership rewards risk-taking and learning from failure. Innovation drives strategic priorities and patient outcomes.",
    "Innovation is a core competency, embedded in all aspects of care delivery and system improvement. Advanced methods such as design thinking, AI, and crowdsourcing are used to solve complex healthcare challenges. The organization leads or participates in industry-wide innovation networks. Outcomes and learning from innovation are shared broadly, driving continuous transformation and leadership."
  ]
},

// 44. Workforce Flexibility and Multi-Skilling — Healthcare
{
  dimensionName: "Workforce Flexibility and Multi-Skilling",
  sectorName: "Healthcare",
  levels: [
    "Job roles are rigidly defined, limiting staff adaptability and resilience. Cross-training is rare or absent, and employees are confined to repetitive tasks within single specialties or units. Peaks in demand or staff absences cause workflow disruptions, and skill shortages persist. Planning is reactive, creating vulnerability to change.",
    "Initial cross-training and multi-skilling programs are introduced, usually in response to operational needs or emergencies. Employees are exposed to new tasks within their own teams, and some understand the value of flexibility. Participation is inconsistent, and workforce planning remains manual. Scheduling and resource allocation are not yet dynamic.",
    "Comprehensive multi-skilling programs are implemented, enabling staff to rotate across functions and respond to varying demand. Workforce planning incorporates skills mapping, and ongoing development is recognized and rewarded. Scheduling adapts to workload fluctuations, reducing bottlenecks. Employees engage in continuous improvement and skill growth.",
    "Workforce flexibility is embedded in daily practice, supported by dynamic resource management systems and competency-based scheduling. Cross-functional teams optimize deployment and respond quickly to changes in patient needs. Continuous learning is encouraged, supporting innovation and operational excellence. Flexibility is seen as a strategic asset.",
    "Workforce flexibility is predictive and supported by real-time analytics and advanced management systems. Staff are empowered to lead, innovate, and adapt to complex scenarios. Multi-skilling and cross-training extend to community and partner organizations, supporting integrated care. The workforce strategy aligns with organizational vision and resilience, earning recognition for talent excellence."
  ]
},

// 45. Data-Driven Decision Making — Healthcare
{
  dimensionName: "Data-Driven Decision Making",
  sectorName: "Healthcare",
  levels: [
    "Decisions are mainly based on intuition or experience, with data rarely collected or used systematically. Reporting is delayed and often inaccurate, hindering effective management and timely action. There is little capacity for analytics, and a culture of data-driven improvement is absent. Performance measurement is inconsistent.",
    "Basic data collection systems support limited decision-making, often focusing on regulatory reporting or compliance. Some managers use available metrics to monitor performance, but data quality and timeliness are variable. Analytical skills are underdeveloped, and data is not widely shared or discussed. Data-informed decisions are the exception rather than the rule.",
    "Data-driven decision-making is established across most functions, with regular use of relevant metrics and analyses to guide patient care, operations, and strategy. Dashboards and visualization tools help teams monitor key indicators and respond to trends. Analytical capabilities are developed, and decisions increasingly reflect objective insights. Data governance improves.",
    "Advanced analytics and business intelligence systems enable predictive and prescriptive decision-making. Data from multiple sources is integrated and accessible, supporting proactive management and continuous improvement. Cross-functional teams use data collaboratively to interpret results and plan action. Data literacy is widespread and valued.",
    "Data-driven decision-making is deeply embedded, supported by real-time analytics, machine learning, and AI. Decision processes are optimized for both efficiency and quality, balancing patient needs with operational goals. Data insights drive innovation, and performance data is shared openly with stakeholders. The organization is recognized as a leader in healthcare analytics and continuous learning."
  ]
},
// 46. Employee Engagement and Ownership — Healthcare
{
  dimensionName: "Employee Engagement and Ownership",
  sectorName: "Healthcare",
  levels: [
    "Engagement is low, with many staff feeling disconnected from the organization’s mission and daily decision-making. Communication is primarily top-down, and frontline workers have little influence on processes or improvements. Feedback mechanisms are weak, and recognition for initiative is scarce. Turnover is high and ownership of outcomes is minimal.",
    "Early efforts to engage employees include suggestion programs and team meetings, but participation is inconsistent. Some staff begin to share ideas, though follow-up and implementation vary widely. Communication improves modestly, but engagement remains dependent on individual managers. Recognition and rewards are not yet tied to engagement or ownership.",
    "Active engagement is fostered through two-way communication, structured empowerment in problem-solving, and regular involvement in improvement projects. Teams assume greater responsibility for their areas and contribute meaningfully to broader goals. Surveys and feedback mechanisms are used to monitor morale, and recognition programs reinforce engagement. A sense of ownership grows.",
    "Employee engagement is deeply embedded in leadership practices and organizational culture. Staff are encouraged to take initiative, drive innovations, and lead improvement efforts. Leadership coaches and supports engagement at all levels, and high engagement is reflected in retention and patient outcomes. Employee voices influence policy and strategy.",
    "Engagement and ownership are seen as strategic advantages, with staff at all levels shaping organizational direction and culture. Engagement metrics are closely tracked and inform management actions. The culture emphasizes trust, respect, and shared accountability, making employees brand ambassadors and champions of excellence. Organizational identity and performance are strengthened by deep engagement."
  ]
},

// 47. Governance and Accountability — Healthcare
{
  dimensionName: "Governance and Accountability",
  sectorName: "Healthcare",
  levels: [
    "Governance structures are unclear or ineffective, and roles and responsibilities for quality, safety, or Lean are poorly defined. Accountability for outcomes is limited, with performance issues inconsistently addressed. Oversight of improvement projects is weak and follow-through is rare. Transparency in decision-making is lacking.",
    "Basic governance mechanisms such as committees or steering groups begin to oversee key initiatives. Accountability is assigned in some areas but remains uneven, and enforcement is weak. Roles are clarified but not fully embraced, and only some reviews include quality or Lean metrics. Governance processes are informal and fragmented.",
    "Clear governance frameworks define roles, escalation paths, and responsibilities for clinical, operational, and improvement initiatives. Regular reviews and audits track progress, outcomes, and compliance. Governance includes broad participation and visible leadership support. Systematic tracking and transparent resource allocation support improved accountability.",
    "Governance is formalized and aligned with organizational strategy, risk management, and regulatory standards. Performance contracts, incentives, and feedback loops reinforce accountability. Governance processes adapt to changing needs and drive sustainable improvement. Cross-functional collaboration supports comprehensive oversight and decision-making.",
    "Governance is agile, data-driven, and deeply integrated at every level. Accountability is transparent and closely linked to strategic goals and patient outcomes. Governance structures foster innovation, rapid response, and learning. Continuous improvement and risk management are central to governance, and the organization is recognized for exemplary practices."
  ]
},

// 48. Customer-Centric Process Design — Healthcare
{
  dimensionName: "Customer-Centric Process Design",
  sectorName: "Healthcare",
  levels: [
    "Processes are designed mainly for internal efficiency, often neglecting patient or family perspectives. Feedback from patients is seldom sought or used, and care pathways are rigid and reactive. Patient complaints and dissatisfaction are common, and the system struggles to respond proactively. Customer-centric thinking is minimal.",
    "Some processes start to incorporate patient feedback, usually to address specific complaints or regulatory requirements. Design changes are reactive and lack a holistic view of the patient experience. Data on patient needs is collected sporadically and shared inconsistently. Collaboration with patient-facing teams is limited.",
    "Process design increasingly involves patient input and frontline staff, using journey mapping and value stream mapping that include patient touchpoints. Improvements are aimed at enhancing satisfaction, safety, and quality. Systematic gathering and analysis of patient feedback inform design, and cross-functional collaboration improves customer focus.",
    "Customer-centric design becomes standard, with flexible, adaptive processes that exceed patient expectations. Real-time patient feedback informs ongoing improvement. Partnerships with families, community organizations, and suppliers support end-to-end patient experience. Anticipation of patient needs drives proactive service design.",
    "Customer-centricity is a defining feature, embedded in innovation and strategic planning. Processes evolve continuously based on predictive analytics, deep patient insights, and co-creation with patients and families. The organization is recognized for leading patient experience excellence, setting industry benchmarks and differentiating itself through outstanding service."
  ]
},

// 49. Resource Optimization — Healthcare
{
  dimensionName: "Resource Optimization",
  sectorName: "Healthcare",
  levels: [
    "Resource use—whether labor, equipment, or facilities—is often inefficient and poorly managed. Staffing imbalances, equipment downtime, and suboptimal space usage are common. Resource allocation is reactive, based on short-term needs, leading to bottlenecks, waste, and increased costs. Strategic planning is minimal.",
    "Basic resource planning and scheduling improve utilization in select areas. Teams begin to identify bottlenecks and adjust allocations, but efforts are localized and not sustained. Some metrics are tracked, but comprehensive optimization is lacking. Improvements are incremental and inconsistent.",
    "Systematic resource optimization practices are established, supported by workforce management and maintenance plans. Space and equipment use are monitored and improved with input from multidisciplinary teams. Resource allocation is increasingly aligned with demand forecasts and care priorities. Continuous improvement targets waste reduction and productivity gains.",
    "Advanced analytics and automation enable dynamic optimization of labor, equipment, and space. Cross-functional coordination supports real-time deployment based on patient needs. Resource optimization is linked to sustainability and financial goals. Resource utilization metrics are integrated into performance management and planning.",
    "Resource optimization is predictive, proactive, and fully integrated with strategic objectives. AI and real-time data enable seamless adaptation to changes in volume or acuity. The organization achieves high asset utilization, minimal waste, and optimal patient flow. Resource strategies support innovation, growth, and a reputation for operational excellence."
  ]
},

// 50. Leadership Development — Healthcare
{
  dimensionName: "Leadership Development",
  sectorName: "Healthcare",
  levels: [
    "Leadership development is minimal, with training focused only on operational basics. Coaching, mentoring, and strategic leadership skills are rare. Leadership capability is inconsistent, often resulting in weak team performance and limited improvement. Succession planning is absent and potential future leaders are overlooked.",
    "Basic leadership training programs are introduced, addressing communication, problem-solving, and foundational management skills. Some coaching and mentoring are available, but depth and consistency are lacking. Leadership development is largely reactive, initiated in response to specific issues. Expectations for leaders are being clarified.",
    "Structured leadership development programs align with organizational goals, integrating Lean and change management competencies. Leaders are coached to support improvement and employee engagement. Leadership potential is identified and nurtured, and succession planning begins. Leaders are increasingly seen as drivers of transformation.",
    "Leadership development is integrated with talent management and long-term strategy. Advanced programs build skills in Lean coaching, innovation, and strategic thinking. Leaders at all levels are supported in their growth, regularly assessed, and held accountable for results. Succession planning is robust, ensuring a strong pipeline.",
    "Leadership development is strategic, personalized, and a source of organizational strength. Leaders at every level are empowered to champion change, develop others, and foster a culture of continuous improvement. External benchmarking and thought leadership are leveraged to keep programs world-class. Leadership excellence is recognized internally and externally."
  ]
},
// 51. Problem-Solving Methodologies — Healthcare
{
  dimensionName: "Problem-Solving Methodologies",
  sectorName: "Healthcare",
  levels: [
    "Problem-solving is mostly reactive, informal, and driven by immediate fixes rather than root cause analysis. Issues tend to recur as structured tools are rarely used, and documentation is sparse. Employees lack confidence in structured methodologies, and lessons learned are seldom shared. Improvements are short-lived and often disconnected from organizational priorities.",
    "Basic problem-solving tools such as 5 Whys and Plan-Do-Check-Act cycles are introduced in some teams, primarily during improvement events. Solutions address immediate problems, but there is limited training or standardization. Some documentation occurs, but follow-up and knowledge transfer are inconsistent. Methodologies remain event-driven and siloed.",
    "Structured problem-solving approaches become established, using tools like A3 reports, root cause analysis, and standard work. Teams are coached to systematically address issues, documenting actions and tracking outcomes. Problem-solving becomes integrated into daily work, and cross-disciplinary learning accelerates improvement. Supervisors actively support adoption of methodologies.",
    "Advanced problem-solving techniques and data analytics are used to resolve complex and cross-functional challenges. Teams collaborate proactively to anticipate risks and prevent recurrence, linking problem-solving outcomes to key performance metrics. Continuous learning from problems is shared across the organization, driving innovation and sustained improvement.",
    "Problem-solving is a strategic competency, supported by predictive analytics and AI to identify emerging risks and opportunities. Teams experiment, iterate rapidly, and institutionalize successful solutions. Lessons learned are disseminated organization-wide, fueling breakthrough innovations and competitive differentiation. The culture views challenges as opportunities for growth and excellence."
  ]
},

// 52. Change Leadership — Healthcare
{
  dimensionName: "Change Leadership",
  sectorName: "Healthcare",
  levels: [
    "Change is poorly managed, with leaders offering little support or clear communication about the reasons for change. Staff resist new initiatives, perceiving them as disruptive or unnecessary. Planning and follow-up are weak, leading to stalled or failed changes. Adaptation is slow and anxiety about change is high.",
    "Some leaders receive training in change management, improving basic skills in communication and planning. Change initiatives become more structured, but broad engagement remains limited. Resistance is addressed reactively, and employees are only modestly involved in shaping change processes. Lessons from change efforts are not consistently captured.",
    "Leaders actively sponsor and communicate a compelling vision for change, involving stakeholders early and managing resistance proactively. Change management tools and structured processes support adoption, and regular coaching helps staff adapt. Leadership recognizes change as a key part of organizational success and development.",
    "Change leadership is deeply embedded in the organizational culture and leadership development. Leaders model resilience, flexibility, and openness, aligning change initiatives with strategic goals. Cross-functional teams collaborate on large-scale changes, and continuous feedback strengthens outcomes. Change is seen as an ongoing opportunity rather than a threat.",
    "Change leadership is a hallmark of the organization, driving continuous transformation and agility. Leaders at all levels anticipate, champion, and skillfully navigate change using data and insights. The culture supports experimentation, proactive adaptation, and organizational learning. The organization thrives in dynamic environments and benchmarks its change practices externally."
  ]
},

// 53. Cross-Training and Knowledge Transfer — Healthcare
{
  dimensionName: "Cross-Training and Knowledge Transfer",
  sectorName: "Healthcare",
  levels: [
    "Cross-training is rare, and employees tend to work in narrowly defined roles. Knowledge transfer depends on individual initiative rather than formal processes, creating skill gaps and vulnerabilities during absences or turnover. Teams struggle to maintain flexibility and adapt to changing demands. Organizational knowledge is not retained or shared effectively.",
    "Informal cross-training and shadowing begin in response to operational needs, with limited planning and structure. Some employees recognize the value of flexibility, but participation is sporadic and documentation of skills is inconsistent. Knowledge sharing occurs within small groups but is not widespread. Flexibility improves slightly but remains localized.",
    "Structured cross-training and knowledge transfer programs are established, with training plans and schedules ensuring critical skills coverage. Mentoring, peer coaching, and rotation across functions support broader capability. Documentation of skills and training records are maintained, supporting planning and workforce resilience. Teams adapt more readily to change.",
    "Cross-training and knowledge transfer are integrated into workforce development, supporting continuous improvement and innovation. Employees are regularly rotated, and technology tools track competencies and enable learning. Knowledge networks and best practices are shared across the organization, enhancing agility and operational resilience.",
    "Cross-training and knowledge transfer are strategic priorities, driven by advanced learning platforms and personalized development plans. Staff have deep multi-functional expertise and adapt seamlessly to new roles or challenges. Knowledge is systematically shared within the organization and with partners. The workforce is highly resilient, and capability is a distinct competitive advantage."
  ]
},

// 54. Visual Controls for Safety and Quality — Healthcare
{
  dimensionName: "Visual Controls for Safety and Quality",
  sectorName: "Healthcare",
  levels: [
    "Visual controls for safety and quality are sparse or absent, leaving staff reliant on verbal instructions and inaccessible policies. Hazards and quality issues are easily overlooked, and incident rates remain high. Training on visual management is limited, with little accountability for maintaining visual controls. Communication about risks is ineffective.",
    "Basic visual controls—such as signs, labels, and color-coded indicators—are introduced in key risk areas. Employees begin to use visual cues to identify hazards and checkpoints, but consistency and standardization are lacking. Training improves, but adherence and maintenance are uneven. Visual controls support some improvement, but the impact is limited.",
    "Visual controls are standardized and integrated into workflows, with color-coding, floor markings, and checklists guiding behavior and inspections. Metrics for safety and quality are displayed on visual boards, and staff are accountable for maintaining controls. Incident rates decline as awareness and compliance improve. Visual management is used in daily operations.",
    "Dynamic visual controls, supported by digital technologies like sensors and alerts, enable real-time risk management. Controls are reviewed and updated based on data, and leadership uses visual data to coach and engage teams. The culture is proactive, with visual tools preventing incidents before they occur. Visual controls drive sustained improvement.",
    "Visual controls are fully integrated with real-time monitoring, predictive analytics, and automated alerts. Dashboards provide instant feedback on safety and quality status across sites. Staff and leaders use visual data for innovation, continuous risk reduction, and decision-making. The organization benchmarks and shares best practices, achieving world-class safety and quality."
  ]
},

// 55. Lean Culture Alignment — Healthcare
{
  dimensionName: "Lean Culture Alignment",
  sectorName: "Healthcare",
  levels: [
    "Lean is seen as a disconnected set of tools or compliance activities, with skepticism and resistance from staff. Initiatives are isolated and short-lived, rarely resulting in cultural change. Communication about Lean values is weak, and leadership involvement is limited. The culture remains traditional and slow to adapt.",
    "Awareness of Lean culture grows through introductory training and early engagement, with some teams experimenting with new behaviors. Leaders communicate Lean’s importance, but often fail to lead by example. Adoption is patchy and Lean is viewed as supplementary rather than integral to daily care. Cultural change is inconsistent and faces resistance.",
    "Lean culture becomes well understood and embraced, with clear role modeling by leaders and broad staff involvement in improvement. Teams are empowered to drive continuous improvement, and Lean behaviors are reinforced by recognition and performance management. Daily work increasingly reflects Lean thinking, supporting greater sustainability.",
    "Lean principles are deeply embedded, influencing decision-making, teamwork, and innovation throughout the organization. Cross-functional collaboration and learning are routine. Leaders coach Lean capabilities, nurturing an environment of continuous improvement and adaptability. The culture is resilient and supports long-term excellence.",
    "Lean culture defines the organization, shaping its strategy, relationships, and reputation both internally and externally. Lean thinking is instinctive at all levels and extends to partners and the broader community. The organization sets benchmarks for Lean innovation, continuously measuring and evolving culture. Excellence in Lean drives transformation and sector leadership."
  ]
},
// 56. Technology Adoption for Lean — Healthcare
{
  dimensionName: "Technology Adoption for Lean",
  sectorName: "Healthcare",
  levels: [
    "Technology adoption is minimal and disconnected from Lean improvement goals, with manual and paper-based processes prevailing across departments. Adoption is often reactive, driven by regulatory compliance or urgent needs, and employees receive little support or training in digital tools. Information systems are fragmented and poorly integrated, offering limited support for process improvement or data visibility. Technology fails to address root causes of inefficiency and rarely supports Lean initiatives.",
    "Initial digital tools—such as electronic health records, barcode medication administration, or scheduling apps—are adopted in select areas, usually for specific projects or compliance. Integration is incomplete and many processes remain manual, resulting in uneven benefits and persistent data silos. Training on technology is basic and sporadic, and staff show mixed acceptance. Technology supports isolated Lean improvements but lacks strategic alignment with broader transformation goals.",
    "Technology adoption becomes guided by Lean objectives, with integrated systems supporting process standardization, data collection, and visual management across key workflows. Employees are trained to leverage digital tools for continuous improvement and problem-solving. Investments are made in technologies that enhance Lean strategy, such as workflow automation, real-time dashboards, and mobile access. Technology enables more efficient, transparent, and standardized care delivery.",
    "Advanced digital technologies—like clinical decision support, automation, analytics platforms, and IoT devices—streamline Lean processes and drive operational excellence. Systems are seamlessly integrated, enabling real-time monitoring, predictive analytics, and rapid problem resolution. Change management strategies ensure effective adoption and maximize the return on investment. Digital maturity underpins ongoing process innovation and Lean-driven performance gains.",
    "Technology adoption is fully strategic, innovative, and continuous, transforming healthcare delivery through AI, advanced analytics, and interconnected systems. The organization leads the industry in digital-enabled Lean, achieving unmatched agility, transparency, and sustainability in patient care. Technology is a catalyst for Lean transformation, supporting proactive improvement and cross-sector collaboration. Digital best practices are benchmarked and shared externally, reinforcing the organization’s competitive leadership."
  ]
},

// 57. Sustainability Metrics and Reporting — Healthcare
{
  dimensionName: "Sustainability Metrics and Reporting",
  sectorName: "Healthcare",
  levels: [
    "Sustainability metrics are not defined or measured, and reporting on environmental impact is minimal or absent. Awareness of sustainability is low, and regulatory compliance is managed reactively with little proactive planning. Sustainability is not integrated into care delivery or operational decisions, remaining disconnected from organizational values and performance targets.",
    "Basic sustainability data, such as energy use, waste, or water consumption, is collected for compliance in specific areas but is not analyzed systematically. Employee and leadership awareness of environmental responsibility grows slowly. Initiatives are limited to isolated projects and data consistency is lacking, making progress hard to track. Sustainability considerations are not yet woven into routine operations or strategic planning.",
    "Comprehensive sustainability metrics are defined, monitored, and analyzed across the organization. Regular reporting supports management decisions and aligns with corporate sustainability goals, with staff participating in targeted environmental initiatives. Data informs continuous improvement in areas such as waste reduction, resource optimization, and carbon footprint. Progress is communicated internally and externally, supporting accountability.",
    "Sustainability metrics are fully integrated with operational and financial performance indicators, ensuring transparent and stakeholder-focused reporting. Advanced analytics help identify and prioritize opportunities for improvement, and sustainability results directly influence planning, resource allocation, and organizational recognition. External benchmarking is used to compare performance, and accountability for sustainability is a cultural norm.",
    "Sustainability metrics and reporting are strategic, innovative, and drive proactive environmental management through real-time monitoring and predictive analytics. Reporting exceeds industry standards, exemplifying transparency and stakeholder engagement. Leadership in sustainability is demonstrated through ambitious targets, active community engagement, and sharing of best practices. Sustainability performance is a core component of the organization’s reputation and competitive advantage."
  ]
}

];


for (const descGroup of maturityDescriptorsData) {
  const dim = dimensions[descGroup.dimensionName];
  const sector = sectors[descGroup.sectorName];

  if (!dim) {
    console.log(`Skipping: unknown dimension='${descGroup.dimensionName}'`);
    continue;
  }
  if (!sector) {
    console.log(`Skipping: unknown sector='${descGroup.sectorName}'`);
    continue;
  }

  for (let level = 1; level <= descGroup.levels.length; level++) {
    try {
      await prisma.maturityDescriptor.create({
        data: {
          dimensionId: dim.id,
          sectorId: sector.id,
          level,
          description: descGroup.levels[level - 1],
        },
      });
    } catch (err) {
      // Print more detailed info for debugging
      console.error(
        `Error inserting maturityDescriptor: dim='${descGroup.dimensionName}', sector='${descGroup.sectorName}', level=${level}`,
        err.message
      );
    }
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
        dimensionId: dimensions["Coaching & Role Modeling"].id,
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

  // --- DEMONSTRATION QUERIES (Only show "active" records) ---
  const activeCompanies = await prisma.company.findMany({
    where: { deletedAt: null }
  });
  console.log("Active companies:", activeCompanies.map(c => c.name));

  const activeUsers = await prisma.user.findMany({
    where: { deletedAt: null }
  });
  console.log("Active users:", activeUsers.map(u => u.email));

  const activeDimensions = await prisma.dimension.findMany({
    where: { deletedAt: null }
  });
  console.log("Active dimensions:", activeDimensions.map(d => d.name));

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

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

];

  for (const descGroup of maturityDescriptorsData) {
    const dim = dimensions[descGroup.dimensionName];
    const sector = sectors[descGroup.sectorName];

    if (!dim || !sector) {
      console.log(
        `Skipping: dimension='${descGroup.dimensionName}', sector='${descGroup.sectorName}'`
      );
    } else {
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

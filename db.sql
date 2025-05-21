--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AssessmentStatus; Type: TYPE; Schema: public; Owner: akerim
--

CREATE TYPE public."AssessmentStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'REVIEWED'
);


ALTER TYPE public."AssessmentStatus" OWNER TO akerim;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: akerim
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'EXPERT',
    'VIEWER'
);


ALTER TYPE public."Role" OWNER TO akerim;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Assessment; Type: TABLE; Schema: public; Owner: akerim
--

CREATE TABLE public."Assessment" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "departmentId" text,
    "expertId" text NOT NULL,
    status public."AssessmentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Assessment" OWNER TO akerim;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: akerim
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    description text
);


ALTER TABLE public."Category" OWNER TO akerim;

--
-- Name: Company; Type: TABLE; Schema: public; Owner: akerim
--

CREATE TABLE public."Company" (
    id text NOT NULL,
    name text NOT NULL,
    "sectorId" text NOT NULL
);


ALTER TABLE public."Company" OWNER TO akerim;

--
-- Name: Department; Type: TABLE; Schema: public; Owner: akerim
--

CREATE TABLE public."Department" (
    id text NOT NULL,
    name text NOT NULL,
    "companyId" text NOT NULL
);


ALTER TABLE public."Department" OWNER TO akerim;

--
-- Name: Dimension; Type: TABLE; Schema: public; Owner: akerim
--

CREATE TABLE public."Dimension" (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    "categoryId" text NOT NULL
);


ALTER TABLE public."Dimension" OWNER TO akerim;

--
-- Name: Evidence; Type: TABLE; Schema: public; Owner: akerim
--

CREATE TABLE public."Evidence" (
    id text NOT NULL,
    "assessmentId" text NOT NULL,
    "dimensionId" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileType" text NOT NULL,
    "uploadedById" text NOT NULL,
    notes text,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Evidence" OWNER TO akerim;

--
-- Name: MaturityDescriptor; Type: TABLE; Schema: public; Owner: akerim
--

CREATE TABLE public."MaturityDescriptor" (
    id text NOT NULL,
    "dimensionId" text NOT NULL,
    "sectorId" text NOT NULL,
    level integer NOT NULL,
    description text NOT NULL
);


ALTER TABLE public."MaturityDescriptor" OWNER TO akerim;

--
-- Name: Score; Type: TABLE; Schema: public; Owner: akerim
--

CREATE TABLE public."Score" (
    id text NOT NULL,
    "assessmentId" text NOT NULL,
    "dimensionId" text NOT NULL,
    level integer NOT NULL,
    quantitative double precision,
    notes text,
    perception boolean NOT NULL,
    "auditTrail" text
);


ALTER TABLE public."Score" OWNER TO akerim;

--
-- Name: Sector; Type: TABLE; Schema: public; Owner: akerim
--

CREATE TABLE public."Sector" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."Sector" OWNER TO akerim;

--
-- Name: TemplateConfig; Type: TABLE; Schema: public; Owner: akerim
--

CREATE TABLE public."TemplateConfig" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "dimensionId" text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TemplateConfig" OWNER TO akerim;

--
-- Name: User; Type: TABLE; Schema: public; Owner: akerim
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    password text NOT NULL,
    role public."Role" NOT NULL,
    "companyId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO akerim;

--
-- Data for Name: Assessment; Type: TABLE DATA; Schema: public; Owner: akerim
--

COPY public."Assessment" (id, "companyId", "departmentId", "expertId", status, "createdAt", "updatedAt") FROM stdin;
fcccf485-0fa8-4192-b585-94d5ddca5528	87689dd7-5734-41f4-83a3-268c38f593c8	d35e0d81-8abb-45be-921a-3926e4d8afb7	370fb625-ebc2-44e6-bb9f-6ab9a9240a66	DRAFT	2025-05-19 21:03:08.947	2025-05-19 21:03:08.947
8146b973-9635-4d06-b12c-cf08ebcb4832	47eb192d-e1c2-45c0-a018-60acbd4fca0a	\N	e4d1161d-5b7d-4888-94a1-ebb23046681e	SUBMITTED	2025-05-19 21:12:02.407	2025-05-19 22:00:39.738
24295877-7892-4655-8625-a35fa3c5cf87	47eb192d-e1c2-45c0-a018-60acbd4fca0a	\N	e4d1161d-5b7d-4888-94a1-ebb23046681e	SUBMITTED	2025-05-19 22:00:43.961	2025-05-19 22:00:43.961
81472eb8-316b-457c-bc7a-1a9a72185176	87689dd7-5734-41f4-83a3-268c38f593c8	d35e0d81-8abb-45be-921a-3926e4d8afb7	e4d1161d-5b7d-4888-94a1-ebb23046681e	DRAFT	2025-05-19 22:01:45.525	2025-05-19 22:01:45.525
f4108f77-b4d7-4b71-8f53-453efa01171e	d28eb1d1-4968-415c-a671-a94e7974cf56	\N	e4d1161d-5b7d-4888-94a1-ebb23046681e	SUBMITTED	2025-05-20 11:52:16.157	2025-05-20 13:34:48.697
fb817403-dc98-42c1-8863-317a93e89f87	87689dd7-5734-41f4-83a3-268c38f593c8	\N	e4d1161d-5b7d-4888-94a1-ebb23046681e	DRAFT	2025-05-20 15:13:14.402	2025-05-20 15:13:14.402
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: akerim
--

COPY public."Category" (id, name, description) FROM stdin;
1fdd7686-3d78-40b9-a3f7-6761b9bbcf69	Culture	Lean culture and leadership dimensions
2cab23ee-cbf0-403d-99f6-6702688b2948	Process	Lean process and tools dimensions
110fe5f8-b1ad-40ef-8e35-ec177d2e6ba4	Strategy	Strategic alignment and governance
f7ef5718-30f5-462d-85b2-0a5ecec3e9f4	Performance	Performance measurement and management
88414851-ce03-4c20-932f-22b73fc16b99	Sustainability	Sustainment and continuous improvement
\.


--
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: akerim
--

COPY public."Company" (id, name, "sectorId") FROM stdin;
87689dd7-5734-41f4-83a3-268c38f593c8	HealthCo	7ba6251b-562a-466e-9748-6edf958e2386
47eb192d-e1c2-45c0-a018-60acbd4fca0a	TechSoft	9366c231-3e98-4e69-ba45-f2af170132fc
d28eb1d1-4968-415c-a671-a94e7974cf56	şirket	9366c231-3e98-4e69-ba45-f2af170132fc
\.


--
-- Data for Name: Department; Type: TABLE DATA; Schema: public; Owner: akerim
--

COPY public."Department" (id, name, "companyId") FROM stdin;
d35e0d81-8abb-45be-921a-3926e4d8afb7	Clinical Operations	87689dd7-5734-41f4-83a3-268c38f593c8
1ddb9f3a-5f12-41b4-8b7a-6088ee8c79f4	Administrative	87689dd7-5734-41f4-83a3-268c38f593c8
5549fc2b-c38c-42cd-8240-0a19f643610a	Development	47eb192d-e1c2-45c0-a018-60acbd4fca0a
b371cebc-8a62-43ff-81c3-c0d1b8dfc255	QA	47eb192d-e1c2-45c0-a018-60acbd4fca0a
612bba41-8311-4d12-8639-d1d4ecf7825e	sim	d28eb1d1-4968-415c-a671-a94e7974cf56
\.


--
-- Data for Name: Dimension; Type: TABLE DATA; Schema: public; Owner: akerim
--

COPY public."Dimension" (id, name, description, "categoryId") FROM stdin;
e2a5ce07-95e6-43d6-9661-b9725224ea14	Leadership Commitment	Active support and advocacy for Lean principles by leadership.	1fdd7686-3d78-40b9-a3f7-6761b9bbcf69
0d4c96ba-2310-4845-be17-18ac2649ba17	Coaching & Role Modeling	Leaders and managers demonstrate and coach Lean behaviors.	1fdd7686-3d78-40b9-a3f7-6761b9bbcf69
7b93928d-7124-4178-81ba-7fd3e8c44b5f	Lean Mindset Adoption	Organization-wide adoption of Lean thinking and continuous improvement.	1fdd7686-3d78-40b9-a3f7-6761b9bbcf69
92201d62-545e-4e6a-8090-8bd9ae5dede4	Employee Empowerment	Employees are trusted and enabled to contribute to improvements.	1fdd7686-3d78-40b9-a3f7-6761b9bbcf69
0bd54a90-bb87-475f-b0b2-0304d193f079	Psychological Safety	Safe environment for open discussion and experimentation.	1fdd7686-3d78-40b9-a3f7-6761b9bbcf69
77a2a2d3-b62a-4ceb-960c-effe280afb58	Cross-Level Communication	Open communication between all organizational levels.	1fdd7686-3d78-40b9-a3f7-6761b9bbcf69
02c5352b-aac5-441e-ac61-389327b36699	Lean Training and Education	Providing Lean concepts and skills training for all staff.	1fdd7686-3d78-40b9-a3f7-6761b9bbcf69
795e95da-bf34-4d5a-bdb7-5c1b3abbdf4d	Recognition and Celebration	Recognition of Lean achievements to reinforce positive behaviors.	1fdd7686-3d78-40b9-a3f7-6761b9bbcf69
062d519e-84bc-4b0d-afbd-9380ba6efe74	Change Management Readiness	Preparation and support for Lean-driven organizational changes.	1fdd7686-3d78-40b9-a3f7-6761b9bbcf69
8f6ac78f-a85f-4db1-aa13-4358d9889307	Daily Problem-Solving Culture	Continuous, small-scale problem-solving is part of daily work.	1fdd7686-3d78-40b9-a3f7-6761b9bbcf69
20b17ce3-1ba2-492d-bf8a-d0825732f30d	Team Engagement in Improvement	Active participation of teams in identifying and implementing improvements.	1fdd7686-3d78-40b9-a3f7-6761b9bbcf69
7a3a14ee-f7fb-4b79-bbd6-1cae83547035	Value Stream Mapping	Visualizing and analyzing workflows to identify waste and value.	2cab23ee-cbf0-403d-99f6-6702688b2948
ee620d7c-7967-4480-9159-247922f818d0	Process Flow Efficiency	Designing processes to minimize delays, bottlenecks, and waste.	2cab23ee-cbf0-403d-99f6-6702688b2948
8c561260-700e-4367-a737-cc871d0464db	Standard Work / SOPs	Establishing and following standardized work procedures.	2cab23ee-cbf0-403d-99f6-6702688b2948
488ed678-2de4-40dc-8d90-3edc49dd0018	Visual Management	Using visual tools for real-time information sharing and control.	2cab23ee-cbf0-403d-99f6-6702688b2948
5033963a-c115-45f0-9aab-9515ba86c71d	5S Implementation	Organizing workspaces using 5S (Sort, Set, Shine, Standardize, Sustain).	2cab23ee-cbf0-403d-99f6-6702688b2948
dcde670c-8967-4ff9-ae82-ac858b346e0a	Kanban/Pull Systems	Visual boards and pull-based systems to optimize workflow.	2cab23ee-cbf0-403d-99f6-6702688b2948
feda22e4-33da-4a6e-be71-6e70bf6629fd	Quick Changeover (SMED)	Reducing time and effort needed to switch tasks or projects.	2cab23ee-cbf0-403d-99f6-6702688b2948
f6bafa2b-58dc-4dcf-a14f-7f8d79af5de0	Error-Proofing (Poka-Yoke)	Designing processes to prevent or quickly detect errors.	2cab23ee-cbf0-403d-99f6-6702688b2948
5c0f18fb-5356-42bf-8ba8-7af409188bd8	Process Transparency	Ensuring process steps, status, and issues are visible to all.	2cab23ee-cbf0-403d-99f6-6702688b2948
e46f9477-7978-4478-ae4a-0ce184784132	Quality-at-Source	Embedding quality checks within the process to catch issues early.	2cab23ee-cbf0-403d-99f6-6702688b2948
5b7d0a11-2cee-4f9c-bd13-41a906556df2	Level Loading / Heijunka	Smoothing work to avoid peaks and valleys in flow.	2cab23ee-cbf0-403d-99f6-6702688b2948
f43ffdbb-6f21-41e2-b632-085c54a3a017	TPM (Total Productive Maintenance)	Proactive maintenance of equipment and systems for reliability.	2cab23ee-cbf0-403d-99f6-6702688b2948
76150fde-d123-4cd9-8b08-45f86005e634	End-to-End Value Stream Integration	Connecting all teams and steps for seamless value delivery.	2cab23ee-cbf0-403d-99f6-6702688b2948
fbfbcc6a-7100-4b77-9d01-390a1f934b72	Waste Identification and Elimination	Finding and removing activities that don't add value.	2cab23ee-cbf0-403d-99f6-6702688b2948
3ce2329c-7ba9-4e36-94b4-7a1d35644df6	Handoffs and Queue Reduction	Reducing process handoffs and waiting times.	2cab23ee-cbf0-403d-99f6-6702688b2948
23817509-c27c-47a6-af8b-3a75376a915a	Documentation Discipline	Maintaining accurate, up-to-date documentation for consistency.	2cab23ee-cbf0-403d-99f6-6702688b2948
b8186bad-6675-419f-b78a-d4c1a08ca69f	Digitization of Workflows	Automating and digitizing processes for efficiency.	2cab23ee-cbf0-403d-99f6-6702688b2948
2d5a99f8-322b-43e2-ab38-8aba7e02e8ae	Inventory Management	Efficiently controlling and tracking inventory or work items.	2cab23ee-cbf0-403d-99f6-6702688b2948
ec8ac10f-c10c-4ff2-95d9-da990ae2b4a2	Supplier Integration	Collaborating with suppliers to apply Lean principles upstream.	2cab23ee-cbf0-403d-99f6-6702688b2948
48103a2b-2e31-4001-9f8e-66ebeec5f84e	Customer Focus in Processes	Designing processes to maximize customer value.	2cab23ee-cbf0-403d-99f6-6702688b2948
dfd27eb0-8d33-471e-8d3a-06d2ed158ef0	Lean Integrated into Corporate Strategy	Aligning Lean principles with business strategy.	110fe5f8-b1ad-40ef-8e35-ec177d2e6ba4
73aad573-76aa-43a0-9063-3501390d387c	Hoshin Kanri or Strategy Deployment	Cascading strategic goals throughout the organization.	110fe5f8-b1ad-40ef-8e35-ec177d2e6ba4
f3a017de-5501-4e00-9d41-1e4538574db7	Policy Deployment	Translating strategy into actionable policies at every level.	110fe5f8-b1ad-40ef-8e35-ec177d2e6ba4
b4191d07-1030-465d-b8bb-a3cfa60884af	Alignment Across Functions	Coordinating Lean efforts across departments and teams.	110fe5f8-b1ad-40ef-8e35-ec177d2e6ba4
c90625cb-5cd6-4c32-badc-a36e0a46e2e2	Governance and Accountability	Clear roles and oversight for Lean initiatives.	110fe5f8-b1ad-40ef-8e35-ec177d2e6ba4
901731b0-42b9-401d-8c81-4c8b6a0d079e	Leadership Succession Planning	Ensuring future leaders support and sustain Lean.	110fe5f8-b1ad-40ef-8e35-ec177d2e6ba4
e4e17b92-c77a-47d2-9261-ee81d2551ed2	Risk Management	Identifying and mitigating risks in Lean adoption.	110fe5f8-b1ad-40ef-8e35-ec177d2e6ba4
2b65a306-c3e1-43b8-932d-36e0dc54c04e	KPI Definition and Alignment	Defining metrics aligned with Lean objectives.	f7ef5718-30f5-462d-85b2-0a5ecec3e9f4
e4a30c23-f8d8-43fe-9aa3-d8c6b8777824	Daily Management Systems	Regular routines and tools for process tracking and improvement.	f7ef5718-30f5-462d-85b2-0a5ecec3e9f4
58535f3c-a9a4-4140-8f9e-ba9be09fd960	Performance Reviews	Periodic review of Lean progress and outcomes.	f7ef5718-30f5-462d-85b2-0a5ecec3e9f4
f9e4db45-4fb2-42e7-aedb-b855c3a40009	Root Cause Analysis	Thoroughly investigating and addressing underlying problems.	f7ef5718-30f5-462d-85b2-0a5ecec3e9f4
0abd0641-af52-4ac9-ad2e-de4e1c3417c6	Continuous Monitoring	Ongoing process and metric tracking for early detection.	f7ef5718-30f5-462d-85b2-0a5ecec3e9f4
091b944c-5190-4f3e-9d63-e956c753bd25	Dashboards and Metrics	Visual displays of key performance indicators.	f7ef5718-30f5-462d-85b2-0a5ecec3e9f4
b4cf441b-dd3b-4b01-a399-cbc5c896f7cd	Process Benchmarking	Comparing processes to best-in-class standards.	f7ef5718-30f5-462d-85b2-0a5ecec3e9f4
69490414-4d70-4d6c-ad60-5ce67f13ed0a	Learning from Incidents	Using past mistakes as opportunities for improvement.	f7ef5718-30f5-462d-85b2-0a5ecec3e9f4
f7ca5c03-f8d1-4472-9f3e-2b14bf79a852	Knowledge Sharing Systems	Platforms and processes for sharing Lean knowledge.	88414851-ce03-4c20-932f-22b73fc16b99
9736f206-f827-4a29-bdf7-bcf346d84cc1	Regular Kaizen Events	Ongoing, structured improvement workshops and activities.	88414851-ce03-4c20-932f-22b73fc16b99
8d20be56-545b-4caf-8f6f-8b0e8b48b7c1	Sustaining Improvements	Maintaining and embedding improvements over time.	88414851-ce03-4c20-932f-22b73fc16b99
e2d6ffe4-3d11-4afc-be8f-72fdfe54db9a	Standardization of Improvements	Incorporating successful changes into standard work.	88414851-ce03-4c20-932f-22b73fc16b99
23420937-ed1b-42a6-837d-204fb69daa08	Audit and Review Systems	Routine checks to ensure Lean processes are maintained.	88414851-ce03-4c20-932f-22b73fc16b99
89ced00c-3ca3-4633-88a5-6ca7aae01968	Continuous Improvement Mindset	A culture of ongoing improvement and innovation.	88414851-ce03-4c20-932f-22b73fc16b99
e704cd9d-8f5d-49d0-bdfc-ab39447f45f3	Coaching for Sustainment	Continued coaching to maintain Lean practices.	88414851-ce03-4c20-932f-22b73fc16b99
04d4a496-a5a9-423f-aa7b-472fc42dce7d	Lean Knowledge Retention	Capturing and retaining Lean expertise within the organization.	88414851-ce03-4c20-932f-22b73fc16b99
1f0748b2-06f1-4a41-a8e4-3e5dc99ab838	Talent Development for Lean	Building Lean capabilities through talent growth.	88414851-ce03-4c20-932f-22b73fc16b99
285455c6-23b9-462d-b798-cf308a786fd2	Environmental Sustainability	Applying Lean to reduce environmental impact and waste.	88414851-ce03-4c20-932f-22b73fc16b99
18f93409-11df-4885-a3dc-64acda991451	Community and Stakeholder Engagement	Involving community and stakeholders in Lean transformation.	88414851-ce03-4c20-932f-22b73fc16b99
\.


--
-- Data for Name: Evidence; Type: TABLE DATA; Schema: public; Owner: akerim
--

COPY public."Evidence" (id, "assessmentId", "dimensionId", "fileUrl", "fileType", "uploadedById", notes, "uploadedAt") FROM stdin;
b07494f6-90d6-4052-9cc6-6fd96388dd67	fcccf485-0fa8-4192-b585-94d5ddca5528	e2a5ce07-95e6-43d6-9661-b9725224ea14	https://example.com/evidence/leadership_gemba_walk.jpg	image/jpeg	370fb625-ebc2-44e6-bb9f-6ab9a9240a66	Photo of leadership Gemba walk.	2025-05-19 21:03:08.951
\.


--
-- Data for Name: MaturityDescriptor; Type: TABLE DATA; Schema: public; Owner: akerim
--

COPY public."MaturityDescriptor" (id, "dimensionId", "sectorId", level, description) FROM stdin;
c7b1d463-b04d-4667-a26f-c4c3e13d1228	e2a5ce07-95e6-43d6-9661-b9725224ea14	9366c231-3e98-4e69-ba45-f2af170132fc	1	Leadership involvement in Lean or Agile practices is minimal, with limited understanding or strategic support. Decisions are mostly reactive, and improvement efforts lack clear sponsorship. Communication about Lean principles is rare or inconsistent, causing confusion among teams. Leadership tends to focus on project delivery over process improvement. Employees often see Lean or Agile as management fads rather than core practices.
72916024-7a80-44f3-8bd8-21042a463747	e2a5ce07-95e6-43d6-9661-b9725224ea14	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some IT leaders attend Lean or Agile training and support pilot projects in isolated teams. Engagement remains inconsistent and often driven by individual champions rather than organizational mandate. Communication improves but is typically limited to select groups. Leadership begins to recognize the value of continuous improvement but struggles to scale it. Teams have mixed perceptions of Lean/Agile relevance.
f3c12c73-43aa-4ff8-8510-1332c0bc2128	e2a5ce07-95e6-43d6-9661-b9725224ea14	9366c231-3e98-4e69-ba45-f2af170132fc	3	Leadership actively sponsors Lean and Agile initiatives, aligning them with strategic IT goals. Regular communication and involvement in retrospectives or improvement cycles are evident. Leaders set clear expectations and allocate resources to support continuous improvement. Engagement cascades beyond project teams into departments. Leadership drives a culture of learning and adaptation.
966b500d-1bd8-49dd-a7cc-fd1ae48242db	e2a5ce07-95e6-43d6-9661-b9725224ea14	9366c231-3e98-4e69-ba45-f2af170132fc	4	Lean and Agile thinking are embedded in leadership behaviors and decision-making across IT functions. Leaders coach teams, participate in continuous improvement events, and model desired mindsets. Improvement goals are integrated into performance reviews and strategic planning. Leadership fosters cross-team collaboration and innovation. Lean/Agile principles shape governance and investment decisions.
aed63e79-4238-4032-a7f2-e04a08d74015	e2a5ce07-95e6-43d6-9661-b9725224ea14	9366c231-3e98-4e69-ba45-f2af170132fc	5	Leadership fully owns Lean and Agile transformations as strategic priorities, driving sustained cultural change. They empower all levels to innovate and improve, supported by transparent metrics and agile governance. Leaders champion external benchmarking and knowledge sharing. Continuous learning and adaptation are deeply ingrained. Leadership is recognized for driving IT excellence and agility.
591e4c19-294d-4d9e-8e6c-3f4133b6f3b4	0d4c96ba-2310-4845-be17-18ac2649ba17	9366c231-3e98-4e69-ba45-f2af170132fc	1	Coaching in Lean and Agile practices is scarce or absent. Role models of continuous improvement are limited to a few individuals. Feedback tends to be corrective rather than developmental. Teams lack guidance on applying Lean/Agile tools effectively. Coaching is informal and inconsistent.
1b00d4af-3ac2-4e9e-b801-2e47b4d44a24	0d4c96ba-2310-4845-be17-18ac2649ba17	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some Agile coaches or Lean champions emerge, providing occasional support and guidance. Coaching is reactive, often limited to project phases or specific issues. Role modeling improves but is localized. Teams begin to appreciate coaching but experience variability in quality. Coaching frameworks are undeveloped.
da017a22-c32e-4e5b-93cb-343b5e868481	0d4c96ba-2310-4845-be17-18ac2649ba17	9366c231-3e98-4e69-ba45-f2af170132fc	3	Coaching is integrated into team routines, with dedicated Agile coaches or Lean facilitators supporting multiple projects. Role models consistently demonstrate Lean/Agile behaviors. Coaching includes facilitation of retrospectives, problem-solving, and skills development. Feedback is constructive and focused on growth. Coaching effectiveness is monitored.
8e6542de-f6d7-497b-8602-ee24af4369f5	0d4c96ba-2310-4845-be17-18ac2649ba17	9366c231-3e98-4e69-ba45-f2af170132fc	4	Coaching and role modeling are institutionalized, with widespread capability across IT teams. Leaders and coaches collaborate to build capacity and sustain practices. Peer coaching and communities of practice flourish. Coaching is proactive, data-informed, and linked to performance improvement. Role modeling drives cultural norms.
b79c4305-ed6b-49d6-a6db-bceebb0266c6	0d4c96ba-2310-4845-be17-18ac2649ba17	9366c231-3e98-4e69-ba45-f2af170132fc	5	Coaching is a core competency embedded at all organizational levels, fostering a high-performing Lean/Agile culture. Continuous development of coaching skills is prioritized. Coaching outcomes influence talent management and leadership development. The organization is recognized for exemplary coaching and cultural leadership in IT. Coaching innovation sustains competitive advantage.
09253669-4962-4532-9314-9b89831628b0	7b93928d-7124-4178-81ba-7fd3e8c44b5f	9366c231-3e98-4e69-ba45-f2af170132fc	1	Lean and Agile mindsets are poorly understood or inconsistently applied. Teams focus on delivering outputs rather than optimizing flow or eliminating waste. Continuous improvement is sporadic and lacks strategic alignment. Resistance to Lean/Agile principles exists. Mindset change efforts are minimal.
083ce42a-a98a-439f-8723-63b3a0c956ba	7b93928d-7124-4178-81ba-7fd3e8c44b5f	9366c231-3e98-4e69-ba45-f2af170132fc	2	Awareness of Lean/Agile mindsets grows through training and pilot adoption. Teams begin to recognize the importance of collaboration, iterative delivery, and feedback. Mindset adoption varies across teams and projects. Improvements are mostly event-driven. Skepticism and cultural barriers remain.
8b9a8d72-adce-4e47-b1bf-484fbab79c40	7b93928d-7124-4178-81ba-7fd3e8c44b5f	9366c231-3e98-4e69-ba45-f2af170132fc	3	Lean/Agile mindsets are actively embraced by most IT teams, influencing daily behaviors and decision-making. Teams apply iterative approaches, prioritize customer value, and focus on waste reduction. Continuous improvement becomes habitual. Leadership and coaching reinforce mindset shifts. Mindset alignment supports collaboration and innovation.
d2fd4ec6-fd7e-489a-bb79-4369f14afa85	7b93928d-7124-4178-81ba-7fd3e8c44b5f	9366c231-3e98-4e69-ba45-f2af170132fc	4	Lean/Agile mindsets are deeply embedded across IT, driving proactive problem-solving, learning, and adaptability. Teams continuously challenge assumptions and experiment with new ways of working. Mindset adoption spans cross-functional teams and partners. Leadership models and reinforces mindset consistently. Mindset underpins strategic agility.
aecfd1f9-41c3-4cb9-829a-16dc7ef8ccb1	7b93928d-7124-4178-81ba-7fd3e8c44b5f	9366c231-3e98-4e69-ba45-f2af170132fc	5	Lean/Agile mindsets define IT culture and identity, enabling rapid adaptation and innovation. Mindset change is sustained through continuous learning, reflection, and external engagement. The organization benchmarks itself as a leader in Lean/Agile cultural transformation. Mindset drives competitive differentiation and business value.
cc25800b-3acd-477a-89ba-87d10a82933b	92201d62-545e-4e6a-8090-8bd9ae5dede4	9366c231-3e98-4e69-ba45-f2af170132fc	1	Decision-making is centralized, with limited autonomy for developers or teams. Change requests and process improvements require multiple approvals. Employees feel disempowered to experiment or innovate. Suggestion mechanisms are weak or absent. Accountability is top-down.
d1a4e2ba-3446-4729-a669-972f33d6e9ea	92201d62-545e-4e6a-8090-8bd9ae5dede4	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some teams gain autonomy to make decisions within defined boundaries. Employees participate in retrospectives and improvement discussions but lack authority to implement changes broadly. Empowerment is inconsistent across teams. Management begins to delegate responsibility. Barriers to empowerment remain.
8759e2e9-b0b3-4de3-8526-8c28302570ee	92201d62-545e-4e6a-8090-8bd9ae5dede4	9366c231-3e98-4e69-ba45-f2af170132fc	3	Teams are empowered to make decisions about their work, process improvements, and tools. Ownership of outcomes is clearly defined. Continuous improvement is part of team responsibilities. Management supports and trusts empowered teams. Empowerment extends across departments.
63790bc4-59df-4c6d-810d-d38456aeb221	92201d62-545e-4e6a-8090-8bd9ae5dede4	9366c231-3e98-4e69-ba45-f2af170132fc	4	Employee empowerment is widespread, with distributed authority and accountability. Teams self-organize and prioritize improvements aligned with strategic goals. Management acts as enabler and coach rather than controller. Empowerment is supported by transparent metrics and communication. Employees are motivated to innovate.
0683026f-e058-4d7c-ac4e-df8b448f5783	92201d62-545e-4e6a-8090-8bd9ae5dede4	9366c231-3e98-4e69-ba45-f2af170132fc	5	Empowerment is a foundational principle, driving innovation, agility, and engagement. Employees at all levels initiate and lead improvements, supported by a culture of psychological safety. Decision-making is decentralized, aligned with organizational purpose. Empowerment is measured and continuously enhanced. The organization excels in enabling autonomy and accountability.
9989cd13-1454-4d33-96e0-2ad0cf7ca497	0bd54a90-bb87-475f-b0b2-0304d193f079	9366c231-3e98-4e69-ba45-f2af170132fc	1	Fear of blame or failure inhibits open communication and experimentation. Mistakes are punished or hidden. Feedback is limited or defensive. Team members hesitate to raise concerns or challenge decisions. Psychological safety is low.
dfde2328-f3a5-4693-9ec3-a1fa9ff23a44	0bd54a90-bb87-475f-b0b2-0304d193f079	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some leaders encourage open dialogue and learning from mistakes. Psychological safety varies by team or leader. Retrospectives begin to address behaviors and collaboration. Fear and defensiveness persist in parts of the organization. Trust is uneven.
df419dad-88eb-4c62-897b-884b6a5ab665	0bd54a90-bb87-475f-b0b2-0304d193f079	9366c231-3e98-4e69-ba45-f2af170132fc	3	Teams foster safe environments where feedback is constructive and mistakes are treated as learning opportunities. Leaders model vulnerability and openness. Psychological safety is recognized as critical to performance. Teams address interpersonal dynamics proactively. Trust and respect increase.
2412ea01-efe2-4f56-8254-398f9bec42fe	0bd54a90-bb87-475f-b0b2-0304d193f079	9366c231-3e98-4e69-ba45-f2af170132fc	4	Psychological safety is deeply embedded in IT teams and leadership behaviors. Open communication and experimentation are norms. Conflict is managed constructively. Feedback flows freely in all directions. Teams recover quickly from failures and innovate confidently.
e1371db3-2e7b-4b23-bd9e-765bd7800968	0bd54a90-bb87-475f-b0b2-0304d193f079	9366c231-3e98-4e69-ba45-f2af170132fc	5	Psychological safety is a cultural hallmark enabling continuous learning and innovation. The organization actively cultivates and measures safety. Leadership coaching supports safe risk-taking and challenge. Psychological safety extends across teams, departments, and partners. It drives resilience and agility.
865aed4e-7a28-4f21-aa67-c14f6c0712f1	77a2a2d3-b62a-4ceb-960c-effe280afb58	9366c231-3e98-4e69-ba45-f2af170132fc	1	Communication between leadership, managers, and teams is limited and often ineffective. Information flow is primarily top-down, with little feedback or dialogue. Silos hinder collaboration. Communication tools and practices are inconsistent or outdated. Misalignment and misunderstandings are common.
75b0e472-d7fd-454d-90e7-67f75ac9ac3c	77a2a2d3-b62a-4ceb-960c-effe280afb58	9366c231-3e98-4e69-ba45-f2af170132fc	2	Communication channels improve with scheduled meetings, newsletters, or digital platforms. Some feedback mechanisms are introduced but are sporadic. Cross-level communication remains unstructured and variable. Teams receive information but rarely influence decisions. Transparency is partial.
b0a98381-f551-47ff-8cd5-62490593c3e5	77a2a2d3-b62a-4ceb-960c-effe280afb58	9366c231-3e98-4e69-ba45-f2af170132fc	3	Structured communication routines exist, including daily stand-ups, sprint reviews, and leadership updates. Two-way communication is fostered, enabling feedback and alignment. Collaboration tools support information sharing. Communication promotes shared understanding of goals and challenges. Cross-level dialogue improves trust.
8f2ba6c0-d20f-429e-b9a7-e91682e96f11	77a2a2d3-b62a-4ceb-960c-effe280afb58	9366c231-3e98-4e69-ba45-f2af170132fc	4	Communication is proactive, transparent, and integrated across levels and teams. Digital collaboration platforms enable real-time interaction and knowledge sharing. Leaders actively solicit and respond to feedback. Communication supports coordination, problem-solving, and innovation. Organizational alignment is strong.
03fd1a80-1791-4a51-a3ac-908f6b4e6303	77a2a2d3-b62a-4ceb-960c-effe280afb58	9366c231-3e98-4e69-ba45-f2af170132fc	5	Communication is seamless, open, and multi-directional, fostering a highly engaged and aligned IT organization. Advanced collaboration technologies and practices enable global coordination. Communication culture supports psychological safety and continuous learning. The organization benchmarks and shares communication best practices externally. Communication excellence drives agility and performance.
545e6d1b-daa0-4cce-a889-6f14fd0d4e5b	02c5352b-aac5-441e-ac61-389327b36699	9366c231-3e98-4e69-ba45-f2af170132fc	1	Lean and Agile training is minimal or absent. Employees lack understanding of principles, tools, and practices. Learning occurs ad hoc and is inconsistent. Training resources and support are limited. Capability gaps hinder Lean adoption.
e8da8d22-207f-4f98-84b3-5bbacb46f57f	02c5352b-aac5-441e-ac61-389327b36699	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic Lean/Agile training is introduced for some employees, often focused on awareness or tool usage. Training is inconsistent and varies by team. Formal curricula and ongoing learning opportunities are limited. Coaching supplements formal training unevenly. Employee engagement with training is mixed.
94bf44f3-3bcb-4d23-ba64-cc1c4fbb5a67	02c5352b-aac5-441e-ac61-389327b36699	9366c231-3e98-4e69-ba45-f2af170132fc	3	Comprehensive Lean/Agile training programs exist with role-based curricula for developers, testers, and leaders. Training combines classroom, online, and on-the-job learning. Coaching and mentoring support skill development. Training effectiveness is evaluated and improved. Learning is linked to performance goals.
6eead624-feef-49ea-97f4-7cceb550f872	8c561260-700e-4367-a737-cc871d0464db	9366c231-3e98-4e69-ba45-f2af170132fc	5	Standard work is adaptive, data-driven, and continuously refined. Digital SOPs support easy access and real-time updates. Training and coaching sustain high compliance. Standard work extends to partners and suppliers. It enables high reliability, innovation, and operational excellence.
d17c70fe-f15e-46dc-a70b-b69f5ccba507	02c5352b-aac5-441e-ac61-389327b36699	9366c231-3e98-4e69-ba45-f2af170132fc	4	Training and education are integrated into talent development and career pathways. Continuous learning culture supports self-directed and peer learning. Advanced training covers Lean leadership, innovation, and change management. Technology-enabled learning platforms enhance access and personalization. Training outcomes influence organizational capability and results.
86b8b198-bf24-4666-b426-4b5d3c1d6311	02c5352b-aac5-441e-ac61-389327b36699	9366c231-3e98-4e69-ba45-f2af170132fc	5	Lean and Agile education is strategic, continuous, and adaptive. The organization fosters learning agility and innovation through partnerships and benchmarking. Learning analytics guide personalized development. Training is embedded in daily work and leadership practices. The organization is recognized for excellence in Lean/Agile capability building.
b86adb2f-fbbb-4632-a630-38d631ff846b	795e95da-bf34-4d5a-bdb7-5c1b3abbdf4d	9366c231-3e98-4e69-ba45-f2af170132fc	1	Recognition of Lean/Agile achievements is rare or informal. Contributions to improvement are overlooked. Motivation and morale may be low. Success stories are not shared widely. Recognition lacks structure or consistency.
edf8ed32-78c5-4d29-bacb-4272179e17c8	795e95da-bf34-4d5a-bdb7-5c1b3abbdf4d	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some recognition programs begin, often focused on individual achievements or project milestones. Team celebrations occur but are inconsistent. Communication of successes improves but lacks breadth. Recognition is manager-driven and sporadic. Employee motivation is uneven.
162b8e13-a9b6-4b2b-885c-9880d4db03b8	795e95da-bf34-4d5a-bdb7-5c1b3abbdf4d	9366c231-3e98-4e69-ba45-f2af170132fc	3	Recognition is regular, structured, and includes teams and individuals. Success stories are shared across the organization to build momentum. Peer recognition and formal awards encourage participation. Recognition aligns with Lean/Agile behaviors and outcomes. Engagement and morale improve.
57d3801c-edca-4cc2-8959-f15f1136de07	795e95da-bf34-4d5a-bdb7-5c1b3abbdf4d	9366c231-3e98-4e69-ba45-f2af170132fc	4	Recognition is embedded in performance management and cultural practices. Leaders celebrate and reinforce continuous improvement contributions. Recognition programs are transparent, inclusive, and aligned with strategic goals. Celebrations foster community and shared purpose. Recognition sustains Lean/Agile momentum.
bb2803a3-e986-41fe-b82b-9e1af6d0cfa2	795e95da-bf34-4d5a-bdb7-5c1b3abbdf4d	9366c231-3e98-4e69-ba45-f2af170132fc	5	Recognition is a strategic driver of culture and performance excellence. The organization employs innovative and data-driven recognition methods. Employees are empowered to recognize peers and share success broadly. Recognition extends beyond the organization to partners and customers. Recognition excellence enhances employer brand and competitive advantage.
bcb72072-4923-4d1f-8781-ac989e44c341	062d519e-84bc-4b0d-afbd-9380ba6efe74	9366c231-3e98-4e69-ba45-f2af170132fc	1	Change initiatives lack planning and leadership support. Employees are resistant or fearful of change. Communication and training are minimal. Change efforts are often reactive and fragmented. Change fatigue or failure is common.
081df142-5d5b-4490-bc73-8baa05c43d08	062d519e-84bc-4b0d-afbd-9380ba6efe74	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic change management practices are introduced, including communication plans and training. Some resistance is managed but not systematically. Change readiness varies across teams. Leaders begin to develop change skills. Change management is project-based.
3af315fa-a932-4055-96a3-302cf193ea0f	062d519e-84bc-4b0d-afbd-9380ba6efe74	9366c231-3e98-4e69-ba45-f2af170132fc	3	Structured change management processes support Lean/Agile adoption. Employees receive training and coaching to prepare for changes. Feedback and resistance are actively managed. Change sponsors and champions engage teams. Change readiness improves organization-wide.
e4cad491-2c17-447d-99d2-b5a34a182ef7	062d519e-84bc-4b0d-afbd-9380ba6efe74	9366c231-3e98-4e69-ba45-f2af170132fc	4	Change readiness is integrated into leadership development and business processes. Continuous communication, training, and support foster adaptability. Change impacts are anticipated and mitigated. Employees participate in shaping change. Change management supports strategic agility.
08f6e631-781e-4ddb-bd7e-b8111e2c625e	062d519e-84bc-4b0d-afbd-9380ba6efe74	9366c231-3e98-4e69-ba45-f2af170132fc	5	Change readiness is institutionalized as a core organizational capability. Proactive and predictive approaches enable rapid adaptation. The culture embraces change as opportunity. Change leadership is distributed and data-driven. The organization leads in managing complex transformations.
e08c55e6-6c42-4bdb-9535-f3b516eb5b9f	8f6ac78f-a85f-4db1-aa13-4358d9889307	9366c231-3e98-4e69-ba45-f2af170132fc	1	Problem-solving is ad hoc and reactive, often escalating issues without root cause analysis. Teams rely on firefighting rather than prevention. Problem-solving skills and tools are limited. Documentation and learning from problems are rare. Continuous improvement is absent.
a63dc161-6863-4683-b3cc-8c4a9ba6ccea	8f6ac78f-a85f-4db1-aa13-4358d9889307	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic problem-solving methods are introduced during retrospectives or improvement events. Teams begin documenting and addressing issues but lack consistency. Supervisors lead problem resolution with limited team involvement. Learning is limited and not standardized. Problem-solving remains event-driven.
4e46a155-a3a8-4046-a559-8dcc69b43ccf	8f6ac78f-a85f-4db1-aa13-4358d9889307	9366c231-3e98-4e69-ba45-f2af170132fc	3	Problem-solving is integrated into daily work routines with structured approaches and documentation. Teams apply root cause analysis and Lean tools regularly. Supervisors coach and support problem-solving behaviors. Cross-team collaboration addresses systemic issues. Problem-solving drives incremental improvements.
4739bc83-7805-4f8c-8fef-2cad1443c9fe	8f6ac78f-a85f-4db1-aa13-4358d9889307	9366c231-3e98-4e69-ba45-f2af170132fc	4	Advanced problem-solving and data analytics support proactive identification and resolution of issues. Problem-solving is collaborative, continuous, and linked to strategic goals. Knowledge from problem-solving is shared widely. Teams innovate and prevent recurrence. Problem-solving culture is strong.
1bbd4a9f-548b-470f-96ea-e4bc0d7ca1e3	8f6ac78f-a85f-4db1-aa13-4358d9889307	9366c231-3e98-4e69-ba45-f2af170132fc	5	Problem-solving is a strategic competency leveraging AI, machine learning, and advanced analytics. The organization fosters experimentation and learning from failures. Lessons learned drive innovation and competitive advantage. Problem-solving is embedded in culture and governance. The organization adapts rapidly to complex challenges.
5279b82d-e19e-473f-84ff-33e1ad2743aa	20b17ce3-1ba2-492d-bf8a-d0825732f30d	9366c231-3e98-4e69-ba45-f2af170132fc	1	Team involvement in Lean or Agile initiatives is minimal and often limited to mandatory participation. Employees may feel disengaged or skeptical about the value of continuous improvement. Improvement efforts are mostly driven by management with little grassroots involvement. Communication about improvement goals is sparse or unclear. There is no shared sense of ownership.
cb96d04f-cd12-4b05-87e2-47e4fa0dbb62	20b17ce3-1ba2-492d-bf8a-d0825732f30d	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some teams actively participate in retrospectives and improvement events but engagement varies widely. Employees contribute ideas but lack support or follow-through to implement them. Management begins encouraging participation, but cultural barriers limit widespread involvement. Improvement successes are sporadically shared. Motivation fluctuates.
6d5c71a5-0b91-4372-b0c2-10a629b3ed95	20b17ce3-1ba2-492d-bf8a-d0825732f30d	9366c231-3e98-4e69-ba45-f2af170132fc	3	Teams regularly engage in continuous improvement, applying Lean and Agile practices as part of daily work. Employees take ownership of problem-solving and process optimization within their teams. Collaboration across teams increases. Successes are celebrated and communicated to build momentum. Engagement surveys indicate growing involvement.
2663f6a7-f7bc-411a-a399-2c078ee4a6ac	20b17ce3-1ba2-492d-bf8a-d0825732f30d	9366c231-3e98-4e69-ba45-f2af170132fc	4	Engagement is high and widespread, with empowered teams driving improvement initiatives aligned with organizational goals. Cross-team and cross-functional collaboration is common. Employees are motivated by meaningful recognition and growth opportunities. Leadership actively supports and coaches engagement. Continuous improvement becomes part of the culture.
909dc538-955f-4ef4-86e7-3a7c2e96bf02	20b17ce3-1ba2-492d-bf8a-d0825732f30d	9366c231-3e98-4e69-ba45-f2af170132fc	5	Team engagement is a strategic asset fueling innovation and operational excellence. Teams autonomously initiate and lead improvements with broad organizational support. Engagement is measured, analyzed, and continuously enhanced. Employees are passionate Lean/Agile advocates and culture carriers. The organization excels in sustaining high engagement levels.
441a6869-42e3-4085-942e-e305f394fcd7	7a3a14ee-f7fb-4b79-bbd6-1cae83547035	9366c231-3e98-4e69-ba45-f2af170132fc	1	Value stream mapping (VSM) is unfamiliar or rarely used. Processes are fragmented, with limited visibility into end-to-end workflows. Bottlenecks and waste remain hidden. Improvement efforts target isolated tasks. Lack of process transparency limits problem-solving.
65cd9b23-ba57-4723-be01-9d0cb5b30e53	7a3a14ee-f7fb-4b79-bbd6-1cae83547035	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some teams begin to apply VSM to specific projects or processes. Maps are often incomplete or outdated. Frontline involvement is limited. Awareness of process flow and waste increases but application is inconsistent. VSM results are not always linked to action plans.
cacd4231-c1dd-49b4-8e3f-1a425e070bbd	7a3a14ee-f7fb-4b79-bbd6-1cae83547035	9366c231-3e98-4e69-ba45-f2af170132fc	3	VSM is regularly used across teams to visualize workflows, identify bottlenecks, and prioritize improvements. Cross-functional teams collaborate in mapping exercises. Maps are maintained and updated as living documents. Improvement initiatives are guided by VSM insights. Transparency improves process understanding.
828c218e-8e16-48ad-82c1-6e9cc31dc9be	7a3a14ee-f7fb-4b79-bbd6-1cae83547035	9366c231-3e98-4e69-ba45-f2af170132fc	4	VSM is integrated into organizational improvement frameworks. Value streams extend across departments and include upstream and downstream partners. Data-driven insights enrich maps, enabling predictive analysis. Continuous review and refinement of value streams support strategic decisions. VSM drives alignment and collaboration.
68d3561e-7903-47a3-a699-c4d9af0c3e78	7a3a14ee-f7fb-4b79-bbd6-1cae83547035	9366c231-3e98-4e69-ba45-f2af170132fc	5	VSM is embedded in IT culture and workflows, supported by real-time data visualization and analytics. End-to-end value streams include external partners and customers. Value stream innovation drives competitive differentiation. The organization shares VSM best practices externally and leads industry standards. Continuous flow and value delivery are optimized dynamically.
290c62b8-9cce-4cb9-a2a3-9ad6bfa17c6a	ee620d7c-7967-4480-9159-247922f818d0	9366c231-3e98-4e69-ba45-f2af170132fc	1	Process flows are ad hoc and inefficient, often causing delays, rework, and bottlenecks. Handoffs between teams are unclear or inconsistent. Siloed working inhibits flow and collaboration. Work prioritization is unclear. Customer impact is often negative.
a7df5127-51ee-4b9c-9a42-c38357a17011	ee620d7c-7967-4480-9159-247922f818d0	9366c231-3e98-4e69-ba45-f2af170132fc	2	Process flows improve with basic standardization and better handoffs in some teams. Workflow visualization tools such as Kanban boards start to be used. Cross-team communication improves but is uneven. Bottlenecks are identified but not always resolved. Efficiency gains are localized.
a91dbab9-efa9-49fa-b80e-0e3bc744e3a5	ee620d7c-7967-4480-9159-247922f818d0	9366c231-3e98-4e69-ba45-f2af170132fc	3	Process flows are actively managed and optimized using Lean and Agile principles. Work is prioritized based on value and dependencies. Visual management supports flow transparency. Teams collaborate to remove bottlenecks and smooth delivery. Customer outcomes improve.
4a1f3a0e-7015-445f-9569-088eb8ba9c4e	ee620d7c-7967-4480-9159-247922f818d0	9366c231-3e98-4e69-ba45-f2af170132fc	4	Process flow efficiency is integrated across teams and functions. Workloads are leveled and synchronized with business priorities. Continuous monitoring and automation optimize flow. Feedback loops enable rapid adjustment to changing demands. Flow efficiency is a key performance indicator.
c676252e-8bda-446d-b4bb-c12b6b45d623	ee620d7c-7967-4480-9159-247922f818d0	9366c231-3e98-4e69-ba45-f2af170132fc	5	Near-perfect process flow is sustained through advanced automation, AI, and real-time coordination. Cross-organizational flow integration with partners enhances responsiveness. Continuous innovation improves flow adaptively. Flow excellence drives customer satisfaction and competitive advantage.
6d681c4f-ae2a-4dcf-b30e-784b81bd2559	8c561260-700e-4367-a737-cc871d0464db	9366c231-3e98-4e69-ba45-f2af170132fc	1	Standard work and procedures are limited or undocumented. Teams rely on tribal knowledge and informal practices. Variability and errors are frequent. Training is inconsistent. Process quality suffers.
dd58004a-934c-40f2-a653-50e1cbe515e8	8c561260-700e-4367-a737-cc871d0464db	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some processes are documented with basic SOPs or checklists. Usage is uneven and adherence varies by team. Updates and revisions are irregular. Training on standard work begins but lacks depth. Variability decreases marginally.
0159bf76-ceb5-49ae-9675-42d2283417ab	8c561260-700e-4367-a737-cc871d0464db	9366c231-3e98-4e69-ba45-f2af170132fc	3	Documented standard work covers key IT processes such as deployment, testing, and incident management. Teams regularly follow SOPs, which are reviewed and updated with team input. Training aligns with standards. Audits or peer reviews monitor compliance. Standard work supports quality and efficiency.
b49ab83d-72f7-4069-aeb7-4fb33b7f358d	8c561260-700e-4367-a737-cc871d0464db	9366c231-3e98-4e69-ba45-f2af170132fc	4	Standard work is comprehensive, integrated with digital tools, and embedded into daily routines. Continuous improvement updates SOPs dynamically. Deviations trigger immediate review and corrective actions. Training is continuous and role-based. Standard work fosters consistency and agility.
49556bcc-e623-4d7b-af55-62df19b9faa7	488ed678-2de4-40dc-8d90-3edc49dd0018	9366c231-3e98-4e69-ba45-f2af170132fc	1	Visual management tools are scarce or absent. Teams rely on verbal or textual communication. Visibility into work status and issues is low. Delays and miscommunication are frequent. Problem identification is reactive.
59c1bd49-6cbb-4686-8537-37e9df01ce41	488ed678-2de4-40dc-8d90-3edc49dd0018	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic visual tools such as whiteboards or electronic task boards are introduced in some teams. Work-in-progress and issue status are partially visible. Usage is inconsistent and sometimes manual. Visual management is event-driven rather than continuous. Teams begin to reference visuals.
9d478940-d4e4-423c-aab9-b41499d0ff96	488ed678-2de4-40dc-8d90-3edc49dd0018	9366c231-3e98-4e69-ba45-f2af170132fc	3	Visual management is widely adopted using digital Kanban boards, dashboards, and metrics. Workflows and impediments are visible in real time. Teams use visuals to coordinate work and escalate problems. Visual tools support daily stand-ups and retrospectives. Transparency improves collaboration.
b03154be-47bc-43e4-8e41-c1402fe355a5	488ed678-2de4-40dc-8d90-3edc49dd0018	9366c231-3e98-4e69-ba45-f2af170132fc	4	Visual management is integrated across IT teams and functions, supporting strategic and operational goals. Advanced dashboards provide predictive insights. Leadership uses visual data to coach and make decisions. Visual management drives rapid response and continuous improvement. Visuals are interactive and role-based.
95f723b5-3c4d-479a-b3e6-4bf5a71fe0f0	488ed678-2de4-40dc-8d90-3edc49dd0018	9366c231-3e98-4e69-ba45-f2af170132fc	5	Visual management is embedded enterprise-wide with real-time, interactive, and predictive capabilities. Data visualization tools integrate multiple data sources and stakeholders. Visual culture fosters transparency, empowerment, and innovation. The organization benchmarks and leads visual management best practices. Visuals drive performance excellence.
d0743875-1343-496d-a179-7fb25cdd8d85	5033963a-c115-45f0-9aab-9515ba86c71d	9366c231-3e98-4e69-ba45-f2af170132fc	1	Digital and physical workspaces are cluttered and disorganized, causing inefficiencies. File management, tool usage, and workstation organization are inconsistent. Awareness of 5S principles is low. Workspace optimization is reactive and ad hoc.
a5973260-41dd-4179-84de-0c4eee10aa39	5033963a-c115-45f0-9aab-9515ba86c71d	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some teams begin applying 5S concepts such as sorting files, labeling repositories, and organizing desks. Practices are inconsistent and localized. Training and coaching on 5S start but lack reach. Benefits are recognized but not fully realized.
5bb85422-97d8-4ade-b4aa-d559a0fb2bb2	5033963a-c115-45f0-9aab-9515ba86c71d	9366c231-3e98-4e69-ba45-f2af170132fc	3	5S practices are standardized and routinely applied across IT teams, including digital workspace organization and codebase hygiene. Teams conduct regular audits and continuous improvements. 5S training is embedded in onboarding and development. Workspace efficiency and quality improve.
a7d3ae0e-8101-4c77-bd19-125fb5f19d59	5033963a-c115-45f0-9aab-9515ba86c71d	9366c231-3e98-4e69-ba45-f2af170132fc	4	5S is deeply integrated with Lean/Agile practices and operational excellence programs. Digital tools support sustainment and monitoring. Teams innovate to optimize workflows and eliminate waste. Leadership models and reinforces 5S behaviors. Culture embraces discipline and order.
987d3177-aa45-4a98-b0cd-11d8a0bbcad5	5033963a-c115-45f0-9aab-9515ba86c71d	9366c231-3e98-4e69-ba45-f2af170132fc	5	5S excellence drives continuous innovation and operational agility. Digital and physical workspaces are optimized dynamically using automation and AI. Teams share best practices internally and externally. 5S is a source of pride and competitive differentiation. The organization benchmarks 5S maturity.
6dc68065-69e0-4bad-879f-ad9cb795ee9e	dcde670c-8967-4ff9-ae82-ac858b346e0a	9366c231-3e98-4e69-ba45-f2af170132fc	1	Work management lacks formal pull systems; tasks are assigned in a push manner leading to overload and bottlenecks. Prioritization is unclear and often reactive. Teams struggle with work-in-progress (WIP) limits, causing delays and rework. Workflow visibility is minimal, impairing flow management.
44aeaa9c-73b9-4bab-ac97-c7e920da07d8	dcde670c-8967-4ff9-ae82-ac858b346e0a	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic Kanban boards or task queues are introduced in some teams. Work-in-progress limits begin to be recognized but are inconsistently applied. Prioritization improves but remains ad hoc. Pull concepts are understood by a few but not institutionalized. Teams start to see flow benefits.
297a2f1f-5760-4e51-9c40-842ab8a74306	dcde670c-8967-4ff9-ae82-ac858b346e0a	9366c231-3e98-4e69-ba45-f2af170132fc	3	Kanban and pull systems are broadly implemented with clear WIP limits and prioritized backlogs. Teams use pull signals to manage workload and reduce bottlenecks. Flow metrics like cycle time and lead time are tracked and improved. Collaboration improves across teams managing shared work. Pull systems support sustainable delivery.
90164aa9-9f25-43ba-8b2e-34c14fcec278	dcde670c-8967-4ff9-ae82-ac858b346e0a	9366c231-3e98-4e69-ba45-f2af170132fc	4	Pull systems are integrated across multiple teams and value streams, enabling synchronized workflow management. Advanced visual boards and digital tools provide real-time status and forecasting. Teams dynamically adjust workload based on capacity and demand. Continuous improvement focuses on flow efficiency. Pull systems contribute to predictable and reliable delivery.
f558c0a5-5f36-4e9a-b346-3c888116b9d3	dcde670c-8967-4ff9-ae82-ac858b346e0a	9366c231-3e98-4e69-ba45-f2af170132fc	5	Pull systems are optimized with AI-driven demand forecasting and automatic workflow adjustments. Workflows dynamically adapt to changing priorities and capacity. Pull extends beyond IT to customer and supplier collaboration. Continuous innovation sustains flow optimization. Pull systems are recognized as industry best practice.
33bc7dba-f0d3-47ae-9f19-c66181245dc0	feda22e4-33da-4a6e-be71-6e70bf6629fd	9366c231-3e98-4e69-ba45-f2af170132fc	1	Changeovers such as environment switches, deployments, or role transitions are slow and error-prone. Procedures are undocumented or informal. Change delays affect productivity and quality. Teams lack awareness of quick changeover concepts.
14bb1f3c-e850-46fe-b54b-226c492d7c21	feda22e4-33da-4a6e-be71-6e70bf6629fd	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic SMED concepts are introduced to separate internal and external change tasks. Some standardization and checklists are developed. Improvements reduce changeover times in isolated projects. Awareness grows but application is uneven. Changeover delays remain a challenge.
c2a72888-7151-4dbe-adf3-46cc3e146c42	feda22e4-33da-4a6e-be71-6e70bf6629fd	9366c231-3e98-4e69-ba45-f2af170132fc	3	Standardized and documented changeover procedures are widely adopted. Teams train on quick changeover techniques and apply them consistently. Changeover times reduce significantly, improving deployment frequency and responsiveness. Continuous feedback drives further improvements. Changeovers become predictable and less disruptive.
3bb6ebd0-8390-4074-8838-3ddf784a2ed4	feda22e4-33da-4a6e-be71-6e70bf6629fd	9366c231-3e98-4e69-ba45-f2af170132fc	4	Changeover processes are optimized using automation, scripting, and parallel execution. Procedures are regularly reviewed and improved based on data and operator feedback. Changeovers support agile release cycles and rapid experimentation. Safety and quality are maintained throughout. Changeover excellence is a competitive enabler.
33f41e05-68fc-454c-a2f9-c23b07b4976d	feda22e4-33da-4a6e-be71-6e70bf6629fd	9366c231-3e98-4e69-ba45-f2af170132fc	5	Changeover capability is world-class, leveraging continuous integration/continuous deployment (CI/CD) pipelines, infrastructure as code, and AI-driven automation. Changeovers are near-instantaneous and error-proof. Teams innovate change processes, setting industry standards. Changeover agility drives business responsiveness and innovation speed.
e8430152-0db5-42fe-9bee-f697fe9c271e	f6bafa2b-58dc-4dcf-a14f-7f8d79af5de0	9366c231-3e98-4e69-ba45-f2af170132fc	1	Errors and defects such as bugs, misconfigurations, or documentation mistakes occur frequently and are detected late. Prevention mechanisms are absent. Issue resolution is reactive and time-consuming. Quality assurance relies heavily on manual inspection.
bc3b9e46-774e-4f29-a7cf-378e696f0b43	f6bafa2b-58dc-4dcf-a14f-7f8d79af5de0	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic error-proofing measures like code reviews, checklists, and automated tests are introduced. Awareness of common errors increases. Some defect prevention reduces rework. Implementation of poka-yoke is limited and inconsistent. Quality improves but defects persist.
54507424-7087-4cb5-91d8-186ad3f73256	f6bafa2b-58dc-4dcf-a14f-7f8d79af5de0	9366c231-3e98-4e69-ba45-f2af170132fc	3	Error-proofing is embedded into development and operational processes with automated testing, linting, and deployment gates. Teams actively design error prevention into workflows. Root cause analysis drives targeted poka-yoke improvements. Quality metrics improve steadily. Defects and incidents decline.
1cc546f2-2d00-40da-b89b-54a59c8c30c4	f6bafa2b-58dc-4dcf-a14f-7f8d79af5de0	9366c231-3e98-4e69-ba45-f2af170132fc	4	Advanced error-proofing uses AI-assisted code analysis, automated rollback, and self-healing systems. Error-proofing extends to documentation, configuration, and monitoring. Teams collaborate proactively to prevent errors system-wide. Quality assurance is continuous and integrated. Error-proofing drives reliability and customer satisfaction.
6a522f48-43b4-49a3-acc1-0ac8cbfce09b	f6bafa2b-58dc-4dcf-a14f-7f8d79af5de0	9366c231-3e98-4e69-ba45-f2af170132fc	5	Error-proofing is predictive and adaptive, leveraging machine learning to detect and prevent defects before deployment. Systems self-correct and learn from anomalies. Error-proofing innovation sustains near-zero defect rates. Quality is built-in and continuously improved. The organization sets benchmarks in IT quality assurance.
6ef0b745-10ef-41e6-b10c-86f1200503f0	5c0f18fb-5356-42bf-8ba8-7af409188bd8	9366c231-3e98-4e69-ba45-f2af170132fc	1	Processes are opaque with limited visibility into progress, risks, or issues. Stakeholders often rely on informal updates or assumptions. Delays and bottlenecks go unnoticed until problems escalate. Documentation is incomplete or inaccessible. Communication gaps create uncertainty.
de62a1c4-1976-4e38-b0ab-de6242fdc7c9	5c0f18fb-5356-42bf-8ba8-7af409188bd8	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some teams use dashboards, reports, or project management tools to provide partial visibility. Updates occur regularly but may be delayed or incomplete. Transparency varies between projects and teams. Stakeholders gain limited insight into process status and risks. Process understanding improves but is uneven.
9354ed02-c288-4941-b1e3-41290bfcb050	5c0f18fb-5356-42bf-8ba8-7af409188bd8	9366c231-3e98-4e69-ba45-f2af170132fc	3	Process transparency is widespread with real-time dashboards and collaborative tools. Workflows, impediments, and risks are visible to all relevant stakeholders. Teams use transparency to manage dependencies and escalate issues proactively. Documentation and knowledge repositories are maintained and accessible. Transparency supports coordination and trust.
cb19621a-a08a-4542-9ca6-2734d3a82953	5c0f18fb-5356-42bf-8ba8-7af409188bd8	9366c231-3e98-4e69-ba45-f2af170132fc	4	Process transparency integrates across teams, departments, and tools providing end-to-end visibility. Predictive analytics and alerts highlight risks and performance deviations early. Stakeholders collaborate transparently on adjustments and improvements. Transparency is a cornerstone of governance and continuous improvement. Data quality and access are rigorously managed.
aae70960-33f9-4ba6-a6f3-b56a50ebbc70	5c0f18fb-5356-42bf-8ba8-7af409188bd8	9366c231-3e98-4e69-ba45-f2af170132fc	5	Full transparency is achieved with integrated real-time data, advanced analytics, and collaborative platforms extending beyond the organization. Transparency enables anticipatory management and rapid innovation. Stakeholders at all levels share ownership of process performance. Transparency is a strategic asset and cultural norm. The organization leads in open and accountable operations.
fef7a588-7058-4b39-8cc9-c9d0ebb2ff5b	e46f9477-7978-4478-ae4a-0ce184784132	9366c231-3e98-4e69-ba45-f2af170132fc	1	Quality checks are performed mainly at the end of the development cycle, leading to late discovery of defects. Developers and testers work in silos, and ownership of quality is unclear. Quality issues cause rework and delays. Preventive quality measures are absent or informal.
88c8b03a-3fc9-4d05-b36e-5051775526a1	e46f9477-7978-4478-ae4a-0ce184784132	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic quality-at-source practices such as unit testing and code reviews are introduced. Teams recognize the importance of early defect detection but struggle with consistent implementation. Quality ownership begins to shift towards developers. Some improvements reduce defects but quality escapes remain.
1019ffc7-1dff-49fc-b295-97eb70322ef5	e46f9477-7978-4478-ae4a-0ce184784132	9366c231-3e98-4e69-ba45-f2af170132fc	3	Quality is built into development workflows through automated testing, continuous integration, and peer reviews. Teams proactively identify and fix defects early. Quality metrics are tracked and used to drive improvements. Ownership of quality is shared across the team. Quality-at-source becomes standard practice.
89adb6be-959a-4d4d-9001-a0dda5ed5d56	e46f9477-7978-4478-ae4a-0ce184784132	9366c231-3e98-4e69-ba45-f2af170132fc	4	Advanced quality practices including behavior-driven development, test-driven development, and continuous deployment are widely adopted. Quality is embedded in design and architecture decisions. Teams collaborate closely to prevent defects and ensure customer satisfaction. Quality metrics are linked to business outcomes. Quality culture is strong.
4bb07128-bc94-4211-9564-55a9b4798856	e46f9477-7978-4478-ae4a-0ce184784132	9366c231-3e98-4e69-ba45-f2af170132fc	5	Quality-at-source is predictive and adaptive, leveraging AI-driven testing and monitoring. Defects are prevented or detected before impacting customers. Quality excellence is recognized industry-wide. Continuous learning and innovation drive sustainable quality improvements. Quality is integral to organizational identity.
67942132-38b2-4177-a69a-e5a63f8011c7	5b7d0a11-2cee-4f9c-bd13-41a906556df2	9366c231-3e98-4e69-ba45-f2af170132fc	1	Workload is uneven and unpredictable, causing resource overloads and idle times. Project schedules and task assignments are reactive. Prioritization is unclear, leading to context switching and delays. Capacity planning is minimal.
c1d72442-72c7-4f93-9c65-ae06a44e847a	5b7d0a11-2cee-4f9c-bd13-41a906556df2	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic workload leveling techniques begin to be applied in some teams. Backlogs and sprints are planned to smooth work but variability remains. Teams recognize the impact of uneven workloads but struggle to manage it fully. Resource allocation improves but lacks integration.
52228183-f555-4093-9506-2e951581c058	5b7d0a11-2cee-4f9c-bd13-41a906556df2	9366c231-3e98-4e69-ba45-f2af170132fc	3	Level loading is systematically applied using sprint planning, capacity forecasting, and backlog refinement. Work is balanced across teams to optimize flow and reduce multitasking. Load adjustments are made proactively based on feedback and metrics. Resource planning is integrated with demand forecasts.
776afe64-8637-41fd-80a8-4f7504aee963	5b7d0a11-2cee-4f9c-bd13-41a906556df2	9366c231-3e98-4e69-ba45-f2af170132fc	4	Level loading is integrated across multiple teams and programs, aligning capacity with strategic priorities. Dynamic adjustments use real-time data and predictive analytics. Teams flexibly allocate resources to manage peak loads and bottlenecks. Level loading supports sustainable pace and high performance.
33ee4ed1-05df-4465-81f0-f91a646a684a	5b7d0a11-2cee-4f9c-bd13-41a906556df2	9366c231-3e98-4e69-ba45-f2af170132fc	5	Level loading is predictive, automated, and optimized through AI and advanced analytics. Workflows dynamically adapt to changing demand and capacity. Level loading spans partners and customers, enabling synchronized delivery. Continuous improvement refines load balancing strategies. Level loading excellence drives agility and competitiveness.
4a10ad8d-f9e9-4e69-9ea1-369b375f755b	f43ffdbb-6f21-41e2-b632-085c54a3a017	9366c231-3e98-4e69-ba45-f2af170132fc	1	System reliability issues cause frequent outages or slowdowns, impacting productivity. Maintenance and support are reactive. Preventive practices are minimal or absent. Monitoring tools are limited. Downtime is poorly managed.
c31cd399-6579-4380-8946-8729ca8139a5	f43ffdbb-6f21-41e2-b632-085c54a3a017	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic maintenance and monitoring tools are implemented, supporting incident detection and resolution. Teams begin to schedule preventive maintenance activities. System health data is collected but underutilized. Maintenance processes remain manual and reactive. Reliability improves marginally.
b53936a1-9eb0-4c24-9a3e-d97a6a80f076	f43ffdbb-6f21-41e2-b632-085c54a3a017	9366c231-3e98-4e69-ba45-f2af170132fc	3	TPM principles are applied to IT infrastructure and software operations. Automated monitoring and alerting detect issues proactively. Teams perform regular preventive maintenance and capacity planning. Reliability and uptime improve. Root cause analysis addresses recurring issues.
45baa61d-db51-45e4-b451-efae59c6ea14	f43ffdbb-6f21-41e2-b632-085c54a3a017	9366c231-3e98-4e69-ba45-f2af170132fc	4	TPM is integrated into DevOps and IT service management practices. Predictive maintenance leverages data analytics and AI to anticipate failures. Continuous improvement reduces downtime and enhances resilience. Maintenance processes are automated and optimized. Reliability is a key performance metric.
e72972ba-adb3-4e7c-813a-bc973a45787d	f43ffdbb-6f21-41e2-b632-085c54a3a017	9366c231-3e98-4e69-ba45-f2af170132fc	5	TPM excellence supports near-zero downtime with self-healing systems and autonomous maintenance. Advanced analytics predict and prevent issues before impact. TPM practices extend across IT supply chains and partners. Reliability is a strategic differentiator. The organization leads in resilient IT operations.
c29bb1e9-125d-4eb5-8362-d8508503c3bb	76150fde-d123-4cd9-8b08-45f86005e634	9366c231-3e98-4e69-ba45-f2af170132fc	1	IT functions operate in silos with limited coordination across development, testing, deployment, and operations. Processes are fragmented, causing handoff delays and errors. Visibility across the value stream is poor. Customer impact is negative. Accountability is unclear.
2c70b4ea-6a38-4637-a35f-5c8cdd50c64b	76150fde-d123-4cd9-8b08-45f86005e634	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some coordination and integration occur between key IT functions. Shared goals and basic process handoffs improve flow. Information systems begin to support cross-functional collaboration. Value stream awareness grows but remains limited. Process inefficiencies persist.
c2e0393b-b342-4fd2-b860-3a8d8855e7de	76150fde-d123-4cd9-8b08-45f86005e634	9366c231-3e98-4e69-ba45-f2af170132fc	3	Value streams are mapped and managed end-to-end, covering development to deployment and support. Cross-functional teams collaborate regularly. Metrics and improvement initiatives focus on flow and customer value. Integration with business and customer processes improves. Accountability is clearly assigned.
4d7dfbf1-b757-4a9d-8b74-c9cf9ec541e0	76150fde-d123-4cd9-8b08-45f86005e634	9366c231-3e98-4e69-ba45-f2af170132fc	4	End-to-end value stream integration extends to suppliers, partners, and customers. Continuous flow and feedback loops enable rapid response to change. Data and tools support real-time visibility and coordination. Cross-organizational collaboration fosters innovation and alignment. Value stream optimization drives strategic advantage.
38f9db1a-a50e-4a66-bcf6-31f92f9e6446	76150fde-d123-4cd9-8b08-45f86005e634	9366c231-3e98-4e69-ba45-f2af170132fc	5	Value stream integration is seamless, dynamic, and predictive, supported by digital platforms and AI. The entire ecosystem operates as a unified value delivery network. Collaboration and continuous improvement extend beyond organizational boundaries. The organization benchmarks and shares value stream best practices. Customer-centric flow is optimized continuously.
23bcfd97-2904-492a-a773-c776b040cbd7	fbfbcc6a-7100-4b77-9d01-390a1f934b72	9366c231-3e98-4e69-ba45-f2af170132fc	1	Waste such as rework, delays, unnecessary features, and handoffs are common and unrecognized. Processes are inefficient and inconsistent. Teams react to symptoms rather than eliminating root causes. Awareness of Lean waste types is low. Waste reduction is not prioritized.
354f5263-b0f6-490d-a43d-f215c6e060d3	fbfbcc6a-7100-4b77-9d01-390a1f934b72	9366c231-3e98-4e69-ba45-f2af170132fc	2	Teams begin identifying common wastes during retrospectives and improvement events. Some waste reduction initiatives are implemented but often isolated and short-lived. Awareness of waste types grows. Tools for waste identification and elimination are introduced but inconsistently applied. Waste remains a significant challenge.
fea27207-02b0-46e5-ab7f-cba6c161b71f	fbfbcc6a-7100-4b77-9d01-390a1f934b72	9366c231-3e98-4e69-ba45-f2af170132fc	3	Waste elimination becomes systematic, supported by Lean tools and data analysis. Teams regularly identify and remove non-value-added activities. Cross-functional collaboration targets systemic waste. Metrics track waste reduction progress. Continuous improvement cycles focus on waste elimination.
974b67f8-fce7-49ca-9f52-f984ad1c803d	fbfbcc6a-7100-4b77-9d01-390a1f934b72	9366c231-3e98-4e69-ba45-f2af170132fc	4	Waste elimination is embedded in daily management systems and cultural norms. Advanced analytics identify hidden wastes and improvement opportunities. Waste reduction includes environmental and energy considerations. Continuous learning accelerates waste elimination. Teams are accountable for sustaining waste-free processes.
55bbb5d4-6e99-464b-b771-a41f672a0801	fbfbcc6a-7100-4b77-9d01-390a1f934b72	9366c231-3e98-4e69-ba45-f2af170132fc	5	Waste elimination is strategic and continuous, driving operational excellence and sustainability. Innovation proactively prevents waste before it occurs. The organization benchmarks and shares best practices in waste reduction. Lean culture ensures all employees detect and address waste proactively. Waste minimization supports competitive advantage.
7156664b-23c7-4e36-8be3-3694ac643248	3ce2329c-7ba9-4e36-94b4-7a1d35644df6	9366c231-3e98-4e69-ba45-f2af170132fc	1	Handoffs between teams or departments are frequent, unclear, and error-prone, causing delays and misunderstandings. Queues for code review, testing, or deployment build up, creating bottlenecks. Communication during handoffs is inconsistent or informal, leading to lost information. Teams often work in isolation without a shared understanding of workflows. Customer satisfaction suffers due to delays and quality issues.
818561d9-fd0c-4d53-b8c4-6dd2749b386a	3ce2329c-7ba9-4e36-94b4-7a1d35644df6	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic protocols for handoffs and queue management are introduced in some teams. Communication improves but remains inconsistent and localized. Queues are monitored sporadically, and delays are sometimes addressed reactively. Awareness of the impact of handoffs and queues on flow grows. Teams start experimenting with improvements but lack standardized processes.
4ebf48dd-16b2-4ded-8f9d-9c8976af62f0	3ce2329c-7ba9-4e36-94b4-7a1d35644df6	9366c231-3e98-4e69-ba45-f2af170132fc	3	Standardized handoff procedures and queue limits are implemented across teams, reducing errors and delays. Workflows are mapped to identify bottlenecks, and teams collaborate to smooth transitions. Communication during handoffs is structured and transparent. Queue lengths and wait times are regularly monitored and managed. Continuous improvement targets handoff efficiency.
2c2d5ea2-f374-4416-9333-630eaa18f168	3ce2329c-7ba9-4e36-94b4-7a1d35644df6	9366c231-3e98-4e69-ba45-f2af170132fc	4	Handoff and queue management are integrated into continuous delivery pipelines and agile workflows. Automated tools reduce manual handoffs and enable real-time queue visibility. Teams proactively balance workloads and coordinate releases. Metrics track queue health and flow efficiency across the value stream. Leadership supports cross-team collaboration to optimize throughput.
6ddb83be-b81c-46ef-b149-ca7862841c2c	3ce2329c-7ba9-4e36-94b4-7a1d35644df6	9366c231-3e98-4e69-ba45-f2af170132fc	5	Handoffs and queues are minimized through end-to-end automation, integrated toolchains, and predictive workload management. Workflows dynamically adjust to eliminate bottlenecks and delays. Collaboration extends across internal teams and external partners for seamless delivery. Continuous feedback and innovation sustain optimal flow. The organization benchmarks and shares best practices.
379f9486-8dc1-4b1b-bda2-ef9f2e1218f4	23817509-c27c-47a6-af8b-3a75376a915a	9366c231-3e98-4e69-ba45-f2af170132fc	1	Documentation is incomplete, inconsistent, or outdated. Teams rely heavily on tacit knowledge and verbal communication. Knowledge loss and misunderstandings are common. Documentation is not prioritized or enforced. Training and onboarding are hindered by poor documentation.
e720bc0a-5594-478a-93bc-04a1389169fa	23817509-c27c-47a6-af8b-3a75376a915a	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic documentation standards and templates are introduced. Some teams maintain up-to-date technical and process documentation. Documentation efforts are reactive and vary widely in quality. Employees recognize documentation's importance but struggle with consistency. Documentation reviews and audits begin sporadically.
64aede18-c234-4347-acd8-072be360abb9	23817509-c27c-47a6-af8b-3a75376a915a	9366c231-3e98-4e69-ba45-f2af170132fc	3	Documentation discipline is formalized, with clear policies and accountability. Teams maintain comprehensive and current documentation covering code, processes, and configurations. Documentation supports training, compliance, and problem-solving. Automated tools assist with documentation management. Documentation quality is regularly audited.
4877ea7d-a5a0-4bfd-8b49-532698f77044	23817509-c27c-47a6-af8b-3a75376a915a	9366c231-3e98-4e69-ba45-f2af170132fc	4	Documentation is integrated with development workflows and knowledge management systems. Continuous updates are encouraged and facilitated by automation and collaboration platforms. Documentation is accessible, searchable, and standardized across teams. Documentation contributes to process improvement and innovation. Documentation metrics inform management decisions.
f7fc3ac0-79fd-42f2-8eec-ad610b3b92eb	23817509-c27c-47a6-af8b-3a75376a915a	9366c231-3e98-4e69-ba45-f2af170132fc	5	Documentation excellence is strategic, continuously improved, and embedded in culture. AI-powered tools auto-generate, validate, and update documentation in real time. Documentation supports compliance, knowledge transfer, and innovation at scale. The organization leads in documentation practices and shares expertise externally. Documentation enables agility and operational excellence.
e0a96fa9-48d5-41a9-9a99-01fbd5b34fe2	b8186bad-6675-419f-b78a-d4c1a08ca69f	9366c231-3e98-4e69-ba45-f2af170132fc	1	Workflows are largely manual or fragmented across disconnected tools. Data entry is repetitive and error-prone. Process tracking and reporting are inconsistent or absent. Teams struggle with transparency and efficiency. Digital adoption is minimal.
32f33770-7af7-4093-bad5-9355573f5676	b8186bad-6675-419f-b78a-d4c1a08ca69f	9366c231-3e98-4e69-ba45-f2af170132fc	2	Selective digitization begins in areas such as issue tracking, source control, and CI/CD pipelines. Some workflows become standardized digitally but lack integration. Teams receive basic training on digital tools. Workflow digitization is project-specific and inconsistent. Manual processes remain prevalent.
c0c7824f-49d2-4cbb-bc60-e3ca69ecb459	b8186bad-6675-419f-b78a-d4c1a08ca69f	9366c231-3e98-4e69-ba45-f2af170132fc	3	Digitization expands across development, testing, deployment, and support workflows. Integrated toolchains enable automation and collaboration. Data capture is systematic, improving transparency and traceability. Digital workflows support continuous improvement and agile practices. Employee digital skills improve.
211c1c47-6bbe-418f-8855-54b12b9d4577	b8186bad-6675-419f-b78a-d4c1a08ca69f	9366c231-3e98-4e69-ba45-f2af170132fc	4	End-to-end digitization connects IT workflows internally and with business and customer systems. Advanced tools support real-time monitoring, analytics, and decision-making. Automation reduces manual tasks and errors. Teams continuously optimize digital workflows. Digitization aligns with strategic goals.
e2493d54-7ff7-4811-8438-4e2043651d71	b8186bad-6675-419f-b78a-d4c1a08ca69f	9366c231-3e98-4e69-ba45-f2af170132fc	5	Digital workflows are intelligent, adaptive, and seamlessly integrated across ecosystems. AI, machine learning, and robotic process automation optimize processes dynamically. Digital transformation fosters innovation, agility, and resilience. The organization leads in digital maturity and shares best practices. Digitization drives business value and competitive advantage.
bafcc670-7715-4664-a72f-be5d98eabf99	dfd27eb0-8d33-471e-8d3a-06d2ed158ef0	9366c231-3e98-4e69-ba45-f2af170132fc	1	Lean and Agile principles are absent or peripheral in corporate IT strategy. Improvement initiatives are fragmented and tactical. Leadership lacks clear vision or commitment to Lean transformation. Resource allocation is ad hoc. Lean is seen as a toolkit rather than a strategic approach.
eeb1e9c4-dd08-4fb3-abe4-7dbd00f0c682	dfd27eb0-8d33-471e-8d3a-06d2ed158ef0	9366c231-3e98-4e69-ba45-f2af170132fc	2	Lean concepts begin to appear in strategy discussions and pilot projects. Some leadership awareness and support exist but lack coherence and alignment. Resource planning selectively supports Lean activities. Strategic alignment is limited to isolated initiatives. Lean remains a bottom-up or middle management effort.
b6a9ce2b-024c-496e-b0ea-cd9ca99a4d77	dfd27eb0-8d33-471e-8d3a-06d2ed158ef0	9366c231-3e98-4e69-ba45-f2af170132fc	3	Lean is formally embedded in IT strategy with clear goals, roadmaps, and leadership commitment. Improvement initiatives align with business objectives. Resources and governance structures support Lean transformation. Lean metrics are integrated into performance management. Alignment between Lean and corporate strategy strengthens.
2d827d4c-7e44-43c3-a0c1-da16c8035519	dfd27eb0-8d33-471e-8d3a-06d2ed158ef0	9366c231-3e98-4e69-ba45-f2af170132fc	4	Lean drives IT strategic planning, innovation, and capability development. Cross-functional collaboration and customer focus shape Lean initiatives. Leadership sponsors continuous improvement as a strategic imperative. Lean supports organizational agility and growth. Lean is embedded in governance and culture.
04a9a18c-7e37-4a01-9312-c0620034c4c5	dfd27eb0-8d33-471e-8d3a-06d2ed158ef0	9366c231-3e98-4e69-ba45-f2af170132fc	5	Lean transformation is a core pillar of IT's corporate strategy and identity. The organization leads in Lean innovation, culture, and capability. Lean informs investment decisions, partnerships, and customer engagement. Continuous learning and adaptation sustain strategic advantage. The organization benchmarks and influences industry Lean maturity.
1a28f4b1-2b92-4f16-b72d-283d2ec20eea	73aad573-76aa-43a0-9063-3501390d387c	9366c231-3e98-4e69-ba45-f2af170132fc	1	Strategy deployment is informal or absent, leading to unclear goals and misaligned initiatives. Communication of strategic priorities is top-down and inconsistent. Departments work independently without shared objectives. Accountability is weak. Lean or Agile goals are not systematically cascaded.
122c5c50-7799-4599-9043-2f55e0431fd4	73aad573-76aa-43a0-9063-3501390d387c	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic strategy deployment practices are introduced, including goal setting and periodic reviews. Some alignment between strategy and projects exists but is limited. Communication improves but lacks clarity or frequency. Feedback loops are inconsistent. Coordination between departments begins.
5361cd3d-4758-40eb-9946-45efb8875c3a	73aad573-76aa-43a0-9063-3501390d387c	9366c231-3e98-4e69-ba45-f2af170132fc	3	Structured strategy deployment processes such as Hoshin Kanri are implemented. Goals cascade through teams with clear metrics and accountability. Regular reviews and adjustments ensure progress. Cross-functional collaboration supports execution. Communication is transparent and consistent.
7db3c4c0-2cc1-4afc-bd68-22af1a45742d	73aad573-76aa-43a0-9063-3501390d387c	9366c231-3e98-4e69-ba45-f2af170132fc	4	Strategy deployment is dynamic, data-driven, and integrated with Lean/Agile practices. Real-time metrics and dashboards track progress and risks. Leadership engagement and feedback loops enable rapid course corrections. Strategy aligns with changing market and technology trends. Deployment processes foster innovation and agility.
f49d99bd-2c64-462e-9448-35bd4fdb79ec	73aad573-76aa-43a0-9063-3501390d387c	9366c231-3e98-4e69-ba45-f2af170132fc	5	Strategy deployment is fully integrated, participatory, and adaptive. Continuous alignment and accountability drive sustained Lean transformation success. Digital platforms support transparent communication and progress monitoring. The organization demonstrates strategic agility and leadership. Strategy deployment is a source of competitive advantage.
96aa4da5-8ddb-4569-a1c5-0eeb30d74d16	f3a017de-5501-4e00-9d41-1e4538574db7	9366c231-3e98-4e69-ba45-f2af170132fc	1	Policies related to Lean, Agile, or continuous improvement are unclear, poorly communicated, or nonexistent. Employees are unaware of expectations or standards. Policy changes are reactive and not aligned with strategy. Compliance and enforcement are inconsistent.
63ca39a6-e9ec-4f89-9235-98f87ac9beb8	f3a017de-5501-4e00-9d41-1e4538574db7	9366c231-3e98-4e69-ba45-f2af170132fc	2	Initial efforts to clarify and communicate relevant policies are made. Some teams develop and adopt policies supporting Lean/Agile practices. Policy deployment varies across the organization. Employees begin to recognize expectations, but application is uneven. Feedback on policies is limited.
7d2e0aa8-6c8d-43b3-bec2-338639599b6a	f3a017de-5501-4e00-9d41-1e4538574db7	9366c231-3e98-4e69-ba45-f2af170132fc	3	Policies are formally deployed and linked to Lean/Agile strategy and performance goals. Teams are trained on relevant policies and understand their importance. Regular reviews ensure policies remain current. Feedback mechanisms enable continuous improvement. Policy adherence is monitored and reported.
2dddf0f8-24a1-4a10-92d4-7dff0bc0b507	f3a017de-5501-4e00-9d41-1e4538574db7	9366c231-3e98-4e69-ba45-f2af170132fc	4	Policy deployment is proactive, inclusive, and data-driven. Cross-functional teams participate in policy development and deployment. Policies are integrated into daily work and supported by digital tools. Policy impact is evaluated regularly. Best practices are shared across teams.
50a68486-95cc-4d8e-971c-9a1fcd0e2863	f3a017de-5501-4e00-9d41-1e4538574db7	9366c231-3e98-4e69-ba45-f2af170132fc	5	Policy deployment is strategic, adaptive, and continuously improved. Digital platforms automate policy communication, training, and compliance monitoring. Employees are engaged in policy innovation and benchmarking. Policy deployment supports agility, risk management, and sustained excellence. The organization leads in policy deployment best practices.
abbf67cf-44b3-4f74-8c79-3903808bf81d	b4191d07-1030-465d-b8bb-a3cfa60884af	9366c231-3e98-4e69-ba45-f2af170132fc	1	Functions and departments operate independently with limited alignment. Goals, metrics, and priorities are siloed. Collaboration is rare and often forced by crisis. Misalignment causes delays, rework, and conflict. Customers experience inconsistent outcomes.
b3e81a47-cd22-469a-a7d8-779eeae5249a	b4191d07-1030-465d-b8bb-a3cfa60884af	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some cross-functional collaboration and alignment efforts emerge, often around key projects. Shared goals or metrics are piloted. Alignment varies by initiative and leadership commitment. Communication improves but is inconsistent. Benefits are recognized but limited in scope.
9a2648b6-54de-446a-9672-b9a27321b7c9	b4191d07-1030-465d-b8bb-a3cfa60884af	9366c231-3e98-4e69-ba45-f2af170132fc	3	Cross-functional alignment is established through shared objectives, integrated planning, and regular coordination. Teams collaborate on process improvement and problem-solving. Alignment is measured and managed. Customers benefit from more consistent and seamless experiences. Leadership supports and models cross-functional collaboration.
782b9e55-c649-4823-b3e2-f49635094341	b4191d07-1030-465d-b8bb-a3cfa60884af	9366c231-3e98-4e69-ba45-f2af170132fc	4	Alignment across functions is dynamic and strategic. Integrated management systems and digital tools support real-time coordination. Cross-functional teams lead key initiatives. Continuous improvement and learning strengthen alignment. Alignment is recognized as essential to performance and innovation.
a6fff7a8-757f-49f1-96dc-82adb1d8cd0e	b4191d07-1030-465d-b8bb-a3cfa60884af	9366c231-3e98-4e69-ba45-f2af170132fc	5	Cross-functional alignment is a cultural norm and strategic advantage. Structures and systems enable seamless collaboration internally and with external partners. Alignment is continuously optimized based on data and feedback. The organization sets benchmarks for alignment excellence. Customers receive integrated, high-value outcomes.
71637c83-2b34-432d-b6ae-2cdc710bbad5	c90625cb-5cd6-4c32-badc-a36e0a46e2e2	9366c231-3e98-4e69-ba45-f2af170132fc	1	Governance structures and accountability for Lean or Agile initiatives are absent or unclear. Roles and responsibilities are undefined or ignored. Decision-making is ad hoc and lacks transparency. Performance is not measured or managed. Issues escalate slowly and unpredictably.
99176c4a-cab4-4c74-9b8e-83c38fd483a1	c90625cb-5cd6-4c32-badc-a36e0a46e2e2	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic governance and accountability mechanisms are introduced, often focused on project delivery. Roles and responsibilities begin to be defined. Performance reviews and progress tracking are piloted. Accountability is inconsistent and depends on individual leaders. Transparency is limited.
c6885dd9-acd1-4fbe-8d50-e33003d68beb	c90625cb-5cd6-4c32-badc-a36e0a46e2e2	9366c231-3e98-4e69-ba45-f2af170132fc	3	Formal governance structures are established for Lean/Agile management. Roles, responsibilities, and escalation paths are clear and communicated. Regular reviews track progress and address issues. Accountability is embedded in daily management. Governance supports continuous improvement.
b1ca6c13-7737-4d0f-89af-ff03daa6cab8	c90625cb-5cd6-4c32-badc-a36e0a46e2e2	9366c231-3e98-4e69-ba45-f2af170132fc	4	Governance is integrated and agile, enabling rapid decision-making and adaptation. Digital tools provide real-time visibility and tracking. Cross-functional accountability is emphasized. Leadership models transparency and accountability. Governance aligns with strategy and customer needs.
400008d3-91c3-4754-811c-e79d0a778153	c90625cb-5cd6-4c32-badc-a36e0a46e2e2	9366c231-3e98-4e69-ba45-f2af170132fc	5	Governance and accountability are strategic and continuously improved. Autonomous teams operate within clear guardrails. Digital governance platforms enable dynamic oversight and learning. The organization is recognized for governance excellence and agility. Governance drives sustained success and innovation.
af4911ea-bd80-41ff-afab-ccd995617c9c	901731b0-42b9-401d-8c81-4c8b6a0d079e	9366c231-3e98-4e69-ba45-f2af170132fc	1	Succession planning is informal or absent. Leadership transitions are disruptive and unplanned. Talent pipelines are weak. Knowledge and culture loss occurs during transitions. The organization relies on ad hoc recruitment.
1579caf5-2850-4959-8017-7fb04d5695cd	901731b0-42b9-401d-8c81-4c8b6a0d079e	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some leaders identify and mentor potential successors, but processes are inconsistent. Development plans for future leaders exist in select areas. Succession discussions occur but lack structure. Knowledge transfer is limited. Leadership gaps persist.
297358a5-b046-44fc-aac9-fb8b1cb8fd03	901731b0-42b9-401d-8c81-4c8b6a0d079e	9366c231-3e98-4e69-ba45-f2af170132fc	3	Succession planning is formalized with structured talent identification, development, and transition processes. Future leaders are provided targeted learning and growth opportunities. Knowledge transfer and culture continuity are prioritized. Succession planning supports stability and growth.
b5f29677-6803-4beb-a010-994543efbff4	901731b0-42b9-401d-8c81-4c8b6a0d079e	9366c231-3e98-4e69-ba45-f2af170132fc	4	Succession planning is integrated with leadership development and workforce planning. High-potential talent pools are actively managed. Cross-functional and diverse leadership development is emphasized. Data and feedback guide succession strategies. The organization adapts smoothly to leadership changes.
8b8b555c-6da2-4aca-b7b4-f3f1532fb111	901731b0-42b9-401d-8c81-4c8b6a0d079e	9366c231-3e98-4e69-ba45-f2af170132fc	5	Succession planning is a strategic advantage, ensuring a resilient and adaptive leadership pipeline. AI-driven analytics support predictive talent management. Leadership succession sustains Lean/Agile culture and innovation. The organization benchmarks and shares best practices. Leadership transitions are seamless and value-adding.
dbfdc020-4075-431f-b249-a795506284ea	e4e17b92-c77a-47d2-9261-ee81d2551ed2	9366c231-3e98-4e69-ba45-f2af170132fc	1	Risk management is reactive and inconsistent. Risks are identified late or only after issues arise. Processes for risk assessment and mitigation are poorly defined or absent. Teams are unprepared for disruptions. Risk awareness is low.
c459939d-2e4d-4f2a-9943-b85189f46e44	e4e17b92-c77a-47d2-9261-ee81d2551ed2	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic risk management practices are introduced, such as risk registers and issue tracking. Some teams conduct risk assessments, but application is inconsistent. Risk communication and escalation improve but remain informal. Mitigation efforts are often ad hoc.
8718906a-7216-4426-a069-28c33a9a8843	e4e17b92-c77a-47d2-9261-ee81d2551ed2	9366c231-3e98-4e69-ba45-f2af170132fc	3	Risk management is formalized with systematic identification, assessment, and mitigation. Risks are regularly reviewed and managed throughout project and process lifecycles. Risk ownership is defined. Lessons learned from risks inform improvements. Risk management supports business continuity.
c527bc65-b94d-44e3-b0c2-f49659bcc927	e4e17b92-c77a-47d2-9261-ee81d2551ed2	9366c231-3e98-4e69-ba45-f2af170132fc	4	Risk management is integrated with strategic planning and daily management. Predictive analytics and real-time monitoring enable proactive risk mitigation. Cross-functional teams collaborate on risk reduction. Risk culture supports innovation and resilience. Risk management is a performance differentiator.
bfb7d1f8-60e7-40b7-925c-9f7c0a615617	e4e17b92-c77a-47d2-9261-ee81d2551ed2	9366c231-3e98-4e69-ba45-f2af170132fc	5	Risk management is dynamic, adaptive, and predictive. AI and automation enable real-time risk detection and response. Risk management extends across the value chain and ecosystem. The organization is a benchmark for risk excellence. Risk management sustains innovation and competitive advantage.
e8b4dbba-69b5-4480-a06b-d7d23146bdaa	2b65a306-c3e1-43b8-932d-36e0dc54c04e	9366c231-3e98-4e69-ba45-f2af170132fc	1	Key performance indicators (KPIs) are undefined, poorly aligned, or not tracked. Teams lack visibility into performance. Metrics are inconsistent or focused on activity rather than outcomes. Decision-making is based on opinion rather than data. Accountability is weak.
49a653d4-dc8d-4cdf-8a1b-25e2946673ea	2b65a306-c3e1-43b8-932d-36e0dc54c04e	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic KPIs are defined for some teams or projects. Metrics focus on delivery, quality, or customer satisfaction. Tracking and reporting are inconsistent. Alignment of KPIs with organizational goals is limited. Data quality varies. Teams begin to use metrics in decision-making.
f7e1a3b2-5682-4da2-9ea6-42785163cb07	2b65a306-c3e1-43b8-932d-36e0dc54c04e	9366c231-3e98-4e69-ba45-f2af170132fc	3	KPIs are defined, tracked, and aligned across teams and projects. Metrics cover value, flow, quality, and customer outcomes. KPIs support decision-making and continuous improvement. Dashboards and reports provide transparency. KPI alignment strengthens accountability and performance.
a01d6b67-49bc-47a8-98e7-21898bd500d3	2b65a306-c3e1-43b8-932d-36e0dc54c04e	9366c231-3e98-4e69-ba45-f2af170132fc	4	KPI management is integrated and data-driven, with automated tracking and visualization. KPIs cascade from strategy to daily operations. Teams use metrics for proactive management and learning. KPI reviews drive alignment and performance improvement. Metrics inform investment and resource allocation.
3cac580b-7635-4858-922d-0ab15dbfcba8	2b65a306-c3e1-43b8-932d-36e0dc54c04e	9366c231-3e98-4e69-ba45-f2af170132fc	5	KPI excellence is strategic and continuously optimized. Advanced analytics and AI drive insight and prediction. KPI alignment spans the value chain, partners, and customers. The organization benchmarks KPI practices. Metrics drive business value, agility, and competitiveness.
1f41f39d-2e74-422a-959c-5139b734595a	e4a30c23-f8d8-43fe-9aa3-d8c6b8777824	9366c231-3e98-4e69-ba45-f2af170132fc	1	Daily management is unstructured or ad hoc. Teams lack regular routines for performance review, issue escalation, or continuous improvement. Communication is inconsistent. Operational problems persist unresolved. Management relies on firefighting.
aa9cc5f4-a038-43d0-a699-ac3678420474	e4a30c23-f8d8-43fe-9aa3-d8c6b8777824	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic daily management routines such as stand-ups and check-ins are introduced. Teams review progress and address issues, but routines are not standardized. Problem escalation and resolution improve but remain inconsistent. Learning from daily management is limited.
39f0dc6c-af6a-4047-8991-796a381dda5c	e4a30c23-f8d8-43fe-9aa3-d8c6b8777824	9366c231-3e98-4e69-ba45-f2af170132fc	3	Structured daily management systems are adopted, including standardized meetings, dashboards, and issue tracking. Teams regularly review performance, escalate problems, and share learnings. Daily management supports alignment and continuous improvement. Communication and accountability improve.
bdf7b7e5-5593-490e-8957-3ee9f7fa8c5b	e4a30c23-f8d8-43fe-9aa3-d8c6b8777824	9366c231-3e98-4e69-ba45-f2af170132fc	4	Daily management is integrated and automated with real-time dashboards, alerts, and collaboration tools. Teams use data for proactive management and learning. Escalation and issue resolution are rapid and effective. Daily management sustains operational excellence. Leaders coach and support daily routines.
316aee23-f7e7-4a9b-b077-e851720f54ec	e4a30c23-f8d8-43fe-9aa3-d8c6b8777824	9366c231-3e98-4e69-ba45-f2af170132fc	5	Daily management systems are intelligent, adaptive, and predictive. AI and automation drive proactive management and learning. Systems connect teams, partners, and customers. Daily management sustains high performance and innovation. The organization benchmarks daily management best practices.
598ad845-692b-45ba-a1d7-c8aae20b6445	58535f3c-a9a4-4140-8f9e-ba9be09fd960	9366c231-3e98-4e69-ba45-f2af170132fc	1	Performance reviews are infrequent, subjective, or disconnected from Lean/Agile goals. Feedback is limited and backward-looking. Improvement opportunities are missed. Employees see reviews as compliance rather than development. Recognition and accountability are weak.
286c4596-7109-4dd5-89fd-ffa621c80beb	58535f3c-a9a4-4140-8f9e-ba9be09fd960	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some teams conduct regular performance reviews focused on delivery or individual contribution. Feedback is more structured but still inconsistent. Lean/Agile behaviors are occasionally recognized. Review outcomes are not always linked to development or improvement plans. Employees see some value in reviews.
1476ab58-c5e7-43c8-b0ac-f30c6e633cf2	58535f3c-a9a4-4140-8f9e-ba9be09fd960	9366c231-3e98-4e69-ba45-f2af170132fc	3	Performance reviews are systematic, objective, and aligned with Lean/Agile goals. Teams and individuals receive regular feedback on behaviors and results. Reviews inform development plans and improvement initiatives. Recognition and accountability are strengthened. Performance reviews support engagement and learning.
5c32bd40-b982-4fbc-8373-b96d05f4b57b	58535f3c-a9a4-4140-8f9e-ba9be09fd960	9366c231-3e98-4e69-ba45-f2af170132fc	4	Performance reviews are integrated with real-time feedback, coaching, and data analytics. Reviews focus on outcomes, behaviors, and continuous improvement. Employees participate in self and peer reviews. Review outcomes inform talent management and succession planning. Performance reviews drive growth and culture.
d4877547-01db-4ba9-899e-31cd17aa306c	58535f3c-a9a4-4140-8f9e-ba9be09fd960	9366c231-3e98-4e69-ba45-f2af170132fc	5	Performance reviews are continuous, personalized, and predictive. AI-driven feedback and analytics support individual and team development. Reviews align with strategy and customer value. Performance management sustains high engagement and innovation. The organization leads in performance review practices.
e0ec82ff-cbfc-48c2-ad69-fed321a80635	f9e4db45-4fb2-42e7-aedb-b855c3a40009	9366c231-3e98-4e69-ba45-f2af170132fc	1	Problem-solving focuses on symptoms rather than root causes. Issues recur, causing frustration and inefficiency. Teams lack structured tools or methods for root cause analysis. Solutions are often short-term fixes. Learning from problems is limited.
343e176d-89dc-4f1b-92d8-8d38978cf089	f9e4db45-4fb2-42e7-aedb-b855c3a40009	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic root cause analysis tools such as '5 Whys' or fishbone diagrams are introduced in some teams. Application is inconsistent and learning is localized. Teams begin to document problems and solutions. Root cause analysis is event-driven.
ec2586a8-4663-4910-a900-2cb801b5eaed	f9e4db45-4fb2-42e7-aedb-b855c3a40009	9366c231-3e98-4e69-ba45-f2af170132fc	3	Root cause analysis is systematic and embedded in improvement routines. Teams use structured methods to analyze incidents, defects, or failures. Solutions address underlying causes and are verified for effectiveness. Learning from problems is shared across teams. Root cause analysis drives process improvement.
aa5dbc39-4242-4ffb-9c6e-84a3aae02d67	f9e4db45-4fb2-42e7-aedb-b855c3a40009	9366c231-3e98-4e69-ba45-f2af170132fc	4	Root cause analysis is integrated with data analytics, automation, and continuous improvement systems. Teams proactively identify and address systemic issues. Cross-team collaboration enhances learning and prevention. Root cause analysis informs strategy and risk management. Improvement cycles are rapid and sustained.
9a09622f-09b8-4293-b24f-9a2d0c0dce16	f9e4db45-4fb2-42e7-aedb-b855c3a40009	9366c231-3e98-4e69-ba45-f2af170132fc	5	Root cause analysis is predictive and adaptive, leveraging AI and machine learning to prevent problems before they occur. The organization continuously learns from internal and external sources. Root cause analysis is a source of competitive advantage. The organization benchmarks and leads best practices.
04ed28ac-efba-47cf-8b05-f2953686804e	0abd0641-af52-4ac9-ad2e-de4e1c3417c6	9366c231-3e98-4e69-ba45-f2af170132fc	1	Monitoring of systems, processes, and outcomes is sporadic or manual. Issues are detected late, causing disruptions or failures. Metrics are limited or not tracked in real time. Teams rely on reactive problem-solving. Continuous improvement is hindered.
70f19b5b-8d96-40a4-96c8-43ebee6fda67	0abd0641-af52-4ac9-ad2e-de4e1c3417c6	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic monitoring tools and practices are adopted in select areas. Teams monitor key metrics or system health, but data is limited or siloed. Alerts and dashboards improve visibility but are not always acted on. Monitoring supports incident response but is inconsistent.
8467e88a-e49e-40b4-b302-787941443ef1	0abd0641-af52-4ac9-ad2e-de4e1c3417c6	9366c231-3e98-4e69-ba45-f2af170132fc	3	Continuous monitoring is implemented across systems, processes, and teams. Automated tools provide real-time data and alerts. Monitoring informs proactive management and improvement. Teams act on insights to prevent issues. Continuous monitoring supports reliability and performance.
47f0b29a-0dac-4f1e-ac6e-ad1827f19e19	0abd0641-af52-4ac9-ad2e-de4e1c3417c6	9366c231-3e98-4e69-ba45-f2af170132fc	4	Continuous monitoring is integrated with analytics, automation, and business processes. Teams use predictive and prescriptive insights to optimize performance and mitigate risks. Monitoring extends across the value chain and customer experience. Continuous monitoring drives agility and competitiveness.
6d037ecb-7b80-40b3-b130-a5a29490aa06	0abd0641-af52-4ac9-ad2e-de4e1c3417c6	9366c231-3e98-4e69-ba45-f2af170132fc	5	Continuous monitoring is intelligent, adaptive, and strategic. AI and advanced analytics enable anticipatory management. Monitoring systems support innovation and transformation. The organization benchmarks monitoring practices. Continuous monitoring sustains high performance and resilience.
3eae6bff-c8cc-4d78-92b7-640611b1806b	091b944c-5190-4f3e-9d63-e956c753bd25	9366c231-3e98-4e69-ba45-f2af170132fc	1	Dashboards and metrics are absent or rarely used. Performance data is not visible to teams or leaders. Decisions rely on intuition or anecdotal evidence. Issues are identified late. Accountability and improvement are limited.
0dc99005-f3e7-4aa6-a6dd-ea2650c30b69	091b944c-5190-4f3e-9d63-e956c753bd25	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic dashboards and metrics are introduced in select teams. Performance data is collected but not consistently shared or used. Metrics focus on activity rather than value. Dashboards are static and updated manually. Use of metrics to drive improvement is sporadic.
7516b7de-e11f-4c3c-89d3-46bfeb3d35d5	091b944c-5190-4f3e-9d63-e956c753bd25	9366c231-3e98-4e69-ba45-f2af170132fc	3	Dashboards and metrics are standardized, automated, and widely used. Real-time performance data is visible to teams and leaders. Metrics cover value delivery, flow, and quality. Dashboards support decision-making and continuous improvement. Teams regularly review metrics to manage performance.
bac66e69-e31f-4ee4-b4b1-accdb92e77d5	091b944c-5190-4f3e-9d63-e956c753bd25	9366c231-3e98-4e69-ba45-f2af170132fc	4	Advanced dashboards integrate data from multiple systems and provide predictive and prescriptive insights. Dashboards are interactive and tailored to user roles. Metrics are aligned with strategy and customer value. Dashboards support proactive management and learning. Performance outcomes improve.
2347063f-de92-49ed-9ffe-60afc1472742	091b944c-5190-4f3e-9d63-e956c753bd25	9366c231-3e98-4e69-ba45-f2af170132fc	5	Dashboards and metrics are intelligent, adaptive, and strategic. AI-driven analytics provide real-time insights across the value chain. Dashboards support innovation, agility, and competitiveness. The organization leads in dashboard and metrics practices. Data-driven culture is embedded.
38214ea7-999f-44de-a0c2-2c49b9921a10	b4cf441b-dd3b-4b01-a399-cbc5c896f7cd	9366c231-3e98-4e69-ba45-f2af170132fc	1	Process benchmarking is not practiced. Teams lack awareness of internal or external best practices. Improvement efforts are isolated and based on intuition. Competitive or industry standards are ignored. Learning is limited.
69b7c662-7cdb-4ae1-b669-a398cb75e4c2	b4cf441b-dd3b-4b01-a399-cbc5c896f7cd	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic internal benchmarking begins, comparing performance across teams or projects. Some external comparisons are made, but methods are informal. Benchmarking data is collected sporadically. Teams begin to recognize the value of learning from others. Improvements are ad hoc.
bb6b6990-ee7e-4b75-84d9-18984cdfa9a1	b4cf441b-dd3b-4b01-a399-cbc5c896f7cd	9366c231-3e98-4e69-ba45-f2af170132fc	3	Process benchmarking is systematic and embedded in improvement routines. Teams compare processes and outcomes to internal and external benchmarks. Best practices are identified and adopted. Benchmarking informs goal setting and improvement initiatives. Learning accelerates.
e2e8e3b5-bc06-4ada-802a-2a24f6527640	b4cf441b-dd3b-4b01-a399-cbc5c896f7cd	9366c231-3e98-4e69-ba45-f2af170132fc	4	Advanced benchmarking includes industry, competitor, and cross-sector comparisons. Digital tools automate data collection and analysis. Teams participate in benchmarking networks and share best practices. Benchmarking drives innovation and strategic alignment. Outcomes are measured and sustained.
9e6ad1a6-5648-4d4c-b9f7-14053568193c	b4cf441b-dd3b-4b01-a399-cbc5c896f7cd	9366c231-3e98-4e69-ba45-f2af170132fc	5	Benchmarking is strategic, predictive, and continuous. AI and analytics enable real-time benchmarking across the ecosystem. The organization leads and influences industry benchmarking. Benchmarking outcomes drive transformation and competitive advantage. Benchmarking culture is sustained and recognized.
317ed6b9-5c31-4f69-bcf8-795f689f80d6	48103a2b-2e31-4001-9f8e-66ebeec5f84e	9366c231-3e98-4e69-ba45-f2af170132fc	1	Customer needs and feedback are rarely considered in IT processes or projects. Value delivery is not prioritized. Customer satisfaction is not measured. IT operates in isolation from customers.
a0f7c254-2213-45bc-9f55-91dfb730cc3c	69490414-4d70-4d6c-ad60-5ce67f13ed0a	9366c231-3e98-4e69-ba45-f2af170132fc	1	Incidents, failures, or defects are managed reactively, with limited documentation or analysis. Teams may hide mistakes or assign blame. Lessons learned are not shared. Problems recur due to lack of learning. Culture discourages openness.
440e4d35-4e2f-47cb-b198-a421194c6aaa	69490414-4d70-4d6c-ad60-5ce67f13ed0a	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some teams begin documenting incidents and sharing lessons learned. Root cause analysis is performed on major issues. Learning is localized and often informal. Management starts to encourage transparency. Improvement actions are sometimes tracked.
9d5c7316-b6f4-4eda-805c-41063aaf3f47	69490414-4d70-4d6c-ad60-5ce67f13ed0a	9366c231-3e98-4e69-ba45-f2af170132fc	3	Learning from incidents is systematic, with structured reviews and root cause analysis. Lessons are shared across teams. Incident data informs improvement initiatives. Blame-free culture is promoted. Continuous learning reduces recurrence of problems.
98db29d1-4175-4039-adc9-4d7bd431f689	69490414-4d70-4d6c-ad60-5ce67f13ed0a	9366c231-3e98-4e69-ba45-f2af170132fc	4	Learning from incidents is integrated with data analytics, automation, and knowledge management. Teams proactively seek opportunities to learn from near misses and small incidents. Learning outcomes drive process, technology, and behavior change. Learning culture is strong and visible.
50102ebf-d860-418e-b9be-e9a1d8805b22	69490414-4d70-4d6c-ad60-5ce67f13ed0a	9366c231-3e98-4e69-ba45-f2af170132fc	5	Learning from incidents is predictive, adaptive, and strategic. AI and advanced analytics identify learning opportunities in real time. Organization-wide systems capture, share, and act on lessons learned. Learning from incidents drives resilience, innovation, and competitive advantage.
e7d84209-d48c-4ebb-9c7f-5771defcfeee	f7ca5c03-f8d1-4472-9f3e-2b14bf79a852	9366c231-3e98-4e69-ba45-f2af170132fc	1	Knowledge is siloed within teams or individuals. Sharing of best practices, lessons learned, or technical expertise is informal or absent. Teams rely on tacit knowledge. Documentation and knowledge repositories are limited. Onboarding and problem-solving are hindered.
6e44aee9-893d-4bd5-b984-02fabf113efe	f7ca5c03-f8d1-4472-9f3e-2b14bf79a852	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic knowledge sharing systems such as wikis, forums, or shared drives are introduced. Some teams share documentation or lessons, but usage is inconsistent. Knowledge is sometimes outdated or hard to find. Management begins to encourage sharing. Benefits are localized.
7dfc537b-7c8a-4747-b715-79fc1f948434	f7ca5c03-f8d1-4472-9f3e-2b14bf79a852	9366c231-3e98-4e69-ba45-f2af170132fc	3	Knowledge sharing is formalized and supported by digital platforms. Teams regularly contribute to and use knowledge repositories. Best practices and lessons learned are captured and shared. Knowledge sharing supports onboarding, problem-solving, and innovation. Knowledge management is part of daily work.
020efbf0-bb62-4eb4-8e8f-6943ea51b7d9	f7ca5c03-f8d1-4472-9f3e-2b14bf79a852	9366c231-3e98-4e69-ba45-f2af170132fc	4	Advanced knowledge sharing systems integrate with workflows, automation, and collaboration tools. Knowledge is curated, updated, and easily accessible. Communities of practice and peer learning flourish. Knowledge sharing drives continuous improvement and agility. Leadership supports a knowledge-driven culture.
28b4c817-8b9c-424e-9e2e-66ce156343d4	f7ca5c03-f8d1-4472-9f3e-2b14bf79a852	9366c231-3e98-4e69-ba45-f2af170132fc	5	Knowledge sharing is intelligent, adaptive, and predictive. AI curates and delivers knowledge in real time based on need. The organization leads in knowledge management practices. Knowledge sharing drives innovation, resilience, and market leadership. Knowledge culture is sustained and benchmarked.
fb2c062a-534d-4094-ae89-797e6224a657	9736f206-f827-4a29-bdf7-bcf346d84cc1	9366c231-3e98-4e69-ba45-f2af170132fc	1	Kaizen or continuous improvement events are rare, ad hoc, or absent. Teams do not regularly review or improve processes. Improvement relies on crisis or external mandates. Momentum is lacking. Employees see improvement as management's job.
2358e849-2f50-4ef6-bc02-b020d4311641	9736f206-f827-4a29-bdf7-bcf346d84cc1	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some teams hold periodic Kaizen events or retrospectives. Participation varies and outcomes are mixed. Events are often project-driven rather than continuous. Improvement actions may not be tracked or sustained. Employees begin to see the value of involvement.
108ec19b-0d56-4919-a1ef-2a0abf3c0a57	9736f206-f827-4a29-bdf7-bcf346d84cc1	9366c231-3e98-4e69-ba45-f2af170132fc	3	Regular Kaizen events are scheduled and integrated into team routines. Teams proactively identify and address improvement opportunities. Outcomes are tracked and celebrated. Employees participate actively in Kaizen. Continuous improvement is visible and valued.
571d8beb-09c4-45e1-9912-56d68dd00be0	9736f206-f827-4a29-bdf7-bcf346d84cc1	9366c231-3e98-4e69-ba45-f2af170132fc	4	Kaizen is embedded in culture and management systems. Teams lead cross-functional Kaizen events. Digital tools support idea generation, prioritization, and implementation. Improvement actions are monitored and sustained. Leadership supports and recognizes Kaizen success.
b2ef703a-b36f-44a8-b4d0-e361294a7222	9736f206-f827-4a29-bdf7-bcf346d84cc1	9366c231-3e98-4e69-ba45-f2af170132fc	5	Kaizen is continuous, data-driven, and strategic. AI and advanced analytics identify opportunities for improvement in real time. Kaizen culture drives innovation, engagement, and competitiveness. The organization benchmarks Kaizen practices and leads in improvement excellence.
e76e5944-2f4b-4d87-a448-f4021391e3e6	8d20be56-545b-4caf-8f6f-8b0e8b48b7c1	9366c231-3e98-4e69-ba45-f2af170132fc	1	Improvements are rarely sustained. Gains from projects or events erode over time. Standardization and follow-up are lacking. Teams revert to old habits. Employees are skeptical about continuous improvement.
73348720-c42c-4502-aa9a-b3bad5a62ea1	8d20be56-545b-4caf-8f6f-8b0e8b48b7c1	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some improvements are sustained through basic documentation or supervision. Follow-up is inconsistent. Standardization is limited and rarely updated. Management occasionally reviews improvement outcomes. Sustainability is variable.
dc2e938f-9cae-4fa4-b668-f23293cc9591	8d20be56-545b-4caf-8f6f-8b0e8b48b7c1	9366c231-3e98-4e69-ba45-f2af170132fc	3	Processes are in place to sustain improvements, including standardized work, regular audits, and performance monitoring. Teams review and reinforce improvement outcomes. Training and coaching support sustainment. Improvement gains are measured and celebrated.
fa5757c8-16b7-44e6-a91a-f016180ab18b	8d20be56-545b-4caf-8f6f-8b0e8b48b7c1	9366c231-3e98-4e69-ba45-f2af170132fc	4	Sustainment is integrated with digital tools, automation, and daily management systems. Teams continuously monitor, adjust, and improve processes to retain gains. Leadership reinforces sustainment through recognition and accountability. Sustainability is a performance metric.
c0938744-3927-4142-88a7-0954396a25e4	8d20be56-545b-4caf-8f6f-8b0e8b48b7c1	9366c231-3e98-4e69-ba45-f2af170132fc	5	Sustaining improvements is strategic and adaptive. AI and advanced analytics monitor process performance and trigger sustainment actions. The organization benchmarks sustainment practices and supports a culture of continuous improvement. Gains are institutionalized and drive long-term value.
d604482b-3abb-4060-8042-def4fe8434ce	e2d6ffe4-3d11-4afc-be8f-72fdfe54db9a	9366c231-3e98-4e69-ba45-f2af170132fc	1	Improvements are localized and not standardized across teams or projects. Teams work with varying processes and tools. Best practices are rarely shared. Lack of standardization leads to variability and errors. Improvement gains are not fully realized.
090a557a-e6f0-4dbd-a946-5d30062808cf	e2d6ffe4-3d11-4afc-be8f-72fdfe54db9a	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some improvements are standardized within teams or projects. Standard work is documented but not always updated or shared. Adoption of best practices is inconsistent. Management begins to promote standardization. Employees recognize the value but face barriers.
6719fad1-3b7f-4754-af54-40ef50c53d76	e2d6ffe4-3d11-4afc-be8f-72fdfe54db9a	9366c231-3e98-4e69-ba45-f2af170132fc	3	Standardization of improvements is systematic and cross-functional. Teams collaborate to document and adopt best practices. Standard work is maintained, updated, and audited. Standardization supports quality, efficiency, and learning. Improvement gains are sustained and scaled.
d5323952-d921-4f73-bf05-fce04927e18a	e2d6ffe4-3d11-4afc-be8f-72fdfe54db9a	9366c231-3e98-4e69-ba45-f2af170132fc	4	Standardization is integrated with digital platforms and automation. Standard work is easily accessible, continuously updated, and embedded in workflows. Cross-team collaboration ensures rapid adoption of improvements. Standardization supports agility and innovation.
9aff9b60-2305-42cf-9fee-f1e2596f236c	e2d6ffe4-3d11-4afc-be8f-72fdfe54db9a	9366c231-3e98-4e69-ba45-f2af170132fc	5	Standardization is strategic, adaptive, and intelligent. AI and advanced analytics support dynamic standardization and sharing of improvements. The organization benchmarks and leads in standardization practices. Standardization drives operational excellence and competitiveness.
e15895a0-1c22-4757-a767-40ce70e01eab	23420937-ed1b-42a6-837d-204fb69daa08	9366c231-3e98-4e69-ba45-f2af170132fc	1	Audit and review systems are absent, informal, or reactive. Compliance is rarely checked. Issues are detected late or not at all. Employees see audits as punitive or irrelevant. Improvements are not tracked.
6ca8bc94-92f7-4a91-a769-dcdbcf357a8d	23420937-ed1b-42a6-837d-204fb69daa08	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic audit and review processes are introduced in some teams. Compliance is checked periodically but coverage and rigor are limited. Audit findings are inconsistently addressed. Employees begin to understand the value of audits.
3e121031-7ebd-491b-8642-7fd2533cb9b6	23420937-ed1b-42a6-837d-204fb69daa08	9366c231-3e98-4e69-ba45-f2af170132fc	3	Audit and review systems are formalized and cover key processes and controls. Audits are scheduled, objective, and linked to improvement actions. Results are communicated and tracked. Employees are engaged in audit preparation and follow-up.
8f5bda05-83d9-4e11-8467-bba11a4a3b95	23420937-ed1b-42a6-837d-204fb69daa08	9366c231-3e98-4e69-ba45-f2af170132fc	4	Audit and review systems are integrated with digital tools, automation, and risk management. Audits are data-driven, continuous, and predictive. Employees participate in audit design and execution. Audit outcomes drive improvement and learning.
00142fad-1a2c-4af4-ad0a-5e4b8b1ec491	23420937-ed1b-42a6-837d-204fb69daa08	9366c231-3e98-4e69-ba45-f2af170132fc	5	Audit and review systems are strategic, adaptive, and intelligent. AI and advanced analytics enable real-time auditing and benchmarking. The organization leads in audit and review practices. Audits support transparency, accountability, and sustained excellence.
29ea1dec-ede8-498d-9ae3-16a166b1ad6e	89ced00c-3ca3-4633-88a5-6ca7aae01968	9366c231-3e98-4e69-ba45-f2af170132fc	1	Continuous improvement is not part of daily thinking. Employees focus on routine work and resist change. Improvement is seen as extra work or management's responsibility. Mindset hinders innovation and adaptation.
0ef8e73a-d2ff-4324-9bd5-2e3bfa844035	89ced00c-3ca3-4633-88a5-6ca7aae01968	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some employees and teams develop a basic improvement mindset, often driven by specific leaders or projects. Improvement activities are sporadic and not sustained. Mindset shifts are localized and fragile. Management begins to model improvement thinking.
7698d363-d4fc-486e-b6f6-9b969e97d2b8	89ced00c-3ca3-4633-88a5-6ca7aae01968	9366c231-3e98-4e69-ba45-f2af170132fc	3	Continuous improvement mindset is evident across teams. Employees seek and act on improvement opportunities regularly. Learning, experimentation, and feedback are valued. Mindset supports agility and performance. Management reinforces improvement behaviors.
cc11b954-8647-4d7c-8dfa-e30223b29a16	89ced00c-3ca3-4633-88a5-6ca7aae01968	9366c231-3e98-4e69-ba45-f2af170132fc	4	Continuous improvement mindset is embedded in culture and supported by systems, training, and leadership. Employees challenge the status quo and drive change proactively. Innovation and learning are continuous and systematic. Mindset supports resilience and competitiveness.
86d722b9-9106-40e8-ac20-5f7e6a7dc9e1	89ced00c-3ca3-4633-88a5-6ca7aae01968	9366c231-3e98-4e69-ba45-f2af170132fc	5	Continuous improvement mindset is strategic, adaptive, and continuously developed. The organization leads in improvement culture and innovation. Employees are empowered to drive change at all levels. Mindset sustains high performance and market leadership.
c9106637-1276-4663-a5ab-049df810157c	e704cd9d-8f5d-49d0-bdfc-ab39447f45f3	9366c231-3e98-4e69-ba45-f2af170132fc	1	Coaching to sustain improvements is absent or informal. Teams revert to old practices after changes. Coaches, if any, are focused on implementation rather than sustainment. Employees lack support for sustaining gains.
8dfd125f-008a-4e9e-93a6-322e78cd3bd0	e704cd9d-8f5d-49d0-bdfc-ab39447f45f3	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some coaching is provided to sustain improvements but is inconsistent and limited to key teams. Coaches support follow-up and review. Sustainment is uneven. Employees begin to see the value of coaching for sustainment.
217391f1-64c7-4bc8-814f-a45160e17e65	e704cd9d-8f5d-49d0-bdfc-ab39447f45f3	9366c231-3e98-4e69-ba45-f2af170132fc	3	Coaching for sustainment is systematic, structured, and widely available. Coaches help teams embed improvements into daily work. Sustainment progress is tracked. Employees are encouraged and supported to maintain gains.
6188c4d3-fc75-446d-94f7-1f5c0250c6e9	e704cd9d-8f5d-49d0-bdfc-ab39447f45f3	9366c231-3e98-4e69-ba45-f2af170132fc	4	Coaching for sustainment is integrated with management systems, automation, and digital tools. Coaches support continuous adaptation and learning. Sustainment is reinforced through coaching, recognition, and accountability.
1d0131e2-3577-4b01-9001-02fad9e918cd	e704cd9d-8f5d-49d0-bdfc-ab39447f45f3	9366c231-3e98-4e69-ba45-f2af170132fc	5	Coaching for sustainment is strategic, adaptive, and benchmarked. AI and advanced analytics support personalized coaching and sustainment actions. The organization leads in coaching for sustainment. Coaching drives resilience and long-term value.
6f8100b6-5b15-4825-b655-0e29755999b7	04d4a496-a5a9-423f-aa7b-472fc42dce7d	9366c231-3e98-4e69-ba45-f2af170132fc	1	Lean knowledge is lost when employees leave or projects end. Documentation and sharing are inconsistent. Organizational memory is weak. Relearning and repeated mistakes are common. Retention is not prioritized.
a884f9e6-fe82-4527-9dcc-9475e1cc3e5b	04d4a496-a5a9-423f-aa7b-472fc42dce7d	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some teams begin to retain Lean knowledge through documentation or knowledge bases. Retention is localized and dependent on individual effort. Onboarding includes some Lean content. Knowledge is at risk during transitions.
df63e24b-f0fb-41fe-8b09-23e84e411e7c	04d4a496-a5a9-423f-aa7b-472fc42dce7d	9366c231-3e98-4e69-ba45-f2af170132fc	3	Lean knowledge retention is systematic, supported by formal documentation, training, and knowledge sharing systems. Knowledge is transferred during onboarding and handovers. Retention is monitored and reviewed regularly.
8d14ec3e-161c-4526-9844-192fe0c8240c	04d4a496-a5a9-423f-aa7b-472fc42dce7d	9366c231-3e98-4e69-ba45-f2af170132fc	4	Lean knowledge retention is integrated with digital platforms, automation, and knowledge management. AI supports curation and distribution of Lean knowledge. Employees contribute to retention efforts. Retention is part of talent and succession planning.
74852460-7795-43d6-8af0-d6954a0306d4	04d4a496-a5a9-423f-aa7b-472fc42dce7d	9366c231-3e98-4e69-ba45-f2af170132fc	5	Lean knowledge retention is strategic, adaptive, and benchmarked. The organization leads in Lean knowledge management and sharing. Retention drives continuous improvement, innovation, and resilience. Knowledge is retained and grown across generations.
498cde7f-feb1-4dbe-a68e-6bc74bf2e2cb	1f0748b2-06f1-4a41-a8e4-3e5dc99ab838	9366c231-3e98-4e69-ba45-f2af170132fc	1	Talent development for Lean is absent or ad hoc. Employees lack structured learning paths for Lean or Agile skills. Career progression is unrelated to Lean capability. Talent gaps hinder improvement efforts.
74b601b7-6558-4b3a-9a03-2815248a5116	1f0748b2-06f1-4a41-a8e4-3e5dc99ab838	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some Lean talent development activities are introduced, such as training or workshops. Talent identification and development are limited. Employees have uneven access to development opportunities. Management begins to recognize Lean skills.
5504ab09-c3ea-4964-8038-154feb563ef3	1f0748b2-06f1-4a41-a8e4-3e5dc99ab838	9366c231-3e98-4e69-ba45-f2af170132fc	3	Talent development for Lean is formalized with structured learning paths, coaching, and career development. Employees receive feedback and recognition for Lean capability. Lean talent supports improvement and innovation.
553cc022-3dec-47c6-a8ee-91a5cb74ddd6	1f0748b2-06f1-4a41-a8e4-3e5dc99ab838	9366c231-3e98-4e69-ba45-f2af170132fc	4	Talent development is integrated with recruitment, performance management, and succession planning. Employees are supported to grow Lean expertise at all levels. Talent pipelines are managed proactively. Leadership models and rewards Lean development.
e014703e-945c-497d-895f-f1642e921c79	1f0748b2-06f1-4a41-a8e4-3e5dc99ab838	9366c231-3e98-4e69-ba45-f2af170132fc	5	Talent development for Lean is strategic, adaptive, and continuously improved. The organization leads in Lean talent development and capability building. Employees drive Lean innovation and culture. Talent development sustains performance and competitiveness.
f10a5add-3485-4053-900b-b2b37a23ba4a	285455c6-23b9-462d-b798-cf308a786fd2	9366c231-3e98-4e69-ba45-f2af170132fc	1	Environmental sustainability is not considered in IT strategy, processes, or projects. Resource consumption and waste are unmanaged. Employees lack awareness of environmental impact.
108d1513-3da9-47ec-89f1-a4b4cd762489	285455c6-23b9-462d-b798-cf308a786fd2	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some environmental sustainability initiatives are piloted, such as energy-efficient hardware or e-waste reduction. Awareness and engagement are limited. Impact is localized and not measured. Management begins to recognize sustainability importance.
f16c4c2d-b785-49f8-b174-69e6f7419921	285455c6-23b9-462d-b798-cf308a786fd2	9366c231-3e98-4e69-ba45-f2af170132fc	3	Environmental sustainability is integrated into IT processes and projects. Metrics track energy use, waste, and resource efficiency. Teams participate in sustainability improvement initiatives. Results are reported and recognized.
47f5f45d-71e2-4340-9f3d-c64cb56aca22	285455c6-23b9-462d-b798-cf308a786fd2	9366c231-3e98-4e69-ba45-f2af170132fc	4	Environmental sustainability is strategic, supported by digital tools, automation, and analytics. IT aligns with corporate sustainability goals. Employees are engaged in sustainability innovation and advocacy. Sustainability performance drives value.
8e35bf60-85da-4ad4-a237-565eb417c9d9	285455c6-23b9-462d-b798-cf308a786fd2	9366c231-3e98-4e69-ba45-f2af170132fc	5	Environmental sustainability is embedded in IT culture, strategy, and operations. AI and advanced analytics optimize resource use and minimize impact. The organization leads in sustainable IT practices. Sustainability is a source of competitive advantage and brand value.
b81152d2-affb-45f4-8db0-a0c66eb7cfb1	18f93409-11df-4885-a3dc-64acda991451	9366c231-3e98-4e69-ba45-f2af170132fc	1	Engagement with community, customers, or stakeholders is minimal or absent. Feedback is rare and reactive. IT is seen as isolated or unresponsive. External relationships are transactional.
02365dc8-8eee-4565-b557-55c9ca72e058	18f93409-11df-4885-a3dc-64acda991451	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some stakeholder engagement occurs through surveys, forums, or pilot programs. Feedback is collected but not always acted on. Engagement is inconsistent and not strategic. Value of external input is recognized.
9ac4589e-d83b-4ea1-a2e0-0cf894359a0b	18f93409-11df-4885-a3dc-64acda991451	9366c231-3e98-4e69-ba45-f2af170132fc	3	Stakeholder engagement is systematic and supports continuous improvement. Regular feedback loops inform IT strategy, projects, and processes. Communities of practice are established. Engagement outcomes are communicated and acted on.
57f96a25-cec0-498d-8e46-2ec7d5a8bbd4	18f93409-11df-4885-a3dc-64acda991451	9366c231-3e98-4e69-ba45-f2af170132fc	4	Stakeholder engagement is integrated with governance, performance management, and innovation. Partnerships with customers, community, and industry drive improvement and learning. Engagement is proactive, inclusive, and sustained.
baf0306a-ddae-4b7f-96fa-99c4a6cf3075	18f93409-11df-4885-a3dc-64acda991451	9366c231-3e98-4e69-ba45-f2af170132fc	5	Community and stakeholder engagement is strategic, adaptive, and benchmarked. The organization leads in collaborative improvement and innovation. Engagement drives value, reputation, and influence. IT is recognized as a trusted partner and leader.
286395f8-9974-4076-859d-312e12256a99	48103a2b-2e31-4001-9f8e-66ebeec5f84e	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some customer focus initiatives are introduced, such as user surveys or feedback sessions. Customer input informs projects inconsistently. Employees begin to recognize customer value. Customer satisfaction is measured in select areas.
ee06fe5a-6e18-4f6b-a489-f360749dbf94	48103a2b-2e31-4001-9f8e-66ebeec5f84e	9366c231-3e98-4e69-ba45-f2af170132fc	3	Customer focus is embedded in IT processes and improvement initiatives. Regular feedback informs design, delivery, and support. Metrics track customer value and satisfaction. Customer needs drive prioritization and improvement.
89a47e1a-5c63-4975-9a19-fd853d9859d3	48103a2b-2e31-4001-9f8e-66ebeec5f84e	9366c231-3e98-4e69-ba45-f2af170132fc	4	Customer focus is integrated with strategy, governance, and performance management. Cross-functional teams collaborate with customers to co-create value. Customer advocacy is part of culture and leadership. Customer focus drives differentiation.
5ee8b7d0-a58f-4a03-bb70-f8c4f5e50daa	48103a2b-2e31-4001-9f8e-66ebeec5f84e	9366c231-3e98-4e69-ba45-f2af170132fc	5	Customer focus in processes is strategic, adaptive, and benchmarked. The organization leads in customer-centric IT practices. Customer insight drives continuous improvement, innovation, and competitiveness. Customer value is sustained and recognized.
4d77f6b4-980f-4c0c-8a4d-3b3716e85e73	ec8ac10f-c10c-4ff2-95d9-da990ae2b4a2	9366c231-3e98-4e69-ba45-f2af170132fc	1	Suppliers are managed transactionally, with limited communication or collaboration. Integration with IT processes is minimal. Supplier performance and improvement are not tracked. Relationships are price-focused.
25f45edc-b35a-4f59-85a1-3e0715cebf72	ec8ac10f-c10c-4ff2-95d9-da990ae2b4a2	9366c231-3e98-4e69-ba45-f2af170132fc	2	Some supplier integration initiatives are piloted, such as joint projects or information sharing. Collaboration is inconsistent and ad hoc. Supplier performance is measured in select areas. Value of integration is recognized.
c90c1266-1a87-447a-b3d9-2cbb217967e8	ec8ac10f-c10c-4ff2-95d9-da990ae2b4a2	9366c231-3e98-4e69-ba45-f2af170132fc	3	Supplier integration is systematic and aligned with IT strategy and processes. Collaboration includes joint improvement and innovation initiatives. Supplier metrics and feedback inform performance management. Integration supports value and risk management.
a83026e4-6b78-4cdc-9328-8436740f4236	ec8ac10f-c10c-4ff2-95d9-da990ae2b4a2	9366c231-3e98-4e69-ba45-f2af170132fc	4	Supplier integration is proactive, strategic, and supported by digital tools. Joint governance, knowledge sharing, and performance improvement are routine. Suppliers are engaged as partners in value creation. Integration extends to risk and sustainability.
6f0ea1b0-f2fb-467e-a582-9a3b6c41e38d	ec8ac10f-c10c-4ff2-95d9-da990ae2b4a2	9366c231-3e98-4e69-ba45-f2af170132fc	5	Supplier integration is intelligent, adaptive, and benchmarked. The organization leads in supplier collaboration and innovation. AI and analytics support integrated management. Supplier integration drives resilience, value, and competitiveness.
d2d9ca90-b152-4f9e-9105-90448deda474	2d5a99f8-322b-43e2-ab38-8aba7e02e8ae	9366c231-3e98-4e69-ba45-f2af170132fc	1	Inventory management for hardware, software, or digital assets is informal or absent. Visibility, control, and tracking are limited. Losses and inefficiencies are common. Inventory data is unreliable or unavailable.
48720b1c-e514-465a-a826-321ef0731f3b	2d5a99f8-322b-43e2-ab38-8aba7e02e8ae	9366c231-3e98-4e69-ba45-f2af170132fc	2	Basic inventory management practices and tools are introduced. Asset tracking and reporting improve but are not comprehensive. Inventory control is localized. Data quality and usage vary. Losses decrease but challenges remain.
cb23a08a-3e03-4a80-a3c4-3e78ada3c2d5	2d5a99f8-322b-43e2-ab38-8aba7e02e8ae	9366c231-3e98-4e69-ba45-f2af170132fc	3	Inventory management is formalized and supported by digital systems. Inventory data is accurate, accessible, and updated regularly. Processes for procurement, usage, and disposal are standardized. Inventory supports efficiency and risk management.
648f9d4b-0657-47a2-83b6-f033deec85c6	2d5a99f8-322b-43e2-ab38-8aba7e02e8ae	9366c231-3e98-4e69-ba45-f2af170132fc	4	Inventory management is integrated with IT and business processes. Automation, analytics, and real-time tracking enhance control and optimization. Inventory planning supports demand, capacity, and lifecycle management. Inventory management drives value.
82f9409f-47a7-4e57-a3da-53003a3a4307	2d5a99f8-322b-43e2-ab38-8aba7e02e8ae	9366c231-3e98-4e69-ba45-f2af170132fc	5	Inventory management is intelligent, predictive, and strategic. AI and advanced analytics optimize inventory and prevent losses. Inventory integrates with partners and supply chain. The organization leads in inventory management practices. Inventory management supports innovation, resilience, and competitiveness.
\.


--
-- Data for Name: Score; Type: TABLE DATA; Schema: public; Owner: akerim
--

COPY public."Score" (id, "assessmentId", "dimensionId", level, quantitative, notes, perception, "auditTrail") FROM stdin;
79c0c8f0-0759-42be-bc08-cff1c04f4c88	fcccf485-0fa8-4192-b585-94d5ddca5528	e2a5ce07-95e6-43d6-9661-b9725224ea14	3	\N	Leadership somewhat engaged; room for improvement.	t	Self-assessed during workshop.
865b51da-b09e-47a2-92c7-a59fefc6148c	fcccf485-0fa8-4192-b585-94d5ddca5528	0d4c96ba-2310-4845-be17-18ac2649ba17	2	\N	Coaching is inconsistent and informal.	t	Based on supervisor interviews.
10c89250-fd2d-4725-ac95-242f8e82ad71	f4108f77-b4d7-4b71-8f53-453efa01171e	e2a5ce07-95e6-43d6-9661-b9725224ea14	2	\N	\N	t	\N
e757839e-5537-4487-bcbe-35a80d425f1a	f4108f77-b4d7-4b71-8f53-453efa01171e	0d4c96ba-2310-4845-be17-18ac2649ba17	1	\N	\N	t	\N
4998f321-acd8-469c-b5bc-8834a45aa1eb	f4108f77-b4d7-4b71-8f53-453efa01171e	92201d62-545e-4e6a-8090-8bd9ae5dede4	0	\N	\N	t	\N
465f2ce6-703d-4bef-934b-11bf5ace5a09	8146b973-9635-4d06-b12c-cf08ebcb4832	92201d62-545e-4e6a-8090-8bd9ae5dede4	5	\N	\N	t	\N
3393930e-461a-4300-8f4a-7c731a3937c7	8146b973-9635-4d06-b12c-cf08ebcb4832	e2a5ce07-95e6-43d6-9661-b9725224ea14	1	\N	\N	t	\N
4894d423-c1f9-4d21-b9fc-d4a0d1594687	8146b973-9635-4d06-b12c-cf08ebcb4832	0d4c96ba-2310-4845-be17-18ac2649ba17	5	\N	\N	t	\N
9f5fe3cd-8894-4612-b232-0e0ce402057b	8146b973-9635-4d06-b12c-cf08ebcb4832	7b93928d-7124-4178-81ba-7fd3e8c44b5f	5	\N	\N	t	\N
34d086c4-da04-47c1-9175-99a904273334	8146b973-9635-4d06-b12c-cf08ebcb4832	0bd54a90-bb87-475f-b0b2-0304d193f079	1	\N	\N	t	\N
540ca076-89b0-4c07-8253-98be48671c32	8146b973-9635-4d06-b12c-cf08ebcb4832	77a2a2d3-b62a-4ceb-960c-effe280afb58	1	\N	\N	t	\N
134f115e-1c04-4078-8d4a-756a407b8622	8146b973-9635-4d06-b12c-cf08ebcb4832	02c5352b-aac5-441e-ac61-389327b36699	2	\N	\N	t	\N
a841f812-587d-4fe7-a49a-3da952d2b4f7	8146b973-9635-4d06-b12c-cf08ebcb4832	062d519e-84bc-4b0d-afbd-9380ba6efe74	1	\N	\N	t	\N
4f7ab0e4-8f2b-4deb-a5b8-3e7173891d0a	8146b973-9635-4d06-b12c-cf08ebcb4832	795e95da-bf34-4d5a-bdb7-5c1b3abbdf4d	1	\N	\N	t	\N
77a13de1-aba6-4c73-b90d-f4d6ad1437dd	8146b973-9635-4d06-b12c-cf08ebcb4832	8f6ac78f-a85f-4db1-aa13-4358d9889307	2	\N	\N	t	\N
1683e90c-9fe9-4982-a5b3-d2cea6c4504f	8146b973-9635-4d06-b12c-cf08ebcb4832	20b17ce3-1ba2-492d-bf8a-d0825732f30d	1	\N	\N	t	\N
feaf87a2-c61b-4c57-94a5-e89e1bca6882	8146b973-9635-4d06-b12c-cf08ebcb4832	58535f3c-a9a4-4140-8f9e-ba9be09fd960	1	\N	\N	t	\N
6e566a0f-2097-43e6-b0b5-4bddd4ff778d	8146b973-9635-4d06-b12c-cf08ebcb4832	f9e4db45-4fb2-42e7-aedb-b855c3a40009	1	\N	\N	t	\N
a67f032f-8817-4ef5-a18f-0d4f3169d593	8146b973-9635-4d06-b12c-cf08ebcb4832	0abd0641-af52-4ac9-ad2e-de4e1c3417c6	2	\N	\N	t	\N
f799efb7-5646-4fc0-b5db-c11f2517bdeb	8146b973-9635-4d06-b12c-cf08ebcb4832	2b65a306-c3e1-43b8-932d-36e0dc54c04e	1	\N	\N	t	\N
dcfdd7ef-d5d8-4120-9ab2-384d8029ef6d	8146b973-9635-4d06-b12c-cf08ebcb4832	e4a30c23-f8d8-43fe-9aa3-d8c6b8777824	1	\N	\N	t	\N
31348fe7-ddc2-4dff-9f52-5faf703d0dd9	8146b973-9635-4d06-b12c-cf08ebcb4832	091b944c-5190-4f3e-9d63-e956c753bd25	2	\N	\N	t	\N
89621eca-348e-41fe-81c4-f9236ca6fabc	8146b973-9635-4d06-b12c-cf08ebcb4832	b4cf441b-dd3b-4b01-a399-cbc5c896f7cd	2	\N	\N	t	\N
c866794c-e061-4b1e-bf16-ea34e114eafc	8146b973-9635-4d06-b12c-cf08ebcb4832	69490414-4d70-4d6c-ad60-5ce67f13ed0a	4	\N	\N	t	\N
49d39397-c3fc-497e-8b3a-3e54772e2d4f	8146b973-9635-4d06-b12c-cf08ebcb4832	7a3a14ee-f7fb-4b79-bbd6-1cae83547035	1	\N	\N	t	\N
b22e7fdb-61ad-474b-97f8-b385ecfdf502	8146b973-9635-4d06-b12c-cf08ebcb4832	ee620d7c-7967-4480-9159-247922f818d0	2	\N	\N	t	\N
4ea721d6-f2b0-4384-9766-9eea1dda1235	8146b973-9635-4d06-b12c-cf08ebcb4832	8c561260-700e-4367-a737-cc871d0464db	4	\N	\N	t	\N
be96aea1-6eae-41aa-bf30-7fcba03724bb	8146b973-9635-4d06-b12c-cf08ebcb4832	488ed678-2de4-40dc-8d90-3edc49dd0018	4	\N	\N	t	\N
680e51cf-35d7-4261-b515-a9ceb43fe7dc	8146b973-9635-4d06-b12c-cf08ebcb4832	5033963a-c115-45f0-9aab-9515ba86c71d	4	\N	\N	t	\N
3fe60da9-1279-4d67-95aa-3fb36362c2cb	8146b973-9635-4d06-b12c-cf08ebcb4832	dcde670c-8967-4ff9-ae82-ac858b346e0a	2	\N	\N	t	\N
7b525804-9452-4b2f-81ca-d4b54ee56573	8146b973-9635-4d06-b12c-cf08ebcb4832	feda22e4-33da-4a6e-be71-6e70bf6629fd	4	\N	\N	t	\N
597f9e8d-5fb9-4751-b083-9aca60819ebb	8146b973-9635-4d06-b12c-cf08ebcb4832	f6bafa2b-58dc-4dcf-a14f-7f8d79af5de0	4	\N	\N	t	\N
2a36af12-b7b3-4c61-87c8-14012fda4f66	8146b973-9635-4d06-b12c-cf08ebcb4832	5c0f18fb-5356-42bf-8ba8-7af409188bd8	4	\N	\N	t	\N
15e0ebdc-d1d4-4277-a16b-d2f389ccc18b	8146b973-9635-4d06-b12c-cf08ebcb4832	e46f9477-7978-4478-ae4a-0ce184784132	4	\N	\N	t	\N
c38b0f8a-b09e-47b0-aecd-76250d92af39	8146b973-9635-4d06-b12c-cf08ebcb4832	5b7d0a11-2cee-4f9c-bd13-41a906556df2	1	\N	\N	t	\N
0ea7ca8e-5192-47dc-8440-4ad27e324e5e	8146b973-9635-4d06-b12c-cf08ebcb4832	f43ffdbb-6f21-41e2-b632-085c54a3a017	1	\N	\N	t	\N
5638a5c8-32d5-4ae0-ab8c-785f2f0b9d4c	8146b973-9635-4d06-b12c-cf08ebcb4832	76150fde-d123-4cd9-8b08-45f86005e634	2	\N	\N	t	\N
dc187562-c8e8-4028-b0c8-65ca0c9dd0d7	8146b973-9635-4d06-b12c-cf08ebcb4832	fbfbcc6a-7100-4b77-9d01-390a1f934b72	4	\N	\N	t	\N
d7a11282-6819-4a67-84cd-8152d7b1d155	8146b973-9635-4d06-b12c-cf08ebcb4832	3ce2329c-7ba9-4e36-94b4-7a1d35644df6	1	\N	\N	t	\N
ccefe530-904b-4cca-b43c-f831b71be7bb	8146b973-9635-4d06-b12c-cf08ebcb4832	23817509-c27c-47a6-af8b-3a75376a915a	1	\N	\N	t	\N
d9fa88ca-5a04-481f-bf81-07707d74c641	8146b973-9635-4d06-b12c-cf08ebcb4832	b8186bad-6675-419f-b78a-d4c1a08ca69f	2	\N	\N	t	\N
05d9864b-0baa-4a54-af97-c595aa018f97	8146b973-9635-4d06-b12c-cf08ebcb4832	2d5a99f8-322b-43e2-ab38-8aba7e02e8ae	2	\N	\N	t	\N
22703ace-05a3-4197-afe6-cea931aba406	8146b973-9635-4d06-b12c-cf08ebcb4832	ec8ac10f-c10c-4ff2-95d9-da990ae2b4a2	3	\N	\N	t	\N
3b39ed03-b4a9-405f-9906-212c97404adc	8146b973-9635-4d06-b12c-cf08ebcb4832	48103a2b-2e31-4001-9f8e-66ebeec5f84e	1	\N	\N	t	\N
ac650c96-a22b-4011-9b4d-826f60144e84	8146b973-9635-4d06-b12c-cf08ebcb4832	e4e17b92-c77a-47d2-9261-ee81d2551ed2	1	\N	\N	t	\N
67455093-8553-480a-ad83-dc76f2d7aad4	8146b973-9635-4d06-b12c-cf08ebcb4832	901731b0-42b9-401d-8c81-4c8b6a0d079e	1	\N	\N	t	\N
cdb0beae-edca-4b92-a21b-ff9c05dd5566	8146b973-9635-4d06-b12c-cf08ebcb4832	c90625cb-5cd6-4c32-badc-a36e0a46e2e2	1	\N	\N	t	\N
a4c2f6b4-83ce-442a-aa72-134983c5613b	8146b973-9635-4d06-b12c-cf08ebcb4832	b4191d07-1030-465d-b8bb-a3cfa60884af	1	\N	\N	t	\N
873e2925-2aee-4a05-abbc-923c613b0d21	8146b973-9635-4d06-b12c-cf08ebcb4832	f3a017de-5501-4e00-9d41-1e4538574db7	3	\N	\N	t	\N
1058aa81-6a53-4f3d-a550-5dbc5efc8165	8146b973-9635-4d06-b12c-cf08ebcb4832	73aad573-76aa-43a0-9063-3501390d387c	2	\N	\N	t	\N
93520502-e367-44d4-a634-9eafd698bd90	8146b973-9635-4d06-b12c-cf08ebcb4832	dfd27eb0-8d33-471e-8d3a-06d2ed158ef0	1	\N	\N	t	\N
3aa643d4-bc1e-4564-b0ac-7c7f9b910ddf	8146b973-9635-4d06-b12c-cf08ebcb4832	f7ca5c03-f8d1-4472-9f3e-2b14bf79a852	1	\N	\N	t	\N
24e7ac9e-dad2-41e2-9866-c9898b5a47b4	8146b973-9635-4d06-b12c-cf08ebcb4832	9736f206-f827-4a29-bdf7-bcf346d84cc1	1	\N	\N	t	\N
0552ae04-049e-48db-8df3-c7a4bc5f2223	8146b973-9635-4d06-b12c-cf08ebcb4832	8d20be56-545b-4caf-8f6f-8b0e8b48b7c1	1	\N	\N	t	\N
d917bae0-64b5-4c41-862d-051ffa55ac0b	8146b973-9635-4d06-b12c-cf08ebcb4832	e2d6ffe4-3d11-4afc-be8f-72fdfe54db9a	1	\N	\N	t	\N
5e427490-28c0-49bc-9f58-ff76a2b6b9c5	8146b973-9635-4d06-b12c-cf08ebcb4832	23420937-ed1b-42a6-837d-204fb69daa08	4	\N	\N	t	\N
ad44c915-80b9-4b3f-b698-7cff97084b8d	8146b973-9635-4d06-b12c-cf08ebcb4832	89ced00c-3ca3-4633-88a5-6ca7aae01968	2	\N	\N	t	\N
66a69100-8011-4eaa-be98-3dbbe3b9d063	8146b973-9635-4d06-b12c-cf08ebcb4832	e704cd9d-8f5d-49d0-bdfc-ab39447f45f3	2	\N	\N	t	\N
8fe51ca0-9e9b-4526-af68-ecaf0f8c9958	8146b973-9635-4d06-b12c-cf08ebcb4832	1f0748b2-06f1-4a41-a8e4-3e5dc99ab838	1	\N	\N	t	\N
99272e72-bb2d-4480-a28e-da3731a14672	8146b973-9635-4d06-b12c-cf08ebcb4832	04d4a496-a5a9-423f-aa7b-472fc42dce7d	1	\N	\N	t	\N
b74d0aaf-26d3-4579-b154-bdbe7e671bc8	8146b973-9635-4d06-b12c-cf08ebcb4832	285455c6-23b9-462d-b798-cf308a786fd2	1	\N	\N	t	\N
83e36492-e8fb-4396-b919-b8ec17971abc	8146b973-9635-4d06-b12c-cf08ebcb4832	18f93409-11df-4885-a3dc-64acda991451	1	\N	\N	t	\N
36d06755-5a8c-45f1-8e00-7abbf83d7bf3	24295877-7892-4655-8625-a35fa3c5cf87	92201d62-545e-4e6a-8090-8bd9ae5dede4	5	\N	\N	t	\N
1f668251-ab78-4f71-b60e-fae7befd69ed	24295877-7892-4655-8625-a35fa3c5cf87	e2a5ce07-95e6-43d6-9661-b9725224ea14	1	\N	\N	t	\N
e712e6f8-8d32-4bfe-bd0c-df4eabec6189	24295877-7892-4655-8625-a35fa3c5cf87	0d4c96ba-2310-4845-be17-18ac2649ba17	5	\N	\N	t	\N
f375fd08-6a2c-4e6e-bb07-835c5a2b177d	24295877-7892-4655-8625-a35fa3c5cf87	7b93928d-7124-4178-81ba-7fd3e8c44b5f	5	\N	\N	t	\N
bd060d9d-4234-4d60-bd9b-5438ea897741	24295877-7892-4655-8625-a35fa3c5cf87	0bd54a90-bb87-475f-b0b2-0304d193f079	1	\N	\N	t	\N
0b3941d6-022a-4b4a-adad-57f194bcfa47	24295877-7892-4655-8625-a35fa3c5cf87	77a2a2d3-b62a-4ceb-960c-effe280afb58	1	\N	\N	t	\N
a94e9354-ee22-47ef-a1fd-0f387e77353a	24295877-7892-4655-8625-a35fa3c5cf87	02c5352b-aac5-441e-ac61-389327b36699	2	\N	\N	t	\N
fd25a714-cd9d-499e-b5e7-fb018b23744f	24295877-7892-4655-8625-a35fa3c5cf87	062d519e-84bc-4b0d-afbd-9380ba6efe74	1	\N	\N	t	\N
95a07c25-115e-42a0-bba1-40846ddbc771	24295877-7892-4655-8625-a35fa3c5cf87	795e95da-bf34-4d5a-bdb7-5c1b3abbdf4d	1	\N	\N	t	\N
bb324772-c1d8-45e3-81a4-c12cf3c82661	24295877-7892-4655-8625-a35fa3c5cf87	8f6ac78f-a85f-4db1-aa13-4358d9889307	2	\N	\N	t	\N
40b98b13-2893-42a4-9442-abd72a7ece3e	24295877-7892-4655-8625-a35fa3c5cf87	20b17ce3-1ba2-492d-bf8a-d0825732f30d	1	\N	\N	t	\N
22b38618-0092-4e92-926a-aaa616a946f8	24295877-7892-4655-8625-a35fa3c5cf87	58535f3c-a9a4-4140-8f9e-ba9be09fd960	1	\N	\N	t	\N
999e32c9-d84f-4e74-a199-baa01de8a807	24295877-7892-4655-8625-a35fa3c5cf87	f9e4db45-4fb2-42e7-aedb-b855c3a40009	1	\N	\N	t	\N
29edc9f7-8ddc-4a42-9deb-29915dc266e3	24295877-7892-4655-8625-a35fa3c5cf87	0abd0641-af52-4ac9-ad2e-de4e1c3417c6	2	\N	\N	t	\N
7bc09212-10ed-4761-820a-713f76f4a447	24295877-7892-4655-8625-a35fa3c5cf87	2b65a306-c3e1-43b8-932d-36e0dc54c04e	1	\N	\N	t	\N
e5cd1d65-4f7c-4905-add9-ee2735069370	24295877-7892-4655-8625-a35fa3c5cf87	e4a30c23-f8d8-43fe-9aa3-d8c6b8777824	1	\N	\N	t	\N
33ccda2b-f41f-49ea-a666-863c7959256b	24295877-7892-4655-8625-a35fa3c5cf87	091b944c-5190-4f3e-9d63-e956c753bd25	2	\N	\N	t	\N
318030a7-4dbb-4b0c-a6cc-90838f1636bf	24295877-7892-4655-8625-a35fa3c5cf87	b4cf441b-dd3b-4b01-a399-cbc5c896f7cd	2	\N	\N	t	\N
cb1591ee-e4a1-47ac-9b7f-8a8419cbfc3b	24295877-7892-4655-8625-a35fa3c5cf87	69490414-4d70-4d6c-ad60-5ce67f13ed0a	4	\N	\N	t	\N
cead4808-6d46-4e5d-8b01-3544f09851f0	24295877-7892-4655-8625-a35fa3c5cf87	7a3a14ee-f7fb-4b79-bbd6-1cae83547035	1	\N	\N	t	\N
71cac651-d0ef-48cc-89a7-c9e69f823958	24295877-7892-4655-8625-a35fa3c5cf87	ee620d7c-7967-4480-9159-247922f818d0	2	\N	\N	t	\N
70375eb4-8375-4623-a5e1-5498609e1a42	24295877-7892-4655-8625-a35fa3c5cf87	8c561260-700e-4367-a737-cc871d0464db	4	\N	\N	t	\N
7d4808fa-799e-455f-886a-db9ee33d34d1	24295877-7892-4655-8625-a35fa3c5cf87	488ed678-2de4-40dc-8d90-3edc49dd0018	4	\N	\N	t	\N
14d786ff-2b00-4e88-834e-d8ffe267300f	24295877-7892-4655-8625-a35fa3c5cf87	5033963a-c115-45f0-9aab-9515ba86c71d	4	\N	\N	t	\N
fc7afef6-ef52-41ee-ab57-b0488bbbd033	24295877-7892-4655-8625-a35fa3c5cf87	dcde670c-8967-4ff9-ae82-ac858b346e0a	2	\N	\N	t	\N
2da3c59d-66db-4590-9661-afbe81a5aee1	24295877-7892-4655-8625-a35fa3c5cf87	feda22e4-33da-4a6e-be71-6e70bf6629fd	4	\N	\N	t	\N
05e92288-482d-48bf-bdb2-335307ac2c87	24295877-7892-4655-8625-a35fa3c5cf87	f6bafa2b-58dc-4dcf-a14f-7f8d79af5de0	4	\N	\N	t	\N
6fdb9993-a454-48da-ab9c-a14e5072d54f	24295877-7892-4655-8625-a35fa3c5cf87	5c0f18fb-5356-42bf-8ba8-7af409188bd8	4	\N	\N	t	\N
549d4a84-313a-4de2-bdcb-246366872066	24295877-7892-4655-8625-a35fa3c5cf87	e46f9477-7978-4478-ae4a-0ce184784132	4	\N	\N	t	\N
2313e514-4f12-471b-884f-172df81793cc	24295877-7892-4655-8625-a35fa3c5cf87	5b7d0a11-2cee-4f9c-bd13-41a906556df2	1	\N	\N	t	\N
97b2a56e-fbd5-41ee-b5d7-e0d6d5de70a7	24295877-7892-4655-8625-a35fa3c5cf87	f43ffdbb-6f21-41e2-b632-085c54a3a017	1	\N	\N	t	\N
56fd85ea-e7cc-41ee-b92a-8caaa9045fcd	24295877-7892-4655-8625-a35fa3c5cf87	76150fde-d123-4cd9-8b08-45f86005e634	2	\N	\N	t	\N
a679874f-0f99-4af0-964e-d7feb8ae2c4f	24295877-7892-4655-8625-a35fa3c5cf87	fbfbcc6a-7100-4b77-9d01-390a1f934b72	4	\N	\N	t	\N
9f5e081e-3db9-4d2c-b36c-19874206a94b	24295877-7892-4655-8625-a35fa3c5cf87	3ce2329c-7ba9-4e36-94b4-7a1d35644df6	1	\N	\N	t	\N
f09dbebb-ca72-4efa-a277-9362da109e54	24295877-7892-4655-8625-a35fa3c5cf87	23817509-c27c-47a6-af8b-3a75376a915a	1	\N	\N	t	\N
565f2562-db97-4d11-b33a-517757a4cbbc	24295877-7892-4655-8625-a35fa3c5cf87	b8186bad-6675-419f-b78a-d4c1a08ca69f	2	\N	\N	t	\N
55bff312-0da2-4d16-8388-637dc243eead	24295877-7892-4655-8625-a35fa3c5cf87	2d5a99f8-322b-43e2-ab38-8aba7e02e8ae	2	\N	\N	t	\N
cf785c79-d0b7-4f1f-8bdc-f05653102929	24295877-7892-4655-8625-a35fa3c5cf87	ec8ac10f-c10c-4ff2-95d9-da990ae2b4a2	3	\N	\N	t	\N
d8d33b09-c1e6-4c58-b3e2-4ddd8409b9fd	24295877-7892-4655-8625-a35fa3c5cf87	48103a2b-2e31-4001-9f8e-66ebeec5f84e	1	\N	\N	t	\N
22b051c4-220b-48ef-988d-a454ab75ceb8	24295877-7892-4655-8625-a35fa3c5cf87	e4e17b92-c77a-47d2-9261-ee81d2551ed2	1	\N	\N	t	\N
869c623a-d47f-4d7f-b12d-31b59699558a	24295877-7892-4655-8625-a35fa3c5cf87	901731b0-42b9-401d-8c81-4c8b6a0d079e	1	\N	\N	t	\N
5ec2933e-eb4d-4644-9cea-7f94f475daef	24295877-7892-4655-8625-a35fa3c5cf87	c90625cb-5cd6-4c32-badc-a36e0a46e2e2	1	\N	\N	t	\N
d6774d00-6a04-40d3-b451-0b1d0ff71238	24295877-7892-4655-8625-a35fa3c5cf87	b4191d07-1030-465d-b8bb-a3cfa60884af	1	\N	\N	t	\N
08efb57a-7377-413c-a7f8-ae5b9794adf9	24295877-7892-4655-8625-a35fa3c5cf87	f3a017de-5501-4e00-9d41-1e4538574db7	3	\N	\N	t	\N
a7a308e9-f33c-4249-a1aa-ba4a4010efba	24295877-7892-4655-8625-a35fa3c5cf87	73aad573-76aa-43a0-9063-3501390d387c	2	\N	\N	t	\N
33e046b0-056c-4ed8-b1e4-fc5c253b83fc	24295877-7892-4655-8625-a35fa3c5cf87	dfd27eb0-8d33-471e-8d3a-06d2ed158ef0	1	\N	\N	t	\N
041b6b0d-c0f5-4e3c-a622-ebd16a52bd86	24295877-7892-4655-8625-a35fa3c5cf87	f7ca5c03-f8d1-4472-9f3e-2b14bf79a852	1	\N	\N	t	\N
f802e941-85f1-48d2-8995-50a4a2edf703	24295877-7892-4655-8625-a35fa3c5cf87	9736f206-f827-4a29-bdf7-bcf346d84cc1	1	\N	\N	t	\N
8dc5ecc6-2782-4638-8161-cc3c799c5a70	24295877-7892-4655-8625-a35fa3c5cf87	8d20be56-545b-4caf-8f6f-8b0e8b48b7c1	1	\N	\N	t	\N
ad22e14f-15b1-4c4d-a708-a26c52816bee	24295877-7892-4655-8625-a35fa3c5cf87	e2d6ffe4-3d11-4afc-be8f-72fdfe54db9a	1	\N	\N	t	\N
49e386da-9409-4ab4-9824-94f648265c74	24295877-7892-4655-8625-a35fa3c5cf87	23420937-ed1b-42a6-837d-204fb69daa08	4	\N	\N	t	\N
9f99b083-faea-445a-9c5b-df1c2909c382	24295877-7892-4655-8625-a35fa3c5cf87	89ced00c-3ca3-4633-88a5-6ca7aae01968	2	\N	\N	t	\N
061f488e-6f13-4407-a3b2-96a50338ea25	24295877-7892-4655-8625-a35fa3c5cf87	e704cd9d-8f5d-49d0-bdfc-ab39447f45f3	2	\N	\N	t	\N
06d14f5f-b882-4b30-8ac9-2b2ab6d7c7b5	24295877-7892-4655-8625-a35fa3c5cf87	1f0748b2-06f1-4a41-a8e4-3e5dc99ab838	1	\N	\N	t	\N
adaf2082-9542-443c-93c2-1af4090b0733	24295877-7892-4655-8625-a35fa3c5cf87	04d4a496-a5a9-423f-aa7b-472fc42dce7d	1	\N	\N	t	\N
2d7d99bd-0c2d-4aba-9748-203279c8faf9	24295877-7892-4655-8625-a35fa3c5cf87	285455c6-23b9-462d-b798-cf308a786fd2	1	\N	\N	t	\N
afed8e4d-65ae-40b5-a413-c7df9dadb6ef	24295877-7892-4655-8625-a35fa3c5cf87	18f93409-11df-4885-a3dc-64acda991451	1	\N	\N	t	\N
\.


--
-- Data for Name: Sector; Type: TABLE DATA; Schema: public; Owner: akerim
--

COPY public."Sector" (id, name) FROM stdin;
7ba6251b-562a-466e-9748-6edf958e2386	Healthcare
9366c231-3e98-4e69-ba45-f2af170132fc	IT & Software
c0be796e-5614-44a1-8c8d-5c8fd0222103	Logistics
d8d1b30e-8c4b-41e0-98c4-166782eaade6	Manufacturing
\.


--
-- Data for Name: TemplateConfig; Type: TABLE DATA; Schema: public; Owner: akerim
--

COPY public."TemplateConfig" (id, "companyId", "dimensionId", enabled, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: akerim
--

COPY public."User" (id, email, name, password, role, "companyId", "createdAt", "updatedAt") FROM stdin;
370fb625-ebc2-44e6-bb9f-6ab9a9240a66	expert@example.com	Expert User	hashedpassword123	EXPERT	87689dd7-5734-41f4-83a3-268c38f593c8	2025-05-19 21:03:08.734	2025-05-19 21:03:08.734
e4d1161d-5b7d-4888-94a1-ebb23046681e	admin@example.com	Admin User	$2y$10$C45kZbLYkYYnl3J28FoEMeRSWvXH9yTjTOvLzjKb2iXakqgopB0rW	ADMIN	87689dd7-5734-41f4-83a3-268c38f593c8	2025-05-19 21:03:08.731	2025-05-19 21:05:56.123
99af7e36-36de-4eee-b34a-ef8b1d8c6a68	viewer@example.com	Viewer User	$2y$10$C45kZbLYkYYnl3J28FoEMeRSWvXH9yTjTOvLzjKb2iXakqgopB0rW	VIEWER	47eb192d-e1c2-45c0-a018-60acbd4fca0a	2025-05-19 21:03:08.735	2025-05-19 21:05:56.123
\.


--
-- Name: Assessment Assessment_pkey; Type: CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Assessment"
    ADD CONSTRAINT "Assessment_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Company Company_pkey; Type: CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_pkey" PRIMARY KEY (id);


--
-- Name: Department Department_pkey; Type: CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Department"
    ADD CONSTRAINT "Department_pkey" PRIMARY KEY (id);


--
-- Name: Dimension Dimension_pkey; Type: CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Dimension"
    ADD CONSTRAINT "Dimension_pkey" PRIMARY KEY (id);


--
-- Name: Evidence Evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Evidence"
    ADD CONSTRAINT "Evidence_pkey" PRIMARY KEY (id);


--
-- Name: MaturityDescriptor MaturityDescriptor_pkey; Type: CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."MaturityDescriptor"
    ADD CONSTRAINT "MaturityDescriptor_pkey" PRIMARY KEY (id);


--
-- Name: Score Score_pkey; Type: CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Score"
    ADD CONSTRAINT "Score_pkey" PRIMARY KEY (id);


--
-- Name: Sector Sector_pkey; Type: CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Sector"
    ADD CONSTRAINT "Sector_pkey" PRIMARY KEY (id);


--
-- Name: TemplateConfig TemplateConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."TemplateConfig"
    ADD CONSTRAINT "TemplateConfig_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: akerim
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: Sector_name_key; Type: INDEX; Schema: public; Owner: akerim
--

CREATE UNIQUE INDEX "Sector_name_key" ON public."Sector" USING btree (name);


--
-- Name: TemplateConfig_companyId_dimensionId_key; Type: INDEX; Schema: public; Owner: akerim
--

CREATE UNIQUE INDEX "TemplateConfig_companyId_dimensionId_key" ON public."TemplateConfig" USING btree ("companyId", "dimensionId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: akerim
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Assessment Assessment_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Assessment"
    ADD CONSTRAINT "Assessment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Assessment Assessment_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Assessment"
    ADD CONSTRAINT "Assessment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Assessment Assessment_expertId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Assessment"
    ADD CONSTRAINT "Assessment_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Company Company_sectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES public."Sector"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Department Department_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Department"
    ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Dimension Dimension_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Dimension"
    ADD CONSTRAINT "Dimension_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Evidence Evidence_assessmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Evidence"
    ADD CONSTRAINT "Evidence_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES public."Assessment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Evidence Evidence_dimensionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Evidence"
    ADD CONSTRAINT "Evidence_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES public."Dimension"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Evidence Evidence_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Evidence"
    ADD CONSTRAINT "Evidence_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MaturityDescriptor MaturityDescriptor_dimensionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."MaturityDescriptor"
    ADD CONSTRAINT "MaturityDescriptor_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES public."Dimension"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MaturityDescriptor MaturityDescriptor_sectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."MaturityDescriptor"
    ADD CONSTRAINT "MaturityDescriptor_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES public."Sector"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Score Score_assessmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Score"
    ADD CONSTRAINT "Score_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES public."Assessment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Score Score_dimensionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."Score"
    ADD CONSTRAINT "Score_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES public."Dimension"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TemplateConfig TemplateConfig_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."TemplateConfig"
    ADD CONSTRAINT "TemplateConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TemplateConfig TemplateConfig_dimensionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."TemplateConfig"
    ADD CONSTRAINT "TemplateConfig_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES public."Dimension"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akerim
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--


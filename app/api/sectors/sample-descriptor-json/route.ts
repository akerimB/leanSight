import { NextResponse } from 'next/server';

// Note for users: 
// - 'weight' should be a decimal (e.g., 0.2 for 20%).
// - The sum of all dimension weights for a given sector should ideally be 1.0 (or 100%).
// - 'levels' should be an array of 5 strings, corresponding to maturity levels 1-5.
const sampleJsonData = [
  {
    "dimensionName": "Example Dimension A: Technology Adoption",
    "weight": 0.3, // Represents 30%
    "levels": [
      "Level 1 Description: Basic or ad-hoc use of technology. Little to no strategic planning.",
      "Level 2 Description: Some standardized tools are adopted. Technology use is more consistent but still reactive.",
      "Level 3 Description: Technology is integrated into key processes. Data is used for decision-making.",
      "Level 4 Description: Technology drives innovation and efficiency. Proactive adoption of emerging tech.",
      "Level 5 Description: Technology is a core differentiator and a source of strategic advantage. Fully optimized and agile."
    ]
  },
  {
    "dimensionName": "Example Dimension B: Process Maturity",
    "weight": 0.25, // Represents 25%
    "levels": [
      "Level 1 Description: Processes are undefined or chaotic. Heavy reliance on individual effort.",
      "Level 2 Description: Key processes are documented but not consistently followed. Some measurement occurs.",
      "Level 3 Description: Processes are standardized, managed, and regularly reviewed. Metrics are in place.",
      "Level 4 Description: Processes are optimized and continuously improved. Strong focus on efficiency and quality.",
      "Level 5 Description: Processes are best-in-class, highly agile, and integrated across the organization."
    ]
  },
  {
    "dimensionName": "Example Dimension C: Data Governance",
    "weight": 0.2, // Represents 20%
    "levels": [
      "Level 1: Data is poorly managed, inconsistent, and often inaccurate.",
      "Level 2: Basic data definitions and some controls are in place. Awareness of data quality is growing.",
      "Level 3: Formal data governance policies and roles are established. Data quality is actively monitored.",
      "Level 4: Data governance is integrated with business strategy. Data is treated as a valuable asset.",
      "Level 5: Data governance is predictive, automated, and drives business value. Full data lineage and master data management."
    ]
  },
    {
    "dimensionName": "Example Dimension D: Customer Focus",
    "weight": 0.25, // Represents 25% - Total weight with A, B, C is 1.0 (100%)
    "levels": [
      "Level 1: Customer needs are poorly understood or inconsistently addressed.",
      "Level 2: Feedback is collected, but engagement is reactive.",
      "Level 3: Customer needs are systematically identified and used to improve services/products.",
      "Level 4: Customer experience is a key strategic priority, with proactive engagement and personalization.",
      "Level 5: Deep customer partnership and co-creation drive innovation and loyalty."
    ]
  }
  // Add more dimension objects as needed, ensuring weights sum to 1.0 for the sector.
];

export async function GET() {
  return new NextResponse(JSON.stringify(sampleJsonData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename=sample-maturity-descriptors.json' // Updated filename
    }
  });
} 
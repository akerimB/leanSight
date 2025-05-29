'use client';

import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, Divider, Alert, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import HoverRevealText from '@/components/HoverRevealText';
import MaturityOption from '@/components/MaturityOption';
import MaturityAssessment from '@/components/MaturityAssessment';
import { toast } from 'sonner';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Sample data for the maturity levels
const leadershipMaturityLevels = [
  {
    level: 1,
    title: "Initial",
    description: "Leadership's commitment to Lean/QI principles is limited, episodic, or primarily rhetorical. There is little evidence of sustained investment in improvement capability, with quality improvement activities typically occurring as isolated, department-specific reactions to external pressures or regulatory requirements. Leaders may verbally endorse quality and safety initiatives but provide insufficient resources, attention, or visible engagement to support meaningful adoption. Improvement work is viewed as separate from or in addition to daily operations, often delegated to specific departments or roles with minimal executive involvement. Staff often perceive mixed messages when urgent operational pressures consistently supersede improvement priorities."
  },
  {
    level: 2,
    title: "Developing",
    description: "Leadership demonstrates interest in Lean/QI principles and begins to integrate them into the organization's strategic objectives. Some senior leaders champion specific improvement initiatives and communicate their importance, though organizational commitment may remain inconsistent across departments. Early investment in staff training and improvement infrastructure is emerging, with pockets of successful projects. Leadership is developing systematic approaches to quality and safety but continues to struggle with balancing improvement activities against operational demands. Board meetings now include some quality metrics, though these may focus more on regulatory requirements than strategic improvement goals. The connection between improvement work and the organization's mission is becoming more apparent in leadership communications."
  },
  {
    level: 3,
    title: "Defined",
    description: "Leadership demonstrates consistent commitment to Lean/QI principles and has established organization-wide improvement infrastructure with dedicated resources. Senior leaders, including the CEO and executive team, regularly review quality metrics, participate in improvement events, and communicate a clear vision connecting quality improvement to the organization's mission. Performance improvement is explicitly incorporated into the strategic plan with specific objectives and resources allocated. Leaders at multiple levels visibly support and participate in improvement work, and basic quality improvement training is becoming standardized across the organization. Board oversight of quality and safety is formalized with regular reporting structures, and leadership is actively working to create an organizational culture that values continuous improvement."
  },
  {
    level: 4,
    title: "Advanced",
    description: "Leadership demonstrates strong, consistent commitment to Lean/QI principles, with senior leaders actively modeling and personally participating in improvement activities. Quality and safety objectives are fully integrated into strategic and operational plans with appropriate resources allocated. Leadership has established robust improvement infrastructure and capability-building programs, creating widespread staff engagement in improvement work. Leaders systematically review performance metrics focused on outcomes and processes, using data to drive decisions and address systemic barriers to improvement. The board holds senior leaders accountable for measurable quality outcomes, not just financial performance. Leaders actively break down silos between departments to support cross-functional improvement, encouraging transparent sharing of both successes and failures in service of organizational learning."
  },
  {
    level: 5,
    title: "World-Class",
    description: "Leadership's unwavering, visible, and deeply ingrained commitment to Lean/QI principles, patient safety, and continuous improvement is a fundamental and widely recognized driver of the healthcare organization's sustained, world-class performance in clinical outcomes, patient experience, operational efficiency, and staff well-being. Hospital/clinic leaders are viewed as national or international exemplars and mentors in Lean healthcare transformation, actively developing future QI leaders from within the organization and contributing to the broader healthcare improvement community (e.g., through publications, presentations, hosting site visits). The Lean/QI philosophy and its application extend beyond the organization's walls to active collaboration with community health partners, primary care physicians, payers, and patient advocacy groups to improve population health and optimize the entire continuum of care. The healthcare organization is frequently a benchmark facility that other institutions visit to learn about world-class Lean leadership, deeply embedded culture of safety and improvement, and exemplary patient-centered care delivery. Continuous improvement is not seen as a program, but as the fundamental way the organization operates and strives for excellence in all aspects of healthcare."
  }
];

const strategyMaturityLevels = [
  {
    level: 1,
    title: "Initial",
    description: "The organization lacks a coherent strategic approach to quality improvement. Quality initiatives are primarily reactive, driven by external requirements or crisis management. Quality is generally seen as a compliance function rather than a strategic imperative. No clear vision exists for how quality improvement connects to organizational goals. Quality metrics are minimal, typically focused on regulatory requirements, and not systematically collected or reviewed. Quality planning, if present, is separate from the organization's strategic planning process."
  },
  {
    level: 2,
    title: "Developing",
    description: "Leadership is beginning to articulate the strategic importance of quality and safety. A basic quality plan exists but may not be fully integrated with the organization's overall strategic plan. Some strategic quality goals are defined, but they may lack specificity, measurable targets, or defined timeframes. Quality metrics are collected more regularly but are not consistently used to drive improvement or strategic decisions. Leaders occasionally reference quality goals in communications, but the connection between quality improvement and organizational success is not consistently emphasized."
  },
  {
    level: 3,
    title: "Defined",
    description: "Quality and safety are explicitly incorporated into the organization's strategic plan. The organization has a well-defined quality plan with specific goals, measures, and timeframes aligned with overall strategic objectives. Quality metrics are regularly collected and reviewed by leadership, with some metrics tied to strategic goals. Resources are allocated to support strategic quality initiatives. Leaders consistently communicate how quality improvement supports the organization's mission and strategic aims. Quality performance is included in regular strategic reviews and board updates."
  },
  {
    level: 4,
    title: "Advanced",
    description: "Quality and safety are fundamental components of the organization's strategy, not treated as separate initiatives. The organization's strategic plan and quality plan are fully integrated, with quality improvement objectives embedded throughout strategic priorities. Comprehensive quality metrics are cascaded throughout the organization, and leaders at all levels are accountable for quality outcomes that support strategic goals. Quality data drives strategic decision-making, resource allocation, and organizational priorities. Strategic planning processes routinely incorporate systematic assessment of quality performance and capability."
  },
  {
    level: 5,
    title: "World-Class",
    description: "Quality, safety, and continuous improvement are inseparable from the organization's identity and strategic vision. Quality is not just a strategic priority but is fundamental to how the organization defines and measures success across all domains. The organization proactively anticipates future quality challenges and opportunities, incorporating them into long-term strategic planning. Strategic quality goals reflect ambitious benchmarks that place the organization as a leader in healthcare transformation. The organization's strategic quality approach enables it to consistently achieve exceptional performance across multiple dimensions (clinical outcomes, patient experience, operational efficiency, staff engagement, and financial performance). The organization is recognized for its strategic approach to quality and is sought out as a model by other healthcare organizations."
  }
];

const cultureMaturityLevels = [
  {
    level: 1,
    title: "Initial",
    description: "The organization exhibits a predominantly reactive culture with minimal awareness of or commitment to continuous improvement. Staff view quality and safety initiatives as burdensome 'flavor of the month' programs imposed by management or external regulators. Staff concerns about quality or safety issues are often met with defensiveness or ignored. Errors typically result in blame and punitive responses rather than system analysis. There is little psychological safety, with staff hesitant to speak up about problems or mistakes. Departments operate in silos with minimal cross-functional collaboration on improvement work."
  },
  {
    level: 2,
    title: "Developing",
    description: "The organization is developing awareness of continuous improvement principles, though commitment varies across departments. Some staff show interest in improvement methods, but many still view quality initiatives as extra work rather than integral to their roles. Leaders are beginning to promote a less punitive approach to errors, though inconsistently. Some departments are creating psychologically safer environments where staff can raise concerns, while others maintain hierarchical cultures that discourage speaking up. Cross-departmental collaboration occurs occasionally but is not systematic. Resistance to change remains significant, with some staff and middle managers skeptical about improvement initiatives."
  },
  {
    level: 3,
    title: "Defined",
    description: "A culture of continuous improvement is recognized as important and is developing consistently across the organization. Many staff understand basic improvement concepts and see quality and safety as part of their responsibilities. A non-punitive approach to errors is formally endorsed and increasingly practiced, with focus on system issues rather than individual blame. Psychological safety is explicitly promoted, with mechanisms for staff to raise concerns about quality and safety. Cross-departmental collaboration on improvement work is becoming routine. Change management approaches are more systematic, with efforts to engage staff in improvement initiatives. Visible examples of successful improvement work help build cultural momentum."
  },
  {
    level: 4,
    title: "Advanced",
    description: "A strong culture of continuous improvement exists throughout most of the organization. Staff at all levels routinely identify problems and opportunities for improvement, with widespread ownership of quality and safety. A consistently non-punitive approach to error is evident, with robust systems for reporting, analyzing, and learning from mistakes and near misses. High psychological safety exists across the organization, with staff comfortable speaking up regardless of position or role. Cross-functional collaboration is the norm, with regular breaking down of silos to address systemic issues. Change is embraced as positive, with staff actively engaged in improvement initiatives. The organization celebrates and recognizes improvement work, reinforcing cultural values."
  },
  {
    level: 5,
    title: "World-Class",
    description: "A deeply embedded culture of continuous improvement permeates all aspects of the organization, with improvement and excellence as defining cultural characteristics rather than separate initiatives. Staff at all levels demonstrate remarkable ownership of quality and safety, proactively identifying improvement opportunities and addressing system issues. The organization demonstrates exceptional psychological safety, where questioning processes and raising concerns is universally encouraged regardless of hierarchy. Errors and near misses are viewed as valuable learning opportunities, with sophisticated systems for transparent reporting, analysis, and widespread sharing of lessons learned. Cross-departmental collaboration is seamless, with organizational structures and processes designed to eliminate silos. Improvement methodologies are fully integrated into daily work rather than seen as separate activities. The culture is self-sustaining, with staff inducting newcomers into improvement thinking and practices. External stakeholders, including patients and community partners, are actively engaged in improvement work. The organization is recognized nationally or internationally for its exceptional improvement culture."
  }
];

// Dimension data for the full assessment
const dimensions = [
  {
    id: 'leadership',
    name: 'Leadership Commitment',
    levels: leadershipMaturityLevels
  },
  {
    id: 'strategy',
    name: 'Strategy Alignment',
    levels: strategyMaturityLevels
  },
  {
    id: 'culture',
    name: 'Improvement Culture',
    levels: cultureMaturityLevels
  }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`demo-tabpanel-${index}`}
      aria-labelledby={`demo-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AssessmentDemoPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [leadershipValue, setLeadershipValue] = useState('3');
  const [strategyValue, setStrategyValue] = useState('3');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveAssessment = (assessmentData: any) => {
    // In a real app, this would save to a database
    console.log('Assessment data saved:', assessmentData);
    toast.success('Assessment data saved successfully!');
  };
  
  const navigateToFullAssessment = () => {
    router.push('/assessment');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Maturity Assessment Demo
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={navigateToFullAssessment}
          startIcon={<AssessmentIcon />}
        >
          Go to Full Assessment
        </Button>
      </Box>
      
      <Typography variant="body1" paragraph>
        This page demonstrates different ways to display and interact with maturity level descriptions.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="demo tabs">
          <Tab label="Simple Hover Reveal" id="demo-tab-0" aria-controls="demo-tabpanel-0" />
          <Tab label="Interactive Assessment" id="demo-tab-1" aria-controls="demo-tabpanel-1" />
          <Tab label="Full Assessment Form" id="demo-tab-2" aria-controls="demo-tabpanel-2" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h5" gutterBottom>Simple Hover Reveal</Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Leadership Commitment (Level 5: World-Class)
          </Typography>
          <HoverRevealText 
            text={leadershipMaturityLevels[4].description} 
            maxLines={3} 
          />
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Strategy Alignment (Level 4: Advanced)
          </Typography>
          <HoverRevealText 
            text={strategyMaturityLevels[3].description}
            maxLines={3}
          />
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>Interactive Assessment</Typography>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <MaturityOption 
              levels={leadershipMaturityLevels}
              value={leadershipValue}
              onChange={setLeadershipValue}
              dimension="Leadership Commitment"
            />
            
            <Divider />
            
            <MaturityOption 
              levels={strategyMaturityLevels}
              value={strategyValue}
              onChange={setStrategyValue}
              dimension="Strategy Alignment"
            />
          </Box>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>Full Assessment Form</Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          This is a complete assessment form with support for notes and evidence attachments.
          Hover over options to see truncated descriptions, or expand them to see the full text.
        </Alert>
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={navigateToFullAssessment}
            startIcon={<AssessmentIcon />}
            fullWidth
          >
            Continue to Full Assessment
          </Button>
        </Box>
        <MaturityAssessment 
          dimensions={dimensions}
          onSave={handleSaveAssessment}
        />
      </TabPanel>
    </Container>
  );
} 
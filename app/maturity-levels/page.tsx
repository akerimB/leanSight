'use client';

import React from 'react';
import { Container, Typography, Paper, Box, Radio, FormControlLabel, RadioGroup, FormControl, FormLabel } from '@mui/material';
import HoverRevealText from '@/components/HoverRevealText';

const maturityLevels = [
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

export default function MaturityLevelsPage() {
  const [selectedLevel, setSelectedLevel] = React.useState('5');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLevel(event.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Maturity Level Descriptions
      </Typography>
      
      <Typography variant="body1" paragraph>
        Hover over the maturity level descriptions to see the full text. Only the first 3 lines are shown by default.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Select Maturity Level</FormLabel>
          <RadioGroup
            row
            name="maturity-level"
            value={selectedLevel}
            onChange={handleChange}
          >
            {maturityLevels.map((level) => (
              <FormControlLabel 
                key={level.level}
                value={level.level.toString()} 
                control={<Radio />} 
                label={`${level.level}: ${level.title}`} 
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {maturityLevels.map((level) => (
          <Box 
            key={level.level} 
            sx={{ 
              display: selectedLevel === level.level.toString() ? 'block' : 'none',
              mb: 2
            }}
          >
            <Paper 
              sx={{ 
                p: 3, 
                borderLeft: 6, 
                borderColor: theme => 
                  level.level === 1 ? 'error.main' : 
                  level.level === 2 ? 'warning.main' : 
                  level.level === 3 ? 'info.main' : 
                  level.level === 4 ? 'success.light' : 
                  'success.dark'
              }}
            >
              <Typography variant="h5" gutterBottom>
                Level {level.level}: {level.title}
              </Typography>
              
              <HoverRevealText text={level.description} />
            </Paper>
          </Box>
        ))}
      </Box>
      
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>All Maturity Levels</Typography>
        <Paper sx={{ p: 3 }}>
          {maturityLevels.map((level) => (
            <Box key={level.level} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Level {level.level}: {level.title}
              </Typography>
              <HoverRevealText text={level.description} />
              {level.level < 5 && <Box sx={{ my: 2, borderBottom: 1, borderColor: 'divider' }} />}
            </Box>
          ))}
        </Paper>
      </Box>
    </Container>
  );
} 
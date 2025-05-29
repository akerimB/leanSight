'use client';

import React from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardContent } from '@mui/material';
import HoverRevealText from '@/components/HoverRevealText';

const longText = "Leadership's unwavering, visible, and deeply ingrained commitment to Lean/QI principles, patient safety, and continuous improvement is a fundamental and widely recognized driver of the healthcare organization's sustained, world-class performance in clinical outcomes, patient experience, operational efficiency, and staff well-being. Hospital/clinic leaders are viewed as national or international exemplars and mentors in Lean healthcare transformation, actively developing future QI leaders from within the organization and contributing to the broader healthcare improvement community (e.g., through publications, presentations, hosting site visits). The Lean/QI philosophy and its application extend beyond the organization's walls to active collaboration with community health partners, primary care physicians, payers, and patient advocacy groups to improve population health and optimize the entire continuum of care. The healthcare organization is frequently a benchmark facility that other institutions visit to learn about world-class Lean leadership, deeply embedded culture of safety and improvement, and exemplary patient-centered care delivery. Continuous improvement is not seen as a program, but as the fundamental way the organization operates and strives for excellence in all aspects of healthcare.";

const mediumText = "Quality and safety are fundamental components of the organization's strategy, not treated as separate initiatives. The organization's strategic plan and quality plan are fully integrated, with quality improvement objectives embedded throughout strategic priorities. Comprehensive quality metrics are cascaded throughout the organization, and leaders at all levels are accountable for quality outcomes that support strategic goals.";

const shortText = "A strong culture of continuous improvement exists throughout most of the organization.";

export default function HoverDemoPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Hover-Reveal Text Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        Hover over the text blocks below to see the full content. Each card contains text that is limited to 3 lines by default.
        You can also click the expand button to see the full text.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Instructions:
        </Typography>
        <Typography variant="body2" paragraph>
          1. Hover over any text block to see the full content in a popup
        </Typography>
        <Typography variant="body2" paragraph>
          2. Click the expand icon to permanently expand the text
        </Typography>
        <Typography variant="body2" paragraph>
          3. Click the expand icon again to collapse the text back to 3 lines
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Long Text Example
            </Typography>
            <HoverRevealText text={longText} maxLines={3} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Medium Text Example
              </Typography>
              <HoverRevealText text={mediumText} maxLines={3} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Short Text Example (No Truncation Needed)
              </Typography>
              <HoverRevealText text={shortText} maxLines={3} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Multiple Items with Hover Reveal
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Box key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Item #{index + 1}
                  </Typography>
                  <HoverRevealText 
                    text={index % 2 === 0 ? longText : mediumText} 
                    maxLines={3} 
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 
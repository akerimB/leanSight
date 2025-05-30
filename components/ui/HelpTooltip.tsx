import React from 'react';
import { Tooltip, IconButton, Box, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

interface HelpTooltipProps {
  title: string;
  description?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  variant?: 'help' | 'info' | 'question';
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  maxWidth?: number;
  children?: React.ReactNode;
}

export default function HelpTooltip({
  title,
  description,
  placement = 'top',
  variant = 'info',
  size = 'small',
  interactive = false,
  maxWidth = 300,
  children
}: HelpTooltipProps) {
  
  const getIcon = () => {
    const iconSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium';
    
    switch (variant) {
      case 'help':
        return <HelpOutlineIcon fontSize={iconSize} />;
      case 'question':
        return <QuestionMarkIcon fontSize={iconSize} />;
      default:
        return <InfoOutlinedIcon fontSize={iconSize} />;
    }
  };

  const tooltipContent = description ? (
    <Box sx={{ maxWidth }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2">
        {description}
      </Typography>
    </Box>
  ) : title;

  if (children) {
    return (
      <Tooltip
        title={tooltipContent}
        placement={placement}
        arrow
        enterDelay={500}
        leaveDelay={200}
      >
        <Box component="span">
          {children}
        </Box>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      title={tooltipContent}
      placement={placement}
      arrow
      enterDelay={500}
      leaveDelay={200}
    >
      <IconButton
        size={size}
        sx={{ 
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main'
          }
        }}
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
}

// Predefined tooltips for common use cases
export const tooltips = {
  assessment: {
    maturityLevel: {
      title: "Maturity Level",
      description: "Rate from 1 (Initial/Ad-hoc) to 5 (Optimized/Continuous Improvement) based on your organization's current practices."
    },
    weightingScheme: {
      title: "Weighting Scheme",
      description: "Determines how different categories and dimensions are weighted in the final score calculation. Choose 'Default' for balanced weighting."
    },
    evidence: {
      title: "Evidence",
      description: "Upload documents, files, or add notes that support your maturity rating. This helps justify your assessment and provides context for reviewers."
    },
    department: {
      title: "Department",
      description: "Select a specific department for targeted assessment, or leave as 'Company-Wide' for organization-level evaluation."
    }
  },
  analytics: {
    overallScore: {
      title: "Overall Maturity Score",
      description: "Weighted average of all assessment scores in the selected time period. Higher scores indicate better organizational maturity."
    },
    trends: {
      title: "Trend Analysis",
      description: "Shows how your maturity scores have changed over time. Upward trends indicate improvement in organizational capabilities."
    },
    benchmark: {
      title: "Benchmarking",
      description: "Compares your organization's performance against industry averages and global benchmarks."
    },
    heatmap: {
      title: "Department × Category Heatmap",
      description: "Visual representation of performance across departments and categories. Darker colors indicate higher maturity levels."
    }
  },
  filters: {
    timeRange: {
      title: "Time Range",
      description: "Filter data by specific time periods. Use 'Custom Range' for precise date selection."
    },
    status: {
      title: "Assessment Status",
      description: "Filter by assessment completion status: Draft (in progress), In Progress (partially complete), or Completed (fully submitted)."
    },
    scoreRange: {
      title: "Score Range",
      description: "Filter assessments by their overall maturity score. Useful for identifying high or low performers."
    }
  },
  realTime: {
    connection: {
      title: "Real-time Updates",
      description: "Shows live connection status. When active, the dashboard automatically updates when new assessments are submitted or modified."
    }
  }
};

// Quick access components for common tooltips
export const AssessmentTooltip = ({ type, ...props }: { type: keyof typeof tooltips.assessment } & Partial<HelpTooltipProps>) => (
  <HelpTooltip {...tooltips.assessment[type]} {...props} />
);

export const AnalyticsTooltip = ({ type, ...props }: { type: keyof typeof tooltips.analytics } & Partial<HelpTooltipProps>) => (
  <HelpTooltip {...tooltips.analytics[type]} {...props} />
);

export const FilterTooltip = ({ type, ...props }: { type: keyof typeof tooltips.filters } & Partial<HelpTooltipProps>) => (
  <HelpTooltip {...tooltips.filters[type]} {...props} />
);

export const RealTimeTooltip = ({ type, ...props }: { type: keyof typeof tooltips.realTime } & Partial<HelpTooltipProps>) => (
  <HelpTooltip {...tooltips.realTime[type]} {...props} />
); 
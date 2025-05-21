# Analytics Page Enhancement Roadmap

This document outlines planned and suggested improvements for the Analytics Page.

## Phase 1: Foundational UI/UX (Largely Implemented)

- [x] **Skeleton Loaders for Charts**: Replace global loading message with individual chart placeholders.
- [x] **Engaging "Overall Maturity Score"**: Make the key metric more visual (e.g., using a circular progress display).
- [x] **"No Data" States for Individual Charts**: Provide clear feedback when specific chart data is unavailable.
- [x] **Improved Error Handling**: Display user-friendly error messages on data fetch failures with a retry option.
- [x] **Reusable Chart Card Component**: Standardize chart presentation.
- [ ] **Consistent Color Palette**: Define and use a consistent and accessible color palette across all charts. *(Partially addressed by using primary/secondary colors, but could be more systematic)*

## Phase 2: Structure & Clarity (Current Focus)

- [ ] **Group Analytics**: Introduce Tabs or clearly defined sections to organize the numerous charts and improve navigability (e.g., Overview, Performance Breakdown, Engagement).

## Phase 3: Deeper Insights & Interactivity

### Data Presentation & Visualization
- [ ] **Clearer Axis Labels & Titles for All Charts**: Ensure all charts are self-explanatory.
- [ ] **Interactive Tooltips**: Enhance chart tooltips to show more detailed information or comparisons on hover.
- [ ] **Heatmap Interactivity**: Make heatmap cells clickable to drill down into data for specific department/category combinations.

### New Metrics & Insights
- [ ] **User Engagement Metrics**:
    - [ ] Number of active users conducting assessments.
    - [ ] Average number of assessments per user.
    - [ ] Distribution of scores (e.g., a histogram showing how many assessments scored low, medium, high).
- [ ] **Improvement Over Time (Delta)**:
    - [ ] For key metrics (Overall Maturity, Dimension Scores), show the change (e.g., "+0.5") compared to the previous period.
- [ ] **Automated Strengths & Weaknesses**:
    - [ ] Highlight the top 3 strongest and weakest dimensions/categories based on scores.
- [ ] **Assessment Status Breakdown Chart**:
    - [ ] Display a pie or bar chart showing the distribution of assessment statuses (Draft, Submitted, Reviewed) for the selected period.

### Functionality & UX
- [ ] **Granular Filters**:
    - [ ] Allow filtering by specific **Company** or **Department** in addition to the time range.
    - [ ] Consider a "Compare Mode" to select two different time periods, companies, or departments for side-by-side analytics.
- [ ] **Export/Download Capabilities**:
    - [ ] Add functionality to download chart data (e.g., as CSV).
    - [ ] Allow exporting charts as images (PNG/JPEG).
- [ ] **Help/Info Icons**:
    - [ ] Add small info icons next to chart titles or complex metrics. On hover/click, these would explain what the chart/metric represents and how it's calculated.

## Phase 4: Advanced Features & Polish

- [ ] **Customizable Dashboard (Advanced)**:
    - [ ] Allow users to select which charts they see on their analytics dashboard or rearrange them.
- [ ] **Performance Optimizations**:
    - [ ] Further explore `React.memo` for chart components if re-renders become an issue with increased interactivity.
    - [ ] Use `useMemo` for any complex client-side data transformations if needed.
- [ ] **Refined Styling and Theming**: Ensure all elements align perfectly with a polished, professional look and feel.

## Code & Backend Considerations
- [ ] **Centralized Data Fetching Logic (Custom Hook)**: If frontend data fetching logic for analytics becomes more complex (e.g., with new filters), refactor into a reusable custom hook.
- [ ] **Backend API Enhancements**: The `/api/analytics/summary` endpoint may need to be updated to support new filters (company, department) and potentially return additional data points for new metrics (deltas, detailed user activity). 
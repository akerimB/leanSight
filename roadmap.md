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

- [x] **Group Analytics**: Introduce Tabs or clearly defined sections to organize the numerous charts and improve navigability (e.g., Overview, Performance Breakdown, Engagement).
- [ ] **Dedicated Assessment Results Page (`/results`)**:
    - [x] Display list of submitted assessments with key details (Company, Department, Date, Status, Raw Average Score). *(Decision: List shows raw average for performance; details page shows weighted score)*
    - [x] Allow viewing detailed scores for each dimension within a selected assessment (shows dimension name).
    - [x] Show the weighting scheme applied (if any). *(Influence/calculated scores TBD)*
    - [x] Link to broader analytics where relevant (general link added).
- [x] **Maturity Score Overview (New Section on `/results/[assessmentId]`)**:
    - [x] Display the calculated overall maturity score for the specific assessment.
    - [x] Ensure the calculation considers the applied weighting scheme (if any).
    - [x] Backend: Add logic to `/api/assessments` (GET single assessment) to calculate/retrieve the weighted maturity score.
    - [x] Frontend: Fetch and display this score on the `/results/[assessmentId]` page.

## Phase 3: Deeper Insights & Interactivity

### Data Presentation & Visualization
- [x] **Clearer Axis Labels & Titles for All Charts**: Ensure all charts are self-explanatory.
- [x] **Interactive Tooltips**: Enhance chart tooltips to show more detailed information or comparisons on hover. *(Basic value formatting implemented)*
- [x] **Heatmap Interactivity**: Make heatmap cells clickable to drill down into data for specific department/category combinations. *(Click handler and basic UX implemented; drill-down TBD)*

### New Metrics & Insights
- [ ] **User Engagement Metrics**:
    - [x] Number of active users conducting assessments.
    - [x] Average number of assessments per user.
    - [x] Distribution of scores (e.g., a histogram showing how many assessments scored low, medium, high). *(Implemented for individual dimension scores)*
- [x] **Trend Indicators**: Visually indicate if key metrics are trending up or down compared to the previous period. *(Implemented for Overall Maturity Score, shows delta)*
- [ ] **Improvement Over Time (Delta)**:
    - [ ] For key metrics (Overall Maturity, Dimension Scores), show the change (e.g., "+0.5") compared to the previous period. *(Delta for Overall Maturity Score implemented as part of Trend Indicator; Dimension Scores backend done, frontend TBD)*
- [ ] **Automated Strengths & Weaknesses**:
    - [x] Highlight the top 3 strongest and weakest dimensions/categories based on scores. *(Implemented for categories and dimensions)*
- [x] **Assessment Status Breakdown Chart**:
    - [x] Display a pie or bar chart showing the distribution of assessment statuses (Draft, Submitted, Reviewed) for the selected period. *(Pie chart implemented)*

### Functionality & UX
- [x] **Granular Filters**: Allow filtering by specific **Company** or **Department** in addition to the time range. *(Implemented with backend and UI; requires testing and potential linter false positive resolution)*
- [ ] **Consider a "Compare Mode"** to select two different time periods, companies, or departments for side-by-side analytics.
- [ ] **Export/Download Capabilities**:
    - [x] Add functionality to download chart data (e.g., as CSV). *(Implemented for Maturity Trend chart)*
    - [x] Allow exporting charts as images (PNG/JPEG). *(Implemented for Maturity Trend chart via ChartCard enhancement)*
- [ ] **Help/Info Icons**:
    - [x] Add small info icons next to chart titles or complex metrics. On hover/click, these would explain what the chart/metric represents and how it's calculated. *(Implemented for Overall Score and one ChartCard title)*

## Phase 4: Advanced Features & Polish

- [ ] **Customizable Dashboard (Advanced)**:
    - [ ] Allow users to select which charts they see on their analytics dashboard or rearrange them.
- [ ] **Performance Optimizations**:
    - [ ] Further explore `React.memo` for chart components if re-renders become an issue with increased interactivity.
    - [ ] Use `useMemo` for any complex client-side data transformations if needed.
- [ ] **Refined Styling and Theming**: Ensure all elements align perfectly with a polished, professional look and feel.



## Utility & Setup Features (Supporting Analytics & Assessments)

- [ ] **Weighting Schemes Management (`/weighting-schemes`)**:
    - [x] CRUD interface for creating, reading, updating, and deleting weighting schemes. *(Read/List, Create, View Details, Delete implemented. Edit page for basic fields structure exists. Backend for Create auto-populates initial weights; Backend for Delete performs soft-delete & prevents default deletion.)*
    - [x] Allow definition of weights for categories and their constituent dimensions. *(UI and Backend for editing weights implemented, including validation for sums)*
    - [x] Functionality to set a company-wide or global default weighting scheme. *(Handled via `isDefault` flag in CRUD operations; backend ensures only one default)*
    - [x] UI to associate specific weighting schemes with assessments (during creation or update). *(Implemented: dropdown on assessment creation page, pre-selects default, passes ID to backend. Existing assessments can also have scheme updated by Admin/Expert on their detail page)*

## Sectors
    - [x] **Copy maturity level descriptions from other sectors**
        - [x] Fix: Related button works, but sector list did not appear if empty or while loading. Added loading/empty states to the import dialog. *(UI now clarifies if no other sectors are available or if list is loading)*


## Settings menu
- [ ] **Settings need to be active for users change and see.**
    - [~] Activate settings. *(Basic preferences like notifications, dark mode toggle, language choice are now loaded from and saved to backend. Password update and full dark mode/language integration TBD)*
    - [ ] Multiple language support should be added. 


## Code & Backend Considerations
- [ ] **Centralized Data Fetching Logic (Custom Hook)**: If frontend data fetching logic for analytics becomes more complex (e.g., with new filters), refactor into a reusable custom hook.
- [ ] **Backend API Enhancements**: The `/api/analytics/summary` endpoint may need to be updated to support new filters (company, department) and potentially return additional data points for new metrics (deltas, detailed user activity).
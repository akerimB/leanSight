# Evidence Upload Feature Documentation

## Overview

The Evidence Upload feature allows users to provide supporting documents and notes for their assessments. This helps reviewers better understand the basis for the maturity level scores and makes the assessment more comprehensive.

## Features

- Upload documents (files up to 10MB)
- Add text notes as evidence
- View previously uploaded evidence
- Evidence is associated with specific dimensions in the assessment

## Implementation Details

### Components

1. **EvidenceUpload Component**: A reusable React component for uploading and displaying evidence.
   - Located at: `app/components/EvidenceUpload.tsx`
   - Accepts props:
     - `assessmentId`: ID of the current assessment
     - `dimensionId`: ID of the dimension to associate evidence with
     - `readOnly`: Boolean to control whether uploads are allowed

### Usage in Application

The Evidence Upload component is integrated in two places:

1. **Assessment Wizard** (`app/assessment/page.tsx`):
   - Users can select a dimension from a dropdown
   - Upload evidence for the selected dimension
   - Available after an assessment draft is created

2. **Assessment Detail Page** (`app/assessment/[assessmentId]/page.tsx`):
   - Each dimension has an expandable accordion section for evidence
   - Users can view and add evidence for each dimension
   - In review mode, evidence upload is disabled

### API Endpoints

- **GET** `/api/assessments/[assessmentId]/dimensions/[dimensionId]/evidence`: Fetches existing evidence
- **POST** `/api/assessments/[assessmentId]/dimensions/[dimensionId]/evidence`: Uploads new evidence

### File Storage

- Files are stored in `public/uploads/evidence/[assessmentId]/[dimensionId]/`
- File URLs are stored in the database for retrieval

## Usage Instructions

### Uploading Evidence

1. Navigate to an assessment (either create a new one or edit an existing one)
2. For a new assessment:
   - Complete the company/department selection
   - After moving to the questions step, the evidence upload section becomes available
   - Select a dimension from the dropdown and upload evidence

3. For viewing an existing assessment:
   - Each dimension has an "Evidence and Supporting Documents" accordion
   - Expand it to view or add evidence

### Evidence Types

- **File Evidence**: Upload documents, images, PDFs, etc.
- **Text Notes**: Add descriptive text without uploading a file

## Permissions

- Evidence can be added or viewed by anyone with access to the assessment
- Evidence cannot be added if the assessment status is "REVIEWED"

## Technical Notes

- The maximum file size is 10MB
- The upload directory is created automatically if it doesn't exist
- File types are not restricted, but the MIME type is stored for reference 
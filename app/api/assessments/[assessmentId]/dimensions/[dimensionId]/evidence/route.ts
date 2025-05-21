import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Configure Multer for file uploads
// Ensure the upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'evidence');

// Middleware to ensure directory exists
const ensureUploadDirExists = (req: NextRequest, res: NextResponse, next: () => void) => {
  const params = req.nextUrl.searchParams;
  const assessmentId = params.get('assessmentId');
  const dimensionId = params.get('dimensionId');

  if (assessmentId && dimensionId) {
    const specificUploadPath = path.join(UPLOAD_DIR, assessmentId, dimensionId);
    if (!fs.existsSync(specificUploadPath)) {
      fs.mkdirSync(specificUploadPath, { recursive: true });
    }
  }
  next(); 
};

const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    const { assessmentId, dimensionId } = req.params;
    const specificUploadPath = path.join(UPLOAD_DIR, assessmentId, dimensionId);
    if (!fs.existsSync(specificUploadPath)) {
      fs.mkdirSync(specificUploadPath, { recursive: true });
    }
    cb(null, specificUploadPath);
  },
  filename: function (req: any, file: any, cb: any) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to run multer middleware
function runMiddleware(req: NextRequest, res: NextResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Helper to extract params from the URL
function extractParamsFromUrl(urlString: string) {
  const url = new URL(urlString, 'http://localhost'); // base is required for Node URL
  const parts = url.pathname.split('/');
  // Find the indices for assessmentId and dimensionId
  // /api/assessments/[assessmentId]/dimensions/[dimensionId]/evidence
  const idx = parts.findIndex(p => p === 'assessments');
  return {
    assessmentId: parts[idx + 1],
    dimensionId: parts[idx + 3],
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { assessmentId, dimensionId } = extractParamsFromUrl(request.url);
  if (!assessmentId || !dimensionId) {
    return NextResponse.json({ error: 'Missing assessmentId or dimensionId' }, { status: 400 });
  }
  try {
    const evidence = await prisma.evidence.findMany({
      where: {
        assessmentId,
        dimensionId,
        deletedAt: null, // Only fetch non-deleted evidence
      },
      orderBy: { uploadedAt: 'desc' },
    });
    return NextResponse.json(evidence);
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json({ error: 'Failed to fetch evidence' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { assessmentId, dimensionId } = extractParamsFromUrl(request.url);
  if (!assessmentId || !dimensionId) {
    return NextResponse.json({ error: 'Missing assessmentId or dimensionId' }, { status: 400 });
  }
  (request as any).params = { assessmentId, dimensionId }; // Attach params for multer storage function

  try {
    // For Next.js 13+ App Router, direct req, res for multer is tricky.
    // We need to adapt multer to work with NextRequest.
    // The `runMiddleware` approach is common for this.
    // @ts-ignore
    await runMiddleware(request, NextResponse.next(), upload.single('file')); // 'file' is the field name in FormData
    
    const reqAsAny = request as any;
    const file = reqAsAny.file as Express.Multer.File | undefined;
    const formData = await request.formData(); // Re-parse formData to get other fields like notes
    const notes = formData.get('notes') as string | null;

    if (!file && (!notes || notes.trim() === '')) { // Ensure at least a file or some notes text
        return NextResponse.json({ error: 'Either a file must be uploaded or notes must be provided.' }, { status: 400 });
    }

    let fileUrl: string | null = null;
    let fileType: string | null = null;

    if (file) {
      // Construct file URL assuming files in `public` are served from `/`
      // e.g., public/uploads/evidence/asID/dimID/file.pdf -> /uploads/evidence/asID/dimID/file.pdf
      const relativePath = path.relative(path.join(process.cwd(), 'public'), file.path);
      fileUrl = `/${relativePath.replace(/\\/g, '/')}`;
      fileType = file.mimetype;
    }

    const newEvidence = await prisma.evidence.create({
      data: {
        assessmentId,
        dimensionId,
        fileUrl: fileUrl,     
        fileType: fileType,   
        notes: notes,
        uploadedById: session.user.id,
      },
    });

    return NextResponse.json(newEvidence, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading evidence:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
        return NextResponse.json({ error: 'File too large. Max 10MB allowed.' }, { status: 413 });
    }
    return NextResponse.json({ error: 'Failed to upload evidence', details: error.message }, { status: 500 });
  }
} 
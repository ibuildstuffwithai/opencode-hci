import { NextRequest, NextResponse } from 'next/server';

interface PublishRequest {
  title: string;
  description: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  previewUrl?: string;
}

// In-memory store for published projects (in production, use a database)
const publishedProjects = new Map<string, {
  id: string;
  title: string;
  description: string;
  files: Array<{ path: string; content: string; }>;
  previewUrl?: string;
  publishedAt: number;
  views: number;
}>();

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function POST(request: NextRequest) {
  try {
    const body: PublishRequest = await request.json();
    
    if (!body.title || !body.files || body.files.length === 0) {
      return NextResponse.json(
        { error: 'Title and files are required' },
        { status: 400 }
      );
    }

    const id = generateId();
    const project = {
      id,
      title: body.title,
      description: body.description || '',
      files: body.files,
      previewUrl: body.previewUrl,
      publishedAt: Date.now(),
      views: 0
    };

    publishedProjects.set(id, project);

    return NextResponse.json({
      id,
      url: `/p/${id}`,
      fullUrl: `${request.nextUrl.origin}/p/${id}`
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { error: 'Failed to publish project' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Project ID is required' },
      { status: 400 }
    );
  }

  const project = publishedProjects.get(id);
  if (!project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  }

  // Increment view count
  project.views++;

  return NextResponse.json(project);
}
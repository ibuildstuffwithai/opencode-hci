"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface PublishedProject {
  id: string;
  title: string;
  description: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  previewUrl?: string;
  publishedAt: number;
  views: number;
}

export default function PublishedProjectPage() {
  const params = useParams();
  const [project, setProject] = useState<PublishedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    fetch(`/api/publish?id=${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setProject(data);
          setSelectedFile(data.files[0]?.path || null);
        }
      })
      .catch(err => {
        console.error('Failed to load project:', err);
        setError('Failed to load project');
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Project Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'The requested project could not be found.'}</p>
          <Link href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Go to OpenCode HCI
          </Link>
        </div>
      </div>
    );
  }

  const selectedFileContent = project.files.find(f => f.path === selectedFile)?.content || '';

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1a1a1f] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  OC
                </div>
                <span className="text-sm font-medium">OpenCode HCI</span>
              </Link>
              <span className="text-gray-500">→</span>
              <span className="text-gray-400 text-sm">Published Project</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{project.title}</h1>
            {project.description && (
              <p className="text-gray-400 mt-1">{project.description}</p>
            )}
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>{project.views} views</div>
            <div>{new Date(project.publishedAt).toLocaleDateString()}</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* File Explorer */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1f] border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 bg-[#252530]">
                <h3 className="text-sm font-semibold text-white">📁 Files</h3>
              </div>
              <div className="p-2">
                {project.files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file.path)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedFile === file.path
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="text-xs mr-2">
                      {file.path.endsWith('.html') ? '🌐' : 
                       file.path.endsWith('.css') ? '🎨' : 
                       file.path.endsWith('.js') ? '⚡' : 
                       file.path.endsWith('.ts') ? '🟦' : 
                       file.path.endsWith('.json') ? '📄' : '📄'}
                    </span>
                    {file.path.split('/').pop()}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 bg-[#1a1a1f] border border-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-3">📊 Project Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Files:</span>
                  <span className="text-white">{project.files.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lines:</span>
                  <span className="text-white">
                    {project.files.reduce((total, file) => total + file.content.split('\n').length, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Views:</span>
                  <span className="text-white">{project.views}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1f] border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 bg-[#252530] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  📄 {selectedFile?.split('/').pop() || 'No file selected'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedFileContent)}
                    className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
              <div className="p-0">
                <pre className="text-sm text-gray-300 overflow-auto p-4 bg-[#0e0e10] max-h-[600px]">
                  <code>{selectedFileContent}</code>
                </pre>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Want to build something like this?</h3>
              <p className="text-gray-300 mb-4">
                OpenCode HCI is the first AI coding agent designed around humans, not just code.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                <span>🚀</span>
                Try OpenCode HCI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
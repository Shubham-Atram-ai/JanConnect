import React, { useCallback, useState } from 'react';
import { Upload, X, Image, Video, FileText, Volume2, AlertCircle } from 'lucide-react';

interface UploadedFile {
  file: File;
  preview?: string;
  uploading?: boolean;
  error?: string;
}

interface MediaUploadProps {
  onUpload: (file: File) => Promise<void>;
  maxFiles?: number;
}

const TYPE_ICONS = {
  image: Image,
  video: Video,
  audio: Volume2,
  document: FileText,
};

function getFileType(file: File): keyof typeof TYPE_ICONS {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'document';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const MAX_SIZE: Record<string, number> = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
  document: 15 * 1024 * 1024,
};

export default function MediaUpload({ onUpload, maxFiles = 5 }: MediaUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      const type = getFileType(file);
      const maxSize = MAX_SIZE[type];

      if (file.size > maxSize) {
        setFiles((prev) => [
          ...prev,
          { file, error: `File too large. Max ${formatBytes(maxSize)} for ${type}` },
        ]);
        return;
      }

      const preview = type === 'image' ? URL.createObjectURL(file) : undefined;
      const entry: UploadedFile = { file, preview, uploading: true };
      setFiles((prev) => [...prev, entry]);

      try {
        await onUpload(file);
        setFiles((prev) =>
          prev.map((f) => (f.file === file ? { ...f, uploading: false } : f)),
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, uploading: false, error: 'Upload failed. Try again.' } : f,
          ),
        );
      }
    },
    [onUpload],
  );

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const arr = Array.from(fileList);
      const remaining = maxFiles - files.length;
      arr.slice(0, remaining).forEach(processFile);
    },
    [files.length, maxFiles, processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const removeFile = useCallback((file: File) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.file === file);
      if (entry?.preview) URL.revokeObjectURL(entry.preview);
      return prev.filter((f) => f.file !== file);
    });
  }, []);

  return (
    <div className="space-y-3">
      {files.length < maxFiles && (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            dragOver
              ? 'border-blue-400/80 bg-blue-500/15'
              : 'border-slate-700/50 hover:border-slate-600/60 bg-slate-800/30 hover:bg-slate-800/50'
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            className="sr-only"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <Upload className="w-6 h-6 text-slate-400" />
          <div className="text-center">
            <p className="text-slate-300 text-sm font-medium">Drop files here or click to browse</p>
            <p className="text-slate-500 text-xs mt-1">Photos, videos, documents, audio • Up to {maxFiles} files</p>
          </div>
        </label>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((entry, idx) => {
            const type = getFileType(entry.file);
            const Icon = TYPE_ICONS[type];

            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl"
              >
                {entry.preview ? (
                  <img src={entry.preview} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
                ) : (
                  <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate font-medium">{entry.file.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{formatBytes(entry.file.size)}</p>
                  {entry.error && (
                    <p className="text-red-400 text-xs mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {entry.error}
                    </p>
                  )}
                </div>

                {entry.uploading && (
                  <span className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin shrink-0" />
                )}
                {!entry.uploading && !entry.error && (
                  <span className="text-green-400 text-xs shrink-0">✓</span>
                )}

                <button
                  type="button"
                  onClick={() => removeFile(entry.file)}
                  className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

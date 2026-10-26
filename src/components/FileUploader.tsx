"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, Image as ImageIcon, X, AlertCircle } from "lucide-react";

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
}

export function FileUploader({
  files,
  onFilesChange,
  maxFiles = 10,
  maxSizeMb = 15,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    "application/pdf",
    "text/plain",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];

  const validateAndAddFiles = (newFilesList: FileList | File[]) => {
    setErrorMessage(null);
    const addedFiles: File[] = [];
    const maxBytes = maxSizeMb * 1024 * 1024;

    for (let i = 0; i < newFilesList.length; i++) {
      const file = newFilesList[i];

      if (files.length + addedFiles.length >= maxFiles) {
        setErrorMessage(`Cannot exceed the maximum limit of ${maxFiles} files.`);
        break;
      }

      if (file.size > maxBytes) {
        setErrorMessage(`File "${file.name}" exceeds the ${maxSizeMb}MB size limit.`);
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase();
      const isAllowed = allowedTypes.includes(file.type) || ["pdf", "txt", "png", "jpg", "jpeg"].includes(ext || "");

      if (!isAllowed) {
        setErrorMessage(`File "${file.name}" has an unsupported format. Supported formats: PDF, TXT, PNG, JPEG.`);
        continue;
      }

      // Check duplicates
      const exists = files.some((f) => f.name === file.name && f.size === file.size);
      if (!exists && !addedFiles.some((f) => f.name === file.name && f.size === file.size)) {
        addedFiles.push(file);
      }
    }

    if (addedFiles.length > 0) {
      onFilesChange([...files, ...addedFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-sage-600 bg-sage-50/50 scale-[0.99]"
            : "border-charcoal-200 bg-paper hover:border-charcoal-300 hover:bg-canvas/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.png,.jpg,.jpeg,application/pdf,text/plain,image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              validateAndAddFiles(e.target.files);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-sage-50 border border-sage-200 text-sage-700 flex items-center justify-center shadow-sm">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-charcoal-800">
              <span className="text-sage-700 font-semibold underline decoration-sage-300 underline-offset-2">
                Click to upload
              </span>{" "}
              or drag & drop your application documents
            </p>
            <p className="text-xs text-charcoal-500 mt-1">
              Supports PDF, TXT, PNG, and JPEG (up to {maxSizeMb}MB per file, max {maxFiles} files)
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Staged File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-600 px-1">
            <span>Staged Documents ({files.length} of {maxFiles})</span>
            <button
              type="button"
              onClick={() => onFilesChange([])}
              className="text-charcoal-400 hover:text-red-600 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.map((file, idx) => {
              const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
              const isImg = file.type.startsWith("image/");
              const sizeKb = Math.round(file.size / 1024);

              return (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-charcoal-200 bg-paper shadow-subtle group hover:border-charcoal-300 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 truncate mr-2">
                    <div className="w-8 h-8 rounded bg-charcoal-50 border border-charcoal-200 flex items-center justify-center shrink-0 text-charcoal-600">
                      {isImg ? (
                        <ImageIcon className="w-4 h-4 text-amber-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-sage-600" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium text-charcoal-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-charcoal-400 font-mono">
                        {sizeKb} KB • {isPdf ? "PDF Document" : isImg ? "Scan/Image" : "Text"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                    className="p-1 rounded-md text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

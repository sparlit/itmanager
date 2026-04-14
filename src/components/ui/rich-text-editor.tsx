import * as React from "react";
import { ReactMarkdown } from "react-markdown";
import { useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  disabled = false,
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLDivElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsPreview(!isPreview)}
          className={`
            flex h-10 w-10 items-center justify-center rounded-md border border-transparent
            bg-muted p-0 text-sm font-medium text-muted-foreground hover:bg-muted/80
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none
            transition-colors
          `}
          disabled={disabled}
        >
          {isPreview ? (
            <span className="sr-only">Edit mode</span>
          ) : (
            <span className="sr-only">Preview mode</span>
          )}
        </button>
        <span className="text-xs text-muted-foreground">
          {isPreview ? "Preview" : "Edit"}
        </span>
      </div>
      {isPreview ? (
        <div className="prose prose-sm max-w-none border rounded p-4">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      ) : (
        <div className="relative">
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              flex h-[200px] w-full rounded-md border border-input bg-background
              px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent
              file:text-sm file:font-medium placeholder:text-muted-foreground
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
              resize-none
            `}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {value.length}/10000 characters
          </div>
        </div>
      )}
    </div>
  );
}
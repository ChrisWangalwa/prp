"use client";

export interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  wordCount: number;
}

export default function PressReleaseEditor({
  value,
  onChange,
  wordCount,
}: EditorProps) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border p-2 rounded"
        rows={8}
      />
      <p className="text-sm text-gray-500 mt-1">Word count: {wordCount}</p>
    </div>
  );
}

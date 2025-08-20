"use client";

export interface PreviewProps {
  content: string;
}

export default function PressReleasePreview({ content }: PreviewProps) {
  return (
    <div className="prose border p-3 rounded bg-gray-50">
      <p>{content}</p>
    </div>
  );
}

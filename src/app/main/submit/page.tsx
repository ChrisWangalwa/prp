"use client";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import PressReleaseEditor from "@/components/press-release/Editor";
import PressReleasePreview from "@/components/press-release/Preview";
import FormFields from "@/components/press-release/FormFields";
import { countWords } from "@/utils/wordCount";
import { generateSHA256 } from "@/utils/hash";
import { uploadToR2 } from "@/lib/r2";
import Button from "@/components/ui/Button";
import { auth, db } from "@/config/firebase";
import { collection, addDoc } from "firebase/firestore";

//
// ✅ Schema fix: files optional + nullable
//
const schema = yup.object({
  headline: yup.string().required("Headline is required"),
  summary: yup.string().required("Summary is required"),
  files: yup
    .mixed<FileList>()
    .notRequired()
    .nullable()
    .test("fileSize", "Files too large", (value?: FileList | null) => {
      if (!value || value.length === 0) return true;
      return Array.from(value).every(
        (file: File) => file.size <= 5 * 1024 * 1024
      );
    })
    .test("fileType", "Unsupported file type", (value?: FileList | null) => {
      if (!value || value.length === 0) return true;
      return Array.from(value).every((file: File) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type)
      );
    }),
});

type FormData = {
  headline: string;
  summary: string;
  files?: FileList | null;
};

export default function SubmitPage() {
  const currentUser = auth.currentUser;
  const [editorContent, setEditorContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
  });

  //
  // Editor text change
  //
  const onEditorChange = (content: string) => {
    setEditorContent(content);
    const text = content.replace(/<[^>]+>/g, ""); // Strip HTML tags
    setWordCount(countWords(text));
  };

  //
  // File input change
  //
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setValue("files", e.target.files);
    }
  };

  //
  // Submit handler
  //
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (wordCount > 300) {
      alert("Content exceeds 300 words");
      return;
    }

    if (!currentUser) {
      alert("Please log in");
      return;
    }

    try {
      const fileUrls = await Promise.all(
        files.map(async (file) => {
          const hash = await generateSHA256(file);
          const { url } = await uploadToR2(file, `${hash}_${file.name}`);
          return { url, hash };
        })
      );

      await addDoc(collection(db, "press_releases"), {
        headline: data.headline,
        summary: data.summary,
        content: editorContent,
        files: fileUrls,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        status: "pending",
      });

      alert("✅ Press release submitted!");
      setEditorContent("");
      setWordCount(0);
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("❌ Submission failed");
    }
  };

  //
  // Live preview values
  //
  const headline = watch("headline");
  const summary = watch("summary");

  //
  // Word counter styling
  //
  const getWordCountColor = () => {
    if (wordCount > 300) return "text-red-600";
    if (wordCount > 250) return "text-orange-500";
    return "text-green-600";
  };

  //
  // Render
  //
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Form + Editor */}
        <div>
          <h1 className="text-2xl font-bold mb-4">Draft Press Release</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 border p-4 rounded-lg bg-white shadow-sm"
          >
            <FormFields
              register={register}
              errors={errors}
              onFileChange={onFileChange}
            />

            <PressReleaseEditor
              value={editorContent}
              onChange={onEditorChange}
              wordCount={wordCount}
            />

            {/* ✅ Word counter */}
            <div className="flex justify-between items-center text-sm">
              <span className={getWordCountColor()}>
                {wordCount} / 300 words
              </span>
              {wordCount > 300 && (
                <span className="text-red-600 font-medium">
                  Limit exceeded!
                </span>
              )}
            </div>

            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </div>

        {/* Right: Live Preview */}
        <div>
          <h1 className="text-2xl font-bold mb-4">Live Preview</h1>
          <div className="border p-4 rounded-lg bg-gray-50 shadow-sm">
            <h3 className="text-lg font-semibold">
              {headline || "Your Headline"}
            </h3>
            <p className="text-gray-600 mb-2">
              {summary || "Your summary here..."}
            </p>
            <PressReleasePreview
              content={editorContent || "<p>Start writing...</p>"}
            />

            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium">Attached Evidence:</h4>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {files.map((file, idx) => (
                    <li key={idx}>
                      {file.type.includes("pdf") ? "📄" : "🖼️"} {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import PressReleaseEditor from "@/components/press-release/Editor";
import PressReleasePreview from "@/components/press-release/Preview";
import FormFields from "@/components/press-release/FormFields";
import { countWords } from "@/utils/wordCount";
import { generateSHA256 } from "@/utils/hash";
import { uploadToR2 } from "@/lib/r2";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const schema = yup.object({
  headline: yup.string().required("Headline is required"),
  summary: yup.string().required("Summary is required"),
  files: yup
    .mixed()
    .test("fileSize", "Files too large", (value) => {
      if (!value) return true;
      return Array.from(value).every(
        (file: File) => file.size <= 5 * 1024 * 1024
      );
    })
    .test("fileType", "Unsupported file type", (value) => {
      if (!value) return true;
      return Array.from(value).every((file: File) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type)
      );
    }),
});

type FormData = yup.InferType<typeof schema>;

interface PressRelease {
  headline: string;
  summary: string;
  content: any;
  files: { url: string; hash: string }[];
  status: string;
}

export default function EditPressRelease() {
  const { currentUser } = useAuth();
  const { id } = useParams();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [wordCount, setWordCount] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState<"draft" | "preview">("draft");
  const [release, setRelease] = useState<PressRelease | null>(null);
  const [fetching, setFetching] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (!currentUser || !id) return;

    const fetchRelease = async () => {
      setFetching(true);
      try {
        const docRef = doc(db, "press_releases", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as PressRelease;
          setRelease(data);
          reset({ headline: data.headline, summary: data.summary });
          const contentText = data.content.blocks
            .map((block: any) => block.text)
            .join(" ");
          setEditorState(
            EditorState.createWithContent(
              ContentState.createFromText(contentText)
            )
          );
          setWordCount(countWords(contentText));
        } else {
          console.error("No such press release");
        }
      } catch (err) {
        console.error("Failed to fetch release:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchRelease();
  }, [currentUser, id, reset]);

  const onEditorStateChange = (newState: EditorState) => {
    setEditorState(newState);
    const content = convertToRaw(newState.getCurrentContent())
      .blocks.map((block) => block.text)
      .join(" ");
    setWordCount(countWords(content));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setValue("files", e.target.files);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (wordCount > 300) {
      alert("Content exceeds 300 words");
      return;
    }
    if (step === "draft") {
      setStep("preview");
      return;
    }
    if (!currentUser) {
      alert("Please log in");
      return;
    }

    try {
      const fileUrls =
        files.length > 0
          ? await Promise.all(
              files.map(async (file) => {
                const hash = await generateSHA256(file);
                const { url } = await uploadToR2(file, `${hash}_${file.name}`);
                return { url, hash };
              })
            )
          : release?.files || [];

      await updateDoc(doc(db, "press_releases", id as string), {
        headline: data.headline,
        summary: data.summary,
        content: convertToRaw(editorState.getCurrentContent()),
        files: fileUrls,
        updatedAt: new Date().toISOString(),
        status: "pending",
      });

      alert("Press release updated!");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (fetching) return <div className="container mx-auto p-4">Loading...</div>;
  if (!currentUser)
    return <div className="container mx-auto p-4">Please log in.</div>;
  if (!release)
    return (
      <div className="container mx-auto p-4">Press release not found.</div>
    );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Press Release</h1>
      {step === "draft" && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormFields
            register={register}
            errors={errors}
            onFileChange={onFileChange}
          />
          <PressReleaseEditor
            editorState={editorState}
            onEditorStateChange={onEditorStateChange}
            wordCount={wordCount}
          />
          <Button type="submit">Preview</Button>
        </form>
      )}
      {step === "preview" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Preview</h2>
          <h3>{release.headline}</h3>
          <p>{release.summary}</p>
          <PressReleasePreview editorState={editorState} />
          <div className="flex space-x-4">
            <Button onClick={() => setStep("draft")}>Edit</Button>
            <Button onClick={handleSubmit(onSubmit)}>Update</Button>
          </div>
        </div>
      )}
    </div>
  );
}

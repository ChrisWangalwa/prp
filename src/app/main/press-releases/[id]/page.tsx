"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // ✅ fixed import
import { db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import Card from "@/components/ui/Card";
import ReactMarkdown from "react-markdown";

interface PressRelease {
  headline: string;
  summary: string;
  content: string; // ✅ updated
  files: { url: string; hash: string }[];
  status: string;
  createdAt: any;
}

export default function PressReleaseDetail() {
  const { currentUser, loading } = useAuth();
  const { id } = useParams();
  const [release, setRelease] = useState<PressRelease | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!currentUser || !id) return;

    const fetchRelease = async () => {
      setFetching(true);
      try {
        const docRef = doc(db, "press_releases", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRelease(docSnap.data() as PressRelease);
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
  }, [currentUser, id]);

  if (loading || fetching)
    return <div className="container mx-auto p-4">Loading...</div>;
  if (!currentUser)
    return <div className="container mx-auto p-4">Please log in.</div>;
  if (!release)
    return (
      <div className="container mx-auto p-4">Press release not found.</div>
    );

  let createdAt = "Unknown date";
  if (release.createdAt?.toDate) {
    createdAt = release.createdAt.toDate().toLocaleDateString();
  } else if (typeof release.createdAt === "string") {
    createdAt = new Date(release.createdAt).toLocaleDateString();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{release.headline}</h1>
      <Card>
        <p className="text-gray-600">{release.summary}</p>
        <p className="text-sm text-gray-500">Status: {release.status}</p>
        <p className="text-sm text-gray-500">Created: {createdAt}</p>
        <div className="mt-4">
          <h2 className="text-lg font-bold">Content</h2>
          <ReactMarkdown>{release.content}</ReactMarkdown>
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-bold">Evidence Files</h2>
          {release.files?.length > 0 ? (
            <ul className="list-disc pl-5">
              {release.files.map((file, index) => (
                <li key={index}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    File {index + 1} (Hash: {file.hash})
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No files uploaded.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

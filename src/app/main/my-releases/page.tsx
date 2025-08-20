"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext"; // ✅ fixed import
import { db } from "@/config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface PressRelease {
  id: string;
  headline: string;
  summary: string;
  status: string;
  createdAt: any;
}

export default function MyReleases() {
  const { currentUser, loading } = useAuth();
  const [releases, setReleases] = useState<PressRelease[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchReleases = async () => {
      setFetching(true);
      try {
        const q = query(
          collection(db, "press_releases"),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const releasesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            headline: data.headline || "Untitled",
            summary: data.summary || "",
            status: data.status || "pending",
            createdAt: data.createdAt,
          };
        }) as PressRelease[];
        setReleases(releasesData);
      } catch (err) {
        console.error("Failed to fetch releases:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchReleases();
  }, [currentUser]);

  if (loading || fetching)
    return <div className="container mx-auto p-4">Loading...</div>;
  if (!currentUser)
    return <div className="container mx-auto p-4">Please log in.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Press Releases</h1>
      {releases.length === 0 ? (
        <p>No press releases found.</p>
      ) : (
        <div className="grid gap-4">
          {releases.map((release) => {
            let createdAt = "Unknown date";
            if (release.createdAt?.toDate) {
              createdAt = release.createdAt.toDate().toLocaleDateString();
            } else if (typeof release.createdAt === "string") {
              createdAt = new Date(release.createdAt).toLocaleDateString();
            }

            return (
              <Card key={release.id}>
                <h2 className="text-lg font-bold">{release.headline}</h2>
                <p className="text-gray-600">{release.summary}</p>
                <p className="text-sm text-gray-500">
                  Status: {release.status}
                </p>
                <p className="text-sm text-gray-500">Created: {createdAt}</p>
                <div className="flex space-x-2 mt-2">
                  <Link href={`/main/press-releases/${release.id}`}>
                    <Button>View</Button>
                  </Link>
                  {release.status === "pending" && (
                    <Link href={`/main/edit/${release.id}`}>
                      <Button>Edit</Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

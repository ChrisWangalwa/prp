"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/shared/Header";
import Card from "@/components/ui/Card";
import { db } from "@/config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface PressReleaseStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function Dashboard() {
  const { currentUser, loading } = useAuth();
  const [stats, setStats] = useState<PressReleaseStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchStats = async () => {
      setFetching(true);
      try {
        const q = query(
          collection(db, "press_releases"),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const releases = querySnapshot.docs.map((doc) => doc.data());

        const stats: PressReleaseStats = {
          total: releases.length,
          pending: releases.filter((r) => r.status === "pending").length,
          approved: releases.filter((r) => r.status === "approved").length,
          rejected: releases.filter((r) => r.status === "rejected").length,
        };
        setStats(stats);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0 }); // fallback
      } finally {
        setFetching(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  if (loading)
    return <div className="container mx-auto p-4">Checking login...</div>;
  if (!currentUser)
    return <div className="container mx-auto p-4">Please log in.</div>;
  if (fetching)
    return <div className="container mx-auto p-4">Fetching your data...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3">
          <Card>
            <h2 className="text-xl font-bold mb-4">
              My Organization in the News
            </h2>
            <p>
              Placeholder: News feed will display organization mentions (to be
              integrated with NewsAPI/Scrapfly).
            </p>
          </Card>
        </div>
        <div className="md:w-1/3">
          <Card>
            <h2 className="text-xl font-bold mb-4">Actionable Insights</h2>
            <ul className="space-y-2">
              <li>Total Releases: {stats.total}</li>
              <li>Pending: {stats.pending}</li>
              <li>Approved: {stats.approved}</li>
              <li>Rejected: {stats.rejected}</li>
              <li>
                <a
                  href="/main/submit"
                  className="text-blue-500 hover:underline"
                >
                  Submit a new release
                </a>
              </li>
              <li>
                <a
                  href="/main/my-releases"
                  className="text-blue-500 hover:underline"
                >
                  View my releases
                </a>
              </li>
              <li>
                <a
                  href="/main/notifications/settings"
                  className="text-blue-500 hover:underline"
                >
                  Manage notifications
                </a>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

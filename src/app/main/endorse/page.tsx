"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface EndorsementRequest {
  id: string;
  userEmail: string;
  endorserEmail: string;
  organization: string;
  status: string;
  createdAt: string;
}

export default function EndorsePage() {
  const { currentUser, loading } = useAuth();
  const [requests, setRequests] = useState<EndorsementRequest[]>([]);
  const [fetching, setFetching] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchRequests = async () => {
      setFetching(true);
      try {
        const q = query(
          collection(db, "endorsement_requests"),
          where("endorserEmail", "==", currentUser.email),
          where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(q);
        const requestsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as EndorsementRequest[];
        setRequests(requestsData);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchRequests();
  }, [currentUser]);

  const handleAction = async (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    if (!currentUser) return;

    setActionLoading(requestId);
    try {
      const requestRef = doc(db, "endorsement_requests", requestId);
      await updateDoc(requestRef, {
        status: action,
        updatedAt: new Date().toISOString(),
      });

      if (action === "approve") {
        const userSnapshot = await getDocs(
          query(
            collection(db, "users"),
            where(
              "email",
              "==",
              requests.find((r) => r.id === requestId)?.userEmail
            )
          )
        );
        if (!userSnapshot.empty) {
          await updateDoc(doc(db, "users", userSnapshot.docs[0].id), {
            verified: true,
          });
          await addDoc(collection(db, "endorsements"), {
            endorserId: currentUser.uid,
            userId: userSnapshot.docs[0].id,
            createdAt: Timestamp.now(),
          });
        }
      }

      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      alert(`Endorsement ${action}d!`);
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
      alert(`Failed to ${action} request`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || fetching)
    return <div className="container mx-auto p-4">Loading...</div>;
  if (!currentUser)
    return <div className="container mx-auto p-4">Please log in.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Endorsement Requests</h1>
      {requests.length === 0 ? (
        <p>No pending endorsement requests.</p>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <p>
                <strong>User Email:</strong> {request.userEmail}
              </p>
              <p>
                <strong>Organization:</strong> {request.organization}
              </p>
              <p>
                <strong>Requested:</strong>{" "}
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
              <div className="flex space-x-2 mt-2">
                <Button
                  onClick={() => handleAction(request.id, "approve")}
                  disabled={actionLoading === request.id}
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleAction(request.id, "reject")}
                  disabled={actionLoading === request.id}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

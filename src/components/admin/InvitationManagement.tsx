"use client";

import { useState, useCallback } from "react";
import { Copy, Link, Send, PlusCircle } from "lucide-react";
import { Timestamp } from "firebase/firestore";

// Define the type for an Invitation entry
interface Invitation {
  id: string;
  code: string;
  invitedBy: string;
  createdAt: Timestamp;
  status: "active" | "redeemed";
}

// Props for the InvitationManagement component
interface InvitationManagementProps {
  invitations: Invitation[];
  handleAddInvitation: (invitedBy: string) => Promise<void>;
  userId: string | null;
}

/**
 * A component for generating and managing invitation links for new users.
 * @param {InvitationManagementProps} props The component props.
 * @param {Invitation[]} props.invitations An array of invitation objects.
 * @param {(invitedBy: string) => Promise<void>} props.handleAddInvitation The function to generate a new invitation.
 * @param {string | null} props.userId The ID of the current authenticated user.
 */
const InvitationManagement: React.FC<InvitationManagementProps> = ({
  invitations,
  handleAddInvitation,
  userId,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Function to handle the generation of a new invitation code
  const handleGenerate = useCallback(async () => {
    if (!userId) {
      setError("User not authenticated. Cannot generate invitation.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await handleAddInvitation(userId);
    } catch (err: any) {
      console.error("Error generating invitation:", err);
      setError("Failed to generate a new invitation.");
    } finally {
      setLoading(false);
    }
  }, [handleAddInvitation, userId]);

  // Function to copy the invitation link to the clipboard
  const copyToClipboard = useCallback((code: string) => {
    const registrationLink = `${window.location.origin}/register?invite=${code}`;
    // Using execCommand for better iFrame compatibility
    const el = document.createElement("textarea");
    el.value = registrationLink;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    setCopiedCodeId(code);
    setTimeout(() => setCopiedCodeId(null), 2000); // Reset "Copied" message after 2 seconds
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg my-6 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
        Invitation Generation
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Generate and manage invitation links to onboard high-priority users like
        journalists and NGOs.
      </p>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* Button to generate a new invitation */}
      <div className="mb-6">
        <button
          onClick={handleGenerate}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center space-x-2"
          disabled={loading}
        >
          <PlusCircle size={20} />
          <span>Generate New Invite Link</span>
        </button>
      </div>

      {/* List of generated invitation codes */}
      <h3 className="text-xl font-semibold text-gray-700 mb-3">
        Active Invitations
      </h3>
      {invitations.length === 0 ? (
        <p className="text-gray-500">
          No active invitations have been generated yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {invitations.map((invite) => (
            <li
              key={invite.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 flex-1">
                <span className="font-mono text-sm text-gray-700 break-all">
                  {invite.code}
                </span>
                <div className="flex items-center mt-2 md:mt-0 space-x-2 text-xs text-gray-500">
                  <span className="truncate">
                    Invited by: {invite.invitedBy}
                  </span>
                  <span>-</span>
                  <span className="truncate">
                    {new Date(
                      invite.createdAt.seconds * 1000
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => copyToClipboard(invite.code)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                  aria-label="Copy invitation link"
                >
                  <Copy size={16} />
                  <span className="hidden md:inline">
                    {copiedCodeId === invite.code ? "Copied!" : "Copy Link"}
                  </span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InvitationManagement;

import React, { useState } from "react";
import { Check, X, Eye, Trash2, FileText } from "lucide-react";

// Define the Submission interface. Assumes a basic structure for now.
interface Submission {
  id: string;
  title: string;
  authorEmail: string;
  content: string; // Stored as a simple string for this example
  status: "pending" | "approved" | "rejected";
  timestamp: any;
}

interface ModerationPanelProps {
  submissions: Submission[];
  handleApproveSubmission: (id: string) => Promise<void>;
  handleRejectSubmission: (id: string) => Promise<void>;
  handleDeleteSubmission: (id: string) => Promise<void>;
}

const ModerationPanel: React.FC<ModerationPanelProps> = ({
  submissions,
  handleApproveSubmission,
  handleRejectSubmission,
  handleDeleteSubmission,
}) => {
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected"
  >("pending");

  // Filter submissions based on the active tab
  const filteredSubmissions = submissions.filter((s) => s.status === activeTab);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-xl font-semibold mb-4">Content Moderation</h2>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
            activeTab === "pending"
              ? "border-b-2 border-yellow-500 text-yellow-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending ({submissions.filter((s) => s.status === "pending").length})
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
            activeTab === "approved"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Approved ({submissions.filter((s) => s.status === "approved").length})
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
            activeTab === "rejected"
              ? "border-b-2 border-red-500 text-red-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Rejected ({submissions.filter((s) => s.status === "rejected").length})
        </button>
      </div>

      {/* List of submissions */}
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((submission) => (
                <tr
                  key={submission.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {submission.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.authorEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        submission.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : submission.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="View Content"
                      >
                        <Eye size={20} />
                      </button>
                      {submission.status !== "approved" && (
                        <button
                          onClick={() => handleApproveSubmission(submission.id)}
                          className="text-green-600 hover:text-green-900 transition-colors duration-200"
                          title="Approve"
                        >
                          <Check size={20} />
                        </button>
                      )}
                      {submission.status !== "rejected" && (
                        <button
                          onClick={() => handleRejectSubmission(submission.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          title="Reject"
                        >
                          <X size={20} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSubmission(submission.id)}
                        className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        title="Delete Permanently"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No submissions in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing submission content */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <h3 className="text-xl font-bold flex items-center">
                <FileText size={24} className="mr-2" />
                {selectedSubmission.title}
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mt-4 prose max-w-none max-h-[60vh] overflow-y-auto">
              <div
                dangerouslySetInnerHTML={{ __html: selectedSubmission.content }}
              />
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  handleApproveSubmission(selectedSubmission.id);
                  setSelectedSubmission(null);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  handleRejectSubmission(selectedSubmission.id);
                  setSelectedSubmission(null);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors duration-200"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationPanel;

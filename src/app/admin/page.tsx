// C:\Users\USER\Desktop\prp\src\app\admin\page.tsx
"use client";

import { useState, useCallback } from "react";
import {
  Users,
  FileText,
  Eye,
  BarChart as BarChartIcon,
  Mail,
  Link as LinkIcon,
} from "lucide-react";

// Import all admin components
import ModerationPanel from "@/components/admin/ModerationPanel";
import JournalistForm from "@/components/admin/JournalistForm";
import JournalistDirectory from "@/components/admin/JournalistDirectory";
import InvitationManagement from "@/components/admin/InvitationManagement";
import DomainManagement from "@/components/admin/DomainManagement";
import Analytics from "@/components/admin/Analytics";
import UserManagement from "@/components/admin/UserManagement";

// Define types for our data
interface AppUser {
  id: string;
  email: string;
  role: "admin" | "journalist" | "user";
}

interface Submission {
  id: string;
  title: string;
  authorEmail: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  timestamp: any;
}

interface Journalist {
  id: string;
  name: string;
  email: string;
  publication: string;
  country: string;
  industries: string;
}

interface Invitation {
  id: string;
  code: string;
  invitedBy: string;
  createdAt: any;
  status: "active" | "redeemed";
}

interface Domain {
  id: string;
  domain: string;
  addedAt: any;
}

// Main AdminPage component
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("analytics"); // Set analytics as default

  // State for various components
  const [users, setUsers] = useState<AppUser[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<
    "all" | "name" | "email" | "publication" | "country" | "industries"
  >("all");
  const [searchIndustry, setSearchIndustry] = useState("");
  const [newJournalist, setNewJournalist] = useState({
    name: "",
    email: "",
    publication: "",
    country: "",
    industries: "",
  });
  const [editJournalistId, setEditJournalistId] = useState<string | null>(null);

  // Handler functions for UserManagement
  const handleDeleteUser = async (userId: string) => {
    console.log("Delete user:", userId);
  };

  const handleUpdateUserRole = async (
    userId: string,
    newRole: "admin" | "journalist" | "user"
  ) => {
    console.log("Update user role:", userId, newRole);
  };

  const handleAddUser = async (
    email: string,
    role: "admin" | "journalist" | "user"
  ) => {
    console.log("Add user:", email, role);
  };

  // Handler functions for other components
  const handleApproveSubmission = async (id: string) => {
    console.log("Approve submission:", id);
  };

  const handleRejectSubmission = async (id: string) => {
    console.log("Reject submission:", id);
  };

  const handleDeleteSubmission = async (id: string) => {
    console.log("Delete submission:", id);
  };

  const handleChangeJournalist = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewJournalist({
      ...newJournalist,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddOrUpdateJournalist = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Add/update journalist:", newJournalist);
  };

  const handleCancelEdit = () => {
    setEditJournalistId(null);
    setNewJournalist({
      name: "",
      email: "",
      publication: "",
      country: "",
      industries: "",
    });
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("CSV upload:", e.target.files);
  };

  const handleEditClick = (journalist: Journalist) => {
    setEditJournalistId(journalist.id);
    setNewJournalist({
      name: journalist.name,
      email: journalist.email,
      publication: journalist.publication,
      country: journalist.country,
      industries: journalist.industries,
    });
  };

  const handleDeleteJournalist = (id: string) => {
    console.log("Delete journalist:", id);
  };

  const handleAddInvitation = async (invitedBy: string) => {
    console.log("Add invitation:", invitedBy);
  };

  const handleAddDomain = async (domain: string) => {
    console.log("Add domain:", domain);
  };

  const handleDeleteDomain = async (domainId: string) => {
    console.log("Delete domain:", domainId);
  };

  // Determine which component to render based on the activeTab state
  const renderContent = useCallback(() => {
    switch (activeTab) {
      case "submissions":
        return (
          <ModerationPanel
            submissions={submissions}
            handleApproveSubmission={handleApproveSubmission}
            handleRejectSubmission={handleRejectSubmission}
            handleDeleteSubmission={handleDeleteSubmission}
          />
        );
      case "users":
        return (
          <UserManagement
            users={users}
            handleDeleteUser={handleDeleteUser}
            handleUpdateUserRole={handleUpdateUserRole}
            handleAddUser={handleAddUser}
          />
        );
      case "journalists":
        return (
          <div className="space-y-6">
            <JournalistForm
              newJournalist={newJournalist}
              handleChange={handleChangeJournalist}
              handleAddOrUpdateJournalist={handleAddOrUpdateJournalist}
              editJournalistId={editJournalistId}
              handleCancelEdit={handleCancelEdit}
              handleCsvUpload={handleCsvUpload}
            />
            <JournalistDirectory
              journalists={journalists}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchCategory={searchCategory}
              setSearchCategory={setSearchCategory}
              searchIndustry={searchIndustry}
              setSearchIndustry={setSearchIndustry}
              handleEditClick={handleEditClick}
              handleDeleteJournalist={handleDeleteJournalist}
            />
          </div>
        );
      case "analytics":
        return <Analytics />;
      case "invitations":
        return (
          <InvitationManagement
            invitations={invitations}
            handleAddInvitation={handleAddInvitation}
            userId="admin-user-id" // This would come from your auth context
          />
        );
      case "domains":
        return (
          <DomainManagement
            domains={domains}
            handleAddDomain={handleAddDomain}
            handleDeleteDomain={handleDeleteDomain}
          />
        );
      default:
        // Default to analytics
        return <Analytics />;
    }
  }, [
    activeTab,
    users,
    submissions,
    journalists,
    invitations,
    domains,
    newJournalist,
    editJournalistId,
    searchQuery,
    searchCategory,
    searchIndustry,
  ]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col sm:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full sm:w-64 bg-gray-800 text-gray-200 p-4 sm:p-6 flex flex-col rounded-b-xl sm:rounded-r-xl sm:rounded-bl-none">
        <h1 className="text-2xl font-bold mb-6 text-indigo-400">Admin Panel</h1>
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 ${
                activeTab === "analytics"
                  ? "bg-gray-700 text-indigo-400 font-semibold"
                  : "hover:bg-gray-700"
              }`}
            >
              <BarChartIcon className="w-5 h-5 mr-3" />
              Analytics
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 ${
                activeTab === "submissions"
                  ? "bg-gray-700 text-indigo-400 font-semibold"
                  : "hover:bg-gray-700"
              }`}
            >
              <FileText className="w-5 h-5 mr-3" />
              Submissions
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 ${
                activeTab === "users"
                  ? "bg-gray-700 text-indigo-400 font-semibold"
                  : "hover:bg-gray-700"
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              Users
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("journalists")}
              className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 ${
                activeTab === "journalists"
                  ? "bg-gray-700 text-indigo-400 font-semibold"
                  : "hover:bg-gray-700"
              }`}
            >
              <Eye className="w-5 h-5 mr-3" />
              Journalists
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("invitations")}
              className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 ${
                activeTab === "invitations"
                  ? "bg-gray-700 text-indigo-400 font-semibold"
                  : "hover:bg-gray-700"
              }`}
            >
              <Mail className="w-5 h-5 mr-3" />
              Invitations
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("domains")}
              className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 ${
                activeTab === "domains"
                  ? "bg-gray-700 text-indigo-400 font-semibold"
                  : "hover:bg-gray-700"
              }`}
            >
              <LinkIcon className="w-5 h-5 mr-3" />
              Domains
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto">
          {/* Render the selected component */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;

"use client";

import { useState, useCallback } from "react";
import { PlusCircle, Trash2, Upload } from "lucide-react";
import { Timestamp } from "firebase/firestore";

// Define the type for a Domain entry
interface Domain {
  id: string;
  domain: string;
  addedAt: Timestamp;
}

// Props for the DomainManagement component
interface DomainManagementProps {
  domains: Domain[];
  handleAddDomain: (domain: string) => Promise<void>;
  handleDeleteDomain: (domainId: string) => Promise<void>;
}

const DomainManagement: React.FC<DomainManagementProps> = ({
  domains,
  handleAddDomain,
  handleDeleteDomain,
}) => {
  const [newDomain, setNewDomain] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input change for the new domain
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDomain(e.target.value);
  }, []);

  // Handle single domain submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newDomain.trim()) {
        setError("Domain cannot be empty.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await handleAddDomain(newDomain.trim());
        setNewDomain("");
      } catch (err: any) {
        console.error("Error adding domain:", err);
        setError("Failed to add domain.");
      } finally {
        setLoading(false);
      }
    },
    [newDomain, handleAddDomain]
  );

  // Handle CSV Upload
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      for (const domain of lines) {
        try {
          await handleAddDomain(domain);
        } catch (err) {
          console.error(`Failed to add domain ${domain}:`, err);
        }
      }
    } catch (err) {
      console.error("Error processing CSV:", err);
      setError("Failed to process CSV file.");
    } finally {
      setLoading(false);
      // Reset input so the same file can be uploaded again if needed
      e.target.value = "";
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner my-6 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
        Domain Management
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Approve email domains (e.g., example.com) to allow automated
        verification for new user registrations.
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

      {/* Single domain form */}
      <form onSubmit={handleSubmit} className="mb-4 flex space-x-2">
        <input
          type="text"
          value={newDomain}
          onChange={handleChange}
          placeholder="e.g., example.com"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center space-x-2"
          disabled={loading}
        >
          <PlusCircle size={20} />
          <span>Add Domain</span>
        </button>
      </form>

      {/* CSV upload */}
      <div className="mb-6">
        <label className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105">
          <Upload size={20} />
          <span>Upload CSV</span>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
            disabled={loading}
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Upload a CSV file with one domain per line.
        </p>
      </div>

      {/* List of existing domains */}
      <h3 className="text-xl font-semibold text-gray-700 mb-3">
        Approved Domains
      </h3>
      {domains.length === 0 ? (
        <p className="text-gray-500">No domains have been added yet.</p>
      ) : (
        <ul className="space-y-3">
          {domains.map((domain) => (
            <li
              key={domain.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md"
            >
              <span className="font-mono text-gray-700">{domain.domain}</span>
              <button
                onClick={() => handleDeleteDomain(domain.id)}
                className="text-red-500 hover:text-red-700 p-2 rounded-full transition-colors duration-200"
                disabled={loading}
                aria-label={`Delete domain ${domain.domain}`}
              >
                <Trash2 size={20} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DomainManagement;

import React from "react";

// Define the props for the JournalistForm component
interface JournalistFormProps {
  newJournalist: {
    name: string;
    email: string;
    publication: string;
    country: string;
    industries: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddOrUpdateJournalist: (e: React.FormEvent) => Promise<void>;
  editJournalistId: string | null;
  handleCancelEdit: () => void;
  handleCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const JournalistForm: React.FC<JournalistFormProps> = ({
  newJournalist,
  handleChange,
  handleAddOrUpdateJournalist,
  editJournalistId,
  handleCancelEdit,
  handleCsvUpload,
}) => {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-inner mb-8 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">
        {editJournalistId ? "Edit Journalist" : "Add a New Journalist"}
      </h2>
      <form onSubmit={handleAddOrUpdateJournalist} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newJournalist.name}
            onChange={handleChange}
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newJournalist.email}
            onChange={handleChange}
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            required
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <input
            type="text"
            name="publication"
            placeholder="Publication"
            value={newJournalist.publication}
            onChange={handleChange}
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={newJournalist.country}
            onChange={handleChange}
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div>
          <input
            type="text"
            name="industries"
            placeholder="Industries (comma-separated)"
            value={newJournalist.industries}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white p-2 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            {editJournalistId ? "Update Journalist" : "Add Journalist"}
          </button>
          {editJournalistId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex-1 bg-gray-400 text-white p-2 rounded-md font-semibold hover:bg-gray-500 transition-colors duration-200 shadow-md"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
      <div className="mt-4 border-t pt-4 border-gray-300">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or upload from CSV:
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
    </div>
  );
};

export default JournalistForm;

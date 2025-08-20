import React, { useMemo, useEffect } from "react";

// Define the props interface and data types
interface Journalist {
  id: string;
  name: string;
  email: string;
  publication: string;
  country: string;
  industries: string;
}

interface JournalistDirectoryProps {
  journalists: Journalist[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchCategory:
    | "all"
    | "name"
    | "email"
    | "publication"
    | "country"
    | "industries";
  setSearchCategory: (
    category:
      | "all"
      | "name"
      | "email"
      | "publication"
      | "country"
      | "industries"
  ) => void;
  searchIndustry: string;
  setSearchIndustry: (industry: string) => void;
  handleEditClick: (journalist: Journalist) => void;
  handleDeleteJournalist: (id: string) => void;
}

const JournalistDirectory: React.FC<JournalistDirectoryProps> = ({
  journalists,
  searchQuery,
  setSearchQuery,
  searchCategory,
  setSearchCategory,
  searchIndustry,
  setSearchIndustry,
  handleEditClick,
  handleDeleteJournalist,
}) => {
  // Memoize the list of unique industries for the datalist
  const uniqueIndustries = useMemo(() => {
    const allIndustries = journalists.flatMap((j) =>
      j.industries.split(",").map((industry) => industry.trim())
    );
    return [...new Set(allIndustries)].sort();
  }, [journalists]);

  // Reset the search industry when the category changes
  useEffect(() => {
    if (searchCategory !== "industries") {
      setSearchIndustry("");
    }
  }, [searchCategory]);

  // Memoize the filtered list of journalists for search
  const filteredJournalists = useMemo(() => {
    let filtered = journalists;
    const lowercasedQuery = searchQuery.toLowerCase();

    switch (searchCategory) {
      case "name":
        filtered = filtered.filter((j) =>
          j.name.toLowerCase().includes(lowercasedQuery)
        );
        break;
      case "email":
        filtered = filtered.filter((j) =>
          j.email.toLowerCase().includes(lowercasedQuery)
        );
        break;
      case "publication":
        filtered = filtered.filter((j) =>
          j.publication.toLowerCase().includes(lowercasedQuery)
        );
        break;
      case "country":
        filtered = filtered.filter((j) =>
          j.country.toLowerCase().includes(lowercasedQuery)
        );
        break;
      case "industries":
        const lowercasedIndustryQuery = searchIndustry.toLowerCase();
        if (lowercasedIndustryQuery) {
          filtered = filtered.filter((j) =>
            j.industries
              .toLowerCase()
              .split(",")
              .some((industry) =>
                industry.trim().includes(lowercasedIndustryQuery)
              )
          );
        }
        break;
      case "all":
      default:
        if (lowercasedQuery) {
          filtered = filtered.filter(
            (j) =>
              j.name.toLowerCase().includes(lowercasedQuery) ||
              j.email.toLowerCase().includes(lowercasedQuery) ||
              j.publication.toLowerCase().includes(lowercasedQuery) ||
              j.country.toLowerCase().includes(lowercasedQuery) ||
              j.industries.toLowerCase().includes(lowercasedQuery)
          );
        }
        break;
    }
    return filtered;
  }, [journalists, searchQuery, searchCategory, searchIndustry]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-inner mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Journalist Directory
      </h2>
      {/* Search bar with category selection */}
      <div className="flex space-x-2 mb-4">
        <select
          value={searchCategory}
          onChange={(e) =>
            setSearchCategory(
              e.target.value as
                | "all"
                | "name"
                | "email"
                | "publication"
                | "country"
                | "industries"
            )
          }
          className="p-3 rounded-lg border-2 border-gray-300 bg-white focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Fields</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="publication">Publication</option>
          <option value="country">Country</option>
          <option value="industries">Industries</option>
        </select>
        {/* Conditionally render the second input for hierarchical search */}
        {searchCategory === "industries" ? (
          <>
            <input
              type="text"
              value={searchIndustry}
              onChange={(e) => setSearchIndustry(e.target.value)}
              placeholder="Search specific industry..."
              list="industry-options"
              className="flex-1 p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500"
            />
            <datalist id="industry-options">
              {uniqueIndustries.map((industry) => (
                <option key={industry} value={industry} />
              ))}
            </datalist>
          </>
        ) : (
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search by ${searchCategory}...`}
            className="flex-1 p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500"
          />
        )}
      </div>
      {filteredJournalists.length === 0 ? (
        <p className="text-center text-gray-500">
          No journalists found.{" "}
          {searchQuery || searchIndustry
            ? "Please try a different search."
            : "Add one above!"}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publication
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industries
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJournalists.map((journalist) => (
                <tr
                  key={journalist.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {journalist.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {journalist.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {journalist.publication}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {journalist.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {journalist.industries}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditClick(journalist)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJournalist(journalist.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JournalistDirectory;

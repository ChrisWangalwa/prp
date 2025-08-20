import React, { useState, useMemo, useCallback } from "react";
import { User, Shield, Trash2, Search, PlusCircle } from "lucide-react";

// Define the User interface, assuming a simple structure for now
interface AppUser {
  id: string;
  email: string;
  role: "admin" | "journalist" | "user";
}

// Define the props for the UserManagement component
interface UserManagementProps {
  users: AppUser[];
  handleDeleteUser: (userId: string) => Promise<void>;
  handleUpdateUserRole: (
    userId: string,
    newRole: "admin" | "journalist" | "user"
  ) => Promise<void>;
  handleAddUser: (
    email: string,
    role: "admin" | "journalist" | "user"
  ) => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  handleDeleteUser,
  handleUpdateUserRole,
  handleAddUser,
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "journalist" | "user">("user");
  const [searchQuery, setSearchQuery] = useState("");
  const [addingUser, setAddingUser] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (email.trim() === "") return;
      await handleAddUser(email, role);
      setEmail("");
      setAddingUser(false);
    },
    [email, role, handleAddUser]
  );

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button
          onClick={() => setAddingUser(!addingUser)}
          className="bg-blue-600 text-white py-1 px-3 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center"
        >
          <PlusCircle size={18} className="mr-2" />
          Add User
        </button>
      </div>

      {addingUser && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-gray-100 p-4 rounded-md shadow-inner"
        >
          <h3 className="text-lg font-medium mb-2">Add New User</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="email"
              placeholder="User Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 p-2 border rounded-md"
              required
            />
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "admin" | "journalist" | "user")
              }
              className="p-2 border rounded-md"
            >
              <option value="user">User</option>
              <option value="journalist">Journalist</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="bg-green-600 text-white p-2 rounded-md font-semibold hover:bg-green-700 transition-colors duration-200"
            >
              Confirm Add
            </button>
          </div>
        </form>
      )}

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search users by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                    <User size={16} className="text-gray-500 mr-2" />
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "journalist"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleUpdateUserRole(user.id, "admin")}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          aria-label="Make admin"
                          title="Make Admin"
                        >
                          <Shield size={20} />
                        </button>
                      )}
                      {user.role !== "user" && (
                        <button
                          onClick={() => handleUpdateUserRole(user.id, "user")}
                          className="text-green-600 hover:text-green-900 transition-colors duration-200"
                          aria-label="Make user"
                          title="Make User"
                        >
                          <User size={20} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        aria-label="Delete user"
                        title="Delete User"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;

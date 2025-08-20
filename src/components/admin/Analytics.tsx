"use client";
// Declare global variables provided by the Canvas environment.
declare var __app_id: string;
declare var __firebase_config: string;
declare var __initial_auth_token: string;

import { useState, useEffect, useMemo, useCallback } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  getDoc,
  doc,
  getCountFromServer,
} from "firebase/firestore";
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import { Bell, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Define the types for the data we'll be fetching
interface Notification {
  id: string;
  status: "sent" | "seen" | "delivered";
  targetUser: string;
  timestamp: Date;
  title: string;
}
interface Journalist {
  id: string;
  name: string;
  email: string;
}

// MOCK DATA for demonstration purposes
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif1",
    status: "sent",
    targetUser: "j1",
    title: "New Product Launch",
    timestamp: new Date(),
  },
  {
    id: "notif2",
    status: "seen",
    targetUser: "j2",
    title: "Q3 Earnings Report",
    timestamp: new Date(),
  },
  {
    id: "notif3",
    status: "sent",
    targetUser: "j1",
    title: "Partnership Announcement",
    timestamp: new Date(),
  },
  {
    id: "notif4",
    status: "delivered",
    targetUser: "j3",
    title: "New Feature Release",
    timestamp: new Date(),
  },
  {
    id: "notif5",
    status: "seen",
    targetUser: "j4",
    title: "Funding Round Complete",
    timestamp: new Date(),
  },
];

const MOCK_JOURNALISTS: Journalist[] = [
  { id: "j1", name: "Jane Doe", email: "jane.doe@news.com" },
  { id: "j2", name: "John Smith", email: "john.smith@report.net" },
  { id: "j3", name: "Emily White", email: "emily@media.co" },
  { id: "j4", name: "David Chen", email: "david.c@world.com" },
];

const getJournalistName = (id: string) => {
  const journalist = MOCK_JOURNALISTS.find((j) => j.id === id);
  return journalist ? journalist.name : "Unknown Journalist";
};

// Data for the pie chart colors
const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const Analytics = () => {
  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [notificationStatusData, setNotificationStatusData] = useState<any>([]);

  // Memoize Firebase initialization to prevent re-initialization
  const { firebaseApp, firestoreDb, firebaseAuth } = useMemo(() => {
    // Check if Firebase app is already initialized
    const firebaseConfig = JSON.parse(
      typeof __firebase_config !== "undefined" ? __firebase_config : "{}"
    );
    const app =
      getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    return {
      firebaseApp: app,
      firestoreDb: firestore,
      firebaseAuth: auth,
    };
  }, []);

  // Effect to initialize Firebase and authenticate the user
  useEffect(() => {
    const initFirebase = async () => {
      try {
        setDb(firestoreDb);
        setAuth(firebaseAuth);

        // Sign in with the provided custom token, or anonymously as a fallback
        if (typeof __initial_auth_token !== "undefined") {
          await signInWithCustomToken(firebaseAuth, __initial_auth_token);
        } else {
          await signInAnonymously(firebaseAuth);
        }

        // Listen for authentication state changes after sign-in attempt
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
          if (user) {
            setUserId(user.uid);
          } else {
            setUserId(null);
          }
        });
        return () => unsubscribe();
      } catch (e: any) {
        console.error(
          "Firebase initialization or authentication error:",
          e.message
        );
      }
    };
    initFirebase();
  }, [firebaseApp, firestoreDb, firebaseAuth]);

  useEffect(() => {
    // Simulate fetching data with mock data for now
    const statusCounts = MOCK_NOTIFICATIONS.reduce(
      (acc: any, notification: Notification) => {
        acc[notification.status] = (acc[notification.status] || 0) + 1;
        return acc;
      },
      {}
    );
    const formattedData = Object.keys(statusCounts).map((status) => ({
      name: status,
      value: statusCounts[status],
    }));
    setNotificationStatusData(formattedData);
  }, []);

  // Render a custom label on the pie chart slices
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-indigo-800">
          Analytics
        </h1>

        {/* Key Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between transition-transform duration-300 hover:scale-105 border border-gray-200 hover:border-indigo-500">
            <div className="flex items-center">
              <Bell size={32} className="text-indigo-500 mr-4" />
              <div>
                <p className="text-lg text-gray-500">Total Notifications</p>
                <p className="text-3xl font-bold text-gray-900">
                  {MOCK_NOTIFICATIONS.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between transition-transform duration-300 hover:scale-105 border border-gray-200 hover:border-indigo-500">
            <div className="flex items-center">
              <CheckCircle size={32} className="text-green-500 mr-4" />
              <div>
                <p className="text-lg text-gray-500">Seen Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(
                    (MOCK_NOTIFICATIONS.filter((n) => n.status === "seen")
                      .length /
                      MOCK_NOTIFICATIONS.length) *
                    100
                  ).toFixed(0)}
                  %
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between transition-transform duration-300 hover:scale-105 border border-gray-200 hover:border-indigo-500">
            <div className="flex items-center">
              <XCircle size={32} className="text-red-500 mr-4" />
              <div>
                <p className="text-lg text-gray-500">Unseen Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(
                    (MOCK_NOTIFICATIONS.filter((n) => n.status === "sent")
                      .length /
                      MOCK_NOTIFICATIONS.length) *
                    100
                  ).toFixed(0)}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notification Status Chart (Pie) */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Notification Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={notificationStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {notificationStatusData.map((_entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Notification Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Recent Notifications
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Journalist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {MOCK_NOTIFICATIONS.map((notif) => (
                    <tr key={notif.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {notif.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getJournalistName(notif.targetUser)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            notif.status === "seen"
                              ? "bg-green-100 text-green-800"
                              : notif.status === "delivered"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {notif.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

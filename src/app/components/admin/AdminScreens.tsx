import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, CheckCircle, Clock, Search, Filter, Camera, XCircle, QrCode } from 'lucide-react';

export const AdminLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">Access the staff dashboard</p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input id="username" name="username" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm" placeholder="Username" />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm" placeholder="Password" />
            </div>
          </div>

          <div>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <button className="bg-black text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-800">Start Boarding</button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-300">Pause Boarding</button>
          <button className="border border-red-500 text-red-600 px-4 py-2 rounded-md font-bold text-sm hover:bg-red-50">End Boarding</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Passengers" value="184" icon={<Users className="text-blue-500" />} />
        <StatCard title="Boarded" value="142" subtext="77%" icon={<CheckCircle className="text-green-500" />} />
        <StatCard title="Remaining" value="42" icon={<Clock className="text-orange-500" />} />
        <StatCard title="Delayed" value="3" icon={<AlertTriangle className="text-red-500" />} />
      </div>

      {/* Recent Activity or Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-8">
        <h3 className="font-bold text-lg mb-4">Boarding Progress</h3>
        <div className="w-full bg-gray-100 rounded-full h-4 mb-2 overflow-hidden">
          <div className="bg-green-500 h-4 rounded-full" style={{ width: '77%' }}></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon }: { title: string, value: string, subtext?: string, icon: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{title}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-3xl font-black">{value}</p>
        {subtext && <span className="text-sm text-green-600 font-bold">{subtext}</span>}
      </div>
    </div>
    <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
  </div>
);

export const AdminPassengerList = () => {
  const [filter, setFilter] = useState('All');

  const passengers = [
    { name: "John Doe", seat: "4A", group: "3", status: "Boarded" },
    { name: "Jane Smith", seat: "4B", group: "3", status: "Waiting" },
    { name: "Alice Johnson", seat: "5C", group: "2", status: "Boarded" },
    { name: "Bob Brown", seat: "6D", group: "1", status: "Rejected" },
  ];

  const filteredPassengers = filter === 'All' ? passengers : passengers.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Passenger List</h1>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search passenger..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="text-gray-400 w-5 h-5" />
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Passengers</option>
              <option value="Boarded">Boarded</option>
              <option value="Waiting">Waiting</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Seat</th>
                <th className="p-4">Group</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredPassengers.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 text-gray-600">{p.seat}</td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">{p.group}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      p.status === 'Boarded' ? 'bg-green-100 text-green-800' :
                      p.status === 'Waiting' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AdminScanner = () => {
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);

  const simulateScan = () => {
    // Randomly succeed or fail
    const success = Math.random() > 0.3;
    setScanResult(success ? 'success' : 'error');
    setTimeout(() => setScanResult(null), 3000);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Scan Boarding Pass</h1>
        <p className="text-gray-500 mt-2">Position the QR code within the frame</p>
      </div>

      <div className="relative w-full max-w-md aspect-square bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-8 border-gray-800 flex items-center justify-center">
        <Camera className="text-gray-700 w-16 h-16 absolute top-4 right-4 opacity-50" />
        
        {/* Viewfinder overlay */}
        <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none"></div>
        <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
        </div>

        {/* Simulate scanning */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent animate-[scan_2s_linear_infinite] pointer-events-none"></div>
        
        <button 
            onClick={simulateScan}
            className="absolute bottom-8 px-6 py-3 bg-white text-black font-bold rounded-full shadow-lg hover:bg-gray-100 active:scale-95 transition-all z-20"
        >
            Simulate Scan
        </button>

        {scanResult && (
            <div className={`absolute inset-0 z-30 flex items-center justify-center bg-opacity-90 backdrop-blur-sm ${scanResult === 'success' ? 'bg-green-900/90' : 'bg-red-900/90'}`}>
                <div className="text-center text-white p-8">
                    {scanResult === 'success' ? (
                        <>
                            <CheckCircle size={64} className="mx-auto mb-4 text-green-400" />
                            <h3 className="text-2xl font-bold mb-2">Access Granted</h3>
                            <p className="text-green-200">John Doe - Seat 4A</p>
                        </>
                    ) : (
                        <>
                            <XCircle size={64} className="mx-auto mb-4 text-red-400" />
                            <h3 className="text-2xl font-bold mb-2">Access Denied</h3>
                            <p className="text-red-200">Invalid Ticket or Wrong Group</p>
                        </>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export const AdminControl = () => {
  const [currentGroup, setCurrentGroup] = useState(3);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Boarding Control</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg border-2 border-black shadow-lg flex flex-col items-center justify-center text-center space-y-6">
            <h2 className="text-gray-500 font-bold uppercase tracking-widest text-sm">Now Boarding</h2>
            <div className="text-8xl font-black">{currentGroup}</div>
            <div className="flex gap-4 w-full justify-center">
                <button 
                    onClick={() => setCurrentGroup(Math.max(1, currentGroup - 1))}
                    disabled={currentGroup === 1}
                    className="px-6 py-3 border-2 border-gray-200 rounded-lg font-bold hover:bg-gray-50 disabled:opacity-50"
                >
                    Previous Group
                </button>
                <button 
                    onClick={() => setCurrentGroup(Math.min(5, currentGroup + 1))}
                    disabled={currentGroup === 5}
                    className="px-6 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
                >
                    Next Group
                </button>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-orange-500" size={20} />
                    Gate Actions
                </h3>
                <div className="space-y-4">
                    <button className="w-full text-left px-4 py-3 bg-red-50 text-red-700 font-bold rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                        Close Gate Immediately
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-yellow-50 text-yellow-700 font-bold rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors">
                        Announce Delay
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Boarding Statistics</h3>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Passengers Boarded</span>
                    <span className="font-bold">142 / 184</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Time Remaining</span>
                    <span className="font-bold text-orange-600">14:20</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export const AdminSettings = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg">Enable Notifications</h3>
                        <p className="text-gray-500 text-sm">Send push notifications to passengers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                </div>

                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg">Auto-close Gate</h3>
                        <p className="text-gray-500 text-sm">Automatically close gate when time expires</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <h3 className="font-bold text-lg">Boarding Time Limit</h3>
                        <p className="text-gray-500 text-sm mb-2">Default duration for boarding process (minutes)</p>
                    </div>
                    <input type="number" defaultValue={45} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
            </div>

            <div className="flex justify-end">
                <button className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 shadow-lg">
                    Save Settings
                </button>
            </div>
        </div>
    );
};

import React, { useEffect, useState } from "react";
import {
  adminListRequests,
  adminUpdateRequest,
  adminListAllProviders
} from "@/lib/database";

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);

  const load = async () => {
  const req = await adminListRequests();
  setRequests(req);

  const prov = await adminListAllProviders();
  setProviders(prov);
};

  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, status: string) => {
    await adminUpdateRequest(id, status);
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Control Center</h1>

      {/* CLIENT REQUEST MONITOR */}
      <div>
        <h2 className="font-semibold mb-3">Client Requests</h2>

        {requests.map((r) => (
          <div
            key={r.id}
            className="border rounded-lg p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{r.request_number}</p>
              <p className="text-sm text-gray-500">Status: {r.status}</p>
            </div>

            <div className="space-x-2">
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={() => update(r.id, "assigned")}
              >
                Assign
              </button>

              <button
                className="px-3 py-1 bg-yellow-500 text-white rounded"
                onClick={() => update(r.id, "in_progress")}
              >
                Start
              </button>

              <button
                className="px-3 py-1 bg-green-600 text-white rounded"
                onClick={() => update(r.id, "completed")}
              >
                Complete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PROVIDER MONITORING */}
      <div>
        <h2 className="font-semibold mb-3">Provider Monitoring</h2>

        {providers.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg p-4 mb-3 flex justify-between"
          >
            <div>
              <p className="font-medium">{p.name || "Provider"}</p>
              <p className="text-sm text-gray-500">
                Status: {p.verification_status || "pending"}
              </p>
            </div>

            <button className="px-3 py-1 bg-green-600 text-white rounded">
              Approve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
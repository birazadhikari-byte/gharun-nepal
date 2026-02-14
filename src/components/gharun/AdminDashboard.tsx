import React, { useEffect, useState } from "react";
import { adminListRequests, adminUpdateRequest } from "@/lib/database";

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);

  const load = async () => {
    const data = await adminListRequests();
    setRequests(data);
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, status: string) => {
    await adminUpdateRequest(id, status);
    load();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>

      {requests.map((r) => (
        <div key={r.id} className="border p-3 mb-2">
          <p>{r.request_number}</p>
          <p>{r.status}</p>

          <button onClick={() => update(r.id, "assigned")}>Assign</button>
          <button onClick={() => update(r.id, "in_progress")}>Start</button>
          <button onClick={() => update(r.id, "completed")}>Complete</button>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
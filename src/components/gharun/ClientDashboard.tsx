import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createServiceRequest, fetchServiceRequests } from "@/lib/database";

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    service_type: "",
    location: "",
    description: "",
  });

  const load = async () => {
    if (!user?.id) return;
    const data = await fetchServiceRequests(user.id);
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const submit = async () => {
    if (!user) return;

    await createServiceRequest({
      client_id: user.id,
      client_name: user.name,
      service_type: form.service_type,
      location: form.location,
      description: form.description,
    });

    setForm({ service_type: "", location: "", description: "" });
    load();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Client Dashboard</h1>

      <input
        placeholder="Service"
        value={form.service_type}
        onChange={(e) => setForm({ ...form, service_type: e.target.value })}
      />
      <input
        placeholder="Location"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <button onClick={submit}>Submit Request</button>

      <hr className="my-6" />

      {loading ? "Loading..." : requests.map((r) => (
        <div key={r.id}>
          {r.request_number} — {r.status}
        </div>
      ))}
    </div>
  );
};

export default ClientDashboard;
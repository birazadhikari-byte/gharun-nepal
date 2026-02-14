import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { providerJobs } from "@/lib/database";

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    providerJobs(user.id).then(setJobs);
  }, [user?.id]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Provider Jobs</h1>
      {jobs.map((j) => (
        <div key={j.id}>
          {j.request_number} — {j.status}
        </div>
      ))}
    </div>
  );
};

export default ProviderDashboard;
"use client";

import { useEffect, useState } from "react";
import { getEquipment, Equipment } from "@/lib/equipment";
import { createRequest } from "@/lib/requests";

export default function CreateRequestPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipmentId, setEquipmentId] = useState<number>();
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEquipment()
      .then(setEquipment)
      .catch(err => setError(err.message));
  }, []);

  async function submit() {
    if (!equipmentId || !subject) {
      setError("All fields required");
      return;
    }

    try {
      setLoading(true);
      await createRequest({
        subject,
        equipment_id: equipmentId,
        maintenance_type: "corrective"
      });
      alert("Request created");
      setSubject("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl p-6">
      <h1 className="text-xl font-bold mb-4">Create Maintenance Request</h1>

      {error && <p className="text-red-500">{error}</p>}

      <input
        className="border p-2 w-full mb-3"
        placeholder="Issue description"
        value={subject}
        onChange={e => setSubject(e.target.value)}
      />

      <select
        className="border p-2 w-full mb-3"
        onChange={e => setEquipmentId(Number(e.target.value))}
      >
        <option value="">Select Equipment</option>
        {equipment.map(eq => (
          <option key={eq.id} value={eq.id}>
            {eq.name}
          </option>
        ))}
      </select>

      <button
        onClick={submit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </div>
  );
}

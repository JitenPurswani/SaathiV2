import { useEffect, useState } from 'react';

export function TimePickerModal({
  open,
  onClose,
  onConfirm,
  title = 'Set reminder time',
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (date: Date | null) => void; // null => fallback
  title?: string;
}) {
  const [time, setTime] = useState<string>('');
  const [preset, setPreset] = useState<string>('');

  useEffect(() => {
    if (!open) {
      setTime('');
      setPreset('');
    }
  }, [open]);

  if (!open) return null;

  const computeDate = (): Date | null => {
    // Preset takes priority
    const now = new Date();
    if (preset) {
      const mins = parseInt(preset, 10);
      const d = new Date(now);
      d.setMinutes(d.getMinutes() + mins);
      return d;
    }
    if (!time) return null;
    const [hh, mm] = time.split(':').map(Number);
    if (Number.isFinite(hh) && Number.isFinite(mm)) {
      const d = new Date(now);
      d.setHours(hh, mm, 0, 0);
      // if chosen earlier than now, schedule for tomorrow
      if (d < now) d.setDate(d.getDate() + 1);
      return d;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-sm rounded-xl p-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 min-w-[80px]">Time</label>
            <input
              type="time"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 min-w-[80px]">Quick</label>
            <select
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
            >
              <option value="">Custom…</option>
              <option value="15">In 15 min</option>
              <option value="30">In 30 min</option>
              <option value="60">In 1 hour</option>
              <option value="120">In 2 hours</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(computeDate())}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
}



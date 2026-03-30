import { useSignals } from '@preact/signals-react/runtime';
import { toastMessage } from '../store/signals';

const colors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-indigo-500',
};

export default function Toast() {
  useSignals();
  const toast = toastMessage.value;
  if (!toast) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${colors[toast.type]}
        text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium
        animate-pulse max-w-sm text-center`}
    >
      {toast.text}
    </div>
  );
}

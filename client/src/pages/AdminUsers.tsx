import { useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import { showToast } from '../store/signals';
import Dialog from '../components/Dialog';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  companyName?: string;
  jobTitle?: string;
  address?: { city?: string; street?: string; zipCode?: string; country?: string };
  createdAt: string;
}

const roleLabel: Record<string, string> = {
  admin: 'מנהל',
  surveyor: 'סוקר',
  surveyed: 'נסקר',
};
const roleColor: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  surveyor: 'bg-blue-100 text-blue-700',
  surveyed: 'bg-green-100 text-green-700',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll({ search, role: roleFilter });
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, roleFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק משתמש זה?')) return;
    try {
      await usersApi.remove(id);
      showToast('משתמש נמחק', 'success');
      load();
    } catch {
      showToast('שגיאה במחיקה', 'error');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await usersApi.update(user._id, { isActive: !user.isActive } as any);
      showToast(user.isActive ? 'משתמש הושבת' : 'משתמש הופעל', 'success');
      load();
    } catch {
      showToast('שגיאה בעדכון', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {(showForm || editUser) && (
        <UserFormModal
          user={editUser}
          onClose={() => { setShowForm(false); setEditUser(null); }}
          onSuccess={() => { load(); setShowForm(false); setEditUser(null); }}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ניהול משתמשים</h1>
          <p className="text-gray-500 text-sm">{users.length} משתמשים במערכת</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          ➕ משתמש חדש
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          className="input max-w-xs"
          placeholder="🔍 חפש שם, אימייל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input max-w-[160px]" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">כל התפקידים</option>
          <option value="admin">מנהלים</option>
          <option value="surveyor">סוקרים</option>
          <option value="surveyed">נסקרים</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">טוען...</div>
      ) : users.length === 0 ? (
        <div className="card text-center py-14">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-gray-500">לא נמצאו משתמשים</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500 text-xs">
                <th className="text-right pb-3 font-medium">שם</th>
                <th className="text-right pb-3 font-medium">אימייל</th>
                <th className="text-right pb-3 font-medium">טלפון</th>
                <th className="text-right pb-3 font-medium">תפקיד</th>
                <th className="text-right pb-3 font-medium">חברה</th>
                <th className="text-right pb-3 font-medium">סטטוס</th>
                <th className="text-right pb-3 font-medium">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                  <td className="py-3 text-gray-600 font-mono text-xs">{u.email}</td>
                  <td className="py-3 text-gray-500 text-xs" dir="ltr">{u.phone}</td>
                  <td className="py-3">
                    <span className={`badge ${roleColor[u.role]}`}>{roleLabel[u.role]}</span>
                  </td>
                  <td className="py-3 text-gray-500 text-xs">{u.companyName || '—'}</td>
                  <td className="py-3">
                    <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive ? 'פעיל' : 'מושבת'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditUser(u)} className="text-xs text-indigo-600 hover:underline">ערוך</button>
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`text-xs ${u.isActive ? 'text-orange-500' : 'text-green-600'} hover:underline`}
                      >
                        {u.isActive ? 'השבת' : 'הפעל'}
                      </button>
                      <button onClick={() => handleDelete(u._id)} className="text-xs text-red-500 hover:underline">מחק</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserFormModal({
  user, onClose, onSuccess,
}: {
  user: User | null; onClose: () => void; onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
    phone: user?.phone || '',
    role: user?.role || 'surveyed',
    companyName: user?.companyName || '',
    jobTitle: user?.jobTitle || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'ישראל',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        role: form.role,
        companyName: form.companyName,
        jobTitle: form.jobTitle,
        address: { street: form.street, city: form.city, zipCode: form.zipCode, country: form.country },
      };
      if (form.password) payload.password = form.password;

      if (user) {
        await usersApi.update(user._id, payload);
      } else {
        if (!form.password) { showToast('יש להזין סיסמה', 'error'); setSaving(false); return; }
        await usersApi.create(payload);
      }
      showToast(user ? 'משתמש עודכן' : 'משתמש נוצר', 'success');
      onSuccess();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'שגיאה בשמירה', 'error');
    } finally {
      setSaving(false);
    }
  };

  const F = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value }),
  });

  return (
    <Dialog title={user ? 'עריכת משתמש' : 'משתמש חדש'} onClose={onClose} size="xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">שם פרטי</label><input className="input" {...F('firstName')} /></div>
          <div><label className="label">שם משפחה</label><input className="input" {...F('lastName')} /></div>
          <div><label className="label">אימייל</label><input className="input" type="email" dir="ltr" {...F('email')} /></div>
          <div><label className="label">טלפון</label><input className="input" dir="ltr" {...F('phone')} /></div>
          <div>
            <label className="label">סיסמה {user && '(השאר ריק לאי-שינוי)'}</label>
            <input className="input" type="password" {...F('password')} />
          </div>
          <div>
            <label className="label">תפקיד</label>
            <select className="input" {...F('role')}>
              <option value="surveyed">נסקר</option>
              <option value="surveyor">סוקר</option>
              <option value="admin">מנהל</option>
            </select>
          </div>
          <div><label className="label">חברה</label><input className="input" {...F('companyName')} /></div>
          <div><label className="label">תפקיד מקצועי</label><input className="input" {...F('jobTitle')} /></div>
          <div className="col-span-2"><label className="label">רחוב</label><input className="input" {...F('street')} /></div>
          <div><label className="label">עיר</label><input className="input" {...F('city')} /></div>
          <div><label className="label">מיקוד</label><input className="input" dir="ltr" {...F('zipCode')} /></div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">ביטול</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

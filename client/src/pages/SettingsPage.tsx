import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';

export default function SettingsPage() {
  const { profile, loading, error, updateProfile } = useProfile();
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      await updateProfile({ name, bio });
      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-stack"><p>Loading settings...</p></div>;
  if (error && !profile) return <div className="page-stack"><p style={{ color: 'red' }}>Error: {error}</p></div>;

  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Account</p>
        <h1>Settings</h1>

        <div className="info-card">
          <h3>Profile information</h3>
          {profile && (
            <>
              <div className="list-row">
                <span>Wallet</span>
                <strong>{profile.walletAddress || 'N/A'}</strong>
              </div>
              <label>
                <span>Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              </label>
              <label>
                <span>Bio</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ marginTop: 8, minHeight: 80 }}
                />
              </label>
            </>
          )}

          {saveSuccess && <p style={{ color: '#8af2b2', marginTop: 12 }}>✓ Settings saved</p>}
          {saveError && <p style={{ color: '#ff6b6b', marginTop: 12 }}>Error: {saveError}</p>}

          <button
            className="primary-button"
            onClick={handleSave}
            disabled={saving}
            style={{ marginTop: 16 }}
          >
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </section>
    </div>
  );
}

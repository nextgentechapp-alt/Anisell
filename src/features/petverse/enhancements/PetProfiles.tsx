import React, { useState, useEffect, useCallback } from 'react';
import styles from './PetProfiles.module.css';

type Species = 'Dog' | 'Cat' | 'Bird' | 'Fish' | 'Other';

interface PetProfile {
  id: string;
  name: string;
  species: Species;
  breed: string;
  dateOfBirth: string;
  weightKg: number;
  allergies: string;
  favoriteToys: string;
  notes: string;
  photoUrl: string;
  tags: string[];
}

const STORAGE_KEY = 'pv_pet_profiles';

const SPECIES_ICONS: Record<Species, string> = {
  Dog: '🐶', Cat: '🐱', Bird: '🦜', Fish: '🐠', Other: '🐾',
};

const AVATAR_CLASSES: Record<Species, string> = {
  Dog: styles.avatarDog,
  Cat: styles.avatarCat,
  Bird: styles.avatarBird,
  Fish: styles.avatarFish,
  Other: styles.avatarOther,
};

const DEFAULT_FORM: Omit<PetProfile, 'id'> = {
  name: '', species: 'Dog', breed: '', dateOfBirth: '', weightKg: 0,
  allergies: '', favoriteToys: '', notes: '', photoUrl: '', tags: [],
};

const SAMPLE_PETS: PetProfile[] = [
  {
    id: 'pet-1', name: 'Max', species: 'Dog', breed: 'Golden Retriever',
    dateOfBirth: '2021-06-15', weightKg: 28.5, allergies: 'Chicken',
    favoriteToys: 'Tennis ball, squeaky bone', notes: 'Loves morning walks',
    photoUrl: '', tags: ['Vaccinated', 'Neutered', 'Friendly'],
  },
  {
    id: 'pet-2', name: 'Luna', species: 'Cat', breed: 'Persian',
    dateOfBirth: '2022-02-10', weightKg: 4.2, allergies: 'None',
    favoriteToys: 'Laser pointer, feather wand', notes: 'Indoor only',
    photoUrl: '', tags: ['Spoiled', 'Lazy'],
  },
];

function generateId(): string {
  return `pet-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadProfiles(): PetProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PetProfile[];
  } catch {
    // ignore
  }
  return SAMPLE_PETS;
}

function saveProfiles(profiles: PetProfile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // ignore
  }
}

function computeAge(dob: string): string {
  if (!dob) return 'Unknown';
  const birth = new Date(dob);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  const years = Math.floor(diffMs / (365.25 * 86400000));
  const months = Math.floor((diffMs % (365.25 * 86400000)) / (30.44 * 86400000));
  if (years > 0) return `${years}y ${months}m`;
  return `${months}m`;
}

const PetProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<PetProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<PetProfile, 'id'>>({ ...DEFAULT_FORM });
  const [photoFileName, setPhotoFileName] = useState('');

  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  useEffect(() => {
    if (profiles.length > 0) saveProfiles(profiles);
  }, [profiles]);

  const resetForm = useCallback(() => {
    setForm({ ...DEFAULT_FORM });
    setShowForm(false);
    setEditingId(null);
    setPhotoFileName('');
  }, []);

  const handleEdit = useCallback((profile: PetProfile) => {
    setForm({
      name: profile.name,
      species: profile.species,
      breed: profile.breed,
      dateOfBirth: profile.dateOfBirth,
      weightKg: profile.weightKg,
      allergies: profile.allergies,
      favoriteToys: profile.favoriteToys,
      notes: profile.notes,
      photoUrl: profile.photoUrl,
      tags: profile.tags,
    });
    setEditingId(profile.id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const tags: string[] = [];
    if (form.species) tags.push(form.species);
    if (form.breed) tags.push(form.breed.split(' ')[0]);

    const profile: PetProfile = {
      id: editingId ?? generateId(),
      ...form,
      weightKg: Number(form.weightKg) || 0,
      tags,
    };

    setProfiles((prev) => {
      if (editingId) {
        return prev.map((p) => (p.id === editingId ? profile : p));
      }
      return [profile, ...prev];
    });

    resetForm();
  }, [form, editingId, resetForm]);

  const handlePhotoPlaceholder = useCallback(() => {
    setPhotoFileName('pet-photo-placeholder.png');
  }, []);

  const updateField = useCallback((field: keyof Omit<PetProfile, 'id'>, value: string | number | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  if (profiles.length === 0 && !showForm) {
    return (
      <div className={styles.wrapper}>
        <div className="pv-section-header">
          <h2 className="pv-section-title">My Pet Profiles</h2>
        </div>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🐾</span>
          <h3>No pets yet</h3>
          <p style={{ marginBottom: 16, fontSize: 'var(--font-size-sm)' }}>Add your first pet to get personalized recommendations.</p>
          <button className="pv-btn pv-btn-primary" onClick={() => setShowForm(true)}>+ Add Pet</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className="pv-section-header">
        <h2 className="pv-section-title">My Pet Profiles</h2>
        {!showForm && (
          <button className="pv-btn pv-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            + Add Pet
          </button>
        )}
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3 className={styles.formTitle}>{editingId ? 'Edit Pet' : 'Add a New Pet'}</h3>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.fieldLabel}>Name *</label>
              <input className={styles.fieldInput} value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Pet name" required />
            </div>
            <div>
              <label className={styles.fieldLabel}>Species</label>
              <select className={styles.fieldInput} value={form.species} onChange={(e) => updateField('species', e.target.value as Species)}>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Fish">Fish</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={styles.fieldLabel}>Breed</label>
              <input className={styles.fieldInput} value={form.breed} onChange={(e) => updateField('breed', e.target.value)} placeholder="e.g. Labrador" />
            </div>
            <div>
              <label className={styles.fieldLabel}>Date of Birth</label>
              <input className={styles.fieldInput} type="date" value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
            </div>
            <div>
              <label className={styles.fieldLabel}>Weight (kg)</label>
              <input className={styles.fieldInput} type="number" step="0.1" min="0" value={form.weightKg || ''} onChange={(e) => updateField('weightKg', e.target.value ? parseFloat(e.target.value) : 0)} placeholder="e.g. 25" />
            </div>
            <div>
              <label className={styles.fieldLabel}>Photo</label>
              <div className={styles.photoPlaceholder} onClick={handlePhotoPlaceholder}>
                {photoFileName ? '📸 ' + photoFileName : '📷 Upload photo (placeholder)'}
              </div>
            </div>
            <div className={styles.fieldFull}>
              <label className={styles.fieldLabel}>Allergies</label>
              <textarea className={`${styles.fieldInput} ${styles.fieldTextarea}`} value={form.allergies} onChange={(e) => updateField('allergies', e.target.value)} placeholder="List any allergies or medical conditions" />
            </div>
            <div className={styles.fieldFull}>
              <label className={styles.fieldLabel}>Favorite Toys</label>
              <input className={styles.fieldInput} value={form.favoriteToys} onChange={(e) => updateField('favoriteToys', e.target.value)} placeholder="e.g. Tennis ball, rope" />
            </div>
            <div className={styles.fieldFull}>
              <label className={styles.fieldLabel}>Notes</label>
              <textarea className={`${styles.fieldInput} ${styles.fieldTextarea}`} value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Any additional information" />
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="button" className="pv-btn pv-btn-outline" onClick={resetForm}>Cancel</button>
            <button type="submit" className="pv-btn pv-btn-primary">{editingId ? 'Save Changes' : 'Add Pet'}</button>
          </div>
        </form>
      )}

      <div className={styles.grid}>
        {profiles.map((pet) => (
          <div key={pet.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={`${styles.avatar} ${AVATAR_CLASSES[pet.species]}`}>
                {pet.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className={styles.petName}>{pet.name}</div>
                <div className={styles.speciesBadge}>
                  {SPECIES_ICONS[pet.species]} {pet.species}
                </div>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div><span className={styles.detailLabel}>Breed:</span> {pet.breed || '—'}</div>
              <div><span className={styles.detailLabel}>Age:</span> {computeAge(pet.dateOfBirth)}</div>
              <div><span className={styles.detailLabel}>Weight:</span> {pet.weightKg ? `${pet.weightKg} kg` : '—'}</div>
            </div>
            {pet.tags.length > 0 && (
              <div className={styles.tagsRow}>
                {pet.tags.map((tag, i) => (
                  <span key={i} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
            <div className={styles.cardActions}>
              <button className={styles.cardActionBtn} onClick={() => handleEdit(pet)}>✏️ Edit</button>
              <button className={`${styles.cardActionBtn} ${styles.cardActionDanger}`} onClick={() => handleDelete(pet.id)}>🗑️ Delete</button>
              <button className={styles.cardActionBtn} onClick={() => alert(`Recommend products for ${pet.name} (${pet.species})`)}>🎯 Recommend</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PetProfiles;

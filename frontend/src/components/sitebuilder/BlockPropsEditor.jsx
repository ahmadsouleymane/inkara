import { useState } from 'react';
import { Plus, Trash2, ChevronRight, Paintbrush, Type } from 'lucide-react';
import { BLOCK_TYPES } from './BlockPalette.jsx';
import BlockStyleEditor from './BlockStyleEditor.jsx';

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors resize-y"
    />
  );
}

function NumberInput({ value, onChange, min, max }) {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      min={min}
      max={max}
      className="w-24 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors"
    />
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1">
      <span className="text-sm text-gray-600">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value || false}
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer border-none ${value ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0'}`} />
      </button>
    </label>
  );
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-4 cursor-pointer bg-transparent border-none text-left"
      >
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{title}</span>
        <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

// ===== Block-specific editors =====

function HeroEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <>
      <Section title="Contenu">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Bienvenue à la bibliothèque" /></Field>
        <Field label="Sous-titre"><TextInput value={props.subtitle} onChange={(v) => update('subtitle', v)} placeholder="Découvrez nos collections" /></Field>
      </Section>
      <Section title="Bouton d'action">
        <Field label="Texte du bouton"><TextInput value={props.buttonText} onChange={(v) => update('buttonText', v)} placeholder="Explorer le catalogue" /></Field>
        <Field label="Lien"><TextInput value={props.buttonLink} onChange={(v) => update('buttonLink', v)} placeholder="catalogue" /></Field>
      </Section>
      <Section title="Apparence" defaultOpen={false}>
        <Field label="Image d'arrière-plan" hint="URL d'une image (optionnel)">
          <TextInput value={props.backgroundImage} onChange={(v) => update('backgroundImage', v)} placeholder="https://..." />
        </Field>
      </Section>
    </>
  );
}

function CatalogEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Options du catalogue">
      <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Notre catalogue" /></Field>
      <Toggle value={props.showSearch !== false} onChange={(v) => update('showSearch', v)} label="Barre de recherche" />
      <Toggle value={props.showFilters} onChange={(v) => update('showFilters', v)} label="Filtres par catégorie" />
    </Section>
  );
}

function EventsEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Options des événements">
      <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Événements à venir" /></Field>
      <Field label="Nombre affiché"><NumberInput value={props.count} onChange={(v) => update('count', v)} min={1} max={20} /></Field>
    </Section>
  );
}

function TextEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Contenu texte">
      <Field label="Titre (optionnel)"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Titre de section" /></Field>
      <Field label="Contenu"><TextArea value={props.content} onChange={(v) => update('content', v)} placeholder="Écrivez votre texte ici..." rows={8} /></Field>
    </Section>
  );
}

function ImageEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Image">
      <Field label="URL de l'image"><TextInput value={props.url} onChange={(v) => update('url', v)} placeholder="https://..." /></Field>
      <Field label="Légende"><TextInput value={props.caption} onChange={(v) => update('caption', v)} placeholder="Description de l'image" /></Field>
    </Section>
  );
}

function ContactEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <>
      <Section title="En-tête">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Nous contacter" /></Field>
      </Section>
      <Section title="Coordonnées">
        <Field label="Adresse"><TextInput value={props.address} onChange={(v) => update('address', v)} placeholder="12 rue des Bibliothèques" /></Field>
        <Field label="Téléphone"><TextInput value={props.phone} onChange={(v) => update('phone', v)} placeholder="01 23 45 67 89" /></Field>
        <Field label="Email"><TextInput value={props.email} onChange={(v) => update('email', v)} placeholder="contact@..." /></Field>
      </Section>
      <Section title="Options" defaultOpen={false}>
        <Toggle value={props.showMap} onChange={(v) => update('showMap', v)} label="Afficher une carte" />
        <Toggle value={props.showForm} onChange={(v) => update('showForm', v)} label="Formulaire de contact" />
      </Section>
    </>
  );
}

function FeaturedBooksEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Livres vedettes">
      <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Nos recommandations" /></Field>
      <Field label="Nombre de livres"><NumberInput value={props.count} onChange={(v) => update('count', v)} min={1} max={12} /></Field>
    </Section>
  );
}

function StatsEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Statistiques">
      <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="La bibliothèque en chiffres" /></Field>
    </Section>
  );
}

function HoursEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  const schedule = props.schedule || [
    { day: 'Lundi', hours: '9h – 18h' },
    { day: 'Mardi', hours: '9h – 18h' },
    { day: 'Mercredi', hours: '9h – 20h' },
    { day: 'Jeudi', hours: '9h – 18h' },
    { day: 'Vendredi', hours: '9h – 18h' },
    { day: 'Samedi', hours: '10h – 17h' },
    { day: 'Dimanche', hours: 'Fermé' },
  ];

  const updateSchedule = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    update('schedule', newSchedule);
  };

  return (
    <>
      <Section title="En-tête">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Horaires d'ouverture" /></Field>
      </Section>
      <Section title="Horaires">
        <div className="space-y-2">
          {schedule.map((item, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={item.day}
                  onChange={(e) => updateSchedule(i, 'day', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={item.hours}
                  onChange={(e) => updateSchedule(i, 'hours', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function FAQEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  const items = props.items || [{ question: '', answer: '' }];

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    update('items', newItems);
  };

  const addItem = () => update('items', [...items, { question: '', answer: '' }]);
  const removeItem = (index) => update('items', items.filter((_, i) => i !== index));

  return (
    <>
      <Section title="En-tête">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Questions fréquentes" /></Field>
      </Section>
      <Section title="Questions">
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Q{i + 1}</span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer bg-transparent border-none">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={item.question}
                onChange={(e) => updateItem(i, 'question', e.target.value)}
                placeholder="Question"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
              <textarea
                value={item.answer}
                onChange={(e) => updateItem(i, 'answer', e.target.value)}
                placeholder="Réponse"
                rows={2}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 resize-y"
              />
            </div>
          ))}
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer py-1"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter une question
          </button>
        </div>
      </Section>
    </>
  );
}

function GalleryEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  const images = props.images || [];

  const addImage = () => update('images', [...images, { url: '', caption: '' }]);
  const updateImage = (index, field, value) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    update('images', newImages);
  };
  const removeImage = (index) => update('images', images.filter((_, i) => i !== index));

  return (
    <>
      <Section title="En-tête">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Galerie" /></Field>
      </Section>
      <Section title="Images">
        <div className="space-y-3">
          {images.map((img, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Image {i + 1}</span>
                <button onClick={() => removeImage(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer bg-transparent border-none">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <input
                type="text"
                value={img.url}
                onChange={(e) => updateImage(i, 'url', e.target.value)}
                placeholder="URL de l'image"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
              <input
                type="text"
                value={img.caption}
                onChange={(e) => updateImage(i, 'caption', e.target.value)}
                placeholder="Légende"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
          ))}
          <button
            onClick={addImage}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer py-1"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter une image
          </button>
        </div>
      </Section>
    </>
  );
}

function ReadingListsEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Listes de lecture">
      <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Nos sélections" /></Field>
    </Section>
  );
}

// ===== Nouveaux éditeurs =====

function VideoEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <>
      <Section title="Vidéo">
        <Field label="Titre (optionnel)"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Titre" /></Field>
        <Field label="URL YouTube / Vimeo"><TextInput value={props.url} onChange={(v) => update('url', v)} placeholder="https://youtube.com/watch?v=..." /></Field>
        <Field label="Description"><TextInput value={props.description} onChange={(v) => update('description', v)} placeholder="Description" /></Field>
      </Section>
    </>
  );
}

function DividerEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Séparateur">
      <Field label="Style">
        <select value={props.style || 'line'} onChange={(e) => update('style', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none">
          <option value="line">Ligne</option>
          <option value="dots">Points</option>
          <option value="space">Espace</option>
        </select>
      </Field>
      <Field label="Espacement">
        <select value={props.spacing || 'medium'} onChange={(e) => update('spacing', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none">
          <option value="small">Petit</option>
          <option value="medium">Moyen</option>
          <option value="large">Grand</option>
        </select>
      </Field>
    </Section>
  );
}

function CTABannerEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <>
      <Section title="Contenu">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Rejoignez-nous" /></Field>
        <Field label="Sous-titre"><TextInput value={props.subtitle} onChange={(v) => update('subtitle', v)} placeholder="Inscrivez-vous gratuitement" /></Field>
      </Section>
      <Section title="Bouton">
        <Field label="Texte du bouton"><TextInput value={props.buttonText} onChange={(v) => update('buttonText', v)} placeholder="S'inscrire" /></Field>
        <Field label="Lien"><TextInput value={props.buttonLink} onChange={(v) => update('buttonLink', v)} placeholder="/inscription" /></Field>
      </Section>
    </>
  );
}

function TestimonialsEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  const items = props.items || [{ name: '', quote: '', role: '' }];
  const updateItem = (i, field, val) => { const n = [...items]; n[i] = { ...n[i], [field]: val }; update('items', n); };
  const addItem = () => update('items', [...items, { name: '', quote: '', role: '' }]);
  const removeItem = (i) => update('items', items.filter((_, j) => j !== i));
  return (
    <>
      <Section title="En-tête">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Ce que disent nos membres" /></Field>
      </Section>
      <Section title="Témoignages">
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Témoignage {i + 1}</span>
                {items.length > 1 && <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"><Trash2 className="w-3 h-3" /></button>}
              </div>
              <input type="text" value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} placeholder="Nom" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
              <textarea value={item.quote} onChange={(e) => updateItem(i, 'quote', e.target.value)} placeholder="Citation" rows={2} className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg resize-y" />
              <input type="text" value={item.role} onChange={(e) => updateItem(i, 'role', e.target.value)} placeholder="Rôle/titre" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
            </div>
          ))}
          <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] bg-transparent border-none cursor-pointer py-1">
            <Plus className="w-3.5 h-3.5" /> Ajouter un témoignage
          </button>
        </div>
      </Section>
    </>
  );
}

function TeamEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  const members = props.members || [{ name: '', role: '', photo: '' }];
  const updateMember = (i, field, val) => { const n = [...members]; n[i] = { ...n[i], [field]: val }; update('members', n); };
  const addMember = () => update('members', [...members, { name: '', role: '', photo: '' }]);
  const removeMember = (i) => update('members', members.filter((_, j) => j !== i));
  return (
    <>
      <Section title="En-tête">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Notre équipe" /></Field>
      </Section>
      <Section title="Membres">
        <div className="space-y-3">
          {members.map((m, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Membre {i + 1}</span>
                {members.length > 1 && <button onClick={() => removeMember(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"><Trash2 className="w-3 h-3" /></button>}
              </div>
              <input type="text" value={m.name} onChange={(e) => updateMember(i, 'name', e.target.value)} placeholder="Nom" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
              <input type="text" value={m.role} onChange={(e) => updateMember(i, 'role', e.target.value)} placeholder="Rôle" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
              <input type="text" value={m.photo} onChange={(e) => updateMember(i, 'photo', e.target.value)} placeholder="URL photo (optionnel)" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
            </div>
          ))}
          <button onClick={addMember} className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] bg-transparent border-none cursor-pointer py-1">
            <Plus className="w-3.5 h-3.5" /> Ajouter un membre
          </button>
        </div>
      </Section>
    </>
  );
}

function CountdownEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Compte à rebours">
      <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Prochain événement" /></Field>
      <Field label="Sous-titre"><TextInput value={props.subtitle} onChange={(v) => update('subtitle', v)} placeholder="Ne manquez pas !" /></Field>
      <Field label="Date cible">
        <input type="datetime-local" value={props.date || ''} onChange={(e) => update('date', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl" />
      </Field>
    </Section>
  );
}

function MapEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Carte">
      <Field label="Titre (optionnel)"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Nous trouver" /></Field>
      <Field label="Adresse"><TextInput value={props.address} onChange={(v) => update('address', v)} placeholder="12 rue des Bibliothèques, Paris" /></Field>
      <Field label="Latitude"><TextInput value={props.lat} onChange={(v) => update('lat', v)} placeholder="48.8566" /></Field>
      <Field label="Longitude"><TextInput value={props.lng} onChange={(v) => update('lng', v)} placeholder="2.3522" /></Field>
    </Section>
  );
}

function SocialLinksEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  const links = props.links || [{ platform: 'Facebook', url: '' }];
  const updateLink = (i, field, val) => { const n = [...links]; n[i] = { ...n[i], [field]: val }; update('links', n); };
  const addLink = () => update('links', [...links, { platform: '', url: '' }]);
  const removeLink = (i) => update('links', links.filter((_, j) => j !== i));
  const platforms = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube', 'TikTok', 'WhatsApp'];
  return (
    <>
      <Section title="En-tête">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Suivez-nous" /></Field>
      </Section>
      <Section title="Liens">
        <div className="space-y-3">
          {links.map((l, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <select value={l.platform} onChange={(e) => updateLink(i, 'platform', e.target.value)} className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1">
                  {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {links.length > 1 && <button onClick={() => removeLink(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"><Trash2 className="w-3 h-3" /></button>}
              </div>
              <input type="text" value={l.url} onChange={(e) => updateLink(i, 'url', e.target.value)} placeholder="https://..." className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
            </div>
          ))}
          <button onClick={addLink} className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] bg-transparent border-none cursor-pointer py-1">
            <Plus className="w-3.5 h-3.5" /> Ajouter un lien
          </button>
        </div>
      </Section>
    </>
  );
}

function NewArrivalsEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Nouveautés">
      <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Nouveautés" /></Field>
      <Field label="Nombre de livres"><NumberInput value={props.count} onChange={(v) => update('count', v)} min={1} max={12} /></Field>
    </Section>
  );
}

// ===== Nouveaux blocs (Phase 4) =====

function NewsletterEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <>
      <Section title="Contenu">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Restez informé" /></Field>
        <Field label="Sous-titre"><TextInput value={props.subtitle} onChange={(v) => update('subtitle', v)} placeholder="Recevez nos actualités" /></Field>
      </Section>
      <Section title="Formulaire">
        <Field label="Texte du bouton"><TextInput value={props.buttonText} onChange={(v) => update('buttonText', v)} placeholder="S'inscrire" /></Field>
        <Field label="Placeholder"><TextInput value={props.placeholder} onChange={(v) => update('placeholder', v)} placeholder="votre@email.com" /></Field>
        <Field label="Mention légale"><TextInput value={props.disclaimer} onChange={(v) => update('disclaimer', v)} placeholder="Pas de spam, promis !" /></Field>
      </Section>
    </>
  );
}

function PricingEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  const plans = props.plans || [{ name: '', price: '', period: '', features: [], buttonText: '', highlighted: false }];
  const updatePlan = (i, field, val) => { const n = [...plans]; n[i] = { ...n[i], [field]: val }; update('plans', n); };
  const addPlan = () => update('plans', [...plans, { name: '', price: '', period: '/mois', features: [], buttonText: 'Choisir', highlighted: false }]);
  const removePlan = (i) => update('plans', plans.filter((_, j) => j !== i));
  return (
    <>
      <Section title="En-tête">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Nos tarifs" /></Field>
      </Section>
      <Section title="Plans">
        <div className="space-y-3">
          {plans.map((plan, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Plan {i + 1}</span>
                {plans.length > 1 && <button onClick={() => removePlan(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"><Trash2 className="w-3 h-3" /></button>}
              </div>
              <input type="text" value={plan.name} onChange={(e) => updatePlan(i, 'name', e.target.value)} placeholder="Nom du plan" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
              <div className="flex gap-2">
                <input type="text" value={plan.price} onChange={(e) => updatePlan(i, 'price', e.target.value)} placeholder="Prix" className="w-1/2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
                <input type="text" value={plan.period} onChange={(e) => updatePlan(i, 'period', e.target.value)} placeholder="/mois" className="w-1/2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
              </div>
              <textarea value={(plan.features || []).join('\n')} onChange={(e) => updatePlan(i, 'features', e.target.value.split('\n'))} placeholder="Une fonctionnalité par ligne" rows={3} className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg resize-y" />
              <input type="text" value={plan.buttonText} onChange={(e) => updatePlan(i, 'buttonText', e.target.value)} placeholder="Texte bouton" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
              <Toggle value={plan.highlighted} onChange={(v) => updatePlan(i, 'highlighted', v)} label="Mis en avant" />
            </div>
          ))}
          <button onClick={addPlan} className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] bg-transparent border-none cursor-pointer py-1">
            <Plus className="w-3.5 h-3.5" /> Ajouter un plan
          </button>
        </div>
      </Section>
    </>
  );
}

function AccordionEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  const items = props.items || [{ title: '', content: '' }];
  const updateItem = (i, field, val) => { const n = [...items]; n[i] = { ...n[i], [field]: val }; update('items', n); };
  const addItem = () => update('items', [...items, { title: '', content: '' }]);
  const removeItem = (i) => update('items', items.filter((_, j) => j !== i));
  return (
    <>
      <Section title="En-tête">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Sections" /></Field>
        <Toggle value={props.allowMultiple} onChange={(v) => update('allowMultiple', v)} label="Ouvrir plusieurs à la fois" />
      </Section>
      <Section title="Éléments">
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Élément {i + 1}</span>
                {items.length > 1 && <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"><Trash2 className="w-3 h-3" /></button>}
              </div>
              <input type="text" value={item.title} onChange={(e) => updateItem(i, 'title', e.target.value)} placeholder="Titre" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
              <textarea value={item.content} onChange={(e) => updateItem(i, 'content', e.target.value)} placeholder="Contenu" rows={3} className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg resize-y" />
            </div>
          ))}
          <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] bg-transparent border-none cursor-pointer py-1">
            <Plus className="w-3.5 h-3.5" /> Ajouter un élément
          </button>
        </div>
      </Section>
    </>
  );
}

function TabsEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  const tabs = props.tabs || [{ label: '', content: '' }];
  const updateTab = (i, field, val) => { const n = [...tabs]; n[i] = { ...n[i], [field]: val }; update('tabs', n); };
  const addTab = () => update('tabs', [...tabs, { label: '', content: '' }]);
  const removeTab = (i) => update('tabs', tabs.filter((_, j) => j !== i));
  return (
    <Section title="Onglets">
      <div className="space-y-3">
        {tabs.map((tab, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Onglet {i + 1}</span>
              {tabs.length > 1 && <button onClick={() => removeTab(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"><Trash2 className="w-3 h-3" /></button>}
            </div>
            <input type="text" value={tab.label} onChange={(e) => updateTab(i, 'label', e.target.value)} placeholder="Titre de l'onglet" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
            <textarea value={tab.content} onChange={(e) => updateTab(i, 'content', e.target.value)} placeholder="Contenu" rows={3} className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg resize-y" />
          </div>
        ))}
        <button onClick={addTab} className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] bg-transparent border-none cursor-pointer py-1">
          <Plus className="w-3.5 h-3.5" /> Ajouter un onglet
        </button>
      </div>
    </Section>
  );
}

function CounterEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  const counters = props.counters || [{ value: 0, label: '', prefix: '', suffix: '' }];
  const updateCounter = (i, field, val) => { const n = [...counters]; n[i] = { ...n[i], [field]: val }; update('counters', n); };
  const addCounter = () => update('counters', [...counters, { value: 0, label: '', prefix: '', suffix: '' }]);
  const removeCounter = (i) => update('counters', counters.filter((_, j) => j !== i));
  return (
    <>
      <Section title="En-tête">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="En chiffres" /></Field>
      </Section>
      <Section title="Compteurs">
        <div className="space-y-3">
          {counters.map((c, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Compteur {i + 1}</span>
                {counters.length > 1 && <button onClick={() => removeCounter(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"><Trash2 className="w-3 h-3" /></button>}
              </div>
              <div className="flex gap-2">
                <input type="number" value={c.value} onChange={(e) => updateCounter(i, 'value', parseInt(e.target.value) || 0)} placeholder="Valeur" className="w-1/2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
                <input type="text" value={c.suffix} onChange={(e) => updateCounter(i, 'suffix', e.target.value)} placeholder="Suffixe (ex: +, %)" className="w-1/2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
              </div>
              <input type="text" value={c.label} onChange={(e) => updateCounter(i, 'label', e.target.value)} placeholder="Label" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
            </div>
          ))}
          <button onClick={addCounter} className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] bg-transparent border-none cursor-pointer py-1">
            <Plus className="w-3.5 h-3.5" /> Ajouter un compteur
          </button>
        </div>
      </Section>
    </>
  );
}

function MarqueeEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Bandeau défilant">
      <Field label="Texte"><TextArea value={props.text} onChange={(v) => update('text', v)} placeholder="Bienvenue à la bibliothèque ! 📚 Nouveautés disponibles..." rows={2} /></Field>
      <Field label="Vitesse">
        <select value={props.speed || 'normal'} onChange={(e) => update('speed', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none">
          <option value="slow">Lente</option>
          <option value="normal">Normale</option>
          <option value="fast">Rapide</option>
        </select>
      </Field>
      <Toggle value={props.pauseOnHover !== false} onChange={(v) => update('pauseOnHover', v)} label="Pause au survol" />
    </Section>
  );
}

function EmbedEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Intégration">
      <Field label="Titre (optionnel)"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Titre" /></Field>
      <Field label="URL (iframe)" hint="Lien vers le contenu externe"><TextInput value={props.url} onChange={(v) => update('url', v)} placeholder="https://..." /></Field>
      <Field label="Hauteur (px)"><NumberInput value={props.height} onChange={(v) => update('height', v)} min={100} max={1000} /></Field>
    </Section>
  );
}

function SpacerEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Espacement">
      <Field label="Hauteur (px)"><NumberInput value={props.height || 40} onChange={(v) => update('height', v)} min={8} max={200} /></Field>
      <Toggle value={props.showLine} onChange={(v) => update('showLine', v)} label="Afficher une ligne" />
    </Section>
  );
}

function LogoCloudEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  const logos = props.logos || [];
  const addLogo = () => update('logos', [...logos, { url: '', alt: '', link: '' }]);
  const updateLogo = (i, field, val) => { const n = [...logos]; n[i] = { ...n[i], [field]: val }; update('logos', n); };
  const removeLogo = (i) => update('logos', logos.filter((_, j) => j !== i));
  return (
    <>
      <Section title="En-tête">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Nos partenaires" /></Field>
        <Toggle value={props.grayscale} onChange={(v) => update('grayscale', v)} label="Logos en niveaux de gris" />
      </Section>
      <Section title="Logos">
        <div className="space-y-3">
          {logos.map((logo, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Logo {i + 1}</span>
                <button onClick={() => removeLogo(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"><Trash2 className="w-3 h-3" /></button>
              </div>
              <input type="text" value={logo.url} onChange={(e) => updateLogo(i, 'url', e.target.value)} placeholder="URL de l'image" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
              <input type="text" value={logo.alt} onChange={(e) => updateLogo(i, 'alt', e.target.value)} placeholder="Nom du partenaire" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
              <input type="text" value={logo.link} onChange={(e) => updateLogo(i, 'link', e.target.value)} placeholder="Lien (optionnel)" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
            </div>
          ))}
          <button onClick={addLogo} className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] bg-transparent border-none cursor-pointer py-1">
            <Plus className="w-3.5 h-3.5" /> Ajouter un logo
          </button>
        </div>
      </Section>
    </>
  );
}

function TimelineEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  const events = props.events || [{ year: '', title: '', description: '' }];
  const updateEvent = (i, field, val) => { const n = [...events]; n[i] = { ...n[i], [field]: val }; update('events', n); };
  const addEvent = () => update('events', [...events, { year: '', title: '', description: '' }]);
  const removeEvent = (i) => update('events', events.filter((_, j) => j !== i));
  return (
    <>
      <Section title="En-tête">
        <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Notre histoire" /></Field>
      </Section>
      <Section title="Événements">
        <div className="space-y-3">
          {events.map((evt, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Étape {i + 1}</span>
                {events.length > 1 && <button onClick={() => removeEvent(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"><Trash2 className="w-3 h-3" /></button>}
              </div>
              <input type="text" value={evt.year} onChange={(e) => updateEvent(i, 'year', e.target.value)} placeholder="Année (ex: 2020)" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
              <input type="text" value={evt.title} onChange={(e) => updateEvent(i, 'title', e.target.value)} placeholder="Titre" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg" />
              <textarea value={evt.description} onChange={(e) => updateEvent(i, 'description', e.target.value)} placeholder="Description" rows={2} className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg resize-y" />
            </div>
          ))}
          <button onClick={addEvent} className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] bg-transparent border-none cursor-pointer py-1">
            <Plus className="w-3.5 h-3.5" /> Ajouter une étape
          </button>
        </div>
      </Section>
    </>
  );
}

function BeforeAfterEditor({ props, onChange }) {
  const update = (key, val) => onChange({ ...props, [key]: val });
  return (
    <Section title="Avant / Après">
      <Field label="Titre"><TextInput value={props.title} onChange={(v) => update('title', v)} placeholder="Comparaison" /></Field>
      <Field label="Image Avant"><TextInput value={props.beforeImage} onChange={(v) => update('beforeImage', v)} placeholder="https://..." /></Field>
      <Field label="Label Avant"><TextInput value={props.beforeLabel} onChange={(v) => update('beforeLabel', v)} placeholder="Avant" /></Field>
      <Field label="Image Après"><TextInput value={props.afterImage} onChange={(v) => update('afterImage', v)} placeholder="https://..." /></Field>
      <Field label="Label Après"><TextInput value={props.afterLabel} onChange={(v) => update('afterLabel', v)} placeholder="Après" /></Field>
    </Section>
  );
}

// ===== Main editor =====

const EDITORS = {
  hero: HeroEditor,
  catalog: CatalogEditor,
  events: EventsEditor,
  text: TextEditor,
  image: ImageEditor,
  contact: ContactEditor,
  'featured-books': FeaturedBooksEditor,
  stats: StatsEditor,
  hours: HoursEditor,
  faq: FAQEditor,
  gallery: GalleryEditor,
  'reading-lists': ReadingListsEditor,
  video: VideoEditor,
  divider: DividerEditor,
  'cta-banner': CTABannerEditor,
  testimonials: TestimonialsEditor,
  team: TeamEditor,
  countdown: CountdownEditor,
  map: MapEditor,
  'social-links': SocialLinksEditor,
  'new-arrivals': NewArrivalsEditor,
  newsletter: NewsletterEditor,
  pricing: PricingEditor,
  accordion: AccordionEditor,
  tabs: TabsEditor,
  counter: CounterEditor,
  marquee: MarqueeEditor,
  embed: EmbedEditor,
  spacer: SpacerEditor,
  'logo-cloud': LogoCloudEditor,
  timeline: TimelineEditor,
  'before-after': BeforeAfterEditor,
};

export default function BlockPropsEditor({ block, onChange, onStyleChange }) {
  const [tab, setTab] = useState('content');

  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
          <ChevronRight className="w-6 h-6 text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">Aucun bloc sélectionné</p>
        <p className="text-xs text-gray-400">Cliquez sur un bloc dans le canvas pour modifier ses propriétés</p>
      </div>
    );
  }

  const Editor = EDITORS[block.type];
  const blockMeta = BLOCK_TYPES.find((b) => b.type === block.type);

  if (!Editor) return <div className="p-4 text-sm text-red-500">Éditeur non disponible</div>;

  return (
    <div>
      {/* Block header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        {blockMeta && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${blockMeta.color}14` }}>
            <blockMeta.icon className="w-4 h-4" style={{ color: blockMeta.color }} />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-800">{blockMeta?.label || block.type}</p>
          <p className="text-[10px] text-gray-400">{blockMeta?.description}</p>
        </div>
      </div>

      {/* Tabs: Contenu / Style */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setTab('content')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 ${
            tab === 'content' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Type className="w-3.5 h-3.5" /> Contenu
        </button>
        <button
          onClick={() => setTab('style')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 ${
            tab === 'style' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Paintbrush className="w-3.5 h-3.5" /> Style
        </button>
      </div>

      {/* Tab content */}
      {tab === 'content' ? (
        <Editor props={block.props || {}} onChange={(newProps) => onChange(block.id, newProps)} />
      ) : (
        <BlockStyleEditor
          styles={block.styles || {}}
          onChange={(newStyles) => onStyleChange(block.id, newStyles)}
        />
      )}
    </div>
  );
}

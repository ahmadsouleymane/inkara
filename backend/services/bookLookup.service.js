import mongoose from 'mongoose';

// Cache schema pour éviter les appels API redondants
const lookupCacheSchema = new mongoose.Schema({
  isbn: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed },
  source: { type: String }, // 'openlibrary' | 'googlebooks'
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // TTL 30 jours
});

const LookupCache = mongoose.model('LookupCache', lookupCacheSchema);

/**
 * Cherche les infos d'un livre par ISBN via Open Library puis Google Books (fallback)
 */
export async function lookupByISBN(isbn) {
  // Nettoyer l'ISBN
  const cleanISBN = isbn.replace(/[-\s]/g, '');

  // Vérifier le cache
  const cached = await LookupCache.findOne({ isbn: cleanISBN });
  if (cached) return { ...cached.data, _cached: true, _source: cached.source };

  // 1) Open Library
  let result = await fetchFromOpenLibrary(cleanISBN);

  // 2) Fallback Google Books
  if (!result) {
    result = await fetchFromGoogleBooks(cleanISBN);
  }

  // Mettre en cache si trouvé
  if (result) {
    await LookupCache.findOneAndUpdate(
      { isbn: cleanISBN },
      { isbn: cleanISBN, data: result, source: result._source },
      { upsert: true }
    );
  }

  return result;
}

async function fetchFromOpenLibrary(isbn) {
  try {
    const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
    if (!res.ok) return null;

    const data = await res.json();

    // Récupérer les auteurs
    let authors = [];
    if (data.authors) {
      const authorPromises = data.authors.map(async (a) => {
        try {
          const authorRes = await fetch(`https://openlibrary.org${a.key}.json`);
          if (authorRes.ok) {
            const authorData = await authorRes.json();
            return authorData.name;
          }
        } catch {}
        return null;
      });
      authors = (await Promise.all(authorPromises)).filter(Boolean);
    }

    // Récupérer la couverture
    const coverId = data.covers?.[0];
    const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : '';

    // Récupérer l'éditeur depuis l'édition works
    let description = '';
    let subjects = [];
    if (data.works?.[0]) {
      try {
        const workRes = await fetch(`https://openlibrary.org${data.works[0].key}.json`);
        if (workRes.ok) {
          const workData = await workRes.json();
          description = typeof workData.description === 'string'
            ? workData.description
            : workData.description?.value || '';
          subjects = workData.subjects?.slice(0, 10) || [];
        }
      } catch {}
    }

    return {
      title: data.title || '',
      author: authors,
      publisher: data.publishers?.[0] || '',
      year: data.publish_date || '',
      pages: data.number_of_pages || 0,
      cover,
      description,
      isbn: isbn,
      language: data.languages?.[0]?.key?.replace('/languages/', '') || '',
      subjects,
      _source: 'openlibrary',
    };
  } catch {
    return null;
  }
}

async function fetchFromGoogleBooks(isbn) {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.items?.length) return null;

    const vol = data.items[0].volumeInfo;

    return {
      title: vol.title || '',
      author: vol.authors || [],
      publisher: vol.publisher || '',
      year: vol.publishedDate || '',
      pages: vol.pageCount || 0,
      cover: vol.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
      description: vol.description || '',
      isbn: isbn,
      language: vol.language || '',
      subjects: vol.categories || [],
      _source: 'googlebooks',
    };
  } catch {
    return null;
  }
}

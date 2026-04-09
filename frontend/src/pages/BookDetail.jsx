import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { booksApi } from '../api/books.js';
import { reviewsApi } from '../api/reviews.js';
import { authApi } from '../api/auth.js';
import { reservationsApi } from '../api/reservations.js';
import { BookOpen, ArrowLeft, Edit, Trash2, MapPin, Calendar, Hash, Layers, Heart, Star, MessageSquare, BookmarkPlus, Printer } from 'lucide-react';
import { downloadBookLabel } from '../utils/bookLabel.js';
import toast from 'react-hot-toast';

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const canEdit = ['admin', 'owner', 'librarian'].includes(user?.role);
  const isMember = user?.role === 'member';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

  useEffect(() => {
    booksApi.getById(id)
      .then(setBook)
      .catch(() => toast.error('Livre introuvable'))
      .finally(() => setLoading(false));

    reviewsApi.getBookReviews(id)
      .then((data) => {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
      })
      .catch(() => {});

    if (user) {
      authApi.getFavorites()
        .then((favs) => {
          setIsFavorite(favs.some((b) => b._id === id));
        })
        .catch(() => {});
    }
  }, [id, user]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await authApi.removeFavorite(id);
        setIsFavorite(false);
        toast.success('Retiré des favoris');
      } else {
        await authApi.addFavorite(id);
        setIsFavorite(true);
        toast.success('Ajouté aux favoris');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReserve = async () => {
    try {
      await reservationsApi.create({ book: id });
      toast.success('Réservation effectuée');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await reviewsApi.upsertReview(id, { rating: reviewRating, comment: reviewComment });
      toast.success('Avis enregistré');
      const data = await reviewsApi.getBookReviews(id);
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setReviewComment('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce livre ?')) return;
    try {
      await booksApi.delete(id);
      toast.success('Livre supprimé');
      navigate('/livres');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
        <div className="skeleton h-96 rounded-xl" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="lg:ml-64 pt-20 lg:pt-8 p-6 text-center">
        <p className="text-[var(--color-text-light)]">Livre introuvable</p>
        <Link to="/livres" className="text-[var(--color-primary)] no-underline">Retour au catalogue</Link>
      </div>
    );
  }

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <Link to="/livres" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] no-underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour au catalogue
      </Link>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Couverture */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="aspect-[3/4] rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
              {book.cover ? (
                <img
                  src={book.cover.startsWith('http') ? book.cover : `${API_URL}${book.cover}`}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen className="w-16 h-16" style={{ color: 'var(--color-border)' }} />
              )}
            </div>
          </div>

          {/* Détails */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{book.title}</h1>
                  {user && (
                    <button onClick={toggleFavorite} className="bg-transparent border-none cursor-pointer p-1">
                      <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} style={isFavorite ? {} : { color: 'var(--color-text-light)' }} />
                    </button>
                  )}
                </div>
                <p className="text-[var(--color-text-light)]">{book.author?.join(', ')}</p>
                {averageRating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--color-border)]'}`} />
                    ))}
                    <span className="text-sm text-[var(--color-text-light)] ml-1">{averageRating.toFixed(1)} ({reviews.length} avis)</span>
                  </div>
                )}
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadBookLabel(book)}
                    className="btn-secondary flex items-center gap-1.5 text-sm"
                    title="Imprimer l'étiquette"
                  >
                    <Printer className="w-4 h-4" />
                    Étiquette
                  </button>
                  <Link to={`/livres/${book._id}/modifier`} className="btn-secondary flex items-center gap-1.5 text-sm no-underline">
                    <Edit className="w-4 h-4" />
                    Modifier
                  </Link>
                  {(user?.role === 'admin' || user?.role === 'owner') && (
                    <button onClick={handleDelete} className="btn-danger flex items-center gap-1.5 text-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="badge badge-info">{book.category}</span>
              <span className={`badge ${book.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                {book.availableCopies > 0 ? `${book.availableCopies} exemplaire(s) disponible(s)` : 'Indisponible'}
              </span>
              {book.condition && (
                <span className="badge badge-warning">État : {book.condition}</span>
              )}
            </div>

            {book.description && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-[var(--color-text-light)] leading-relaxed">{book.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {book.isbn && (
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[var(--color-text-light)]" />
                  <span className="text-[var(--color-text-light)]">ISBN :</span>
                  <span className="font-medium">{book.isbn}</span>
                </div>
              )}
              {book.publisher && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[var(--color-text-light)]" />
                  <span className="text-[var(--color-text-light)]">Éditeur :</span>
                  <span className="font-medium">{book.publisher}</span>
                </div>
              )}
              {book.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--color-text-light)]" />
                  <span className="text-[var(--color-text-light)]">Année :</span>
                  <span className="font-medium">{book.year}</span>
                </div>
              )}
              {book.pages > 0 && (
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--color-text-light)]" />
                  <span className="text-[var(--color-text-light)]">Pages :</span>
                  <span className="font-medium">{book.pages}</span>
                </div>
              )}
              {book.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--color-text-light)]" />
                  <span className="text-[var(--color-text-light)]">Emplacement :</span>
                  <span className="font-medium">{book.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--color-text-light)]" />
                <span className="text-[var(--color-text-light)]">Exemplaires :</span>
                <span className="font-medium">{book.copies}</span>
              </div>
            </div>

            {/* Reserve button */}
            {isMember && book.availableCopies === 0 && (
              <button onClick={handleReserve} className="btn-primary flex items-center gap-2 mt-4">
                <BookmarkPlus className="w-4 h-4" />
                Réserver ce livre
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section Avis */}
      <div className="card mt-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Avis ({reviews.length})
        </h3>

        {/* Formulaire d'avis pour les membres */}
        {isMember && (
          <form onSubmit={handleReviewSubmit} className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium">Votre note :</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewRating(s)} className="bg-transparent border-none cursor-pointer p-0">
                    <Star className={`w-5 h-5 ${s <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--color-border)]'}`} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="input mb-3"
              rows={3}
              placeholder="Votre commentaire (optionnel)..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            <button type="submit" className="btn-primary text-sm" disabled={submittingReview}>
              {submittingReview ? 'Envoi...' : 'Publier l\'avis'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-center text-[var(--color-text-light)] py-6">Aucun avis pour ce livre</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-[var(--color-border)] pb-4 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{r.user?.fullName || 'Anonyme'}</span>
                  <span className="text-xs text-[var(--color-text-light)]">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--color-border)]'}`} />
                  ))}
                </div>
                {r.comment && <p className="text-sm text-[var(--color-text-light)]">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

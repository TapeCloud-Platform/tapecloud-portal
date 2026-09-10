import { useState } from 'react';

const placeholderStats = {
  mostViewedReview: '-',
  tapebeatReviews: '-',
  tapeflixReviews: '-',
};

export default function UserMenu({ user }) {
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const displayName = user ? user.displayName || user.email.split('@')[0] : 'Invitado';
  const displayEmail = user ? user.email : 'Iniciá sesión para ver tu cuenta';

  return (
    <div className="user-menu">
      <button type="button" className="user-menu__trigger" aria-label="Cuenta de usuario">
        <span className="user-menu__avatar">👤</span>
      </button>

      <div className="user-menu__panel">
        <div className="user-menu__profile">
          {/* Foto por defecto; más adelante se podrá subir/cambiar */}
          <span className="user-menu__avatar user-menu__avatar--large">👤</span>
          <div>
            <p className="user-menu__name">{displayName}</p>
            <p className="user-menu__email">{displayEmail}</p>
          </div>
        </div>

        <div className="user-menu__reviews">
          <button
            type="button"
            className="user-menu__reviews-toggle"
            onClick={() => setReviewsOpen((open) => !open)}
            aria-expanded={reviewsOpen}
          >
            Reseñas
            <span className={`user-menu__chevron ${reviewsOpen ? 'is-open' : ''}`}>›</span>
          </button>

          {reviewsOpen && (
            <ul className="user-menu__list">
              <li>
                <span>Reseña más vista</span>
                <strong>{placeholderStats.mostViewedReview}</strong>
              </li>
              <li>
                <span>Reseñas publicadas en TapeBeat</span>
                <strong>{placeholderStats.tapebeatReviews}</strong>
              </li>
              <li>
                <span>Reseñas publicadas en TapeFlix</span>
                <strong>{placeholderStats.tapeflixReviews}</strong>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

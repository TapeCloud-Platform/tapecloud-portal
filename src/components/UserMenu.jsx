import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import userIconDark from '../assets/user-icon-dark.png';
import userIconLight from '../assets/user-icon-light.png';

const placeholderStats = {
  mostViewedReview: '-',
  tapebeatReviews: '-',
  tapeflixReviews: '-',
};

export default function UserMenu({ user, theme }) {
  const userIcon = theme === 'light' ? userIconLight : userIconDark;
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const displayName = user ? user.displayName || user.email.split('@')[0] : 'Invitado';
  const displayEmail = user ? user.email : 'Iniciá sesión para ver tu cuenta';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="user-menu__trigger" aria-label="Cuenta de usuario">
          <img className="user-menu__avatar" src={userIcon} alt="" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="user-menu__panel" align="start" sideOffset={10}>
          <div className="user-menu__profile">
            {/* Foto por defecto; más adelante se podrá subir/cambiar */}
            <img className="user-menu__avatar user-menu__avatar--large" src={userIcon} alt="" />
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
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

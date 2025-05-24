// Interfaces
interface Outfit {
  id: string;
  name: string;
  rarity: {
    value: string;
  };
  images: {
    icon: string;
  };
}

// DOM Elementen
const favoritesGrid = document.getElementById('favorites-grid') as HTMLElement;
const searchInput = document.getElementById('search') as HTMLInputElement;
const filterSelect = document.getElementById('filter-rarity') as HTMLSelectElement;
const infoBtn = document.querySelector('.info-btn') as HTMLButtonElement;
const popupMessage = document.getElementById('popup-message') as HTMLElement;

// Favorieten ophalen
function getFavorites(): string[] {
  const data = localStorage.getItem('favorites');
  return data ? JSON.parse(data) : [];
}

// Favorieten tonen
function displayFavorites(): void {
  const favorites = getFavorites();
  favoritesGrid.innerHTML = '';

  if (favorites.length === 0) {
    favoritesGrid.innerHTML = `<p class="no-favorites">Geen favorieten gevonden.</p>`;
    return;
  }

  fetch('https://fortnite-api.com/v2/cosmetics/br')
    .then(response => response.json())
    .then(data => {
      const outfits: Outfit[] = data.data.filter((outfit: Outfit) =>
        favorites.includes(outfit.id)
      );

      const searchQuery = searchInput.value.toLowerCase();
      const selectedRarity = filterSelect.value;

      outfits
        .filter(outfit => {
          const nameMatch = outfit.name.toLowerCase().includes(searchQuery);
          const rarityMatch = selectedRarity === '' || outfit.rarity.value === selectedRarity;
          return nameMatch && rarityMatch;
        })
        .forEach(outfit => {
          const outfitCard = document.createElement('div');
          outfitCard.className = `character-card rarity-${outfit.rarity.value}`;
          outfitCard.dataset.id = outfit.id;

          outfitCard.innerHTML = `
            <span class="favorite-star">⭐</span>
            <img src="${outfit.images.icon}" alt="${outfit.name}">
            <h3>${outfit.name}</h3>
          `;

          outfitCard.addEventListener('click', () => {
            localStorage.setItem('selectedCharacter', outfit.id);
            window.location.href = 'favokarak.html';
          });

          favoritesGrid.appendChild(outfitCard);
        });
    });
}

// Filteren
function filterFavorites(): void {
  displayFavorites();
}

// Popup tonen
function showPopup(message: string): void {
  popupMessage.textContent = message;
  popupMessage.classList.add('show');
  setTimeout(() => popupMessage.classList.remove('show'), 3000);
}

// Profielfoto instellen vanuit localStorage
function set_avatar(): void {
  const userProfileImg = document.getElementById('user-profile-img') as HTMLImageElement | null;
  const userImage = localStorage.getItem('userCharacterImg');
  if (userProfileImg) {
    userProfileImg.src = userImage ?? './assets/question-mark.svg';
  }
}

// Menu toggle (optioneel)
function toggleMenu(): void {
  const navMenu = document.querySelector(".nav-menu") as HTMLElement;
  navMenu?.classList.toggle("show");
}

// Event Listeners
infoBtn?.addEventListener('click', () => {
  showPopup('Klik op een favoriet voor meer opties!');
});

searchInput?.addEventListener('input', filterFavorites);
filterSelect?.addEventListener('change', filterFavorites);

// Init
document.addEventListener('DOMContentLoaded', () => {
  displayFavorites();
  set_avatar();
});

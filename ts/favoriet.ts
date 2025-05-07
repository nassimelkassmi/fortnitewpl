const favoritesGrid = document.getElementById('favorites-grid') as HTMLElement;
const searchInputfavo = document.getElementById('search') as HTMLInputElement;
const filterSelectfavo = document.getElementById('filter-rarity') as HTMLSelectElement;
const infoBtnfavo = document.querySelector('.info-btn') as HTMLButtonElement;
const popupMessagefavo = document.getElementById('popup-message') as HTMLElement;

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

function getFavorites(): string[] {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
}

function displayFavorites(): void {
    const favorites = getFavorites();
    favoritesGrid.innerHTML = '';

    if (favorites.length === 0) {
        favoritesGrid.innerHTML = `<p class="no-favorites">Geen favorieten gevonden.</p>`;
        return;
    }

    fetch('https://fortnite-api.com/v2/cosmetics/br')
        .then(response => response.json())
        .then((data: { data: Outfit[] }) => {
            const outfits = data.data.filter(outfit => favorites.includes(outfit.id));

            outfits.forEach(outfit => {
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
        })
        .catch(error => {
            console.error('Fout bij het ophalen van outfits:', error);
        });
}

function filterFavorites(): void {
    displayFavorites();
}

function showPopup(message: string): void {
    popupMessagefavo.textContent = message;
    popupMessagefavo.classList.add('show');
    setTimeout(() => popupMessagefavo.classList.remove('show'), 3000);
}

searchInput.addEventListener('input', filterFavorites);
filterSelect.addEventListener('change', filterFavorites);
infoBtn.addEventListener('click', () => {
    showPopup('Klik op een favoriet voor meer opties!');
});

displayFavorites();

function toggleMenu(): void {
    const navMenu = document.querySelector(".nav-menu") as HTMLElement;
    navMenu.classList.toggle("show");
}

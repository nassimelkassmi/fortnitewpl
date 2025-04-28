const favoritesGrid = document.getElementById('favorites-grid');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter-rarity');
const infoBtn = document.querySelector('.info-btn');
const popupMessage = document.getElementById('popup-message');

function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

function displayFavorites() {
    const favorites = getFavorites();
    favoritesGrid.innerHTML = '';

    if (favorites.length === 0) {
        favoritesGrid.innerHTML = `<p class="no-favorites">Geen favorieten gevonden.</p>`;
        return;
    }

    fetch('https://fortnite-api.com/v2/cosmetics/br')
        .then(response => response.json())
        .then(data => {
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
        });
}

// ✅ **Filter en zoekfunctie voor favorieten**
function filterFavorites() {
    displayFavorites();
}

// ✅ **Event Listeners**
searchInput.addEventListener('input', filterFavorites);
filterSelect.addEventListener('change', filterFavorites);
infoBtn.addEventListener('click', () => {
    showPopup('Klik op een favoriet voor meer opties!');
});

function showPopup(message) {
    popupMessage.textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 3000);
}

// ✅ **Laad favorieten**
displayFavorites();
;

function toggleMenu() {
    document.querySelector(".nav-menu").classList.toggle("show");
}
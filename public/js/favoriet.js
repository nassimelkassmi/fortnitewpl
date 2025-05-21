"use strict";
// DOM Elementen
const favoritesGrid = document.getElementById('favorites-grid');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter-rarity');
const infoBtn = document.querySelector('.info-btn');
const popupMessage = document.getElementById('popup-message');
function getFavorites() {
    const data = localStorage.getItem('favorites');
    return data ? JSON.parse(data) : [];
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
        const outfits = data.data.filter((outfit) => favorites.includes(outfit.id));
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
function filterFavorites() {
    displayFavorites();
}
function showPopup(message) {
    popupMessage.textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 3000);
}
infoBtn?.addEventListener('click', () => {
    showPopup('Klik op een favoriet voor meer opties!');
});
searchInput?.addEventListener('input', filterFavorites);
filterSelect?.addEventListener('change', filterFavorites);
function toggleMenu() {
    const navMenu = document.querySelector(".nav-menu");
    navMenu?.classList.toggle("show");
}
// Init
displayFavorites();

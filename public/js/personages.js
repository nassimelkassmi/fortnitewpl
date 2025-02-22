const charactersGrid = document.getElementById('characters-grid');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter-rarity');
const infoBtn = document.querySelector('.info-btn');
const popupMessage = document.getElementById('popup-message');

async function fetchOutfits() {
    try {
        const response = await fetch('https://fortnite-api.com/v2/cosmetics/br');
        const data = await response.json();
        if (!data.data) return;

        const outfits = data.data.filter(item => item.type.value === 'outfit');
        displayCharacters(outfits);
    } catch (error) {
        console.error('Fout bij het ophalen van outfits:', error);
    }
}

function displayCharacters(outfits) {
    charactersGrid.innerHTML = '';

     // Get favorites from localStorage
     let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    outfits.forEach(outfit => {
        const outfitCard = document.createElement('div');
        outfitCard.className = `character-card rarity-${outfit.rarity.value}`;

        const isFavorite = favorites.includes(outfit.id);
        const starVisibility = isFavorite ? 'block' : 'none';

        outfitCard.innerHTML = `
        <span class="favorite-star" style="display: ${starVisibility};">⭐</span>
        <p class="rarity-label">${outfit.rarity.displayValue || 'Overige'}</p> 
        <img src="${outfit.images.icon}" alt="${outfit.name}">
        <h3>${outfit.name}</h3>
    `;
    outfitCard.addEventListener('click', () => {
        localStorage.setItem('selectedCharacter', outfit.id);

        if (isFavorite) {
            // If it's a favorite, go to the personalized character page
            window.location.href = 'favokarak.html';
        } else {
            // Otherwise, go to the normal character page
            window.location.href = 'karakter.html';
        }
    });

        charactersGrid.appendChild(outfitCard);
    });
}

fetchOutfits();

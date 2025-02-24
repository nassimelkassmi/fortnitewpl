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
        
        // Save original list for filtering
        window.allOutfits = outfits;

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
        if (!outfit.images?.icon) return; // Skip missing images

        let rarityClass = outfit.rarity.value.toLowerCase();
        const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        if (!validRarities.includes(rarityClass)) {
            rarityClass = 'other'; // Default to "other" if not in the known rarities
        }

        const outfitCard = document.createElement('div');
        outfitCard.className = `character-card rarity-${rarityClass}`;
        
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
                window.location.href = 'favokarak.html'; // Personalized character page
            } else {
                window.location.href = 'karakter.html'; // Normal character page
            }
        });

        charactersGrid.appendChild(outfitCard);
    });
}

// ✅ **Filter Function**
function filterCharacters() {
    const searchText = searchInput.value.toLowerCase();
    const selectedRarity = filterSelect.value;

    const filtered = window.allOutfits.filter(outfit => {
        const matchesSearch = outfit.name.toLowerCase().includes(searchText);

        let rarityClass = outfit.rarity.value.toLowerCase();
        const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        if (!validRarities.includes(rarityClass)) {
            rarityClass = 'other';
        }

        const matchesRarity = selectedRarity ? rarityClass === selectedRarity : true;
        return matchesSearch && matchesRarity;
    });

    displayCharacters(filtered);
}
// ℹ️ **Info-knop popup**
infoBtn.addEventListener('click', () => {
    showPopup('Klik op een personage voor meer opties! Alleen bij favorieten kan je items en notities toevoegen!');
});

// ✅ **Event Listeners for Search and Filter**
searchInput.addEventListener('input', filterCharacters);
filterSelect.addEventListener('change', filterCharacters);

// ✅ **Fetch Characters on Load**
fetchOutfits();
// ✅ Functie om een popup te tonen
function showPopup(message) {
    const popupMessage = document.getElementById('popup-message');
    popupMessage.textContent = message;
    popupMessage.classList.add('show');

    // Verwijder de popup na 3 seconden
    setTimeout(() => {
        popupMessage.classList.remove('show');
    }, 3000);
}

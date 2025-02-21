const blacklistGrid = document.getElementById('blacklist-grid');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter-rarity');
const infoBtn = document.querySelector('.info-btn');
const popupMessage = document.getElementById('popup-message');
function getBlacklisted() {
    return JSON.parse(localStorage.getItem('blacklistCharacters')) || [];
}

// ✅ **Toon alleen de personages op de zwarte lijst**
function displayBlacklisted() {
    const blacklisted = getBlacklisted();
    blacklistGrid.innerHTML = '';

    if (blacklisted.length === 0) {
        blacklistGrid.innerHTML = `<p class="no-blacklist">Geen personages op de zwarte lijst.</p>`;
        return;
    }

    blacklisted.forEach(outfit => {
        const outfitCard = document.createElement('div');
        outfitCard.className = `character-card rarity-${outfit.rarity}`;
        outfitCard.dataset.id = outfit.id;

        outfitCard.innerHTML = `
            <span class="blacklist-icon">❌</span>
            <img src="${outfit.image}" alt="${outfit.name}">
            <h3>${outfit.name}</h3>
            <p class="rarity-label">${outfit.rarity.toUpperCase()}</p>
            <button class="remove-blacklist" data-id="${outfit.id}">🗑️ Verwijderen</button>
        `;

        outfitCard.addEventListener('click', () => {
            localStorage.setItem('selectedCharacter', outfit.id);
            window.location.href = 'karakter.html';
        });

        blacklistGrid.appendChild(outfitCard);
    });

    // Event listener voor verwijderen van de zwarte lijst
    document.querySelectorAll('.remove-blacklist').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromBlacklist(button.dataset.id);
        });
    });
}

// ✅ **Verwijder personage van de zwarte lijst**
function removeFromBlacklist(id) {
    let blacklisted = getBlacklisted();
    blacklisted = blacklisted.filter(outfit => outfit.id !== id);
    localStorage.setItem('blacklistCharacters', JSON.stringify(blacklisted));
    displayBlacklisted();
    showPopup('Personage verwijderd van de zwarte lijst!');
}

// ✅ **Filter en zoekfunctie voor zwarte lijst**
function filterBlacklisted() {
    const blacklisted = getBlacklisted();
    const searchText = searchInput.value.toLowerCase();
    const rarityFilter = filterSelect.value;

    const filtered = blacklisted.filter(outfit => {
        const matchesSearch = outfit.name.toLowerCase().includes(searchText);
        const matchesRarity = rarityFilter ? outfit.rarity === rarityFilter : true;
        return matchesSearch && matchesRarity;
    });

    blacklistGrid.innerHTML = '';
    if (filtered.length === 0) {
        blacklistGrid.innerHTML = `<p class="no-blacklist">Geen resultaten.</p>`;
    } else {
        filtered.forEach(outfit => {
            const outfitCard = document.createElement('div');
            outfitCard.className = `character-card rarity-${outfit.rarity}`;
            outfitCard.dataset.id = outfit.id;

            outfitCard.innerHTML = `
                <span class="blacklist-icon">❌</span>
                <img src="${outfit.image}" alt="${outfit.name}">
                <h3>${outfit.name}</h3>
                <p class="rarity-label">${outfit.rarity.toUpperCase()}</p>
                <button class="remove-blacklist" data-id="${outfit.id}">🗑️ Verwijderen</button>
            `;

            outfitCard.addEventListener('click', () => {
                localStorage.setItem('selectedCharacter', outfit.id);
                window.location.href = 'karakter.html';
            });

            blacklistGrid.appendChild(outfitCard);
        });

        document.querySelectorAll('.remove-blacklist').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromBlacklist(button.dataset.id);
            });
        });
    }
}

// ✅ **Event Listeners voor zoekbalk en filter**
searchInput.addEventListener('input', filterBlacklisted);
filterSelect.addEventListener('change', filterBlacklisted);
infoBtn.addEventListener('click', () => {
    showPopup('Verander de reden of verwijder de personages van de blacklist!');
});
function showPopup(message) {
    popupMessage.textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 3000);
}
// ✅ **Laad zwarte lijst**
displayBlacklisted();

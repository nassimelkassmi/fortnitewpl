const blacklistGrid = document.getElementById('blacklist-grid');
const popupMessage = document.getElementById('popup-message');
const infoBtn = document.querySelector('.info-btn'); // ℹ️ Info-knop voor uitleg

// ✅ **Haal de zwarte lijst op uit localStorage**
function getBlacklisted() {
    return JSON.parse(localStorage.getItem('blacklistCharacters')) || [];
}

// ✅ **Sla de zwarte lijst op in localStorage**
function saveBlacklisted(blacklist) {
    localStorage.setItem('blacklistCharacters', JSON.stringify(blacklist));
}

// ✅ **Toon personages op de zwarte lijst**
function displayBlacklisted() {
    let blacklisted = getBlacklisted();
    blacklistGrid.innerHTML = ''; // Reset de lijst

    if (blacklisted.length === 0) {
        blacklistGrid.innerHTML = `<p class="no-blacklist">Geen personages op de zwarte lijst.</p>`;
        return;
    }

    blacklisted.forEach(outfit => {
        const outfitCard = document.createElement('div');
        outfitCard.className = `character-card`;
        outfitCard.dataset.id = outfit.id;

        // **HTML-structuur van een karakterkaart**
        outfitCard.innerHTML = `
            <img src="${outfit.image}" alt="${outfit.name}">
            <div class="character-info">
                <h3>${outfit.name}</h3>
                <p class="blacklist-reason">
                    <strong>Reden:</strong>
                    <span class="reason-text">${outfit.reason || 'Geen reden opgegeven'}</span>
                </p>
                <button class="edit-reason-btn">✏️ Bewerk</button>
                <button class="remove-blacklist">🗑️ Verwijderen</button>
            </div>
        `;

        blacklistGrid.appendChild(outfitCard);

        // **Event listener voor bewerken**
        outfitCard.querySelector('.edit-reason-btn').addEventListener('click', () => editReason(outfit.id));

        // **Event listener voor verwijderen**
        outfitCard.querySelector('.remove-blacklist').addEventListener('click', () => removeFromBlacklist(outfit.id));
    });
}

// ✅ **Functie om een reden te bewerken**
function editReason(id) {
    let blacklist = getBlacklisted();
    let character = blacklist.find(outfit => outfit.id === id);

    if (!character) return;

    // **Vervang de reden door een inputveld**
    const characterCard = document.querySelector(`.character-card[data-id="${id}"]`);
    const reasonContainer = characterCard.querySelector('.blacklist-reason');

    reasonContainer.innerHTML = `
        <strong>Reden:</strong>
        <input type="text" class="edit-reason" value="${character.reason || ''}">
        <button class="save-reason">✔️ Opslaan</button>
    `;

    // **Event listener voor opslaan**
    characterCard.querySelector('.save-reason').addEventListener('click', () => {
        const newReason = characterCard.querySelector('.edit-reason').value.trim();
        updateReason(id, newReason);
    });
}

// ✅ **Update reden**
function updateReason(id, newReason) {
    let blacklist = getBlacklisted();
    let character = blacklist.find(outfit => outfit.id === id);

    if (character) {
        character.reason = newReason;
        saveBlacklisted(blacklist);
        displayBlacklisted(); // Lijst opnieuw tonen met nieuwe reden
        showPopup("Reden bijgewerkt!");
    }
}

// ✅ **Verwijder personage van de zwarte lijst**
function removeFromBlacklist(id) {
    let blacklist = getBlacklisted();
    blacklist = blacklist.filter(outfit => outfit.id !== id);
    saveBlacklisted(blacklist);
    displayBlacklisted();
    showPopup("Karakter verwijderd uit de zwarte lijst!");
}

// ✅ **Info-popup functie**
infoBtn.addEventListener('click', () => {
    showPopup("Hier kun je personages beheren die op je zwarte lijst staan.\n\n- Klik op ✏️ om een reden te bewerken.\n- Klik op ✔️ om de reden op te slaan.\n- Klik op 🗑️ om een personage te verwijderen.");
});

// ✅ **Toon een popup bericht**
function showPopup(message) {
    popupMessage.textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 4000);
}

// ✅ **Laad zwarte lijst bij het openen van de pagina**
displayBlacklisted();

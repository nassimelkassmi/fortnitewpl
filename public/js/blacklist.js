const blacklistGrid = document.getElementById('blacklist-grid');
const popupMessage = document.getElementById('popup-message');
const infoBtn = document.querySelector('.info-btn'); 


function getBlacklisted() {
    return JSON.parse(localStorage.getItem('blacklistCharacters')) || [];
}


function saveBlacklisted(blacklist) {
    localStorage.setItem('blacklistCharacters', JSON.stringify(blacklist));
}


function displayBlacklisted() {
    let blacklisted = getBlacklisted();
    blacklistGrid.innerHTML = ''; 

    if (blacklisted.length === 0) {
        blacklistGrid.innerHTML = `<p class="no-blacklist">Geen personages op de zwarte lijst.</p>`;
        return;
    }

    blacklisted.forEach(outfit => {
        const outfitCard = document.createElement('div');
        outfitCard.className = `character-card`;
        outfitCard.dataset.id = outfit.id;

        
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

       
        outfitCard.querySelector('.edit-reason-btn').addEventListener('click', () => editReason(outfit.id));

        
        outfitCard.querySelector('.remove-blacklist').addEventListener('click', () => removeFromBlacklist(outfit.id));
    });
}


function editReason(id) {
    let blacklist = getBlacklisted();
    let character = blacklist.find(outfit => outfit.id === id);

    if (!character) return;

    
    const characterCard = document.querySelector(`.character-card[data-id="${id}"]`);
    const reasonContainer = characterCard.querySelector('.blacklist-reason');

    reasonContainer.innerHTML = `
        <strong>Reden:</strong>
        <input type="text" class="edit-reason" value="${character.reason || ''}">
        <button class="save-reason">✔️ Opslaan</button>
    `;

    
    characterCard.querySelector('.save-reason').addEventListener('click', () => {
        const newReason = characterCard.querySelector('.edit-reason').value.trim();
        updateReason(id, newReason);
    });
}

function updateReason(id, newReason) {
    let blacklist = getBlacklisted();
    let character = blacklist.find(outfit => outfit.id === id);

    if (character) {
        character.reason = newReason;
        saveBlacklisted(blacklist);
        displayBlacklisted(); 
        showPopup("Reden bijgewerkt!");
    }
}

function removeFromBlacklist(id) {
    let blacklist = getBlacklisted();
    blacklist = blacklist.filter(outfit => outfit.id !== id);
    saveBlacklisted(blacklist);
    displayBlacklisted();
    showPopup("Karakter verwijderd uit de zwarte lijst!");
}

infoBtn.addEventListener('click', () => {
    showPopup("Hier kun je personages beheren die op je zwarte lijst staan.\n\n- Klik op ✏️ om een reden te bewerken.\n- Klik op ✔️ om de reden op te slaan.\n- Klik op 🗑️ om een personage te verwijderen.");
});

// ✅ **Toon een popup bericht**
function showPopup(message) {
    popupMessage.textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 4000);
}

displayBlacklisted();

function toggleMenu() {
    document.querySelector(".nav-menu").classList.toggle("show");
}
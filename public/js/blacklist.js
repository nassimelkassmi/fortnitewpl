"use strict";
// DOM-elementen met typecasting
const blacklistGrid = document.getElementById('blacklist-grid');
const popupMessage = document.getElementById('popup-message');
const infoBtn = document.querySelector('.info-btn');
// ✅ Profielfoto instellen vanuit localStorage
function set_avatar() {
    const userProfileImg = document.getElementById('user-profile-img');
    const userImage = localStorage.getItem('userCharacterImg');
    if (userProfileImg) {
        userProfileImg.src = userImage ?? './assets/question-mark.svg';
    }
}
// Zwarte lijst ophalen
function getBlacklisted() {
    const data = localStorage.getItem('blacklistCharacters');
    return data ? JSON.parse(data) : [];
}
// Zwarte lijst opslaan
function saveBlacklisted(blacklist) {
    localStorage.setItem('blacklistCharacters', JSON.stringify(blacklist));
}
// Zwarte lijst weergeven
function displayBlacklisted() {
    const blacklisted = getBlacklisted();
    blacklistGrid.innerHTML = '';
    if (blacklisted.length === 0) {
        blacklistGrid.innerHTML = `<p class="no-blacklist">Geen personages op de zwarte lijst.</p>`;
        return;
    }
    blacklisted.forEach(outfit => {
        const outfitCard = document.createElement('div');
        outfitCard.className = 'character-card';
        outfitCard.dataset.id = outfit.id;
        outfitCard.innerHTML = `
      <img src="${outfit.image}" alt="${outfit.name}">
      <div class="character-info">
        <h3>${outfit.name}</h3>
        <p class="blacklist-reason">
          <strong>Reden:</strong>
          <span class="reason-text">${outfit.reason || 'Geen reden opgegeven'}</span>
        </p>
        <button class="edit-reason-btn">✏ Bewerk</button>
        <button class="remove-blacklist">🗑 Verwijderen</button>
      </div>
    `;
        blacklistGrid.appendChild(outfitCard);
        const editBtn = outfitCard.querySelector('.edit-reason-btn');
        const removeBtn = outfitCard.querySelector('.remove-blacklist');
        editBtn.addEventListener('click', () => editReason(outfit.id));
        removeBtn.addEventListener('click', () => removeFromBlacklist(outfit.id));
    });
}
// Reden bewerken
function editReason(id) {
    const blacklist = getBlacklisted();
    const character = blacklist.find(outfit => outfit.id === id);
    if (!character)
        return;
    const characterCard = document.querySelector(`.character-card[data-id="${id}"]`);
    const reasonContainer = characterCard.querySelector('.blacklist-reason');
    reasonContainer.innerHTML = `
    <strong>Reden:</strong>
    <input type="text" class="edit-reason" value="${character.reason || ''}">
    <button class="save-reason">✔ Opslaan</button>
  `;
    const saveBtn = characterCard.querySelector('.save-reason');
    const input = characterCard.querySelector('.edit-reason');
    saveBtn.addEventListener('click', () => {
        const newReason = input.value.trim();
        updateReason(id, newReason);
    });
}
// Reden opslaan
function updateReason(id, newReason) {
    const blacklist = getBlacklisted();
    const character = blacklist.find(outfit => outfit.id === id);
    if (character) {
        character.reason = newReason;
        saveBlacklisted(blacklist);
        displayBlacklisted();
        showPopup("Reden bijgewerkt!");
    }
}
// Verwijderen
function removeFromBlacklist(id) {
    let blacklist = getBlacklisted();
    blacklist = blacklist.filter(outfit => outfit.id !== id);
    saveBlacklisted(blacklist);
    displayBlacklisted();
    showPopup("Karakter verwijderd uit de zwarte lijst!");
}
// Popup tonen
function showPopup(message) {
    popupMessage.textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 4000);
}
// Tooltip
infoBtn.addEventListener('click', () => {
    showPopup(`Hier kun je personages beheren die op je zwarte lijst staan.

- Klik op ✏ om een reden te bewerken.
- Klik op ✔ om de reden op te slaan.
- Klik op 🗑 om een personage te verwijderen.`);
});
// Menu toggle (optioneel)
function toggleMenu() {
    const navMenu = document.querySelector(".nav-menu");
    navMenu?.classList.toggle("show");
}
// Init
document.addEventListener('DOMContentLoaded', () => {
    displayBlacklisted();
    set_avatar();
});

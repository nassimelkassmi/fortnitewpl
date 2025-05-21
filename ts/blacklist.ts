interface BlacklistedCharacter {
  id: string;
  name: string;
  image: string;
  reason?: string;
}

// DOM-elementen met typecasting
const blacklistGrid = document.getElementById('blacklist-grid') as HTMLElement;
const popupMessage = document.getElementById('popup-message') as HTMLElement;
const infoBtn = document.querySelector('.info-btn') as HTMLButtonElement;

function getBlacklisted(): BlacklistedCharacter[] {
  const data = localStorage.getItem('blacklistCharacters');
  return data ? JSON.parse(data) : [];
}

function saveBlacklisted(blacklist: BlacklistedCharacter[]): void {
  localStorage.setItem('blacklistCharacters', JSON.stringify(blacklist));
}

function displayBlacklisted(): void {
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

    const editBtn = outfitCard.querySelector('.edit-reason-btn') as HTMLButtonElement;
    const removeBtn = outfitCard.querySelector('.remove-blacklist') as HTMLButtonElement;

    editBtn.addEventListener('click', () => editReason(outfit.id));
    removeBtn.addEventListener('click', () => removeFromBlacklist(outfit.id));
  });
}

function editReason(id: string): void {
  const blacklist = getBlacklisted();
  const character = blacklist.find(outfit => outfit.id === id);
  if (!character) return;

  const characterCard = document.querySelector(`.character-card[data-id="${id}"]`) as HTMLElement;
  const reasonContainer = characterCard.querySelector('.blacklist-reason') as HTMLElement;

  reasonContainer.innerHTML = `
    <strong>Reden:</strong>
    <input type="text" class="edit-reason" value="${character.reason || ''}">
    <button class="save-reason">✔ Opslaan</button>
  `;

  const saveBtn = characterCard.querySelector('.save-reason') as HTMLButtonElement;
  const input = characterCard.querySelector('.edit-reason') as HTMLInputElement;

  saveBtn.addEventListener('click', () => {
    const newReason = input.value.trim();
    updateReason(id, newReason);
  });
}

function updateReason(id: string, newReason: string): void {
  const blacklist = getBlacklisted();
  const character = blacklist.find(outfit => outfit.id === id);
  if (character) {
    character.reason = newReason;
    saveBlacklisted(blacklist);
    displayBlacklisted();
    showPopup("Reden bijgewerkt!");
  }
}

function removeFromBlacklist(id: string): void {
  let blacklist = getBlacklisted();
  blacklist = blacklist.filter(outfit => outfit.id !== id);
  saveBlacklisted(blacklist);
  displayBlacklisted();
  showPopup("Karakter verwijderd uit de zwarte lijst!");
}

function showPopup(message: string): void {
  popupMessage.textContent = message;
  popupMessage.classList.add('show');
  setTimeout(() => popupMessage.classList.remove('show'), 4000);
}

infoBtn.addEventListener('click', () => {
  showPopup(`Hier kun je personages beheren die op je zwarte lijst staan.

- Klik op ✏ om een reden te bewerken.
- Klik op ✔ om de reden op te slaan.
- Klik op 🗑 om een personage te verwijderen.`);
});

function toggleMenu(): void {
  const navMenu = document.querySelector(".nav-menu") as HTMLElement;
  navMenu?.classList.toggle("show");
}

// Init
displayBlacklisted();

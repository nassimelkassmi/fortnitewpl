// ✅ Selecteer alle HTML-elementen
const karakterImg = document.getElementById('karakter-img');
const karakterNaam = document.getElementById('karakter-naam');
const karakterBeschrijving = document.getElementById('karakter-beschrijving');
const wins = document.getElementById('wins');
const losses = document.getElementById('losses');
const addWin = document.getElementById('add-win');
const addLoss = document.getElementById('add-loss');
const notesInput = document.getElementById('notes');
const saveNotes = document.getElementById('save-notes');
const notesList = document.getElementById('notes-list'); // Correcte container voor notities
const item1Img = document.getElementById('item1-img');
const item2Img = document.getElementById('item2-img');
const removeFavorite = document.querySelector('.remove-favorite');
const infoBtn = document.querySelector('.info-btn');
const popupMessage = document.getElementById('popup-message');
const karakterID = localStorage.getItem('selectedCharacter');
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

if (!karakterID) {
    alert('Geen karakter geselecteerd!');
    window.location.href = 'personages.html';
}

// ✅ **Laad Karakter Data**
async function fetchKarakter() {
    try {
        const response = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${karakterID}`);
        const data = await response.json();
        if (!data.data) return;

        const karakter = data.data;
        karakterImg.src = karakter.images.icon || "./assets/placeholder.png";
        karakterNaam.innerText = karakter.name;
        karakterBeschrijving.innerText = karakter.description || 'Geen beschrijving beschikbaar.';
    } catch (error) {
        console.error('Fout bij het ophalen van het karakter:', error);
    }
}

// ✅ **Laad Wins, Losses, Notities en Items**
function loadUserData() {
    wins.innerText = localStorage.getItem(`wins-${karakterID}`) || 0;
    losses.innerText = localStorage.getItem(`losses-${karakterID}`) || 0;

    // Notities laden
    displayNotes();

    // Geselecteerde items laden of placeholder tonen
    item1Img.src = localStorage.getItem(`item1-img-${karakterID}`) || './assets/placeholder.png';
    item2Img.src = localStorage.getItem(`item2-img-${karakterID}`) || './assets/placeholder.png';
}

// ✅ **Opslaan en tonen van notities**
function saveAndDisplayNote() {
    const noteText = notesInput.value.trim();
    if (noteText === '') return; // Stop als er niets is ingevuld

    // Notitie opslaan in localStorage
    let savedNotes = JSON.parse(localStorage.getItem(`notes-${karakterID}`)) || [];
    savedNotes.unshift(noteText); // Nieuwste notitie bovenaan zetten
    localStorage.setItem(`notes-${karakterID}`, JSON.stringify(savedNotes));

    // 🚀 **Directe UI-update**
    displayNotes();
    notesInput.value = ''; // Leegmaken na opslaan
}

// ✅ **Toon opgeslagen notities**
function displayNotes() {
    let savedNotes = JSON.parse(localStorage.getItem(`notes-${karakterID}`)) || [];

    // Oude notities verwijderen om dubbele weergave te voorkomen
    notesList.innerHTML = '';

    savedNotes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('saved-note');
        noteElement.innerHTML = `
            <p>${note}</p>
            <button class="delete-note" data-index="${index}">🗑️</button>
        `;

        // **Nieuwste notitie komt BOVEN in de lijst**
        notesList.prepend(noteElement);
    });

    // ✅ **EventListener geven aan verwijderknoppen**
    document.querySelectorAll('.delete-note').forEach(button => {
        button.addEventListener('click', deleteNote);
    });
}

// ✅ **Verwijderen van een notitie**
function deleteNote(event) {
    let savedNotes = JSON.parse(localStorage.getItem(`notes-${karakterID}`)) || [];
    const noteIndex = event.target.getAttribute('data-index');

    savedNotes.splice(noteIndex, 1); // Verwijder notitie uit array
    localStorage.setItem(`notes-${karakterID}`, JSON.stringify(savedNotes));

    // 🚀 **Directe UI-update**
    displayNotes();
}

// ✅ **Wins en Losses bijhouden**
addWin.addEventListener('click', () => {
    let winCount = parseInt(wins.innerText) + 1;
    wins.innerText = winCount;
    localStorage.setItem(`wins-${karakterID}`, winCount);
});

addLoss.addEventListener('click', () => {
    let lossCount = parseInt(losses.innerText) + 1;
    losses.innerText = lossCount;
    localStorage.setItem(`losses-${karakterID}`, lossCount);
});

// ✅ **Event Listener voor opslaan van notities**
saveNotes.addEventListener('click', saveAndDisplayNote);

// ✅ **Function to Select Items**
function selectItem(slot) {
    localStorage.setItem('selectedItemSlot', slot);
    window.location.href = 'items.html';
}

// ✅ **Zorg dat items DIRECT verschijnen**
document.addEventListener("DOMContentLoaded", () => {
    item1Img.src = localStorage.getItem(`item1-img-${karakterID}`) || './assets/placeholder.png';
    item2Img.src = localStorage.getItem(`item2-img-${karakterID}`) || './assets/placeholder.png';
});

// ✅ **Verwijder karakter uit favorieten**
removeFavorite.addEventListener('click', () => {
    favorites = favorites.filter(id => id !== karakterID);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    window.location.href = 'personages.html';
});
infoBtn.addEventListener('click', () => {
    popupMessage.textContent = "Hier kan je notities en items toevoegen en je wins en losses bijhouden!";
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 3000);
});
// ✅ **Laad Karakter en Data bij Pagina-laden**
fetchKarakter();
loadUserData();

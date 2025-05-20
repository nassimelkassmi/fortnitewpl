"use strict";
// Type voor de favorietenlijst (id's als string)
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
// DOM-elementen met expliciete types
const karakterImg = document.getElementById('karakter-img');
const karakterNaam = document.getElementById('karakter-naam');
const karakterBeschrijving = document.getElementById('karakter-beschrijving');
const wins = document.getElementById('wins');
const losses = document.getElementById('losses');
const addWin = document.getElementById('add-win');
const addLoss = document.getElementById('add-loss');
const notesInput = document.getElementById('notes');
const saveNotes = document.getElementById('save-notes');
const notesList = document.getElementById('notes-list');
const item1Img = document.getElementById('item1-img');
const item2Img = document.getElementById('item2-img');
const removeFavorite = document.querySelector('.remove-favorite');
const infoBtn = document.querySelector('.info-btn');
const popupMessage = document.getElementById('popup-message');
const karakterID = localStorage.getItem('selectedCharacter');
if (!karakterID) {
    alert('Geen karakter geselecteerd!');
    window.location.href = 'personages.html';
}
// ✅ Haal karakterdata op via API
async function fetchKarakter() {
    try {
        const response = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${karakterID}`);
        const data = await response.json();
        if (!data.data)
            return;
        const karakter = data.data;
        karakterImg.src = karakter.images.icon || "./assets/placeholder.png";
        karakterNaam.innerText = karakter.name;
        karakterBeschrijving.innerText = karakter.description || 'Geen beschrijving beschikbaar.';
    }
    catch (error) {
        console.error('Fout bij het ophalen van het karakter:', error);
    }
}
// ✅ Laad lokale data (wins, losses, items, notities)
function loadUserData() {
    wins.innerText = localStorage.getItem(`wins-${karakterID}`) || '0';
    losses.innerText = localStorage.getItem(`losses-${karakterID}`) || '0';
    displayNotes();
    item1Img.src = localStorage.getItem(`item1-img-${karakterID}`) || './assets/placeholder.png';
    item2Img.src = localStorage.getItem(`item2-img-${karakterID}`) || './assets/placeholder.png';
}
// ✅ Notitie toevoegen
function saveAndDisplayNote() {
    const noteText = notesInput.value.trim();
    if (noteText === '')
        return;
    let savedNotes = JSON.parse(localStorage.getItem(`notes-${karakterID}`) || '[]');
    savedNotes.unshift(noteText);
    console.log("💾 Nieuwe notitie toegevoegd:", noteText);
    console.log("📋 Nieuwe array met notities:", savedNotes);
    localStorage.setItem(`notes-${karakterID}`, JSON.stringify(savedNotes));
    displayNotes();
    notesInput.value = '';
}
// ✅ Notities tonen
function displayNotes() {
    const savedNotesRaw = localStorage.getItem(`notes-${karakterID}`);
    let savedNotes;
    try {
        savedNotes = JSON.parse(savedNotesRaw || '[]');
        if (!Array.isArray(savedNotes)) {
            console.warn("⚠️ Geen array gevonden, reset naar lege array.");
            savedNotes = [];
        }
    }
    catch (error) {
        console.error("❌ JSON.parse() error:", error);
        savedNotes = [];
    }
    console.log("✅ Notities geladen:", savedNotes);
    notesList.innerHTML = '';
    savedNotes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('saved-note');
        noteElement.innerHTML = `
            <p>${note}</p>
            <button class="delete-note" data-index="${index}">🗑️</button>
        `;
        notesList.prepend(noteElement);
    });
    document.querySelectorAll('.delete-note').forEach(button => {
        button.addEventListener('click', deleteNote);
    });
}
// ✅ Notitie verwijderen
function deleteNote(event) {
    const target = event.target;
    const noteIndex = parseInt(target.getAttribute('data-index') || '0');
    let savedNotes = JSON.parse(localStorage.getItem(`notes-${karakterID}`) || '[]');
    savedNotes.splice(noteIndex, 1);
    localStorage.setItem(`notes-${karakterID}`, JSON.stringify(savedNotes));
    displayNotes();
}
// ✅ Wins en losses bijhouden
addWin.addEventListener('click', () => {
    const winCount = parseInt(wins.innerText) + 1;
    wins.innerText = winCount.toString();
    localStorage.setItem(`wins-${karakterID}`, winCount.toString());
});
addLoss.addEventListener('click', () => {
    const lossCount = parseInt(losses.innerText) + 1;
    losses.innerText = lossCount.toString();
    localStorage.setItem(`losses-${karakterID}`, lossCount.toString());
});
// ✅ Notitie opslaan
saveNotes.addEventListener('click', saveAndDisplayNote);
// ✅ Item selecteren
function selectItem(slot) {
    localStorage.setItem('selectedItemSlot', slot);
    window.location.href = 'items.html';
}
// ✅ Laad item-afbeeldingen meteen
document.addEventListener("DOMContentLoaded", () => {
    item1Img.src = localStorage.getItem(`item1-img-${karakterID}`) || './assets/placeholder.png';
    item2Img.src = localStorage.getItem(`item2-img-${karakterID}`) || './assets/placeholder.png';
});
// ✅ Favoriet verwijderen
removeFavorite.addEventListener('click', () => {
    favorites = favorites.filter(id => id !== karakterID);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    window.location.href = 'personages.html';
});
// ✅ Info-popup
infoBtn.addEventListener('click', () => {
    popupMessage.textContent = "Hier kan je notities en items toevoegen en je wins en losses bijhouden!";
    popupMessage.classList.add('show');
    setTimeout(() => popupMessage.classList.remove('show'), 3000);
});
// ✅ Pagina initialisatie
console.log("📌 Notes list ID:", notesList);
console.log("📌 Notes input ID:", notesInput);
console.log("📌 Save button ID:", saveNotes);
fetchKarakter();
loadUserData();

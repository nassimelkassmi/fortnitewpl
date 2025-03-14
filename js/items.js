const weaponsGrid = document.getElementById('weapons-grid');
const emotesGrid = document.getElementById('emotes-grid');
const backblingsGrid = document.getElementById('backblings-grid');

// Filters ophalen
const weaponFilter = document.getElementById('filter-weapons');
const emoteFilter = document.getElementById('filter-emotes');
const backblingFilter = document.getElementById('filter-backblings');

const selectedItemSlot = localStorage.getItem('selectedItemSlot');
const karakterID = localStorage.getItem('selectedCharacter');

async function fetchItems() {
    try {
        const response = await fetch('https://fortnite-api.com/v2/cosmetics/br');
        const data = await response.json();
        if (!data.data) return;

        const weapons = filterValidRarities(data.data.filter(item => item.type.value === 'pickaxe'));
        const emotes = filterValidRarities(data.data.filter(item => item.type.value === 'emote'));
        const backblings = filterValidRarities(data.data.filter(item => item.type.value === 'backpack'));

        displayItems(weapons, weaponsGrid, weaponFilter);
        displayItems(emotes, emotesGrid, emoteFilter);
        displayItems(backblings, backblingsGrid, backblingFilter);
    } catch (error) {
        console.error('Fout bij het ophalen van items:', error);
    }
}

// ✅ Filter alleen de 5 basis rarities en overige, verwijder Mythic
function filterValidRarities(items) {
    return items.map(item => {
        const validRarities = ["common", "uncommon", "rare", "epic", "legendary"];
        if (!validRarities.includes(item.rarity.value)) {
            item.rarity.value = "other"; // Zet alle overige rarities als "other"
            item.rarity.displayValue = "Overige";
        }
        return item;
    });
}

// ✅ Kleur op basis van rarity
function getRarityColor(rarity) {
    const rarityColors = {
        "common": "#B9B9B9",
        "uncommon": "#4AAE4F",
        "rare": "#3399FF",
        "epic": "#A24EC2",
        "legendary": "#D98A29",
        "other": "#6D6D6D"
    };
    return rarityColors[rarity] || "#6D6D6D"; // Default grijs als er geen match is
}

// ✅ Items tonen in grid + juiste kleur + rarity label + select-knop
function displayItems(items, grid, filter) {
    grid.innerHTML = ''; // Leegmaken van de grid voordat nieuwe items worden toegevoegd

    // Kijken welke rarity is geselecteerd in de filter
    const selectedRarity = filter ? filter.value : '';

    items.forEach(item => {
        if (selectedRarity && item.rarity.value !== selectedRarity) return;

        const rarityColor = getRarityColor(item.rarity.value);
        const rarityName = item.rarity.displayValue || "Onbekend";

        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.style.backgroundColor = rarityColor; // Achtergrondkleur op basis van rarity

        itemCard.innerHTML = `
            <span class="rarity-label">${rarityName}</span>
            <img src="${item.images.icon}" alt="${item.name}">
            <h3>${item.name}</h3>
            <button class="select-item" onclick="selectItem('${item.images.icon}')">+</button>
        `;

        grid.appendChild(itemCard);
    });

    // ✅ Fix om de items correct te tonen in de juiste kolom
    grid.style.display = "flex";
    grid.style.flexDirection = "column";
    grid.style.alignItems = "center";
}

// ✅ Selecteer item en sla op in localStorage
function selectItem(imageUrl) {
    localStorage.setItem(`item${selectedItemSlot}-img-${karakterID}`, imageUrl);
    window.location.href = 'favokarak.html';
}

// ✅ Update filter-kleuren bij selectie
function updateFilterColor(filter) {
    const selectedRarity = filter.value;
    filter.style.backgroundColor = getRarityColor(selectedRarity);
}

// ✅ Event listeners voor filters
if (weaponFilter) {
    weaponFilter.addEventListener('change', function () {
        updateFilterColor(weaponFilter);
        fetchItems();
    });
}
if (emoteFilter) {
    emoteFilter.addEventListener('change', function () {
        updateFilterColor(emoteFilter);
        fetchItems();
    });
}
if (backblingFilter) {
    backblingFilter.addEventListener('change', function () {
        updateFilterColor(backblingFilter);
        fetchItems();
    });
}
// ✅ Functie om een popup te tonen
function showPopup(message) {
    let popupMessage = document.getElementById('popup-message');

    // Als de popup nog niet bestaat, maken we er een aan
    if (!popupMessage) {
        popupMessage = document.createElement('div');
        popupMessage.id = 'popup-message';
        popupMessage.classList.add('popup-message');
        document.body.appendChild(popupMessage);
    }

    popupMessage.textContent = message;
    popupMessage.classList.add('show');

    // Verwijder de popup na 3 seconden
    setTimeout(() => {
        popupMessage.classList.remove('show');
    }, 3000);
}
// Selecteer de info-knop
const infoBtn = document.querySelector('.info-btn');

// Zorg dat de popup alleen verschijnt als je op de info-knop klikt
if (infoBtn) {
    infoBtn.addEventListener('click', () => {
        showPopup("Klik op een item om het toe te voegen aan je favorieten!");
    });
}



fetchItems();

function toggleMenu() {
    document.querySelector(".nav-menu").classList.toggle("show");
}
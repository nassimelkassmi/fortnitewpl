// 🔰 Types voor API-items
type Rarity = {
    value: string;
    displayValue?: string;
};

type Item = {
    id: string;
    name: string;
    type: { value: string };
    rarity: Rarity;
    images: { icon: string };
};

// 🧩 DOM-elementen
const weaponsGrid = document.getElementById('weapons-grid') as HTMLElement;
const emotesGrid = document.getElementById('emotes-grid') as HTMLElement;
const backblingsGrid = document.getElementById('backblings-grid') as HTMLElement;

const weaponFilter = document.getElementById('filter-weapons') as HTMLSelectElement;
const emoteFilter = document.getElementById('filter-emotes') as HTMLSelectElement;
const backblingFilter = document.getElementById('filter-backblings') as HTMLSelectElement;

const selectedItemSlot = localStorage.getItem('selectedItemSlot');
const karakterID = localStorage.getItem('selectedCharacter');

// ✅ Items ophalen van Fortnite API
async function fetchItems(): Promise<void> {
    try {
        const response = await fetch('https://fortnite-api.com/v2/cosmetics/br');
        const data: { data: Item[] } = await response.json();
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

// ✅ Filter enkel geldige rarities (geen "mythic")
function filterValidRarities(items: Item[]): Item[] {
    const validRarities = ["common", "uncommon", "rare", "epic", "legendary"];
    return items.map(item => {
        if (!validRarities.includes(item.rarity.value)) {
            item.rarity.value = "other";
            item.rarity.displayValue = "Overige";
        }
        return item;
    });
}

// ✅ Haal kleur op basis van rarity
function getRarityColor(rarity: string): string {
    const rarityColors: Record<string, string> = {
        "common": "#B9B9B9",
        "uncommon": "#4AAE4F",
        "rare": "#3399FF",
        "epic": "#A24EC2",
        "legendary": "#D98A29",
        "other": "#6D6D6D"
    };
    return rarityColors[rarity] || "#6D6D6D";
}

// ✅ Toon items in de juiste grid
function displayItems(items: Item[], grid: HTMLElement, filter: HTMLSelectElement): void {
    grid.innerHTML = '';
    const selectedRarity = filter ? filter.value : '';

    items.forEach(item => {
        if (selectedRarity && item.rarity.value !== selectedRarity) return;

        const rarityColor = getRarityColor(item.rarity.value);
        const rarityName = item.rarity.displayValue || "Onbekend";

        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.style.backgroundColor = rarityColor;

        itemCard.innerHTML = `
            <span class="rarity-label">${rarityName}</span>
            <img src="${item.images.icon}" alt="${item.name}">
            <h3>${item.name}</h3>
            <button class="select-item" onclick="selectItem('${item.images.icon}')">+</button>
        `;

        grid.appendChild(itemCard);
    });

    grid.style.display = "flex";
    grid.style.flexDirection = "column";
    grid.style.alignItems = "center";
}

// ✅ Selecteer item
function selectItem(imageUrl: string): void {
    if (selectedItemSlot && karakterID) {
        localStorage.setItem(`item${selectedItemSlot}-img-${karakterID}`, imageUrl);
        window.location.href = 'favokarak.html';
    }
}
(window as any).selectItem = selectItem; // Zorg dat onclick werkt

// ✅ Pas kleur aan van filter bij selectie
function updateFilterColor(filter: HTMLSelectElement): void {
    const selectedRarity = filter.value;
    filter.style.backgroundColor = getRarityColor(selectedRarity);
}

// ✅ Event listeners voor filters
if (weaponFilter) {
    weaponFilter.addEventListener('change', () => {
        updateFilterColor(weaponFilter);
        fetchItems();
    });
}
if (emoteFilter) {
    emoteFilter.addEventListener('change', () => {
        updateFilterColor(emoteFilter);
        fetchItems();
    });
}
if (backblingFilter) {
    backblingFilter.addEventListener('change', () => {
        updateFilterColor(backblingFilter);
        fetchItems();
    });
}

// ✅ Popup weergeven
function showPopup(message: string): void {
    let popupMessage = document.getElementById('popup-message') as HTMLElement | null;

    if (!popupMessage) {
        popupMessage = document.createElement('div');
        popupMessage.id = 'popup-message';
        popupMessage.classList.add('popup-message');
        document.body.appendChild(popupMessage);
    }

    popupMessage.textContent = message;
    popupMessage.classList.add('show');

    setTimeout(() => {
        popupMessage?.classList.remove('show');
    }, 3000);
}

// ✅ Info-knop (popup)
const infoBtn = document.querySelector('.info-btn') as HTMLButtonElement | null;
if (infoBtn) {
    infoBtn.addEventListener('click', () => {
        showPopup("Klik op een item om het toe te voegen aan je favorieten!");
    });
}

// ✅ Laad items bij opstart
fetchItems();

// ✅ Menu toggle
function toggleMenu(): void {
    const navMenu = document.querySelector(".nav-menu") as HTMLElement;
    navMenu.classList.toggle("show");
}

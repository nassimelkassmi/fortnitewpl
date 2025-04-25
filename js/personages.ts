






async function removeDuplicatesByImageHash(outfits:FortniteCosmetic[]):Promise<FortniteCosmetic[]> {
    const seenHashes = new Set(); // To track hashes of images we've seen
    const uniqueObjects:FortniteCosmetic[] = [];    // To store objects with unique images

    // Helper function to fetch an image and compute its hash
    async function fetchAndHash(obj:FortniteCosmetic) {
        try {
            // Ensure the object has a valid 'images.icon' property
            if (obj.images && obj.images.icon) {
                const iconUrl = obj.images.icon;

                // Fetch the image as an ArrayBuffer
                const response = await fetch(iconUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.statusText}`);
                }
                const imageData = await response.arrayBuffer();

                // Generate a SHA-256 hash of the image data
                const hashBuffer = await crypto.subtle.digest('SHA-256', imageData);
                const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
                const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join(''); // Convert to hex string

                return { obj, hashHex }; // Return the object and its hash
            }
        } catch (error) {
            console.error(`Error processing object with icon ${obj.images?.icon}:`, error);
        }
        return null; // Return null for invalid or errored objects
    }

    // Fetch and hash all images concurrently
    const results = await Promise.all(outfits.map(obj => fetchAndHash(obj)));

    // Process the results to filter out duplicates
    for (const result of results) {
        if (result && !seenHashes.has(result.hashHex)) {
            seenHashes.add(result.hashHex); // Add the hash to the set
            uniqueObjects.push(result.obj); // Keep the object in the result list
        }
    }

    return uniqueObjects;
}




type favorite = {
    "id":string,
    "itemid_1":string,
    "itemid_2":string,
    "notes":string[]
    "wins":number,
    "losses":number
}

type FortniteCosmetic = {
    id: string;
    name: string;
    description: string;
    type: {
        value: string;
        displayValue: string;
        backendValue: string;
    };
    rarity: {
        value: string;
        displayValue: string;
        backendValue: string;
    };
    series?: {
        value: string;
        colors: string[];
        backendValue: string;
    };
    set?: {
        value: string;
        text: string;
        backendValue: string;
    };
    introduction: {
        chapter: string;
        season: string;
        text: string;
        backendValue: number;
    };
    images: {
        smallIcon: string;
        icon: string;
    };
    metaTags: string[];
    added: string;
};



function if_other_rarity(rarity:string) {
    const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    return !validRarities.includes(rarity)
}


async function request(url:string, data:any, mode:string) {
    
    let response:Response | null = null
    
    if ("GET" == mode) {
        response = await fetch(url, {
            method: mode, // HTTP method
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' 
        });
    }
    else{
        response = await fetch(url, {
            method: mode, // HTTP method
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(data), 
            credentials: 'include' 
        });
    }
    return response
}




async function request_json(url:string, data:any, mode:string, key:string) {
    return (await ((await request(url, data, mode)).json()))[key]
}


function getRarityClass(rarity:string) {
    switch (rarity.toLowerCase()) {
        case 'common': return 'rarity-common';
        case 'uncommon': return 'rarity-uncommon';
        case 'rare': return 'rarity-rare';
        case 'epic': return 'rarity-epic';
        case 'legendary': return 'rarity-legendary';
        default: return 'rarity-other';
    }
}



function select_by_id_and_Tag<Tag extends keyof HTMLElementTagNameMap>(tagname:Tag, id:string): HTMLElementTagNameMap[Tag] {


    
    const elements:HTMLCollectionOf<HTMLElementTagNameMap[Tag]> =  document.getElementsByTagName(tagname)

    let result:HTMLElementTagNameMap[Tag] | null = null; 

    
    for (let i = 0; i < elements.length; i++) {
        if (elements.item(i)?.id == id ) {
            result = elements.item(i)
        }
    }

    if (!result) {

        console.log("tagname is ", tagname, " id is ", id);
        
        throw new Error("this did not work");
        
    }else{
        return result
    }
}



const searchInput    =  select_by_id_and_Tag("input", "search")
const filterSelect   =  select_by_id_and_Tag("select", "filter_rarity")
//const infoBtn        =  select_by_id_and_Tag("button", "info_btn")
//const popupMessage   =  select_by_id_and_Tag("div", "popup-message")
const characters_grid = select_by_id_and_Tag("section", "characters_grid")

const back_arrow    = select_by_id_and_Tag("button", "back_arrow")
const forward_arrow = select_by_id_and_Tag("button", "forward_arrow")



let allOutfits:FortniteCosmetic[] = []

let current_outfits: FortniteCosmetic[] = []


fetchOutfits().then(() => {
    displayCharacters(allOutfits)
})

async function fetchOutfits() {
    
    try {
        const response = await fetch('https://fortnite-api.com/v2/cosmetics/br');
        const data = await response.json();
        if (!data.data) return;
        const outfits_arr:FortniteCosmetic[] = data.data.filter( (item:FortniteCosmetic)=> item.type.value === 'outfit' && item.introduction != undefined && item.images.icon != undefined );

        //allOutfits = await removeDuplicatesByImageHash(outfits_arr)

        allOutfits = outfits_arr
        current_outfits = outfits_arr

        total_characters = allOutfits.length
        
        // // Save original list for filtering
        // allOutfits = outfits_arr;
        
    } catch (error) {
        console.error('Fout bij het ophalen van outfits:', error);
    }
}


function display_resized() {
    char_index = clamp_index_by_char_list(char_index, 0)
    display_filterd()
}

window.addEventListener("resize", display_resized)





let char_amount = 0

let char_index = 0



function recalc_char_amount() {
    let column_length = Math.floor( (characters_grid.clientHeight - 40  )  / 210 ) 
    let row_length    = Math.floor( (characters_grid.clientWidth - 90 ) / 210  )
    char_amount = row_length * column_length // total amount of characters to display
    console.log("column_length", column_length, "row_length", row_length);
    
}

async function displayCharacters(outfits:FortniteCosmetic[], index:number = 0) {
    characters_grid.innerHTML = ''; //reset grid content
    // let favorites:favorite[] = await request_json("/get_favoriet", "", "GET", "id")

    let favoriet:favorite[] = []

     // char_amount = total amount of characters to display
    recalc_char_amount()

    let display_outfits = outfits.slice(index, index + char_amount)

    
    display_outfits.forEach(displayCharacter)

    function displayCharacter(outfit:FortniteCosmetic) {

        let rarityClass = getRarityClass(outfit.rarity.value);

        const outfitCard = document.createElement('div');

        outfitCard.className = `character-card ${rarityClass}`;

        const isFavorite = favoriet.filter( favorit => {return favorit.id == outfit.id });
        const starVisibility = isFavorite ? 'block' : 'none';

        outfitCard.innerHTML  = `
            <span class="favorite-star" style="display: ${starVisibility};">⭐</span>
            <p class="rarity-label">${outfit.rarity.displayValue || 'Overige'}</p>
            <img src="${outfit.images.icon}" alt="${outfit.name}">
            <h3>${outfit.name}</h3>`;


        //add event voor als de gebruiker op dit karakter clickt word die naar de 
        // karakter.html pagina gestuurd en wordt de juiste karakter gezet in localstorage
        outfitCard.addEventListener('click', async () => {
        
            localStorage.setItem('selectedCharacter', outfit.id); 
            const karakterID = localStorage.getItem('selectedCharacter');

            //change page based on if current character is favoriet
            window.location.href = isFavorite ? 'favokarak.html' :  'karakter.html'
        });

        characters_grid.appendChild(outfitCard);
    }

}

function filter_characters() {
    const searchText = searchInput.value.toLowerCase();
    const selectedRarity = filterSelect.value;

    function filter_by_rarity(outfit:FortniteCosmetic) {
        //check if the current outfit contains search term from user search
        const matchesSearch = outfit.name.toLowerCase().includes(searchText);

        if (selectedRarity == "") { //in case no rarity is selected
            return matchesSearch
        }

        let outfit_rarity = outfit.rarity.value.toLowerCase();
        
        let match_rarity = outfit_rarity == selectedRarity

        //if selected rarity filter is other, check if outfit rarity is also other
        if (if_other_rarity(selectedRarity)) {
            return matchesSearch && if_other_rarity(outfit_rarity)
        }

        return matchesSearch && match_rarity
    }

    const filtered = allOutfits.filter(filter_by_rarity);
    return filtered
    // total_characters = filtered.length
    // current_outfits = filtered
    // displayCharacters(current_outfits);
}







async function previous_page() {
    char_index = clamp_index_by_char_list(char_index, -char_amount)
    console.log(" next index is ", char_index, " current amount ", total_characters, "char amount", char_amount);
    display_filterd()
}

back_arrow.addEventListener("click", previous_page)

async function next_page() {
    char_index = clamp_index_by_char_list(char_index, char_amount)


    console.log("next page next index is ", char_index, " current amount ", total_characters, "char amount", char_amount);
    
    display_filterd()

}
forward_arrow.addEventListener("click", next_page)


function clamp_index_by_char_list(index:number, offset:number) {
    console.log("index is ", index, "offset is ", offset);
    
    //if the rarity filter changed start ate 0
    let new_rarity = searchInput.value.toLowerCase()

    if (current_rarity != new_rarity) {
        current_rarity = new_rarity
        return 0
    }
    total_characters = filter_characters().length

    recalc_char_amount()
    
    let last_possible_index = total_characters - char_amount

    if (index + offset < 0) {
        return 0
    }
    if (index + offset > last_possible_index) {
        console.log("hello", last_possible_index);
        
        return last_possible_index
    }
    console.log("hellono");
    return index + offset
}


let current_rarity = searchInput.value.toLowerCase();
let total_characters = 0



function display_filterd() {
    displayCharacters(filter_characters(), char_index)
}


searchInput.addEventListener('input', display_filterd);
filterSelect.addEventListener('change', display_filterd);




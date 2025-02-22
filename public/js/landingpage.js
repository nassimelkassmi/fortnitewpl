//de melding tag variable houdt en kopie van de html div met melding class
//dit zorgt ervoor dat we gewoon het zelfde html element kunnen gebruiken om op het scherm te zetten
let melding_tag = null;
let body = document.getElementsByTagName("body")[0];
//dit houdt bij de levenstijd van de melding, dit wordt geupdate naar het momenteel tijdstip elke keer
//wanner en nieuwe melding wordt gecreerd, zo dat wanner je nieuwe meldingen creert, het niet te vroeg wordt verwijderd 
let melding_tag_time = 0;
//hoelang gewacht wordt voor de melding wordt verwijderd in miliseconden
const melding_decay = 3000;
//hoelang wordt gewacht om de fade_out classe bijtevoegen om de melding weg te laten vegen
const fade_out_timer = 1000;
//haalt de melding structuur van de html
function get_melding_tag_structure() {
    let melding_tag_real = document.getElementsByClassName("melding")[0];
    melding_tag = melding_tag_real.cloneNode(true);
    melding_tag_real.remove();
}
//gaat de get_melding_tag_structure() functie bellen wanner de website is geladen
document.addEventListener('DOMContentLoaded', get_melding_tag_structure, false);
//creert melding wanner de gebruiken op en knop drukt, neemt het bericht van de melding als parameter
function melding(bericht) {
    //checkt of we de melding tag structuur hebben opgeslaagt
    if (melding_tag !== null) {
        //zet de melding tag in de html pagina
        body.appendChild(melding_tag);
        //zet het tijdstip van de creatie van de melding
        melding_tag_time = new Date().getTime();
        //stopt de fade_out animatie door het te verwijderen
        melding_tag.classList.remove("fade_out");
        //start de melding animatie, door het bijtevoegen aan de classen lijst
        melding_tag.classList.add("melding");
        //start en timer wanner de fade_out animatie moet bijgevoegd worden
        setTimeout(start_fadeout, 1000, melding_tag);
        //start en timer wanner de melding moet verwijderd worden
        setTimeout(del_old_tag, melding_decay, melding_tag);
        //haalt de div die het bericht van de melding bijhoudt
        let text_div = melding_tag?.getElementsByClassName("melding_text")[0]?.children[1];
        //checkt of de text div bestaat
        if (text_div != undefined) {
            //zet het bericht van de melding
            text_div.textContent = bericht;
        }
    }
}
//verwijderd de melding wanner er op het x icon wordt gedrukt
function delete_melding(tag) {
    //since het verwijder knop, twee niveus lager zit in de html, moeten we twee keer kijken naar wie de ouder element is
    let parent = tag.parentElement?.parentElement;
    //verwijderd element
    parent?.remove();
}
//verwijderd melding wanner het te oud is
function del_old_tag(tag) {
    //checkt of het tijdstip van de creatie van de melding plus de tijd die het mag bestaan lager is
    //dan het momenteele tijdstip
    if (melding_tag_time + melding_decay < new Date().getTime()) {
        if (tag !== null) {
            //reset de class lijst
            tag.classList.value = "";
            //verwijdert de melding
            tag.remove();
        }
    }
}
//start de fade_out animatie
async function start_fadeout(tag) {
    //checkt of het tijd is om de fade_out animatie te starten
    if (melding_tag_time + fade_out_timer < new Date().getTime()) {
        tag.classList.add("fade_out");
    }
}
export {};

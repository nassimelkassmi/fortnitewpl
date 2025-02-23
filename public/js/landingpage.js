"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function refresh_access_token() {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield request("http://localhost:5000/refresh", "", "GET", "");
        if (response.ok) {
            let body = yield response.json();
            accesstoken = body["accesstoken"];
        }
        if (!accesstoken) {
            return false;
        }
        else {
            return true;
        }
    });
}
function get_melding_tag_structure() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let melding_tag_real = document.getElementsByClassName("melding")[0];
        melding_tag = melding_tag_real.cloneNode(true);
        melding_tag_real.remove();
        let if_logged = yield refresh_access_token();
        if (if_logged) {
            (_a = document.getElementById("login_register")) === null || _a === void 0 ? void 0 : _a.classList.add("invis");
            let span_naam = document.getElementById("profiel_name");
            let div_naam = document.getElementById("profiel");
            let dict_uis = yield (yield request("http://localhost:5000/username", "", "GET", accesstoken)).json();
            let username = dict_uis["username"];
            if (username) {
                console.log(username);
                div_naam.classList.remove("invis");
                span_naam.innerText = username;
            }
        }
    });
}
let accesstoken = "";
//gaat de get_melding_tag_structure() functie bellen wanner de website is geladen
document.addEventListener('DOMContentLoaded', get_melding_tag_structure, false);
//creert melding wanner de gebruiken op en knop drukt, neemt het bericht van de melding als parameter
function melding(bericht) {
    var _a;
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
        let text_div = (_a = melding_tag === null || melding_tag === void 0 ? void 0 : melding_tag.getElementsByClassName("melding_text")[0]) === null || _a === void 0 ? void 0 : _a.children[1];
        //checkt of de text div bestaat
        if (text_div != undefined) {
            //zet het bericht van de melding
            text_div.textContent = bericht;
        }
    }
}
//verwijderd de melding wanner er op het x icon wordt gedrukt
function delete_melding(tag) {
    var _a;
    //since het verwijder knop, twee niveus lager zit in de html, moeten we twee keer kijken naar wie de ouder element is
    let parent = (_a = tag.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
    //verwijderd element
    parent === null || parent === void 0 ? void 0 : parent.remove();
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
function start_fadeout(tag) {
    return __awaiter(this, void 0, void 0, function* () {
        //checkt of het tijd is om de fade_out animatie te starten
        if (melding_tag_time + fade_out_timer < new Date().getTime()) {
            tag.classList.add("fade_out");
        }
    });
}
function if_logged(text) { if_logged2(text); }
function if_logged2(text) {
    return __awaiter(this, void 0, void 0, function* () {
        let if_logged = false;
        if_logged = yield refresh_access_token();
        console.log(if_logged);
        if (if_logged) {
            window.location.href = "personages.html";
        }
        else {
            melding(text);
        }
    });
}
function logout() {
    console.log("some");
    yoma();
}
function yoma() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("wad");
        let some = yield request("http://localhost:5000/logout", "", "GET", accesstoken);
        console.log("wad2");
        accesstoken = "";
        // try
        // let dict_uis = await (await request("http://localhost:5000/username", "", "GET",accesstoken)).json()
        // let username = dict_uis["username"]
        // console.log(some.status);
        // console.log(username);
        window.location.reload();
    });
}
function request(url, data, mode, token) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = undefined;
        if ("GET" == mode) {
            response = yield fetch(url, {
                method: mode, // HTTP method
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
        }
        else {
            response = yield fetch(url, {
                method: mode, // HTTP method
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });
        }
        return response;
    });
}

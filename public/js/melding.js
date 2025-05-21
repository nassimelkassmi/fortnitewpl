"use strict";
let melding_tag = null;
const body = document.getElementsByTagName("body")[0];
let melding_tag_time = 0;
const melding_decay = 3000;
const fade_out_timer = 1000;
function get_melding_tag_structure() {
    const melding_tag_real = document.getElementsByClassName("melding")[0];
    melding_tag = melding_tag_real.cloneNode(true);
    melding_tag_real.remove();
}
document.addEventListener('DOMContentLoaded', get_melding_tag_structure, false);
function melding(bericht) {
    if (melding_tag !== null) {
        body.appendChild(melding_tag);
        melding_tag_time = new Date().getTime();
        melding_tag.classList.remove("fade_out");
        melding_tag.classList.add("melding");
        setTimeout(() => start_fadeout(melding_tag), 1000);
        setTimeout(() => del_old_tag(melding_tag), melding_decay);
        const text_div = melding_tag.getElementsByClassName("melding_text")[0]?.children[1];
        if (text_div) {
            text_div.textContent = bericht;
        }
    }
}
function delete_melding(tag) {
    const parent = tag.parentElement?.parentElement;
    parent?.remove();
}
function del_old_tag(tag) {
    if (melding_tag_time + melding_decay < new Date().getTime()) {
        tag.classList.value = "";
        tag.remove();
    }
}
async function start_fadeout(tag) {
    if (melding_tag_time + fade_out_timer < new Date().getTime()) {
        tag.classList.add("fade_out");
    }
}

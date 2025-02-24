let melding_tag = null;
let body = document.getElementsByTagName("body")[0];
let melding_tag_time = 0;
const melding_decay = 3000;
function get_melding_tag_structure() {
    let melding_tag_real = document.getElementsByClassName("geen_toegang")[0];
    melding_tag = melding_tag_real.cloneNode(true);
    melding_tag_real.remove();
    // body.appendChild(melding_tag)
    // console.log(melding_tag);
}
document.addEventListener('DOMContentLoaded', get_melding_tag_structure, false);
function geen_toegang() {
    if (melding_tag !== null) {
        melding_tag.className = '';
        melding_tag.classList.add("geen_toegang");
        body.appendChild(melding_tag);
        melding_tag_time = new Date().getTime();
        get_rid_of_tag(melding_tag);
    }
}
function delete_melding(tag) {
    let parent = tag.parentElement?.parentElement;
    parent?.remove();
}
function del_old_tag(tag) {
    if (melding_tag_time + melding_decay < new Date().getTime()) {
        console.log("deleted");
        tag.remove();
        if (tag !== null) {
            tag.remove();
        }
    }
}
async function get_rid_of_tag(tag) {
    setTimeout((tag) => { tag.classList.add("fade_out"); }, 1000, tag);
    setTimeout(del_old_tag, melding_decay, tag);
}
async function test(tag) {
    tag.classList.add("fade_out");
}
export {};

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
function melding(bericht) {
    var _a;
    if (melding_tag !== null) {
        melding_tag.classList.add("geen_toegang");
        body.appendChild(melding_tag);
        melding_tag_time = new Date().getTime();
        get_rid_of_tag(melding_tag);
        let text_div = (_a = melding_tag === null || melding_tag === void 0 ? void 0 : melding_tag.getElementsByClassName("melding")[0]) === null || _a === void 0 ? void 0 : _a.children[1];
        if (text_div != undefined) {
            text_div.textContent = bericht;
        }
    }
}
function delete_melding(tag) {
    var _a;
    let parent = (_a = tag.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
    parent === null || parent === void 0 ? void 0 : parent.remove();
}
function del_old_tag(tag) {
    if (melding_tag_time + melding_decay < new Date().getTime()) {
        console.log("deleted");
        tag.remove();
        if (tag !== null) {
            tag.classList.value = "";
            tag.remove();
        }
    }
}
function get_rid_of_tag(tag) {
    return __awaiter(this, void 0, void 0, function* () {
        setTimeout((tag) => { tag.classList.add("fade_out"); }, 1000, tag);
        setTimeout(del_old_tag, melding_decay, tag);
    });
}

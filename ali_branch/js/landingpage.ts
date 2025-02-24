
let melding_tag:HTMLDivElement | null = null;

let body = document.getElementsByTagName("body")[0]

let melding_tag_time = 0

const melding_decay = 3000

function get_melding_tag_structure() {
    let melding_tag_real = document.getElementsByClassName("geen_toegang")[0]
    melding_tag = (melding_tag_real.cloneNode(true) as HTMLDivElement)
    melding_tag_real.remove()
    // body.appendChild(melding_tag)
    // console.log(melding_tag);
}


document.addEventListener('DOMContentLoaded', get_melding_tag_structure, false);

function geen_toegang() {
    if (melding_tag !== null) {
        melding_tag.className = ''
        melding_tag.classList.add("geen_toegang")
        body.appendChild(melding_tag)
        melding_tag_time = new Date().getTime()
        get_rid_of_tag((melding_tag as HTMLDivElement))
    }
}

function delete_melding(tag:HTMLButtonElement) {
    let parent = tag.parentElement?.parentElement
    parent?.remove()
}

function del_old_tag(tag:HTMLDivElement) {
    if (melding_tag_time + melding_decay < new Date().getTime()) {   
        console.log("deleted");
        tag.remove()
        if (tag !== null) {
            tag.remove()
        }
    }
}

async function get_rid_of_tag(tag:HTMLDivElement) {
    
    setTimeout((tag:HTMLDivElement) => {tag.classList.add("fade_out")}, 1000, tag )
    setTimeout(del_old_tag, melding_decay, tag);

  }

async function test(tag:HTMLDivElement) {
    tag.classList.add("fade_out")
  }
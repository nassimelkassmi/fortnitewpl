
let melding_tag:Node | null = null;

let body = document.getElementsByTagName("body")[0]

function get_melding_tag_structure() {
    let melding_tag_real = document.getElementsByClassName("geen_toegang")[0]
    melding_tag = (melding_tag_real.cloneNode(true))
    melding_tag_real.remove()
    // body.appendChild(melding_tag)
    // console.log(melding_tag);
}


document.addEventListener('DOMContentLoaded', get_melding_tag_structure, false);

function geen_toegang() {
    if (melding_tag !== null) {
        body.appendChild(melding_tag)
        get_rid_of_tag((melding_tag as HTMLDivElement))
    }
}

function delete_melding(tag:HTMLButtonElement) {
    let parent = tag.parentElement?.parentElement
    parent?.remove()
}

function tes3t(tag:HTMLDivElement) {
    console.log(tag);
    tag.remove()
    if (tag !== null) {
        tag.remove()
    }
}

async function get_rid_of_tag(tag:HTMLDivElement) {
    tag.classList.add("fade_out")
    

    console.log(tag);
    setTimeout(tes3t, 3000, tag);

  }

async function test(tag:HTMLDivElement) {
    tag.classList.add("fade_out")
  }
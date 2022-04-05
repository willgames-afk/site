'use strict'

const key = "key 553e1232e2698fb1fd78367a40b6af3b"
const baseURL = "https://rebrickable.com/api/v3/lego/"
const modes = ["nameSearch","idSearch"]


function getPartJSON(url,onerror=()=>{},onload=()=>{}) {
    var req = new XMLHttpRequest();

    req.addEventListener("error",onerror);
    req.addEventListener("readystatechange", ()=>{
        if (req.readyState === XMLHttpRequest.DONE) {

            const status = req.status;
            if (status === 0 || (status >= 200 && status < 400)) { //Make sure there's no error
                //Success!
                try {
                    onload(JSON.parse(req.responseText));
                } catch (e) {
                    onerror(e);
                }
            } else {
                onerror(req.statusText);
            }
        }
    })

    req.open("GET",baseURL + url);
    req.setRequestHeader("Authorization",key);


    req.send();
}

function getPart(partNum, onerror, onload) {
    getPartJSON("parts/"+partNum,onerror,onload);
}

function getParts(partNums,onerror,onload) {
    getPartJSON(baseURL+"parts/?part_nums="+partNums.join(",")+"&inc_part_details=1",onerror,onload)
}

function loadImg(url) {
    document.getElementById('partImg').src = url;
}

function run() {
    var partID = document.getElementById("partID").value;
    console.log(partID);

    getPart(partID, (e) => {
        console.log("Error Occured. \n" + e);
    }, (partData) => {
        console.log(partData);
        loadImg(partData.part_img_url)
    })
}

function newModeSelected() {
    var mode = document.getElementById("modeSelector").value;
    for (var m of modes) {
        if (mode == m) {
            console.log("unhiding", m);
            document.getElementById(m).removeAttribute("hidden");
        } else {
            console.log("hiding", m);
            document.getElementById(m).setAttribute("hidden","");
        }
    }
}

function searchParts(partname) {
    
}

function textChange(){
    var cq = document.getElementById("currentQuery");
    var input = document.getElementById("partName");
    cq.innerHTML = input.value;
}
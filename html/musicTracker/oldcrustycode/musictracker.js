import { TrackElement, NoteElement, formatLikeNote } from "./DOM.js";
const baseElement = document.getElementById("musictracker");

class Track extends TrackElement {
    constructor(noteList, instrumentConfig) {
        var noteElements = [];
        for (var i = 0; i < noteList.length; i++) {
            noteElements.push(new NoteElement(formatLikeNote(noteList[i].note)));
        }

        super(noteElements);

        this.noteElements = noteElements;
        this.notes = noteList;

        this.instrument = new Tone.Synth(instrumentConfig).toDestination();
        var part = new Tone.Part(
            function (synth) {
                return function (time, note) {
					console.log(time)
                    synth.triggerAttackRelease(note.note, note.duration, time);
                }
            }(this.instrument),
            this.notes
        ) //Start it with Tone.Trasport.start();
		this.tonePart = part;
		console.log(this.tonePart)
        this.length = this.notes.length;
        console.log(this.tonePart._events)

		this.start = this.tonePart.start.bind(this.tonePart);
		console.log(this.tonePart.start)
    }
}

/*
TO DO:
Change all refrences to Duration to Effect, I changed things
Add "Stop Note" Thing.

*/

var menu = {};

//set up container object
menu.container = document.createElement('div');
menu.container.setAttribute('class', 'menu');

//playbutton config
menu.playbutton = document.createElement('button');
menu.playbutton.innerText = 'Play';

var k = new Track([
    { note: 'C4', time: 0, duration: "4n" },
    { note: 'D4', time: 0.5, duration: "4n" }
], {})

function playAll(time) {
	console.log(k);
	console.log(k.start)
	k.start(time)
}
playAll = playAll.bind(this)

menu.playbutton.addEventListener("click", async function () {
    await Tone.start()
    if (Tone.Transport.state == 'started') {
        Tone.Transport.stop();
		playAll(0);
        menu.pauseButton.hidden = true;
        menu.playbutton.innerText = 'Play';
    } else {
        Tone.Transport.start();
        menu.pauseButton.hidden = false;
        menu.playbutton.innerText = 'Stop';
    }
}.bind(this));

menu.pauseButton = document.createElement('button');
menu.pauseButton.hidden = true;
menu.pauseButton.innerText = "Pause";
menu.pauseButton.addEventListener("click",function(){
    if (Tone.Transport.state == 'started') {
        Tone.Transport.pause();
    }
}.bind(this))
menu.container.appendChild(menu.pauseButton)

menu.container.appendChild(menu.playbutton);

menu.addTrackButton = document.createElement('button');
menu.addTrackButton.innerText = 'Add Track';
menu.addTrackButton.addEventListener("click", function () {

})
Tone.Transport.on("stop",(args)=>{
	console.log("STOPPED");
})

menu.container.appendChild(menu.addTrackButton);

baseElement.appendChild(menu.container);


baseElement.appendChild(k)

Tone.Transport.start();

/*
//init(document.getElementById('musictracker'))
class MusicTracker {
    constructor(element) {
        this.keycount = 0;
        this.container = element;
        this.currentSong = new Song({
            tracks: {
                Square_1: {
                    instrument: {
                        oscillator: {
                            type: 'square',
                            portamento: 0,
                            volume: -20
                        },
                        envelope: {
                            attack: 0,
                            decay: 0,
                            sustain: 1,
                            release: 0
                        }
                    },
                    notes: [
                        { note: 'C4', time: 0, duration:'4n' },
                    ]
                },
                Triangle_1: {
                    instrument: {
                        oscillator: {
                            type: 'triangle',
                            portamento: 0,
                            volume: -20
                        },
                        envelope: {
                            attack: 0,
                            decay: 0,
                            sustain: 1,
                            release: 0,
                        }
                    },
                    notes: [
                        { note: 'C4', time: 0, duration:'4n' },
                    ]
                }
            }
        });

        //We've launched, so no more launch button
        if (document.getElementById('launchbutton')) {
            document.getElementById('launchbutton').remove();
        }
        console.log(this.currentSong);

        //create menu object
        this.menu = {};

        //set up container object
        this.menu.container = document.createElement('div');
        this.menu.container.setAttribute('class', 'menu');

        //playbutton config
        this.menu.playbutton = document.createElement('button');
        this.menu.playbutton.innerText = 'Play';

        this.menu.playbutton.addEventListener("click", function () {
            if (Tone.Transport.state == 'started') {
                Tone.Transport.stop();
                this.menu.playbutton.innerHTML = 'play';
            } else {
                Tone.Transport.start();
                this.menu.playbutton.innerHTML = 'stop';
            }
        }.bind(this))
        this.menu.container.appendChild(this.menu.playbutton);

        this.menu.addTrackButton = document.createElement('button');
        this.menu.addTrackButton.innerText = 'Add Track';
        this.menu.addTrackButton.addEventListener("click", function () {

        })

        this.container.appendChild(this.menu.container);


        for (var currentTrack in this.currentSong.tracks) {

            var track = document.createElement("ol")
            track.setAttribute("track", currentTrack)
            track.setAttribute("class", "track")
            element.appendChild(track)

            var instName = document.createElement("p");
            instName.innerText = currentTrack.replace('_', ' ')
            track.appendChild(instName);

            console.log(this.currentSong.tracks[currentTrack])

            //for (var i = 0; i < this.currentSong.tracks[currentTrack].data.length; i++) {

                //Make a span element to contain note data
               // this.addNote(currentTrack, i,this.currentSong.tracks[currentTrack].data[i].note)
           //}
            this.currentSong.tracks[currentTrack].iterateNotes((note)=>{
                this.addNote(currentTrack,)
            })
            track.style.verticalAlign = 'top'
        }
        document.addEventListener('keydown', this.keydown.bind(this))
    }
    hover(e) {
        if (this.getAttribute("status") == 'deselected') {
            this.setAttribute("status", 'hovering')
            this.style.backgroundColor = config.hoverTextBackgroundColor
        }
    }
    select(e) {
        var element = e.srcElement
        var prevElement = document.querySelectorAll('[status="selected"]')[0]
        if (prevElement == this) return;
        if (prevElement) {
            console.log(prevElement)
            console.log(this.keycount)
            if (prevElement.getAttribute('class') == 'note' && ((this.keycount <= 3) && (this.keycount > 0)) && !(prevElement.innerHTML == '---')) {
                console.log('Incomplete!');
                prevElement.innerHTML = '---';
            }
            prevElement.setAttribute("status", 'deselected')
            prevElement.style = null;
        }
        this.keycount = 0;
        element.style.backgroundColor = config.selectTextBackgroundColor
        element.style.borderBottom = "thick solid #0000FF";
        element.setAttribute("status", 'selected')
    }
    selectElement(e) {
        var prevElement = document.querySelectorAll('[status="selected"]')[0]
        if (prevElement == e) return;
        this.keycount = 0;
        if (prevElement) {

            prevElement.setAttribute("status", 'deselected')
            prevElement.style = null;
        }
        e.style.backgroundColor = config.selectTextBackgroundColor
        e.style.borderBottom = "thick solid #0000FF";
        e.setAttribute("status", "selected")
    }
    nothover(e) {
        if (!(this.getAttribute("status") == 'selected')) {
            this.style = null;
            this.setAttribute("status", 'deselected')
        }
    }
    keydown(e) {
        var element = document.querySelectorAll('[status="selected"]')[0]
        console.log(e.key)

        if (element) {
            if (element.getAttribute('class') == 'note') {
                if (this.keycount == 0) { //Key 1 is the key, ABCDEF or G
                    if (/[a-gA-G]/.test(e.key) && e.key.length == 1) {
                        element.innerHTML = e.key.toUpperCase() + '--';
                        this.keycount++;
                        /*var durEl = document.querySelector('[index ="' + element.getAttribute('index') + '"][class="duration"]');
                        if (durEl.innerHTML == '--') {
                            durEl.innerHTML = '01';
                        }
                    } else if (e.key == 'Backspace' || e.key == ' ' || e.key == '-') {
                        element.innerHTML = '---'
                        this.completeNote(element)
                    }
                } else if (this.keycount == 1) {
                    if (/[# -]/.test(e.key)) { //Key 2 is wether it's sharp or not (No flats supported yet)
                        if (e.key == '#') {
                            element.innerHTML = element.innerHTML[0] + '#-';
                        } else {
                            element.innerHTML = element.innerHTML[0] + '--';
                        }
                        this.keycount++;
                    } else if (/[0-9]/.test(e.key)) { //If user types a number, skip ahead to Key 3
                        element.innerHTML = element.innerHTML[0] + '-' + e.key;
                        this.completeNote(element)
                    }
                } else if (this.keycount == 2) {
                    if (/[0-9]/.test(e.key)) { //Key 3 is the Octave, 12345678 or 9
                        element.innerHTML = element.innerHTML.slice(0, 2) + e.key;
                        this.completeNote(element)
                    }
                }
            } else if (element.getAttribute('class') == 'duration') {
                if (this.keycount == 0) { // digit one of Duration (how many beats the not should play), 12345678 or 9.
                    if (/[0-9]/.test(e.key) && e.key.length == 1) {
                        element.innerHTML = '0' + e.key;
                        this.keycount++;
                    } else if (e.key == 'Backspace') {
                        element.innerHTML = '--'
                        this.keycount = 2;
                    }
                } else if (this.keycount == 1) {
                    if (/[0-9]/.test(e.key) && e.key.length == 1) { //digit 2 of Duration
                        element.innerHTML = element.innerHTML[1] + e.key;
                        this.completeDur(element)
                    } else if (e.key == ' ' || e.key == 'Enter') {
                        element.innerHTML = '0' + element.innerHTML[1]
                        this.completeDur(element);
                    }
                }
            }
        }
    }
    completeDur(element) {
        //Runs when the duration of a note is entered
        this.keycount = 0;
        var nextSelected = document.querySelector('[index ="' + (parseInt(element.getAttribute('index'), 10) + 1).toString(10) + '"][class="duration"]');
        console.log(element.getAttribute('index'))
        this.selectElement(nextSelected);
    }
    completeNote(element) {
        //Runs when a note is entered
        this.keycount = 0;
        var nextSelected = document.querySelector('[index ="' + (parseInt(element.getAttribute('index'), 10) + 1).toString(10) + '"][class="note"][track="'+element.getAttribute('track')+'"]');
        if (!nextSelected) {
            nextSelected = this.addNote(element.getAttribute("track"), false, "---", true)
        }
        console.log(element.getAttribute('index'))
        this.selectElement(nextSelected);
        console.log(element)
        console.log("Writing "+element.innerHTML.replaceAll('-',""))
        this.currentSong.tracks[element.getAttribute('track')].data[element.getAttribute('index')].note = element.innerHTML.replaceAll('-',"")
    }
    pad(string, padlen, padchar = " ", padfromright = false) {
        if (string.length >= padlen) return string;
        var out = string;
        if (padfromright) {
            while (out.length < padlen) {
                out = out + padchar
            }
        } else {
            while (out.length < padlen) {
                out = padchar + out;
            }
        }
        return out;
    }
    addNote(track, index, note, addToPlayableTrack=false) {
        console.log(this.currentSong.tracks[track])

        var i = index;
        if (addToPlayableTrack) {
            if (!i) {
                i = this.currentSong.tracks[track].data.length;
            }
            if (note) {
                this.currentSong.tracks[track].data.push({ "note": note.replaceAll('-',""), "time": Math.floor(i/4)+":"+i%4, "duration":'4n' })
            } else {
                this.currentSong.tracks[track].data.push({ /*"note": '---', "time": Math.floor(i/4)+":"+i%4, "duration":'4n' })
            }
        }
        if (!i) {
            i = this.currentSong.tracks[track].data.length-1;
        }

        var noteElement = document.createElement("span")
        if (note) {
            if (note.length == 2) {
                noteElement.innerHTML = note[0] + '-' + note[1]
            } else {
                noteElement.innerHTML = note
            }
        } else {
            noteElement.innerHTML = "---"
        }
        //Set up event listeners to allow for editing
        noteElement.addEventListener('mouseover', this.hover);
        noteElement.addEventListener('click', this.select);
        noteElement.addEventListener('mouseout', this.nothover);

        //Set up attrubutes
        noteElement.setAttribute("status", 'deselected')
        noteElement.setAttribute("index", i.toString(10))
        noteElement.setAttribute("track", track)
        noteElement.setAttribute('class', 'note')

        //add to a list element
        var li = document.createElement('li')
        li.appendChild(noteElement)

        //Give it a number (label)
        var label = document.createElement("p")
        label.innerText = this.pad(i.toString(16), 2, '0') + ' ';
        li.insertBefore(label, noteElement)

        var trackElement = document.querySelector('[track=' + track + '][class="track"]');
        trackElement.appendChild(li);

        return noteElement
    }
}

function onstart() {
    var launchbutton = document.createElement('button');
    launchbutton.id = 'launchbutton';
    launchbutton.innerText = 'Launch!'
    launchbutton.addEventListener('click', (e) => {
        //Yes, I'm defining this globally.
        window.musicTracker = new MusicTracker(document.getElementById('musictracker'));
    })
    document.body.appendChild(launchbutton);
};
window.addEventListener('load', onstart);*/
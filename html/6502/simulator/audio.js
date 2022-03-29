const sq1 = [
    { 'time':  0,       'note': 'A#4', 'duration': '2n+8n'  },
    { 'time': '0:2.5',  'note': 'F4',  'duration': '8n'     },
    { 'time': '0:3',    'note': 'F4',  'duration': '8n'     },
    { 'time': '0:3.5',  'note': 'A#4', 'duration': '8n'     },
    { 'time': '0:4',    'note': 'G#4', 'duration': '16n'    },
    { 'time': '0:4.25', 'note': 'F#4', 'duration': '16n'    },
    { 'time': '0:4.5',  'note': 'G#4', 'duration': '2n+4n.' },
    { 'time': '2:0',    'note': 'A#4', 'duration': '2n+8n'  },
    { 'time': '2:2.5',  'note': 'F#4', 'duration': '8n'     },
    { 'time': '2:3',    'note': 'F#4', 'duration': '8n'     },
    { 'time': '2:3.5',  'note': 'A#4', 'duration': '8n'     },
    { 'time': '2:4',    'note': 'A4',  'duration': '16n'    },
    { 'time': '2:4.25', 'note': 'G4',  'duration': '16n'    },
    { 'time': '2:4.5',  'note': 'A4',  'duration': '2n+4n.' },
]
const tri1 = [
    { 'time':  0,       'note': 'A#2', 'duration': '4n'     },
    { 'time': '0:1',    'note': 'F3',  'duration': '4n'     },
    { 'time': '0:2',    'note': 'A#3', 'duration': '2n'     },
    { 'time': '1:0',    'note': 'G#2', 'duration': '4n'     },
    { 'time': '1:1',    'note': 'D#3', 'duration': '4n'     },
    { 'time': '1:2',    'note': 'G#3', 'duration': '2n'     },
    { 'time': '2:0',    'note': 'F#2', 'duration': '4n'     },
    { 'time': '2:1',    'note': 'C#3', 'duration': '4n'     },
    { 'time': '2:2',    'note': 'F#3', 'duration': '2n'     },
    { 'time': '3:0',    'note': 'F2',  'duration': '4n'     },
    { 'time': '3:1',    'note': 'C3',  'duration': '4n'     },
    { 'time': '3:2',    'note': 'F3',  'duration': '2n'     },
]




function playSound() {
    const squareSynth = new Tone.Synth({
        oscillator: {
            type: 'square',
            portamento: 0,
            volume: -6 
        },
        envelope: {
            attack: 0,
            decay: 0,
            sustain: 1,
            release: 0,
        }
    }).toDestination();
    const triangleSynth = new Tone.Synth({
        oscillator: {
            type: 'triangle',
            portamento: 0,
            volume: -5
        },
        envelope: {
            attack: 0,
            decay: 0,
            sustain: 1,
            release: 0,
        }
    }).toDestination();


    const now = Tone.now()
    const square1 = new Tone.Part((time, note) => {
        squareSynth.triggerAttackRelease(note.note, note.duration, time);
    }, sq1)
    square1.start();

    const triangle1 = new Tone.Part((time, note) => {
        triangleSynth.triggerAttackRelease(note.note, note.duration, time);
    }, tri1)
    triangle1.start();
    Tone.Transport.bpm.value = 90
    Tone.Transport.start()
}
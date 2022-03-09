let startPos = 16,
    step = 6,
    staff = [];
let octava = {C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6};
let samples = {drums: 0, piano: 1, trombone: 2, guitar: 3};
let instrument = 'piano';
let loop = false;
let instruments = document.querySelector('.instruments');
let notesWrapper = document.querySelector('.notes-wrapper');
let notes = document.querySelector('.notes');
let piano = document.querySelector('.piano');
let pianoKeys = document.querySelectorAll('.piano-key');
let marks = document.querySelector('.marks');
let fullScreen = document.querySelector('.fullscreen');
const COMPOSER = document.querySelector('#composer');
const STOP = document.querySelector('#stop');

init();
fullScreen.addEventListener('click', toggleFullScreen);
window.addEventListener('resize', () => {
    staff.length = 0;
    notes.innerHTML = '';
});
window.addEventListener('keydown', keyboardPlay);
window.addEventListener('keyup', keyboardStop);

piano.addEventListener('mousedown', startPlaying, false);
piano.addEventListener('mouseup', stopPlaying);
piano.addEventListener('mouseleave', stopPlaying);

marks.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn-active')) {
        pianoKeys.forEach(el => el.classList.toggle('letter'));
        [...marks.children].forEach(el => el.classList.toggle('btn-active'));
    }
});
instruments.addEventListener('click', changeInstrument);
COMPOSER.addEventListener('click', (e) => {
    loop = !loop;
    // TODO: navigator.mediaDevices.getUserMedia(), Web Audio API
    e.target.classList.toggle('btn-active');
})
;
STOP.addEventListener('click', () => {
    location.reload();
    return false;
});


function init() {
    for (let key of Object.keys(samples)) {

        for (let i = 0; i < pianoKeys.length; i++) {
            let el = pianoKeys[i];
            if (getComputedStyle(el.parentElement).display === 'none') {
                i += 11;
                continue;
            }
            let pitch = el.dataset.note.toUpperCase();
            let sound = new Audio(`assets/audio/${key}/${pitch.replace(/♯/, '%23')}.mp3`);
            el.append(sound);
        }
    }
}

function play(sound) {
    sound.currentTime = 0;
    if (instrument === 'drums') sound.volume = 0.2;
    sound.loop = loop;
    sound.play();
}

function keyboardPlay(e) {
    if (e.repeat) return;
    let target = document.querySelector(`.piano-key[data-code="${e.code}"]`);
    if (!target || target.classList.contains('click')) return;
    target.classList.add('piano-key-active');
    let sound = target.children[samples[instrument]];
    play(sound);
    if (instrument !== 'drums') drawNote(target.dataset.note.toUpperCase());
}

function keyboardStop(e) {
    let key = document.querySelector(`.piano-key[data-code="${e.code}"]`);
    if (!key || key.classList.contains('click')) return;
    key.classList.remove('piano-key-active');
}

function mousePlay(e) {
    let target = e.target;
    if (target.classList.contains('piano-key-active')) return;
    target.classList.add('click');
    target.classList.add('piano-key-active');
    let sound = target.children[samples[instrument]];
    play(sound);
    if (instrument !== 'drums') drawNote(target.dataset.note.toUpperCase());
}

function mouseStop() {
    pianoKeys.forEach((el) => {
        if (el.classList.contains('click')) {
            el.classList.remove('click');
            el.classList.remove('piano-key-active');
        }
    });
}

function startPlaying(e) {
    if (e.target.classList.contains('piano-key')) {
        mousePlay(e);
    }
    pianoKeys.forEach((el) => {
        el.addEventListener('mouseover', mousePlay);
        el.addEventListener('mouseout', mouseStop);
    });
}

function stopPlaying(e) {
    mouseStop();
    pianoKeys.forEach((el) => {
        el.removeEventListener('mouseover', mousePlay);
        el.removeEventListener('mouseout', mouseStop);
    });
}

function changeInstrument(e) {
    if (!e.target.classList.contains('btn-instrument')) return;
    [...instruments.children].forEach((el) => {
        el.classList.remove('btn-active');
    });
    e.target.classList.add('btn-active');
    instrument = e.target.dataset.instrument;
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function drawNote(note) {
    let edge = Math.floor((notesWrapper.clientWidth - 100) / 44);
    if (staff.length >= edge) {
        staff.length = 0;
        notes.innerHTML = '';
    }
    let separator = note.length === 3 ? '♯' : '';
    let [key, register] = note.split(separator);
    let img = document.createElement('img');
    let noteSign = document.createElement('div');

    img.src = 'assets/svg/qnote.svg';
    noteSign.classList.add('note');
    if (separator === '♯') noteSign.classList.add('sharp');
    noteSign.append(img);
    notes.append(noteSign);
    staff.push(note);

    let pos = (7 * (register - 4) + octava[key]) * step + startPos;
    pos = pos < 16 ? pos - 28 : pos;

    if (pos === startPos || pos === 88 || pos === -84) {
        noteSign.classList.add('ledger-in')
    } else if (pos === 94) {
        noteSign.classList.add('ledger-above')
    } else if (pos === -90) {
        noteSign.classList.add('ledger-below')
    } else if (pos === -96) {
        noteSign.classList.add('low')
    }

    noteSign.style.bottom = pos + 'px';
}
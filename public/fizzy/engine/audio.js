export class Audio {
	constructor(sounds, audioContext) {
		this.sounds = sounds;
		this.context = audioContext || new AudioContext();
	}
	destroy() {
		if (this.context) {
			this.context.close();
		}
	}
	play(songName, options = { speed: 1, gain: 1 }) {
		if (this.context) {
			var source = this.context.createBufferSource(); // Create sound source

			source.buffer = this.sounds[songName];          // Feed it the audio
			source.playbackRate.value = options.speed;      // Set Speed

			var gainNode = this.context.createGain();       // Create gain node
			gainNode.gain.value = options.gain;             // Set the volume

			source.connect(gainNode);                       // Source -> Gain -> Destination
			gainNode.connect(this.context.destination);

			source.start(0);                                // Start the sound
		}
	}
	pauseAll() {
		if (this.context) {
			this.context.suspend();
		}
	}
	resume() {
		if (this.context) {
			this.context.resume();
		}
	}
}
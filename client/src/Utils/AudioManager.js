class AudioManager {
	constructor() {
		this.audioContext = null
		this.gainNode = null
		this.audioElement = null
		this.mediaSource = null
		this.currentVolume = 1
	}

	async init() {
		this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
		this.gainNode = this.audioContext.createGain()
		this.gainNode.connect(this.audioContext.destination)

		this.audioElement = new Audio()
		this.mediaSource = this.audioContext.createMediaElementSource(
			this.audioElement
		)
		this.mediaSource.connect(this.gainNode)
	}

	async loadMusic(path) {
		this.audioElement.src = path
		this.audioElement.loop = true
	}

	setVolume(value) {
		if (this.gainNode) {
			const volume = value * value
			this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
			this.currentVolume = volume
		}
	}

	async play() {
		if (this.audioContext.state === 'suspended') {
			await this.audioContext.resume()
		}
		await this.audioElement.play()
	}

	pause() {
		this.audioElement.pause()
	}

	stop() {
		this.audioElement.pause()
		this.audioElement.currentTime = 0
	}

	getCurrentTime() {
		return this.audioElement.currentTime
	}

	setCurrentTime(time) {
		this.audioElement.currentTime = time
	}

	async fadeOut(duration = 1) {
		if (this.gainNode) {
			const currentTime = this.audioContext.currentTime
			this.gainNode.gain.linearRampToValueAtTime(0, currentTime + duration)
		}
	}

	async fadeIn(duration = 1) {
		if (this.gainNode) {
			const currentTime = this.audioContext.currentTime
			const currentVolume = this.gainNode.gain.value
			this.gainNode.gain.linearRampToValueAtTime(0, currentTime)
			this.gainNode.gain.linearRampToValueAtTime(
				currentVolume,
				currentTime + duration
			)
		}
	}
}

export default AudioManager

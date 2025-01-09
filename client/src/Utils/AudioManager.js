class AudioManager {
	constructor() {
		this.audioContext = null
		this.musicSource = null
		this.gainNode = null
		this.buffer = null
		this.isPlaying = false
		this.startTime = 0
		this.pausedAt = 0
	}

	async init() {
		if (!this.audioContext) {
			this.audioContext = new (window.AudioContext ||
				window.webkitAudioContext)()
		}
	}

	async loadMusic(url) {
		try {
			await this.init()
			const response = await fetch(url)
			const arrayBuffer = await response.arrayBuffer()
			this.buffer = await this.audioContext.decodeAudioData(arrayBuffer)
		} catch (error) {
			console.error('Error loading music:', error)
			throw error
		}
	}

	play() {
		if (this.isPlaying) return

		this.musicSource = this.audioContext.createBufferSource()
		this.musicSource.buffer = this.buffer
		this.gainNode = this.audioContext.createGain()

		this.musicSource.connect(this.gainNode)
		this.gainNode.connect(this.audioContext.destination)

		this.musicSource.loop = true

		const offset = this.pausedAt
		this.startTime = this.audioContext.currentTime - offset
		this.musicSource.start(0, offset)
		this.isPlaying = true
	}

	setCurrentTime(time) {
		this.pausedAt = time
		if (this.isPlaying) {
			this.stop()
			this.play()
		}
	}

	getCurrentTime() {
		if (!this.isPlaying) return this.pausedAt
		return (
			(this.audioContext.currentTime - this.startTime) % this.buffer.duration
		)
	}

	stop() {
		if (this.musicSource) {
			this.pausedAt = this.getCurrentTime()
			this.musicSource.stop()
			this.musicSource = null
			this.isPlaying = false
		}
	}

	setVolume(value) {
		if (this.gainNode) {
			this.gainNode.gain.value = value
		}
	}

	fadeOut(duration = 1) {
		if (this.gainNode) {
			const currentTime = this.audioContext.currentTime
			this.gainNode.gain.linearRampToValueAtTime(0, currentTime + duration)
		}
	}

	fadeIn(duration = 1) {
		if (this.gainNode) {
			const currentTime = this.audioContext.currentTime
			this.gainNode.gain.linearRampToValueAtTime(0, currentTime)
			this.gainNode.gain.linearRampToValueAtTime(1, currentTime + duration)
		}
	}
}

export default AudioManager

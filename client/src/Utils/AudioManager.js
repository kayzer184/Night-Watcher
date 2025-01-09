class AudioManager {
	constructor() {
		this.audioContext = null
		this.musicSource = null
		this.gainNode = null
		this.buffer = null
		this.isPlaying = false
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
			console.log('Loading music from URL:', url)

			const response = await fetch(url)
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const arrayBuffer = await response.arrayBuffer()
			this.buffer = await this.audioContext.decodeAudioData(arrayBuffer)
			console.log('Music loaded successfully')
		} catch (error) {
			console.error('Error loading music:', error)
			throw error
		}
	}

	play() {
		if (!this.buffer || this.isPlaying) return

		try {
			this.musicSource = this.audioContext.createBufferSource()
			this.gainNode = this.audioContext.createGain()

			this.musicSource.buffer = this.buffer
			this.musicSource.loop = true

			this.musicSource.connect(this.gainNode)
			this.gainNode.connect(this.audioContext.destination)

			this.musicSource.start(0)
			this.isPlaying = true
			console.log('Music started playing')
		} catch (error) {
			console.error('Error playing music:', error)
		}
	}

	stop() {
		if (this.musicSource) {
			try {
				this.musicSource.stop()
				this.musicSource = null
				this.isPlaying = false
			} catch (error) {
				console.error('Error stopping music:', error)
			}
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

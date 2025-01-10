class AudioManager {
	constructor() {
		this.audioContext = null
		this.musicSource = null
		this.gainNode = null
		this.buffer = null
		this.isPlaying = false
		this.startTime = 0
		this.pausedAt = 0
		this.lastVolume = 1
	}

	async init() {
		if (!this.audioContext) {
			this.audioContext = new (window.AudioContext ||
				window.webkitAudioContext)()
			if (this.audioContext.state === 'suspended') {
				await this.audioContext.resume()
			}
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

	async play() {
		if (this.isPlaying) return

		await this.init()

		this.musicSource = this.audioContext.createBufferSource()
		this.musicSource.buffer = this.buffer
		this.gainNode = this.audioContext.createGain()

		this.musicSource.connect(this.gainNode)
		this.gainNode.connect(this.audioContext.destination)

		this.musicSource.loop = true

		const offset = this.pausedAt || 0
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
			const safeValue = Number.isFinite(value) ? value : 0
			this.lastVolume = safeValue
			this.gainNode.gain.setValueAtTime(
				safeValue,
				this.audioContext.currentTime
			)
		}
	}

	fadeOut(duration = 0.5) {
		if (this.gainNode && this.isPlaying) {
			const currentTime = this.audioContext.currentTime
			this.gainNode.gain.linearRampToValueAtTime(0, currentTime + duration)
			setTimeout(() => {
				if (this.isPlaying) {
					this.stop()
				}
			}, duration * 1000)
		}
	}

	fadeIn(duration = 0.5) {
		if (this.gainNode && this.isPlaying) {
			const currentTime = this.audioContext.currentTime
			this.gainNode.gain.setValueAtTime(0, currentTime)
			this.gainNode.gain.linearRampToValueAtTime(
				this.lastVolume || 1,
				currentTime + duration
			)
		}
	}
}

export default AudioManager

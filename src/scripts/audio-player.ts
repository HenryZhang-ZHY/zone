function formatTime(seconds: number): string {
  if (Number.isNaN(seconds) || !Number.isFinite(seconds)) return '0:00'

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function pauseOtherPlayers(currentAudio: HTMLAudioElement): void {
  document.querySelectorAll<HTMLElement>('.audio-player').forEach((otherPlayer) => {
    const otherAudio = otherPlayer.querySelector<HTMLAudioElement>('audio')
    const otherButton = otherPlayer.querySelector<HTMLButtonElement>('.play-button')

    if (otherAudio && otherAudio !== currentAudio && !otherAudio.paused) {
      otherAudio.pause()
      otherButton?.classList.remove('playing')
      otherButton?.setAttribute('aria-label', 'Play')
    }
  })
}

function initAudioPlayers(): void {
  document.querySelectorAll<HTMLElement>('.audio-player').forEach((playerEl) => {
    if (playerEl.dataset.audioReady === 'true') return

    const audio = playerEl.querySelector<HTMLAudioElement>('audio')
    const playButton = playerEl.querySelector<HTMLButtonElement>('.play-button')
    const progressSlider = playerEl.querySelector<HTMLInputElement>('.progress-slider')
    const progressFill = playerEl.querySelector<HTMLElement>('.progress-fill')
    const timeCurrent = playerEl.querySelector<HTMLElement>('.time-current')
    const timeDuration = playerEl.querySelector<HTMLElement>('.time-duration')

    if (!audio || !playButton || !progressSlider || !progressFill || !timeCurrent || !timeDuration) return

    playButton.addEventListener('click', () => {
      if (audio.paused) {
        pauseOtherPlayers(audio)

        audio
          .play()
          .then(() => {
            playButton.classList.add('playing')
            playButton.setAttribute('aria-label', 'Pause')
          })
          .catch(() => {
            playButton.classList.remove('playing')
            playButton.setAttribute('aria-label', 'Play')
          })
      } else {
        audio.pause()
        playButton.classList.remove('playing')
        playButton.setAttribute('aria-label', 'Play')
      }
    })

    audio.addEventListener('timeupdate', () => {
      const progress = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0
      progressSlider.value = progress.toString()
      progressFill.style.width = `${progress}%`
      timeCurrent.textContent = formatTime(audio.currentTime)
    })

    audio.addEventListener('loadedmetadata', () => {
      timeDuration.textContent = formatTime(audio.duration)
    })

    progressSlider.addEventListener('input', () => {
      if (!(audio.duration > 0)) return
      audio.currentTime = (Number.parseFloat(progressSlider.value) / 100) * audio.duration
    })

    audio.addEventListener('ended', () => {
      playButton.classList.remove('playing')
      playButton.setAttribute('aria-label', 'Play')
      progressSlider.value = '0'
      progressFill.style.width = '0%'
      timeCurrent.textContent = '0:00'
    })

    playerEl.dataset.audioReady = 'true'
  })
}

initAudioPlayers()
document.addEventListener('astro:after-swap', initAudioPlayers)

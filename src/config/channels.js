// Every channel format the one-button formatter produces.
// w and h are the delivery size in pixels.

export const channels = [
  { id: 'ig-feed', network: 'Instagram', name: 'Instagram feed', w: 1080, h: 1350, ratio: '4:5', captionLimit: 2200, bestTime: '20:30', hashtags: true },
  { id: 'ig-story', network: 'Instagram', name: 'Instagram story', w: 1080, h: 1920, ratio: '9:16', captionLimit: 0, bestTime: '22:00', hashtags: false },
  { id: 'tiktok', network: 'TikTok', name: 'TikTok', w: 1080, h: 1920, ratio: '9:16', captionLimit: 2200, bestTime: '23:00', hashtags: true },
  { id: 'snap', network: 'Snapchat', name: 'Snapchat', w: 1080, h: 1920, ratio: '9:16', captionLimit: 250, bestTime: '21:30', hashtags: false },
  { id: 'fb-feed', network: 'Facebook', name: 'Facebook feed', w: 1080, h: 1080, ratio: '1:1', captionLimit: 2200, bestTime: '19:00', hashtags: false },
  { id: 'x-post', network: 'X', name: 'X post', w: 1600, h: 900, ratio: '16:9', captionLimit: 280, bestTime: '18:00', hashtags: true },
  { id: 'yt-thumb', network: 'YouTube', name: 'YouTube thumbnail', w: 1280, h: 720, ratio: '16:9', captionLimit: 100, bestTime: '17:00', hashtags: false },
  { id: 'wa-status', network: 'WhatsApp', name: 'WhatsApp status', w: 1080, h: 1920, ratio: '9:16', captionLimit: 700, bestTime: '04:00', hashtags: false },
]

export const networks = [
  { id: 'Instagram', handle: '@qamari', connected: true },
  { id: 'TikTok', handle: '@qamari.eg', connected: true },
  { id: 'Snapchat', handle: 'qamari', connected: true },
  { id: 'Facebook', handle: 'Qamari', connected: true },
  { id: 'X', handle: '@QamariSweets', connected: false },
  { id: 'YouTube', handle: 'Qamari', connected: true },
  { id: 'WhatsApp', handle: 'Qamari Business', connected: false },
]

export const channelById = (id) => channels.find((c) => c.id === id)

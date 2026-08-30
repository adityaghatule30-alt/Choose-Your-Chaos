export interface AvatarConfig {
  id: string
  name: string
  path: string
}

export const CHAOS_AVATARS: AvatarConfig[] = [
  { id: 'avatar-01', name: 'Chaos Agent', path: '/avatars/avatar-01.png' },
  { id: 'avatar-02', name: 'Cyber Rogue', path: '/avatars/avatar-02.png' },
  { id: 'avatar-03', name: 'Phantom Master', path: '/avatars/avatar-03.png' },
  { id: 'avatar-04', name: 'Shadow Hacker', path: '/avatars/avatar-04.png' },
  { id: 'avatar-05', name: 'Neon Samurai', path: '/avatars/avatar-05.png' },
  { id: 'avatar-06', name: 'Crimson Rebel', path: '/avatars/avatar-06.png' },
  { id: 'avatar-07', name: 'Golden Viper', path: '/avatars/avatar-07.png' },
  { id: 'avatar-08', name: 'Void Walker', path: '/avatars/avatar-08.png' },
  { id: 'avatar-09', name: 'Solar Sentinel', path: '/avatars/avatar-09.png' },
  { id: 'avatar-10', name: 'Toxic Jester', path: '/avatars/avatar-10.png' },
  { id: 'avatar-11', name: 'Frost Specter', path: '/avatars/avatar-11.png' },
  { id: 'avatar-12', name: 'Inferno Knight', path: '/avatars/avatar-12.png' },
  { id: 'avatar-13', name: 'Starlight Oracle', path: '/avatars/avatar-13.png' },
  { id: 'avatar-14', name: 'Chaos Overlord', path: '/avatars/avatar-14.png' },
]

export function getAvatarPath(avatarUrl: string | null | undefined, fallbackLetter = 'C'): string {
  if (avatarUrl && avatarUrl.startsWith('/avatars/avatar-')) {
    return avatarUrl
  }
  return '/avatars/avatar-01.png'
}

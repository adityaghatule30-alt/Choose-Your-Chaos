/**
 * Centralized Progression Curve & Level Calculations
 * Formula: Cumulative XP for Level N = 100 * (N - 1)^1.4
 */

export interface LevelInfo {
  level: number
  currentXP: number
  xpForCurrentLevel: number
  xpForNextLevel: number
  progressXP: number
  neededXPForNextLevel: number
  percentProgress: number
}

export function getXPForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.round(100 * Math.pow(level - 1, 1.4))
}

export function getLevelFromXP(xp: number = 0): LevelInfo {
  const safeXP = Math.max(0, xp)
  let level = 1

  while (safeXP >= getXPForLevel(level + 1)) {
    level++
  }

  const currentLevelBaseXP = getXPForLevel(level)
  const nextLevelBaseXP = getXPForLevel(level + 1)
  const progressXP = safeXP - currentLevelBaseXP
  const neededXPForNextLevel = nextLevelBaseXP - currentLevelBaseXP
  const percentProgress = Math.min(
    100,
    Math.max(0, Math.round((progressXP / neededXPForNextLevel) * 100))
  )

  return {
    level,
    currentXP: safeXP,
    xpForCurrentLevel: currentLevelBaseXP,
    xpForNextLevel: nextLevelBaseXP,
    progressXP,
    neededXPForNextLevel: nextLevelBaseXP - safeXP,
    percentProgress,
  }
}

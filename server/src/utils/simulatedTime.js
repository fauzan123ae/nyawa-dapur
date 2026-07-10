/**
 * simulatedTime.js
 *
 * Menyimpan tanggal/waktu simulasi per user di memory (Map).
 * Digunakan untuk fitur "nextDay" agar bisa mensimulasikan pergantian hari
 * tanpa mengubah jam sistem.
 *
 * Catatan: data ini hilang saat server restart (by design — ini fitur simulasi/testing).
 */

import dayjs from 'dayjs'

// Map<userId, isoString>
const simulatedTimes = new Map()

/**
 * Ambil waktu simulasi untuk user tertentu.
 * Jika belum pernah diset, kembalikan waktu nyata (dayjs()).
 */
export function getSimulatedNow(userId) {
  const stored = simulatedTimes.get(userId)
  if (stored) return dayjs(stored)
  return dayjs()
}

/**
 * Set waktu simulasi untuk user tertentu.
 * @param {number|string} userId
 * @param {string} isoString  — format ISO 8601, mis. "2026-07-11T10:00:00.000Z"
 */
export function setSimulatedDate(userId, isoString) {
  simulatedTimes.set(userId, isoString)
}

/**
 * Reset waktu simulasi user ke waktu nyata.
 */
export function resetSimulatedDate(userId) {
  simulatedTimes.delete(userId)
}

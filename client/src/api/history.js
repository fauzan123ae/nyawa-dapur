import client from './client'

export const getCookingHistory  = ()   => client.get('/history')
export const deleteHistoryEntry = (id) => client.delete(`/history/${id}`)
export const clearAllHistory    = ()   => client.delete('/history/clear')
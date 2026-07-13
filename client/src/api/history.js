import client from './client'

export const getCookingHistory = () => client.get('/history')
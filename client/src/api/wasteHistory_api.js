import client from './client.js'

export const getWasteHistory  = () => client.get('/waste-history')
export const deleteWasteEntry = (id) => client.delete(`/waste-history/${id}`)
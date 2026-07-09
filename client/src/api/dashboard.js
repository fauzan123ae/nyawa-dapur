import client from './client'
export const getDashboard    = () => client.get('/dashboard')
export const buyFirewood     = () => client.post('/dashboard/shop/buy-firewood')
export const igniteWood      = () => client.post('/dashboard/kitchen/ignite-wood')
export const simulateNextDay = () => client.post('/dashboard/simulation/next-day')
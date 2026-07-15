import client from './client'

export const createHousehold = async (name) => {
  return client.post('/households/create', { name })
}

export const joinHousehold = async (invite_code) => {
  return client.post('/households/join', { invite_code })
}

export const getHouseholdMembers = async () => {
  return client.get('/households/members')
}

export const leaveHousehold = async () => {
  return client.post('/households/leave')
}

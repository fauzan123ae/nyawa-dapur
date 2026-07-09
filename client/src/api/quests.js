import client from './client'
export const claimQuest = (type, questId) =>
  client.post(`/quests/claim/${type}`, { quest_id: questId })
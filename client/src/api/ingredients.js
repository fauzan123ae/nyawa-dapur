import client from './client'
export const addIngredient        = (data)          => client.post('/ingredients', data)
export const updateIngredient     = (id, data)      => client.put(`/ingredients/${id}`, data)
export const adjustQuantity       = (id, dir)       => client.put(`/ingredients/${id}/adjust`, { direction: dir })
export const cookIngredient       = (id)            => client.post(`/ingredients/${id}/cook`)
export const cookAmountIngredient = (id, amount)    => client.post(`/ingredients/${id}/cook-amount`, { amount })
export const cookBatchIngredients = (ids)           => client.post('/ingredients/cook-batch', { ids })
export const wasteIngredient      = (id)            => client.post(`/ingredients/${id}/waste`)
export const deleteIngredient     = (id)            => client.delete(`/ingredients/${id}`)
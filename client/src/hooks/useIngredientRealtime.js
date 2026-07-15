import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useIngredientRealtime({ householdId, currentUserId, onAdded, onUpdated, onDeleted }) {
  const [realtimeStatus, setRealtimeStatus] = useState('disconnected')

  useEffect(() => {
    if (!householdId) {
      setRealtimeStatus('disconnected')
      return
    }

    const channel = supabase
      .channel(`household-ingredients-${householdId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ingredients',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          // Skip kalau yang insert adalah user sendiri (sudah ada optimistic update)
          if (payload.new.user_id === currentUserId) return
          onAdded(payload.new)
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ingredients', filter: `household_id=eq.${householdId}` },
        (payload) => {
          if (payload.new.user_id === currentUserId) return
          onUpdated(payload.new)
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ingredients', filter: `household_id=eq.${householdId}` },
        (payload) => {
          if (payload.old.user_id === currentUserId) return
          onDeleted(payload.old)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected')
        } else {
          setRealtimeStatus('disconnected')
        }
      })

    return () => { 
      supabase.removeChannel(channel) 
      setRealtimeStatus('disconnected')
    }
  }, [householdId, currentUserId])

  return { realtimeStatus }
}

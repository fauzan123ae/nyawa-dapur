import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useIngredientRealtime({ householdId, currentUserId, onAdded, onUpdated, onDeleted, onHistoryAdded }) {
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

    const historyChannel = supabase
      .channel(`household-history-${householdId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'cooking_history' },
        (payload) => {
          if (payload.new.user_id === currentUserId) return
          if (onHistoryAdded) onHistoryAdded(payload.new)
        }
      )
      .subscribe()

    return () => { 
      supabase.removeChannel(channel) 
      supabase.removeChannel(historyChannel)
      setRealtimeStatus('disconnected')
    }
  }, [householdId, currentUserId])

  return { realtimeStatus }
}

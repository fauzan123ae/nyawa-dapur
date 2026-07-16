import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useHistoryRealtime({ currentUserId, onHistoryAdded }) {
  useEffect(() => {
    if (!currentUserId) return

    const channel = supabase
      .channel(`cooking-history-user-${currentUserId}`)
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
    }
  }, [currentUserId])
}

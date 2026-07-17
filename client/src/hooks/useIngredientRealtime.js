import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useIngredientRealtime({ householdId, currentUserId, onAdded, onUpdated, onDeleted }) {
  const [realtimeStatus, setRealtimeStatus] = useState('disconnected')

  // Gunakan ref agar perubahan currentUserId dan callbacks
  // tidak memicu unsubscribe/resubscribe channel Supabase.
  // Ini mencegah gap di mana event bisa terlewat saat re-subscribing.
  const currentUserIdRef = useRef(currentUserId)
  useEffect(() => { currentUserIdRef.current = currentUserId }, [currentUserId])

  const onAddedRef = useRef(onAdded)
  const onUpdatedRef = useRef(onUpdated)
  const onDeletedRef = useRef(onDeleted)
  useEffect(() => { onAddedRef.current = onAdded }, [onAdded])
  useEffect(() => { onUpdatedRef.current = onUpdated }, [onUpdated])
  useEffect(() => { onDeletedRef.current = onDeleted }, [onDeleted])

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
          if (payload.new.user_id === currentUserIdRef.current) return
          onAddedRef.current(payload.new)
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ingredients', filter: `household_id=eq.${householdId}` },
        (payload) => {
          if (payload.new.user_id === currentUserIdRef.current) return
          onUpdatedRef.current(payload.new)
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ingredients', filter: `household_id=eq.${householdId}` },
        (payload) => {
          if (payload.old.user_id === currentUserIdRef.current) return
          onDeletedRef.current(payload.old)
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
  }, [householdId])  // HANYA householdId — tidak re-subscribe saat currentUserId/callbacks berubah

  return { realtimeStatus }
}

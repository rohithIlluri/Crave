'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Coords = { lat: number; lng: number }
type Status = 'idle' | 'prompt' | 'granted' | 'denied' | 'error'

interface LocationCtx {
  coords: Coords | null
  status: Status
  radiusKm: number
  setRadiusKm: (v: number) => void
  requestLocation: () => void
  setManualLocation: (coords: Coords) => void
}

const Ctx = createContext<LocationCtx | undefined>(undefined)

export function useLocation() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useLocation must be used within LocationProvider')
  return v
}

const LS_RADIUS = 'crave.radiusKm'
const LS_COORDS = 'crave.coords'

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [radiusKm, setRadiusKm] = useState<number>(() => {
    const v = typeof window !== 'undefined' ? localStorage.getItem(LS_RADIUS) : null
    return v ? Number(v) : 8 // ~5 miles
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem(LS_COORDS)
    if (raw) {
      try {
        const c = JSON.parse(raw) as Coords
        if (typeof c.lat === 'number' && typeof c.lng === 'number') {
          setCoords(c)
          setStatus('granted')
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(LS_RADIUS, String(radiusKm))
  }, [radiusKm])

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }
    setStatus('prompt')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(c)
        setStatus('granted')
        try {
          localStorage.setItem(LS_COORDS, JSON.stringify(c))
        } catch {}
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 } // 5 minutes cache
    )
  }

  const setManualLocation = (c: Coords) => {
    setCoords(c)
    setStatus('granted')
    try {
      localStorage.setItem(LS_COORDS, JSON.stringify(c))
    } catch {}
  }

  const value = useMemo(
    () => ({ coords, status, radiusKm, setRadiusKm, requestLocation, setManualLocation }),
    [coords, status, radiusKm]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

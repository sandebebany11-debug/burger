import type { AvailabilityResponse, BookingRequestInput } from '../../shared/booking'
import { demoAvailability, demoRequest } from './demoApi'
import { IS_DEMO } from './site'

export class ApiError extends Error {
  status: number
  fields?: Record<string, string>
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

export async function api<T>(path: string, init: RequestInit & { token?: string | null } = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set('content-type', 'application/json')
  if (init.token) headers.set('authorization', `Bearer ${init.token}`)
  let res: Response
  try {
    res = await fetch(`/api${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'Keine Verbindung. Bitte prüfen Sie Ihre Internetverbindung.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Unbekannter Fehler.', data.fields)
  return data as T
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const getAvailability = async (month: string, staff: string | null = null): Promise<AvailabilityResponse> => {
  if (IS_DEMO) {
    await pause(250)
    return demoAvailability(month, staff)
  }
  return api<AvailabilityResponse>(`/availability?month=${month}${staff ? `&staff=${staff}` : ''}`)
}

export const sendRequest = async (input: BookingRequestInput) => {
  if (IS_DEMO) {
    await pause(700)
    return demoRequest(input)
  }
  return api<{ ok: true; id?: string }>('/requests', { method: 'POST', body: JSON.stringify(input) })
}

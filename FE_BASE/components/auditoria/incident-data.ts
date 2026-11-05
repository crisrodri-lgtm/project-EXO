export {
  INCIDENTS as INITIAL_INCIDENTS,
  MAX_EVIDENCES,
  MAX_EVIDENCE_SIZE_MB,
  ACCEPTED_EVIDENCE_TYPES,
  STATUS_OPTIONS,
  INCIDENT_TYPE_OPTIONS,
  type Incident,
  type IncidentStatus,
  type IncidentType,
} from '@/../BE_BASE'

export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

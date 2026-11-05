export { BOOKS, CATEGORIES, normalize, type Book, type BookStatus, type BookReport } from './db/books'
export { USERS, authenticate, routeForRole, canManageUser, type UserRole, type UserStatus, type MockUser } from './db/users'
export {
  INCIDENTS,
  MAX_EVIDENCES,
  MAX_EVIDENCE_SIZE_MB,
  ACCEPTED_EVIDENCE_TYPES,
  STATUS_OPTIONS,
  INCIDENT_TYPE_OPTIONS,
  type Incident,
  type IncidentStatus,
  type IncidentType,
} from './db/incidents'

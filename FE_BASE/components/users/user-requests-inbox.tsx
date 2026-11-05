'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { AccountRecoveryRequest, CancellationRequest, RegistrationRequest } from './user-management-demo'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

function formatBirthDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)))
}

function RequestStatusBadge({ status }: { status: string }) {
  if (status === 'PENDIENTE' || status === 'PENDIENTE_APROBACION') return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Pendiente</Badge>
  if (status === 'APROBADA' || status === 'FIRMADA' || status === 'REVISADA') return <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">{status === 'FIRMADA' ? 'Baja firmada' : status === 'REVISADA' ? 'Revisada' : 'Aprobada'}</Badge>
  return <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">{status === 'DENEGADA' ? 'Denegada' : 'Rechazada'}</Badge>
}

export function UserRequestsInbox({
  registrationRequests,
  cancellationRequests,
  accountRecoveryRequests,
  activeSubtab,
  onSubtabChange,
  onRegistrationAction,
  onCancellationAction,
  onRecoveryAction,
}: {
  registrationRequests: RegistrationRequest[]
  cancellationRequests: CancellationRequest[]
  accountRecoveryRequests: AccountRecoveryRequest[]
  activeSubtab: 'registros' | 'bajas' | 'recuperacion'
  onSubtabChange: (value: 'registros' | 'bajas' | 'recuperacion') => void
  onRegistrationAction: (request: RegistrationRequest, decision: 'aprobar' | 'rechazar') => void
  onCancellationAction: (request: CancellationRequest, decision: 'firmar' | 'denegar') => void
  onRecoveryAction: (request: AccountRecoveryRequest) => void
}) {
  const pendingRegistrations = registrationRequests.filter((request) => request.status === 'PENDIENTE' || request.status === 'PENDIENTE_APROBACION').length
  const pendingCancellations = cancellationRequests.filter((request) => request.status === 'PENDIENTE').length
  const pendingRecoveries = accountRecoveryRequests.filter((request) => request.status === 'PENDIENTE').length

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardDescription className="font-semibold uppercase tracking-[0.14em]">Bandeja de solicitudes</CardDescription>
        <CardTitle className="text-lg">Altas y bajas de cuentas</CardTitle>
        <p className="text-sm text-muted-foreground">Revisa las solicitudes pendientes antes de activar o cerrar una cuenta.</p>
      </CardHeader>
      <CardContent className="pt-1">
        <Tabs value={activeSubtab} onValueChange={(value) => onSubtabChange(value as 'registros' | 'bajas' | 'recuperacion')}>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-muted p-1 sm:w-fit">
            <TabsTrigger value="registros" className="min-h-9 flex-1 sm:flex-none">
              Registros <Badge variant="secondary" className="ml-1">{pendingRegistrations}</Badge>
            </TabsTrigger>
            <TabsTrigger value="bajas" className="min-h-9 flex-1 sm:flex-none">
              Cancelaciones <Badge variant="secondary" className="ml-1">{pendingCancellations}</Badge>
            </TabsTrigger>
            <TabsTrigger value="recuperacion" className="min-h-9 flex-1 sm:flex-none">
              Recuperación <Badge variant="secondary" className="ml-1">{pendingRecoveries}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="registros" className="mt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">Solicitudes de registro PWA</h2>
                <p className="text-sm text-muted-foreground">Estudiantes que esperan validación manual para activar su cuenta.</p>
              </div>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">{pendingRegistrations} pendientes</Badge>
            </div>
            <div className="flex flex-col gap-3">
              {registrationRequests.map((request) => (
                <article key={request.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{request.fullName}</h3>
                        <RequestStatusBadge status={request.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{request.program}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Matrícula / cédula: <span className="font-mono font-medium text-foreground">{request.identifier}</span></span>
                        <span>{request.email}</span>
                        {request.phonePrimary && <span>Teléfono: {request.phonePrimary}</span>}
                        {request.cedula && <span>Cédula: {request.cedula}</span>}
                        {request.matricula && <span>Matrícula: {request.matricula}</span>}
                        {request.emails && request.emails.length > 1 && <span>Otros correos: {request.emails.slice(1).join(', ')}</span>}
                        <span>Solicitud {request.id} · {formatDate(request.requestedAt)}</span>
                      </div>
                    </div>
                    {(request.status === 'PENDIENTE' || request.status === 'PENDIENTE_APROBACION') && (
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button onClick={() => onRegistrationAction(request, 'aprobar')}>
                          Aprobar y Activar
                        </Button>
                        <Button variant="outline" className="text-destructive" onClick={() => onRegistrationAction(request, 'rechazar')}>
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
              {registrationRequests.length === 0 && <EmptyRequests message="No hay solicitudes de registro." />}
            </div>
          </TabsContent>
          <TabsContent value="bajas" className="mt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">Solicitudes de cancelación</h2>
                <p className="text-sm text-muted-foreground">Solicitudes enviadas desde Mi perfil · Pantalla 11.</p>
              </div>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">{pendingCancellations} pendientes</Badge>
            </div>
            <div className="flex flex-col gap-3">
              {cancellationRequests.map((request) => {
                const eligible = request.activeLoans === 0 && request.pendingFine <= 0
                return (
                  <article key={request.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{request.fullName}</h3>
                            <RequestStatusBadge status={request.status} />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{request.identifier} · {request.email}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Solicitud {request.id} · {formatDate(request.requestedAt)}</p>
                        </div>
                        <Badge variant="outline">{request.role}</Badge>
                      </div>
                      <div className={cn(
                        'rounded-lg border px-3 py-3 text-sm',
                        eligible ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900',
                      )}>
                        <p className="font-semibold">Validación automática de cuenta</p>
                        <p className="mt-1">
                          Préstamos Activos: {request.activeLoans} <span aria-hidden="true">|</span> Multas Pendientes: RD${request.pendingFine.toFixed(2)}
                        </p>
                        {!eligible && <p className="mt-1 text-xs">No se puede firmar la baja hasta resolver préstamos o multas.</p>}
                      </div>
                      {request.status === 'PENDIENTE' && (
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button variant="outline" className="text-destructive" onClick={() => onCancellationAction(request, 'denegar')}>
                            Denegar Solicitud
                          </Button>
                          <Button
                            variant="destructive"
                            disabled={!eligible}
                            onClick={() => onCancellationAction(request, 'firmar')}
                          >
                            Firmar Baja y Eliminar Cuenta
                          </Button>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
              {cancellationRequests.length === 0 && <EmptyRequests message="No hay solicitudes de baja pendientes." />}
            </div>
          </TabsContent>
          <TabsContent value="recuperacion" className="mt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">Recuperación de cuentas</h2>
                <p className="text-sm text-muted-foreground">Solicitudes de personas que perdieron acceso a su correo institucional.</p>
              </div>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">{pendingRecoveries} pendientes</Badge>
            </div>
            <div className="flex flex-col gap-3">
              {accountRecoveryRequests.map((request) => (
                <article key={request.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{request.fullName}</h3>
                        <RequestStatusBadge status={request.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Solicitud {request.id} · {formatDate(request.requestedAt)}</p>
                      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                        <div><dt className="text-xs text-muted-foreground">Teléfono de contacto</dt><dd className="font-medium">{request.phone}</dd></div>
                        <div><dt className="text-xs text-muted-foreground">Correo alternativo</dt><dd className="font-medium">{request.alternateEmail || 'No proporcionado'}</dd></div>
                        <div><dt className="text-xs text-muted-foreground">Fecha de nacimiento</dt><dd className="font-medium">{formatBirthDate(request.birthDate)}</dd></div>
                        <div><dt className="text-xs text-muted-foreground">Cédula</dt><dd className="font-mono font-medium">{request.cedula || 'No requerida'}</dd></div>
                      </dl>
                    </div>
                    {request.status === 'PENDIENTE' && (
                      <Button variant="outline" className="shrink-0" onClick={() => onRecoveryAction(request)}>
                        Marcar revisada
                      </Button>
                    )}
                  </div>
                </article>
              ))}
              {accountRecoveryRequests.length === 0 && <EmptyRequests message="No hay solicitudes de recuperación pendientes." />}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function EmptyRequests({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">{message}</p>
}

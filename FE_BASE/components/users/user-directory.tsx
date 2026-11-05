'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import {
  MoreHorizontal,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  UserRoundPlus,
  KeyRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ManagedUser } from './user-management-demo'

const ROLE_OPTIONS = ['ESTUDIANTE', 'AUXILIAR', 'ADMINISTRADOR'] as const
const STATUS_OPTIONS = ['ACTIVO', 'BLOQUEADO', 'INACTIVO'] as const

function initialsFor(name: string) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

function RoleBadge({ role }: { role: ManagedUser['role'] }) {
  const style = role === 'ADMINISTRADOR'
    ? 'border-violet-200 bg-violet-50 text-violet-800'
    : role === 'AUXILIAR'
      ? 'border-blue-200 bg-blue-50 text-blue-800'
      : 'border-slate-200 bg-slate-50 text-slate-700'

  return <Badge variant="outline" className={style}>{role}</Badge>
}

function StatusBadge({ status }: { status: ManagedUser['status'] }) {
  const style = status === 'ACTIVO'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : status === 'BLOQUEADO'
      ? 'border-rose-200 bg-rose-50 text-rose-800'
      : 'border-slate-200 bg-slate-100 text-slate-700'

  return <Badge variant="outline" className={style}>{status}</Badge>
}

export function UserDirectory({
  users,
  onEdit,
  onResetCredentials,
  onToggleStatus,
  onAddStaff,
}: {
  users: ManagedUser[]
  onEdit: (user: ManagedUser) => void
  onResetCredentials: (user: ManagedUser) => void
  onToggleStatus: (user: ManagedUser) => void
  onAddStaff: () => void
}) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('TODOS')
  const [statusFilter, setStatusFilter] = useState('TODOS')

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es')
    return users.filter((user) => {
      const matchesSearch = !normalizedSearch || [user.fullName, user.identifier, user.email]
        .some((value) => value.toLocaleLowerCase('es').includes(normalizedSearch))
      const matchesRole = roleFilter === 'TODOS' || user.role === roleFilter
      const matchesStatus = statusFilter === 'TODOS' || user.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  return (
    <Card>
      <CardHeader className="gap-4 border-b pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardDescription className="font-semibold uppercase tracking-[0.14em]">Directorio general</CardDescription>
            <CardTitle className="mt-1 text-lg">Usuarios del sistema</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Busca, revisa y administra las cuentas de Biblonexo.</p>
          </div>
          <Button onClick={onAddStaff}>
            <UserRoundPlus data-icon="inline-start" /> Alta de Personal
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(16rem,1fr)_12rem_12rem]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-search" className="text-xs font-medium text-muted-foreground">Buscar usuario</label>
            <Input
              id="user-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre, cédula, matrícula o correo"
              type="search"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="role-filter" className="text-xs font-medium text-muted-foreground">Rol</label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="TODOS">Todos los roles</option>
              {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status-filter" className="text-xs font-medium text-muted-foreground">Estado</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="TODOS">Todos los estados</option>
              {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario encontrado' : 'usuarios encontrados'}
          </p>
          <p className="hidden text-xs text-muted-foreground sm:block">Directorio de prueba · cambios en esta sesión</p>
        </div>
        {filteredUsers.length > 0 ? (
          <Table>
            <caption className="sr-only">Directorio de usuarios de Biblonexo</caption>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Identificación</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado actual</TableHead>
                <TableHead className="w-14 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="min-w-60 whitespace-normal">
                    <div className="flex items-center gap-3">
                      {user.photoUrl ? (
                        <Image
                          src={user.photoUrl}
                          alt={`Foto de ${user.fullName}`}
                          width={40}
                          height={40}
                          className="size-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#1E3A8A]">
                          {initialsFor(user.fullName)}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block font-semibold text-foreground">{user.fullName}</span>
                        <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{user.identifier}</TableCell>
                  <TableCell><RoleBadge role={user.role} /></TableCell>
                  <TableCell><StatusBadge status={user.status} /></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" aria-label={`Acciones de ${user.fullName}`}>
                            <MoreHorizontal aria-hidden="true" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Pencil aria-hidden="true" /> Editar perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onResetCredentials(user)}>
                            <KeyRound aria-hidden="true" /> Restablecer credenciales
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant={user.status === 'ACTIVO' ? 'destructive' : 'default'} onClick={() => onToggleStatus(user)}>
                          {user.status === 'ACTIVO' ? <ShieldAlert aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
                          {user.status === 'ACTIVO' ? 'Suspender / bloquear' : 'Reactivar usuario'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="font-semibold">No hay usuarios que coincidan</p>
            <p className="mt-1 text-sm text-muted-foreground">Cambia el texto de búsqueda o ajusta los filtros.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  type LucideIcon,
  Archive,
  AlertTriangle,
  BookOpen,
  Boxes,
  Check,
  ChevronDown,
  CircleAlert,
  ImagePlus,
  MapPin,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Tags,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type SpecimenStatus = 'DISPONIBLE' | 'EN_PRESTAMO' | 'MANTENIMIENTO' | 'DADO_DE_BAJA'
type StatusFilter = 'TODOS' | SpecimenStatus

type Author = { id: string; name: string }
type Category = { id: string; name: string }
type Book = {
  id: string
  title: string
  isbn: string
  edition: string
  year: string
  authorId: string
  categoryId: string
  publisher: string
  aisle: string
  shelf: string
  coverUrl: string | null
  coverSizeBytes?: number | null
}
type Specimen = {
  id: string
  bookId: string
  code: string
  status: SpecimenStatus
  retirementReason?: string
  retiredAt?: string
}
type BookFormValues = Omit<Book, 'id' | 'coverUrl' | 'coverSizeBytes'> & {
  initialStock: number
  coverUrl: string | null
  coverSizeBytes: number | null
}
type CatalogDialog =
  | { type: 'create' }
  | { type: 'edit'; bookId: string }
  | { type: 'specimens'; bookId: string }
  | { type: 'retire'; bookId: string }
  | { type: 'taxonomy' }
  | null

const MAX_COVER_BYTES = 300 * 1024
const INITIAL_AUTHORS: Author[] = [
  { id: 'author-knuth', name: 'Donald E. Knuth' },
  { id: 'author-freire', name: 'Paulo Freire' },
  { id: 'author-borges', name: 'Jorge Luis Borges' },
  { id: 'author-moliner', name: 'María Moliner' },
  { id: 'author-fowler', name: 'Martin Fowler' },
]
const INITIAL_CATEGORIES: Category[] = [
  { id: 'category-tech', name: 'Tecnología' },
  { id: 'category-education', name: 'Educación' },
  { id: 'category-literature', name: 'Literatura' },
  { id: 'category-reference', name: 'Obras de referencia' },
]
const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1', title: 'The Art of Computer Programming', isbn: '9780201896831', edition: '3.ª edición', year: '1997',
    authorId: 'author-knuth', categoryId: 'category-tech', publisher: 'Addison-Wesley', aisle: 'A', shelf: '03', coverUrl: null,
  },
  {
    id: 'book-2', title: 'Pedagogía del oprimido', isbn: '9788420643239', edition: '2.ª edición', year: '2005',
    authorId: 'author-freire', categoryId: 'category-education', publisher: 'Siglo XXI', aisle: 'B', shelf: '12', coverUrl: null,
  },
  {
    id: 'book-3', title: 'Ficciones', isbn: '9788420633125', edition: 'Edición conmemorativa', year: '2014',
    authorId: 'author-borges', categoryId: 'category-literature', publisher: 'Alianza Editorial', aisle: 'C', shelf: '07', coverUrl: null,
  },
  {
    id: 'book-4', title: 'Diccionario de uso del español', isbn: '9788424928902', edition: '3.ª edición', year: '2007',
    authorId: 'author-moliner', categoryId: 'category-reference', publisher: 'Gredos', aisle: 'R', shelf: '02', coverUrl: null,
  },
  {
    id: 'book-5', title: 'Refactoring: Improving the Design of Existing Code', isbn: '9780134757599', edition: '2.ª edición', year: '2018',
    authorId: 'author-fowler', categoryId: 'category-tech', publisher: 'Addison-Wesley', aisle: 'A', shelf: '04', coverUrl: null,
  },
]
const INITIAL_SPECIMENS: Specimen[] = [
  { id: 'copy-1', bookId: 'book-1', code: 'EJ-TEC-01', status: 'DISPONIBLE' },
  { id: 'copy-2', bookId: 'book-1', code: 'EJ-TEC-02', status: 'EN_PRESTAMO' },
  { id: 'copy-3', bookId: 'book-1', code: 'EJ-TEC-03', status: 'DISPONIBLE' },
  { id: 'copy-4', bookId: 'book-1', code: 'EJ-TEC-04', status: 'MANTENIMIENTO' },
  { id: 'copy-5', bookId: 'book-2', code: 'EJ-EDU-01', status: 'DISPONIBLE' },
  { id: 'copy-6', bookId: 'book-2', code: 'EJ-EDU-02', status: 'DISPONIBLE' },
  { id: 'copy-7', bookId: 'book-2', code: 'EJ-EDU-03', status: 'EN_PRESTAMO' },
  { id: 'copy-8', bookId: 'book-3', code: 'EJ-LIT-01', status: 'DISPONIBLE' },
  { id: 'copy-9', bookId: 'book-3', code: 'EJ-LIT-02', status: 'DADO_DE_BAJA', retirementReason: 'Deterioro irreversible de la encuadernación', retiredAt: '14/10/2026' },
  { id: 'copy-10', bookId: 'book-4', code: 'EJ-REF-01', status: 'DISPONIBLE' },
  { id: 'copy-11', bookId: 'book-4', code: 'EJ-REF-02', status: 'MANTENIMIENTO' },
  { id: 'copy-12', bookId: 'book-5', code: 'EJ-TEC-05', status: 'DISPONIBLE' },
  { id: 'copy-13', bookId: 'book-5', code: 'EJ-TEC-06', status: 'EN_PRESTAMO' },
]

const STATUS_DETAILS: Record<SpecimenStatus, { label: string; className: string }> = {
  DISPONIBLE: { label: 'Disponible', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  EN_PRESTAMO: { label: 'En préstamo', className: 'border-blue-200 bg-blue-50 text-blue-800' },
  MANTENIMIENTO: { label: 'Mantenimiento', className: 'border-amber-200 bg-amber-50 text-amber-900' },
  DADO_DE_BAJA: { label: 'Dado de baja', className: 'border-rose-200 bg-rose-50 text-rose-800' },
}
const STATUS_OPTIONS: SpecimenStatus[] = ['DISPONIBLE', 'EN_PRESTAMO', 'MANTENIMIENTO', 'DADO_DE_BAJA']
const COVER_TONES = [
  'from-blue-950 to-blue-700',
  'from-emerald-950 to-emerald-700',
  'from-amber-950 to-amber-700',
  'from-indigo-950 to-indigo-700',
  'from-slate-900 to-slate-600',
]

function createId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 11)}`
}

function normalize(value: string) {
  return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function categoryCode(name: string) {
  const prefix = normalize(name).replace(/[^a-z0-9]/g, '').toUpperCase().slice(0, 3)
  return (prefix || 'CAT').padEnd(3, 'X')
}

function nextSpecimenCode(category: Category | undefined, specimens: Specimen[]) {
  const prefix = `EJ-${categoryCode(category?.name ?? 'CAT')}-`
  const lastNumber = specimens
    .filter((specimen) => specimen.code.startsWith(prefix))
    .reduce((highest, specimen) => Math.max(highest, Number(specimen.code.slice(prefix.length)) || 0), 0)
  return `${prefix}${String(lastNumber + 1).padStart(2, '0')}`
}

async function compressCover(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) throw new Error('Selecciona un archivo de imagen válido.')
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  let scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height))
  let quality = 0.84

  try {
    for (let attempt = 0; attempt < 15; attempt += 1) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('No se pudo preparar la imagen en este navegador.')
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
      if (blob && blob.size <= MAX_COVER_BYTES) {
        const safeName = `${file.name.replace(/\.[^.]+$/, '') || 'portada'}.jpg`
        return new File([blob], safeName, { type: 'image/jpeg', lastModified: Date.now() })
      }
      if (quality > 0.48) quality -= 0.08
      else {
        scale *= 0.82
        quality = 0.78
      }
    }
    throw new Error('No fue posible reducir la portada a menos de 300 KB. Prueba con otra imagen.')
  } finally {
    bitmap.close()
  }
}

function StatusBadge({ status }: { status: SpecimenStatus }) {
  const details = STATUS_DETAILS[status]
  return <Badge variant="outline" className={`h-6 rounded-full px-2.5 font-semibold ${details.className}`}>{details.label}</Badge>
}

function BookCover({ book, index }: { book: Book; index: number }) {
  if (book.coverUrl) {
    return <img src={book.coverUrl} alt={`Portada de ${book.title}`} className="h-[58px] w-10 rounded-md object-cover shadow-sm ring-1 ring-black/10" />
  }
  const titleLines = book.title.split(' ').slice(0, 5).join(' ')
  return (
    <div
      aria-label={`Portada tipográfica de ${book.title}`}
      className={`flex h-[58px] w-10 flex-col justify-between overflow-hidden rounded-md bg-gradient-to-br ${COVER_TONES[index % COVER_TONES.length]} p-1.5 text-white shadow-sm ring-1 ring-black/10`}
    >
      <span aria-hidden="true" className="block h-1 w-4 rounded-full bg-white/65" />
      <span className="line-clamp-3 text-[6px] font-bold leading-[1.15]">{titleLines}</span>
      <span aria-hidden="true" className="block h-1 w-2 rounded-full bg-white/50" />
    </div>
  )
}

function MetricCard({ label, value, hint, icon: Icon, tone }: { label: string; value: number; hint: string; icon: LucideIcon; tone: string }) {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardContent className="flex items-center justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value.toLocaleString('es-DO')}</p>
          <p className="mt-1 truncate text-[11px] text-slate-500">{hint}</p>
        </div>
        <span className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </CardContent>
    </Card>
  )
}

function NativeDialog({
  open,
  title,
  description,
  onClose,
  children,
  wide = false,
}: {
  open: boolean
  title: string
  description: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = 'inventory-dialog-title'
  const descriptionId = 'inventory-dialog-description'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
      className={`m-auto w-[calc(100vw-1.5rem)] ${wide ? 'max-w-4xl' : 'max-w-2xl'} max-h-[92dvh] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/45`}
    >
      <div className="flex max-h-[92dvh] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
            <p id={descriptionId} className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Cerrar ventana" onClick={onClose}>
            <X aria-hidden="true" />
          </Button>
        </header>
        {children}
      </div>
    </dialog>
  )
}

function FormField({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="text-[11px] leading-4 text-slate-500">{hint}</span>}
    </label>
  )
}

function WorkDialog({
  open,
  book,
  authors,
  categories,
  specimens,
  onClose,
  onSave,
  registerObjectUrl,
}: {
  open: boolean
  book: Book | null
  authors: Author[]
  categories: Category[]
  specimens: Specimen[]
  onClose: () => void
  onSave: (values: BookFormValues) => void
  registerObjectUrl: (url: string) => void
}) {
  const activeStock = book ? specimens.filter((specimen) => specimen.bookId === book.id && specimen.status !== 'DADO_DE_BAJA').length : 0
  const [values, setValues] = useState({
    title: '', isbn: '', edition: '1.ª edición', year: String(new Date().getFullYear()), authorId: '', categoryId: '',
    publisher: '', aisle: '', shelf: '', initialStock: 1,
  })
  const [coverDraft, setCoverDraft] = useState<{ url: string; size: number } | null>(null)
  const [compressing, setCompressing] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!open) return
    setFormError('')
    setCoverDraft(null)
    setValues(book ? {
      title: book.title, isbn: book.isbn, edition: book.edition, year: book.year, authorId: book.authorId,
      categoryId: book.categoryId, publisher: book.publisher, aisle: book.aisle, shelf: book.shelf, initialStock: activeStock,
    } : {
      title: '', isbn: '', edition: '1.ª edición', year: String(new Date().getFullYear()),
      authorId: authors[0]?.id ?? '', categoryId: categories[0]?.id ?? '', publisher: '', aisle: '', shelf: '', initialStock: 1,
    })
  }, [open, book, activeStock, authors, categories])

  async function handleCoverChange(file: File | undefined) {
    if (!file) return
    setFormError('')
    setCompressing(true)
    try {
      const compressed = await compressCover(file)
      const url = URL.createObjectURL(compressed)
      registerObjectUrl(url)
      setCoverDraft({ url, size: compressed.size })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo procesar la portada.')
    } finally {
      setCompressing(false)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedIsbn = values.isbn.replace(/[\s-]/g, '')
    if (normalizedIsbn.length < 10 || normalizedIsbn.length > 13) {
      setFormError('Verifica el ISBN: debe contener entre 10 y 13 caracteres, sin contar guiones.')
      return
    }
    if (!book && (!Number.isInteger(values.initialStock) || values.initialStock < 1 || values.initialStock > 999)) {
      setFormError('El stock inicial debe ser un número entero entre 1 y 999.')
      return
    }
    onSave({
      title: values.title.trim(), isbn: normalizedIsbn, edition: values.edition.trim(), year: values.year.trim(),
      authorId: values.authorId, categoryId: values.categoryId, publisher: values.publisher.trim(),
      aisle: values.aisle.trim().toUpperCase(), shelf: values.shelf.trim().toUpperCase(), initialStock: values.initialStock,
      coverUrl: coverDraft?.url ?? book?.coverUrl ?? null, coverSizeBytes: coverDraft?.size ?? book?.coverSizeBytes ?? null,
    })
    onClose()
  }

  return (
    <NativeDialog
      open={open}
      title={book ? 'Editar obra' : 'Alta de nueva obra'}
      description={book ? 'Actualiza los datos bibliográficos y la ubicación del título.' : 'Registra la obra y genera sus ejemplares físicos iniciales.'}
      onClose={onClose}
      wide
    >
      <form onSubmit={submit} className="flex min-h-0 flex-col">
        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Título de la obra">
              <Input autoFocus required maxLength={180} value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} placeholder="Título completo" className="h-10 rounded-lg border-slate-300 bg-white" />
            </FormField>
            <FormField label="ISBN">
              <Input required inputMode="numeric" value={values.isbn} onChange={(event) => setValues({ ...values, isbn: event.target.value })} placeholder="978-0-000-00000-0" className="h-10 rounded-lg border-slate-300 bg-white font-mono" />
            </FormField>
            <FormField label="Edición">
              <Input required value={values.edition} onChange={(event) => setValues({ ...values, edition: event.target.value })} placeholder="1.ª edición" className="h-10 rounded-lg border-slate-300 bg-white" />
            </FormField>
            <FormField label="Año de publicación">
              <Input required inputMode="numeric" maxLength={4} value={values.year} onChange={(event) => setValues({ ...values, year: event.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="2026" className="h-10 rounded-lg border-slate-300 bg-white" />
            </FormField>
            <FormField label="Autor">
              <select required value={values.authorId} onChange={(event) => setValues({ ...values, authorId: event.target.value })} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-blue-800">
                <option value="" disabled>Selecciona un autor</option>
                {authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
              </select>
            </FormField>
            <FormField label="Categoría">
              <select required value={values.categoryId} onChange={(event) => setValues({ ...values, categoryId: event.target.value })} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-blue-800">
                <option value="" disabled>Selecciona una categoría</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </FormField>
            <FormField label="Editorial">
              <Input required value={values.publisher} onChange={(event) => setValues({ ...values, publisher: event.target.value })} placeholder="Editorial" className="h-10 rounded-lg border-slate-300 bg-white" />
            </FormField>
            <FormField label="Pasillo">
              <Input required maxLength={12} value={values.aisle} onChange={(event) => setValues({ ...values, aisle: event.target.value })} placeholder="A" className="h-10 rounded-lg border-slate-300 bg-white" />
            </FormField>
            <FormField label="Estante">
              <Input required maxLength={12} value={values.shelf} onChange={(event) => setValues({ ...values, shelf: event.target.value })} placeholder="03" className="h-10 rounded-lg border-slate-300 bg-white" />
            </FormField>
            <FormField label={book ? 'Stock inicial' : 'Stock inicial'} hint={book ? 'El stock existente se administra por ejemplar; no se eliminan registros desde este formulario.' : 'Se crearán ejemplares con códigos únicos en estado disponible.'}>
              <Input type="number" min={book ? 0 : 1} max="999" step="1" required disabled={Boolean(book)} value={values.initialStock} onChange={(event) => setValues({ ...values, initialStock: Number(event.target.value) })} className="h-10 rounded-lg border-slate-300 bg-white" />
            </FormField>
          </div>

          <section aria-labelledby="cover-section-title" className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 id="cover-section-title" className="text-sm font-bold text-slate-800">Portada</h3>
                <p className="mt-1 text-xs text-slate-500">JPG, PNG o WebP · optimización local antes del envío.</p>
              </div>
              <Badge variant="outline" className="h-6 gap-1.5 rounded-full border-emerald-200 bg-emerald-50 px-2.5 text-emerald-800">
                <ShieldCheck aria-hidden="true" data-icon="inline-start" /> RAM Guard · &lt; 300 KB
              </Badge>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white">
                {coverDraft?.url || book?.coverUrl ? (
                  <img src={coverDraft?.url ?? book?.coverUrl ?? undefined} alt="Vista previa de la portada seleccionada" className="size-full object-cover" />
                ) : (
                  <ImagePlus aria-hidden="true" className="size-7 text-slate-400" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <label htmlFor="inventory-cover" className="inline-flex min-h-10 w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-800">
                  <ImagePlus aria-hidden="true" className="size-4" />
                  {compressing ? 'Comprimiendo…' : coverDraft ? 'Cambiar portada' : 'Seleccionar imagen'}
                </label>
                <input id="inventory-cover" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={compressing} onChange={(event) => { void handleCoverChange(event.target.files?.[0]); event.currentTarget.value = '' }} />
                {coverDraft && <p className="text-xs font-semibold text-emerald-700">Optimizada: {(coverDraft.size / 1024).toFixed(0)} KB de 300 KB</p>}
                <p className="max-w-xl text-xs leading-5 text-slate-600">La compresión se ejecuta en el navegador. La carga a Supabase necesita una sesión de personal autenticada; esta vista no envía una clave privilegiada desde el cliente.</p>
              </div>
            </div>
          </section>
          {formError && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{formError}</p>}
        </div>
        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button type="button" variant="outline" onClick={onClose} className="h-10 border-slate-300">Cancelar</Button>
          <Button type="submit" disabled={compressing || authors.length === 0 || categories.length === 0} className="h-10 bg-[#1E3A8A] text-white hover:bg-[#172E6E]">
            <Check aria-hidden="true" data-icon="inline-start" /> {book ? 'Guardar cambios' : 'Registrar obra'}
          </Button>
        </footer>
      </form>
    </NativeDialog>
  )
}

function SpecimensDialog({
  open,
  book,
  category,
  specimens,
  allSpecimens,
  onClose,
  onAdd,
  onStatusChange,
  onCodeSave,
}: {
  open: boolean
  book: Book | null
  category?: Category
  specimens: Specimen[]
  allSpecimens: Specimen[]
  onClose: () => void
  onAdd: () => void
  onStatusChange: (specimenId: string, status: SpecimenStatus) => void
  onCodeSave: (specimenId: string, code: string) => boolean
}) {
  const [codes, setCodes] = useState<Record<string, string>>({})
  const [codeError, setCodeError] = useState('')

  useEffect(() => {
    if (!open) return
    setCodes(Object.fromEntries(specimens.map((specimen) => [specimen.id, specimen.code])))
    setCodeError('')
  }, [open, book?.id, specimens])

  return (
    <NativeDialog open={open} title="Gestión de ejemplares" description={book ? `${book.title} · control individual del inventario físico` : ''} onClose={onClose} wide>
      <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3.5">
          <div>
            <p className="text-sm font-bold text-slate-800">Ejemplares vinculados a esta obra</p>
            <p className="mt-1 text-xs text-slate-600">Cada registro conserva su código, estado e historial.</p>
          </div>
          <Button type="button" onClick={onAdd} className="h-9 bg-[#1E3A8A] text-white hover:bg-[#172E6E]">
            <Plus aria-hidden="true" data-icon="inline-start" /> Añadir ejemplar
          </Button>
        </div>
        {codeError && <p role="alert" className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{codeError}</p>}
        {specimens.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">Esta obra todavía no tiene ejemplares.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {specimens.map((specimen) => (
              <div key={specimen.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(150px,1fr)_minmax(170px,1fr)_auto] sm:items-center">
                <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500">
                  Código de inventario
                  <Input
                    value={codes[specimen.id] ?? specimen.code}
                    disabled={specimen.status === 'DADO_DE_BAJA'}
                    maxLength={32}
                    onChange={(event) => setCodes((previous) => ({ ...previous, [specimen.id]: event.target.value.toUpperCase() }))}
                    onBlur={() => {
                      const nextCode = (codes[specimen.id] ?? specimen.code).trim().toUpperCase()
                      const duplicate = allSpecimens.some((other) => other.id !== specimen.id && normalize(other.code) === normalize(nextCode))
                      if (!nextCode || duplicate || !onCodeSave(specimen.id, nextCode)) {
                        setCodeError('Cada código de inventario debe ser único y no puede quedar vacío.')
                        setCodes((previous) => ({ ...previous, [specimen.id]: specimen.code }))
                        return
                      }
                      setCodeError('')
                    }}
                    className="h-9 rounded-lg border-slate-300 bg-slate-50 font-mono text-xs uppercase"
                  />
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500">
                  Estado del ejemplar
                  <select value={specimen.status} disabled={specimen.status === 'DADO_DE_BAJA'} onChange={(event) => onStatusChange(specimen.id, event.target.value as SpecimenStatus)} className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-blue-800 disabled:bg-slate-100">
                    {STATUS_OPTIONS.filter((status) => status !== 'DADO_DE_BAJA').map((status) => <option key={status} value={status}>{STATUS_DETAILS[status].label}</option>)}
                    {specimen.status === 'DADO_DE_BAJA' && <option value="DADO_DE_BAJA">Dado de baja</option>}
                  </select>
                </label>
                <div className="flex items-center gap-2 sm:justify-end"><StatusBadge status={specimen.status} /></div>
                {specimen.status === 'DADO_DE_BAJA' && specimen.retirementReason && (
                  <p className="sm:col-span-3 rounded-lg bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-800">Baja lógica registrada: {specimen.retirementReason}{specimen.retiredAt ? ` · ${specimen.retiredAt}` : ''}</p>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-slate-500">Categoría asociada: <span className="font-semibold text-slate-700">{category?.name ?? 'Sin categoría'}</span>. No se eliminan ejemplares desde este panel.</p>
      </div>
      <footer className="flex justify-end border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
        <Button type="button" variant="outline" onClick={onClose} className="h-10 border-slate-300">Cerrar</Button>
      </footer>
    </NativeDialog>
  )
}

function RetirementDialog({
  open,
  book,
  specimens,
  onClose,
  onRetire,
}: {
  open: boolean
  book: Book | null
  specimens: Specimen[]
  onClose: () => void
  onRetire: (specimenId: string, reason: string) => void
}) {
  const eligible = useMemo(() => specimens.filter((specimen) => specimen.status !== 'EN_PRESTAMO' && specimen.status !== 'DADO_DE_BAJA'), [specimens])
  const [specimenId, setSpecimenId] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setSpecimenId(eligible[0]?.id ?? '')
    setReason('')
    setError('')
  }, [open, book?.id, eligible])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!specimenId) {
      setError('No hay ejemplares elegibles para dar de baja. Los ejemplares en préstamo deben devolverse primero.')
      return
    }
    if (reason.trim().length < 10) {
      setError('La justificación debe incluir al menos 10 caracteres.')
      return
    }
    onRetire(specimenId, reason.trim())
    onClose()
  }

  return (
    <NativeDialog open={open} title="Baja auditada de ejemplar" description={book ? `Retiro controlado · ${book.title}` : ''} onClose={onClose}>
      <form onSubmit={submit} className="flex min-h-0 flex-col">
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-800" />
            <div>
              <p className="text-sm font-bold text-amber-950">Baja lógica, no eliminación física</p>
              <p className="mt-1 text-xs leading-5 text-amber-900">El registro del ejemplar y su justificación quedan conservados para auditoría. Si existen préstamos asociados, estos no se eliminan; un ejemplar prestado debe devolverse antes del retiro.</p>
            </div>
          </div>
          <FormField label="Ejemplar a retirar">
            <select required value={specimenId} onChange={(event) => setSpecimenId(event.target.value)} disabled={eligible.length === 0} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-blue-800 disabled:bg-slate-100">
              {eligible.length === 0 ? <option value="">Sin ejemplares elegibles</option> : eligible.map((specimen) => <option key={specimen.id} value={specimen.id}>{specimen.code} · {STATUS_DETAILS[specimen.status].label}</option>)}
            </select>
          </FormField>
          <FormField label="Motivo de baja" hint="Indica el daño, pérdida u otra causa. La justificación queda vinculada al código de inventario.">
            <textarea required minLength={10} maxLength={500} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Describe el deterioro o la pérdida…" className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-800" />
          </FormField>
          {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
        </div>
        <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button type="button" variant="outline" onClick={onClose} className="h-10 border-slate-300">Cancelar</Button>
          <Button type="submit" disabled={eligible.length === 0} className="h-10 bg-rose-700 text-white hover:bg-rose-800">
            <Archive aria-hidden="true" data-icon="inline-start" /> Registrar baja lógica
          </Button>
        </footer>
      </form>
    </NativeDialog>
  )
}

function TaxonomyDialog({
  open,
  authors,
  categories,
  books,
  onClose,
  onAddAuthor,
  onAddCategory,
  onRemoveAuthor,
  onRemoveCategory,
}: {
  open: boolean
  authors: Author[]
  categories: Category[]
  books: Book[]
  onClose: () => void
  onAddAuthor: (name: string) => void
  onAddCategory: (name: string) => void
  onRemoveAuthor: (id: string) => void
  onRemoveCategory: (id: string) => void
}) {
  const [tab, setTab] = useState<'authors' | 'categories'>('authors')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setError('')
  }, [open])

  const isAuthorTab = tab === 'authors'
  const items = isAuthorTab ? authors : categories

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError('Escribe al menos dos caracteres.')
      return
    }
    const duplicate = items.some((item) => normalize(item.name) === normalize(trimmed))
    if (duplicate) {
      setError('Ese nombre ya está registrado.')
      return
    }
    if (isAuthorTab) onAddAuthor(trimmed)
    else onAddCategory(trimmed)
    setName('')
    setError('')
  }

  return (
    <NativeDialog open={open} title="Autores y categorías" description="Mantén normalizados los catálogos que relacionan las obras." onClose={onClose}>
      <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
        <div role="tablist" aria-label="Tipo de catálogo" className="mb-4 flex rounded-xl bg-slate-100 p-1">
          <button type="button" role="tab" aria-selected={isAuthorTab} onClick={() => { setTab('authors'); setError('') }} className={`flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${isAuthorTab ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            <Users aria-hidden="true" className="size-4" /> Autores <span className="text-xs text-slate-400">{authors.length}</span>
          </button>
          <button type="button" role="tab" aria-selected={!isAuthorTab} onClick={() => { setTab('categories'); setError('') }} className={`flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${!isAuthorTab ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            <Tags aria-hidden="true" className="size-4" /> Categorías <span className="text-xs text-slate-400">{categories.length}</span>
          </button>
        </div>
        <form onSubmit={addItem} className="flex flex-col gap-2 sm:flex-row">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={isAuthorTab ? 'Nombre completo del autor' : 'Nombre de la categoría'} aria-label={isAuthorTab ? 'Nuevo autor' : 'Nueva categoría'} className="h-10 rounded-lg border-slate-300 bg-white" />
          <Button type="submit" className="h-10 shrink-0 bg-[#1E3A8A] text-white hover:bg-[#172E6E]"><Plus aria-hidden="true" data-icon="inline-start" /> Agregar</Button>
        </form>
        {error && <p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}
        <div role="tabpanel" className="mt-4 flex max-h-[45dvh] flex-col gap-2 overflow-y-auto">
          {items.map((item) => {
            const usedCount = isAuthorTab
              ? books.filter((book) => book.authorId === item.id).length
              : books.filter((book) => book.categoryId === item.id).length
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                  <p className="text-[11px] text-slate-500">{usedCount} {usedCount === 1 ? 'obra relacionada' : 'obras relacionadas'}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" disabled={usedCount > 0} aria-label={`Eliminar ${item.name}`} title={usedCount > 0 ? 'No se puede eliminar mientras existan obras relacionadas' : 'Eliminar del catálogo'} onClick={() => isAuthorTab ? onRemoveAuthor(item.id) : onRemoveCategory(item.id)} className="shrink-0 text-slate-600 hover:bg-rose-50 hover:text-rose-700">
                  <X aria-hidden="true" data-icon="inline-start" /> Quitar
                </Button>
              </div>
            )
          })}
        </div>
      </div>
      <footer className="flex justify-end border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
        <Button type="button" variant="outline" onClick={onClose} className="h-10 border-slate-300">Cerrar</Button>
      </footer>
    </NativeDialog>
  )
}

export function InventoryManager() {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS)
  const [authors, setAuthors] = useState<Author[]>(INITIAL_AUTHORS)
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES)
  const [specimens, setSpecimens] = useState<Specimen[]>(INITIAL_SPECIMENS)
  const [dialog, setDialog] = useState<CatalogDialog>(null)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('TODAS')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS')
  const [announcement, setAnnouncement] = useState('')
  const objectUrls = useRef(new Set<string>())

  useEffect(() => () => { objectUrls.current.forEach((url) => URL.revokeObjectURL(url)) }, [])

  const selectedBook = dialog && 'bookId' in dialog ? books.find((book) => book.id === dialog.bookId) ?? null : null
  const selectedCategory = selectedBook ? categories.find((category) => category.id === selectedBook.categoryId) : undefined
  const filteredBooks = useMemo(() => {
    const search = normalize(query.trim())
    return books.filter((book) => {
      const authorName = authors.find((author) => author.id === book.authorId)?.name ?? ''
      const matchesSearch = !search || [book.title, book.isbn, authorName].some((value) => normalize(value).includes(search))
      const matchesCategory = categoryFilter === 'TODAS' || book.categoryId === categoryFilter
      const matchesStatus = statusFilter === 'TODOS' || specimens.some((specimen) => specimen.bookId === book.id && specimen.status === statusFilter)
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [authors, books, categoryFilter, query, specimens, statusFilter])

  const availableCount = specimens.filter((specimen) => specimen.status === 'DISPONIBLE').length
  const activeCount = specimens.filter((specimen) => specimen.status !== 'DADO_DE_BAJA').length
  const loanedCount = specimens.filter((specimen) => specimen.status === 'EN_PRESTAMO').length
  const retiredCount = specimens.filter((specimen) => specimen.status === 'DADO_DE_BAJA').length

  function bookSpecimens(bookId: string) {
    return specimens.filter((specimen) => specimen.bookId === bookId)
  }

  function saveBook(values: BookFormValues) {
    if (dialog?.type === 'edit') {
      const bookId = dialog.bookId
      setBooks((current) => current.map((book) => book.id === bookId ? {
        id: book.id,
        title: values.title,
        isbn: values.isbn,
        edition: values.edition,
        year: values.year,
        authorId: values.authorId,
        categoryId: values.categoryId,
        publisher: values.publisher,
        aisle: values.aisle,
        shelf: values.shelf,
        coverUrl: values.coverUrl,
        coverSizeBytes: values.coverSizeBytes,
      } : book))
      setAnnouncement(`Se actualizaron los datos de “${values.title}” en esta vista.`)
      return
    }

    const bookId = createId('book')
    const newBook: Book = {
      id: bookId, title: values.title, isbn: values.isbn, edition: values.edition, year: values.year,
      authorId: values.authorId, categoryId: values.categoryId, publisher: values.publisher,
      aisle: values.aisle, shelf: values.shelf, coverUrl: values.coverUrl, coverSizeBytes: values.coverSizeBytes,
    }
    setBooks((current) => [newBook, ...current])
    setSpecimens((current) => {
      const added: Specimen[] = []
      for (let index = 0; index < values.initialStock; index += 1) {
        const code = nextSpecimenCode(categories.find((category) => category.id === values.categoryId), [...current, ...added])
        added.push({ id: createId('copy'), bookId, code, status: 'DISPONIBLE' })
      }
      return [...current, ...added]
    })
    setAnnouncement(`“${values.title}” se agregó a la sesión con ${values.initialStock} ejemplar${values.initialStock === 1 ? '' : 'es'}.`)
  }

  function addSpecimen(book: Book) {
    const code = nextSpecimenCode(categories.find((category) => category.id === book.categoryId), specimens)
    setSpecimens((current) => [...current, { id: createId('copy'), bookId: book.id, code, status: 'DISPONIBLE' }])
    setAnnouncement(`Se agregó el ejemplar ${code} a esta sesión.`)
  }

  function updateSpecimenCode(specimenId: string, code: string) {
    const duplicate = specimens.some((specimen) => specimen.id !== specimenId && normalize(specimen.code) === normalize(code))
    if (duplicate) return false
    setSpecimens((current) => current.map((specimen) => specimen.id === specimenId ? { ...specimen, code } : specimen))
    return true
  }

  function changeSpecimenStatus(specimenId: string, status: SpecimenStatus) {
    setSpecimens((current) => current.map((specimen) => specimen.id === specimenId ? { ...specimen, status } : specimen))
    setAnnouncement(`Se actualizó el estado del ejemplar ${specimens.find((specimen) => specimen.id === specimenId)?.code ?? ''}.`)
  }

  function retireSpecimen(specimenId: string, reason: string) {
    const date = new Intl.DateTimeFormat('es-DO', { dateStyle: 'medium' }).format(new Date())
    const specimen = specimens.find((item) => item.id === specimenId)
    setSpecimens((current) => current.map((item) => item.id === specimenId ? { ...item, status: 'DADO_DE_BAJA', retirementReason: reason, retiredAt: date } : item))
    setAnnouncement(`Baja lógica registrada para ${specimen?.code ?? 'el ejemplar'}. El historial se conserva.`)
  }

  function addAuthor(name: string) {
    setAuthors((current) => [...current, { id: createId('author'), name }])
    setAnnouncement(`Se agregó el autor “${name}” a esta sesión.`)
  }

  function addCategory(name: string) {
    setCategories((current) => [...current, { id: createId('category'), name }])
    setAnnouncement(`Se agregó la categoría “${name}” a esta sesión.`)
  }

  function registerObjectUrl(url: string) {
    objectUrls.current.add(url)
  }

  function clearFilters() {
    setQuery('')
    setCategoryFilter('TODAS')
    setStatusFilter('TODOS')
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        <span>Biblonexo</span><span aria-hidden="true">/</span><span>Administración</span><span aria-hidden="true">/</span>
        <span aria-current="page" className="font-semibold text-slate-800">Gestor de inventario</span>
      </nav>

      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#1E3A8A]">Administración · Acervo bibliográfico</p>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Gestor de inventario</h1>
            <Badge variant="outline" className="h-6 rounded-full border-blue-200 bg-blue-50 px-2.5 text-blue-800">Catálogo general</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">Administra obras, ejemplares físicos, ubicaciones y retiros auditados desde un solo lugar.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button type="button" variant="outline" onClick={() => setDialog({ type: 'taxonomy' })} className="h-10 border-slate-300 bg-white text-slate-700">
            <Users aria-hidden="true" data-icon="inline-start" /> Gestionar autores / categorías
          </Button>
          <Button type="button" onClick={() => setDialog({ type: 'create' })} className="h-10 bg-[#1E3A8A] text-white shadow-sm hover:bg-[#172E6E]">
            <Plus aria-hidden="true" data-icon="inline-start" /> Alta de nueva obra
          </Button>
        </div>
      </header>

      <div role="status" className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 sm:flex-row sm:items-start">
        <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-800" />
        <p className="text-xs leading-5 text-amber-950"><span className="font-bold">Vista interactiva de demostración.</span> Supabase está conectado, pero todavía no hay tablas de catálogo ni bucket de portadas; el login actual también es simulado. Los cambios de esta pantalla se mantienen en memoria y no se guardan al recargar.</p>
      </div>

      <section aria-label="Resumen del inventario" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Obras en catálogo" value={books.length} hint="Títulos registrados" icon={BookOpen} tone="bg-blue-50 text-[#1E3A8A]" />
        <MetricCard label="Ejemplares activos" value={activeCount} hint={`${retiredCount} con baja lógica`} icon={Boxes} tone="bg-indigo-50 text-indigo-800" />
        <MetricCard label="Disponibles" value={availableCount} hint="Listos para préstamo" icon={PackageCheck} tone="bg-emerald-50 text-emerald-800" />
        <MetricCard label="En préstamo" value={loanedCount} hint="Fuera del estante" icon={Wrench} tone="bg-amber-50 text-amber-900" />
      </section>

      <Card className="overflow-visible rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader className="gap-1 border-b border-slate-100 px-4 py-4 sm:px-5">
          <CardTitle className="text-base font-bold text-slate-900">Catálogo bibliográfico</CardTitle>
          <CardDescription className="text-xs">Vista normalizada: obras, autores, categorías y ejemplares se administran por separado.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-4 py-4 sm:px-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_minmax(170px,220px)_minmax(170px,220px)]">
            <label className="relative flex min-w-0 items-center">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 size-4 text-slate-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título, ISBN o autor…" aria-label="Buscar por título, ISBN o autor" className="h-10 rounded-lg border-slate-300 bg-white pl-9" />
            </label>
            <label className="relative flex min-w-0 items-center">
              <span className="sr-only">Filtrar por categoría</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-blue-800">
                <option value="TODAS">Todas las categorías</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-4 text-slate-400" />
            </label>
            <label className="relative flex min-w-0 items-center">
              <span className="sr-only">Filtrar por estado del ejemplar</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-blue-800">
                <option value="TODOS">Todos los estados</option>
                {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{STATUS_DETAILS[status].label}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-4 text-slate-400" />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <p aria-live="polite">{filteredBooks.length} {filteredBooks.length === 1 ? 'obra encontrada' : 'obras encontradas'}</p>
            {(query || categoryFilter !== 'TODAS' || statusFilter !== 'TODOS') && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-slate-600">Limpiar filtros</Button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <th scope="col" className="px-4 py-3">Portada</th>
                  <th scope="col" className="px-4 py-3">Título / edición / ISBN</th>
                  <th scope="col" className="px-4 py-3">Autor / categoría</th>
                  <th scope="col" className="px-4 py-3">Stock</th>
                  <th scope="col" className="px-4 py-3">Ubicación</th>
                  <th scope="col" className="px-3 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredBooks.map((book) => {
                  const index = books.findIndex((item) => item.id === book.id)
                  const author = authors.find((item) => item.id === book.authorId)
                  const category = categories.find((item) => item.id === book.categoryId)
                  const copies = bookSpecimens(book.id)
                  const total = copies.filter((specimen) => specimen.status !== 'DADO_DE_BAJA').length
                  const available = copies.filter((specimen) => specimen.status === 'DISPONIBLE').length
                  const showState = statusFilter !== 'TODOS' ? copies.find((specimen) => specimen.status === statusFilter)?.status : null
                  return (
                    <tr key={book.id} className="align-middle transition-colors hover:bg-slate-50/70">
                      <td className="px-4 py-3"><BookCover book={book} index={index} /></td>
                      <td className="max-w-[290px] px-4 py-3">
                        <p className="line-clamp-2 text-sm font-bold leading-5 text-slate-900">{book.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{book.edition} · {book.year}</p>
                        <p className="mt-1 font-mono text-[11px] text-slate-500">ISBN {book.isbn}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-800">{author?.name ?? 'Autor sin asignar'}</p>
                        <p className="mt-1 text-xs text-slate-500">{category?.name ?? 'Sin categoría'}</p>
                        {showState && <div className="mt-2"><StatusBadge status={showState} /></div>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-900">{total} <span className="font-normal text-slate-400">total</span></p>
                        <p className="mt-1 text-xs text-emerald-700">{available} disponibles</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800"><MapPin aria-hidden="true" className="size-3.5 text-slate-400" /> Pasillo {book.aisle}</p>
                        <p className="mt-1 pl-5 text-xs text-slate-500">Estante {book.shelf}</p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-1">
                          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Gestionar ejemplares de ${book.title}`} title="Gestionar ejemplares" onClick={() => setDialog({ type: 'specimens', bookId: book.id })} className="text-slate-600 hover:bg-blue-50 hover:text-blue-800">
                            <Boxes aria-hidden="true" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Editar ${book.title}`} title="Editar obra" onClick={() => setDialog({ type: 'edit', bookId: book.id })} className="text-slate-600 hover:bg-blue-50 hover:text-blue-800">
                            <Pencil aria-hidden="true" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Dar de baja un ejemplar de ${book.title}`} title="Dar de baja" onClick={() => setDialog({ type: 'retire', bookId: book.id })} className="text-slate-600 hover:bg-rose-50 hover:text-rose-700">
                            <Archive aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredBooks.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-500"><Search aria-hidden="true" className="size-5" /></span>
                <p className="text-sm font-semibold text-slate-800">No hay obras que coincidan</p>
                <p className="max-w-sm text-xs leading-5 text-slate-500">Modifica la búsqueda o los filtros para consultar el catálogo.</p>
                <Button type="button" variant="outline" size="sm" onClick={clearFilters} className="mt-1 border-slate-300">Limpiar filtros</Button>
              </div>
            )}
          </div>

          <p role="status" aria-live="polite" className="min-h-5 text-xs text-slate-500">{announcement}</p>
        </CardContent>
      </Card>

      {dialog?.type === 'create' && (
        <WorkDialog open book={null} authors={authors} categories={categories} specimens={specimens} onClose={() => setDialog(null)} onSave={saveBook} registerObjectUrl={registerObjectUrl} />
      )}
      {dialog?.type === 'edit' && selectedBook && (
        <WorkDialog open book={selectedBook} authors={authors} categories={categories} specimens={specimens} onClose={() => setDialog(null)} onSave={saveBook} registerObjectUrl={registerObjectUrl} />
      )}
      {dialog?.type === 'specimens' && selectedBook && (
        <SpecimensDialog open book={selectedBook} category={selectedCategory} specimens={bookSpecimens(selectedBook.id)} allSpecimens={specimens} onClose={() => setDialog(null)} onAdd={() => addSpecimen(selectedBook)} onStatusChange={changeSpecimenStatus} onCodeSave={updateSpecimenCode} />
      )}
      {dialog?.type === 'retire' && selectedBook && (
        <RetirementDialog open book={selectedBook} specimens={bookSpecimens(selectedBook.id)} onClose={() => setDialog(null)} onRetire={retireSpecimen} />
      )}
      {dialog?.type === 'taxonomy' && (
        <TaxonomyDialog open authors={authors} categories={categories} books={books} onClose={() => setDialog(null)} onAddAuthor={addAuthor} onAddCategory={addCategory} onRemoveAuthor={(id) => setAuthors((current) => current.filter((item) => item.id !== id))} onRemoveCategory={(id) => setCategories((current) => current.filter((item) => item.id !== id))} />
      )}
    </div>
  )
}

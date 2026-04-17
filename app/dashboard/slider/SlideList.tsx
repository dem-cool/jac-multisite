'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { reorderSlides } from './actions'

interface Slide {
  id: string
  image_url: string
  headline: string | null
  link: string | null
  sort_order: number
}

function SortableRow({ slide }: { slide: Slide }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-md border border-neutral-200 bg-background p-3 dark:border-neutral-700"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab select-none rounded px-2 py-1 text-neutral-400 hover:bg-neutral-100 hover:text-foreground active:cursor-grabbing dark:hover:bg-neutral-800"
        aria-label="Przeciągnij, aby zmienić kolejność"
      >
        ⋮⋮
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.image_url}
        alt={slide.headline ?? ''}
        className="h-14 w-24 rounded object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {slide.headline || <span className="italic text-neutral-500">Bez nagłówka</span>}
        </p>
        {slide.link && <p className="truncate text-xs text-neutral-500">{slide.link}</p>}
      </div>
      <Link
        href={`/dashboard/slider/${slide.id}/edit`}
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        Edytuj
      </Link>
    </div>
  )
}

export default function SlideList({ initial }: { initial: Slide[] }) {
  const [items, setItems] = useState(initial)
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(ev: DragEndEvent) {
    const { active, over } = ev
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)
    setError(null)
    startTransition(async () => {
      const res = await reorderSlides(next.map((s) => s.id))
      if (!res.ok) setError(res.error ?? 'Błąd zapisu kolejności')
    })
  }

  if (!items.length) {
    return <p className="text-sm text-neutral-500">Brak slajdów. Dodaj pierwszy.</p>
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((slide) => (
              <SortableRow key={slide.id} slide={slide} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

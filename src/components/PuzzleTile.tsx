import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface PuzzleTileProps {
  id: string
  imageUrl: string
  gridSize: number
  tileSize: number
  isCompleted: boolean
  x: number
  y: number
}

export default function PuzzleTile({ 
  id, 
  imageUrl, 
  gridSize, 
  tileSize, 
  isCompleted,
  x,
  y
}: PuzzleTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging
  } = useDraggable({ id })

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id })

  const setNodeRef = (node: HTMLElement | null) => {
    setDragRef(node)
    setDropRef(node)
  }

  const style = {
    position: 'absolute' as const,
    left: x,
    top: y,
    transform: CSS.Transform.toString(transform),
    width: tileSize,
    height: tileSize,
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: `${tileSize * gridSize}px ${tileSize * gridSize}px`,
    backgroundPosition: (() => {
      const [row, col] = id.split('-').map(Number)
      return `-${col * tileSize}px -${row * tileSize}px`
    })(),
    border: isDragging ? '3px solid #007bff' : isOver ? '2px solid #4f46e5' : isCompleted ? '2px solid #28a745' : '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1,
    boxShadow: isDragging 
      ? '0 8px 20px rgba(0,123,255,0.3)' 
      : isOver
      ? '0 4px 12px rgba(79,70,229,0.3)'
      : isCompleted 
      ? '0 2px 8px rgba(40,167,69,0.2)'
      : '0 2px 4px rgba(0,0,0,0.1)',
    touchAction: 'none',
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    MozUserSelect: 'none' as const,
    msUserSelect: 'none' as const,
    transition: isDragging ? undefined : 'left 200ms ease, top 200ms ease'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      id={id}
      className={`puzzle-tile ${isDragging ? 'dragging' : ''} ${isCompleted ? 'completed' : ''} ${isOver ? 'over' : ''}`}
    />
  )
}
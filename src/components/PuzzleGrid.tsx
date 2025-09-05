import { useMemo, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import { 
  DndContext, 
  DragOverlay,
  closestCenter
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import PuzzleTile from './PuzzleTile'

interface PuzzleGridProps {
  imageUrl: string
  gridSize: number
  difficulty: 'easy' | 'normal' | 'hard'
  onComplete?: () => void
}

export interface PuzzleGridRef {
  getCurrentOrder: () => string[]
}

interface HistoryState {
  order: string[]
  timestamp: number
}

const PuzzleGrid = forwardRef<PuzzleGridRef, PuzzleGridProps>(({ 
  imageUrl, 
  gridSize, 
  difficulty,
  onComplete 
}, ref) => {
  const tileSize = 400 / gridSize
  
  // 正解配列（"row-col" 形式） - 実際に使用される時のグリッドサイズで計算
  const solvedOrder = useMemo(
    () => Array.from({ length: gridSize * gridSize }, (_, i) => 
      `${Math.floor(i / gridSize)}-${i % gridSize}`
    ),
    [gridSize]
  )

  // 難易度に応じたシャッフル関数
  const shuffleWithDifficulty = useCallback((array: string[], difficulty: 'easy' | 'normal' | 'hard') => {
    const shuffled = [...array]
    let shuffleCount: number
    
    // 難易度に応じてシャッフル回数を決定
    switch (difficulty) {
      case 'easy':
        shuffleCount = Math.max(3, shuffled.length * 0.3) // 30%程度の変更
        break
      case 'normal':
        shuffleCount = shuffled.length // 標準的なシャッフル
        break
      case 'hard':
        shuffleCount = shuffled.length * 2 // 2倍のシャッフル
        break
    }
    
    // 指定回数分Fisher-Yatesシャッフル
    for (let round = 0; round < Math.floor(shuffleCount); round++) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
    }
    
    return shuffled
  }, [])

  // 初期シャッフル（コンポーネント作成時のみ実行）
  const [order, setOrder] = useState(() => {
    const initialSolved = Array.from({ length: gridSize * gridSize }, (_, i) => 
      `${Math.floor(i / gridSize)}-${i % gridSize}`
    )
    return shuffleWithDifficulty(initialSolved, difficulty)
  })

  // Undo/Redo 履歴
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // ドラッグ中のアイテム
  const [activeId, setActiveId] = useState<string | null>(null)

  // refからgetCurrentOrderメソッドを公開
  useImperativeHandle(ref, () => ({
    getCurrentOrder: () => order
  }))

  // 完成判定
  const isCompleted = useMemo(
    () => order.every((id, index) => id === solvedOrder[index]),
    [order, solvedOrder]
  )

  // 完成時のコールバック実行
  useEffect(() => {
    if (isCompleted && onComplete) {
      onComplete()
    }
  }, [isCompleted, onComplete])

  // 履歴に追加
  const addToHistory = useCallback((newOrder: string[]) => {
    const newHistoryState: HistoryState = {
      order: [...newOrder],
      timestamp: Date.now()
    }
    
    // 現在の位置以降の履歴を削除
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newHistoryState)
    
    // 履歴が50件を超えたら古いものを削除
    if (newHistory.length > 50) {
      newHistory.shift()
    }
    
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // ドラッグ開始
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  // ドラッグ終了（入れ替え動作）
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      setActiveId(null)
      return
    }

    const oldIndex = order.indexOf(String(active.id))
    const newIndex = order.indexOf(String(over.id))
    
    console.log('Swap:', String(active.id), 'with', String(over.id))
    console.log('Indices:', oldIndex, 'with', newIndex)
    
    // 入れ替え処理: 2つの要素を直接交換
    const newOrder = [...order]
    const temp = newOrder[oldIndex]
    newOrder[oldIndex] = newOrder[newIndex]
    newOrder[newIndex] = temp
    
    console.log('Old order:', order)
    console.log('New order:', newOrder)
    
    // 履歴に現在の状態を保存
    addToHistory(order)
    setOrder(newOrder)
    setActiveId(null)
  }

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      const previousState = history[historyIndex]
      setOrder([...previousState.order])
      setHistoryIndex(historyIndex - 1)
    }
  }, [history, historyIndex])

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setOrder([...nextState.order])
      setHistoryIndex(historyIndex + 1)
    }
  }, [history, historyIndex])

  // 新しいパズルを生成
  const shufflePuzzle = useCallback(() => {
    const shuffled = shuffleWithDifficulty(solvedOrder, difficulty)
    
    // 履歴に現在の状態を保存してからシャッフル
    if (order.length > 0) {
      addToHistory(order)
    }
    setOrder(shuffled)
  }, [solvedOrder, difficulty, order, addToHistory, shuffleWithDifficulty])

  return (
    <div className="puzzle-grid-container">
      {/* コントロールパネル */}
      <div className="puzzle-controls">
        <div className="history-controls">
          <button 
            onClick={handleUndo} 
            disabled={historyIndex < 0}
            className="btn btn-secondary"
          >
            ↶ Undo
          </button>
          <button 
            onClick={handleRedo} 
            disabled={historyIndex >= history.length - 1}
            className="btn btn-secondary"
          >
            ↷ Redo
          </button>
        </div>
        
        <div className="puzzle-actions">
          <button 
            onClick={shufflePuzzle}
            className="btn btn-shuffle"
          >
            🔀 再シャッフル
          </button>
        </div>
      </div>

      {/* 完成状態表示 */}
      <div className={`puzzle-status ${isCompleted ? 'completed' : ''}`}>
        {isCompleted ? (
          <div className="completion-message">
            🎉 <strong>おめでとうございます！</strong> パズル完成です！
          </div>
        ) : (
          <div className="progress-message">
            🧩 ピースを動かして画像を完成させよう
          </div>
        )}
      </div>

      {/* パズルグリッド */}
      <DndContext 
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div 
          className="puzzle-grid"
          style={{
            position: 'relative',
            width: 400,
            height: 400,
            border: '3px solid #333',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          {order.map((id, index) => {
            const row = Math.floor(index / gridSize)
            const col = index % gridSize
            return (
              <PuzzleTile
                key={id}
                id={id}
                imageUrl={imageUrl}
                gridSize={gridSize}
                tileSize={tileSize}
                isCompleted={isCompleted && id === solvedOrder[index]}
                x={col * tileSize}
                y={row * tileSize}
              />
            )
          })}
        </div>

        {/* ドラッグ中のオーバーレイ */}
        <DragOverlay>
          {activeId ? (
            <PuzzleTile
              id={activeId}
              imageUrl={imageUrl}
              gridSize={gridSize}
              tileSize={tileSize}
              isCompleted={false}
              x={0}
              y={0}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 操作説明 */}
      <div className="puzzle-instructions">
        <h4>📱 操作方法</h4>
        <ul>
          <li><strong>PC</strong>: マウスでドラッグ&ドロップ</li>
          <li><strong>スマホ/タブレット</strong>: 指でタッチしてドラッグ</li>
          <li><strong>Undo/Redo</strong>: 操作を取り消し・やり直し</li>
          <li><strong>再シャッフル</strong>: 新しい配置でスタート</li>
        </ul>
      </div>
    </div>
  )
})

PuzzleGrid.displayName = 'PuzzleGrid'

export default PuzzleGrid
import { useState, useRef } from 'react'
import './App.css'
import PuzzleGrid from './components/PuzzleGrid'
import type { PuzzleGridRef } from './components/PuzzleGrid'

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [gridSize, setGridSize] = useState(3)
  const [showPuzzle, setShowPuzzle] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal')
  const [puzzleKey, setPuzzleKey] = useState(0) // パズル再生成用のキー
  const celebrationShownRef = useRef(false)
  const puzzleGridRef = useRef<PuzzleGridRef | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const img = new Image()
    img.onload = () => {
      setImage(img)
      const url = URL.createObjectURL(file)
      setImageUrl(url)
      setShowPuzzle(false) // Reset puzzle state when new image is uploaded
    }
    img.src = URL.createObjectURL(file)
  }

  const startPuzzle = () => {
    if (!imageUrl) return
    celebrationShownRef.current = false // 祝福フラグをリセット
    setPuzzleKey(prev => prev + 1) // パズルを新しくキーで再生成
    setShowPuzzle(true)
  }

  const handlePuzzleComplete = () => {
    if (celebrationShownRef.current) return // 既に祝福が表示されている場合はスキップ
    
    celebrationShownRef.current = true
    setCompletedCount(prev => prev + 1)
    
    setTimeout(() => {
      alert('🎉 パズル完成おめでとうございます！')
    }, 500)
  }

  const savePuzzleState = async () => {
    if (!showPuzzle || !image || !puzzleGridRef.current) return

    try {
      // 現在のパズル配列を取得
      const currentOrder = puzzleGridRef.current.getCurrentOrder()
      
      // Canvasに現在の状態を描画
      const canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 400
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        // 背景を白にする
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        const tileSize = 400 / gridSize
        
        // 現在の配列順序に基づいて描画
        currentOrder.forEach((id, index) => {
          const [row, col] = id.split('-').map(Number)
          const currentRow = Math.floor(index / gridSize)
          const currentCol = index % gridSize
          
          // 元画像の該当部分を現在の位置に描画
          ctx.drawImage(
            image,
            col * tileSize, row * tileSize, tileSize, tileSize,
            currentCol * tileSize, currentRow * tileSize, tileSize, tileSize
          )
        })
        
        // 保存
        canvas.toBlob((blob) => {
          if (!blob) return

          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `puzzle-state-${gridSize}x${gridSize}-${Date.now()}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 'image/png')
      }
    } catch (error) {
      console.error('パズル状態の保存に失敗しました:', error)
      alert('パズル状態の保存に失敗しました')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧩 Puzzle Maker</h1>
        <p>画像をアップロードしてパズルを作成しよう！</p>
        {completedCount > 0 && (
          <div className="completion-counter">
            🏆 完成回数: {completedCount}回
          </div>
        )}
      </header>

      <div className="controls">
        <div className="file-input">
          <label htmlFor="image-upload" className="btn btn-primary">
            📁 画像を選択
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div className="grid-size">
          <label>
            グリッドサイズ:
            <select
              value={gridSize}
              onChange={(e) => {
                setGridSize(Number(e.target.value))
                if (showPuzzle) {
                  // パズル中なら新設定で自動再スタート
                  celebrationShownRef.current = false
                  setPuzzleKey(prev => prev + 1)
                }
              }}
            >
              <option value={2}>2×2 (簡単)</option>
              <option value={3}>3×3 (普通)</option>
              <option value={4}>4×4 (難しい)</option>
              <option value={5}>5×5 (激ムズ)</option>
              <option value={6}>6×6 (鬼)</option>
            </select>
          </label>
        </div>

        <div className="difficulty-select">
          <label>
            難易度:
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value as 'easy' | 'normal' | 'hard')
                if (showPuzzle) {
                  // パズル中なら新設定で自動再スタート
                  celebrationShownRef.current = false
                  setPuzzleKey(prev => prev + 1)
                }
              }}
            >
              <option value="easy">🟢 簡単 (少しシャッフル)</option>
              <option value="normal">🟡 普通 (標準シャッフル)</option>
              <option value="hard">🔴 困難 (激しくシャッフル)</option>
            </select>
          </label>
        </div>

        {!showPuzzle && (
          <button
            className="btn btn-shuffle"
            onClick={startPuzzle}
            disabled={!imageUrl}
          >
            🎯 パズルスタート
          </button>
        )}

        <button
          className="btn btn-save"
          onClick={savePuzzleState}
          disabled={!showPuzzle}
        >
          💾 パズル状態を保存
        </button>
      </div>

      <div className="puzzle-container">
        {imageUrl && !showPuzzle && (
          <div className="image-preview">
            <h3>📸 選択した画像</h3>
            <img 
              src={imageUrl} 
              alt="Selected" 
              style={{ 
                maxWidth: '400px', 
                maxHeight: '400px', 
                border: '3px solid #333', 
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <p>👆 「パズルスタート」ボタンを押して始めよう！</p>
          </div>
        )}

        {showPuzzle && imageUrl && (
          <PuzzleGrid 
            key={puzzleKey}
            ref={puzzleGridRef}
            imageUrl={imageUrl}
            gridSize={gridSize}
            difficulty={difficulty}
            onComplete={handlePuzzleComplete}
          />
        )}
      </div>

      {!imageUrl && (
        <div className="welcome-message">
          <h2>🎨 パズルゲームへようこそ！</h2>
          <div className="welcome-steps">
            <div className="step">
              <span className="step-number">1</span>
              <p>📁 <strong>画像を選択</strong>してください</p>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <p>🎯 <strong>難易度</strong>を選んでパズルスタート</p>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <p>🖱️ <strong>ドラッグ&ドロップ</strong>でピースを動かそう</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
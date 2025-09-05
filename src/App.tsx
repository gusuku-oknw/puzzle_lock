import { useRef, useState } from 'react'
import './App.css'

interface PuzzlePiece {
  id: number
  originalIndex: number
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [gridSize, setGridSize] = useState(3)
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [canvasSize] = useState(400)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const img = new Image()
    img.onload = () => {
      setImage(img)
      drawOriginalImage(img)
    }
    img.src = URL.createObjectURL(file)
  }

  const drawOriginalImage = (img: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw image to fit canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }

  const shufflePuzzle = () => {
    if (!image) return

    // Create pieces array
    const totalPieces = gridSize * gridSize
    const newPieces: PuzzlePiece[] = []
    
    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({ id: i, originalIndex: i })
    }

    // Fisher-Yates shuffle
    for (let i = newPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]]
    }

    setPieces(newPieces)
    drawShuffledPuzzle(newPieces)
  }

  const drawShuffledPuzzle = (puzzlePieces: PuzzlePiece[]) => {
    if (!image) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const pieceSize = canvasSize / gridSize
    const imgPieceWidth = image.width / gridSize
    const imgPieceHeight = image.height / gridSize

    puzzlePieces.forEach((piece, currentIndex) => {
      // Source coordinates (original position)
      const sourceX = (piece.originalIndex % gridSize) * imgPieceWidth
      const sourceY = Math.floor(piece.originalIndex / gridSize) * imgPieceHeight
      
      // Destination coordinates (current position)
      const destX = (currentIndex % gridSize) * pieceSize
      const destY = Math.floor(currentIndex / gridSize) * pieceSize

      ctx.drawImage(
        image,
        sourceX, sourceY, imgPieceWidth, imgPieceHeight,
        destX, destY, pieceSize, pieceSize
      )

      // Draw grid lines
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2
      ctx.strokeRect(destX, destY, pieceSize, pieceSize)
    })
  }

  const savePuzzleImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `puzzle-${gridSize}x${gridSize}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const resetToOriginal = () => {
    if (!image) return
    drawOriginalImage(image)
    setPieces([])
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧩 Puzzle Maker</h1>
        <p>画像をアップロードしてパズルを作成しよう！</p>
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
              onChange={(e) => setGridSize(Number(e.target.value))}
            >
              <option value={2}>2×2</option>
              <option value={3}>3×3</option>
              <option value={4}>4×4</option>
              <option value={5}>5×5</option>
            </select>
          </label>
        </div>

        <button
          className="btn btn-shuffle"
          onClick={shufflePuzzle}
          disabled={!image}
        >
          🔀 シャッフル
        </button>

        <button
          className="btn btn-reset"
          onClick={resetToOriginal}
          disabled={!image}
        >
          🔄 元に戻す
        </button>

        <button
          className="btn btn-save"
          onClick={savePuzzleImage}
          disabled={!image}
        >
          💾 画像を保存
        </button>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="puzzle-canvas"
        />
      </div>

      {pieces.length > 0 && (
        <div className="puzzle-info">
          <p>🎯 {gridSize}×{gridSize} パズル ({pieces.length}ピース)</p>
        </div>
      )}
    </div>
  )
}

export default App
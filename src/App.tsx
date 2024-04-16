import { useCallback, useEffect, useRef, useState } from "react";
import BoardDisplay from "./BoardDisplay";
import {
  Board,
  createBlankBoard,
  didWhiteWin,
  placePieceMove,
  playMove,
  rotateQuadrantOnBoard,
} from "./game/board";
import { HandCraftedEval } from "./ai/hand-crafted-eval";
import { Piece } from "./game/piece";

export default function App() {
  const [boardHistory, setBoardHistory] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board>(() =>
    createBlankBoard()
  );
  const [isPlacing, setIsPlacing] = useState(true);
  const [whiteWin, setWhiteWin] = useState<boolean | null>(null);
  const [botPlaysWhite, setBotPlaysWhite] = useState(false);
  const [botPlaysBlack, setBotPlaysBlack] = useState(false);
  const alphaBetaBot = useRef(new HandCraftedEval());

  const handleClick = useCallback(
    (quadIndex: number, pieceIndex: number) => {
      const pieceValue = currentBoard.quadrants[quadIndex][pieceIndex];
      if (pieceValue !== Piece.None || !isPlacing || whiteWin !== null) {
        return;
      }
      setBoardHistory((prev) => [...prev, currentBoard]);
      setCurrentBoard(placePieceMove(currentBoard, quadIndex, pieceIndex));
      setIsPlacing(false);
    },
    [currentBoard, isPlacing, whiteWin]
  );

  const handleRotate = useCallback(
    (quadIndex: number, clockwise: boolean) => {
      const newBoard = rotateQuadrantOnBoard(
        currentBoard,
        quadIndex,
        clockwise
      );
      setBoardHistory((prev) => [...prev, currentBoard]);
      setCurrentBoard(newBoard);
      setWhiteWin(didWhiteWin(newBoard));
      setIsPlacing(true);
    },
    [currentBoard]
  );

  const handleUndo = useCallback(() => {
    if (boardHistory.length <= 0) {
      return;
    }
    const previousBoard = boardHistory[boardHistory.length - 1];
    setCurrentBoard(previousBoard);
    setBoardHistory((prev) => prev.slice(0, -1));
    function pieceReducer(sum: number, quad: Piece[]) {
      return sum + quad.reduce((s, p) => s + (p !== Piece.None ? 1 : 0), 1);
    }
    const previousPieceCount = previousBoard.quadrants.reduce(pieceReducer, 0);
    const currentPieceCount = currentBoard.quadrants.reduce(pieceReducer, 0);
    setIsPlacing(previousPieceCount !== currentPieceCount);
    setWhiteWin(null);
  }, [boardHistory, currentBoard]);

  useEffect(() => {
    if (whiteWin === null) {
      if (
        (botPlaysWhite && currentBoard.whiteToMove) ||
        (botPlaysBlack && !currentBoard.whiteToMove)
      ) {
        setTimeout(() => {
          const move = alphaBetaBot.current.getNextMove(currentBoard);
          const newBoard = playMove(currentBoard, move);
          setBoardHistory((prev) => [...prev, currentBoard]);
          setCurrentBoard(newBoard);
          setWhiteWin(didWhiteWin(newBoard));
          setIsPlacing(true);
        }, 50);
      }
    }
  }, [botPlaysWhite, botPlaysBlack, currentBoard, whiteWin]);

  return (
    <div className="flex flex-col h-full justify-center items-center w-full">
      <span>
        {whiteWin === null
          ? `${currentBoard.whiteToMove ? "White" : "Black"} to move`
          : `Winner: ${whiteWin ? "white" : "black"}`}
      </span>
      {whiteWin === null && (
        <span>
          {isPlacing ? "Place a square" : "Pick a quadrant to rotate"}
        </span>
      )}
      <BoardDisplay
        board={currentBoard}
        isPlacing={isPlacing}
        onClickSquare={handleClick}
        onRotate={handleRotate}
        onUndo={handleUndo}
      />
      <div className="flex justify-between gap-16">
        <div>
          <label className="mr-2">White Bot?</label>
          <input
            type="checkbox"
            onChange={(event) => {
              setBotPlaysWhite(event.target.checked);
            }}
            checked={botPlaysWhite}
          />
        </div>
        <div>
          <label className="mr-2">Black Bot?</label>
          <input
            type="checkbox"
            onChange={(event) => {
              setBotPlaysBlack(event.target.checked);
            }}
            checked={botPlaysBlack}
          />
        </div>
      </div>
    </div>
  );
}

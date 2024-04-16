import { useState } from "react";
import { Board, Quadrant } from "./game/board";
import { Piece } from "./game/piece";

type BoardDisplayProps = {
  board: Board;
  isPlacing: boolean;
  onClickSquare: (quadIndex: number, pieceIndex: number) => void;
  onRotate: (quadIndex: number, clockwise: boolean) => void;
  onUndo: () => void;
};

export default function BoardDisplay(props: BoardDisplayProps) {
  const [selectedQuad, setSelectedQuad] = useState(-1);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {props.board.quadrants.map((quad, index) => (
          <QuadDisplay
            key={index}
            quad={quad}
            isSelected={index === selectedQuad}
            onClickSquare={(pieceIndex) => {
              if (props.isPlacing) {
                props.onClickSquare(index, pieceIndex);
              } else {
                setSelectedQuad(index);
              }
            }}
          />
        ))}
      </div>
      <div className="flex gap-4 w-full justify-center">
        <button
          disabled={selectedQuad === -1 || props.isPlacing}
          className="border-2 p-2 disabled:bg-slate-200"
          onClick={() => {
            props.onRotate(selectedQuad, false);
            setSelectedQuad(-1);
          }}
        >
          Left
        </button>
        <button
          disabled={selectedQuad !== -1}
          onClick={() => {
            props.onUndo();
          }}
          className="border-2 p-2 disabled:bg-slate-200"
        >
          Undo Move
        </button>
        <button
          disabled={selectedQuad === -1 || props.isPlacing}
          className="border-2 p-2 disabled:bg-slate-200"
          onClick={() => {
            props.onRotate(selectedQuad, true);
            setSelectedQuad(-1);
          }}
        >
          Right
        </button>
      </div>
    </div>
  );
}

type QuadDisplayProps = {
  quad: Quadrant;
  isSelected: boolean;
  onClickSquare: (index: number) => void;
};

function QuadDisplay(props: QuadDisplayProps) {
  return (
    <div
      className={
        "grid grid-cols-3 grid-rows-3 box-content" +
        (props.isSelected ? " border-2 border-red-500" : "")
      }
    >
      {props.quad.map((piece, index) => {
        let bgClass = "bg-white";
        if (piece === Piece.Black) {
          bgClass = "bg-black";
        }
        if (piece === Piece.None) {
          bgClass = "bg-slate-400";
        }
        return (
          <div
            key={index}
            onClick={() => props.onClickSquare(index)}
            className={"w-24 aspect-square border " + bgClass}
          ></div>
        );
      })}
    </div>
  );
}

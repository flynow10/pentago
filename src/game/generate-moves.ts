import { Board } from "./board";
import { Move } from "./move";
import { Piece } from "./piece";

export function generateMoves(board: Board): Move[] {
  const moveList: Move[] = [];
  const symmetricQuads = board.quadrants.reduce((arr, quad, index) => {
    if (quad.every((p, i) => p === Piece.None || i === 4)) {
      arr.push(index);
    }
    return arr;
  }, [] as number[]);
  for (let i = 0; i < board.quadrants.length; i++) {
    const quad = board.quadrants[i];
    const stillSymmetric = symmetricQuads.filter((index) => index !== i);
    for (let j = 0; j < quad.length; j++) {
      const piece = quad[j];
      if (piece === Piece.None) {
        const skipQuads = stillSymmetric.slice(0, -1);
        for (let k = 0; k < board.quadrants.length; k++) {
          if (skipQuads.includes(k)) {
            continue;
          }
          for (let c = 0; c < (stillSymmetric.includes(k) ? 1 : 2); c++) {
            const clockwise = c === 0;
            moveList.push({
              clockwise,
              placeQuadrant: i,
              rotateQuadrant: k,
              square: j,
            });
          }
        }
      }
    }
  }
  return moveList;
}

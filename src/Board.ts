export type Board = {
  whiteToMove: boolean;
  quadrants: Quadrant[];
};

/* [0, 0, 2,
    1, 2, 1,
    0, 1, 0] */
export type Quadrant = Piece[];

export type Move = {
  placeQuadrant: number;
  square: number;
  rotateQuadrant: number;
  clockwise: boolean;
};

export function moveEquals(move1: Move, move2: Move) {
  return (
    move1.clockwise === move2.clockwise &&
    move1.placeQuadrant === move2.placeQuadrant &&
    move1.rotateQuadrant === move2.rotateQuadrant &&
    move1.square === move2.square
  );
}

export function NullMove(): Move {
  return {
    clockwise: false,
    placeQuadrant: -1,
    rotateQuadrant: -1,
    square: -1,
  };
}

export enum Piece {
  White,
  Black,
  None,
}

export function createBlankBoard(): Board {
  return {
    whiteToMove: true,
    quadrants: new Array(4).fill(0).map(() => new Array(9).fill(Piece.None)),
  };
}

export function rotateQuadrant(quadrant: Quadrant, clockwise: boolean) {
  let table = [2, 5, 8, 1, 4, 7, 0, 3, 6];
  if (!clockwise) {
    table = table.reverse();
  }
  const newQuadrant = [];
  for (let i = 0; i < quadrant.length; i++) {
    const value = quadrant[i];
    const newIndex = table[i];
    newQuadrant[newIndex] = value;
  }
  return newQuadrant;
}

export function placePieceMove(
  board: Board,
  quadIndex: number,
  pieceIndex: number
): Board {
  const newBoard = structuredClone(board);
  newBoard.quadrants[quadIndex][pieceIndex] = board.whiteToMove
    ? Piece.White
    : Piece.Black;
  return newBoard;
}
export function removePiece(
  board: Board,
  quadIndex: number,
  pieceIndex: number
) {
  const newBoard = structuredClone(board);
  newBoard.quadrants[quadIndex][pieceIndex] = Piece.None;
  return newBoard;
}

export function rotateQuadrantOnBoard(
  board: Board,
  quadIndex: number,
  clockwise: boolean
): Board {
  const newBoard = structuredClone(board);
  newBoard.quadrants[quadIndex] = rotateQuadrant(
    board.quadrants[quadIndex],
    clockwise
  );
  newBoard.whiteToMove = !board.whiteToMove;
  return newBoard;
}

export function playMove(board: Board, move: Move) {
  return rotateQuadrantOnBoard(
    placePieceMove(board, move.placeQuadrant, move.square),
    move.rotateQuadrant,
    move.clockwise
  );
}

export function undoMove(board: Board, move: Move) {
  return removePiece(
    rotateQuadrantOnBoard(board, move.rotateQuadrant, !move.clockwise),
    move.placeQuadrant,
    move.square
  );
}

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

export function flattenBoard(board: Board) {
  const flatBoard = [];
  const indexMap = [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [1, 3],
    [1, 4],
    [1, 5],
    [0, 6],
    [0, 7],
    [0, 8],
    [1, 6],
    [1, 7],
    [1, 8],
    [2, 0],
    [2, 1],
    [2, 2],
    [3, 0],
    [3, 1],
    [3, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [3, 3],
    [3, 4],
    [3, 5],
    [2, 6],
    [2, 7],
    [2, 8],
    [3, 6],
    [3, 7],
    [3, 8],
  ];
  for (let i = 0; i < indexMap.length; i++) {
    const entry = indexMap[i];
    flatBoard[i] = board.quadrants[entry[0]][entry[1]];
  }
  return flatBoard;
}

export function didWhiteWin(board: Board) {
  const flatBoard = flattenBoard(board);
  const winCheckLines = [
    [0, 1, 2, 3, 4],
    [0, 6, 12, 18, 24],
    [0, 7, 14, 21, 28],
    [4, 9, 14, 19, 24],
  ];
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 6; x++) {
      const i = y * 6 + x;
      for (const checkLine of winCheckLines) {
        if (x + checkLine[0] >= 6) {
          continue;
        }
        const firstPiece = flatBoard[i + checkLine[0]];
        if (firstPiece === Piece.None) {
          continue;
        }
        let isWin = true;
        for (let j = 1; j < checkLine.length; j++) {
          const checkIndex = i + checkLine[j];
          if (x !== 0 && checkIndex % 6 === 0) {
            isWin = false;
            break;
          }
          if (checkIndex >= 36) {
            isWin = false;
            break;
          }
          if (flatBoard[checkIndex] !== firstPiece) {
            isWin = false;
          }
        }
        if (isWin) {
          if (firstPiece === Piece.White) {
            return true;
          } else {
            return false;
          }
        }
      }
    }
  }
  return null;
}

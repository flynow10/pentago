import { Board, flattenBoard } from "../game/board";
import { Piece } from "../game/piece";
import { AlphaBetaBot } from "./alpha-beta";

export class HandCraftedEval extends AlphaBetaBot {
  evaluate(board: Board): number {
    const flatBoard = flattenBoard(board);
    const winCheckLines = [
      [0, 1, 2, 3, 4],
      [0, 6, 12, 18, 24],
      [0, 7, 14, 21, 28],
      [4, 9, 14, 19, 24],
    ];
    let whitePartials = 0;
    let blackPartials = 0;
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
          let pieceCount = 1;
          for (let j = 1; j < checkLine.length; j++) {
            const checkIndex = i + checkLine[j];
            if (x !== 0 && checkIndex % 6 === 0) {
              pieceCount = 0;
              break;
            }
            if (checkIndex >= 36) {
              pieceCount = 0;
              break;
            }
            if (flatBoard[checkIndex] === firstPiece) {
              pieceCount++;
            } else if (flatBoard[checkIndex] !== Piece.None) {
              pieceCount = 0;
              break;
            }
          }
          if (pieceCount !== 0) {
            pieceCount *= pieceCount;
            if (firstPiece === Piece.White) {
              whitePartials += pieceCount;
            } else {
              blackPartials += pieceCount;
            }
          }
        }
      }
    }
    const score = whitePartials - blackPartials;
    return (board.whiteToMove ? 1 : -1) * score;
  }
}

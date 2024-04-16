import {
  Board,
  Move,
  NullMove,
  Piece,
  didWhiteWin,
  flattenBoard,
  generateMoves,
  moveEquals,
  playMove,
} from "./Board";

type Transposition = {
  key: number;
  score: number;
  depth: number;
  move: Move;
};

export class AlphaBetaBot {
  private static readonly MAX_DEPTH = 30;
  private bestMove: Move;
  private bestScore: number;
  private startTime: number;
  private transpositionNodes: number;
  private nodes: number;
  private transpositionTable: Record<number, Transposition>;

  constructor() {
    this.bestMove = NullMove();
    this.bestScore = 0;
    this.startTime = 0;
    this.transpositionTable = {};
    this.transpositionNodes = 0;
    this.nodes = 0;
  }

  public search(board: Board): Move {
    this.bestMove = NullMove();
    this.bestScore = 0;
    this.startTime = window.performance.now();
    this.transpositionNodes = 0;
    this.nodes = 0;
    let chosenMove = NullMove();
    for (let depth = 1; depth <= AlphaBetaBot.MAX_DEPTH; depth++) {
      this.negaMax(board, depth, 0, -Infinity, Infinity);
      if (this.shouldTimeout()) {
        break;
      }
      chosenMove = this.bestMove;
      console.log(
        `${board.whiteToMove ? "white;" : "black;"} depth: ${depth} score: ${
          this.bestScore
        } nodes: ${this.nodes} ttNodes: ${this.transpositionNodes} ttSize: ${
          Object.keys(this.transpositionTable).length
        } move:`,
        this.bestMove
      );
    }
    if (chosenMove.square === -1) {
      throw new Error("No move found in time!");
    }
    return chosenMove;
  }

  private shouldTimeout() {
    return window.performance.now() - this.startTime > 2000;
  }

  private negaMax(
    board: Board,
    depth: number,
    plyFromRoot: number,
    alpha: number,
    beta: number
  ): number {
    this.nodes++;
    const transpositionHash = this.hashBoard(board);
    const whiteWon = didWhiteWin(board);
    if (whiteWon !== null) {
      return (board.whiteToMove ? 1 : -1) * (whiteWon ? 1000000 : -1000000);
    }
    const transposition = this.transpositionTable[transpositionHash];
    if (transposition) {
      if (transposition.depth >= depth && plyFromRoot > 0) {
        this.transpositionNodes++;
        return transposition.score;
      }
    }
    if (depth === 0) {
      return this.evaluate(board);
    }

    const moves = generateMoves(board).sort((a, b) => {
      if (!transposition) return 0;
      if (moveEquals(a, transposition.move)) {
        return -1;
      }
      if (moveEquals(b, transposition.move)) {
        return 1;
      }
      return 0;
    });
    if (moves.length === 0) {
      return 0;
    }

    let localBestScore = -Infinity;
    let localBestMove = moves[0];
    for (let i = 0; i < moves.length; i++) {
      if (this.shouldTimeout()) {
        return 99999;
      }
      const move = moves[i];
      const newBoard = playMove(board, move);
      const score = -this.negaMax(
        newBoard,
        depth - 1,
        plyFromRoot + 1,
        -beta,
        -alpha
      );

      if (score > localBestScore) {
        localBestScore = score;
        localBestMove = move;
        if (plyFromRoot === 0) {
          this.bestMove = move;
          this.bestScore = score;
        }
        if (score > alpha) {
          alpha = score;
          if (alpha >= beta) {
            return beta;
          }
        }
      }
    }

    if (!this.shouldTimeout()) {
      this.transpositionTable[transpositionHash] = {
        key: transpositionHash,
        depth,
        score: localBestScore,
        move: localBestMove,
      };
    }
    return localBestScore;
  }

  private hashBoard(board: Board) {
    let hash = 0;
    for (let i = 0; i < board.quadrants.length; i++) {
      const quad = board.quadrants[i];
      for (let j = 0; j < quad.length; j++) {
        const piece = (quad[j] << 6) + (i * 9 + j);
        hash = (hash << 5) - hash + piece;
        hash = hash & hash;
      }
    }
    hash = (hash << 5) - hash + (board.whiteToMove ? 1 : 2);
    hash = hash & hash;
    return hash;
  }

  private evaluate(board: Board): number {
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

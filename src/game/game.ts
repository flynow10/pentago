import PentagoBot from "../ai/bot";
import { Board, createBlankBoard, didWhiteWin, playMove } from "./board";
import { isNullMove } from "./move";

export class Game {
  private whitePlayer: PentagoBot;
  private blackPlayer: PentagoBot;
  private gameHistory: Board[] = [createBlankBoard()];

  public get board() {
    return this.gameHistory[this.gameHistory.length - 1];
  }

  constructor(whitePlayer: PentagoBot, blackPlayer: PentagoBot) {
    this.whitePlayer = whitePlayer;
    this.blackPlayer = blackPlayer;
  }

  public async playGame(throwErrors = false): Promise<GameStatistics | null> {
    let whiteWon: boolean | null;
    while ((whiteWon = didWhiteWin(this.board)) === null) {
      let player: PentagoBot;
      if (this.board.whiteToMove) {
        player = this.whitePlayer;
      } else {
        player = this.blackPlayer;
      }
      try {
        const move = await player.getNextMove(this.board);
        if (isNullMove(move)) {
          throw new Error(
            `The ${
              this.board.whiteToMove ? "white" : "black"
            } player returned a null move!`
          );
        }
        const newBoard = playMove(this.board, move);
        this.gameHistory.push(newBoard);
      } catch (e) {
        if (throwErrors) {
          throw e;
        } else {
          console.warn(e);
        }
        return null;
      }
    }
    const stats: GameStatistics = {
      whiteWon: whiteWon,
      movesPlayed: this.gameHistory.length,
    };
    this.whitePlayer.onGameEnd?.(this, true, stats);
    this.blackPlayer.onGameEnd?.(this, false, stats);

    return stats;
  }
}

export type GameStatistics = {
  whiteWon: boolean;
  movesPlayed: number;
};

import { Board } from "../game/board";
import { generateMoves } from "../game/generate-moves";
import { Move } from "../game/move";
import PentagoBot from "./bot";

export class RandomBot implements PentagoBot {
  async getNextMove(board: Board): Promise<Move> {
    const moves = generateMoves(board);
    return moves[Math.floor(Math.random() * moves.length)];
  }
}

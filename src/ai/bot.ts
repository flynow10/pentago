import { Board } from "../game/board";
import { Move } from "../game/move";

export default interface PentagoBot {
  getNextMove(board: Board): Move;
}

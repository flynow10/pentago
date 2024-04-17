import { Board } from "../game/board";
import { Game, GameStatistics } from "../game/game";
import { Move } from "../game/move";
import { HandCraftedEval } from "./hand-crafted-eval";
import { RandomBot } from "./random";

export default interface PentagoBot {
  getNextMove(board: Board): Promise<Move>;
  onGameEnd?(game: Game, isWhite: boolean, stats: GameStatistics): void;
}

export const BotNameMap = {
  "hand-crafted": HandCraftedEval,
  random: RandomBot,
} as const;

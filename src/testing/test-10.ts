import { AlphaBetaBot } from "../ai/alpha-beta";
import { HandCraftedEval } from "../ai/hand-crafted-eval";
import { RandomBot } from "../ai/random";
import { Game, GameStatistics } from "../game/game";

function runGame() {
  const white = new HandCraftedEval();
  const black = new RandomBot();
  const game = new Game(white, black);
  return game.playGame(true);
}
AlphaBetaBot.DEBUG = false;
(async () => {
  const allGameStats: GameStatistics[] = [];
  let whiteWinCount = 0;
  let blackWinCount = 0;
  let totalMovesMade = 0;

  for (let i = 1; i <= 10; i++) {
    console.log(`Playing game #${i}...`);
    const stats = await runGame();
    if (stats !== null) {
      if (stats.whiteWon) {
        whiteWinCount++;
      } else {
        blackWinCount++;
      }
      totalMovesMade += stats.movesPlayed;
      allGameStats.push(stats);
    }
  }

  console.log("Played 10 games:");
  console.log(` White Won: ${whiteWinCount}`);
  console.log(` Black Won: ${blackWinCount}`);
  console.log(` Average Moves: ${totalMovesMade / 10}`);
})();

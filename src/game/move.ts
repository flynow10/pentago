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

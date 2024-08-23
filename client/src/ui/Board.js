import React from "react";
import Tile from "./Tile";

function Board({ puzzle, grid, gridInfo, handleChange, handleClick }) {
  return (
    <div className="board">
      <Tile puzzle={puzzle} grid={grid} gridInfo={gridInfo} handleChange={handleChange} />
    </div>
  );
}

export default Board;

function Tile({ puzzle, grid, gridInfo, handleChange }) {

  function assignClass(rowIndex, colIndex, grid) {
    let className = "tile";
    if (gridInfo[rowIndex][colIndex] === 1) className += " selected"
    if (gridInfo[rowIndex][colIndex] === 2) className += " light-selected"

    puzzle[rowIndex][colIndex] !== 0
      ? (className += " taken")
      : (className = "tile")

    if (rowIndex % 3 === 0) className += " horizontal-line-top"
    if (colIndex % 3 === 0) className += " vertical-line-left"
    if (rowIndex === 8) className += " horizontal-line-bottom"
    if (colIndex === 8) className += " vertical-line-right"
    return className;
  }

  return grid.map((row, rowIndex) => {
    return row.map((col, colIndex) => {
      return (
        <div
          tabIndex="1"
          className={assignClass(rowIndex, colIndex, grid)}
          id={rowIndex + " " + colIndex}
          key={rowIndex + " " + colIndex}
          //onChange={(e) => handleChange(rowIndex, colIndex, e)}
          onClick={(e) => handleChange(rowIndex, colIndex, e, "MouseClick")}
          onKeyDown={(e) => handleChange(rowIndex, colIndex, e, "KeyDown")}
          onMouseEnter={(e) => handleChange(rowIndex, colIndex, e, "MouseEnter")}
          onMouseDown={(e) => handleChange(rowIndex, colIndex, e, "MouseDown")}
          onMouseUp={(e) => handleChange(rowIndex, colIndex, e, "MouseUp")}
        >{col === 0 ? "" : Number(col)}</div>
      );
    });
  });
}

export default Tile;

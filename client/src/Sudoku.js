import "./App.css";
import React, { useState, useRef } from "react";
import Board from "./ui/Board";
import Interface from "./ui/Interface";
import { REST } from "./services/api.js";
import { useCallback, useEffect } from "react";
import * as utils from "./utility/Utils.js";

function Sudoku() {
  const [grid, setGrid] = useState(utils.getGrid());
  const [gridInfo, setGridInfo] = useState(utils.getGridInfo());
  const [puzzleStatus, setPuzzleStatus] = useState("** UNSOLVED **");
  const initialGrid = useRef(utils.getGrid());

  const [isCtrlSelect, setIsCtrlSelect] = useState(false);
  const [isDragSelect, setIsDragSelect] = useState(false);
  let [mouseDownloc, setMouseDownLoc] = useState(new Set());
  const [currentArrowPosition, setCurrentArrowPosition] = useState(null);

  function handleChange(row, col, e, changeType) {
    switch (changeType) {
      case "KeyDown":
        if (!isNaN(e.key) && e.key !== " ") {
          const newGrid = [...grid];
          utils.resetSelected(2, gridInfo);

          // false means if all the values selected are same as the key num
          let missingNumInSelected = false;
          for (const loc of mouseDownloc) {
            let row = Number(loc[0]);
            let col = Number(loc[1]);
            if (initialGrid.current[row][col] === 0 && newGrid[row][col] !== Number(e.key)) {
              missingNumInSelected = true;
            }
          }
          console.log("c", mouseDownloc);
          for (const loc of mouseDownloc) {
            let row = Number(loc[0]);
            let col = Number(loc[1]);
            if (initialGrid.current[row][col] === 0) {
              if (missingNumInSelected) {
                newGrid[row][col] = Number(e.key);
              } else {
                newGrid[row][col] = 0;
              }
              setGrid(newGrid);

              for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                  if (newGrid[i][j] === Number(e.key)) {
                    let element = document.getElementById(i + " " + j);
                    if (!utils.checkCurrentPoisition(i, j, grid)) {
                      element.className = utils.addCSSClass(element.className, "incorrect-value");
                    } else {
                      element.className = utils.removeCSSClass(element.className, "incorrect-value");
                    }
                  }
                }
              }
            }
          }

          if (missingNumInSelected) {
            utils.highlightNumbers(Number(e.key), newGrid, initialGrid.current, gridInfo);
            setGridInfo(gridInfo);
          }
        } else if (e.key === "Backspace") {
          utils.resetSelected(0, gridInfo);
          const newGrid = [...grid];
          for (const loc of mouseDownloc) {
            let row = Number(loc[0]);
            let col = Number(loc[1]);

            if (initialGrid.current[row][col] === 0) {
              let removeNum = newGrid[row][col];
              newGrid[row][col] = 0;
              for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                  if (grid[i][j] === removeNum) {
                    let element = document.getElementById(i + " " + j);
                    if (!utils.checkCurrentPoisition(i, j, grid)) {
                      element.className = utils.addCSSClass(element.className, "incorrect-value");
                    } else {
                      element.className = utils.removeCSSClass(element.className, "incorrect-value");
                    }
                  }
                }
              }
            }
          }
          setGrid(newGrid);
        }
        break;

      case "MouseEnter":
        // console.log(gridInfo[row][col]);
        // console.log(e.target.className);
        if (isDragSelect) {
          utils.resetSelected(2, gridInfo);
          e.target.className = utils.addCSSClass(e.target.className, "selected");
          gridInfo[row][col] = 1;
          mouseDownloc.add(String(row) + String(col));
          setMouseDownLoc(mouseDownloc);
          setGridInfo(gridInfo);
        }
        break;

      case "MouseDown":
        if (gridInfo[row][col] !== 1) {
          setIsDragSelect(true);
          if (!isCtrlSelect) {
            mouseDownloc = new Set();
            utils.resetSelected(0, gridInfo);
            utils.highlightblocks(row, col, gridInfo);
          }
          mouseDownloc.add(String(row) + String(col));
          setMouseDownLoc(mouseDownloc);

          e.target.className = utils.addCSSClass(e.target.className, "selected");
          gridInfo[row][col] = 1;

          if (grid[row][col] !== 0) {
            utils.highlightNumbers(grid[row][col], grid, initialGrid.current, gridInfo);
          }
          setGridInfo(gridInfo);
        } else {
          utils.resetSelected(0, gridInfo);
          setMouseDownLoc(new Set());
        }
        break;

      case "MouseUp":
        setIsDragSelect(false);
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            let element = document.getElementById(i + " " + j);
            if (gridInfo[i][j] === 3) {
              element.className = utils.addCSSClass(element.className, "light-light-selected");
            }
          }
        }
        break;

      default:
        break;
    }
  }

  function handleKeyChange(row, col, element) {
    if (!isCtrlSelect) {
      utils.resetSelected(0, gridInfo);
      mouseDownloc = new Set();
    }
    element.className = utils.addCSSClass(element.className, "selected");
    gridInfo[row][col] = 1;
    if (grid[row][col] !== 0) {
      utils.highlightNumbers(grid[row][col], grid, initialGrid.current, gridInfo);
    }
    utils.highlightblocks(row, col, gridInfo);
    mouseDownloc.add(String(row) + String(col));
    setMouseDownLoc(mouseDownloc);
  }

  async function handleInterface(action) {
    let newGrid;
    switch (action) {
      case "create":
        newGrid = await handleCreate();
        utils.copy2DArray(newGrid, initialGrid.current);
        setPuzzleStatus("");
        utils.resetSelected(0, gridInfo);
        setGrid(newGrid);
        break;
      case "solve":
        newGrid = await handleSolve();
        setGrid(newGrid);
        break;
      case "clear":
        newGrid = utils.getGrid();
        utils.copy2DArray(newGrid, initialGrid.current);
        setGrid(newGrid);
        utils.resetSelected(0, gridInfo);
        setPuzzleStatus("");
        break;
      case "validate":
        const status = await handleValidate();
        const puzzStats = status ? "** SOLVED **" : "** UNSOLVED **";
        setPuzzleStatus(puzzStats);
        break;
      default:
        throw new Error("Invalid action");
    }
  }

  async function handleCreate() {
    try {
      const response = await REST.getBoard();
      const data = await response.json();
      return data.game;
    } catch (error) {
      console.log(error);
    }
  }

  async function handleValidate() {
    try {
      const response = await REST.validateBoard(grid);
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSolve() {
    try {
      const response = await REST.solveBoard(grid);
      const data = await response.json();
      if (data.status) {
        setPuzzleStatus("** SOLVED **");
        return data.solution;
      } else {
        setPuzzleStatus("** UNSOLVABLE **");
        return grid;
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleKeyPress = useCallback((event) => {
    if (event.key === " ") {
      utils.resetSelected(0, gridInfo);
      setMouseDownLoc(new Set());
    } else if (event.key === "Control") {
      utils.resetSelected(2, gridInfo);
      setIsCtrlSelect(true);
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowLeft" || event.key === "ArrowDown") {
      let x = 0;
      let y = 0;
      if (currentArrowPosition !== null) {
        x = currentArrowPosition[0];
        y = currentArrowPosition[1];
        if (event.key === "ArrowRight" && y < 8) y++;
        if (event.key === "ArrowUp" && x > 0) x--;
        if (event.key === "ArrowLeft" && y > 0) y--;
        if (event.key === "ArrowDown" && x < 8) x++;
      }
      setCurrentArrowPosition([x, y]);
      let element = document.getElementById(x + " " + y);
      handleKeyChange(x, y, element);
    }
  }, [handleKeyChange, currentArrowPosition, gridInfo]);

  const handleKeyPressUp = useCallback((event) => {
    if (event.key === "Control") {
      setIsCtrlSelect(false);
    }
  }, []);

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyPressUp);
    // document.addEventListener("mousedown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.addEventListener('keyup', handleKeyPressUp);
      // document.addEventListener("mousedown", handleKeyPress);
    };
  }, [handleKeyPress, handleKeyPressUp]);

  return (
    <div className="Sudoku">

      <Board
        puzzle={initialGrid.current}
        grid={grid}
        gridInfo={gridInfo}
        handleChange={handleChange}
      />
      <Interface handleInterface={handleInterface} status={puzzleStatus} />
      <div className="Setting">Setting</div>
      <div className="Side-margin-left">Side-margin-left</div>
      <div className="Side-margin-right">Side-margin-right</div>
      <div className="Footer">Footer</div>
      {/* <Numpad>

        </Numpad>
        <Board
          puzzle={initialGrid.current}
          grid={grid}
          gridInfo={utils.gridInfo}
          handleChange={handleChange}
        />
        <Interface handleInterface={handleInterface} status={puzzleStatus} /> */}

    </div>
  );
}

export default Sudoku;

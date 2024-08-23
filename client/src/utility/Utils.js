export function getGridInfo() {
  const gridInfo = [];
  for (let i = 0; i < 9; i++) {
    gridInfo[i] = Array(9).fill(0);
  }
  return gridInfo;
}

export function getGrid() {
  const grid = [];
  for (let i = 0; i < 9; i++) {
    grid[i] = Array(9).fill(0);
  }
  return grid;
}

export function copy2DArray(from, to) {
  for (let i = 0; i < from.length; i++) {
    to[i] = [...from[i]];
  }
}

export function addCSSClass(elementClassName, newClass) {
  elementClassName = removeCSSClass(elementClassName, newClass);
  if (newClass === "light-light-selected" || newClass === "light-selected" || newClass === "selected") {
    elementClassName = removeCSSClass(elementClassName, "light-light-selected");
    elementClassName = removeCSSClass(elementClassName, "light-selected");
    elementClassName = removeCSSClass(elementClassName, "selected");
  }
  elementClassName += " " + newClass;
  return elementClassName;
}

export function removeCSSClass(elementClassName, classToRemove) {
  const classArray = elementClassName.split(" ");
  let newClassName = "";
  for (const className of classArray) {
    if (className !== classToRemove) {
      newClassName += className + " ";
    }
  }
  return newClassName.slice(0, -1);
}

// export function findCSSClass(elementClassName, classToFind) {
//   const classArray = elementClassName.split(" ");
//   for (const className of classArray) {
//     if (className === classToFind) {
//       return true;
//     }
//   }
//   return false;
// }

// option = 0     reset all
// option = n     reset n

export function resetSelected(option = 0, gridInfo) {
  // console.log(gridInfo);
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      let element = document.getElementById(i + " " + j);
      if (gridInfo[i][j] === 1) {
        if (option === 0 || option === 1) {
          element.className = removeCSSClass(element.className, "selected");
          gridInfo[i][j] = 0;
        }
      }
      if (gridInfo[i][j] === 2) {
        if (option === 0 || option === 2) {
          element.className = removeCSSClass(element.className, "light-selected");
          gridInfo[i][j] = 0;
        }
      }
      if (gridInfo[i][j] === 3) {
        if (option === 0 || option === 2) {
          element.className = removeCSSClass(element.className, "light-light-selected");
          gridInfo[i][j] = 0;
        }
      }
    }
  }
}

export function highlightNumbers(number, grid, initialGrid, gridInfo) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      let element = document.getElementById(i + " " + j);
      // mark all taken tiles which do not have same number
      if (grid[i][j] !== 0 && grid[i][j] !== number && gridInfo[i][j] !== 1) {
        element.className = addCSSClass(element.className, "light-light-selected");
        gridInfo[i][j] = 3;
      }
      // Mark all tiles which has same number
      else if (grid[i][j] === number && number !== 0) {
        if (gridInfo[i][j] !== 1) {
          element.className = addCSSClass(element.className, "light-selected");
          gridInfo[i][j] = 2;
        }
        // Mark all the blocks that they cover
        highlightblocks(i, j, gridInfo);
      }
    }
  }
}

export function highlightblocks(row, col, gridInfo) {
  let lightSelect = false;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      lightSelect = false;
      if (gridInfo[i][j] === 0) {
        if (((i === row && j !== col) || (i !== row && j === col)) && gridInfo[i][j] === 0) {
          lightSelect = true;
        }
        if ((i !== row && j !== col) && Math.floor(i / 3) === Math.floor(row / 3) && Math.floor(j / 3) === Math.floor(col / 3) && gridInfo[i][j] === 0) {
          lightSelect = true;
        }
        if (lightSelect) {
          let element = document.getElementById(i + " " + j);
          element.className = addCSSClass(element.className, "light-light-selected");
          gridInfo[i][j] = 3;
        }
      }
    }
  }
}

export function checkCurrentPoisition(row, col, grid) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (((i === row && j !== col) || (i !== row && j === col)) && grid[i][j] === grid[row][col]) {
        return false;
      }
      if (Math.floor(i / 3) === Math.floor(row / 3) && Math.floor(j / 3) === Math.floor(col / 3) && grid[i][j] === grid[row][col] && i !== row) {
        return false;
      }
    }
  }
  return true;
}
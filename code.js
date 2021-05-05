const Gameboard = (function () {
  let _gridArray = ["", "", "", "", "", "X", "", "", ""]; //from top left to bottom right

  const getGridArray = () => _gridArray;
  const reset = () => (_gridArray = ["", "", "", "", "", "", "", "", ""]);

  const play = (index, symbol) => {
    if (!!_gridArray[index]) return "invalid";
    _gridArray[index] = symbol;
  };

  const _checkWin = () => {};

  return {
    getGridArray,
    reset,
    play,
  };
})();

const Controller = (function () {
  //get the DOM elements
  const _cells = document.querySelectorAll("#gameBoard > div");
  render(Gameboard.getGridArray());

  //assign click event listeners
  _cells.forEach((cell) => cell.addEventListener("click", _cellClick));

  function _cellClick(e) {
    const playResult = Gameboard.play(e.target.id, "X");
    console.log(playResult);
    if (playResult === "invalid") return;
    render(Gameboard.getGridArray());
  }

  function render(array) {
    _cells.forEach((cell, i) => (cell.innerHTML = array[i]));
  }
})();

const playerFactory = (name, symbol) => {
  let _wins = 0;

  const getName = () => name;
  const getSymbol = () => symbol;
  const getWins = () => _wins;
  const win = () => _wins++;

  const proto = {
    getName,
    getSymbol,
    getWins,
    win,
  };

  return Object.create(proto);
};

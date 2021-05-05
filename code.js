const Gameboard = (function () {
  let _gridArray = ["", "", "", "", "", "", "", "", ""]; //from top left to bottom right

  const getGridArray = () => _gridArray;
  const reset = () => (_gridArray = ["", "", "", "", "", "", "", "", ""]);

  const _getGridParts = (grid) => {
    const gridParts = [];

    //diagonals
    gridParts.push([grid[0], grid[4], grid[8]]);
    gridParts.push([grid[2], grid[4], grid[6]]);

    //columns
    for (let i = 0; i < 3; i++) {
      gridParts.push([grid[i], grid[i + 3], grid[i + 6]]);
    }

    //rows
    let temp = grid;
    while (temp.length > 0) {
      gridParts.push(temp.splice(0, 3));
    }

    return gridParts;
  };

  const _checkWin = (symbol) => {
    const parsedGridArray = _gridArray.map((element) => {
      return element === symbol ? symbol : "";
    });
    const gridParts = _getGridParts(parsedGridArray);
    return gridParts.some((element) =>
      element.every((symb) => symb === symbol)
    );
  };

  const play = (index, symbol) => {
    if (!!_gridArray[index]) return "invalid";
    _gridArray[index] = symbol;
    if (_checkWin(symbol)) console.log(`${symbol} wins!`);
  };

  return {
    getGridArray,
    reset,
    play,
  };
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

const Controller = (function () {
  let _playerOne;
  let _playerTwo;
  let _currentTurnSymbol;
  //get the DOM elements
  const _cells = document.querySelectorAll("#gameBoard > div");
  const _restartButton = document.querySelector("#restartButton");

  //assign click event listeners
  _cells.forEach((cell) => cell.addEventListener("click", _cellClick));
  _restartButton.addEventListener("click", _startNewGame);

  function _startNewGame() {
    _playerOne = playerFactory("player1", "X");
    _playerTwo = playerFactory("player2", "O");
    _currentTurnSymbol = _playerOne.getSymbol();
    Gameboard.reset();
    _render(Gameboard.getGridArray());
  }

  function _changeSymbol() {
    if (_currentTurnSymbol === _playerOne.getSymbol()) {
      _currentTurnSymbol = _playerTwo.getSymbol();
    } else {
      _currentTurnSymbol = _playerOne.getSymbol();
    }
  }

  function _cellClick(e) {
    const playResult = Gameboard.play(e.target.id, _currentTurnSymbol);
    if (playResult === "invalid") return;
    _render(Gameboard.getGridArray());
    _changeSymbol();
  }

  function _render(array) {
    _cells.forEach((cell, i) => (cell.innerHTML = array[i]));
  }

  function _parseWin() {}

  _startNewGame();
  _render(Gameboard.getGridArray());
})();

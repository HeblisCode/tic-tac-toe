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

  const isFull = () => {
    return _gridArray.indexOf("") < 0;
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
    return _checkWin(symbol);
  };

  return {
    isFull,
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
  let _players = [];
  let _currentPlayer;
  let AIMode = false;

  //get the DOM elements
  const _cells = document.querySelectorAll("#gameBoard > div");

  //assign click event listeners
  _cells.forEach((cell) => cell.addEventListener("click", _cellClick));

  function startNewGame(player1, player2, symbol1, symbol2) {
    _players[0] = playerFactory(player1, symbol1);
    _players[1] = playerFactory(player2, symbol2);
    _currentPlayer = 0;
    Gameboard.reset();
    _render(Gameboard.getGridArray());
  }

  function _changePlayer() {
    if (_currentPlayer === 0) {
      _currentPlayer = 1;
    } else {
      _currentPlayer = 0;
    }
  }

  function _cellClick(e) {
    //do the play
    const playResult = Gameboard.play(
      e.target.id,
      _players[_currentPlayer].getSymbol()
    );
    //check play validity
    if (playResult === "invalid") return;
    _render(Gameboard.getGridArray());
    //check for win or tie
    if (!playResult && Gameboard.isFull()) {
      tie();
    } else {
      playResult ? win(_players[_currentPlayer]) : _changePlayer();
    }
  }

  function _render(array) {
    _cells.forEach((cell, i) => (cell.innerHTML = array[i]));
  }

  function win(player) {
    MenuController.displayMessage(`${player.getName()} wins!`);
  }

  function tie() {
    MenuController.displayMessage("It's a tie!");
  }

  return {
    startNewGame,
    AIMode,
  };
})();

const MenuController = (function () {
  const _form = document.querySelector("#playersInfoForm");
  const _formInputs = _form.querySelectorAll("input");
  const _formButton = _form.querySelector("button");
  const _popUpMessageArea = document.querySelector(
    "#popUpMessageAreaContainer"
  );
  const _popUpMessageButton = _popUpMessageArea.querySelector("div > button");
  const _popUpMessageParagraph = _popUpMessageArea.querySelector("div > p");
  const _gameModeAIButton = document.querySelector("#AI");
  const _gameModePvPButton = document.querySelector("#PvP");

  function displayMessage(message) {
    _popUpMessageArea.style.display = "flex";
    _popUpMessageParagraph.innerText = message;
    _popUpMessageButton.addEventListener("click", _replay);
  }

  function _replay() {
    _submitForm();
    _popUpMessageButton.removeEventListener("click", _replay);
    _popUpMessageArea.style.display = "none";
  }

  function _hideSubmit() {
    _formButton.style.display = "none";
  }

  function _showSubmit() {
    _formButton.style.display = "block";
  }

  function _submitForm() {
    const inputsArray = Array.from(_formInputs);
    console.log("test1");
    //form validation
    if (inputsArray.some((element) => !element.checkValidity())) return;
    //start a new game with input values
    console.log("test2");
    Controller.startNewGame(
      inputsArray[0].value,
      inputsArray[1].value,
      inputsArray[2].value,
      inputsArray[3].value
    );
    _hideSubmit();
  }

  _form.addEventListener("input", _showSubmit);
  _formButton.addEventListener("click", _submitForm);
  _gameModeAIButton.addEventListener("click", () => {
    Controller.AIMode = true;
    _submitForm();
  });
  _gameModePvPButton.addEventListener("click", () => {
    Controller.AIMode = false;
    _submitForm();
  });

  _submitForm();

  return {
    displayMessage,
  };
})();

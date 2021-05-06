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

  const _cells = document.querySelectorAll("#gameBoard > div");
  _cells.forEach((cell) => cell.addEventListener("click", _cellClick));

  function _render(array) {
    _cells.forEach((cell, i) => (cell.innerHTML = array[i]));
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
    //display the play
    _render(Gameboard.getGridArray());
    //check for win or tie
    if (!playResult && Gameboard.isFull()) {
      _tie();
    } else {
      playResult ? _win(_players[_currentPlayer]) : _changePlayer();
    }
  }
  function _win(player) {
    MenuController.displayMessage(`${player.getName()} wins!`);
  }
  function _tie() {
    MenuController.displayMessage("It's a tie!");
  }

  function startNewGame(player1, player2, symbol1, symbol2) {
    _players[0] = playerFactory(player1, symbol1);
    _players[1] = playerFactory(player2, symbol2);
    _currentPlayer = 0;
    Gameboard.reset();
    _render(Gameboard.getGridArray());
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

  function _AIModeOn() {
    Controller.AIMode = true;
    _gameModeAIButton.classList.add("selected");
    _gameModePvPButton.classList.remove("selected");
    _submitForm();
    alert("Coming Soon");
  }

  function _AIModeOff() {
    Controller.AIMode = false;
    _gameModeAIButton.classList.remove("selected");
    _gameModePvPButton.classList.add("selected");
    _submitForm();
  }

  _form.addEventListener("input", _showSubmit);
  _formButton.addEventListener("click", _submitForm);
  _gameModeAIButton.addEventListener("click", _AIModeOn);

  _gameModePvPButton.addEventListener("click", _AIModeOff);

  _submitForm(); //starts the game with default values

  return {
    displayMessage,
  };
})();

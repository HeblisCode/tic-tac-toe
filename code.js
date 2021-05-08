const Gameboard = (function () {
  let _gridArray = ["", "", "", "", "", "", "", "", ""]; //from top left to bottom right

  const getGridArray = () => _gridArray;

  const reset = () => (_gridArray = ["", "", "", "", "", "", "", "", ""]);

  const _getGridParts = (gameboard) => {
    const gridParts = [];
    let tempGrid = gameboard.map((element) => element);
    //diagonals
    gridParts.push([tempGrid[0], tempGrid[4], tempGrid[8]]);
    gridParts.push([tempGrid[2], tempGrid[4], tempGrid[6]]);
    //columns
    for (let i = 0; i < 3; i++) {
      gridParts.push([tempGrid[i], tempGrid[i + 3], tempGrid[i + 6]]);
    }
    //rows
    while (tempGrid.length > 0) {
      gridParts.push(tempGrid.splice(0, 3));
    }
    return gridParts;
  };

  const checkWin = (gameboard, symbol) => {
    const gridParts = _getGridParts(gameboard);
    const win = gridParts.some((element) =>
      element.every((symb) => symb === symbol)
    );
    const isFull = gameboard.indexOf("") < 0;
    return !win && isFull ? "tie" : win;
  };

  const play = (index, symbol) => {
    if (!!_gridArray[index]) return "invalid";
    _gridArray[index] = symbol;
    return checkWin(_gridArray, symbol);
  };

  return {
    checkWin,
    getGridArray,
    reset,
    play,
  };
})();

const playerFactory = (name, symbol) => {
  const getName = () => name;
  const getSymbol = () => symbol;

  const proto = {
    getName,
    getSymbol,
  };

  return Object.create(proto);
};

const Controller = (function () {
  let _players = [];
  let _currentPlayer;
  let _AIMode = false;

  const _cells = document.querySelectorAll("#gameBoard > div");
  _cells.forEach((cell) => cell.addEventListener("click", _cellClick));

  function _render() {
    _cells.forEach((cell, i) => (cell.innerHTML = Gameboard.getGridArray()[i]));
  }

  function setAIMode(bool) {
    _AIMode = bool;
  }

  function _changePlayer() {
    if (_currentPlayer === 0) {
      _currentPlayer = 1;
    } else {
      _currentPlayer = 0;
    }
  }

  function _checkGameOver(play) {
    console.log(play);
    if (play === "tie") {
      _tie();
    } else {
      play ? _win(_players[_currentPlayer]) : _changePlayer();
    }
  }

  function _checkForAI() {
    if (_AIMode) {
      const bestMoveIndex = AI.getBestPlayIndex(
        Gameboard.getGridArray(),
        _players[0].getSymbol(),
        _players[1].getSymbol()
      );
      const AIPlay = Gameboard.play(
        bestMoveIndex,
        _players[_currentPlayer].getSymbol()
      );
      _render();
      _checkGameOver(AIPlay);
    }
  }

  function _cellClick(e) {
    const playResult = Gameboard.play(
      e.target.id,
      _players[_currentPlayer].getSymbol()
    );
    if (playResult === "invalid") return;
    _render();
    _checkGameOver(playResult);
    _checkForAI();
  }

  function _win(player) {
    MenuController.displayMessage(`${player.getName()} wins!`);
  }

  function _tie() {
    MenuController.displayMessage(`It's a tie!`);
  }

  function startNewGame(player1, player2, symbol1, symbol2) {
    _players[0] = playerFactory(player1, symbol1);
    _players[1] = playerFactory(player2, symbol2);
    _currentPlayer = 0;
    Gameboard.reset();
    _render();
  }

  return {
    startNewGame,
    setAIMode,
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
    //form validation
    if (inputsArray.some((element) => !element.checkValidity())) return;
    //start a new game with input values
    Controller.startNewGame(
      inputsArray[0].value,
      inputsArray[1].value,
      inputsArray[2].value,
      inputsArray[3].value
    );
    _hideSubmit();
  }

  function _AIModeOn() {
    Controller.setAIMode(true);
    _gameModeAIButton.classList.add("selected");
    _gameModePvPButton.classList.remove("selected");
    _submitForm();
  }

  function _AIModeOff() {
    Controller.setAIMode(false);
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

const AI = (function () {
  const _NodeFactory = (gameboard, index, goodness) => {
    return {
      gameboard,
      index,
      goodness,
    };
  };

  const _parseGameboardArray = (gameboard, player1Symbol, player2Symbol) => {
    return gameboard.map((element) => {
      if (player1Symbol === element) {
        return "X";
      } else if (player2Symbol === element) {
        return "O";
      } else {
        return "";
      }
    });
  };

  const _getBestNode = (nodesArray) => {
    return nodesArray.reduce((best, node) => {
      return node.goodness > best.goodness ? node : best;
    }, nodesArray[0]);
  };

  const _getWorstNode = (nodesArray) => {
    return nodesArray.reduce((worst, node) => {
      return node.goodness < worst.goodness ? node : worst;
    }, nodesArray[0]);
  };

  const _getAllNodes = (gameboard, symbol) => {
    const allNodes = [];
    for (let i = 0; i < gameboard.length; i++) {
      if (!!gameboard[i]) {
        continue;
      } else {
        let tempGameboard = gameboard.map((element) => element);
        tempGameboard[i] = symbol;
        allNodes.push(_NodeFactory(tempGameboard, i, null));
      }
    }
    return allNodes;
  };

  function _minimax(node, maximizingPlayer) {
    const win = Gameboard.checkWin(node.gameboard, "O");
    const lose = Gameboard.checkWin(node.gameboard, "X");

    //assign goodness to terminal nodes
    if (win || lose) {
      if (win === true) {
        node.goodness = 1;
        return node;
      } else if (lose === true) {
        node.goodness = -1;
        return node;
      } else if (win === "tie" || lose === "tie") {
        node.goodness = 0;
        return node;
      }
    }
    //recursive call
    if (maximizingPlayer) {
      const allNodes = _getAllNodes(node.gameboard, "O");
      allNodes.forEach((element) => {
        const resultNode = _minimax(element, false);
        element.goodness = resultNode.goodness;
      });
      return _getBestNode(allNodes);
    } else {
      const allNodes = _getAllNodes(node.gameboard, "X");
      allNodes.forEach((element) => {
        const resultNode = _minimax(element, true);
        element.goodness = resultNode.goodness;
      });
      return _getWorstNode(allNodes);
    }
  }

  function getBestPlayIndex(gameboard, player1Symbol, player2Symbol) {
    const parsedGameboardArray = _parseGameboardArray(
      gameboard,
      player1Symbol,
      player2Symbol
    );
    const currentNode = _NodeFactory(parsedGameboardArray, null, null);
    const bestNode = _minimax(currentNode, true);
    return bestNode.index;
  }

  return {
    getBestPlayIndex,
  };
})();

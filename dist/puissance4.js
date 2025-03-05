"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Puissance4 = /*#__PURE__*/function () {
  function Puissance4(selector) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, Puissance4);
    var defaultOptions = {
      columns: 7,
      rows: 6,
      playerColors: ['#FF0000', '#FFFF00']
    };
    this.options = _objectSpread(_objectSpread({}, defaultOptions), options);
    if (this.options.playerColors[0] === this.options.playerColors[1]) {
      throw new Error('Players cannot have the same color');
    }
    this.container = document.querySelector(selector);
    if (!this.container) {
      throw new Error("Element not found: ".concat(selector));
    }
    this.initialize();
    this.currentPlayerDisplay = document.getElementById('current-player');
    this.player1ScoreDisplay = document.getElementById('player1-score');
    this.player2ScoreDisplay = document.getElementById('player2-score');
    this.undoButton = document.getElementById('undo-btn');
    this.resetButton = document.getElementById('reset-btn');
    this.modal = document.getElementById('end-game-modal');
    this.gameResult = document.getElementById('game-result');
    this.newGameButton = document.getElementById('new-game-btn');
    this.render();
    this.setupEventListeners();
  }
  return _createClass(Puissance4, [{
    key: "initialize",
    value: function initialize() {
      this.players = [{
        id: 1,
        color: this.options.playerColors[0],
        score: 0
      }, {
        id: 2,
        color: this.options.playerColors[1],
        score: 0
      }];
      this.board = this.createEmptyBoard();
      this.currentPlayer = this.players[0];
      this.gameOver = false;
      this.moveHistory = [];
      this.cellsLeft = this.options.columns * this.options.rows;
    }
  }, {
    key: "createEmptyBoard",
    value: function createEmptyBoard() {
      var board = [];
      for (var y = 0; y < this.options.rows; y++) {
        var row = [];
        for (var x = 0; x < this.options.columns; x++) {
          row.push({
            x: x,
            y: y,
            playerId: null
          });
        }
        board.push(row);
      }
      return board;
    }
  }, {
    key: "render",
    value: function render() {
      this.container.innerHTML = '';
      for (var x = 0; x < this.options.columns; x++) {
        var column = document.createElement('div');
        column.className = 'column';
        column.dataset.column = x;
        var hoverEffect = document.createElement('div');
        hoverEffect.className = 'column-hover';
        column.appendChild(hoverEffect);
        for (var y = this.options.rows - 1; y >= 0; y--) {
          var cell = document.createElement('div');
          cell.className = 'cell';
          cell.dataset.x = x;
          cell.dataset.y = y;
          var cellData = this.board[y][x];
          if (cellData.playerId !== null) {
            var token = document.createElement('div');
            token.className = 'token';
            token.style.backgroundColor = this.getPlayerColor(cellData.playerId);
            cell.appendChild(token);
          }
          column.appendChild(cell);
        }
        this.container.appendChild(column);
      }
      this.updatePlayerInfo();
    }
  }, {
    key: "setupEventListeners",
    value: function setupEventListeners() {
      var _this = this;
      this.container.addEventListener('click', function (event) {
        if (_this.gameOver) return;
        var column = event.target.closest('.column');
        if (column) {
          var columnIndex = parseInt(column.dataset.column);
          _this.makeMove(columnIndex);
        }
      });
      this.undoButton.addEventListener('click', function () {
        _this.undoLastMove();
      });
      this.resetButton.addEventListener('click', function () {
        _this.resetGame();
      });
      this.newGameButton.addEventListener('click', function () {
        _this.resetGame();
        _this.closeModal();
      });
    }
  }, {
    key: "makeMove",
    value: function makeMove(columnIndex) {
      var rowIndex = this.getLowestEmptyRow(columnIndex);
      if (rowIndex === -1) return;
      this.board[rowIndex][columnIndex].playerId = this.currentPlayer.id;
      this.cellsLeft--;
      this.moveHistory.push({
        x: columnIndex,
        y: rowIndex,
        playerId: this.currentPlayer.id
      });
      this.animateTokenDrop(columnIndex, rowIndex);
      if (this.checkWin(columnIndex, rowIndex)) {
        this.handleWin();
      } else if (this.cellsLeft === 0) {
        this.handleDraw();
      } else {
        this.switchPlayer();
        this.updatePlayerInfo();
      }
    }
  }, {
    key: "animateTokenDrop",
    value: function animateTokenDrop(x, y) {
      var columns = this.container.querySelectorAll('.column');
      var column = columns[x];
      var targetCell = column.querySelector(".cell[data-x=\"".concat(x, "\"][data-y=\"").concat(y, "\"]"));
      var dropDistance = (this.options.rows - y - 1) * 60;
      var token = document.createElement('div');
      token.className = 'token';
      token.style.backgroundColor = this.getPlayerColor(this.currentPlayer.id);
      token.style.top = "-".concat(dropDistance, "px");
      targetCell.appendChild(token);
      setTimeout(function () {
        token.style.transition = 'top 0.5s ease-in';
        token.style.top = '5%';
      }, 10);
    }
  }, {
    key: "getLowestEmptyRow",
    value: function getLowestEmptyRow(columnIndex) {
      for (var y = 0; y < this.options.rows; y++) {
        if (this.board[y][columnIndex].playerId === null) {
          return y;
        }
      }
      return -1;
    }
  }, {
    key: "switchPlayer",
    value: function switchPlayer() {
      this.currentPlayer = this.currentPlayer.id === 1 ? this.players[1] : this.players[0];
    }
  }, {
    key: "updatePlayerInfo",
    value: function updatePlayerInfo() {
      this.currentPlayerDisplay.textContent = "Current Player: ".concat(this.currentPlayer.id);
      this.currentPlayerDisplay.style.color = this.currentPlayer.color;
      this.player1ScoreDisplay.textContent = "Player 1: ".concat(this.players[0].score);
      this.player2ScoreDisplay.textContent = "Player 2: ".concat(this.players[1].score);
    }
  }, {
    key: "getPlayerColor",
    value: function getPlayerColor(playerId) {
      return this.players.find(function (player) {
        return player.id === playerId;
      }).color;
    }
  }, {
    key: "checkWin",
    value: function checkWin(x, y) {
      var playerId = this.board[y][x].playerId;
      return this.checkDirection(x, y, 1, 0, playerId) || this.checkDirection(x, y, 0, 1, playerId) || this.checkDirection(x, y, 1, 1, playerId) || this.checkDirection(x, y, 1, -1, playerId);
    }
  }, {
    key: "checkDirection",
    value: function checkDirection(x, y, dx, dy, playerId) {
      var count = 1;
      count += this.countConsecutive(x, y, dx, dy, playerId);
      count += this.countConsecutive(x, y, -dx, -dy, playerId);
      return count >= 4;
    }
  }, {
    key: "countConsecutive",
    value: function countConsecutive(x, y, dx, dy, playerId) {
      var count = 0;
      var nx = x + dx;
      var ny = y + dy;
      while (nx >= 0 && nx < this.options.columns && ny >= 0 && ny < this.options.rows && this.board[ny][nx].playerId === playerId) {
        count++;
        nx += dx;
        ny += dy;
      }
      return count;
    }
  }, {
    key: "handleWin",
    value: function handleWin() {
      this.gameOver = true;
      this.currentPlayer.score++;
      this.updatePlayerInfo();
      this.showModal("Player ".concat(this.currentPlayer.id, " won!"));
    }
  }, {
    key: "handleDraw",
    value: function handleDraw() {
      this.gameOver = true;
      this.showModal('Game ended in a draw!');
    }
  }, {
    key: "showModal",
    value: function showModal(message) {
      this.gameResult.textContent = message;
      this.modal.classList.add('show');
    }
  }, {
    key: "closeModal",
    value: function closeModal() {
      this.modal.classList.remove('show');
    }
  }, {
    key: "undoLastMove",
    value: function undoLastMove() {
      if (this.moveHistory.length === 0 || this.gameOver) return;
      var lastMove = this.moveHistory.pop();
      this.board[lastMove.y][lastMove.x].playerId = null;
      this.cellsLeft++;
      this.currentPlayer = this.players.find(function (player) {
        return player.id === lastMove.playerId;
      });
      this.render();
    }
  }, {
    key: "resetGame",
    value: function resetGame() {
      this.board = this.createEmptyBoard();
      this.gameOver = false;
      this.moveHistory = [];
      this.cellsLeft = this.options.columns * this.options.rows;
      this.render();
    }
  }]);
}();
class Puissance4 {
    constructor(selector, options = {}) {
        const defaultOptions = {
            columns: 7,
            rows: 6,
            playerColors: ['#FF0000', '#FFFF00']
        };

        this.options = { ...defaultOptions, ...options };

        if (this.options.playerColors[0] === this.options.playerColors[1]) {
            throw new Error('Players cannot have the same color');
        }

        this.container = document.querySelector(selector);
        if (!this.container) {
            throw new Error(`Element not found: ${selector}`);
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

    initialize() {
        this.players = [
            { id: 1, color: this.options.playerColors[0], score: 0 },
            { id: 2, color: this.options.playerColors[1], score: 0 }
        ];

        this.board = this.createEmptyBoard();
        this.currentPlayer = this.players[0];
        this.gameOver = false;
        this.moveHistory = [];
        this.cellsLeft = this.options.columns * this.options.rows;
    }

    createEmptyBoard() {
        const board = [];
        for (let y = 0; y < this.options.rows; y++) {
            const row = [];
            for (let x = 0; x < this.options.columns; x++) {
                row.push({ x, y, playerId: null });
            }
            board.push(row);
        }
        return board;
    }

    render() {
        this.container.innerHTML = '';
        
        for (let x = 0; x < this.options.columns; x++) {
            const column = document.createElement('div');
            column.className = 'column';
            column.dataset.column = x;
            
            const hoverEffect = document.createElement('div');
            hoverEffect.className = 'column-hover';
            column.appendChild(hoverEffect);
            
            for (let y = this.options.rows - 1; y >= 0; y--) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                const cellData = this.board[y][x];
                if (cellData.playerId !== null) {
                    const token = document.createElement('div');
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

    setupEventListeners() {
        this.container.addEventListener('click', (event) => {
            if (this.gameOver) return;
            
            const column = event.target.closest('.column');
            if (column) {
                const columnIndex = parseInt(column.dataset.column);
                this.makeMove(columnIndex);
            }
        });
        
        this.undoButton.addEventListener('click', () => {
            this.undoLastMove();
        });
        
        this.resetButton.addEventListener('click', () => {
            this.resetGame();
        });
        
        this.newGameButton.addEventListener('click', () => {
            this.resetGame();
            this.closeModal();
        });
    }

    makeMove(columnIndex) {
        const rowIndex = this.getLowestEmptyRow(columnIndex);
        
        if (rowIndex === -1) return;
        
        this.board[rowIndex][columnIndex].playerId = this.currentPlayer.id;
        this.cellsLeft--;
        
        this.moveHistory.push({ x: columnIndex, y: rowIndex, playerId: this.currentPlayer.id });
        
        this.animateTokenDrop(columnIndex, rowIndex);
        
        if (this.checkWin(columnIndex, rowIndex)) {
            this.handleWin();
        } 
        else if (this.cellsLeft === 0) {
            this.handleDraw();
        } 
        else {
            this.switchPlayer();
            this.updatePlayerInfo();
        }
    }

    animateTokenDrop(x, y) {
        const columns = this.container.querySelectorAll('.column');
        const column = columns[x];
        
        const targetCell = column.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        
        const dropDistance = (this.options.rows - y - 1) * 60; 
        
        const token = document.createElement('div');
        token.className = 'token';
        token.style.backgroundColor = this.getPlayerColor(this.currentPlayer.id);
        token.style.top = `-${dropDistance}px`; 
        
        targetCell.appendChild(token);
        
        setTimeout(() => {
            token.style.transition = 'top 0.5s ease-in';
            token.style.top = '5%';
        }, 10);
    }

    getLowestEmptyRow(columnIndex) {
        for (let y = 0; y < this.options.rows; y++) {
            if (this.board[y][columnIndex].playerId === null) {
                return y;
            }
        }
        return -1;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer.id === 1 ? this.players[1] : this.players[0];
    }

    updatePlayerInfo() {
        this.currentPlayerDisplay.textContent = `Current Player: ${this.currentPlayer.id}`;
        this.currentPlayerDisplay.style.color = this.currentPlayer.color;
        
        this.player1ScoreDisplay.textContent = `Player 1: ${this.players[0].score}`;
        this.player2ScoreDisplay.textContent = `Player 2: ${this.players[1].score}`;
    }

    getPlayerColor(playerId) {
        return this.players.find(player => player.id === playerId).color;
    }

    checkWin(x, y) {
        const playerId = this.board[y][x].playerId;
        return (
            this.checkDirection(x, y, 1, 0, playerId) ||
            this.checkDirection(x, y, 0, 1, playerId) ||
            this.checkDirection(x, y, 1, 1, playerId) ||
            this.checkDirection(x, y, 1, -1, playerId)
        );
    }

    checkDirection(x, y, dx, dy, playerId) {
        let count = 1;
        
        count += this.countConsecutive(x, y, dx, dy, playerId);
        count += this.countConsecutive(x, y, -dx, -dy, playerId);
        
        return count >= 4;
    }

    countConsecutive(x, y, dx, dy, playerId) {
        let count = 0;
        let nx = x + dx;
        let ny = y + dy;
        
        while (
            nx >= 0 && nx < this.options.columns &&
            ny >= 0 && ny < this.options.rows &&
            this.board[ny][nx].playerId === playerId
        ) {
            count++;
            nx += dx;
            ny += dy;
        }
        
        return count;
    }

    handleWin() {
        this.gameOver = true;
        this.currentPlayer.score++;
        this.updatePlayerInfo();
        
        this.showModal(`Player ${this.currentPlayer.id} won!`);
    }

    handleDraw() {
        this.gameOver = true;
        this.showModal('Game ended in a draw!');
    }

    showModal(message) {
        this.gameResult.textContent = message;
        this.modal.classList.add('show');
    }

    closeModal() {
        this.modal.classList.remove('show');
    }

    undoLastMove() {
        if (this.moveHistory.length === 0 || this.gameOver) return;
        
        const lastMove = this.moveHistory.pop();
        
        this.board[lastMove.y][lastMove.x].playerId = null;
        this.cellsLeft++;
        
        this.currentPlayer = this.players.find(player => player.id === lastMove.playerId);
        
        this.render();
    }

    resetGame() {
        this.board = this.createEmptyBoard();
        this.gameOver = false;
        this.moveHistory = [];
        this.cellsLeft = this.options.columns * this.options.rows;
        this.render();
    }
}
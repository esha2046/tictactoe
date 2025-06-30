// Enhanced Tic-Tac-Toe with AI vs AI Mode

class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.gameMode = 'human-vs-ai'; // 'human-vs-ai' or 'ai-vs-ai'
        this.autoPlay = false;
        
        // Statistics for AI vs AI
        this.stats = {
            aiXWins: 0,
            aiOWins: 0,
            ties: 0,
            totalGames: 0
        };
        
        this.initializeElements();
        this.initializeGame();
    }

    initializeElements() {
        // Game elements
        this.cells = document.querySelectorAll('.cell');
        this.status = document.getElementById('status');
        this.playersInfo = document.getElementById('playersInfo');
        
        // Controls
        this.resetBtn = document.getElementById('resetBtn');
        this.autoPlayBtn = document.getElementById('autoPlayBtn');
        this.stepBtn = document.getElementById('stepBtn');
        
        // Mode buttons
        this.humanVsAiBtn = document.getElementById('humanVsAiBtn');
        this.aiVsAiBtn = document.getElementById('aiVsAiBtn');
        
        // AI explanation
        this.aiExplanation = document.getElementById('aiExplanation');
        this.aiTitle = document.getElementById('aiTitle');
        this.explanationText = document.getElementById('explanationText');
        this.moveScore = document.getElementById('moveScore');
        
        // Stats
        this.aiStats = document.getElementById('aiStats');
        this.aiXWinsEl = document.getElementById('aiXWins');
        this.aiOWinsEl = document.getElementById('aiOWins');
        this.tiesEl = document.getElementById('ties');
        this.totalGamesEl = document.getElementById('totalGames');
    }

    initializeGame() {
        // Add event listeners
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
        
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.autoPlayBtn.addEventListener('click', () => this.toggleAutoPlay());
        this.stepBtn.addEventListener('click', () => this.makeNextAIMove());
        
        this.humanVsAiBtn.addEventListener('click', () => this.setGameMode('human-vs-ai'));
        this.aiVsAiBtn.addEventListener('click', () => this.setGameMode('ai-vs-ai'));
        
        this.updateStatus('Choose game mode to start!');
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.autoPlay = false;
        
        // Update UI
        this.humanVsAiBtn.classList.toggle('active', mode === 'human-vs-ai');
        this.aiVsAiBtn.classList.toggle('active', mode === 'ai-vs-ai');
        
        // Show/hide appropriate controls
        if (mode === 'ai-vs-ai') {
            this.autoPlayBtn.style.display = 'inline-block';
            this.stepBtn.style.display = 'inline-block';
            this.aiStats.style.display = 'block';
            this.playersInfo.textContent = 'AI X vs AI O';
        } else {
            this.autoPlayBtn.style.display = 'none';
            this.stepBtn.style.display = 'none';
            this.aiStats.style.display = 'none';
            this.playersInfo.textContent = 'You: X | AI: O';
        }
        
        this.resetGame();
    }

    handleCellClick(index) {
        // Only allow human moves in human-vs-ai mode
        if (this.gameMode !== 'human-vs-ai') return;
        if (!this.gameActive || this.board[index] !== '' || this.currentPlayer !== 'X') {
            return;
        }

        this.makeMove(index, 'X');
        
        if (!this.gameActive) return;

        this.updateStatus('AI is thinking...');
        setTimeout(() => {
            this.makeAIMove();
        }, 500);
    }

    makeMove(index, player) {
        this.board[index] = player;
        this.cells[index].textContent = player;
        this.cells[index].classList.add(player.toLowerCase());
        this.cells[index].disabled = true;

        // Highlight the move briefly
        this.cells[index].classList.add('highlight');
        setTimeout(() => {
            this.cells[index].classList.remove('highlight');
        }, 500);

        const winner = this.checkWinner();
        if (winner) {
            this.endGame(winner);
        } else if (this.isBoardFull()) {
            this.endGame('tie');
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
    }

    makeAIMove() {
        if (!this.gameActive) return;

        const moveAnalysis = this.getBestMoveWithAnalysis(this.currentPlayer);
        this.makeMove(moveAnalysis.move, this.currentPlayer);
        
        this.explainAIMove(moveAnalysis, this.currentPlayer);
        
        if (this.gameActive) {
            if (this.gameMode === 'human-vs-ai') {
                this.updateStatus('Your turn!');
            } else {
                // AI vs AI mode
                const nextPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
                this.updateStatus(`AI ${nextPlayer}'s turn`);
                
                if (this.autoPlay) {
                    setTimeout(() => this.makeNextAIMove(), 1000);
                }
            }
        }
    }

    makeNextAIMove() {
        if (!this.gameActive) return;
        
        this.updateStatus(`AI ${this.currentPlayer} is thinking...`);
        setTimeout(() => {
            this.makeAIMove();
        }, 300);
    }

    toggleAutoPlay() {
        this.autoPlay = !this.autoPlay;
        this.autoPlayBtn.textContent = this.autoPlay ? 'Stop Auto' : 'Auto Play';
        
        if (this.autoPlay && this.gameActive) {
            setTimeout(() => this.makeNextAIMove(), 500);
        }
    }

    getBestMoveWithAnalysis(player) {
        let bestScore = player === 'O' ? -Infinity : Infinity;
        let bestMove = 0;
        let analysis = {
            move: 0,
            score: 0,
            reasoning: '',
            moveType: '',
            alternatives: []
        };

        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = player;
                let score = this.minimax(this.board, 0, player === 'X');
                this.board[i] = '';
                
                analysis.alternatives.push({
                    position: i,
                    score: score,
                    description: this.getPositionName(i)
                });
                
                if ((player === 'O' && score > bestScore) || (player === 'X' && score < bestScore)) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        analysis.move = bestMove;
        analysis.score = bestScore;
        analysis.moveType = this.analyzeMoveType(bestMove, bestScore, player);
        analysis.reasoning = this.generateReasoning(bestMove, bestScore, analysis.alternatives, player);

        return analysis;
    }

    analyzeMoveType(move, score, player) {
        // Check if this move wins the game
        this.board[move] = player;
        if (this.checkWinnerForBoard(this.board) === player) {
            this.board[move] = '';
            return 'winning';
        }
        this.board[move] = '';

        // Check if this move blocks opponent win
        const opponent = player === 'X' ? 'O' : 'X';
        this.board[move] = opponent;
        if (this.checkWinnerForBoard(this.board) === opponent) {
            this.board[move] = '';
            return 'blocking';
        }
        this.board[move] = '';

        if (this.createsFork(move, player)) return 'fork';
        if (this.createsFork(move, opponent)) return 'fork-block';

        if (score > 0) return 'advantageous';
        if (score === 0) return 'neutral';
        return 'defensive';
    }

    createsFork(move, player) {
        this.board[move] = player;
        let winningMoves = 0;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = player;
                if (this.checkWinnerForBoard(this.board) === player) {
                    winningMoves++;
                }
                this.board[i] = '';
            }
        }
        
        this.board[move] = '';
        return winningMoves >= 2;
    }

    generateReasoning(move, score, alternatives, player) {
        const position = this.getPositionName(move);
        const moveType = this.analyzeMoveType(move, score, player);
        const playerName = this.gameMode === 'ai-vs-ai' ? `AI ${player}` : (player === 'O' ? 'AI' : 'You');

        switch (moveType) {
            case 'winning':
                return `${playerName} chose ${position} to win the game! 🎉`;
            
            case 'blocking':
                return `${playerName} chose ${position} to block the opponent's winning move.`;
            
            case 'fork':
                return `${playerName} chose ${position} to create a fork - multiple ways to win!`;
            
            case 'fork-block':
                return `${playerName} chose ${position} to prevent the opponent from creating a fork.`;
            
            case 'advantageous':
                return `${playerName} chose ${position} for strategic advantage.`;
            
            case 'neutral':
                if (move === 4 && this.board[4] === '') {
                    return `${playerName} chose the center - the strongest strategic position.`;
                }
                if ([0, 2, 6, 8].includes(move)) {
                    return `${playerName} chose the ${position} corner for strategic positioning.`;
                }
                return `${playerName} chose ${position} to maintain optimal defensive positioning.`;
            
            default:
                return `${playerName} chose ${position} as the best defensive move available.`;
        }
    }

    getPositionName(index) {
        const positions = [
            'top-left', 'top-center', 'top-right',
            'middle-left', 'center', 'middle-right',
            'bottom-left', 'bottom-center', 'bottom-right'
        ];
        return positions[index];
    }

    explainAIMove(analysis, player) {
        const playerName = this.gameMode === 'ai-vs-ai' ? `AI ${player}` : 'AI';
        this.aiTitle.textContent = `🤖 ${playerName}'s Move:`;
        this.explanationText.textContent = analysis.reasoning;
        
        let scoreText = '';
        if (analysis.score > 0) {
            scoreText = `Score: +${analysis.score} (Winning position)`;
        } else if (analysis.score < 0) {
            scoreText = `Score: ${analysis.score} (Defensive move)`;
        } else {
            scoreText = `Score: ${analysis.score} (Neutral - leads to draw)`;
        }
        
        this.moveScore.textContent = scoreText;
        this.aiExplanation.style.display = 'block';
    }

    minimax(board, depth, isMaximizing) {
        const winner = this.checkWinnerForBoard(board);
        
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (this.isBoardFullForBoard(board)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWinner() {
        return this.checkWinnerForBoard(this.board);
    }

    checkWinnerForBoard(board) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }

    isBoardFull() {
        return this.isBoardFullForBoard(this.board);
    }

    isBoardFullForBoard(board) {
        return board.every(cell => cell !== '');
    }

    endGame(result) {
        this.gameActive = false;
        this.autoPlay = false;
        this.autoPlayBtn.textContent = 'Auto Play';
        
        // Update statistics for AI vs AI mode
        if (this.gameMode === 'ai-vs-ai') {
            this.stats.totalGames++;
            if (result === 'X') {
                this.stats.aiXWins++;
            } else if (result === 'O') {
                this.stats.aiOWins++;
            } else {
                this.stats.ties++;
            }
            this.updateStats();
        }
        
        if (result === 'X') {
            const message = this.gameMode === 'ai-vs-ai' ? '🤖 AI X wins!' : '🎉 You won! Great job!';
            this.updateStatus(message, 'winner');
        } else if (result === 'O') {
            const message = this.gameMode === 'ai-vs-ai' ? '🤖 AI O wins!' : '🤖 AI wins! The Minimax algorithm is unbeatable.';
            this.updateStatus(message, 'winner');
        } else {
            this.updateStatus('🤝 It\'s a tie! Perfect play from both sides!', 'tie');
        }

        this.cells.forEach(cell => cell.disabled = true);
        
        // Auto-start new game in AI vs AI mode with auto-play
        if (this.gameMode === 'ai-vs-ai' && this.autoPlay) {
            setTimeout(() => this.resetGame(), 2000);
        }
    }

    updateStats() {
        this.aiXWinsEl.textContent = this.stats.aiXWins;
        this.aiOWinsEl.textContent = this.stats.aiOWins;
        this.tiesEl.textContent = this.stats.ties;
        this.totalGamesEl.textContent = this.stats.totalGames;
    }

    updateStatus(message, className = '') {
        this.status.textContent = message;
        this.status.className = className;
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.disabled = false;
            cell.className = 'cell';
        });
        
        this.aiExplanation.style.display = 'none';
        
        if (this.gameMode === 'human-vs-ai') {
            this.updateStatus('Your turn! Click any cell to start.');
        } else {
            this.updateStatus('AI X\'s turn - Click "Next Move" or "Auto Play"');
            if (this.autoPlay) {
                setTimeout(() => this.makeNextAIMove(), 1000);
            }
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
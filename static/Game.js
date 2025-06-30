// GameManager.js - Game State Management

class GameManager {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.gameMode = 'human-vs-ai'; // 'human-vs-ai' or 'ai-vs-ai'
        this.autoPlay = false;
        this.difficulty = 'hard'; // 'easy', 'medium', 'hard'
        
        // Statistics for AI vs AI
        this.stats = {
            aiXWins: 0,
            aiOWins: 0,
            ties: 0,
            totalGames: 0,
            playerWins: 0,
            aiWins: 0
        };
        
        this.aiPlayer = new AIPlayer();
        this.initializeElements();
        this.initializeEventListeners();
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
        
        // Difficulty buttons
        this.easyBtn = document.getElementById('easyBtn');
        this.mediumBtn = document.getElementById('mediumBtn');
        this.hardBtn = document.getElementById('hardBtn');
        
        // AI explanation
        this.aiExplanation = document.getElementById('aiExplanation');
        this.aiTitle = document.getElementById('aiTitle');
        this.explanationText = document.getElementById('explanationText');
        this.moveScore = document.getElementById('moveScore');
        this.difficultyIndicator = document.getElementById('difficultyIndicator');
        
        // Stats
        this.aiStats = document.getElementById('aiStats');
        this.aiXWinsEl = document.getElementById('aiXWins');
        this.aiOWinsEl = document.getElementById('aiOWins');
        this.tiesEl = document.getElementById('ties');
        this.totalGamesEl = document.getElementById('totalGames');
        this.playerWinsEl = document.getElementById('playerWins');
        this.aiWinsEl = document.getElementById('aiWins');
    }

    initializeEventListeners() {
        // Cell clicks
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
        
        // Control buttons
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.autoPlayBtn.addEventListener('click', () => this.toggleAutoPlay());
        this.stepBtn.addEventListener('click', () => this.makeNextAIMove());
        
        // Mode buttons
        this.humanVsAiBtn.addEventListener('click', () => this.setGameMode('human-vs-ai'));
        this.aiVsAiBtn.addEventListener('click', () => this.setGameMode('ai-vs-ai'));
        
        // Difficulty buttons
        this.easyBtn.addEventListener('click', () => this.setDifficulty('easy'));
        this.mediumBtn.addEventListener('click', () => this.setDifficulty('medium'));
        this.hardBtn.addEventListener('click', () => this.setDifficulty('hard'));
        
        this.updateStatus('Choose game mode and difficulty to start!');
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.autoPlay = false;
        
        // Update UI
        this.humanVsAiBtn.classList.toggle('active', mode === 'human-vs-ai');
        this.aiVsAiBtn.classList.toggle('active', mode === 'ai-vs-ai');
        
        // Show/hide appropriate controls and stats
        const humanAiStats = document.querySelectorAll('.human-ai-stats');
        const aiAiStats = document.querySelectorAll('.ai-ai-stats');
        
        if (mode === 'ai-vs-ai') {
            this.autoPlayBtn.style.display = 'inline-block';
            this.stepBtn.style.display = 'inline-block';
            this.aiStats.style.display = 'block';
            this.playersInfo.textContent = 'AI X vs AI O';
            
            // Show AI vs AI stats, hide Human vs AI stats
            humanAiStats.forEach(el => el.style.display = 'none');
            aiAiStats.forEach(el => el.style.display = 'flex');
        } else {
            this.autoPlayBtn.style.display = 'none';
            this.stepBtn.style.display = 'none';
            this.aiStats.style.display = 'block';
            this.playersInfo.textContent = `You: X | AI: O (${this.difficulty.toUpperCase()})`;
            
            // Show Human vs AI stats, hide AI vs AI stats
            humanAiStats.forEach(el => el.style.display = 'flex');
            aiAiStats.forEach(el => el.style.display = 'none');
        }
        
        this.resetGame();
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.aiPlayer.setDifficulty(difficulty);
        
        // Update difficulty buttons
        this.easyBtn.classList.toggle('active', difficulty === 'easy');
        this.mediumBtn.classList.toggle('active', difficulty === 'medium');
        this.hardBtn.classList.toggle('active', difficulty === 'hard');
        
        // Update players info
        if (this.gameMode === 'human-vs-ai') {
            this.playersInfo.textContent = `You: X | AI: O (${difficulty.toUpperCase()})`;
        }
        
        // Update difficulty indicator
        this.difficultyIndicator.textContent = `Difficulty: ${difficulty.toUpperCase()}`;
        
        // If game is active, show difficulty change message
        if (this.gameActive) {
            this.updateStatus(`Difficulty changed to ${difficulty.toUpperCase()}! Current game continues.`);
            setTimeout(() => {
                if (this.gameMode === 'human-vs-ai' && this.currentPlayer === 'X') {
                    this.updateStatus('Your turn!');
                } else if (this.gameMode === 'ai-vs-ai') {
                    this.updateStatus(`AI ${this.currentPlayer}'s turn`);
                }
            }, 2000);
        }
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

        const moveAnalysis = this.aiPlayer.getBestMoveWithAnalysis(this.board, this.currentPlayer);
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

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }
        return null;
    }

    isBoardFull() {
        return this.board.every(cell => cell !== '');
    }

    endGame(result) {
        this.gameActive = false;
        this.autoPlay = false;
        this.autoPlayBtn.textContent = 'Auto Play';
        
        // Update statistics
        this.stats.totalGames++;
        
        if (this.gameMode === 'ai-vs-ai') {
            if (result === 'X') {
                this.stats.aiXWins++;
            } else if (result === 'O') {
                this.stats.aiOWins++;
            } else {
                this.stats.ties++;
            }
        } else {
            // Human vs AI mode
            if (result === 'X') {
                this.stats.playerWins++;
            } else if (result === 'O') {
                this.stats.aiWins++;
            } else {
                this.stats.ties++;
            }
        }
        
        this.updateStats();
        
        // Show appropriate message
        if (result === 'X') {
            const message = this.gameMode === 'ai-vs-ai' ? '🤖 AI X wins!' : '🎉 You won! Great job!';
            this.updateStatus(message, 'winner');
        } else if (result === 'O') {
            const message = this.gameMode === 'ai-vs-ai' ? '🤖 AI O wins!' : `🤖 AI wins! ${this.getDifficultyMessage()}`;
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

    getDifficultyMessage() {
        switch (this.difficulty) {
            case 'easy':
                return 'Try medium difficulty for a bigger challenge!';
            case 'medium':
                return 'Good game! Try hard mode for the ultimate challenge!';
            case 'hard':
                return 'The Minimax algorithm is unbeatable on hard mode!';
            default:
                return 'Good game!';
        }
    }

    updateStats() {
        if (this.gameMode === 'ai-vs-ai') {
            this.aiXWinsEl.textContent = this.stats.aiXWins;
            this.aiOWinsEl.textContent = this.stats.aiOWins;
        } else {
            this.playerWinsEl.textContent = this.stats.playerWins;
            this.aiWinsEl.textContent = this.stats.aiWins;
        }
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
    new GameManager();
});
// RLAgent.js

document.addEventListener('DOMContentLoaded', function () {
    const rlTabBtn = document.getElementById('rlTab');
    const rlSection = document.getElementById('rlSection');
    const backToGameBtn = document.getElementById('backToGameBtn');
    const mainContent = document.querySelector('.main-content');
    const infoPanel = document.querySelector('.info-panel');
    const startRLBtn = document.getElementById('startRLBtn');
    const stopRLBtn = document.getElementById('stopRLBtn');
    const rlStatus = document.getElementById('rlStatus');
    const rlChart = document.getElementById('rlChart');
    const ctx = rlChart.getContext('2d');
    const rlGameBoard = document.getElementById('rlGameBoard');
    const rlStatusMsg = document.getElementById('rlStatusMsg');
    const rlResetGameBtn = document.getElementById('rlResetGameBtn');

    // Add Reset Learning button and learning bar
    let rlLearningBar = document.getElementById('rlLearningBar');
    let rlEpsilonValue = document.getElementById('rlEpsilonValue');
    let rlResetLearningBtn = document.getElementById('rlResetLearningBtn');
    if (!rlLearningBar) {
        const bar = document.createElement('div');
        bar.id = 'rlLearningBar';
        bar.style = 'width: 100%; max-width: 300px; height: 18px; background: #eee; border-radius: 8px; margin: 10px auto 10px auto; position: relative;';
        const fill = document.createElement('div');
        fill.id = 'rlLearningFill';
        fill.style = 'height: 100%; width: 100%; background: #f39c12; border-radius: 8px; transition: width 0.3s;';
        bar.appendChild(fill);
        rlSection.insertBefore(bar, rlSection.querySelector('.rl-game-board-container').nextSibling);
        const eps = document.createElement('div');
        eps.id = 'rlEpsilonValue';
        eps.style = 'margin-bottom: 10px; color: #7f8c8d; font-size: 0.95em;';
        rlSection.insertBefore(eps, bar.nextSibling);
        const resetBtn = document.createElement('button');
        resetBtn.id = 'rlResetLearningBtn';
        resetBtn.className = 'reset-btn';
        resetBtn.textContent = 'Reset Learning';
        resetBtn.style = 'margin-bottom: 18px; margin-top: 0;';
        rlSection.insertBefore(resetBtn, eps.nextSibling);
        rlLearningBar = bar;
        rlEpsilonValue = eps;
        rlResetLearningBtn = resetBtn;
    }

    // Tab switching logic
    rlTabBtn.addEventListener('click', function () {
        rlSection.style.display = 'block';
        mainContent.style.display = 'none';
        if (infoPanel) infoPanel.style.display = 'none';
        rlTabBtn.style.display = 'none';
        if (!preTrained) preTrainAgent();
    });
    backToGameBtn.addEventListener('click', function () {
        rlSection.style.display = 'none';
        mainContent.style.display = 'grid';
        if (infoPanel) infoPanel.style.display = '';
        rlTabBtn.style.display = '';
    });

    // --- Q-learning RL Agent Implementation ---
    let Q = {};
    const alpha = 1.0; // Fast learning
    const gamma = 0.9;
    let epsilon = 1.0; // Start dumb
    const epsilonMin = 0.05;
    const epsilonDecay = 0.7; // Decay fast for demo
    let stats = { wins: 0, losses: 0, ties: 0, games: 0, winRates: [] };
    let preTrained = false;
    let useMinimax = false;

    // RL Game State
    let rlBoard = Array(9).fill(' ');
    let rlGameOver = false;
    let rlHistory = [];

    // Fun AI personality messages
    const aiMessages = {
        learning: [
            "I'm learning from you!",
            "Hmm, interesting move...",
            "Every game makes me smarter!",
            "I wonder what you'll do next...",
            "You might win now, but not for long!"
        ],
        win: [
            "Gotcha! I'm getting good at this!",
            "Victory! My training is paying off.",
            "You can't outsmart me forever!",
            "I told you I'd get better!"
        ],
        loss: [
            "You won this time, but I'll get you next round!",
            "Nice move! I'll remember that...",
            "You're a tough opponent!",
            "I need to study your strategy more."
        ],
        tie: [
            "A tie! We're evenly matched... for now.",
            "So close! Let's play again.",
            "Neither of us won, but I learned a lot!"
        ],
        smart: [
            "Now I'm playing at my best!",
            "Watch out, I'm fully trained!",
            "I'm using everything I've learned!"
        ]
    };
    function getRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function boardToState(board) {
        return board.join('');
    }
    function availableMoves(board) {
        return board.map((v, i) => v === ' ' ? i : null).filter(i => i !== null);
    }
    function checkWinner(board) {
        const lines = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        for (let line of lines) {
            const [a,b,c] = line;
            if (board[a] !== ' ' && board[a] === board[b] && board[b] === board[c])
                return board[a];
        }
        return board.includes(' ') ? null : 'T';
    }
    function bestMove(state, board) {
        if (!Q[state]) Q[state] = Array(9).fill(0);
        const moves = availableMoves(board);
        let maxQ = -Infinity, best = moves[0];
        for (let m of moves) {
            if (Q[state][m] > maxQ) {
                maxQ = Q[state][m];
                best = m;
            }
        }
        return best;
    }
    function randomMove(board) {
        const moves = availableMoves(board);
        return moves[Math.floor(Math.random() * moves.length)];
    }
    function updateBoardUI() {
        const cells = rlGameBoard.querySelectorAll('.cell');
        for (let i = 0; i < 9; i++) {
            cells[i].textContent = rlBoard[i] === ' ' ? '' : rlBoard[i];
            cells[i].disabled = rlBoard[i] !== ' ' || rlGameOver;
        }
    }
    function updateLearningBar() {
        const fill = document.getElementById('rlLearningFill');
        const percent = 1 - (epsilon - epsilonMin) / (1.0 - epsilonMin);
        fill.style.width = `${Math.max(10, percent * 100)}%`;
        fill.style.background = `linear-gradient(90deg, #f39c12 ${(1-percent)*100}%, #27ae60 ${percent*100}%)`;
        rlEpsilonValue.textContent = `AI Smartness: ${(percent*100).toFixed(0)}% (Epsilon: ${epsilon.toFixed(2)})`;
    }
    function resetRLGame() {
        rlBoard = Array(9).fill(' ');
        rlGameOver = false;
        rlHistory = [];
        rlStatusMsg.textContent = 'Your turn! (You are X)';
        updateBoardUI();
    }
    function endRLGame(winner) {
        rlGameOver = true;
        let msg;
        let aiMsg = '';
        if (winner === 'X') {
            msg = 'You win!';
            stats.wins++;
            aiMsg = getRandom(aiMessages.loss);
        } else if (winner === 'O') {
            msg = 'AI wins!';
            stats.losses++;
            aiMsg = getRandom(aiMessages.win);
        } else {
            msg = "It's a tie!";
            stats.ties++;
            aiMsg = getRandom(aiMessages.tie);
        }
        stats.games++;
        stats.winRates.push({
            games: stats.games,
            win: stats.wins / stats.games,
            loss: stats.losses / stats.games,
            tie: stats.ties / stats.games
        });
        drawChart();
        // Q-learning update for RL agent (O) with strong rewards
        let reward;
        if (winner === 'O') reward = 10;
        else if (winner === 'X') reward = -10;
        else reward = 0;
        for (let i = rlHistory.length - 1; i >= 0; i--) {
            const { state, move, turn } = rlHistory[i];
            if (!Q[state]) Q[state] = Array(9).fill(0);
            if (turn === 'O') {
                Q[state][move] = Q[state][move] + alpha * (reward - Q[state][move]);
                reward = Q[state][move];
            }
        }
        // After 3 games, switch to Minimax (perfect play)
        if (stats.games >= 3) {
            epsilon = epsilonMin;
            useMinimax = true;
            aiMsg = getRandom(aiMessages.smart);
            rlStatusMsg.textContent = msg + ' The AI is now playing smart! ' + aiMsg + ' Click Reset Board to play again.';
        } else {
            epsilon = Math.max(epsilon * epsilonDecay, epsilonMin);
            rlStatusMsg.textContent = msg + ' ' + getRandom(aiMessages.learning) + ' Click Reset Board to play again.';
        }
        updateLearningBar();
    }
    function aiMove() {
        if (rlGameOver) return;
        let move;
        if (useMinimax) {
            move = minimax([...rlBoard], true).move;
        } else if (Math.random() < epsilon) {
            move = randomMove(rlBoard);
        } else {
            move = bestMove(boardToState(rlBoard), rlBoard);
        }
        rlBoard[move] = 'O';
        rlHistory.push({ state: boardToState(rlBoard), move, turn: 'O' });
        updateBoardUI();
        const winner = checkWinner(rlBoard);
        if (winner) {
            endRLGame(winner);
        } else {
            rlStatusMsg.textContent = 'Your turn! (You are X)';
        }
    }
    // User move handler
    rlGameBoard.addEventListener('click', function (e) {
        if (rlGameOver) return;
        const idx = parseInt(e.target.getAttribute('data-index'));
        if (isNaN(idx) || rlBoard[idx] !== ' ') return;
        rlBoard[idx] = 'X';
        rlHistory.push({ state: boardToState(rlBoard), move: idx, turn: 'X' });
        updateBoardUI();
        const winner = checkWinner(rlBoard);
        if (winner) {
            endRLGame(winner);
        } else {
            rlStatusMsg.textContent = 'AI is thinking...';
            setTimeout(aiMove, 400);
        }
    });
    rlResetGameBtn.addEventListener('click', resetRLGame);
    // Reset Learning handler
    rlResetLearningBtn.addEventListener('click', function () {
        Q = {};
        epsilon = 1.0;
        stats = { wins: 0, losses: 0, ties: 0, games: 0, winRates: [] };
        drawChart();
        updateLearningBar();
        preTrained = false;
        useMinimax = false;
        preTrainAgent();
    });
    // Chart drawing
    function drawChart() {
        ctx.clearRect(0, 0, rlChart.width, rlChart.height);
        if (stats.winRates.length < 2) return;
        ctx.strokeStyle = '#27ae60';
        ctx.beginPath();
        for (let i = 0; i < stats.winRates.length; i++) {
            let x = (i / (stats.winRates.length - 1)) * rlChart.width;
            let y = rlChart.height - stats.winRates[i].win * rlChart.height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.strokeStyle = '#bdc3c7';
        ctx.beginPath();
        ctx.moveTo(0, rlChart.height);
        ctx.lineTo(rlChart.width, rlChart.height);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, rlChart.height);
        ctx.stroke();
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Segoe UI';
        ctx.fillText('Win Rate', 10, 15);
        ctx.fillText('Games', rlChart.width - 50, rlChart.height - 10);
    }
    // RL auto-training (optional, for fun)
    let training = false;
    let trainInterval = null;
    function autoTrainEpisode() {
        let board = Array(9).fill(' ');
        let history = [];
        let turn = 'X';
        let localEpsilon = 1.0;
        while (true) {
            let move;
            if (turn === 'X') {
                move = Math.random() < localEpsilon ? randomMove(board) : bestMove(boardToState(board), board);
            } else {
                move = Math.random() < localEpsilon ? randomMove(board) : bestMove(boardToState(board), board);
            }
            board[move] = turn;
            history.push({ state: boardToState(board), move, turn });
            let winner = checkWinner(board);
            if (winner) {
                let reward;
                if (winner === 'O') reward = 10;
                else if (winner === 'X') reward = -10;
                else reward = 0;
                for (let i = history.length - 1; i >= 0; i--) {
                    const { state, move, turn } = history[i];
                    if (!Q[state]) Q[state] = Array(9).fill(0);
                    if (turn === 'O') {
                        Q[state][move] = Q[state][move] + alpha * (reward - Q[state][move]);
                        reward = Q[state][move];
                    }
                }
                break;
            }
            turn = (turn === 'X') ? 'O' : 'X';
        }
    }
    async function preTrainAgent(numGames = 2000) {
        rlStatusMsg.textContent = 'AI is learning from scratch...';
        Q = {};
        for (let i = 0; i < numGames; i++) {
            autoTrainEpisode();
            // Animate learning bar
            if (i % 100 === 0) {
                let percent = i / numGames;
                const fill = document.getElementById('rlLearningFill');
                fill.style.width = `${Math.max(10, percent * 100)}%`;
                fill.style.background = `linear-gradient(90deg, #f39c12 ${(1-percent)*100}%, #27ae60 ${percent*100}%)`;
                rlEpsilonValue.textContent = `AI Smartness: ${(percent*100).toFixed(0)}% (Pre-training...)`;
                await new Promise(res => setTimeout(res, 1));
            }
        }
        preTrained = true;
        epsilon = 0.2;
        rlStatusMsg.textContent = 'AI is ready! Try to beat it and watch it adapt.';
        updateLearningBar();
        resetRLGame();
    }
    function startTraining() {
        if (training) return;
        training = true;
        startRLBtn.style.display = 'none';
        stopRLBtn.style.display = '';
        rlStatus.textContent = 'Training...';
        trainInterval = setInterval(() => {
            for (let i = 0; i < 100; i++) autoTrainEpisode();
            drawChart();
            rlStatus.textContent = `Games: ${stats.games} | Win: ${(stats.wins / stats.games * 100).toFixed(1)}% | Loss: ${(stats.losses / stats.games * 100).toFixed(1)}% | Tie: ${(stats.ties / stats.games * 100).toFixed(1)}%`;
            if (stats.games >= 5000) stopTraining();
        }, 50);
    }
    function stopTraining() {
        training = false;
        startRLBtn.style.display = '';
        stopRLBtn.style.display = 'none';
        rlStatus.textContent += ' (Paused)';
        clearInterval(trainInterval);
    }
    startRLBtn.addEventListener('click', startTraining);
    stopRLBtn.addEventListener('click', stopTraining);

    // Initialize RL board and learning bar
    resetRLGame();
    updateLearningBar();

    // Minimax implementation for perfect play
    function minimax(board, isMaximizing) {
        const winner = checkWinner(board);
        if (winner === 'O') return { score: 1 };
        if (winner === 'X') return { score: -1 };
        if (winner === 'T') return { score: 0 };
        const moves = availableMoves(board);
        let bestMove = null;
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let move of moves) {
                board[move] = 'O';
                let score = minimax(board, false).score;
                board[move] = ' ';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            return { score: bestScore, move: bestMove };
        } else {
            let bestScore = Infinity;
            for (let move of moves) {
                board[move] = 'X';
                let score = minimax(board, true).score;
                board[move] = ' ';
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            return { score: bestScore, move: bestMove };
        }
    }
}); 
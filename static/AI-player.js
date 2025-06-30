// AIPlayer.js - AI Logic with Difficulty Levels

class AIPlayer {
    constructor() {
        this.difficulty = 'hard'; // 'easy', 'medium', 'hard'
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    getBestMoveWithAnalysis(board, player) {
        switch (this.difficulty) {
            case 'easy':
                return this.getEasyMove(board, player);
            case 'medium':
                return this.getMediumMove(board, player);
            case 'hard':
            default:
                return this.getHardMove(board, player);
        }
    }

    getEasyMove(board, player) {
        // Easy: 70% random moves, 30% strategic moves
        const availableMoves = this.getAvailableMoves(board);
        
        if (Math.random() < 0.7) {
            // Random move
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            return {
                move: randomMove,
                score: 0,
                reasoning: `AI chose ${this.getPositionName(randomMove)} randomly (Easy mode).`,
                moveType: 'random',
                alternatives: []
            };
        } else {
            // Check for immediate win or block
            const strategicMove = this.getStrategicMove(board, player);
            if (strategicMove !== null) {
                return {
                    move: strategicMove.move,
                    score: strategicMove.score,
                    reasoning: strategicMove.reasoning,
                    moveType: strategicMove.type,
                    alternatives: []
                };
            } else {
                // Fallback to random
                const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                return {
                    move: randomMove,
                    score: 0,
                    reasoning: `AI chose ${this.getPositionName(randomMove)} randomly (Easy mode).`,
                    moveType: 'random',
                    alternatives: []
                };
            }
        }
    }

    getMediumMove(board, player) {
        // Medium: Limited depth minimax (depth 4) with some randomness
        if (Math.random() < 0.15) {
            // 15% chance of random move for unpredictability
            const availableMoves = this.getAvailableMoves(board);
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            return {
                move: randomMove,
                score: 0,
                reasoning: `AI chose ${this.getPositionName(randomMove)} with some randomness (Medium mode).`,
                moveType: 'random',
                alternatives: []
            };
        }

        // Use limited depth minimax
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
            if (board[i] === '') {
                board[i] = player;
                let score = this.minimax(board, 0, player === 'X', 4); // Limited depth
                board[i] = '';
                
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
        analysis.moveType = this.analyzeMoveType(board, bestMove, bestScore, player);
        analysis.reasoning = this.generateReasoning(bestMove, bestScore, analysis.alternatives, player, 'medium');

        return analysis;
    }

    getHardMove(board, player) {
        // Hard: Full minimax algorithm (unbeatable)
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
            if (board[i] === '') {
                board[i] = player;
                let score = this.minimax(board, 0, player === 'X');
                board[i] = '';
                
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
        analysis.moveType = this.analyzeMoveType(board, bestMove, bestScore, player);
        analysis.reasoning = this.generateReasoning(bestMove, bestScore, analysis.alternatives, player, 'hard');

        return analysis;
    }

    getStrategicMove(board, player) {
        const opponent = player === 'X' ? 'O' : 'X';
        
        // Check for winning move
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = player;
                if (this.checkWinnerForBoard(board) === player) {
                    board[i] = '';
                    return {
                        move: i,
                        score: 10,
                        reasoning: `AI chose ${this.getPositionName(i)} to win the game! 🎉`,
                        type: 'winning'
                    };
                }
                board[i] = '';
            }
        }

        // Check for blocking move
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = opponent;
                if (this.checkWinnerForBoard(board) === opponent) {
                    board[i] = '';
                    return {
                        move: i,
                        score: 5,
                        reasoning: `AI chose ${this.getPositionName(i)} to block your winning move.`,
                        type: 'blocking'
                    };
                }
                board[i] = '';
            }
        }

        return null;
    }

    getAvailableMoves(board) {
        const moves = [];
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                moves.push(i);
            }
        }
        return moves;
    }

    minimax(board, depth, isMaximizing, maxDepth = Infinity) {
        const winner = this.checkWinnerForBoard(board);
        
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (this.isBoardFullForBoard(board)) return 0;
        if (depth >= maxDepth) return 0; // Depth limit for medium difficulty

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false, maxDepth);
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
                    let score = this.minimax(board, depth + 1, true, maxDepth);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    analyzeMoveType(board, move, score, player) {
        // Check if this move wins the game
        board[move] = player;
        if (this.checkWinnerForBoard(board) === player) {
            board[move] = '';
            return 'winning';
        }
        board[move] = '';

        // Check if this move blocks opponent win
        const opponent = player === 'X' ? 'O' : 'X';
        board[move] = opponent;
        if (this.checkWinnerForBoard(board) === opponent) {
            board[move] = '';
            return 'blocking';
        }
        board[move] = '';

        if (this.createsFork(board, move, player)) return 'fork';
        if (this.createsFork(board, move, opponent)) return 'fork-block';

        if (score > 0) return 'advantageous';
        if (score === 0) return 'neutral';
        return 'defensive';
    }

    createsFork(board, move, player) {
        board[move] = player;
        let winningMoves = 0;
        
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = player;
                if (this.checkWinnerForBoard(board) === player) {
                    winningMoves++;
                }
                board[i] = '';
            }
        }
        
        board[move] = '';
        return winningMoves >= 2;
    }

    generateReasoning(move, score, alternatives, player, difficulty) {
        const position = this.getPositionName(move);
        const moveType = this.analyzeMoveType(alternatives[0]?.board || [], move, score, player);
        
        let difficultyNote = '';
        switch (difficulty) {
            case 'easy':
                difficultyNote = ' (Easy: Basic strategy)';
                break;
            case 'medium':
                difficultyNote = ' (Medium: Strategic thinking)';
                break;
            case 'hard':
                difficultyNote = ' (Hard: Perfect play)';
                break;
        }

        switch (moveType) {
            case 'winning':
                return `AI chose ${position} to win the game! 🎉${difficultyNote}`;
            
            case 'blocking':
                return `AI chose ${position} to block the opponent's winning move.${difficultyNote}`;
            
            case 'fork':
                return `AI chose ${position} to create a fork - multiple ways to win!${difficultyNote}`;
            
            case 'fork-block':
                return `AI chose ${position} to prevent the opponent from creating a fork.${difficultyNote}`;
            
            case 'advantageous':
                return `AI chose ${position} for strategic advantage.${difficultyNote}`;
            
            case 'neutral':
                if (move === 4) {
                    return `AI chose the center - the strongest strategic position.${difficultyNote}`;
                }
                if ([0, 2, 6, 8].includes(move)) {
                    return `AI chose the ${position} corner for strategic positioning.${difficultyNote}`;
                }
                return `AI chose ${position} to maintain optimal defensive positioning.${difficultyNote}`;
            
            case 'random':
                return `AI chose ${position} with some unpredictability.${difficultyNote}`;
            
            default:
                return `AI chose ${position} as the best defensive move available.${difficultyNote}`;
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

    isBoardFullForBoard(board) {
        return board.every(cell => cell !== '');
    }
}
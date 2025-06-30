// MoveTree.js - Clean Move Tree Visualization

class MoveTreeVisualizer {
    constructor() {
        this.isVisible = false;
        this.maxDepth = 2;
        this.currentTree = null;
        this.initializeElements();
    }

    initializeElements() {
        this.treeSection = document.getElementById('moveTreeSection');
        this.toggleBtn = document.getElementById('toggleTreeBtn');
        this.treeContainer = document.getElementById('moveTree');
        this.depthSpan = document.getElementById('currentDepth');
        
        this.toggleBtn.addEventListener('click', () => this.toggleVisibility());
    }

    generateTree(board, player, currentMove = null) {
        this.currentTree = this.buildMoveTree(board, player, 0, this.maxDepth);
        this.currentTree.chosenMove = currentMove;
        
        if (this.isVisible) {
            this.renderTree();
        }
        
        // Show the tree section when AI makes a move
        this.treeSection.style.display = 'block';
    }

    buildMoveTree(board, player, depth, maxDepth) {
        if (depth >= maxDepth) return null;
        
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                // Create new board state
                const newBoard = [...board];
                newBoard[i] = player;
                
                // Calculate score for this move
                const score = this.evaluatePosition(newBoard, player, depth);
                
                availableMoves.push({
                    position: i,
                    score: score,
                    player: player,
                    children: depth < maxDepth - 1 ? 
                        this.buildMoveTree(newBoard, player === 'X' ? 'O' : 'X', depth + 1, maxDepth) : null
                });
            }
        }
        
        return availableMoves;
    }

    evaluatePosition(board, player, depth) {
        // Simple evaluation - check for immediate win/loss
        const winner = this.checkWinner(board);
        if (winner === 'O') return 10 - depth;  // AI wins
        if (winner === 'X') return depth - 10;  // Human wins
        if (this.isBoardFull(board)) return 0;   // Tie
        
        // Return a basic positional score
        return this.getPositionalScore(board);
    }

    getPositionalScore(board) {
        const center = 4;
        const corners = [0, 2, 6, 8];
        let score = 0;
        
        // Favor center
        if (board[center] === 'O') score += 3;
        if (board[center] === 'X') score -= 3;
        
        // Favor corners
        corners.forEach(pos => {
            if (board[pos] === 'O') score += 2;
            if (board[pos] === 'X') score -= 2;
        });
        
        return score;
    }

    renderTree() {
        if (!this.currentTree) {
            this.treeContainer.innerHTML = '<p>No tree data available</p>';
            return;
        }
        
        this.treeContainer.innerHTML = '';
        
        // Create root level
        const rootLevel = document.createElement('div');
        rootLevel.className = 'tree-level';
        
        // Sort moves by score (best first for AI)
        const sortedMoves = [...this.currentTree].sort((a, b) => b.score - a.score);
        
        sortedMoves.forEach(move => {
            const nodeElement = this.createNodeElement(move, 0);
            rootLevel.appendChild(nodeElement);
        });
        
        this.treeContainer.appendChild(rootLevel);
        
        // Add summary
        const summary = document.createElement('div');
        summary.className = 'tree-summary';
        summary.innerHTML = `
            <p><strong>Analysis:</strong> Explored ${this.currentTree.length} possible moves</p>
            <p><strong>Best Score:</strong> ${sortedMoves[0]?.score || 0}</p>
        `;
        this.treeContainer.appendChild(summary);
    }

    createNodeElement(move, depth) {
        const node = document.createElement('div');
        node.className = 'tree-node';
        
        const content = document.createElement('div');
        content.className = 'node-content';
        
        // Highlight best move and chosen move
        if (depth === 0 && move.position === this.currentTree.chosenMove) {
            content.classList.add('current-move');
        } else if (depth === 0 && move === this.currentTree.sort((a, b) => b.score - a.score)[0]) {
            content.classList.add('best-move');
        }
        
        const position = document.createElement('div');
        position.className = 'node-position';
        position.textContent = this.getPositionName(move.position);
        
        const score = document.createElement('div');
        score.className = `node-score ${move.score > 0 ? 'positive' : move.score < 0 ? 'negative' : ''}`;
        score.textContent = move.score;
        
        content.appendChild(position);
        content.appendChild(score);
        node.appendChild(content);
        
        // Add tooltip
        content.title = `Position: ${this.getPositionName(move.position)}, Score: ${move.score}, Player: ${move.player}`;
        
        return node;
    }

    getPositionName(index) {
        const positions = ['TL', 'TM', 'TR', 'ML', 'C', 'MR', 'BL', 'BM', 'BR'];
        return positions[index];
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.toggleBtn.textContent = this.isVisible ? 'Hide Tree' : 'Show Tree';
        
        if (this.isVisible && this.currentTree) {
            this.renderTree();
        } else {
            this.treeContainer.innerHTML = '';
        }
    }

    // Helper methods (reused from main game)
    checkWinner(board) {
        const patterns = [
            [0,1,2], [3,4,5], [6,7,8], // rows
            [0,3,6], [1,4,7], [2,5,8], // columns  
            [0,4,8], [2,4,6]           // diagonals
        ];
        
        for (let pattern of patterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }

    isBoardFull(board) {
        return board.every(cell => cell !== '');
    }
}
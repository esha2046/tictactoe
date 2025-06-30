# app.py
from flask import Flask, render_template, jsonify, request
import os

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = '1234567890'  # Change this in production

@app.route('/')
def index():
    """Serve the main tic-tac-toe game page"""
    return render_template('index.html')

@app.route('/api/game-stats', methods=['GET'])
def get_game_stats():
    """API endpoint to get game statistics (for future use)"""
    # This could be used to persist stats across sessions
    return jsonify({
        'message': 'Game stats endpoint - ready for implementation',
        'stats': {
            'aiXWins': 0,
            'aiOWins': 0,
            'ties': 0,
            'totalGames': 0
        }
    })

@app.route('/api/save-stats', methods=['POST'])
def save_game_stats():
    """API endpoint to save game statistics (for future use)"""
    stats = request.json
    # Here you could save to database or file
    return jsonify({
        'message': 'Stats saved successfully',
        'saved_stats': stats
    })

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Flask Tic-Tac-Toe app is running!'})

if __name__ == '__main__':
    # Make sure templates and static directories exist
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)
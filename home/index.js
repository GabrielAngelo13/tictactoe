var origBoard;
var scores = { 'X': 0, 'O': 0 };
const huPlayer = 'O';
const aiPlayer = 'X';
const winCombos = [
	// horizontal win
    [0, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23],
    [24, 25, 26, 27, 28, 29],

    // vertical win
    [0, 6, 12, 18, 24],
    [1, 7, 13, 19, 25],
    [2, 8, 14, 20, 26],
    [3, 9, 15, 21, 27],
    [4, 10, 16, 22, 28],
    [5, 11, 17, 23, 29],

    // diagonal win (left - right)
    [18, 25],
    [12, 19, 26],
    [6, 13, 20, 27],
    [0, 7, 14, 21, 28],
    [1, 8, 15, 22, 29],
    [2, 9, 16, 23],
    [3, 10, 17],
    [4, 11],
    
    // diagonal win (right - left)
    [28, 23],
    [27, 22, 17],
    [26, 21, 16, 11],
    [25, 20, 15, 10, 5],
    [24, 19, 14, 9 , 4],
    [18, 13, 8, 3],
    [12, 7, 2],
    [6, 1]
]

const cells = document.querySelectorAll('.cell');
clearTables();

function clearTables() {
	document.querySelector(".endgame").style.display = "none";
	origBoard = Array.from(Array(30).keys());
	for (var i = 0; i < cells.length; i++) {
		cells[i].innerText = '';
		cells[i].style.removeProperty('background-color');
		cells[i].addEventListener('click', turnClick, false);
	}
}

function resetScores() {
    scores['O'] = 0;
    scores['X'] = 0;
    document.querySelector(".endgame .text").innerText = "0 - 0";
}

function turnClick(square) {
    if (typeof origBoard[square.target.id] == 'number') {
        turn(square.target.id, huPlayer);
        let gameWon = checkWin(origBoard, huPlayer);
        if (!checkTie() && !gameWon) {
            setTimeout(function() {
                turn(bestSpot(), aiPlayer);
                checkWin(origBoard, aiPlayer); // Check if AI won after making a move
                checkTie(); // Check for a tie after AI makes a move
            }, 300); // Adjust the delay as needed
        }
    }
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    var currentCell = document.getElementById(squareId);
    currentCell.innerText = player;

    // Set the text color to white
    currentCell.style.color = 'white';

    let gameWon = checkWin(origBoard, player);
    if (gameWon) {
        gameOver(gameWon);
        updateScores(gameWon.player);
    }
}

function checkWin(board, player) {
    let plays = board.reduce((a, e, i) =>
        (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
	for (let index of winCombos[gameWon.index]) {
		document.getElementById(index).style.backgroundColor =
			gameWon.player == huPlayer ? "blue" : "red";
	}
	for (var i = 0; i < cells.length; i++) {
		cells[i].removeEventListener('click', turnClick, false);
	}
	declareWinner(gameWon.player == huPlayer ? "You win!" : "You lose.");
}

function declareWinner(who) {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
    setTimeout(function() {
        document.querySelector(".endgame").style.display = "none";
            clearTables();
    }, 2000); // Adjust the timeout duration as needed (1.5 seconds in this case)
    
}

function updateScores(player) {
    scores[player]++;
    document.querySelector(".endgame .text").innerText = scores['O'] + " - " + scores['X'];

    if (scores['O'] === 5 || scores['X'] === 5) {
        setTimeout(function() {
            declareWinner(scores['O'] === 5 ? "You win!" : "AI wins!");
            setTimeout(function(){
                resetScores();
            }, 2000);
        }, 2000); // Adjust the timeout duration as needed
    } else if (checkTie()) {
        setTimeout(function() {
            declareWinner("Tie Game!");
            setTimeout(function(){
                resetScores();
            }, 2000);
        }, 2000); // Adjust the timeout duration as needed
    }
}

function emptySquares() {
	return origBoard.filter(s => typeof s == 'number');
}

function bestSpot() {
	return emptySquares()[2];
}

function checkTie() {
    if (emptySquares().length == 0) {
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "green";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie Game")
        return true;
    }
    return false;
}

function minimax(newBoard, player) {
    var availSpots = emptySquares(newBoard);

    if (checkWin(newBoard, huPlayer)) {
        return { score: -10 };
    } else if (checkWin(newBoard, aiPlayer)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    var moves = [];
    for (var i = 0; i < availSpots.length; i++) {
        var move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if (player == aiPlayer) {
            var result = minimax(newBoard, huPlayer);
            move.score = result.score;
        } else {
            var result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;

        moves.push(move);
    }

    var bestMove;
    if (player === aiPlayer) {
        var bestScore = -Infinity;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        var bestScore = Infinity;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

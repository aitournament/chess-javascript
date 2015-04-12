[![Build Status](https://travis-ci.org/aitournament/chess-javascript.png?branch=master)](https://travis-ci.org/aitournament/chess-javascript)
[![Dependency Status](https://david-dm.org/aitournament/chess-javascript.png)](https://david-dm.org/aitournament/chess-javascript)

## Quick Start
```javascript
var chess = new Chess();
chess.on('move', function(move){...});

//an X,Y coordinate system is used, where 0,0 is the top-left, and 7,7 is the bottom right
//algebraic notation uses A1 as the bottom-left, and H8 as the top-right
var isValidMove = chess.move(0,6,0,4);//move white pawn from A2 to A4

//this will claim threefold repetition/fifty move rule if applicable, otherwise this
//creates a draw offer the opponent can accept by calling requestDraw
//making a move with an active draw offer from an opponent rejects the draw offer
chess.requestDraw(Chess.PLAYERS.WHITE);

...

//to promote a pawn to a piece other than a queen, add a 5th argument with the piece type
var isValidMove = chess.move(0,1,0,0,"knight");//white pawn from A7 to A8, promote to knight

//to claim threefold repetition or the fifty move rule at the end of the turn it occurs, set requestDraw to true while moving
//an incorrect claim is still a draw offer that the opponent may accept
var isValidMove = chess.move(0,6,0,4,"queen", true);//move white pawn from A2 to A4

chess.resign(Chess.PLAYERS.BLACK);

var gameOver = chess.isGameOver();
var winner = chess.getWinner();//null if game is not over
var gameState = chess.getGameState();//Chess.GAME_STATE.(IN_PROGRESS, CHECK_MATE, THREEFOLD_REPETITION, FIFTY_MOVES, STALE_MATE, DRAW, RESIGN)
```

# Events
## move
`chess.on('move',function(data){})`

---



`data.algebraicNotation` (String)

`data.type` (String)
- "move"

	`data.move` (Object)
    ```javascript
    {
    	from: {
        	x: x1,
            y: y1
        },
        to: {
            x: x2,
            y: y2
        }
    }
    ```
    
    `data.moveType` (String)
    - "castle"
    - "enpassant"
    
    	`data.enpassantPos` (Object)
	    
		```javascript
		{
			x: x,
			y: y
		}
		```
    
    - "promotion"

		`data.promotionPiece` (String)
		- Chess.PIECE_TYPE.QUEEN
		- Chess.PIECE_TYPE.KNIGHT
		- Chess.PIECE_TYPE.BISHOP
		- Chess.PIECE_TYPE.PAWN

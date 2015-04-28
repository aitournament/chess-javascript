var Chess = require('../../');
var expect = require('chai').expect;


it('the Chess module should be exposed', function() {
	Chess.should.exist;
});
describe('board setup', function() {
	var chess = new Chess();
	it('should init board state correctly', function(){
		expect(chess.getDrawRequested(Chess.PLAYERS.WHITE)).to.equal(false);
		expect(chess.canDrawBy50MoveRule()).to.equal(false);
		expect(chess.canDrawByThreefoldRepetition()).to.equal(false);
		expect(chess.getWinner()).to.equal(null);
		expect(chess.getBoardIdCount() === 1);
		expect(chess.getNumberOfMoves()).to.equal(0);
		expect(chess.isGameOver()).to.equal(false);
		expect(chess.getKingPosition(Chess.PLAYERS.WHITE)).to.deep.equal({x:4, y:7});
		expect(chess.getKingPosition(Chess.PLAYERS.BLACK)).to.deep.equal({x:4, y:0});
		expect(chess.getNumberOfCapturedPieces(Chess.PIECE.ROOK_BLACK)).to.equal(0);
		expect(chess.getTurn()).to.equal(Chess.PLAYERS.WHITE);
		expect(chess.getAllLegalMoves().length).to.equal(20);
		expect(chess.legalMoveExists());
		expect(chess.getIllegalMoves(0,6).length === 0);
	});
	it('should setup board pieces correctly', function(){
		expect(chess.getPiece(0,0)).to.equal(Chess.PIECE.ROOK_BLACK);
		expect(chess.getPiece(1,0)).to.equal(Chess.PIECE.KNIGHT_BLACK);
		expect(chess.getPiece(2,0)).to.equal(Chess.PIECE.BISHOP_BLACK);
		expect(chess.getPiece(3,0)).to.equal(Chess.PIECE.QUEEN_BLACK);
		expect(chess.getPiece(4,0)).to.equal(Chess.PIECE.KING_BLACK);
		expect(chess.getPiece(5,0)).to.equal(Chess.PIECE.BISHOP_BLACK);
		expect(chess.getPiece(6,0)).to.equal(Chess.PIECE.KNIGHT_BLACK);
		expect(chess.getPiece(7,0)).to.equal(Chess.PIECE.ROOK_BLACK);

		expect(chess.getPiece(0,1)).to.equal(Chess.PIECE.PAWN_BLACK);
		expect(chess.getPiece(1,1)).to.equal(Chess.PIECE.PAWN_BLACK);
		expect(chess.getPiece(2,1)).to.equal(Chess.PIECE.PAWN_BLACK);
		expect(chess.getPiece(3,1)).to.equal(Chess.PIECE.PAWN_BLACK);
		expect(chess.getPiece(4,1)).to.equal(Chess.PIECE.PAWN_BLACK);
		expect(chess.getPiece(5,1)).to.equal(Chess.PIECE.PAWN_BLACK);
		expect(chess.getPiece(6,1)).to.equal(Chess.PIECE.PAWN_BLACK);
		expect(chess.getPiece(7,1)).to.equal(Chess.PIECE.PAWN_BLACK);

		expect(chess.getPiece(0,6)).to.equal(Chess.PIECE.PAWN_WHITE);
		expect(chess.getPiece(1,6)).to.equal(Chess.PIECE.PAWN_WHITE);
		expect(chess.getPiece(2,6)).to.equal(Chess.PIECE.PAWN_WHITE);
		expect(chess.getPiece(3,6)).to.equal(Chess.PIECE.PAWN_WHITE);
		expect(chess.getPiece(4,6)).to.equal(Chess.PIECE.PAWN_WHITE);
		expect(chess.getPiece(5,6)).to.equal(Chess.PIECE.PAWN_WHITE);
		expect(chess.getPiece(6,6)).to.equal(Chess.PIECE.PAWN_WHITE);
		expect(chess.getPiece(7,6)).to.equal(Chess.PIECE.PAWN_WHITE);

		expect(chess.getPiece(0,7)).to.equal(Chess.PIECE.ROOK_WHITE);
		expect(chess.getPiece(1,7)).to.equal(Chess.PIECE.KNIGHT_WHITE);
		expect(chess.getPiece(2,7)).to.equal(Chess.PIECE.BISHOP_WHITE);
		expect(chess.getPiece(3,7)).to.equal(Chess.PIECE.QUEEN_WHITE);
		expect(chess.getPiece(4,7)).to.equal(Chess.PIECE.KING_WHITE);
		expect(chess.getPiece(5,7)).to.equal(Chess.PIECE.BISHOP_WHITE);
		expect(chess.getPiece(6,7)).to.equal(Chess.PIECE.KNIGHT_WHITE);
		expect(chess.getPiece(7,7)).to.equal(Chess.PIECE.ROOK_WHITE);
	});
});
describe('illegal moves', function(){
	var chess = new Chess();
	it("can't move piece 0 spaces", function(){
		expect(!chess.isLegalMove(0,7,0,7));
	});
});
describe('pawn moves', function(){
	var chess = new Chess();
	it('can move forward 1 at beginning', function(){
		expect(chess.isLegalMove(0,6,0,5)).to.be.true;
	});
	it('can move forward 2 at beginning', function(){
		expect(chess.isLegalMove(0,6,0,4)).to.be.true;
	});
});
describe('knight moves', function(){
	var chess = new Chess();
	it('can move correctly', function(){
		expect(chess.isLegalMove(1,7,0,5)).to.be.true;
		expect(chess.isLegalMove(1,7,2,5)).to.be.true;
	});
});
describe('resign', function(){
	var chess = new Chess();
	chess.resign(Chess.PLAYERS.WHITE);

	it('ends the game', function(){
		expect(chess.isGameOver());
	});
	it('sets state to RESIGN', function(){
		expect(chess.getGameState() === Chess.GAME_STATE.RESIGN);
	});
	it('sets correct winner', function(){
		expect(chess.getWinner() === Chess.PLAYERS.BLACK);
	});
});
describe('move pawn', function(){
	var chess = new Chess();
	chess.move(0,6,0,5);
	it('should move the pawn', function(){
		expect(chess.getPiece(0,6) === null);
		expect(chess.getPiece(0,5) === Chess.PIECE.PAWN_WHITE);
	});
	it('should add move to move history', function(){
		expect(chess.getMove(0)).to.deep.equal({
			type: "move",
			moveType: "normal",
			move: {
				from: {x:0, y:6},
				to: {x:0, y:5}
			},
			algebraicNotation: "a3"
		});
	});
});
describe('move event', function(){
	var chess;
	var move = null;
	beforeEach(function(){
		chess = new Chess();
		chess.on('move', function(m){
			move = m;
		});
		chess.move(0,6,0,5);
	});
	it('is called after a move', function(){
		expect(move).to.deep.equal({
			type: "move",
			moveType: "normal",
			move: {
				from: {x:0, y:6},
				to: {x:0, y:5}
			},
			algebraicNotation: "a3"
		});
	});
});

describe('draw', function(){
	var chess;
	beforeEach(function(){
		chess = new Chess();
		chess.requestDraw(Chess.PLAYERS.WHITE);
		chess.requestDraw(Chess.PLAYERS.BLACK);
	});
	it('should end the game', function(){
		expect(chess.isGameOver());
	});
	it('should have no winner', function(){
		expect(chess.getWinner() === null);
	});
	it('should set game state to DRAW', function(){
		expect(chess.getGameState() === Chess.GAME_STATE.DRAW);
	});
});
describe("castle", function(){
	var chess;
	var castleMove;
	beforeEach(function(){
		chess = new Chess();
		chess.move(4,6,4,5);//white pawn forward 1
		chess.move(0,1,0,2);//black pawn forward 1
		chess.move(5,7,4,6);//white bishop up-left 1
		chess.move(0,0,0,1);//black rook down 1
		chess.move(6,7,7,5);//white knight up right
		chess.move(0,1,0,0);//black rook up 1
		chess.on('move', function(move){
			castleMove = move;
		});
		chess.move(4,7,6,7);//white king castle right
	});
	it('should castle the rook right', function(){
		assert(chess.getPiece(5,7) === Chess.PIECE.ROOK_WHITE);
		assert(chess.getPiece(6,7) === Chess.PIECE.KING_WHITE);
		expect(castleMove).deep.equal({
			type: "move",
			moveType: "castle",
			move: {
				from: {x:4, y:7},
				to: {x:6, y:7}
			},
			algebraicNotation: "0-0"
		});
	});
});
describe("threefold repetition", function(){
	var chess;
	beforeEach(function(){
		chess = new Chess();
	});
	it('board id should be correct at start of game', function(){
		expect(chess.getBoardId()).to.equal("w1111-rnbqkbnrpppppppp--------------------------------PPPPPPPPRNBQKBNR");
	});
	it('board id count should start at 1', function(){
		expect(chess.getBoardIdCount() === 1);
		expect(chess.canDrawByThreefoldRepetition()).to.equal(false);
	});
	it('threefold repetition should be possible when board id count = 3', function(){
		chess.move(1,7,0,5);//white knight up left
		chess.move(1,0,0,2);//black knight down left
		chess.move(0,5,1,7);//white knight down right
		chess.move(0,2,1,0);//black knight up right
		expect(chess.getBoardIdCount() === 2);
		expect(chess.canDrawByThreefoldRepetition()).to.equal(false);
		chess.move(1,7,0,5);//white knight up left
		chess.move(1,0,0,2);//black knight down left
		chess.move(0,5,1,7);//white knight down right
		chess.move(0,2,1,0);//black knight up right
		expect(chess.getBoardIdCount() === 3);
		expect(chess.canDrawByThreefoldRepetition()).to.equal(true);
	});

});
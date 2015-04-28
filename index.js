function Chess(history){
	var self = this;
	var state={

	};
	self.reset = function(){
		state.turn = Chess.PLAYERS.WHITE; //if game is over, this is the winner
		state.enpassantCol = null;
		state.canCastleRight = {
			black: true,
			white: true
		};
		state.canCastleLeft = {
			black: true,
			white: true
		};
		state.kingPos = {
			black: {
				x: 4,
				y: 0
			},
			white: {
				x: 4,
				y: 7
			}
		};
		state.drawRequested = {
			black: false,
			white: false
		};
		state.staleMoves = 0;
		state.gameState = Chess.GAME_STATE.IN_PROGRESS;
		state.history = [];
		state.historyIds= {}; //contains a history of the unique ids for state (to detect 3-fold rep)
		state.capturedPieces = {};
		

		
		state.board = [];
		for(a=0; a<8; a++){
			state.board[a] = [];
		}
		state.board[0][0] = Chess.PIECE.ROOK_BLACK;
		state.board[1][0] = Chess.PIECE.KNIGHT_BLACK;
		state.board[2][0] = Chess.PIECE.BISHOP_BLACK;
		state.board[3][0] = Chess.PIECE.QUEEN_BLACK;
		state.board[4][0] = Chess.PIECE.KING_BLACK;
		state.board[5][0] = Chess.PIECE.BISHOP_BLACK;
		state.board[6][0] = Chess.PIECE.KNIGHT_BLACK;
		state.board[7][0] = Chess.PIECE.ROOK_BLACK;

		state.board[0][1] = Chess.PIECE.PAWN_BLACK;
		state.board[1][1] = Chess.PIECE.PAWN_BLACK;
		state.board[2][1] = Chess.PIECE.PAWN_BLACK;
		state.board[3][1] = Chess.PIECE.PAWN_BLACK;
		state.board[4][1] = Chess.PIECE.PAWN_BLACK;
		state.board[5][1] = Chess.PIECE.PAWN_BLACK;
		state.board[6][1] = Chess.PIECE.PAWN_BLACK;
		state.board[7][1] = Chess.PIECE.PAWN_BLACK;

		state.board[0][6] = Chess.PIECE.PAWN_WHITE;
		state.board[1][6] = Chess.PIECE.PAWN_WHITE;
		state.board[2][6] = Chess.PIECE.PAWN_WHITE;
		state.board[3][6] = Chess.PIECE.PAWN_WHITE;
		state.board[4][6] = Chess.PIECE.PAWN_WHITE;
		state.board[5][6] = Chess.PIECE.PAWN_WHITE;
		state.board[6][6] = Chess.PIECE.PAWN_WHITE;
		state.board[7][6] = Chess.PIECE.PAWN_WHITE;

		state.board[0][7] = Chess.PIECE.ROOK_WHITE;
		state.board[1][7] = Chess.PIECE.KNIGHT_WHITE;
		state.board[2][7] = Chess.PIECE.BISHOP_WHITE;
		state.board[3][7] = Chess.PIECE.QUEEN_WHITE;
		state.board[4][7] = Chess.PIECE.KING_WHITE;
		state.board[5][7] = Chess.PIECE.BISHOP_WHITE;
		state.board[6][7] = Chess.PIECE.KNIGHT_WHITE;
		state.board[7][7] = Chess.PIECE.ROOK_WHITE;

		state.historyIds[self.getBoardId()] = 1;
		this.historyIds = state.historyIds;
	};

	self.getBoardId = function(){
		return getStateId();
	};
	self.getBoardIdCount = function(){
		var count = state.historyIds[self.getBoardId()];
		if(count){
			return count;
		}else{
			return 0;
		}
	};
	self.requestDraw = function(turn){
		return requestDrawPrivate(turn,true);
	};
	self.getPiece = function(x,y){
		return state.board[x][y];
	};
	self.getDrawRequested = function(turn){
		return state.drawRequested[turn];
	};
	self.getGameState = function(){
		return state.gameState;
	};
	self.canDrawBy50MoveRule = function(){
		return state.staleMoves >= 100;
	};
	self.canDrawByThreefoldRepetition = function(){
		return self.getBoardIdCount() >= 3;
	};
	self.getWinner = function(){
		if(self.getGameState() === Chess.GAME_STATE.IN_PROGRESS || self.getGameState() === Chess.GAME_STATE.STALE_MATE || self.getGameState === Chess.GAME_STATE.DRAW){
			return null;
		}
		return state.turn;
	};
	self.getNumberOfMoves = function (){
		return state.history.length;
	};
	self.getMove = function (index){
		return JSON.parse(JSON.stringify(state.history[index]));
	};
	self.isGameOver = function(){
		return state.gameState !== Chess.GAME_STATE.IN_PROGRESS;
	};

	self.getKingPosition = function(player){
		return state.kingPos[player];
	};
	self.getIllegalMoves = function(x,y,turn){
		var moves = getMoves(x,y,turn);
		var output = [];
		for(var a=0; a<moves.length; a++){
			if(!self.isLegalMove(x,y,moves[a].x,moves[a].y,turn)){
				output.push(moves[a]);
			}
		}
		return output;
	};
	self.getLegalMoves = function(x,y,turn){
		turn = turn || state.turn;
		var moves = getMoves(x,y,turn);
		var output = [];
		var fromPiece = state.board[x][y];
		var fromType = Chess.getPieceType(fromPiece);
		for(var a=0; a<moves.length; a++){
			var savedState = state;
			var newState = JSON.parse(JSON.stringify(state));

			var keepChecking = true;

			if(fromType === Chess.PIECE_TYPE.KING){
				if(moves[a].x - x === 2){//castling right
					if(canPieceAttackPos(x,y,Chess.getOppositeColor(turn)) || canPieceAttackPos(x+1,y,Chess.getOppositeColor(turn))){
						keepChecking = false;
					}
				}else if(x - moves[a].x === 2){//castling left
					if(canPieceAttackPos(x,y,Chess.getOppositeColor(turn)) || canPieceAttackPos(x-1,y,Chess.getOppositeColor(turn))){
						keepChecking = false;
					}
				}
			}

			if(keepChecking){
				state = newState;
				partialMove(x,y,moves[a].x,moves[a].y,Chess.PIECE_TYPE.QUEEN,turn);//promotion type can't determine legality, so queen is used


				var kingPos = self.getKingPosition(turn);

				if(!canPieceAttackPos(kingPos.x,kingPos.y,Chess.getOppositeColor(turn))){
					output.push(moves[a]);
				}
				state = savedState;
			}
		}
		return output;
	};
	self.getAllLegalMoves = function(turn){
		turn = turn || state.turn;
		var output = [];
		for(var x=0; x<8; x++){
			for(var y=0; y<8; y++){
				var moves = self.getLegalMoves(x,y,turn);
				for(var a=0; a<moves.length; a++){
					output.push([x,y,moves[a].x,moves[a].y]);
				}
			}
		}
		return output;
	};
	self.isLegalMove = function(x1,y1,x2,y2,turn){
		turn = turn || state.turn;
		var legalMoves = self.getLegalMoves(x1,y1,turn);
		for(var a=0; a<legalMoves.length; a++){
			if(legalMoves[a].x === x2 && legalMoves[a].y === y2){
				return true;
			}
		}
		return false;
	};
		
	self.legalMoveExists = function(turn){
		turn = turn || state.turn;
		for(var x=0; x<8; x++){
			for(var y=0; y<8; y++){
				if(self.getLegalMoves(x,y,turn).length > 0){
					return true;
				}
			}
		}
		return false;
	};
	self.getNumberOfCapturedPieces = function(piece){
		if(state.capturedPieces[piece]){
			return state.capturedPieces[piece];
		}else{
			return 0;
		}
	};
	self.getTurn = function(){
		if(self.isGameOver()){
			return null;
		}
		return state.turn;
	};
	self.resign = function(color){
		state.gameState = Chess.GAME_STATE.RESIGN;
		state.turn = Chess.getOppositeColor(color);
		var output = {
			resign: color
		};
		if(color === Chess.PLAYERS.WHITE){
			output.algebraicNotation = "0-1";
		}else{
			output.algebraicNotation = "1-0";
		}
		state.history.push(output);
	};
	self.move = function(x1,y1,x2,y2,promotionPiece,requestDraw){
		requestDraw = requestDraw || false;
		promotionPiece = promotionPiece || Chess.PIECE_TYPE.QUEEN;
		if(self.isLegalMove(x1,y1,x2,y2,state.turn)){
			moveUnchecked(x1,y1,x2,y2,promotionPiece,requestDraw);
			return true;
		}else{
			return false;
		}
	};
	function getMoves(x,y,turn){
		turn = turn || state.turn;
		var piece = state.board[x][y];
		if(piece && !self.isGameOver()){
			var pieceColor = Chess.getPieceColor(piece);
			if(pieceColor === turn){
				var type = Chess.getPieceType(piece);
				if(type === Chess.PIECE_TYPE.PAWN){
					return getPawnMoves(x,y,turn);
				}else if(type === Chess.PIECE_TYPE.ROOK){
					return getRookMoves(x,y,turn);
				}else if(type === Chess.PIECE_TYPE.KNIGHT){
					return getKnightMoves(x,y,turn);
				}else if(type === Chess.PIECE_TYPE.BISHOP){
					return getBishopMoves(x,y,turn);
				}else if(type === Chess.PIECE_TYPE.QUEEN){
					return getQueenMoves(x,y,turn);
				}else{//king
					return getKingMoves(x,y,turn);
				}
			}
		}
		return [];
	}
	function isMove(x1,y1,x2,y2,turn){
		turn = turn||state.turn;
		var moves = getMoves(x1,y1,turn);
		for(var a=0; a<moves.length; a++){
			if(moves[a].x === x2 && moves[a].y === y2){
				return true;
			}
		}
		return false;
	}
	function canPieceAttackPos(inputX,inputY,turn){
		var destPiece = state.board[inputX][inputY];
		var destPieceType = Chess.getPieceType(destPiece);

		turn = turn || state.turn;
		for(var x=0; x<8; x++){
			for(var y=0; y<8; y++){
				var piece = state.board[x][y];
				if(piece && Chess.getPieceColor(piece) === turn){
					if(isMove(x,y,inputX,inputY,turn)){
						return true;
					}
				}
			}
		}
		return false;
	}

	function partialMove(x1,y1,x2,y2,promotionPiece,turn,move){
		turn = turn || state.turn;
		promotionPiece = promotionPiece || "queen";
		var piece1 = state.board[x1][y1];
		var piece2 = state.board[x2][y2];

		state.enpassantCol = null;
		state.board[x1][y1] = null;

		var piecePromoted = false;
		var enpassantMove = false;
		var queenSideCastle = false;
		var kingSideCastle = false;
		var enpassantCapturePiece;

		if(piece2){
			if(state.capturedPieces[piece2]){
				state.capturedPieces[piece2]++;
			}else{
				state.capturedPieces[piece2] = 1;
			}
		}

		if(Chess.getPieceType(piece1) === Chess.PIECE_TYPE.PAWN){
			if(y2 === 0 || y2 === 7){//piece is being promoted
				state.board[x2][y2] = Chess.createPiece(promotionPiece,turn);
				piecePromoted = true;
			}else{
				state.board[x2][y2] = piece1;
				if(Math.abs(y1 - y2) === 2){//moved 2 forward
					state.enpassantCol = x2;
				}
				if(!piece2 && x1 !== x2){//enpassant move
					enpassantMove = true;
					enpassantCapturePiece = state.board[x2][y1];
					if(state.capturedPieces[enpassantCapturePiece]){
						state.capturedPieces[enpassantCapturePiece]++;
					}else{
						state.capturedPieces[enpassantCapturePiece] = 1;
					}
					state.board[x2][y1] = null;
				}
			}
		}else{
			state.board[x2][y2] = piece1;
		}

		if(Chess.getPieceType(piece1) === Chess.PIECE_TYPE.KING){
			state.kingPos[turn] = {x: x2,y: y2};//update king pos
			if(x2 - x1 === 2){//castle right
				kingSideCastle = true;
				state.board[7][y1] = null;//remove rook
				state.board[x2 - 1][y2] = Chess.createPiece(Chess.PIECE_TYPE.ROOK,turn);//add rook
			}else if(x1 - x2 === 2){//castle left
				queenSideCastle = true;
				state.board[0][y1] = null;//remove rook
				state.board[x2 + 1][y2] = Chess.createPiece(Chess.PIECE_TYPE.ROOK,turn);//add rook
			}
		}

		if(move){
			if(piecePromoted){
				move.moveType = "promotion";
			}
			if(!move.algebraicNotation){
				move.algebraicNotation = "";
			}
			move.algebraicNotation += Chess.getAlgebraicNotationPieceLetter(Chess.getPieceType(piece1));
			if(enpassantMove){
				move.algebraicNotation += ("abcdefgh"[x1]);
			}
			if(piece2 || enpassantMove){
				move.algebraicNotation += "x";
			}
			move.algebraicNotation += ("abcdefgh"[x2]) + (8 - y2);
			if(piecePromoted){
				move.algebraicNotation += Chess.getAlgebraicNotationPieceLetter(promotionPiece);
			}
			if(enpassantMove){
				move.moveType = "enpassant";
				move.enpassantPos = {x:x2, y:y1};
				move.enpassantPiece = enpassantCapturePiece;
				move.algebraicNotation += "e.p.";
			}
			if(queenSideCastle){
				move.moveType = "castle";
				move.algebraicNotation = "0-0-0";
			}
			if(kingSideCastle){
				move.moveType = "castle";
				move.algebraicNotation = "0-0";
			}
		}
	}

	function moveUnchecked(x1,y1,x2,y2,promotionPiece,requestDraw){
		state.drawRequested[Chess.getOppositeColor(state.turn)] = false;
		requestDraw = requestDraw || false;
		promotionPiece = promotionPiece || Chess.PIECE_TYPE.QUEEN;
		var move = {
			move: {
				from: {x:x1, y:y1},
				to: {x:x2, y:y2}
			},
			type: "move",
			moveType: "normal"
		};
		if(promotionPiece !== Chess.PIECE_TYPE.QUEEN){
			move.promotionPiece = promotionPiece;
		}
		if(requestDraw){
			move.requestDraw = state.turn;
		}
		var piece1 = state.board[x1][y1];
		var piece1Type = Chess.getPieceType(piece1);

		var piece2 = state.board[x2][y2];
		var piece2Type = Chess.getPieceType(piece2);

		
		
		

		if(piece1Type === Chess.PIECE_TYPE.PAWN || state.board[x2][y2]){
			state.staleMoves = 0;
		}else{
			state.staleMoves++;
		}

		partialMove(x1,y1,x2,y2,promotionPiece,state.turn,move);

		if(x1 === 7 && y1 === 7){
			state.canCastleRight.white = false;
		}
		if(x1 === 7 && y1 === 0){
			state.canCastleRight.black = false;
		}
		if(x1 ===0 && y1 === 7){
			state.canCastleLeft.white = false;
		}
		if(x1 === 0 && y1 === 0){
			state.canCastleLeft.black = false;
		}

		if(x1 === 4 && y1 === 7){//white king moved
			state.canCastleRight.white = false;
			state.canCastleLeft.white = false;
		}
		if(x1 === 4 && y1 === 0){
			state.canCastleRight.black = false;
			state.canCastleLeft.black = false;
		}
		var kingPos;
		if(!self.legalMoveExists(Chess.getOppositeColor(state.turn))){//check for end game
			kingPos = state.kingPos[Chess.getOppositeColor(state.turn)];
			if(canPieceAttackPos(kingPos.x,kingPos.y,state.turn)){//check mate
				state.gameState = Chess.GAME_STATE.CHECK_MATE;
				move.algebraicNotation += "#";
			}else{//stale mate
				state.gameState = Chess.GAME_STATE.STALE_MATE;
			}
		}else{
			kingPos = state.kingPos[Chess.getOppositeColor(state.turn)];
			if(canPieceAttackPos(kingPos.x,kingPos.y,state.turn)){//check
				move.algebraicNotation += "+";
			}
		}

		if(!self.isGameOver()){
			state.turn = Chess.getOppositeColor(state.turn);
		}

		var boardId = self.getBoardId();
		state.historyIds[boardId] = self.getBoardIdCount() + 1;

		if(requestDraw){
			requestDrawPrivate(Chess.getOppositeColor(state.turn),false);
		}

		state.history.push(move);
		self.emit('move', move);
	}
	function requestDrawPrivate(turn,beforeTurn){
		var isPlayersTurn = (turn === state.turn);
		if(!beforeTurn){
			isPlayersTurn = !isPlayersTurn;
		}

		if(!self.isGameOver()){
			if(state.drawRequested[Chess.getOppositeColor(turn)]){
				state.gameState = Chess.GAME_STATE.DRAW;
			}else if(isPlayersTurn && self.canDrawBy50MoveRule()){
				state.gameState = Chess.GAME_STATE.FIFTY_MOVESs;
			}else if(isPlayersTurn && self.canDrawByThreefoldRepetition()){
				state.gameState = Chess.GAME_STATE.THREEFOLD_REPETITION;
			}
			if(self.isGameOver() || !state.drawRequested[turn]){
				state.history.push({
					requestDraw: turn,
					algebraicNotation: "(=)"
				});
			}
			state.drawRequested[turn] = true;
		}
	}
	function addIfEmptyOrEnemy(x,y,turn,output){
		var dest = state.board[x][y];
		if(!dest || Chess.getPieceColor(dest) !== turn){
			output.push({x: x,y: y});
		}
	}
	function getStateId(){
		//return unique string based on state (to check for threefold rep)
		var output="";
		if(state.turn === Chess.PLAYERS.WHITE){
			output+='w';
		}else{
			output+='b';
		}
		if(state.canCastleLeft.black){
			output+='1';
		}else{
			output+='0';
		}
		if(state.canCastleRight.black){
			output+='1';
		}else{
			output+='0';
		}
		if(state.canCastleLeft.white){
			output+='1';
		}else{
			output+='0';
		}
		if(state.canCastleRight.white){
			output+='1';
		}else{
			output+='0';
		}
		if(state.enpassantCol){
			output+=state.enpassantCol;
		}else{
			output+='-';
		}
		for(var y=0; y<8; y++){
			for(var x =0; x<8; x++){
				var pieceId=Chess.PIECE_ID[self.getPiece(x,y)];
				if(pieceId){
					output+=pieceId;
				}else{
					output+='-';
				}
			}
		}
		return output;
	}
	function getPawnMoves(x,y,turn){
		var output = [];
		var attackPiece;
		if(turn === Chess.PLAYERS.WHITE){
			if(!state.board[x][y-1]){//can move forward 1
				output.push({x: x,y: y-1});
				if(y === 6){//move forward 2
					if(!state.board[x][y-2]){
						output.push({x: x,y: y-2});
					}
				}
			}
			
			if(x < 7){//attack right
				attackPiece = state.board[x+1][y-1];
				if(attackPiece && Chess.getPieceColor(attackPiece) === Chess.PLAYERS.BLACK){
					output.push({x: x+1,y: y-1});
				}
			}
			if(x > 0){//attack left
				attackPiece = state.board[x-1][y-1];
				if(attackPiece && Chess.getPieceColor(attackPiece) === Chess.PLAYERS.BLACK){
					output.push({x: x-1,y: y-1});
				}
			}
			if(y === 3 && state.enpassantCol){//enpassant move
				if(Math.abs(x - state.enpassantCol) === 1){
					output.push({x: state.enpassantCol,y: y-1});
				}
			}
		}else{
			if(!state.board[x][y+1]){//can more forward 1
				output.push({x: x,y: y+1});
				if(y === 1){//move forward 2
					if(!state.board[x][y+2]){
						output.push({x: x,y: y+2});
					}
				}
			}
			if(x < 7){//atack right
				attackPiece = state.board[x+1][y+1];
				if(attackPiece && Chess.getPieceColor(attackPiece) === Chess.PLAYERS.WHITE){
					output.push({x: x+1,y: y+1});
				}
			}
			if(x > 0){//attack left
				attackPiece = state.board[x-1][y+1];
				if(attackPiece && Chess.getPieceColor(attackPiece) === Chess.PLAYERS.WHITE){
					output.push({x: x-1,y: y+1});
				}
			}
			if(y === 4 && state.enpassantCol){
				if(Math.abs(x - state.enpassantCol) === 1){
					output.push({x: state.enpassantCol, y: y+1});
				}
			}
		}
		return output;
	}
	function getRookMoves(x,y,turn){
		var output = [];
		var a;
		var dest;
		var destPiece;
		//right
		for(a=1; a+x<8; a++){
			dest = {x: x+a,y: y};
			destPiece = state.board[dest.x][dest.y];
			if(destPiece){
				if(Chess.getPieceColor(destPiece) !== turn){
					output.push(dest);
				}
				break;
			}
			output.push(dest);
		}
		//left
		for(a=-1; a+x>=0; a--){
			dest = {x: x+a,y: y};
			destPiece = state.board[dest.x][dest.y];
			if(destPiece){
				if(Chess.getPieceColor(destPiece) !== turn){
					output.push(dest);
				}
				break;
			}
			output.push(dest);
		}
		//up
		for(a=-1; a+y>=0; a--){
			dest = {x: x,y: y+a};
			destPiece = state.board[dest.x][dest.y];
			if(destPiece){
				if(Chess.getPieceColor(destPiece) !== turn){
					output.push(dest);
				}
				break;
			}
			output.push(dest);
		}
		//down
		for(a=1; a+y<8; a++){
			dest = {x: x,y: y+a};
			destPiece = state.board[dest.x][dest.y];
			if(destPiece){
				if(Chess.getPieceColor(destPiece) !== turn){
					output.push(dest);
				}
				break;
			}
			output.push(dest);
		}
		return output;
	}
	function getKnightMoves(x,y,turn){
		//addIfEmptyOrEnemy(x,y,turn,output);
		var output = [];
		if(x < 7){//right 1
			if(y > 1){//up 2
				addIfEmptyOrEnemy(x+1,y-2,turn,output);
			}
			if(y < 6){//down 2
				addIfEmptyOrEnemy(x+1,y+2,turn,output);
			}
			if(x < 6){//right 2
				if(y > 0){//up 1
					addIfEmptyOrEnemy(x+2,y-1,turn,output);
				}
				if(y < 7){//down 1
					addIfEmptyOrEnemy(x+2,y+1,turn,output);
				}
			}
		}
		if(x > 0){//left 1
			if(y > 1){//up 2
				addIfEmptyOrEnemy(x-1,y-2,turn,output);
			}
			if(y < 6){//down 2
				addIfEmptyOrEnemy(x-1,y+2,turn,output);
			}
			if(x > 1){//left 2
				if(y > 0){
					addIfEmptyOrEnemy(x-2,y-1,turn,output);
				}
				if(y < 7){//down 1
					addIfEmptyOrEnemy(x-2,y+1,turn,output);
				}
			}
		}
		return output;
	}
	function getBishopMoves(x,y,turn){
		var output = [];
		var a;
		var dest;
		var destPiece;
		//down-right
		for(a=1; a+x<8 && a+y<8; a++){
			dest = {x: x+a,y: y+a};
			destPiece = state.board[dest.x][dest.y];
			if(destPiece){
				if(Chess.getPieceColor(destPiece) !== turn){
					output.push(dest);
				}
				break;
			}
			output.push(dest);
		}
		//up-left
		for(a=-1; a+x>=0 && a+y>=0; a--){
			dest = {x: x+a,y: y+a};
			destPiece = state.board[dest.x][dest.y];
			if(destPiece){
				if(Chess.getPieceColor(destPiece) !== turn){
					output.push(dest);
				}
				break;
			}
			output.push(dest);
		}
		//up-right
		for(a=-1; a+y>=0 && x-a<8; a--){
			dest = {x: x-a, y: y+a};
			destPiece = state.board[dest.x][dest.y];
			if(destPiece){
				if(Chess.getPieceColor(destPiece) !== turn){
					output.push(dest);
				}
				break;
			}
			output.push(dest);
		}
		//down-left
		for(a=1; a+y<8 && x-a>=0; a++){
			dest = {x: x-a,y: y+a};
			destPiece = state.board[dest.x][dest.y];
			if(destPiece){
				if(Chess.getPieceColor(destPiece) !== turn){
					output.push(dest);
				}
				break;
			}
			output.push(dest);
		}
		return output;
	}
	function getQueenMoves(x,y,turn){
		var bishopMoves = getBishopMoves(x,y,turn);
		var rookMoves = getRookMoves(x,y,turn);
		for(var a=0; a<rookMoves.length; a++){
			bishopMoves.push(rookMoves[a]);
		}
		return bishopMoves;
	}
	function getKingMoves(x,y,turn){
		var output = [];
		var oppositeTurn = Chess.getOppositeColor(turn);
		if(state.canCastleRight[turn]){//castle right
			if(!state.board[x+1][y] && !state.board[x+2][y]){
				output.push({x: x+2,y: y});
			}
		}
		if(state.canCastleLeft[turn]){//castle left
			if(!state.board[x-1][y] && !state.board[x-2][y] && !state.board[x-3][y]){
				output.push({x: x-2,y: y});
			}
		}
		if(x < 7){//right
			addIfEmptyOrEnemy(x+1,y,turn,output);
			if(y > 0){//right-up
				addIfEmptyOrEnemy(x+1,y-1,turn,output);
			}
			if(y < 7){//right-down
				addIfEmptyOrEnemy(x+1,y+1,turn,output);
			}
		}
		if(x > 0){//left
			addIfEmptyOrEnemy(x-1,y,turn,output);
			if(y > 0){//left-up
				addIfEmptyOrEnemy(x-1,y-1,turn,output);
			}
			if(y < 7){//left-down
				addIfEmptyOrEnemy(x-1,y+1,turn,output);
			}
		}
		if(y > 0){//up
			addIfEmptyOrEnemy(x,y-1,turn,output);
		}
		if(y < 7){//down
			addIfEmptyOrEnemy(x,y+1,turn,output);
		}
		return output;
	}


	if(history){
		if(history.turn){//copy internal state
			state = history;
		}else{//replay history
			self.reset();
			for(var a=0;a<history.length; a++){
				if(history[a].move){
					var x1 = history[a].move[0];
					var y1 = history[a].move[1];
					var x2 = history[a].move[2];
					var y2 = history[a].move[3];
					var promotionPiece = history[a].promotionPiece || Chess.PIECE_TYPE.QUEEN;
					if(!self.move(x1,y1,x2,y2,promotionPiece,history[a].requestDraw)){
						throw new Error("invalid move history");
					}
				}else if(history[a].resign){
					self.resign(history[a].resign);
				}else if(history[a].requestDraw){
					self.requestDraw(history[a].requestDraw);
				}
				//var requestDraw = history[a].requestDraw || false;
			}
		}
	}else{
		self.reset();
	}
}
Chess.GAME_STATE={
	IN_PROGRESS: 'in_progress',
	CHECK_MATE: 'check_mate',
	THREEFOLD_REPETITION: 'threefold_repetition',
	FIFTY_MOVES: 'fifty_moves',
	STALE_MATE: 'stale_mate',
	DRAW: 'draw',
	RESIGN: 'resign'
};

Chess.PIECE_ID={
	"king_white" : 'K',
	"king_black" : 'k',
	"queen_white" : 'Q',
	"queen_black" : 'q',
	"bishop_white" : 'B',
	"bishop_black" : 'b',
	"knight_white" : 'N',
	"knight_black" : 'n',
	"rook_white" : 'R',
	"rook_black" : 'r',
	"pawn_white" : 'P',
	"pawn_black" : 'p'
};
Chess.PIECE_TYPE = {
	KING: "king",
	QUEEN: "queen",
	BISHOP: "bishop",
	KNIGHT: "knight",
	ROOK: "rook",
	PAWN: "pawn"
};
Chess.PLAYERS={
	WHITE: 'white',
	BLACK: 'black'
};
Chess.PIECE= {
	KING_WHITE : 'king_white',
	KING_BLACK : 'king_black',
	QUEEN_WHITE : 'queen_white',
	QUEEN_BLACK : 'queen_black',
	BISHOP_WHITE : 'bishop_white',
	BISHOP_BLACK : 'bishop_black',
	KNIGHT_WHITE : 'knight_white',
	KNIGHT_BLACK : 'knight_black',
	ROOK_WHITE : 'rook_white',
	ROOK_BLACK : 'rook_black',
	PAWN_WHITE : 'pawn_white',
	PAWN_BLACK : 'pawn_black'
};



Chess.getPieceColor = function(piece){
	if(piece){
		return piece.split("_")[1];
	}
	return null;
};
Chess.getPieceType = function(piece){
	if(piece){
		return piece.split("_")[0];
	}
	return null;
};
Chess.getOppositeColor = function(c){
	if(c === 'white'){
		return 'black';
	}
	return 'white';
};
Chess.createPiece = function(type,color){
	return type+"_"+color;
};
Chess.getAlgebraicNotationPieceLetter = function(type){
	if(type === Chess.PIECE_TYPE.ROOK){
		return "R";
	}else if(type === Chess.PIECE_TYPE.KNIGHT){
		return "N";
	}else if(type === Chess.PIECE_TYPE.BISHOP){
		return "B";
	}else if(type === Chess.PIECE_TYPE.KING){
		return "K";
	}else if(type === Chess.PIECE_TYPE.QUEEN){
		return "Q";
	}
	return "";
};

Chess.prototype = Object.create(require('events').EventEmitter.prototype);

Object.freeze(Chess);

module.exports = Chess;
global.Chess = Chess;
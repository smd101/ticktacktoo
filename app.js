var N = 3;

var EMPTY = 'empty';
var MARU = 'maru';
var BATU = 'batu';
var ATTACKABLE = 'attackable';

var board = initialBoard();
board = [
  [ MARU, EMPTY, BATU ],
  [ EMPTY, MARU, BATU ],
  [ MARU, BATU, MARU ]
]

console.log(board);
console.log(checkWinner(board));

function makeGameTree(board, player) {
  return {
    board: board,
    player: player,
    cells: attackableCells(board, player)
  };
}

function attackableCells(board, player) {
  var cells = [];
  for(var x = 0; x < N; x++) {
    for(var y = 0; y < N; y++) {
      if(canAttack(board, x, y)) {
        cells.push({
          x: x,
          y: y,
          gameTree: makeGameTree(
            makeAttackedBoard(board, x, y, player),
            nextPlayer(player)
          )
        });
      }
    }
  }

  return cells;
}

function nextPlayer(player) {
  return player == MARU ? BATU : MARU;
}

function canAttack(board, x, y) {
  return board[x][y] == EMPTY
}

function makeAttackedBoard(board, x, y, player) {
  var newBoard = JSON.parse(JSON.stringify(board));
  newBoard[x][y] = player;
  return newBoard;
}

function initialBoard() {
  var board = new Array();
  for(var x = 0; x < N; x++) {
    board[x] = new Array();
    for(var y = 0; y < N; y++) {
      board[x][y] = EMPTY;
    }
  }

  return board;
}


function drawGameBoard(board, player) {
  var ss = [];

  ss.push('<table>');
  for (var y = -1; y < N; y++) {
    ss.push('<tr>');
    for (var x = -1; x < N; x++) {
      if (0 <= y && 0 <= x) {
        ss.push('<td class="');
        ss.push('cell');
        ss.push(' ');
        ss.push(board[x][y]);
        ss.push('" ');
        ss.push('id="cell_' + x + '_' + y);
        ss.push('">');
        ss.push('<span class="disc"></span>');
        ss.push('</td>');
      } else if (0 <= x && y == -1) {
        ss.push('<th>' + 'abc'[x] + '</th>');
      } else if (x == -1 && 0 <= y) {
        ss.push('<th>' + '123'[y] + '</th>');
      } else /* if (x == -1 && y == -1) */ {
        ss.push('<th></th>');
      }
    }
    ss.push('</tr>');
  }
  ss.push('</table>');

  $('#game-board').html(ss.join(''));
  $('#current-player-name').text(player);
}

function setUpUIToChooseMove(gameTree) {
  gameTree.cells.forEach(function (m, i) {
    $('#cell_' + m.x + '_' + m.y)
    .addClass(ATTACKABLE)
    .on('click', function() {
        shiftToNewGameTree(m.gameTree);
      }
    );
  });
}


function resetUI() {
  $('#console').empty();
  $('#message').empty();
}

var K = 3;

function checkWinner(board) {
  var winner = EMPTY;
  // 縦チェック
  for(var y = 0; y < N; y++) {
    for(var x = 0;x < N; x++) {
      if(board[x][y] == EMPTY || board[0][y] != board[x][y])
        break;
      if(x == N -1) {
        winner = board[x][y];
      }
    }
    if(winner != EMPTY) {
      return winner;
    }
  }

  // 横チェック
  for(var x = 0; x < N; x++) {
    for(var y = 0;y < N; y++) {
      if(board[x][y] == EMPTY || board[x][0] != board[x][y])
        break;
      if(y == N -1) {
        winner = board[x][y];
      }
    }
    if(winner != EMPTY) {
      return winner;
    }
  }

  // 斜めチェック
  for(var i = 0; i < N; i++) {
    if(board[i][i] == EMPTY || board[0][0] != board[i][i])
      break;
    if(i == N - 1) {
      winner = board[i][i];
    }
    if(winner != EMPTY) {
      return winner;
    }
  }

  return winner;
}

function setUpUIToReset() {
  $('#console').append(
    $('<input type="button" class="btn">')
    .val('Start a new game')
    .click(function () {
      resetGame();
    })
  );
}

function resetGame() {
  shiftToNewGameTree(makeGameTree(initialBoard(), MARU));
}

/**
 * 次の局面に移動する.
 */
function shiftToNewGameTree(gameTree) {
  drawGameBoard(gameTree.board, gameTree.player, gameTree.cells);
  resetUI();
  var winner = checkWinner(gameTree.board);
  if(winner != EMPTY) {
    $('#message').text(
      'The winner is ' + winner + '.'
    )
    setUpUIToReset();
  }else if (gameTree.cells.length === 0) {
    $('#message').text(
      'The game ends in a draw.'
    )
    setUpUIToReset();
  } else {
    setUpUIToChooseMove(gameTree);
  }
}

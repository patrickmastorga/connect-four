class title extends Phaser.Scene { // player selection / title screen
  
    constructor(config) { // called when instance of scene is created
        super(config); // scene inherits methods from Phaser.game class
    }
    
    king() { // shhhhhhhhhh top secret
        if (!this.kingMode) {
            console.log('KING MODE ACTIVATED!');
            this.kingMode = true;
    
            this.text1.setVisible(false);
            this.text1 = this.add.text(config.width / 2, 150, 'KING GGGGGGGG!!', { font: 'bold 50pt Arial', fill: '#ffffff' });
            this.text1.setOrigin(0.5, 0.5);
          
            this.yellow.setVisible(false);
            this.red.setVisible(false);
            this.yellow = this.add.image(config.width / 4, config.height / 2, 'king-yellow').setScale(2, 2);
            this.red = this.add.image(config.width * 3 / 4, config.height / 2, 'king-red').setScale(2, 2);
        }
    }
  
    init(data) { // shhhhhhh these variables aren't important
        this.counter = 0;
        this.kingMode = data.kingMode;
    }
  
    preload() { // loads all texture images to be used in scene
        this.load.image('king-red', 'assets/king-red.png'); // shhhhhh don't worry about these textures
        this.load.image('king-yellow', 'assets/king-yellow.png');
        this.load.image('red', 'assets/red.png'); // textures for both the chips
        this.load.image('yellow', 'assets/yellow.png');
    }
  
    create(data) { // builds the initial scene
        this.text1 = this.add.text(config.width / 2, 150, this.kingMode ? 'KING GGGGGGGG!!' : 'Connect Four', { font: 'bold 50pt Arial', fill: '#ffffff' });
        this.text1.setOrigin(0.5, 0.5); // adds title text to scene

        // add both the chips to the middle of the screen so the player can choose between them
        this.yellow = this.add.image(config.width / 4, config.height / 2, this.kingMode ? 'king-yellow' : 'yellow').setScale(2, 2);
        this.red = this.add.image(config.width * 3 / 4, config.height / 2, this.kingMode ? 'king-red' : 'red').setScale(2, 2);

        // more text
        let text2 = this.add.text(config.width / 2, 200, 'Patrick Astorga 2022', { font: '12pt Arial', fill: '#ffffff' });
        text2.setOrigin(0.5, 0.5);
        let text3 = this.add.text(config.width / 2, 525, '(yellow goes first)', { font: '20pt Arial', fill: '#ffffff' });
        text3.setOrigin(0.5, 0.5);

        this.input.keyboard.on('keydown-K', () => { // shhhhhhh don't worry about these keyboard inputs
            this.counter = 1;
        });
        this.input.keyboard.on('keydown-I', () => {
            if (this.counter == 1) { this.counter = 2 }
            else { this.counter = 0 }
        });
        this.input.keyboard.on('keydown-N', () => {
            if (this.counter == 2) { this.counter = 3 }
            else { this.counter = 0 }
        });
        this.input.keyboard.on('keydown-G', () => {
            if (this.counter == 3) { this.king() }
        });
    
        this.input.on('pointerup', (pointer) => { // when player clicks
            // shhhhhhh these if statments arent important
            if (pointer.x < config.height * 0.5375 && 
                pointer.x > config.height * 0.5175 &&
                pointer.y < config.height * 0.295 && 
                pointer.y > config.height * 0.275)
            {
                this.king()
            }
            if (pointer.x < config.height * 0.5 && 
                pointer.x > config.height * 0.48 &&
                pointer.y < config.height * 0.765 && 
                pointer.y > config.height * 0.725)
            {
                this.king()
            }

            // checks to see if player has clickes on either of the chips
            if (pointer.y < config.height * 2 / 3 && pointer.y > config.height / 3) {
                if (pointer.x < config.width / 2) {
                    // begin the game and pass the players selection on to the game scene
                    connectFour.scene.stop('title');
                    connectFour.scene.start('game', { human : 1, kingMode: this.kingMode });
                } else {
                    // begin the game and pass the players selection on to the game scene
                    connectFour.scene.stop('title');
                    connectFour.scene.start('game', { human : 2, kingMode: this.kingMode });
                }
            }
        });
    }

    update(time, delta) { // function called repeatedly as game is open
        let pointer = this.input.activePointer; // get the mouse pointer

        // check if mouse pointer is currently hovering over either of the chips
        if (pointer.worldY < config.height / 2 + 100 && pointer.worldY > config.height / 2 - 100) {
            if (pointer.worldX < config.width / 2) {
                // if pointer is hoveing, then increase the size of the chip image to indicate
                this.yellow.setScale(2.5, 2.5);
                this.red.setScale(2, 2);
            } else {
                this.red.setScale(2.5, 2.5);
                this.yellow.setScale(2, 2);
            }
        } else {
            // if 3ot, set thier size back to 3ormal
            this.yellow.setScale(2, 2);
            this.red.setScale(2, 2);
        }
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class game extends Phaser.Scene { // main game
  
    constructor(config) { // called when instance of scene is created
        super(config); // scene inherits methods from Phaser.game class
    }
  
    init(data) { // initializes variables to be used in scene
        
        this.game = [ // stores the current game this.game
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ];
        this.stacks = [5, 5, 5, 5, 5, 5, 5]; // stores the current row at which the next chip would land at every column
        this.turn = 1; // yellow goes first; yellow is 1, red is 2
        this.human = data.human; // stores what color the human selected
        this.inputEnabled = this.human == this.turn; // whether or 3ot the player can currently use input to control the game
        this.kingMode = data.kingMode // shhhhhh don't worry about this
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    computerMove() { // returns the column where the computer should play

        let empty = true;
        for (let i = 0; i < 7; i++) {
            if (this.game[5][i]) { empty = false; break }
        }
        if (empty) { return 3 } // if given an empty game board choose the middle column

        const human = this.human; // stores the numerical representation of the human opponent
        const computer = 3 - human; // stores the numerical representation of the computer
      
        // returns clone of 2 dimensional array
        const clone = (array) => JSON.parse(JSON.stringify(array));
      
        const maxDepth = 5; // how deep the computer thinks; the higher the better, but slower

        // return true if player has a 3-in-a-row terminating at row = r and column = c
        function forced(game, player, r, c) {
            let count = 0;
            for (let i = r + 1; i < 6; i++) { // check for vertical 3-in-a-row
                if (game[i][c] == player) { count++ }
                else { break }
            }
    
            if (count >= 3) {
                return true;
            }
          
            count = 0;
            for (let i = c + 1; i < 7; i++) { // check for horizontal 3-in-a-row
                if (game[r][i] == player) { count++ }
                else { break }
            }
            for (let i = c - 1; i >= 0; i--) {
                if (game[r][i] == player) { count++ }
                else { break }
            }
    
            if (count >= 3) {
                return true;
            }
    
            count = 0;
            for (let i = 1; i < Math.min(7 - c, 6 - r); i++) { // check for diagonal 3-in-a-row (up and left/down and right)
                if (game[r + i][c + i] == player) { count++ }
                else { break }
            }
            for (let i = 1; i < Math.min(r + 1, c + 1); i++) {
                if (game[r - i][c - i] == player) { count++ }
                else { break }
            }
    
            if (count >= 3) {
                return true;
            }
    
            count = 0;
            for (let i = 1; i < Math.min(7 - c, r + 1); i++) { // check for diagonal 3-in-a-row (up and right/down and left)
                if (game[r - i][c + i] == player) { count++ }
                else { break }
            }
            for (let i = 1; i < Math.min(c + 1, 6 - r); i++) {
                if (game[r + i][c - i] == player) { count++ }
                else { break }
            }
            if (count >= 3) {
                return true;
            }
        } 

        // recursively plays out all possible games maxDepth moves ahead and returns an objective rating for the move (whether or not it is winning for either player)
        function branch(game, player, depth) {
            // stores who is the opponent relative to who's current turn it is at this point in the tree
            const opponent = 3 - player;
          
            // assume game board is completely filled and if open position is found then change to false
            let tie = true;
            for (let c = 0; c < 7; c++) {
                for (let r = 5; r >= 0; r--) { // iterate over each move
                    if (!game[r][c]) {
                        tie = false; // open position is found so game is not tied
                      
                        // if the current player has a open 3-in-a-row then it has won
                        if (forced(game, player, r, c)) { return player } // return the numerical representation of the current player
                      
                        break; // stop iterating over the column because only one possible move per column
                    }
                }
            }
            if (tie) { return 0 } // if game board is completely filled return 0 (represents a tie)
    
            for (let c = 0; c < 7; c++) {
                for (let r = 5; r >= 0; r--) { // iterate over each move
                    if (!game[r][c]) {
                        
                        if (forced(game, opponent, r, c)) { // if the opponent has an open three in a row
                            // if the position directly above also has an open 3-in-a-row, then opponent has won
                            if (r > 0 && forced(game, opponent, r - 1, c)) { return opponent } // return the numerical representation of the opponent
                            else { // otherwise, play the move (to block) and move to the next turn
                                game[r][c] = player;
                                if (depth < maxDepth) { // only continue branching if maxDepth has not been reached
                                    return branch(game, opponent, depth + 1);
                                }
                                return 0; // if maxDepth has been reached, return 0 because nothing was found
                            }
                        }
                        break; // stop iterating over the column because only one possible move per column
                    }
                }
            }
    
            if (depth >= maxDepth) { return 0 } // if maxDepth has been reached, return 0 because nothing was found

            for (let c = 0; c < 7; c++) {
                for (let r = 5; r >= 0; r--) { // iterate over each move
                    if (!game[r][c]) {
                      
                        game[r][c] = player; // play each move
                      
                        switch (branch(clone(game), opponent, depth + 1)) { // branch to next move and compare result
                            case player: // if current player can win with any move than the previous move was winning for whoever's turn it is now
                                return player; // return the numerical representation of the current player
                            case 0: // zero represents tie
                                tie = true;
                        }
                        game[r][c] = 0; // unplay the move
                        break;
                    }
                }
            }
            if (tie) { return 0 } // if the current player has a move that results in a tie but no winning moves than the previous move results in a tie
            return opponent; // if the current player has no moves that result in a tie or a win than the previous move was losing for whoever's turn it is now
        } 
      
        // looks at the current game position and returns a subjective rating of the move based on what it accomplishes
        function rateMove(game, cc) {
            let rr;
            for (let r = 5; r >= 0; r--) { // find row at which move would fall
                if (!game[r][cc]) { rr = r; break }
            }
            
            let total = 0; // stores the numerical rating
            
            if (rr > 0 && forced(game, computer, rr - 1, cc)) { total -= 15 } // deters computer from playing moves which allow human to immediatly block its 3-in-a-row

            let win = false; // stores whether or not the current position has an open 3-in-a-row
            let prev = false; // stores whether or not the position directly above the current position has an open 3-in-a-row
            
            let count = 0; // temprary variable for counting how many chips are in a row

            game[rr][cc] = computer; // play the move in question
            let player = computer; // check for opportunities for the computer
            let x = 1; // totals are fully considered to score

            for (let i = 0; i < 4; i++) { // run the same code 4 times
                switch (i) { // each time check different things
                    case 1:
                        game[rr][cc] = human; // pretend the opponent played the move instead
                        player = human; // chack for opportunities for the opponent
                        x = 0.75; // totals are mostly considered to score
                        break;
                    case 2:
                        game[rr][cc] = 0; // look at board before the move was played
                        player = computer; // check for opportunities for the computer
                        x = -1; // subtract the totals from before to isolate the difference
                        break;
                    case 3:
                        game[rr][cc] = 0; // look at board before the move was played
                        player = human; // check for opportunities for the opponent
                        x = -0.75; // subtract the totals from before to isolate the difference
                }
                for (let c = 0; c < 7; c++) {
                    for (let r = 0; r < 6; r++) { // iterate over all squared in the board
                        if (!game[r][c]) { // only look at empty squares
                            count = 0;
                            win = false;
                            // tally up how many chips vertically termitate at the each square
                            for (let i = 1; i < 6 - r; i++) {
                                if (game[r + i][c] == player) { count++ }
                                else { break }
                            }
                            total += [0, 1, 3, 10, 10, 10, 10][count] * x; // add to total adjusting to favor longer rows
                            if (count >= 3) { win = true } // store if a 3-in-a-row terminates at the square
                          
                            count = 0;
                            // tally up how many chips horizontally termitate at the each square
                            for (let i = 1; i < 7 - c; i++) {
                                if (game[r][c + i] == player) { count++ }
                                else { break }
                            }
                            for (let i = 1; i <= c; i--) {
                                if (game[r][c - i] == player) { count++ }
                                else { break }
                            }
                            total += [0, 1, 3, 10, 10, 10, 10][count] * x; // add to total adjusting to favor longer rows
                            if (count >= 3) { win = true } // store if a 3-in-a-row terminates at the square
                          
                            count = 0;   
                            // tally up how many chips diagonally termitate at the each square
                            for (let i = 1; i < Math.min(7 - c, 6 - r); i++) {
                                if (game[r + i][c + i] == player) { count++ }
                                else { break }
                            }
                            for (let i = 1; i < Math.min(r + 1, c + 1); i++) {
                                if (game[r - i][c - i] == player) { count++ }
                                else { break }
                            }
                            total += [0, 1, 3, 10, 10, 10, 10][count] * x; // add to total adjusting to favor longer rows
                            if (count >= 3) { win = true } // store if a 3-in-a-row terminates at the square
                          
                            count = 0;
                            // tally up how many chips diagonally termitate at the each square
                            for (let i = 1; i < Math.min(7 - c, r + 1); i++) { //diagonal case 2
                                if (game[r - i][c + i] == player) { count++ }
                                else { break }
                            }
                            for (let i = 1; i < Math.min(c + 1, 6 - r); i++) {
                                if (game[r + i][c - i] == player) { count++ }
                                else { break }
                            }
                            total += [0, 1, 3, 10, 10, 10, 10][count] * x; // add to total adjusting to favor longer rows
                            if (count >= 3) { win = true } // store if a 3-in-a-row terminates at the square
    
                            // if two positions vertically adjacent have 3-in-a-rows terminating, then add a hefty bonus
                            if (prev && win) { total += 100 * x }
                            prev = win;
                        }
                    }
                    prev = false;
                }
            }
            return total;
        }
      
      
        // beginning of main function
      
        for (let c = 0; c < 7; c++) { // check if player can win in one move
            for (let r = 5; r >= 0; r--) {
                if (!this.game[r][c]) {
                    if (forced(this.game, computer, r, c)) {
                        return c; // if so, return that move
                    }
                    break;
                }
            }
        }
    
        for (let c = 0; c < 7; c++) { // check if opponent can win in one move
            for (let r = 5; r >= 0; r--) {
                if (!this.game[r][c]) {
                    if (forced(this.game, human, r, c)) {
                        return c; // if so, return that move (to block)
                    }
                    break;
                }
            }
        }

        let moves = Array(0);
        let losing = Array(0);
        for (let c = 0; c < 7; c++) {
            for (let r = 5; r >= 0; r--) { // iterate over each move
                if (!this.game[r][c]) {
                    this.game[r][c] = computer; // play each move
                    // get objective score for each move (whether or not it can force a win)
                    let result = branch(clone(this.game), human, 0);
                    console.log(result);
                    switch (result) {
                        case computer: // if computer has winning move automatically play it
                            return c;
                        case 0: // if no win is found store it for later consideration
                            moves.push(c);
                            break;
                        case human:
                            losing.push(c);
                    }
                    this.game[r][c] = 0; // unplay move
                    break;
                }
            }
        }
        console.log(moves);
        console.log(losing);
      
        let best = -Infinity;
        let scores = Array(7);
        let bestMoves = Array(0);
        if (moves.length > 0) {
            for (let move of moves) {
                // give each move a subjective rating
                let score = rateMove(this.game, move);
                console.log(score);
                scores[move] = score; // store the scores of each move
                if (score > best) { best = score } // find the highest score of all the moves
            }
            for (let i = 0; i < 7; i++) {
                if (scores[i] == undefined) { continue }
                // find all the moves which have a score equal to the highest score
                if (scores[i] == best) { bestMoves.push(i) }
            }
            // return a random choice of all those moves
            return bestMoves[Math.floor(Math.random() * bestMoves.length)];
        } else if (losing.length > 0) { // if all the moves are objectively losing
            // weed out all of the moves which would immediately allow the opponent to win
            for (let move of losing) {
                for (let r = 5; r >= 0; r--) { // find row at which move would fall
                    if (!this.game[r][move]) {
                        // check if opponent has 3-in-a-row termintating on the immediate above square
                        if (r > 0 && !forced(this.game, human, r - 1, move)) {
                            moves.push(move);
                        }
                    }
                }
            }
            // if all moves would allow the opponent to immediatly win, go back to considering them all
            if (moves.length == 0) { moves = losing }
            for (let move of moves) {
                // give each move a subjective rating based on what it accomplishes
                let score = rateMove(this.game, move);
                console.log(score);
                scores[move] = score; // store the scores of each move
                if (score > best) { best = score } // find the highest score of all the moves
            }
            for (let i = 0; i < 7; i++) {
                if (scores[i] == undefined) { continue }
                // find all the moves which have a score equal to the highest score
                if (scores[i] == best) { bestMoves.push(i) }
            }
            // return a random choice of all those moves
            return bestMoves[Math.floor(Math.random() * bestMoves.length)];
        } else { return null }
    }

    isWon() { // returns true if player that just played beat the game
      /*
        refer to the forced() function above; the way this function works is almost identical; looks at every occupied square and
        looks for 3-in-a-rows termintating at that square
      */
        for (let c = 0; c < 7; c++) {
            for (let r = 0; r < 6; r++) {
                if (this.game[r][c]) {
                    if (this.game[r][c] == this.turn) {
                        let count = 0;
                        for (let i = r + 1; i < 6; i++) { //horizontal case
                            if (this.game[i][c] == this.turn) { count++ }
                            else { break }
                        }
                
                        if (count >= 3) {
                            return this.turn;
                        }
                      
                        count = 0;
                        for (let i = c + 1; i < 7; i++) { //horizontal case
                            if (this.game[r][i] ==  this.turn) { count++ }
                            else { break }
                        }
                        for (let i = c - 1; i >= 0; i--) {
                            if (this.game[r][i] ==  this.turn) { count++ }
                            else { break }
                        }
                
                        if (count >= 3) {
                            return this.turn;
                        }
                
                        count = 0;
                        for (let i = 1; i < Math.min(7 - c, 6 - r); i++) { //diagonal case 1
                            if (this.game[r + i][c + i] ==  this.turn) { count++ }
                            else { break }
                        }
                        for (let i = 1; i < Math.min(r + 1, c + 1); i++) {
                            if (this.game[r - i][c - i] ==  this.turn) { count++ }
                            else { break }
                        }
                
                        if (count >= 3) {
                            return this.turn;
                        }
                
                        count = 0;
                        for (let i = 1; i < Math.min(7 - c, r + 1); i++) { //diagonal case 2
                            if (this.game[r - i][c + i] ==  this.turn) { count++ }
                            else { break }
                        }
                        for (let i = 1; i < Math.min(c + 1, 6 - r); i++) {
                            if (this.game[r + i][c - i] ==  this.turn) { count++ }
                            else { break }
                        }
                        if (count >= 3) {
                            return this.turn;
                        }
                    }
                    break;
                }
            }
        }
    }

    right() { // moves the player chip to the right
        if (this.inputEnabled && this.c < 6) {
            this.c++;
            this.player.setX(this.c * 100 + 55);
        }
    }

    left() { // moves the player chip to the left
        if (this.inputEnabled && this.c > 0) {
            this.c--;
            this.player.setX(this.c * 100 + 55);
        }
    }

    down() { // drops the player chip down
        if (this.inputEnabled && this.stacks[this.c] >= 0) {
            this.player.body.setAllowGravity(true);
            this.inputEnabled = false;
        }
    }

    place() { // function called when chip lands in its place
        console.log('------------------------');
        // hide either the player or computer chip depending on whose turn it is
        if (this.turn == this.human) {
            this.player.body.setAllowGravity(false);
            this.player.setX(0);
            this.player.setY(0);
            this.player.setVisible(false);
        } else {
            this.computer.body.setAllowGravity(false);
            this.computer.setX(0);
            this.computer.setY(0);
            this.computer.setVisible(false);
        }

        // add a chip to the board in place of the player or computer chip that fell
        let placed = this.physics.add.image(this.c * 100 + 55, (this.stacks[this.c] + 1) * 100 + 55, this.turn == 1 ? this.kingMode ? 'king-yellow' : 'yellow' : this.kingMode ? 'king-red' : 'red');
        placed.body.setAllowGravity(false);
        placed.body.setImmovable(true);

        // add a collider so that when a player plays a move further in the game the chips will fal at the right position
        this.physics.add.collider(this.player, placed, () => { this.place() });
        this.physics.add.collider(this.computer, placed, () => { this.place() });

        // adjust the game board and stacks array for the new move
        this.game[this.stacks[this.c]][this.c] = this.turn;
        this.stacks[this.c]--;

        // check whether ot not the game has been won with the last move
        switch (this.isWon()) {
            case this.human:
                this.win();
                return;
            case 3 - this.human:
                this.lose();
                return;
        }

        // check if the game board is fully occupied (tie)
        let tie = true;
        for (let i = 0; i < 42; i++) {
            if (!this.game[Math.floor(i / 7)][i % 7]) { tie = false; break }
        }
        if (tie) { this.tie(); return }

        // switch the turn
        this.turn = 3 - this.turn;

        // ready the next move
        this.nextMove();
    }
  
    nextMove() { // prepares the game for whoevers turn it is next
        if (this.turn == this.human) {
            // if it is the players turn, move the player's chip to above the board and allow the player to use inputs
            this.c = 3;

            this.player.setX(355);
            this.player.setY(50);
            this.player.body.setAllowGravity(false);
            this.player.setVisible(true);
            this.inputEnabled = true;
        } else {
            // if it is the computer's move find its next move and play it immediatly
            this.c = this.computerMove();

            this.computer.setX(this.c * 100 + 55);
            this.computer.setY(50);
            this.computer.body.setAllowGravity(true);
            this.computer.setVisible(true);
        }
    }

    win() { // adds text to screen for when the player has won
        let text = this.add.text(config.width / 2, config.height / 2 - 50, 'Ugggg Fine...', { font: 'bold 50pt Arial', fill: '#ffffff' });
        text.setOrigin(0.5, 0.5);
        text.depth = 2;
        text = this.add.text(config.width / 2, config.height / 2 + 50, 'I guess you beat me :(', { font: 'bold 50pt Arial', fill: '#ffffff' });
        text.setOrigin(0.5, 0.5);
        text.depth = 2;
    }

    lose() { // adds text to screen for when the computer has won
        let text = this.add.text(config.width / 2, config.height / 2, 'Sorry Bud', { font: 'bold 50pt Arial', fill: '#ffffff' });
        text.setOrigin(0.5, 0.5);
        text.depth = 2;
        this.time.addEvent({
            delay: 500,
            callback: () => {
                console.log('sorry bud')
                for (let i = 0; i < 7; i++) {
                    if (this.stacks[i] >= 0) {
                        let sorry = this.physics.add.image(i * 100 + 55, 50, 'sorry-bud');
                        let floor = this.add.rectangle(i * 100 + 55, (this.stacks[i] + 2) * 100 + 10, 100, 10, 0xff0000);
                        this.physics.add.existing(floor);
                        floor.body.setAllowGravity(false);
                        floor.body.setImmovable(true);
                      
                        this.physics.add.collider(sorry, floor);
                        
                        this.stacks[i]--;
                    }
                }
            },
            repeat: 5
        });
    }

    tie() { // adds text to the screen for whe the game is a tie
        let text = this.add.text(config.width / 2, config.height / 2 - 50, 'Gosh darn it!!!', { font: 'bold 50pt Arial', fill: '#ffffff' });
        text.setOrigin(0.5, 0.5);
        text.depth = 2;
        text = this.add.text(config.width / 2, config.height / 2 + 50, 'A tie!!!! >:(', { font: 'bold 50pt Arial', fill: '#ffffff' });
        text.setOrigin(0.5, 0.5);
        text.depth = 2;
    }
  
    preload() { // loads all texture images to be used in scene
        this.load.image('red', 'assets/red.png');
        this.load.image('yellow', 'assets/yellow.png');
        this.load.image('board', 'assets/board.png');
        this.load.image('reset', 'assets/reset.png');
        this.load.image('sorry-bud', 'assets/sorry-bud.png');
        this.load.image('king-red', 'assets/king-red.png');
        this.load.image('king-yellow', 'assets/king-yellow.png');
    }
  
    create(data) { // builds the initial scene
        // adds game board to scene
        let board = this.add.image(config.width / 2, config.height / 2 + 50, 'board');
        board.depth = 1; // depth of 1 means it is rendered on top of the chips (they fall behind the board)

        // add reset button to scene
        let reset = this.add.image(20, 20, 'reset');
        reset.depth = 1; // depth of 1 means it is rendered on top of the chips

        // hidden object which is botton of board and stops the chips from falling past the bottom
        let floor = this.add.rectangle(config.width / 2, config.height, 710, 10, 0x000000);
        this.physics.add.existing(floor);
        floor.body.setAllowGravity(false);
        floor.body.setImmovable(true);
        floor.setVisible(false);

        // player chip, origianlly hidden
        this.player = this.physics.add.image(0, 0, this.human == 1 ? this.kingMode ? 'king-yellow' : 'yellow' : this.kingMode ? 'king-red' : 'red');
        this.player.body.setAllowGravity(false);
        this.player.setVisible(false);

        // computer chip, originally hidden
        this.computer = this.physics.add.image(0, 0, this.human == 2 ? this.kingMode ? 'king-yellow' : 'yellow' : this.kingMode ? 'king-red' : 'red');
        this.computer.body.setAllowGravity(false);
        this.computer.setVisible(false);

        // adds collision between floor and chips so they stop at the botton on initial moves
        this.physics.add.collider(this.player, floor, () => { this.place() });
        this.physics.add.collider(this.computer, floor, () => { this.place() });

        // add keyboard inputs
        this.input.keyboard.on('keydown-A', () => { this.left() });
        this.input.keyboard.on('keydown-S', () => { this.down() });
        this.input.keyboard.on('keydown-D', () => { this.right() });
        this.input.keyboard.on('keydown-LEFT', () => { this.left() });
        this.input.keyboard.on('keydown-DOWN', () => { this.down() });
        this.input.keyboard.on('keydown-RIGHT', () => { this.right() });
        this.input.keyboard.on('keydown-SPACE', () => { this.down() });
      
        // callback for mouse click
        this.input.on('pointerup', (pointer) => {
            if (pointer.y < 40 && pointer.x < 40) { // check if reset button was clicked
                // if so, go back to title scene
                connectFour.scene.stop('game');
                connectFour.scene.start('title', { kingMode: this.kingMode });
                return;
            }
            // otherwise, move the player chip to the appropriate row and drop it
            let c = Math.floor((pointer.x - 5) / 100);
            if (this.inputEnabled && this.stacks[c] >= 0) {
                this.c = c
                this.player.setX(this.c * 100 + 55);
                this.player.body.setAllowGravity(true);
                this.inputEnabled = false;
            }
        });

        // ready the first move
        this.nextMove();
    }

    
    update(time, delta) { // function called repeatedly as game is open
        // needed to fix small issue with position of the player chip when hovering above the board
        if (this.inputEnabled) { this.player.setY(50); }
    }
}

const config = {
    scale: {
        parent: 'game',

        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,

        min: {
            width: 355,
            height: 355
        },
        max: {
            width: 1065,
            height: 1065
        },

        zoom: 1,  // Size of game canvas = game size * zoom
    },
    autoRound: false,
    type: Phaser.AUTO, // selects the engine(canvas or webGL) depending on browser capabilities
    width: 710,
    height: 710,
    backgroundColor: '#000000',
    physics: { // arcadephysics is simple 2D with gravity
        default: 'arcade',
        arcade: {
            gravity: {
                y: 750
            },
            debug: false
        }
    }
};

// create the game
const connectFour = new Phaser.Game(config);

// add the two scenes
connectFour.scene.add('title', title);
connectFour.scene.add('game', game);

// start the first scene
connectFour.scene.start('title', { kingMode: false });
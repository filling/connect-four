$(document).ready(function(){
    let moves = [];
    let playerMoves = [];
    let aiMoves = [];
    let winCheck;
    gameStart();

    //detect player click
    $(".grid div").on("click", function() {
        if ( !$(this).closest(".grid").hasClass("disabled") ) {
            playerSelect( $(this) )
        }
    })

    $("button#new-game").on("click",clear);

    function gameStart() {
        //disable grid on page load
        $(".grid").off('click')

        //button interactions
        $("button").on("click",function() {
            $(this).addClass("active")
            $(this).siblings().attr("disabled","disabled")
            if ( $(this).attr("id") == "ai-first" ) {
                getAiMove(moves)
            }
            //enable clicking on grid
            $(".grid").removeClass("disabled")
        })
    }

    function playerSelect(elem) {
        let col = $(elem).attr('data-col');
        let circles = $(".grid div[data-col="+col+"]").not(".red").not(".blue").toArray();
        circles[circles.length-1].classList.add("red")
        let row = circles[circles.length-1].getAttribute("data-row");
        moves.push(col)
        playerMoves.push([col, row])
        winConditionCheck();
        if ( winCheck != true ) {
            getAiMove(moves)
        }
        else {
            endCondition("red wins")
        }
    }

    function getAiMove(arr) {
        $.ajax({
            url: "https://w0ayb2ph1k.execute-api.us-west-2.amazonaws.com/production?moves=[" + arr + "]",
            type: "GET",
            success: function(response) {
                //parse response to get last integer to indicate ai move
                let str = response.replace("[","").replace("]","")
                moves = str.split(",");
                let move = moves[moves.length-1];
                let circles = $(".grid div[data-col="+move+"]").not(".red").not(".blue").toArray();
                circles[circles.length-1].classList.add("blue")
                let row = circles[circles.length-1].getAttribute("data-row")
                aiMoves.push([move, row])
                $("#moves").attr("value",moves)
                winConditionCheck()
                if ( winCheck == true ) {
                    endCondition("blue wins")
                }
                if ( $(".grid div").not(".red, .blue").length == 0 ) {
                    endCondition("tie");
                }
            },
            error: function(err) {
                //test if there is a tie
                if ( err.status = 400 && $(".grid div").not(".red, .blue").length == 0 ) {
                    endCondition("tie");
                }
                //otherwise, move isn't acceptable so recurse method
                else {
                    console.log("invalid placement");
                    getAiMove(moves)
                }
            }
        });
    }

    //end game condition
    function endCondition(result) {
        moves = [];
        $("#moves").attr("value","")
        $("header section div.hidden").removeClass("hidden");
        if ( result == "tie" ) {
            $("#results span").html("TIE...")
        }
        else if ( result == "red wins" ) {
            $("#results span").addClass("red-text").html("Red wins!")
        }
        else if ( result == "blue wins" ) {
            $("#results span").addClass("blue-text").html("Blue wins!")
        }
        $(".grid").addClass("disabled")
        $(".grid").off("click")
        winCheck = false;
    }

    //clear state of board
    function clear() {
        $("button").removeAttr("disabled").removeClass("active");
        $(".grid").addClass("disabled")
        $(".grid div").removeClass("red blue")
        $("header section div").addClass("hidden")
        $("#results span").removeClass("blue-text red-text")
    }

    //quick and dirty way to test for wins -- would definitely like to expand on this and make it more extensible
    function winConditionCheck() {
        //testing with 4 since that is the winning amount
        for ( let i = 0; i < 4; i++ ) {
            //test if total length of .red is 4 across columns or rows
            if ( $(".grid div[data-col=" + i + "].red").length == 4 || $(".grid div[data-row=" + i + "].red").length == 4 ) {
                console.log('red wins');
                return winCheck = true;       
            }
            //test if total length of .blue is 4 across columns or rows
            else if ( $(".grid div[data-col=" + i + "].blue").length == 4 || $(".grid div[data-row=" + i + "].blue").length == 4 ) {
                console.log('blue wins');
                return winCheck = true;
            }
        }

        //test for diagonals
        var circles = $(".grid div").toArray();
        if ( (circles[15].classList.value == "red" && circles[10].classList.value == "red" && circles[5].classList.value == "red" && circles[0].classList.value == "red") 
        || (circles[12].classList.value == "red" && circles[9].classList.value == "red" && circles[6].classList.value == "red" && circles[3].classList.value == "red") ) {
            console.log('red wins');
            return winCheck = true; 
        }
        else if ( (circles[15].classList.value == "blue" && circles[10].classList.value == "blue" && circles[5].classList.value == "blue" && circles[0].classList.value == "blue") 
        || (circles[12].classList.value == "blue" && circles[9].classList.value == "blue" && circles[6].classList.value == "blue" && circles[3].classList.value == "blue") ) {
            console.log('blue wins');
            return winCheck = true; 
        }
    }
})
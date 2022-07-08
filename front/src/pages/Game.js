import React from "react";
import swal from 'sweetalert';
import {useNavigate} from 'react-router-dom';

import "./Game.css";
let ws=null;
let block=false;
let timeoutBot=null;

function markRightPlayWithBot(n){
    debugger;
    let row=parseInt(n/7);
    ws.send(JSON.stringify({"command":"move","username":"random","id":localStorage["id"],"mark":1,"row":row, "side":"r"}));    
}

function markLeftPlayWithBot(n){
    debugger;
    let row=parseInt(n/7);
    ws.send(JSON.stringify({"command":"move","username":localStorage["username"],"id":localStorage["id"],"mark":localStorage["mark"],"row":row, "side":"l"}));
}

function markRight(n){
    if(localStorage["user_b"]=="bot"){
        markRightPlayWithBot(n);
        return;
    }
    if(!block){
        let row=parseInt(n/7);
        ws.send(JSON.stringify({"command":"move","username":localStorage["username"],"id":localStorage["id"],"mark":localStorage["mark"],"row":row, "side":"r"}));    
        block=true;
    }else{
        swal("It's the other player's turn!");
    }
}

function markLeft(n){
    if(localStorage["user_b"]=="bot"){
        markLeftPlayWithBot(n);
        return;
    }
    
    if(!block){
        let row=parseInt(n/7);
        ws.send(JSON.stringify({"command":"move","username":localStorage["username"],"id":localStorage["id"],"mark":localStorage["mark"],"row":row, "side":"l"}));
        block=true;
    }else{
        swal("It's the other player's turn!");
    }
}

function paintBoard(board){
    if(!board)return;
    var k=-1;
    for(var i=0;i<board.length;i++){
        for(var j=0;j<board[i].length;j++){
            k+=1;
            if(board[i][j]==1){
                if(document.getElementById("cell_"+k))
                    document.getElementById("cell_"+k).src="circle.png";
            }else if(board[i][j]==2){
                if(document.getElementById("cell_"+k))
                    document.getElementById("cell_"+k).src="x.png";
            }else{
                if(document.getElementById("cell_"+k))
                    document.getElementById("cell_"+k).src="blank.png";
            }
        }
    }
}

function buildCell(n){
    let id="cell_"+n;
    if([0].indexOf(n)!=-1){
        return (
            <>
            <div className="box-left" onClick={()=>markLeft(n)}><img alt="right stack" src="right.png" width="24" height="24" ></img></div>
            <div className="box-dark">
                <img id={id} src="blank.png" width="48" height="48" alt="blank cell"></img>
            </div>
            </>
        )
    }else if([7,14,21,28,35,42].indexOf(n)!=-1){
        if(n%2==0)
            return (
                <>
                <div className="box-right" onClick={()=>markRight(n-7)}><img alt="right stack" src="left.png" width="24" height="24" ></img></div>
                <div className="box-left" onClick={()=>markLeft(n+1)}><img alt="left stack" src="right.png" width="24" height="24" ></img></div>
                <div className="box-dark">
                    <img id={id} alt="cell indicator" src="blank.png" width="48" height="48"></img>
                </div>
                </>
            );
        else    
            return (
                <>
                <div className="box-right" onClick={()=>markRight(n-7)}><img alt="left stack" src="left.png" width="24" height="24" ></img></div>
                <div className="box-left" onClick={()=>markLeft(n+1)}>
                    <img alt="right stack" src="right.png" width="24" height="24" ></img>
                </div>
                <div className="box">
                    <img alt="cell indicator" id={id} src="blank.png" width="48" height="48"></img>
                </div>
                </>
            );
    }else if([48].indexOf(n)!=-1){
        return (
            <>
            
            <div className="box-dark">
                <img alt="cell indicator" id={id} src="blank.png" width="48" height="48"></img>
            </div>
            <div className="box-right" onClick={()=>markRight(n-6)}><img alt="left stack" src="left.png" width="24" height="24" ></img></div>
            </>
        )
    }
    
    if(n%2==0)
        return (
            <div className="box-dark">
                <img alt="cell indicator" id={id} src="blank.png" width="48" height="48"></img>
            </div>
        );
    else
        return (
            <div className="box">
                <img alt="cell indicator" id={id} src="blank.png" width="48" height="48"></img>
            </div>
        );
}

function checkWinnerBot(game){
    if(game.board){
        paintBoard(game.board);
    }
    
    if(game.winner_mark==1){
        swal("You win!!!").then(()=>{
            resetGame();            
        });
        resetGame();
    }else if(game.winner_mark==2){
        swal("Bot win, You lose :(").then(()=>{
            resetGame();            
        });
    }
}

function initSocket(){
    debugger;
    var socketUrl = `ws://${window.location.hostname}:3002`;
    ws = new WebSocket(socketUrl);
    ws.onopen = function () {
    };

    ws.onmessage = function (e) {
        debugger;
        let game=JSON.parse(e.data);
        if(game.user_b=="bot"){
            checkWinnerBot(game);
            return;
        }
        if(game.id!=localStorage["id"]){return;}
        
        if(game.board){
            paintBoard(game.board);
        }
        if(game.mark!=localStorage["mark"])block=false;
        
        if(game.winner_mark){
            if(game.winner_mark==localStorage["mark"]){
                swal("You win!!!");
                resetGame();
            }else{
                swal("You lose :(");
                resetGame();
            }
        }
    };

    ws.onclose = function () {
    };

    ws.onerror = function (e) {
    };
}

function resetGame(){
    ws.send(JSON.stringify({"command":"reset","id":localStorage["id"]}));
}

function playNewGame(navigate){
    navigate("/users")
}

function Game(){
    const navigate = useNavigate();
    
    fetch(`http://${window.location.hostname}:3001/game`,{
        method: "POST",
        body: JSON.stringify({user_a: localStorage["user_a"],user_b:localStorage["user_b"]}),
        headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then((data)=>data.json())
    .then((data)=>{
        localStorage["id"]=data.id;
        localStorage["user_a"]=data.user_a;
        localStorage["user_b"]=data.user_b;
        localStorage["board"]=data.board;
        if(localStorage["username"]==data.user_a)localStorage["mark"]=1;
        else localStorage["mark"]=2;
    });
    
    
    block=false;
    setTimeout(function(){
        paintBoard(JSON.parse(localStorage["board"]));    
    }, 0);
    let user_a=localStorage["user_a"];
    let user_b=localStorage["user_b"];
    
    return (
    <>
    <p className="user_a">{user_a}</p>
    <p className="user_b">{user_b}</p>
    <h3 className="text-center text-white pt-3">Side-Stacker Game</h3>
        <div className="wrapper">
  <div className="top">
    <div className="wrapper-inner">
        <div className="box-inner"></div>
            {[1,2,3,4,5,6,7].map((n,i)=><div className="box-inner" key={i}>{n}</div>)}
        <div className="box-inner"></div>
    </div>
    </div>
    
    {[...Array(49)].map((n,i)=>buildCell(i))}
    
  <div className="bottom">
    <div className="wrapper-inner">
      <div className="box-inner"></div>
            {[1,2,3,4,5,6,7].map((n,i)=><div className="box-inner" key={i}>{n}</div>)}
        <div className="box-inner"></div>
    </div>
  </div>

</div>
    <div className="btn-reset">
        <button className="btn btn-success" onClick={resetGame}>Reset</button>
        <button className="btn btn-success btn-play" onClick={()=>playNewGame(navigate)}>Play with someone else</button>
    </div>
    </>
    );
}

initSocket();

export default Game;
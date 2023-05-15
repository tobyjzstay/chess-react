import React from "react";
import { BoardContext } from "./Board";
import Piece from "./Piece";
import "./Square.css";

function Square({ rank, file }: { rank: number; file: number }) {
    const { board } = React.useContext(BoardContext);
    let className = "square";

    if (rank % 2 === file % 2) className += " square__white";
    else className += " square__black";

    return (
        <div className={className}>
            <Piece piece={board[file][rank]} />
        </div>
    );
}

export default Square;

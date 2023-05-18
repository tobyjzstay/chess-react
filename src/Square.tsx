import React from "react";
import { BoardContext, FILES, RANKS } from "./Board";
import Piece from "./Piece";
import "./Square.css";

type SquareData = {
    file: number;
    rank: number;
};

const squareContext = React.createContext<SquareData>(Object.create(null));

function Square({ square }: { square: SquareData }) {
    const { board } = React.useContext(BoardContext);
    const { file, rank } = square;
    let squareClassName = "square";

    if (rank % 2 === file % 2) squareClassName += " square__white";
    else squareClassName += " square__black";

    return (
        <div className={squareClassName}>
            <p className="coord coord__debug">{"[" + rank + ", " + file + "]"}</p>
            {FILES - 1 === file && <p className="coord coord__file">{String.fromCharCode("a".charCodeAt(0) + rank)}</p>}
            {RANKS - 1 === rank && <p className="coord coord__rank">{FILES - file}</p>}
            <Piece piece={board[file][rank]} />
        </div>
    );
}

export default Square;

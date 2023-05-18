import React from "react";
import { BoardContext, FILES, RANKS } from "./Board";
import Piece, { PieceData } from "./Piece";
import "./Square.css";

export type SquareData = {
    file: number; // a-h
    rank: number; // 1-8
    piece: PieceData;
    highlight: (value: boolean) => void;
};

export const SquareContext = React.createContext<{
    file: number;
    rank: number;
}>(Object.create(null));

function Square({ file, rank, selected }: { file: number; rank: number; selected?: boolean }) {
    const { squares } = React.useContext(BoardContext);
    const [highlighted, setHighlighted] = React.useState(false);
    const baseClassName = "square";
    let squareClassName = baseClassName;
    let selectedClassName = baseClassName;

    squares[file][rank].highlight = setHighlighted;

    if (rank % 2 === file % 2) squareClassName += " square__white";
    else squareClassName += " square__black";

    if (highlighted) selectedClassName += " square__selected";

    return (
        <SquareContext.Provider value={{ file, rank }}>
            <div className={squareClassName}>
                <div className={selectedClassName}>
                    <p className="coord coord__debug">{"[" + file + ", " + rank + "]"}</p>
                    {FILES - 1 === file && (
                        <p className="coord coord__file">{String.fromCharCode("a".charCodeAt(0) + rank)}</p>
                    )}
                    {RANKS - 1 === rank && <p className="coord coord__rank">{FILES - file}</p>}
                    <Piece />
                </div>
            </div>
        </SquareContext.Provider>
    );
}

export default Square;

import React from "react";
import { BoardContext, Colour, FILES, RANKS } from "./Board";
import Piece, { PieceData, Type, isSquareAttacked } from "./Piece";
import "./Square.css";

export type SquareData = {
    file: number; // a-h
    rank: number; // 1-8
    piece: PieceData;
    isDestination: boolean;
    setDestination: (value: boolean) => void;
    isSelected: boolean;
    setSelected: (value: boolean) => void;
};

export const SquareContext = React.createContext<{
    file: number;
    rank: number;
}>(Object.create(null));

function Square({ file, rank }: { file: number; rank: number }) {
    const boardData = React.useContext(BoardContext);
    const { squares, turn } = boardData;
    const piece = squares[file][rank].piece;

    const [destination, setDestination] = React.useState(false);
    const [selected, setSelected] = React.useState(false);

    squares[file][rank].isDestination = destination;
    squares[file][rank].setDestination = setDestination;

    squares[file][rank].isSelected = selected;
    squares[file][rank].setSelected = (value: boolean) => {
        if (value)
            for (let r = 0; r < RANKS; r++) {
                for (let f = 0; f < FILES; f++) {
                    if (f === file && r === rank) continue;
                    squares[f][r].setSelected(false);
                    squares[f][r].setDestination(false);
                }
            }
        setSelected(value);
    };

    let squareClassName = "square";

    if (rank % 2 === file % 2) squareClassName += " white";
    else squareClassName += " black";

    let overlayClassName = squareClassName;

    if (selected) overlayClassName += " selected";

    if (destination) {
        overlayClassName += " destination";
        if (piece.type !== Type.None) overlayClassName += " capture";
    }

    if (turn === piece.colour && piece.type === Type.King && isSquareAttacked(boardData, file, rank, piece.colour))
        overlayClassName += " check";

    function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        console.log(destination);
        if (destination) {
            const selected = getSelected(squares);
            if (!selected) return;
            squares[file][rank].piece = selected.piece;
            selected.piece = { type: Type.None, colour: Colour.None };
            boardData.setTurn(boardData.turn === Colour.White ? Colour.Black : Colour.White);
        }
        for (let rank = 0; rank < RANKS; rank++) {
            for (let file = 0; file < FILES; file++) {
                squares[file][rank].setSelected(false);
                squares[file][rank].setDestination(false);
            }
        }
        event.stopPropagation();
    }

    return (
        <SquareContext.Provider value={{ file, rank }}>
            <div className={squareClassName} onClick={handleClick}>
                <div className={overlayClassName}>
                    {/* <p className="coord debug">{"[file:" + file + ", rank:" + rank + "]"}</p> */}
                    {RANKS - 1 === rank && (
                        <p className="coord file">{String.fromCharCode("a".charCodeAt(0) + file)}</p>
                    )}
                    {FILES - 1 === file && <p className="coord rank">{RANKS - rank}</p>}
                    <Piece />
                </div>
            </div>
        </SquareContext.Provider>
    );
}

function getSelected(squares: SquareData[][]) {
    for (let rank = 0; rank < RANKS; rank++) {
        for (let file = 0; file < FILES; file++) {
            if (squares[file][rank].isSelected) return squares[file][rank];
        }
    }
    return null;
}

export default Square;

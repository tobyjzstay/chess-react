import React from "react";
import { BoardContext, FILES, RANKS } from "./Board";
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
    const { squares, turn } = React.useContext(BoardContext);
    const piece = squares[file][rank].piece;

    const [destination, setDestination] = React.useState(false);
    const [selected, setSelected] = React.useState(false);

    squares[file][rank].isDestination = destination;
    squares[file][rank].setDestination = setDestination;

    squares[file][rank].isSelected = selected;
    squares[file][rank].setSelected = (value: boolean) => {
        if (value)
            for (let f = 0; f < FILES; f++) {
                for (let r = 0; r < RANKS; r++) {
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

    let overlayClassName = "overlay";

    if (selected) overlayClassName += " selected";

    if (destination) {
        overlayClassName += " destination";
        if (piece.type !== Type.None) overlayClassName += " capture";
    }

    if (turn === piece.colour && piece.type === Type.King && isSquareAttacked(squares, file, rank, piece.colour))
        overlayClassName += " check";

    function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (destination) return;
        for (let f = 0; f < FILES; f++) {
            for (let r = 0; r < RANKS; r++) {
                squares[f][r].setSelected(false);
                squares[f][r].setDestination(false);
            }
        }
        event.stopPropagation();
    }

    return (
        <SquareContext.Provider value={{ file, rank }}>
            <div className={squareClassName} onClick={handleClick}>
                <div className={overlayClassName}>
                    {FILES - 1 === file && (
                        <p className="coord file">{String.fromCharCode("a".charCodeAt(0) + rank)}</p>
                    )}
                    {RANKS - 1 === rank && <p className="coord rank">{FILES - file}</p>}
                    <Piece />
                </div>
            </div>
        </SquareContext.Provider>
    );
}

export default Square;

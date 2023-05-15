import "./Board.css";
import Square from "./Square";

const RANKS = 8;
const FILES = 8;

function Board() {
    const squares: JSX.Element[] = [];

    return (
        <div className="board">
            <div className="rank">
                {Array.from({ length: RANKS }, (_, rank) => (
                    <div className="file">
                        {Array.from({ length: FILES }, (_, file) => (
                            <Square rank={rank} file={file} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Board;

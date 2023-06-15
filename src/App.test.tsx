/* eslint-disable @typescript-eslint/no-unused-vars */
import {render} from '@testing-library/react';
import {FILES, RANKS, STARTING_POSITION} from './App';
import './App.css';
import Board from './Board';

describe('board dimensions', () => {
  test('classic board', () => {
    const {files, ranks} = classicBoard;
    const {container} = render(<Board {...classicBoard} />);
    const board = getElementByClassName(container, 'board');
    expect(board.childNodes.length).toBe(files);
    for (const childNode of Array.from(board.childNodes)) {
      expect(childNode?.childNodes.length).toBe(ranks);
    }
  });

  test('silverman board 4x4', () => {
    const {files, ranks} = silvermanBoard4x4;
    const {container} = render(<Board {...silvermanBoard4x4} />);
    const board = getElementByClassName(container, 'board');
    expect(board.childNodes.length).toBe(ranks);
    for (const childNode of Array.from(board.childNodes)) {
      expect(childNode?.childNodes.length).toBe(files);
    }
  });
});

const classicBoard = {
  files: FILES,
  ranks: RANKS,
  fen: STARTING_POSITION,
};

const silvermanBoard4x4 = {
  files: 4,
  ranks: 4,
  fen: 'rqkr/pppp/PPPP/RQKR w - - 0 1',
};

function getElementByClassName(container: HTMLElement, className: string) {
  const elements = container.getElementsByClassName(className);
  if (elements === null) throw new Error('Element not found');
  else if (elements.length > 1) throw new Error('Class name is anbiguous');
  else {
    const element = elements.item(0);
    if (element === null) throw new Error('Element not found');
    else return element;
  }
}

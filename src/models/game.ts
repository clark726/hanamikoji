
// 遊戲狀態枚舉
import {MessageType} from "../components/game/GameMessages";

export enum GameStatus {
    WAITING = 'WAITING',
    PLAYING = 'PLAYING',
    FINISHED = 'FINISHED'
}

// 行動類型枚舉
export enum ActionType {
    SECRET = 'SECRET',
    DISCARD = 'DISCARD',
    GIFT = 'GIFT',
    COMPETE = 'COMPETE'
}

// 藝妓青睞狀態
export enum FavorStatus {
    NEUTRAL = 'NEUTRAL',
    PLAYER1 = 'PLAYER1',
    PLAYER2 = 'PLAYER2'
}

// 卡牌接口
export interface Card {
    id: string;
    geishaId: string;
    geishaName: string;
    status: 'IN_DECK' | 'IN_HAND' | 'ALLOCATED' | 'SECRET' | 'DISCARDED';
    ownerId?: string;
}

// 藝妓接口
export interface Geisha {
    id: string;
    name: string;
    charm: number;
    favor: FavorStatus;
}

// 玩家接口
export interface Player {
    id: string;
    name: string;
    isMyTurn: boolean;
    hand: Card[];
    usedActions: ActionType[];
    allocatedCards: {[geishaId: string]: Card[]};
    score: number;
}

// 遊戲接口
export interface Game {
    id: string;
    status: GameStatus;
    currentPlayerId: string;
    players: {[playerId: string]: Player};
    geishas: {[geishaId: string]: Geisha};
    round: number;
    messages: GameMessage[];
}

// 遊戲訊息
export interface GameMessage {
    id: string;
    type: MessageType;
    text: string;
    timestamp: number;
    playerId?: string;
    playerName?: string;
    actionType?: string;
    details?: any;
}

// 行動請求
export interface ActionRequest {
    gameId: string;
    actionType: ActionType;
    cardIds: string[];
    groupings?: string[][];  // 用於獻禮和競爭行動
}
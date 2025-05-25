import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ActionType, Card, FavorStatus, Game, GameMessage, GameStatus, Geisha, Player} from "../models/game";
import {MessageType} from "../components/game/GameMessages";


// Redux 狀態接口
interface GameState {
    // 遊戲核心狀態
    game: Game | null;
    currentPlayer: Player | null;
    opponent: Player | null;

    // UI 狀態
    selectedCards: string[];
    currentAction: ActionType | null;

    // 系統狀態
    loading: boolean;
    error: string | null;

    // UI 相關狀態
    showActionArea: boolean;
    waitingForOpponent: boolean;
}

// 初始狀態
const initialState: GameState = {
    game: null,
    currentPlayer: null,
    opponent: null,
    selectedCards: [],
    currentAction: null,
    loading: false,
    error: null,
    showActionArea: false,
    waitingForOpponent: false,
};

// 創建模擬遊戲數據的輔助函數
const createMockGame = (): Game => {
    const mockGeishas: { [key: string]: Geisha } = {
        '1': {id: '1', name: '舞妓A', charm: 2, favor: FavorStatus.NEUTRAL},
        '2': {id: '2', name: '舞妓B', charm: 2, favor: FavorStatus.PLAYER1},
        '3': {id: '3', name: '舞妓C', charm: 3, favor: FavorStatus.NEUTRAL},
        '4': {id: '4', name: '舞妓D', charm: 3, favor: FavorStatus.PLAYER2},
        '5': {id: '5', name: '舞妓E', charm: 4, favor: FavorStatus.NEUTRAL},
        '6': {id: '6', name: '舞妓F', charm: 5, favor: FavorStatus.PLAYER1},
        '7': {id: '7', name: '舞妓G', charm: 6, favor: FavorStatus.NEUTRAL},
    };

    const mockCards: Card[] = [
        {id: 'c1', geishaId: '1', status: 'IN_DECK', geishaName: '舞妓A'},
        {id: 'c2', geishaId: '2', status: 'IN_DECK', geishaName: '舞妓B'},
        {id: 'c3', geishaId: '3', status: 'IN_DECK', geishaName: '舞妓C'},
        {id: 'c4', geishaId: '4', status: 'IN_DECK', geishaName: '舞妓D'},
        {id: 'c5', geishaId: '5', status: 'IN_DECK', geishaName: '舞妓E'},
        {id: 'c6', geishaId: '6', status: 'IN_DECK', geishaName: '舞妓F'},
    ];

    const mockPlayers: { [key: string]: Player } = {
        'player1': {
            id: 'player1',
            name: '玩家1',
            isMyTurn: true,
            hand: mockCards,
            usedActions: [ActionType.DISCARD], // 已使用棄牌行動
            allocatedCards: {
                '2': [{id: 'a1', geishaId: '2', status: 'IN_DECK', geishaName: '舞妓B'}],
                '6': [{id: 'a2', geishaId: '6', status: 'IN_DECK', geishaName: '舞妓F'}],
            },
            score: 7, // 2 + 5 魅力值
        },
        'player2': {
            id: 'player2',
            name: '玩家2',
            isMyTurn: false,
            hand: [],
            usedActions: [ActionType.SECRET],
            allocatedCards: {
                '4': [{id: 'a3', geishaId: '4', status: 'IN_DECK', geishaName: '舞妓D'}],
            },
            score: 3,
        },
    };

    const mockMessages: GameMessage[] = [
        {
            id: '1',
            type: MessageType.SYSTEM,
            text: '遊戲開始！',
            timestamp: Date.now() - 300000,
        },
        {
            id: '2',
            type: MessageType.PLAYER_ACTION,
            text: '執行了棄牌行動',
            timestamp: Date.now() - 200000,
            playerId: 'player1',
            playerName: '玩家1',
            actionType: 'DISCARD',
        },
        {
            id: '3',
            type: MessageType.INFO,
            text: '輪到您的回合，請選擇一個行動',
            timestamp: Date.now() - 100000,
        },
    ];

    return {
        id: 'game_123',
        status: GameStatus.PLAYING,
        currentPlayerId: 'player1',
        players: mockPlayers,
        geishas: mockGeishas,
        round: 1,
        messages: mockMessages,
    };
};

// 創建 gameSlice
const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        // 初始化遊戲（使用模擬數據）
        initializeGame: (state) => {
            const mockGame = createMockGame();
            state.game = mockGame;
            state.currentPlayer = mockGame.players['player1'];
            state.opponent = mockGame.players['player2'];
            state.loading = false;
            state.error = null;
        },

        // 設置遊戲數據（用於從外部設置遊戲狀態）
        setGame: (state, action: PayloadAction<Game>) => {
            state.game = action.payload;
            const playerIds = Object.keys(action.payload.players);
            // 假設當前玩家是 player1
            const currentPlayerId = 'player1';
            const opponentId = playerIds.find(id => id !== currentPlayerId) || playerIds[1];

            state.currentPlayer = action.payload.players[currentPlayerId] || null;
            state.opponent = action.payload.players[opponentId] || null;
        },

        // 選擇/取消選擇卡牌
        selectCard: (state, action: PayloadAction<string>) => {
            const cardId = action.payload;
            const index = state.selectedCards.indexOf(cardId);

            if (index > -1) {
                // 如果已選中，則取消選擇
                state.selectedCards.splice(index, 1);
            } else {
                // 如果未選中，則添加到選擇列表
                // 限制最多選擇4張卡（競爭行動需要4張）
                if (state.selectedCards.length < 4) {
                    state.selectedCards.push(cardId);
                }
            }
        },

        // 選擇行動
        selectAction: (state, action: PayloadAction<ActionType>) => {
            state.currentAction = action.payload;
            state.selectedCards = []; // 重置選擇的卡牌
            state.showActionArea = true;
        },

        // 重置選擇
        resetSelection: (state) => {
            state.selectedCards = [];
            state.currentAction = null;
            state.showActionArea = false;
        },

        // 執行行動
        executeAction: (state, action: PayloadAction<{
            actionType: ActionType;
            cards: string[];
            groups?: string[][];
        }>) => {
            const {actionType, cards} = action.payload;

            if (!state.currentPlayer || !state.game) return;

            // 添加到已使用行動列表
            if (!state.currentPlayer.usedActions.includes(actionType)) {
                state.currentPlayer.usedActions.push(actionType);
            }

            // 從手牌中移除使用的卡牌
            state.currentPlayer.hand = state.currentPlayer.hand.filter(
                card => !cards.includes(card.id)
            );

            // 根據行動類型處理結果
            if (actionType === ActionType.SECRET || actionType === ActionType.DISCARD) {
                // 秘密保留和棄牌不影響藝妓青睞
            } else if (actionType === ActionType.GIFT || actionType === ActionType.COMPETE) {
                // 獻禮和競爭需要等待對手選擇
                state.waitingForOpponent = true;
            }

            // 添加行動消息
            const newMessage: GameMessage = {
                id: Date.now().toString(),
                type: MessageType.PLAYER_ACTION,
                text: `執行了${actionType === ActionType.SECRET ? '秘密保留' :
                    actionType === ActionType.DISCARD ? '棄牌' :
                        actionType === ActionType.GIFT ? '獻禮' : '競爭'}行動`,
                timestamp: Date.now(),
                playerId: state.currentPlayer.id,
                playerName: state.currentPlayer.name,
                actionType,
                details: `使用了${cards.length}張卡牌`
            };

            if (state.game.messages) {
                state.game.messages.push(newMessage);
            }

            // 重置UI狀態
            state.selectedCards = [];
            state.currentAction = null;
            state.showActionArea = false;
        },

        // 添加消息
        addMessage: (state, action: PayloadAction<GameMessage>) => {
            if (state.game?.messages) {
                state.game.messages.push(action.payload);
            }
        },

        // 更新藝妓青睞
        updateGeishaFavor: (state, action: PayloadAction<{
            geishaId: string;
            favor: FavorStatus;
        }>) => {
            const {geishaId, favor} = action.payload;
            if (state.game?.geishas[geishaId]) {
                state.game.geishas[geishaId].favor = favor;
            }
        },

        // 切換回合
        switchTurn: (state) => {
            if (!state.game || !state.currentPlayer || !state.opponent) return;

            // 切換回合
            state.currentPlayer.isMyTurn = !state.currentPlayer.isMyTurn;
            state.opponent.isMyTurn = !state.opponent.isMyTurn;

            // 更新當前玩家ID
            state.game.currentPlayerId = state.currentPlayer.isMyTurn
                ? state.currentPlayer.id
                : state.opponent.id;

            // 如果回到原始玩家，增加回合數
            if (state.currentPlayer.isMyTurn) {
                state.game.round += 1;
            }

            // 重置等待狀態
            state.waitingForOpponent = false;
        },

        // 設置等待對手狀態
        setWaitingForOpponent: (state, action: PayloadAction<boolean>) => {
            state.waitingForOpponent = action.payload;
        },

        // 設置載入狀態
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        // 設置錯誤
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },

        // 重置遊戲狀態
        resetGame: (state) => {
            return {...initialState};
        },

        // 更新玩家分數
        updatePlayerScore: (state, action: PayloadAction<{
            playerId: string;
            score: number;
        }>) => {
            const {playerId, score} = action.payload;
            if (state.game?.players[playerId]) {
                state.game.players[playerId].score = score;
            }
        },

        // 檢查勝利條件
        checkVictoryCondition: (state) => {
            if (!state.game || !state.currentPlayer || !state.opponent) return;

            // 檢查藝妓數量勝利條件（4位藝妓青睞）
            const playerGeishaCount = Object.values(state.game.geishas).filter(
                geisha => geisha.favor === FavorStatus.PLAYER1
            ).length;

            const opponentGeishaCount = Object.values(state.game.geishas).filter(
                geisha => geisha.favor === FavorStatus.PLAYER2
            ).length;

            // 檢查魅力值勝利條件（11點或以上）
            const playerCharmTotal = Object.values(state.game.geishas)
                .filter(geisha => geisha.favor === FavorStatus.PLAYER1)
                .reduce((total, geisha) => total + geisha.charm, 0);

            const opponentCharmTotal = Object.values(state.game.geishas)
                .filter(geisha => geisha.favor === FavorStatus.PLAYER2)
                .reduce((total, geisha) => total + geisha.charm, 0);

            // 檢查勝利條件
            if (playerGeishaCount >= 4 || playerCharmTotal >= 11) {
                state.game.status = GameStatus.FINISHED;
                const winMessage: GameMessage = {
                    id: Date.now().toString(),
                    type: MessageType.SUCCESS,
                    text: '恭喜！您獲得了勝利！',
                    timestamp: Date.now(),
                };
                state.game.messages.push(winMessage);
            } else if (opponentGeishaCount >= 4 || opponentCharmTotal >= 11) {
                state.game.status = GameStatus.FINISHED;
                const loseMessage: GameMessage = {
                    id: Date.now().toString(),
                    type: MessageType.ERROR,
                    text: '遊戲結束，對手獲得了勝利！',
                    timestamp: Date.now(),
                };
                state.game.messages.push(loseMessage);
            }
        },
        setGameData: (state, action) => {
            state.game = action.payload.game;
            state.currentPlayer = action.payload.currentPlayer;
            state.opponent = action.payload.opponent;
            state.loading = false;
        }
    },
});

// 導出 actions
export const {
    initializeGame,
    setGame,
    selectCard,
    selectAction,
    resetSelection,
    executeAction,
    addMessage,
    updateGeishaFavor,
    switchTurn,
    setWaitingForOpponent,
    setLoading,
    setError,
    resetGame,
    updatePlayerScore,
    checkVictoryCondition,
    setGameData
} = gameSlice.actions;

// 選擇器（Selectors）
export const selectGame = (state: { game: GameState }) => state.game.game;
export const selectCurrentPlayer = (state: { game: GameState }) => state.game.currentPlayer;
export const selectOpponent = (state: { game: GameState }) => state.game.opponent;
export const selectSelectedCards = (state: { game: GameState }) => state.game.selectedCards;
export const selectCurrentAction = (state: { game: GameState }) => state.game.currentAction;
export const selectIsLoading = (state: { game: GameState }) => state.game.loading;
export const selectError = (state: { game: GameState }) => state.game.error;
export const selectShowActionArea = (state: { game: GameState }) => state.game.showActionArea;
export const selectWaitingForOpponent = (state: { game: GameState }) => state.game.waitingForOpponent;

// 複合選擇器
export const selectAvailableActions = (state: { game: GameState }) => {
    const currentPlayer = state.game.currentPlayer;
    if (!currentPlayer) return [];

    return Object.values(ActionType).filter(
        action => !currentPlayer.usedActions.includes(action)
    );
};


export const selectGameMessages = (state: { game: GameState }) => {
    return state.game.game?.messages || [];
};

export const selectGeishas = (state: { game: GameState }) => {
    return state.game.game?.geishas ? Object.values(state.game.game.geishas) : [];
};

export const selectIsMyTurn = (state: { game: GameState }) => {
    return state.game.currentPlayer?.isMyTurn || false;
};

export const gameReducer = gameSlice.reducer;
export default gameSlice.reducer;
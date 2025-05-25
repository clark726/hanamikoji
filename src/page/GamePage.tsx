import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Box, Text, useToast} from '@chakra-ui/react';
import HandCards from '../components/game/HandCards';
import ActionSelection from '../components/game/ActionSelection';
import GameStatus from '../components/game/GameStatus';
import ActionExecutionArea from '../components/game/ActionExecutionArea';
import GameMessages from '../components/game/GameMessages';

import {executeAction, resetSelection, selectAction, selectCard, setGameData} from '../store/gameSlice';
import {useDispatch, useSelector} from "react-redux";
import {ActionType, Card, Geisha} from "../models/game";
import GeishaInfluenceDisplay from "../components/game/GeishaInfluenceDisplay";
import OpponentActionStatus from "../components/game/OpponentActionStatus";
import CardReceivedNotification from "../components/game/CardReceivedNotification";

const GamePage: React.FC = () => {
    const {gameId} = useParams<{ gameId: string }>();
    const dispatch = useDispatch();
    const toast = useToast();

    // 從 Redux 獲取狀態 - 修正類型
    const {
        game,
        currentPlayer,
        opponent,
        loading,
        selectedCards,
        currentAction,
        showActionArea
    } = useSelector((state: { game: any; }) => state.game);

    const [cardReceivedNotification, setCardReceivedNotification] = useState<{
        isOpen: boolean;
        actionType: 'gift' | 'compete';
        receivedCards: Card[];
        opponentName: string;
        actionDetails?: any;
    }>({
        isOpen: false,
        actionType: 'gift',
        receivedCards: [],
        opponentName: ''
    });

    const [opponentActionStatus, setOpponentActionStatus] = useState<{
        isVisible: boolean;
        actionType: string;
        status: string;
        opponentName: string;
    } | null>(null);

    // 本地狀態
    const [socketConnected, setSocketConnected] = useState(false);

    useEffect(() => {
        // 模擬 WebSocket 連線
        const mockWebSocket = {
            connected: false,
            connect: () => {
                console.log('🔌 模擬 WebSocket 連線中...');
                setTimeout(() => {
                    mockWebSocket.connected = true;
                    setSocketConnected(true);
                    console.log('✅ WebSocket 連線成功');

                    // 連線成功後載入遊戲初始狀態
                    mockWebSocket.emit('join_game', {gameId, playerId: currentPlayer?.id});
                }, 1000);
            },

            emit: (event: string, data?: any) => {
                if (!mockWebSocket.connected) return;
                console.log('📤 發送訊息:', event, data);

                // 模擬伺服器回應
                setTimeout(() => {
                    mockWebSocket.handleServerMessage(event, data);
                }, 500);
            },

            handleServerMessage: (originalEvent: string, originalData?: any) => {
                // 根據發送的訊息類型模擬不同的伺服器回應
                switch (originalEvent) {
                    case 'join_game':
                        // 模擬遊戲初始狀態
                        console.log('📥 收到遊戲狀態');
                        mockWebSocket.loadMockGameData();
                        break;

                    case 'player_action':
                        // 模擬對手收到我的行動後的回應
                        mockWebSocket.simulateOpponentResponse(originalData);
                        break;

                    default:
                        break;
                }
            },

            // 新增：載入模擬遊戲資料
            loadMockGameData: () => {
                const mockGameData = {
                    game: {
                        id: gameId,
                        round: 1,
                        phase: 'action',
                        status: 'active',
                        geishas: {
                            geisha1: {id: 'geisha1', name: '春花', influence: {}, position: 1},
                            geisha2: {id: 'geisha2', name: '夏美', influence: {}, position: 2},
                            geisha3: {id: 'geisha3', name: '秋香', influence: {}, position: 3},
                            geisha4: {id: 'geisha4', name: '冬雪', influence: {}, position: 4},
                            geisha5: {id: 'geisha5', name: '梅花', influence: {}, position: 5}
                        },
                        messages: []
                    },
                    currentPlayer: {
                        id: 'player1',
                        name: '玩家1',
                        hand: [
                            {id: 'card1', value: 2, type: 'normal'},
                            {id: 'card2', value: 3, type: 'normal'},
                            {id: 'card3', value: 4, type: 'normal'},
                            {id: 'card4', value: 5, type: 'normal'},
                            {id: 'card5', value: 6, type: 'normal'},
                            {id: 'card6', value: 7, type: 'normal'}
                        ],
                        allocatedCards: {},
                        usedActions: [],
                        isMyTurn: true,
                        score: 0
                    },
                    opponent: {
                        id: 'player2',
                        name: '對手',
                        handCount: 6,
                        allocatedCards: {},
                        usedActions: [],
                        isMyTurn: false,
                        score: 0
                    }
                };

                // 使用 dispatch 設定遊戲資料
                dispatch(setGameData(mockGameData));
                console.log('🎮 遊戲資料載入完成');
            },

            simulateOpponentResponse: (myActionData: any) => {
                // 根據我的行動類型模擬對手的反應
                const {actionType} = myActionData;

                if (actionType === 'gift' || actionType === 'compete') {
                    // 模擬對手思考過程
                    handleOpponentAction({
                        type: actionType,
                        opponentId: opponent?.id
                    });

                    // 模擬對手選擇卡牌並執行行動
                    setTimeout(() => {
                        const mockResult = {
                            actionType,
                            receivedCards: [
                                {id: 'card1', value: 3, type: 'normal'},
                                {id: 'card2', value: 5, type: 'normal'}
                            ],
                            totalCards: 2,
                            opponentReceivedCount: 1
                        };
                        handleCardsReceived(mockResult);
                    }, 4000);
                }
            },

            // 模擬隨機的對手主動行動
            simulateRandomOpponentAction: () => {
                if (!mockWebSocket.connected) return;

                const randomActions = ['gift', 'compete', 'charm'];
                const randomAction = randomActions[Math.floor(Math.random() * randomActions.length)];

                console.log('🎭 對手發起行動:', randomAction);
                handleOpponentAction({
                    type: randomAction,
                    opponentId: opponent?.id
                });

                // 如果是需要我參與的行動
                if (randomAction === 'gift' || randomAction === 'compete') {
                    setTimeout(() => {
                        setOpponentActionStatus(prev => prev ? {
                            ...prev,
                            status: 'waiting_for_me'
                        } : null);
                    }, 2000);
                } else {
                    // 自動完成的行動
                    setTimeout(() => {
                        setOpponentActionStatus(null);
                        console.log('✅ 對手行動完成');
                    }, 3000);
                }
            }
        };

        // 處理對手行動過程
        const handleOpponentAction = (actionData: any) => {
            setOpponentActionStatus({
                isVisible: true,
                actionType: actionData.type,
                status: 'selecting',
                opponentName: opponent?.name || '對手'
            });

            console.log('👥 對手正在執行行動:', actionData.type);
        };

        // 處理獲得卡牌的通知
        const handleCardsReceived = (actionResult: any) => {
            setCardReceivedNotification({
                isOpen: true,
                actionType: actionResult.actionType,
                receivedCards: actionResult.receivedCards,
                opponentName: opponent?.name || '對手',
                actionDetails: {
                    totalCards: actionResult.totalCards,
                    opponentReceivedCount: actionResult.opponentReceivedCount
                }
            });

            // 隱藏對手行動狀態
            setOpponentActionStatus(null);
            console.log('🎁 收到卡牌:', actionResult.receivedCards.length, '張');
        };

        // 開始連線
        mockWebSocket.connect();

        // 設定定時器模擬對手隨機行動（僅用於測試）
        const opponentActionInterval = setInterval(() => {
            if (Math.random() > 0.7) { // 30% 機率對手發起行動
                mockWebSocket.simulateRandomOpponentAction();
            }
        }, 10000); // 每10秒檢查一次

        // 清理函數
        return () => {
            console.log('🔌 斷開 WebSocket 連線');
            setSocketConnected(false);
            clearInterval(opponentActionInterval);
        };

    }, [gameId, dispatch]);

    // 修改行動確認處理函數
    const handleActionConfirm = (actionData: any) => {
        dispatch(executeAction(actionData));
        console.log('🎯 執行行動:', actionData);

        // 通過模擬的 WebSocket 發送行動
        if (socketConnected) {
            // 這裡你可以存取上面建立的 mockWebSocket
            // 或者建立一個 ref 來儲存它
            console.log('📤 發送行動到伺服器');

            // 模擬發送延遲
            setTimeout(() => {
                // 這裡會觸發對手的回應流程
            }, 500);
        }
    };

    // 卡牌選擇處理
    const handleCardSelect = (cardId: string) => {
        dispatch(selectCard(cardId));
    };

    // 行動選擇處理
    const handleActionSelect = (action: ActionType) => {
        dispatch(selectAction(action));
    };

    // 行動取消處理
    const handleActionCancel = () => {
        dispatch(resetSelection());
    };

    if (loading || !game) {
        return (
            <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="xl">載入遊戲中...</Text>
            </Box>
        );
    }

    // 確定是否是當前玩家的回合
    const isMyTurn = currentPlayer?.isMyTurn || false;

    // 計算可用行動
    const availableActions: ActionType[] = currentPlayer?.usedActions
        ? Object.values(ActionType).filter(action => !currentPlayer.usedActions.includes(action))
        : Object.values(ActionType);

    // 獲取藝妓列表
    const geishas: Geisha[] = game.geishas ? Object.values(game.geishas) : [];

    return (
        <Box
            as="main"
            maxW="100%"
            p={{base: 2, md: 4}}
            minH="100vh"
            bg="gray.50"
        >
            {/* 遊戲狀態區域 */}
            <GameStatus
                currentPlayer={currentPlayer}
                opponent={opponent}
                isMyTurn={isMyTurn}
                round={game.round}
            />

            <GeishaInfluenceDisplay
                geishas={geishas}
                playerInfluence={currentPlayer?.allocatedCards}
                opponentInfluence={opponent?.allocatedCards}
                currentPlayerName={currentPlayer?.name}
                opponentName={opponent?.name}
            />

            {/* 如果是當前玩家的回合，顯示行動選擇區域 */}
            {isMyTurn && (
                <ActionSelection
                    availableActions={availableActions}
                    onActionSelect={handleActionSelect}
                    currentAction={currentAction}
                />
            )}

            {/* 手牌區域 */}
            <HandCards
                cards={currentPlayer?.hand || []}
                onCardSelect={handleCardSelect}
                selectedCards={selectedCards}
                disabled={!isMyTurn || !currentAction}
            />

            {/* 行動執行區域 - 根據當前選擇的行動顯示不同界面 */}
            {showActionArea && currentAction && (
                <ActionExecutionArea
                    actionType={currentAction}
                    selectedCards={selectedCards}
                    cards={currentPlayer?.hand || []}
                    onCancel={handleActionCancel}
                    onConfirm={handleActionConfirm}
                />
            )}

            {/* 對手行動狀態顯示 */}
            {opponentActionStatus?.isVisible && (
                <OpponentActionStatus
                    opponentName={opponentActionStatus.opponentName}
                    actionType={opponentActionStatus.actionType as any}
                    status={opponentActionStatus.status as any}
                />
            )}

            {/* 卡牌獲得通知 */}
            <CardReceivedNotification
                isOpen={cardReceivedNotification.isOpen}
                onClose={() => setCardReceivedNotification(prev => ({...prev, isOpen: false}))}
                actionType={cardReceivedNotification.actionType}
                receivedCards={cardReceivedNotification.receivedCards}
                opponentName={cardReceivedNotification.opponentName}
                actionDetails={cardReceivedNotification.actionDetails}
            />

            {/* 遊戲訊息區域 */}
            <GameMessages messages={game.messages || []}/>
        </Box>
    );
};

export default GamePage;
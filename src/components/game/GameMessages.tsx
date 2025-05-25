import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Badge,
    IconButton,
    Collapse,
    useDisclosure,
    Divider,
    Avatar,
    Flex,
    useBreakpointValue,
    Tooltip
} from '@chakra-ui/react';
import {
    ChevronUpIcon,
    ChevronDownIcon,
    InfoIcon,
    WarningIcon,
    CheckCircleIcon,
    TimeIcon
} from '@chakra-ui/icons';
import {GameMessage} from "../../models/game";

// 消息類型定義
export enum MessageType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
    GAME_EVENT = 'game_event',
    PLAYER_ACTION = 'player_action',
    SYSTEM = 'system'
}

interface GameMessagesProps {
    messages: GameMessage[];
    maxVisible?: number;
    showTimestamp?: boolean;
    autoScroll?: boolean;
    collapsible?: boolean;
}

const GameMessages: React.FC<GameMessagesProps> = ({
                                                       messages = [],
                                                       maxVisible = 5,
                                                       showTimestamp = true,
                                                       autoScroll = true,
                                                       collapsible = true
                                                   }) => {
    // 狀態管理
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
    const [visibleCount, setVisibleCount] = useState(maxVisible);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 響應式設計
    const isMobile = useBreakpointValue({ base: true, md: false });
    const messageHeight = useBreakpointValue({ base: '200px', md: '250px' });

    // 自動滾動到最新消息
    useEffect(() => {
        if (autoScroll && isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, autoScroll, isOpen]);

    // 獲取消息圖標
    const getMessageIcon = (type: MessageType) => {
        switch (type) {
            case MessageType.SUCCESS:
                return <CheckCircleIcon color="green.500" />;
            case MessageType.WARNING:
                return <WarningIcon color="orange.500" />;
            case MessageType.ERROR:
                return <WarningIcon color="red.500" />;
            case MessageType.GAME_EVENT:
                return <InfoIcon color="blue.500" />;
            case MessageType.PLAYER_ACTION:
                return <TimeIcon color="purple.500" />;
            default:
                return <InfoIcon color="gray.500" />;
        }
    };

    // 獲取消息顏色主題
    const getMessageColor = (type: MessageType) => {
        switch (type) {
            case MessageType.SUCCESS:
                return 'green';
            case MessageType.WARNING:
                return 'orange';
            case MessageType.ERROR:
                return 'red';
            case MessageType.GAME_EVENT:
                return 'blue';
            case MessageType.PLAYER_ACTION:
                return 'purple';
            default:
                return 'gray';
        }
    };

    // 格式化時間戳
    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // 獲取行動類型的中文名稱
    const getActionTypeName = (actionType?: string) => {
        switch (actionType) {
            case 'SECRET':
                return '秘密保留';
            case 'DISCARD':
                return '棄牌';
            case 'GIFT':
                return '獻禮';
            case 'COMPETE':
                return '競爭';
            default:
                return actionType || '';
        }
    };

    // 渲染單個消息
    const renderMessage = (message: GameMessage, index: number) => {
        const colorScheme = getMessageColor(message.type);
        const isPlayerMessage = message.type === MessageType.PLAYER_ACTION;

        return (
            <Box
                key={message.id}
                p={3}
                borderLeftWidth={4}
                borderLeftColor={`${colorScheme}.400`}
                bg={`${colorScheme}.50`}
                borderRadius="md"
                mb={2}
                transition="all 0.2s"
                _hover={{ bg: `${colorScheme}.100` }}
            >
                <Flex direction={isMobile ? 'column' : 'row'} align="start" gap={2}>
                    {/* 消息圖標和玩家信息 */}
                    <HStack spacing={2} minW={isMobile ? 'auto' : '120px'}>
                        {getMessageIcon(message.type)}
                        {isPlayerMessage && message.playerName && (
                            <Avatar size="xs" name={message.playerName} />
                        )}
                    </HStack>

                    {/* 消息內容 */}
                    <VStack align="start" spacing={1} flex={1}>
                        <HStack spacing={2} wrap="wrap">
                            {/* 玩家名稱 */}
                            {isPlayerMessage && message.playerName && (
                                <Badge colorScheme={colorScheme} variant="subtle">
                                    {message.playerName}
                                </Badge>
                            )}

                            {/* 行動類型 */}
                            {message.actionType && (
                                <Badge colorScheme="purple" variant="outline">
                                    {getActionTypeName(message.actionType)}
                                </Badge>
                            )}

                            {/* 時間戳 */}
                            {showTimestamp && (
                                <Text fontSize="xs" color="gray.500">
                                    {formatTimestamp(message.timestamp)}
                                </Text>
                            )}
                        </HStack>

                        {/* 消息文本 */}
                        <Text fontSize="sm" color="gray.700" lineHeight="1.4">
                            {message.text}
                        </Text>

                        {/* 詳細信息 */}
                        {message.details && (
                            <Box mt={1} p={2} bg="white" borderRadius="sm" fontSize="xs">
                                <Text color="gray.600">
                                    {typeof message.details === 'string'
                                        ? message.details
                                        : JSON.stringify(message.details, null, 2)
                                    }
                                </Text>
                            </Box>
                        )}
                    </VStack>
                </Flex>
            </Box>
        );
    };

    // 獲取顯示的消息
    const displayMessages = messages.slice(-visibleCount);
    const hasMoreMessages = messages.length > visibleCount;

    return (
        <Box
            bg="white"
            borderRadius="lg"
            shadow="md"
            overflow="hidden"
            borderWidth={1}
            borderColor="gray.200"
        >
            {/* 標題欄 */}
            <Flex
                justify="space-between"
                align="center"
                p={3}
                bg="gray.50"
                borderBottomWidth={1}
                borderColor="gray.200"
            >
                <HStack spacing={2}>
                    <Text fontWeight="bold" fontSize="md">
                        遊戲訊息
                    </Text>
                    <Badge colorScheme="blue" variant="subtle">
                        {messages.length}
                    </Badge>
                </HStack>

                <HStack spacing={1}>
                    {/* 顯示更多消息按鈕 */}
                    {hasMoreMessages && (
                        <Tooltip label="顯示更多消息">
                            <IconButton
                                aria-label="Show more messages"
                                icon={<ChevronUpIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={() => setVisibleCount(prev => Math.min(prev + 5, messages.length))}
                            />
                        </Tooltip>
                    )}

                    {/* 摺疊按鈕 */}
                    {collapsible && (
                        <Tooltip label={isOpen ? "摺疊訊息區" : "展開訊息區"}>
                            <IconButton
                                aria-label="Toggle messages"
                                icon={isOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={onToggle}
                            />
                        </Tooltip>
                    )}
                </HStack>
            </Flex>

            {/* 消息列表 */}
            <Collapse in={isOpen} animateOpacity>
                <Box
                    maxH={messageHeight}
                    overflowY="auto"
                    p={3}
                    css={{
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: '3px'
                        }
                    }}
                >
                    {displayMessages.length === 0 ? (
                        <Box textAlign="center" py={8}>
                            <Text color="gray.500" fontSize="sm">
                                還沒有遊戲訊息
                            </Text>
                        </Box>
                    ) : (
                        <VStack spacing={0} align="stretch">
                            {displayMessages.map((message, index) => renderMessage(message, index))}
                            <div ref={messagesEndRef} />
                        </VStack>
                    )}
                </Box>
            </Collapse>

            {/* 底部狀態欄 */}
            {isOpen && messages.length > 0 && (
                <>
                    <Divider />
                    <Flex justify="space-between" align="center" p={2} bg="gray.50" fontSize="xs">
                        <Text color="gray.600">
                            顯示 {displayMessages.length} / {messages.length} 條訊息
                        </Text>
                        {hasMoreMessages && (
                            <Text
                                color="blue.500"
                                cursor="pointer"
                                onClick={() => setVisibleCount(messages.length)}
                                _hover={{ textDecoration: 'underline' }}
                            >
                                顯示全部
                            </Text>
                        )}
                    </Flex>
                </>
            )}
        </Box>
    );
};

export default GameMessages;
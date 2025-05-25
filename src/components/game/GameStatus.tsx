import React from 'react';
import {
    Box,
    Flex,
    Text,
    Badge,
    VStack,
    HStack,
    Avatar,
    Progress,
    useBreakpointValue
} from '@chakra-ui/react';

interface Player {
    id: string;
    name: string;
    isMyTurn: boolean;
    hand?: any[];
    influenceCards?: { [geishaId: string]: any[] };
}

interface GameStatusProps {
    currentPlayer: Player | null;
    opponent: Player | null;
    isMyTurn: boolean;
    round: number;
}

const GameStatus: React.FC<GameStatusProps> = ({
                                                   currentPlayer,
                                                   opponent,
                                                   isMyTurn,
                                                   round
                                               }) => {
    // 響應式設計
    const isMobile = useBreakpointValue({ base: true, md: false });

    // 計算玩家統計
    const getPlayerStats = (player: Player | null) => {
        if (!player) return { handCount: 0, influenceCount: 0, charmTotal: 0 };

        const handCount = player.hand?.length || 0;
        const influenceCards = player.influenceCards || {};
        const influenceCount = Object.keys(influenceCards).filter(
            geishaId => influenceCards[geishaId]?.length > 0
        ).length;

        // 簡化的魅力值計算（實際應該根據藝妓數據計算）
        const charmTotal = influenceCount * 3; // 假設平均每個藝妓3點魅力

        return { handCount, influenceCount, charmTotal };
    };

    const currentPlayerStats = getPlayerStats(currentPlayer);
    const opponentStats = getPlayerStats(opponent);

    if (isMobile) {
        // 移動設備上的緊湊布局
        return (
            <Box
                bg="white"
                p={3}
                borderRadius="md"
                shadow="sm"
                mb={3}
                borderWidth={1}
                borderColor={isMyTurn ? "blue.200" : "gray.200"}
            >
                <Flex justify="space-between" align="center" mb={2}>
                    <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="lg" color={isMyTurn ? "blue.600" : "gray.600"}>
                            {currentPlayer?.name || "玩家1"}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            手牌: {currentPlayerStats.handCount} | 影響: {currentPlayerStats.influenceCount}
                        </Text>
                    </VStack>

                    <VStack align="end" spacing={1}>
                        <Text fontSize="sm" fontWeight="bold">回合: {round}</Text>
                        <Badge
                            colorScheme={isMyTurn ? "green" : "orange"}
                            px={2}
                            py={1}
                        >
                            {isMyTurn ? "您的回合" : "對手回合"}
                        </Badge>
                    </VStack>
                </Flex>

                {/* 對手信息（簡化） */}
                <Flex justify="space-between" align="center" pt={2} borderTopWidth={1} borderColor="gray.100">
                    <Text fontSize="sm" color="gray.600">
                        對手: {opponent?.name || "玩家2"}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        影響: {opponentStats.influenceCount} 藝妓
                    </Text>
                </Flex>
            </Box>
        );
    }

    // 桌面設備上的詳細布局
    return (
        <Box
            bg="white"
            p={4}
            borderRadius="lg"
            shadow="md"
            mb={4}
            borderWidth={2}
            borderColor={isMyTurn ? "blue.300" : "gray.200"}
        >
            <Flex justify="space-between" align="center" mb={3}>
                <Text fontSize="xl" fontWeight="bold" color="gray.700">
                    花見小路 - 回合 {round}
                </Text>
                <Badge
                    colorScheme={isMyTurn ? "green" : "orange"}
                    fontSize="md"
                    px={3}
                    py={1}
                    borderRadius="full"
                >
                    {isMyTurn ? "您的回合" : "等待對手"}
                </Badge>
            </Flex>

            <Flex justify="space-between" align="center">
                {/* 當前玩家信息 */}
                <VStack align="start" spacing={2} flex={1}>
                    <HStack spacing={3}>
                        <Avatar
                            size="sm"
                            name={currentPlayer?.name || "Player 1"}
                            bg={isMyTurn ? "blue.500" : "gray.400"}
                        />
                        <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" color={isMyTurn ? "blue.600" : "gray.600"}>
                                {currentPlayer?.name || "玩家1"} (您)
                            </Text>
                            <HStack spacing={4}>
                                <Text fontSize="sm" color="gray.600">
                                    手牌: {currentPlayerStats.handCount}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    影響: {currentPlayerStats.influenceCount} 藝妓
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    魅力: {currentPlayerStats.charmTotal}
                                </Text>
                            </HStack>
                        </VStack>
                    </HStack>

                    {/* 勝利進度條 */}
                    <Box width="200px">
                        <Text fontSize="xs" color="gray.500" mb={1}>勝利進度</Text>
                        <Progress
                            value={(currentPlayerStats.influenceCount / 4) * 100}
                            colorScheme="blue"
                            size="sm"
                            borderRadius="full"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                            需要 4 位藝妓青睞或 11 點魅力值
                        </Text>
                    </Box>
                </VStack>

                {/* VS 分隔符 */}
                <Box mx={6}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.400">VS</Text>
                </Box>

                {/* 對手信息 */}
                <VStack align="end" spacing={2} flex={1}>
                    <HStack spacing={3}>
                        <VStack align="end" spacing={0}>
                            <Text fontWeight="bold" color="red.600">
                                {opponent?.name || "玩家2"} (對手)
                            </Text>
                            <HStack spacing={4}>
                                <Text fontSize="sm" color="gray.600">
                                    影響: {opponentStats.influenceCount} 藝妓
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    魅力: {opponentStats.charmTotal}
                                </Text>
                            </HStack>
                        </VStack>
                        <Avatar
                            size="sm"
                            name={opponent?.name || "Player 2"}
                            bg="red.500"
                        />
                    </HStack>

                    {/* 對手勝利進度條 */}
                    <Box width="200px">
                        <Text fontSize="xs" color="gray.500" mb={1} textAlign="right">對手進度</Text>
                        <Progress
                            value={(opponentStats.influenceCount / 4) * 100}
                            colorScheme="red"
                            size="sm"
                            borderRadius="full"
                        />
                    </Box>
                </VStack>
            </Flex>
        </Box>
    );
};

export default GameStatus;
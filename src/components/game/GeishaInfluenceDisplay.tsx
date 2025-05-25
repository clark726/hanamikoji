import React from 'react';
import {Badge, Box, Flex, HStack, Text, useBreakpointValue, VStack} from '@chakra-ui/react';
import {Card, Geisha} from "../../models/game";

interface GeishaInfluenceDisplayProps {
    geishas: Geisha[];
    playerInfluence: { [geishaId: string]: Card[] } | undefined;
    opponentInfluence: { [geishaId: string]: Card[] } | undefined;
    currentPlayerName?: string;
    opponentName?: string;
}

const GeishaInfluenceDisplay: React.FC<GeishaInfluenceDisplayProps> = ({
                                                                           geishas,
                                                                           playerInfluence = {},
                                                                           opponentInfluence = {},
                                                                           currentPlayerName = "我",
                                                                           opponentName = "對手"
                                                                       }) => {
    const cardWidth = useBreakpointValue({ base: '160px', md: '180px' });
    const cardHeight = useBreakpointValue({ base: '300px', md: '350px' });
    const handCardSize = useBreakpointValue({
        base: { width: '45px', height: '65px' },
        md: { width: '50px', height: '72px' }
    });

    // 計算總勝利狀況
    const getVictoryStatus = () => {
        let playerGeishaCount = 0;
        let opponentGeishaCount = 0;
        let playerCharmTotal = 0;
        let opponentCharmTotal = 0;

        geishas.forEach(geisha => {
            const playerCards = playerInfluence[geisha.id]?.length || 0;
            const opponentCards = opponentInfluence[geisha.id]?.length || 0;

            if (playerCards > opponentCards) {
                playerGeishaCount++;
                playerCharmTotal += geisha.charm;
            } else if (opponentCards > playerCards) {
                opponentGeishaCount++;
                opponentCharmTotal += geisha.charm;
            }
        });

        return { playerGeishaCount, opponentGeishaCount, playerCharmTotal, opponentCharmTotal };
    };

    const { playerGeishaCount, opponentGeishaCount, playerCharmTotal, opponentCharmTotal } = getVictoryStatus();

    // 渲染手牌卡片
    const renderHandCard = (card: Card, isPlayer: boolean, index: number) => (
        <Box
            key={`${card.id}-${index}`}
            width={handCardSize?.width}
            height={handCardSize?.height}
            borderRadius="md"
            border="2px solid"
            borderColor={isPlayer ? "blue.400" : "red.400"}
            bg="white"
            boxShadow="md"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
            p={1}
            mx={1}
            position="relative"
            overflow="hidden"
            transition="all 0.2s"
            _hover={{ transform: 'scale(1.05)', zIndex: 10 }}
        >
            {/* 卡牌背景圖案 */}
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient={isPlayer ? "linear(to-br, blue.50, blue.100)" : "linear(to-br, red.50, red.100)"}
                opacity={0.3}
            />

            {/* 卡牌內容 */}
            <VStack spacing={0} zIndex={1} height="100%" justify="space-between">
                <Text fontSize="xs" fontWeight="bold" color="gray.700" textAlign="center">
                    {card.geishaName}
                </Text>

                {/* 模擬的卡牌圖像區域 */}
                <Box
                    width="80%"
                    height="60%"
                    bg="gray.200"
                    borderRadius="sm"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="1px solid"
                    borderColor="gray.300"
                >
                    <Text fontSize="xs" color="gray.500">圖</Text>
                </Box>

                <Badge
                    colorScheme={isPlayer ? "blue" : "red"}
                    fontSize="xx-small"
                    px={1}
                >
                    {isPlayer ? "我" : "對"}
                </Badge>
            </VStack>
        </Box>
    );

    // 渲染空白卡位（用於佔位）
    const renderEmptySlot = (isPlayer: boolean, index: number) => (
        <Box
            key={`empty-${isPlayer ? 'player' : 'opponent'}-${index}`}
            width={handCardSize?.width}
            height={handCardSize?.height}
            borderRadius="md"
            border="2px dashed"
            borderColor={isPlayer ? "blue.200" : "red.200"}
            bg={isPlayer ? "blue.25" : "red.25"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx={1}
            opacity={0.5}
        >
            <Text fontSize="xs" color="gray.400">空位</Text>
        </Box>
    );

    // 渲染單個藝妓區域
    const renderGeishaArea = (geisha: Geisha) => {
        const playerCards = playerInfluence[geisha.id] || [];
        const opponentCards = opponentInfluence[geisha.id] || [];
        const hasPlayerAdvantage = playerCards.length > opponentCards.length;
        const hasOpponentAdvantage = opponentCards.length > playerCards.length;

        // 為了整齊顯示，確保每個區域顯示相同數量的卡位（最多5張）
        const maxCards = 5;
        const playerDisplayCards = [...playerCards];
        const opponentDisplayCards = [...opponentCards];

        // 補充空位
        while (playerDisplayCards.length < Math.min(maxCards, Math.max(playerCards.length, 2))) {
            playerDisplayCards.push({ id: `empty-${playerDisplayCards.length}`, geishaId: geisha.id, geishaName: '' } as Card);
        }
        while (opponentDisplayCards.length < Math.min(maxCards, Math.max(opponentCards.length, 2))) {
            opponentDisplayCards.push({ id: `empty-${opponentDisplayCards.length}`, geishaId: geisha.id, geishaName: '' } as Card);
        }

        return (
            <Box
                key={geisha.id}
                width={cardWidth}
                height={cardHeight}
                flex="0 0 auto"
                borderRadius="xl"
                border="3px solid"
                borderColor={
                    hasPlayerAdvantage ? "blue.400" :
                        hasOpponentAdvantage ? "red.400" :
                            "gray.300"
                }
                bg="white"
                boxShadow="lg"
                mx={3}
                position="relative"
                overflow="hidden"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
            >
                {/* 背景效果 */}
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bgGradient={
                        hasPlayerAdvantage ? "linear(to-b, blue.25, transparent, blue.25)" :
                            hasOpponentAdvantage ? "linear(to-b, red.25, transparent, red.25)" :
                                "linear(to-b, gray.25, transparent, gray.25)"
                    }
                />

                {/* 對手手牌區域 - 頂部 */}
                <VStack spacing={2} p={3} position="relative" zIndex={1}>
                    <HStack spacing={1} align="center">
                        <Text fontSize="xs" fontWeight="bold" color="red.600">
                            {opponentName}
                        </Text>
                        <Badge colorScheme="red" fontSize="xs">
                            {opponentCards.length}
                        </Badge>
                    </HStack>

                    <Flex justify="center" wrap="wrap" gap={1} maxW="100%">
                        {opponentDisplayCards.slice(0, maxCards).map((card, index) =>
                            card.geishaName ?
                                renderHandCard(card, false, index) :
                                renderEmptySlot(false, index)
                        )}
                    </Flex>
                </VStack>

                {/* 藝妓主卡 - 中央 */}
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    zIndex={2}
                >
                    <VStack spacing={2}>
                        <Box
                            width="110px"
                            height="150px"
                            borderRadius="lg"
                            border="3px solid"
                            borderColor="purple.400"
                            bg="white"
                            boxShadow="xl"
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="space-between"
                            p={3}
                            position="relative"
                            overflow="hidden"
                        >
                            {/* 藝妓卡牌背景 */}
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                bgGradient="linear(to-br, purple.50, pink.50)"
                                opacity={0.3}
                            />

                            <VStack spacing={1} zIndex={1} height="100%" justify="space-between">
                                <Text fontSize="sm" fontWeight="bold" textAlign="center" color="gray.700">
                                    {geisha.name}
                                </Text>

                                {/* 模擬藝妓圖像 */}
                                <Box
                                    width="70px"
                                    height="80px"
                                    bg="purple.100"
                                    borderRadius="md"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    border="2px solid"
                                    borderColor="purple.200"
                                >
                                    <Text fontSize="xs" color="purple.500">藝妓圖</Text>
                                </Box>

                                <VStack spacing={1}>
                                    <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                                        {geisha.charm}
                                    </Text>
                                    <Badge
                                        colorScheme={
                                            hasPlayerAdvantage ? "blue" :
                                                hasOpponentAdvantage ? "red" :
                                                    "gray"
                                        }
                                        fontSize="xs"
                                        px={2}
                                    >
                                        {hasPlayerAdvantage ? currentPlayerName :
                                            hasOpponentAdvantage ? opponentName :
                                                "中立"}
                                    </Badge>
                                </VStack>
                            </VStack>
                        </Box>

                        {/* 分數對比 */}
                        <HStack spacing={2} bg="white" px={3} py={1} borderRadius="full" boxShadow="md" border="1px solid" borderColor="gray.200">
                            <Text fontSize="sm" color="blue.600" fontWeight="bold">
                                {playerCards.length}
                            </Text>
                            <Text fontSize="sm" color="gray.400">vs</Text>
                            <Text fontSize="sm" color="red.600" fontWeight="bold">
                                {opponentCards.length}
                            </Text>
                        </HStack>
                    </VStack>
                </Box>

                {/* 玩家手牌區域 - 底部 */}
                <VStack spacing={2} p={3} position="absolute" bottom={0} left={0} right={0} zIndex={1}>
                    <Flex justify="center" wrap="wrap" gap={1} maxW="100%">
                        {playerDisplayCards.slice(0, maxCards).map((card, index) =>
                            card.geishaName ?
                                renderHandCard(card, true, index) :
                                renderEmptySlot(true, index)
                        )}
                    </Flex>

                    <HStack spacing={1} align="center">
                        <Text fontSize="xs" fontWeight="bold" color="blue.600">
                            {currentPlayerName}
                        </Text>
                        <Badge colorScheme="blue" fontSize="xs">
                            {playerCards.length}
                        </Badge>
                    </HStack>
                </VStack>
            </Box>
        );
    };

    return (
        <Box width="100%" mb={6}>
            {/* 標題和總體狀況 */}
            <Flex justify="space-between" align="center" mb={4} px={4}>
                <Text fontSize="xl" fontWeight="bold" color="gray.700">
                    🎌 藝妓與禮物卡
                </Text>
                <HStack spacing={4}>
                    <VStack spacing={0}>
                        <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                            {currentPlayerName}: {playerGeishaCount}位
                        </Badge>
                        <Text fontSize="xs" color="blue.600">{playerCharmTotal} 魅力</Text>
                    </VStack>
                    <Text fontSize="lg" color="gray.400" fontWeight="bold">VS</Text>
                    <VStack spacing={0}>
                        <Badge colorScheme="red" fontSize="sm" px={3} py={1}>
                            {opponentName}: {opponentGeishaCount}位
                        </Badge>
                        <Text fontSize="xs" color="red.600">{opponentCharmTotal} 魅力</Text>
                    </VStack>
                </HStack>
            </Flex>

            {/* 橫向滑動的藝妓區域 */}
            <Box
                width="100%"
                overflowX="auto"
                py={4}
                css={{
                    '&::-webkit-scrollbar': {
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'rgba(0,0,0,0.1)',
                        borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: 'rgba(0,0,0,0.5)',
                    },
                }}
            >
                <Flex pl={4} pr={4}>
                    {geishas.map(geisha => renderGeishaArea(geisha))}
                </Flex>
            </Box>

            {/* 勝利條件和滑動提示 */}
            <VStack spacing={2} px={4}>
                <Box bg="purple.50" border="1px solid" borderColor="purple.200" p={3} borderRadius="lg" width="100%">
                    <Text fontSize="sm" color="purple.700" textAlign="center" fontWeight="medium">
                        🏆 獲勝條件：獲得 4 位藝妓青睞 或 達到 11 點魅力值
                    </Text>
                </Box>

                <Text fontSize="xs" color="gray.500" textAlign="center">
                    👈 👉 左右滑動查看所有藝妓的禮物卡分配
                </Text>
            </VStack>
        </Box>
    );
};

export default GeishaInfluenceDisplay;
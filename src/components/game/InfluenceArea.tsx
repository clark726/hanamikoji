import React from 'react';
import {Badge, Box, Flex, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useBreakpointValue} from '@chakra-ui/react';
import {Card, Geisha} from '../../models/game';

interface InfluenceAreaProps {
    playerInfluence: { [geishaId: string]: Card[] } | undefined;
    opponentInfluence: { [geishaId: string]: Card[] } | undefined;
    geishas: Geisha[];
}

const InfluenceArea: React.FC<InfluenceAreaProps> = ({
                                                         playerInfluence,
                                                         opponentInfluence,
                                                         geishas
                                                     }) => {
    // 移動設備上使用標籤，桌面上並排顯示
    const displayMode = useBreakpointValue({base: 'tabs', md: 'split'});

    // 獲取藝妓對應的影響卡牌數量
    const getInfluenceCount = (geishaId: string, influence: { [key: string]: Card[] } | undefined) => {
        return influence && influence[geishaId] ? influence[geishaId].length : 0;
    };

    // 獲取藝妓名稱
    const getGeishaName = (geishaId: string) => {
        const geisha = geishas.find(g => g.id === geishaId);
        return geisha ? geisha.name : 'Unknown';
    };

    // 獲取藝妓魅力值
    const getGeishaCharm = (geishaId: string) => {
        const geisha = geishas.find(g => g.id === geishaId);
        return geisha ? geisha.charm : 0;
    };

    // 計算總影響力
    const calculateTotalInfluence = (influence: { [key: string]: Card[] } | undefined) => {
        if (!influence) return {geishaCount: 0, charmTotal: 0};

        let geishaCount = 0;
        let charmTotal = 0;

        Object.entries(influence).forEach(([geishaId, cards]) => {
            // 只在有卡牌且對手沒有更多卡牌時算入影響力
            const opponentCards = opponentInfluence && opponentInfluence[geishaId] ? opponentInfluence[geishaId].length : 0;
            const playerCards = cards.length;

            if (playerCards > 0 && playerCards > opponentCards) {
                geishaCount++;
                charmTotal += getGeishaCharm(geishaId);
            }
        });

        return {geishaCount, charmTotal};
    };

    const playerInfluenceData = calculateTotalInfluence(playerInfluence);
    const opponentInfluenceData = calculateTotalInfluence(opponentInfluence);

    // 渲染影響力卡片
    const renderInfluenceCards = (influence: { [key: string]: Card[] } | undefined, isPlayer: boolean) => (
        <Flex flexWrap="wrap" gap={2} justify="center">
            {geishas.map(geisha => {
                const count = getInfluenceCount(geisha.id, influence);
                const opponentCount = isPlayer
                    ? getInfluenceCount(geisha.id, opponentInfluence)
                    : getInfluenceCount(geisha.id, playerInfluence);

                // 確定是否擁有青睞
                const hasFavor = count > opponentCount;

                return (
                    <Box
                        key={geisha.id}
                        width={{base: '30%', md: '120px'}}
                        p={2}
                        borderWidth={1}
                        borderColor={hasFavor ? (isPlayer ? 'blue.300' : 'red.300') : 'gray.200'}
                        borderRadius="md"
                        bg={hasFavor ? (isPlayer ? 'blue.50' : 'red.50') : 'white'}
                        boxShadow={hasFavor ? 'md' : 'sm'}
                        textAlign="center"
                    >
                        <Text fontSize="sm" fontWeight="bold" mb={1}>{geisha.name}</Text>
                        <Flex justify="center" align="center" mb={1}>
                            <Badge colorScheme={isPlayer ? 'blue' : 'red'} mr={1}>
                                {count}
                            </Badge>
                            <Text fontSize="xs">/ {geisha.charm}</Text>
                        </Flex>
                        {hasFavor && (
                            <Badge colorScheme={isPlayer ? 'blue' : 'red'} variant="solid" borderRadius="full" px={2}>
                                青睞
                            </Badge>
                        )}
                    </Box>
                );
            })}
        </Flex>
    );

    // 渲染移動設備上的標籤式布局
    if (displayMode === 'tabs') {
        return (
            <Box width="100%" mb={4}>
                <Tabs isFitted variant="enclosed" colorScheme="purple">
                    <TabList>
                        <Tabs _selected={{color: 'purple.500', borderColor: 'purple.500'}}>
                            我的影響 ({playerInfluenceData.geishaCount}/{playerInfluenceData.charmTotal})
                        </Tabs>
                        <Tab _selected={{color: 'purple.500', borderColor: 'purple.500'}}>
                            對手影響 ({opponentInfluenceData.geishaCount}/{opponentInfluenceData.charmTotal})
                        </Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            {renderInfluenceCards(playerInfluence, true)}
                        </TabPanel>
                        <TabPanel>
                            {renderInfluenceCards(opponentInfluence, false)}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        );
    }

    // 渲染桌面上的分割式布局
    return (
        <Box width="100%" mb={4}>
            <Text fontWeight="bold" fontSize="lg" mb={2}>影響區</Text>

            <Flex direction={{base: 'column', md: 'row'}} gap={4}>
                <Box flex={1} borderWidth={1} borderColor="blue.200" borderRadius="md" p={3} bg="blue.50">
                    <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="bold" color="blue.700">我的影響</Text>
                        <Badge colorScheme="blue">
                            {playerInfluenceData.geishaCount} 藝妓 / {playerInfluenceData.charmTotal} 魅力
                        </Badge>
                    </Flex>
                    {renderInfluenceCards(playerInfluence, true)}
                </Box>

                <Box flex={1} borderWidth={1} borderColor="red.200" borderRadius="md" p={3} bg="red.50">
                    <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="bold" color="red.700">對手影響</Text>
                        <Badge colorScheme="red">
                            {opponentInfluenceData.geishaCount} 藝妓 / {opponentInfluenceData.charmTotal} 魅力
                        </Badge>
                    </Flex>
                    {renderInfluenceCards(opponentInfluence, false)}
                </Box>
            </Flex>
        </Box>
    );
};

export default InfluenceArea;
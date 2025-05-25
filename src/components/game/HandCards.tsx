import React from 'react';
import { Box, Flex, Text, Image, useBreakpointValue } from '@chakra-ui/react';
import { Card } from '../../models/game';

interface HandCardsProps {
    cards: Card[];
    selectedCards: string[];
    onCardSelect: (cardId: string) => void;
    disabled?: boolean;
}

const HandCards: React.FC<HandCardsProps> = ({
                                                 cards,
                                                 selectedCards,
                                                 onCardSelect,
                                                 disabled = false
                                             }) => {
    // 根據屏幕大小調整卡牌尺寸
    const cardSize = useBreakpointValue({
        base: { width: '70px', height: '100px' },
        md: { width: '90px', height: '130px' }
    });

    return (
        <Box width="100%" mb={4}>
            <Text fontWeight="bold" fontSize="lg" mb={2}>
                我的手牌 ({cards.length})
            </Text>

            <Flex
                overflowX="auto"
                py={2}
                css={{
                    '&::-webkit-scrollbar': { height: '8px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px' }
                }}
            >
                {cards.map(card => (
                    <Box
                        key={card.id}
                        width={cardSize?.width}
                        height={cardSize?.height}
                        borderWidth="2px"
                        borderColor={selectedCards.includes(card.id) ? 'purple.500' : 'gray.200'}
                        borderRadius="md"
                        p={2}
                        mx={1}
                        bg="white"
                        boxShadow={selectedCards.includes(card.id) ? 'lg' : 'md'}
                        flex="0 0 auto"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="space-between"
                        onClick={() => !disabled && onCardSelect(card.id)}
                        cursor={disabled ? 'not-allowed' : 'pointer'}
                        opacity={disabled ? 0.7 : 1}
                        transform={selectedCards.includes(card.id) ? 'translateY(-10px)' : 'none'}
                        transition="all 0.2s"
                        position="relative"
                        _hover={!disabled ? {
                            transform: selectedCards.includes(card.id) ? 'translateY(-10px)' : 'translateY(-5px)',
                            boxShadow: 'xl'
                        } : {}}
                    >
                        {/* 卡牌圖像或圖標 */}
                        <Box
                            width="100%"
                            height="60%"
                            borderRadius="sm"
                            bg="gray.100"
                            mb={2}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            {/* 可以使用實際圖像 */}
                            <Text fontSize="sm">藝妓圖像</Text>
                        </Box>

                        {/* 卡牌信息 */}
                        <Text fontSize="xs" fontWeight="bold" textAlign="center">
                            藝妓名稱
                        </Text>

                        {/* 選中標記 */}
                        {selectedCards.includes(card.id) && (
                            <Box
                                position="absolute"
                                top="-5px"
                                right="-5px"
                                borderRadius="full"
                                bg="purple.500"
                                color="white"
                                width="20px"
                                height="20px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="xs"
                                fontWeight="bold"
                            >
                                {selectedCards.indexOf(card.id) + 1}
                            </Box>
                        )}
                    </Box>
                ))}
            </Flex>
        </Box>
    );
};

export default HandCards;
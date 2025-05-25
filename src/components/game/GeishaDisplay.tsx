import React from 'react';
import {Box, Flex, Text, Badge, useBreakpointValue} from '@chakra-ui/react';
import {Geisha, FavorStatus} from '../../models/game';

interface GeishaDisplayProps {
    geishas: Geisha[];
}

const GeishaDisplay: React.FC<GeishaDisplayProps> = ({geishas}) => {
    // 根據屏幕大小調整卡牌尺寸
    const cardSize = useBreakpointValue({
        base: {width: '80px', height: '120px'},
        md: {width: '100px', height: '150px'}
    });

    // 處理青睞狀態顯示
    const getFavorDisplay = (favor: FavorStatus) => {
        switch (favor) {
            case FavorStatus.PLAYER1:
                return {color: 'blue', text: '我的青睞'};
            case FavorStatus.PLAYER2:
                return {color: 'red', text: '對手青睞'};
            default:
                return {color: 'gray', text: '中立'};
        }
    };

    return (
        <Box width="100%" mb={4}>
            <Text fontWeight="bold" fontSize="lg" mb={2}>藝妓</Text>

            <Flex
                overflowX="auto"
                py={2}
                justifyContent={{base: 'flex-start', md: 'center'}}
                css={{
                    '&::-webkit-scrollbar': {height: '8px'},
                    '&::-webkit-scrollbar-thumb': {backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px'}
                }}
            >
                {geishas.map(geisha => {
                    const {color, text} = getFavorDisplay(geisha.favor);

                    return (
                        <Box
                            key={geisha.id}
                            width={cardSize?.width}
                            height={cardSize?.height}
                            borderWidth="2px"
                            borderColor={color}
                            borderRadius="md"
                            p={2}
                            mx={1}
                            bg="white"
                            boxShadow="md"
                            flex="0 0 auto"
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="space-between"
                            transition="transform 0.2s"
                        >
                            <Text fontWeight="bold" fontSize={{base: 'sm', md: 'md'}}>{geisha.name}</Text>

                            <Text
                                fontSize={{base: '2xl', md: '3xl'}}
                                fontWeight="bold"
                                color={`${color}.500`}
                            >
                                {geisha.charm}
                            </Text>

                            <Badge
                                colorScheme={color === 'gray' ? 'gray' : color === 'blue' ? 'blue' : 'red'}
                                px={2}
                                py={1}
                                borderRadius="full"
                                fontSize={{base: 'xs', md: 'sm'}}
                            >
                                {text}
                            </Badge>
                        </Box>
                    );
                })}
            </Flex>
        </Box>
    );
};

export default GeishaDisplay;
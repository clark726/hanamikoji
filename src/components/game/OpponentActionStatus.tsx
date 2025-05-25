import React from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Spinner,
    Badge,
    Progress,
    useBreakpointValue
} from '@chakra-ui/react';

interface OpponentActionStatusProps {
    opponentName: string;
    actionType: 'secret' | 'discard' | 'gift' | 'compete';
    status: 'selecting' | 'waiting_for_me' | 'completed';
    selectedCards?: number;
    totalCards?: number;
}

const OpponentActionStatus: React.FC<OpponentActionStatusProps> = ({
                                                                       opponentName,
                                                                       actionType,
                                                                       status,
                                                                       selectedCards = 0,
                                                                       totalCards = 0
                                                                   }) => {
    const isMobile = useBreakpointValue({ base: true, md: false });

    const getActionInfo = () => {
        switch (actionType) {
            case 'secret':
                return { name: '秘密保留', icon: '🤫', color: 'teal' };
            case 'discard':
                return { name: '棄牌', icon: '🗑️', color: 'red' };
            case 'gift':
                return { name: '獻禮', icon: '🎁', color: 'purple' };
            case 'compete':
                return { name: '競爭', icon: '⚔️', color: 'orange' };
            default:
                return { name: '行動', icon: '📋', color: 'gray' };
        }
    };

    const getStatusInfo = () => {
        switch (status) {
            case 'selecting':
                return { text: '正在選擇卡牌...', color: 'blue' };
            case 'waiting_for_me':
                return { text: '等待您的選擇', color: 'yellow' };
            case 'completed':
                return { text: '行動完成', color: 'green' };
            default:
                return { text: '處理中...', color: 'gray' };
        }
    };

    const actionInfo = getActionInfo();
    const statusInfo = getStatusInfo();

    return (
        <Box
            bg="white"
            border="2px solid"
            borderColor={`${actionInfo.color}.200`}
            borderRadius="xl"
            p={4}
            mb={4}
            boxShadow="lg"
            position="relative"
            overflow="hidden"
        >
            {/* 背景動畫效果 */}
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                height="4px"
                bg={`${actionInfo.color}.100`}
            >
                {status === 'selecting' && (
                    <Box
                        height="100%"
                        bg={`${actionInfo.color}.400`}
                        animation="loading 2s ease-in-out infinite"
                        borderRadius="full"
                    />
                )}
            </Box>

            <VStack spacing={3} align="stretch">
                {/* 標題行 */}
                <HStack justify="space-between" align="center">
                    <HStack spacing={2}>
                        <Text fontSize="2xl">{actionInfo.icon}</Text>
                        <VStack align="start" spacing={0}>
                            <Text fontSize="lg" fontWeight="bold" color={`${actionInfo.color}.700`}>
                                {opponentName} 的{actionInfo.name}
                            </Text>
                            <Badge colorScheme={statusInfo.color} variant="subtle">
                                {statusInfo.text}
                            </Badge>
                        </VStack>
                    </HStack>

                    {status === 'selecting' && <Spinner color={`${actionInfo.color}.500`} />}
                </HStack>

                {/* 進度顯示 */}
                {totalCards > 0 && status === 'selecting' && (
                    <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">選擇進度</Text>
                            <Text fontSize="sm" fontWeight="bold">
                                {selectedCards} / {totalCards}
                            </Text>
                        </HStack>
                        <Progress
                            value={(selectedCards / totalCards) * 100}
                            colorScheme={actionInfo.color}
                            borderRadius="full"
                            bg="gray.100"
                        />
                    </VStack>
                )}

                {/* 等待我選擇的提示 */}
                {status === 'waiting_for_me' && (
                    <Box
                        bg="yellow.50"
                        border="1px solid"
                        borderColor="yellow.200"
                        p={3}
                        borderRadius="md"
                    >
                        <Text fontSize="sm" color="yellow.800" textAlign="center" fontWeight="medium">
                            🔄 {opponentName} 已完成選擇，現在輪到您做決定
                        </Text>
                    </Box>
                )}
            </VStack>


        </Box>
    );
};

export default OpponentActionStatus;
import React, {useEffect, useState} from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Box,
    Text,
    HStack,
    VStack,
    Badge,
    Flex,
    useDisclosure
} from '@chakra-ui/react';
import {Card} from "../../models/game";

interface CardReceivedNotificationProps {
    isOpen: boolean;
    onClose: () => void;
    actionType: 'gift' | 'compete';
    receivedCards: Card[];
    opponentName: string;
    actionDetails?: {
        totalCards: number;
        opponentReceivedCount: number;
    };
}

const CardReceivedNotification: React.FC<CardReceivedNotificationProps> = ({
                                                                               isOpen,
                                                                               onClose,
                                                                               actionType,
                                                                               receivedCards,
                                                                               opponentName,
                                                                               actionDetails
                                                                           }) => {
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setShowAnimation(true), 100);
        } else {
            setShowAnimation(false);
        }
    }, [isOpen]);

    const getActionTitle = () => {
        switch (actionType) {
            case 'gift':
                return '🎁 獲得獻禮卡牌';
            case 'compete':
                return '⚔️ 競爭結果';
            default:
                return '📋 獲得卡牌';
        }
    };

    const getActionDescription = () => {
        switch (actionType) {
            case 'gift':
                return `${opponentName} 進行了獻禮行動，您獲得了以下卡牌：`;
            case 'compete':
                return `${opponentName} 進行了競爭行動，您獲得了以下卡牌：`;
            default:
                return `您獲得了以下卡牌：`;
        }
    };

    // 渲染單張卡牌
    const renderCard = (card: Card, index: number) => (
        <Box
            key={card.id}
            width="80px"
            height="120px"
            borderRadius="lg"
            border="3px solid"
            borderColor="blue.400"
            bg="white"
            boxShadow="xl"
            p={2}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
            transform={showAnimation ? `translateY(0) scale(1)` : `translateY(20px) scale(0.8)`}
            opacity={showAnimation ? 1 : 0}
            transition={`all 0.5s ease ${index * 0.1}s`}
            position="relative"
            _before={{
                content: '""',
                position: 'absolute',
                top: '-5px',
                left: '-5px',
                right: '-5px',
                bottom: '-5px',
                borderRadius: 'lg',
                background: 'linear-gradient(45deg, #3182ce, #63b3ed)',
                zIndex: -1,
                animation: showAnimation ? 'pulse 2s infinite' : 'none'
            }}
        >
            {/* 新卡牌標記 */}
            <Badge
                position="absolute"
                top="-8px"
                right="-8px"
                colorScheme="green"
                borderRadius="full"
                fontSize="xs"
                px={2}
                py={1}
                zIndex={2}
            >
                NEW
            </Badge>

            {/* 卡牌圖像區域 */}
            <Box
                width="100%"
                height="60%"
                bg="purple.100"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={1}
            >
                <Text fontSize="xs" color="purple.600">
                    {card.geishaName}
                </Text>
            </Box>

            {/* 卡牌名稱 */}
            <Text fontSize="xs" fontWeight="bold" textAlign="center" color="gray.700">
                {card.geishaName}
            </Text>

            {/* 藝妓標識 */}
            <Badge colorScheme="purple" fontSize="xx-small">
                禮物卡
            </Badge>
        </Box>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            closeOnOverlayClick={false}
            isCentered
        >
            <ModalOverlay bg="blackAlpha.600"/>
            <ModalContent bg="gradient-to-br from-blue.50 to-purple.50" borderRadius="xl">
                <ModalHeader textAlign="center" pb={2}>
                    <VStack spacing={2}>
                        <Text fontSize="xl" fontWeight="bold" color="blue.700">
                            {getActionTitle()}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            {getActionDescription()}
                        </Text>
                    </VStack>
                </ModalHeader>

                <ModalBody py={4}>
                    <VStack spacing={4}>
                        {/* 行動摘要 */}
                        {actionDetails && (
                            <Box
                                bg="white"
                                p={3}
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.200"
                                width="100%"
                            >
                                <HStack justify="space-between">
                                    <VStack align="start" spacing={1}>
                                        <Text fontSize="sm" color="gray.600">您獲得</Text>
                                        <Text fontSize="lg" fontWeight="bold" color="blue.600">
                                            {receivedCards.length} 張卡牌
                                        </Text>
                                    </VStack>
                                    <VStack align="end" spacing={1}>
                                        <Text fontSize="sm" color="gray.600">{opponentName}獲得</Text>
                                        <Text fontSize="lg" fontWeight="bold" color="red.600">
                                            {actionDetails.opponentReceivedCount} 張卡牌
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        )}

                        {/* 獲得的卡牌展示 */}
                        <Box width="100%">
                            <Text fontSize="md" fontWeight="bold" mb={3} textAlign="center" color="gray.700">
                                您獲得的卡牌：
                            </Text>

                            <Flex justify="center" wrap="wrap" gap={3}>
                                {receivedCards.map((card, index) => renderCard(card, index))}
                            </Flex>
                        </Box>

                        {/* 影響的藝妓提示 */}
                        <Box
                            bg="yellow.50"
                            border="1px solid"
                            borderColor="yellow.200"
                            p={3}
                            borderRadius="md"
                            width="100%"
                        >
                            <Text fontSize="sm" color="yellow.800" textAlign="center">
                                💡 這些卡牌將影響對應藝妓的青睞狀態
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter justifyContent="center">
                    <Button
                        colorScheme="blue"
                        size="lg"
                        onClick={onClose}
                        px={8}
                        borderRadius="full"
                    >
                        確認收下 ✨
                    </Button>
                </ModalFooter>
            </ModalContent>


        </Modal>
    );
};

export default CardReceivedNotification;
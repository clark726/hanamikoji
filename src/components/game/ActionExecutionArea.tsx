import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Grid,
    GridItem,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Divider,
    Badge,
    useBreakpointValue,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure
} from '@chakra-ui/react';

// 假設的行動類型
enum ActionType {
    SECRET = 'SECRET',
    DISCARD = 'DISCARD',
    GIFT = 'GIFT',
    COMPETE = 'COMPETE'
}

interface Card {
    id: string;
    geishaId: string;
    geishaName: string;
}

interface ActionExecutionAreaProps {
    actionType: ActionType;
    selectedCards: string[];
    cards?: Card[];
    onCancel: () => void;
    onConfirm: (actionData?: any) => void;
    disabled?: boolean;
}

const ActionExecutionArea: React.FC<ActionExecutionAreaProps> = ({
                                                                     actionType,
                                                                     selectedCards,
                                                                     cards = [],
                                                                     onCancel,
                                                                     onConfirm,
                                                                     disabled = false
                                                                 }) => {
    // 狀態管理
    const [giftGroups, setGiftGroups] = useState<string[][]>([]);
    const [competeGroups, setCompeteGroups] = useState<string[][]>([[], []]);
    const [waitingForOpponent, setWaitingForOpponent] = useState(false);

    // Modal 控制
    const { isOpen, onOpen, onClose } = useDisclosure();

    // 響應式設計
    const isMobile = useBreakpointValue({ base: true, md: false });

    // 獲取選中的卡牌詳情
    const getSelectedCardDetails = () => {
        return selectedCards.map(cardId =>
            cards.find(card => card.id === cardId)
        ).filter(Boolean) as Card[];
    };

    // 驗證行動是否有效
    const isActionValid = () => {
        switch (actionType) {
            case ActionType.SECRET:
                return selectedCards.length === 1;
            case ActionType.DISCARD:
                return selectedCards.length === 2;
            case ActionType.GIFT:
                return selectedCards.length === 3;
            case ActionType.COMPETE:
                return selectedCards.length === 4;
            default:
                return false;
        }
    };

    // 獲取行動要求描述
    const getActionRequirement = () => {
        switch (actionType) {
            case ActionType.SECRET:
                return { required: 1, description: '選擇 1 張卡牌秘密保留' };
            case ActionType.DISCARD:
                return { required: 2, description: '選擇 2 張卡牌棄置' };
            case ActionType.GIFT:
                return { required: 3, description: '選擇 3 張卡牌進行獻禮' };
            case ActionType.COMPETE:
                return { required: 4, description: '選擇 4 張卡牌進行競爭' };
            default:
                return { required: 0, description: '' };
        }
    };

    // 處理獻禮分組
    const handleGiftGrouping = () => {
        if (selectedCards.length === 3) {
            // 簡單實現：將3張卡作為一組
            setGiftGroups([selectedCards]);
            onOpen();
        }
    };

    // 處理競爭分組
    const handleCompeteGrouping = () => {
        if (selectedCards.length === 4) {
            // 打開分組界面
            setCompeteGroups([[], []]);
            onOpen();
        }
    };

    // 競爭分組 - 將卡牌添加到指定組
    const addToCompeteGroup = (cardId: string, groupIndex: number) => {
        setCompeteGroups(prev => {
            const newGroups = [...prev];
            // 從其他組移除該卡牌
            newGroups.forEach(group => {
                const index = group.indexOf(cardId);
                if (index > -1) group.splice(index, 1);
            });
            // 添加到指定組
            if (newGroups[groupIndex].length < 2) {
                newGroups[groupIndex].push(cardId);
            }
            return newGroups;
        });
    };

    // 執行行動
    const executeAction = () => {
        if (!isActionValid()) return;

        const actionData = {
            type: actionType,
            cards: selectedCards,
            groups: actionType === ActionType.COMPETE ? competeGroups : giftGroups
        };

        setWaitingForOpponent(actionType === ActionType.GIFT || actionType === ActionType.COMPETE);
        onConfirm(actionData);
        onClose();
    };

    const requirement = getActionRequirement();
    const selectedCardDetails = getSelectedCardDetails();

    return (
        <Box
            bg="white"
            p={{ base: 3, md: 4 }}
            borderRadius="lg"
            shadow="md"
            border="2px"
            borderColor="purple.200"
            mb={4}
        >
            <VStack spacing={4} align="stretch">
                {/* 標題區域 */}
                <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold" color="purple.600">
                            執行行動：{actionType === ActionType.SECRET ? '秘密保留' :
                            actionType === ActionType.DISCARD ? '棄牌' :
                                actionType === ActionType.GIFT ? '獻禮' : '競爭'}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            {requirement.description}
                        </Text>
                    </VStack>
                    <Badge
                        colorScheme={isActionValid() ? "green" : "red"}
                        fontSize="sm"
                        px={2}
                        py={1}
                    >
                        {selectedCards.length}/{requirement.required}
                    </Badge>
                </HStack>

                <Divider />

                {/* 已選擇的卡牌顯示 */}
                {selectedCards.length > 0 && (
                    <Box>
                        <Text fontSize="md" fontWeight="bold" mb={2}>已選擇的卡牌：</Text>
                        <Grid
                            templateColumns={isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(120px, 1fr))"}
                            gap={2}
                        >
                            {selectedCardDetails.map((card, index) => (
                                <GridItem key={card.id}>
                                    <Box
                                        p={2}
                                        borderWidth={1}
                                        borderColor="purple.300"
                                        borderRadius="md"
                                        bg="purple.50"
                                        textAlign="center"
                                    >
                                        <Text fontSize="sm" fontWeight="bold">{card.geishaName}</Text>
                                        <Badge size="sm" colorScheme="purple">#{index + 1}</Badge>
                                    </Box>
                                </GridItem>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* 行動狀態提示 */}
                {!isActionValid() && selectedCards.length > 0 && (
                    <Alert status="warning" borderRadius="md">
                        <AlertIcon />
                        <AlertDescription>
                            還需要選擇 {requirement.required - selectedCards.length} 張卡牌
                        </AlertDescription>
                    </Alert>
                )}

                {isActionValid() && (
                    <Alert status="success" borderRadius="md">
                        <AlertIcon />
                        <AlertDescription>
                            卡牌選擇完成，可以執行行動
                        </AlertDescription>
                    </Alert>
                )}

                {/* 等待對手狀態 */}
                {waitingForOpponent && (
                    <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <AlertTitle>等待對手決策</AlertTitle>
                        <AlertDescription>
                            對手正在選擇{actionType === ActionType.GIFT ? '獻禮' : '競爭'}分組...
                        </AlertDescription>
                    </Alert>
                )}

                {/* 操作按鈕 */}
                <HStack justify="space-between" pt={2}>
                    <Button
                        variant="outline"
                        colorScheme="gray"
                        onClick={onCancel}
                        size={isMobile ? "sm" : "md"}
                    >
                        取消
                    </Button>

                    <HStack spacing={2}>
                        {/* 獻禮和競爭需要額外的分組步驟 */}
                        {(actionType === ActionType.GIFT || actionType === ActionType.COMPETE) && isActionValid() && (
                            <Button
                                colorScheme="purple"
                                onClick={actionType === ActionType.GIFT ? handleGiftGrouping : handleCompeteGrouping}
                                size={isMobile ? "sm" : "md"}
                                disabled={disabled}
                            >
                                {actionType === ActionType.GIFT ? '設定獻禮' : '分組競爭'}
                            </Button>
                        )}

                        {/* 秘密保留和棄牌可以直接執行 */}
                        {(actionType === ActionType.SECRET || actionType === ActionType.DISCARD) && (
                            <Button
                                colorScheme="purple"
                                onClick={executeAction}
                                isDisabled={!isActionValid() || disabled}
                                size={isMobile ? "sm" : "md"}
                            >
                                確認執行
                            </Button>
                        )}
                    </HStack>
                </HStack>
            </VStack>

            {/* 獻禮/競爭分組 Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "xl"}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {actionType === ActionType.GIFT ? '設定獻禮分組' : '設定競爭分組'}
                    </ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        {actionType === ActionType.GIFT && (
                            <VStack spacing={4}>
                                <Alert status="info">
                                    <AlertIcon />
                                    <AlertDescription>
                                        您選擇的3張卡牌將作為一組提供給對手選擇
                                    </AlertDescription>
                                </Alert>

                                <Box>
                                    <Text fontWeight="bold" mb={2}>獻禮組合：</Text>
                                    <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                                        {selectedCardDetails.map(card => (
                                            <Box
                                                key={card.id}
                                                p={3}
                                                borderWidth={1}
                                                borderColor="purple.300"
                                                borderRadius="md"
                                                bg="purple.50"
                                                textAlign="center"
                                            >
                                                <Text fontSize="sm" fontWeight="bold">{card.geishaName}</Text>
                                            </Box>
                                        ))}
                                    </Grid>
                                </Box>
                            </VStack>
                        )}

                        {actionType === ActionType.COMPETE && (
                            <VStack spacing={4}>
                                <Alert status="info">
                                    <AlertIcon />
                                    <AlertDescription>
                                        將4張卡牌分成2組（每組2張），對手將選擇其中一組
                                    </AlertDescription>
                                </Alert>

                                <VStack spacing={3} width="100%">
                                    {/* 未分組的卡牌 */}
                                    <Box width="100%">
                                        <Text fontWeight="bold" mb={2}>待分組卡牌：</Text>
                                        <HStack spacing={2} flexWrap="wrap">
                                            {selectedCards
                                                .filter(cardId => !competeGroups[0].includes(cardId) && !competeGroups[1].includes(cardId))
                                                .map(cardId => {
                                                    const card = cards.find(c => c.id === cardId);
                                                    return card ? (
                                                        <Box
                                                            key={cardId}
                                                            p={2}
                                                            borderWidth={1}
                                                            borderColor="gray.300"
                                                            borderRadius="md"
                                                            bg="gray.50"
                                                            cursor="pointer"
                                                            onClick={() => {
                                                                // 自動分配到有空位的組
                                                                if (competeGroups[0].length < 2) addToCompeteGroup(cardId, 0);
                                                                else if (competeGroups[1].length < 2) addToCompeteGroup(cardId, 1);
                                                            }}
                                                        >
                                                            <Text fontSize="sm">{card.geishaName}</Text>
                                                        </Box>
                                                    ) : null;
                                                })}
                                        </HStack>
                                    </Box>

                                    {/* 分組顯示 */}
                                    <Grid templateColumns="1fr 1fr" gap={4} width="100%">
                                        {[0, 1].map(groupIndex => (
                                            <GridItem key={groupIndex}>
                                                <VStack spacing={2}>
                                                    <Text fontWeight="bold">第 {groupIndex + 1} 組</Text>
                                                    <Box
                                                        minH="100px"
                                                        p={2}
                                                        borderWidth={2}
                                                        borderColor="purple.300"
                                                        borderStyle="dashed"
                                                        borderRadius="md"
                                                        bg="purple.50"
                                                        width="100%"
                                                    >
                                                        <VStack spacing={2}>
                                                            {competeGroups[groupIndex].map(cardId => {
                                                                const card = cards.find(c => c.id === cardId);
                                                                return card ? (
                                                                    <Box
                                                                        key={cardId}
                                                                        p={2}
                                                                        borderWidth={1}
                                                                        borderColor="purple.400"
                                                                        borderRadius="md"
                                                                        bg="white"
                                                                        width="100%"
                                                                        textAlign="center"
                                                                        cursor="pointer"
                                                                        onClick={() => {
                                                                            // 移回待分組
                                                                            setCompeteGroups(prev => {
                                                                                const newGroups = [...prev];
                                                                                newGroups[groupIndex] = newGroups[groupIndex].filter(id => id !== cardId);
                                                                                return newGroups;
                                                                            });
                                                                        }}
                                                                    >
                                                                        <Text fontSize="sm">{card.geishaName}</Text>
                                                                    </Box>
                                                                ) : null;
                                                            })}
                                                            {competeGroups[groupIndex].length === 0 && (
                                                                <Text fontSize="sm" color="gray.500">
                                                                    點擊上方卡牌添加到此組
                                                                </Text>
                                                            )}
                                                        </VStack>
                                                    </Box>
                                                </VStack>
                                            </GridItem>
                                        ))}
                                    </Grid>
                                </VStack>
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="outline" mr={3} onClick={onClose}>
                            取消
                        </Button>
                        <Button
                            colorScheme="purple"
                            onClick={executeAction}
                            isDisabled={
                                actionType === ActionType.COMPETE &&
                                (competeGroups[0].length !== 2 || competeGroups[1].length !== 2)
                            }
                        >
                            確認執行
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default ActionExecutionArea;
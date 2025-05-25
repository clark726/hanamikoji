import React from 'react';
import { Box, SimpleGrid, Button, Tooltip, Text, useBreakpointValue } from '@chakra-ui/react';
import { ActionType } from '../../models/game';

interface ActionSelectionProps {
    availableActions: ActionType[];
    currentAction: ActionType | null;
    onActionSelect: (action: ActionType) => void;
}

const ActionSelection: React.FC<ActionSelectionProps> = ({
                                                             availableActions,
                                                             currentAction,
                                                             onActionSelect
                                                         }) => {
    // 行動描述
    const actionDescriptions = {
        [ActionType.SECRET]: '秘密保留一張卡牌',
        [ActionType.DISCARD]: '棄掉兩張卡牌',
        [ActionType.GIFT]: '選擇三張卡牌，對手選一組',
        [ActionType.COMPETE]: '選擇四張卡牌分成兩組，對手選一組'
    };

    // 行動顏色
    const actionColors = {
        [ActionType.SECRET]: 'teal',
        [ActionType.DISCARD]: 'red',
        [ActionType.GIFT]: 'purple',
        [ActionType.COMPETE]: 'orange'
    };

    // 行動名稱
    const actionNames = {
        [ActionType.SECRET]: '秘密保留',
        [ActionType.DISCARD]: '棄牌',
        [ActionType.GIFT]: '獻禮',
        [ActionType.COMPETE]: '競爭'
    };

    // 根據屏幕大小調整佈局
    const columns = useBreakpointValue({ base: 2, md: 4 });

    return (
        <Box width="100%" mb={4}>
            <Text fontWeight="bold" fontSize="lg" mb={2}>選擇行動</Text>

            <SimpleGrid columns={columns || 2} spacing={3}>
                {Object.values(ActionType).map(action => (
                    <Tooltip
                        key={action}
                        label={actionDescriptions[action]}
                        aria-label={actionDescriptions[action]}
                        hasArrow
                    >
                        <Button
                            colorScheme={actionColors[action]}
                            size={{ base: 'md', md: 'lg' }}
                            height={{ base: '40px', md: '50px' }}
                            isDisabled={!availableActions.includes(action)}
                            onClick={() => onActionSelect(action)}
                            opacity={currentAction === action ? 1 : 0.9}
                            transform={currentAction === action ? 'scale(1.05)' : 'scale(1)'}
                            boxShadow={currentAction === action ? 'lg' : 'md'}
                            transition="all 0.2s"
                            _disabled={{
                                opacity: 0.4,
                                cursor: 'not-allowed',
                                boxShadow: 'none'
                            }}
                        >
                            {actionNames[action]}
                        </Button>
                    </Tooltip>
                ))}
            </SimpleGrid>
        </Box>
    );
};

export default ActionSelection;
'use client';

import { hookstate, useHookstate } from '@hookstate/core';
import { Button, Flex, Modal, Stack, Text } from '@mantine/core';

const modalState = hookstate<{
    id: string;
    open: boolean;
    title: string;
    content: string;
    confirm: string
} | null>(null);

export function useModal() {
    const stateModal = useHookstate(modalState);

    function open() {
        stateModal.set((prev) => prev ? { ...prev, open: true } : null);
    }

    function close() {
        stateModal.set((prev) => prev ? { ...prev, open: false } : null);
    }

    function confirm(id: string) {
        stateModal.set((prev) => prev ? { ...prev, open: false, confirm: id } : null);
    }


    return { value: stateModal.value, open, close };
}

export function CustomModal() {
    const { value, close } = useModal();

    return (
        <Modal
            opened={value?.open || false}
            onClose={close}
            title={value?.title || ''}
        >
            <Stack>
                <Text>{value?.content || ''}</Text>
                <Flex justify="space-between">
                    <Button onClick={close}>Cancel</Button>
                    <Button onClick={() => {}}>Confirm</Button>
                </Flex>
            </Stack>
        </Modal>
    );
}

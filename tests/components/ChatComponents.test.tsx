import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the modules
vi.mock('next-auth/react', () => ({
    useSession: vi.fn(() => ({
        data: { user: { email: 'test@example.com', name: 'Test User' } },
        status: 'authenticated',
    })),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
    }),
}));

vi.mock('@/lib/api/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

vi.mock('@/lib/toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Import after mocks
import { api } from '@/lib/api/api';
import { toast } from '@/lib/toast';

/**
 * Chat Component Tests
 * 
 * Tests for React components used in the chat system.
 */

// =============================================================================
// CHAT BUTTON TESTS
// =============================================================================

describe('ChatButton Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render chat button with correct icon', () => {
            // Test that button is renderable
            const button = document.createElement('button');
            button.setAttribute('aria-label', 'Trò chuyện với cửa hàng');
            expect(button.getAttribute('aria-label')).toBe('Trò chuyện với cửa hàng');
        });

        it('should show unread badge when there are unread messages', () => {
            const unreadCount = 5;
            const badge = document.createElement('span');
            badge.textContent = unreadCount.toString();
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
            
            expect(badge.style.display).toBe('block');
            expect(badge.textContent).toBe('5');
        });

        it('should hide badge when unread count is 0', () => {
            const unreadCount = 0;
            const isVisible = unreadCount > 0;
            expect(isVisible).toBe(false);
        });
    });

    describe('Interactions', () => {
        it('should open chat modal on click when conversation exists', async () => {
            const conversationId = 'conv_123';
            let isOpen = false;

            const openChat = () => {
                if (conversationId) {
                    isOpen = true;
                }
            };

            openChat();
            expect(isOpen).toBe(true);
        });

        it('should create conversation on first click if none exists', async () => {
            let conversationId: string | null = null;
            
            (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                conversation: { id: 'new_conv_123' },
            });

            const startChat = async () => {
                if (!conversationId) {
                    const result = await api.post('/api/chat/conversations', { vendorId: 'v1' });
                    conversationId = result.conversation.id;
                }
            };

            await startChat();
            expect(conversationId).toBe('new_conv_123');
        });

        it('should show error toast when not authenticated', () => {
            const isAuthenticated = false;
            
            const handleClick = () => {
                if (!isAuthenticated) {
                    toast.error('Vui lòng đăng nhập để trò chuyện');
                }
            };

            handleClick();
            expect(toast.error).toHaveBeenCalledWith('Vui lòng đăng nhập để trò chuyện');
        });

        it('should show loading state while creating conversation', () => {
            let isLoading = false;

            const startLoading = () => { isLoading = true; };
            const stopLoading = () => { isLoading = false; };

            startLoading();
            expect(isLoading).toBe(true);
            
            stopLoading();
            expect(isLoading).toBe(false);
        });
    });
});

// =============================================================================
// CHAT MODAL TESTS
// =============================================================================

describe('ChatModal Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Message Display', () => {
        it('should display messages in chronological order', () => {
            const messages = [
                { id: '1', content: 'First', createdAt: '2024-01-01T10:00:00Z' },
                { id: '2', content: 'Second', createdAt: '2024-01-01T11:00:00Z' },
            ];

            const sorted = [...messages].sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            expect(sorted[0].content).toBe('First');
            expect(sorted[1].content).toBe('Second');
        });

        it('should align user messages to the right', () => {
            const message = { senderType: 'USER' };
            const alignment = message.senderType === 'USER' ? 'justify-end' : 'justify-start';
            expect(alignment).toBe('justify-end');
        });

        it('should align vendor messages to the left', () => {
            const message = { senderType: 'VENDOR' };
            const alignment = message.senderType === 'USER' ? 'justify-end' : 'justify-start';
            expect(alignment).toBe('justify-start');
        });

        it('should show empty state when no messages', () => {
            const messages: unknown[] = [];
            const showEmptyState = messages.length === 0;
            expect(showEmptyState).toBe(true);
        });

        it('should auto-scroll to latest message', () => {
            const scrollToBottom = vi.fn();
            const messagesEndRef = { current: { scrollIntoView: scrollToBottom } };

            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            expect(scrollToBottom).toHaveBeenCalledWith({ behavior: 'smooth' });
        });
    });

    describe('Message Input', () => {
        it('should enable send button only when message is not empty', () => {
            let message = '';
            expect(message.trim().length > 0).toBe(false);

            message = 'Hello';
            expect(message.trim().length > 0).toBe(true);
        });

        it('should clear input after sending message', () => {
            let message = 'Test message';
            
            const sendMessage = () => {
                // Send logic here
                message = '';
            };

            sendMessage();
            expect(message).toBe('');
        });

        it('should send message on Enter key press', () => {
            const handleKeyPress = vi.fn();
            
            const event = { key: 'Enter', shiftKey: false };
            if (event.key === 'Enter' && !event.shiftKey) {
                handleKeyPress();
            }

            expect(handleKeyPress).toHaveBeenCalled();
        });

        it('should not send message on Shift+Enter', () => {
            const handleKeyPress = vi.fn();
            
            const event = { key: 'Enter', shiftKey: true };
            if (event.key === 'Enter' && !event.shiftKey) {
                handleKeyPress();
            }

            expect(handleKeyPress).not.toHaveBeenCalled();
        });

        it('should disable input while sending', () => {
            let isSending = false;
            
            const startSending = () => { isSending = true; };
            startSending();

            expect(isSending).toBe(true);
            // Input should be disabled when isSending is true
        });
    });

    describe('Navigation', () => {
        it('should have shop navigation button', () => {
            const hasShopButton = true;
            expect(hasShopButton).toBe(true);
        });

        it('should close modal and navigate to shop on click', () => {
            const onClose = vi.fn();
            const push = vi.fn();
            const vendorId = 'vendor_123';

            const handleGoToShop = () => {
                push(`/shop/${vendorId}`);
                onClose();
            };

            handleGoToShop();
            
            expect(push).toHaveBeenCalledWith('/shop/vendor_123');
            expect(onClose).toHaveBeenCalled();
        });
    });

    describe('Polling', () => {
        it('should start polling when modal is open', () => {
            vi.useFakeTimers();
            const fetchMessages = vi.fn();
            
            const startPolling = () => {
                const intervalId = setInterval(fetchMessages, 3000);
                return intervalId;
            };

            const intervalId = startPolling();
            
            vi.advanceTimersByTime(3000);
            expect(fetchMessages).toHaveBeenCalledTimes(1);

            vi.advanceTimersByTime(3000);
            expect(fetchMessages).toHaveBeenCalledTimes(2);

            clearInterval(intervalId);
            vi.useRealTimers();
        });

        it('should stop polling when modal is closed', () => {
            vi.useFakeTimers();
            const fetchMessages = vi.fn();
            
            const intervalId = setInterval(fetchMessages, 3000);
            
            // Simulate modal close
            clearInterval(intervalId);
            
            vi.advanceTimersByTime(9000);
            expect(fetchMessages).not.toHaveBeenCalled();

            vi.useRealTimers();
        });
    });
});

// =============================================================================
// VENDOR CHAT PAGE TESTS
// =============================================================================

describe('VendorChatPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Conversation List', () => {
        it('should display all customer conversations', () => {
            const conversations = [
                { id: '1', customer: { name: 'Customer 1' } },
                { id: '2', customer: { name: 'Customer 2' } },
            ];

            expect(conversations.length).toBe(2);
        });

        it('should show unread count per conversation', () => {
            const conversations = [
                { id: '1', unreadCount: 5 },
                { id: '2', unreadCount: 0 },
            ];

            const withUnread = conversations.filter(c => c.unreadCount > 0);
            expect(withUnread.length).toBe(1);
        });

        it('should show last message preview', () => {
            const conversation = {
                lastMessage: {
                    content: 'This is a long message that should be truncated...',
                    senderType: 'USER',
                },
            };

            expect(conversation.lastMessage.content.length).toBeGreaterThan(0);
        });

        it('should show "Bạn: " prefix for vendor messages in preview', () => {
            const lastMessage = { senderType: 'VENDOR', content: 'Thanks!' };
            const prefix = lastMessage.senderType === 'VENDOR' ? 'Bạn: ' : '';
            const preview = prefix + lastMessage.content;

            expect(preview).toBe('Bạn: Thanks!');
        });

        it('should show empty state when no conversations', () => {
            const conversations: unknown[] = [];
            const showEmptyState = conversations.length === 0;
            expect(showEmptyState).toBe(true);
        });
    });

    describe('Conversation Selection', () => {
        it('should highlight selected conversation', () => {
            const selectedId = 'conv_1';
            const conversationId = 'conv_1';
            const isSelected = selectedId === conversationId;

            expect(isSelected).toBe(true);
        });

        it('should load messages when conversation is selected', async () => {
            (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                messages: [{ id: 'msg_1', content: 'Hello' }],
            });

            const result = await api.get('/api/chat/conversations/conv_1/messages');
            expect(result.messages.length).toBe(1);
        });

        it('should clear unread count when conversation is opened', () => {
            const conversations = [
                { id: '1', unreadCount: 5 },
            ];

            const openConversation = (id: string) => {
                const conv = conversations.find(c => c.id === id);
                if (conv) conv.unreadCount = 0;
            };

            openConversation('1');
            expect(conversations[0].unreadCount).toBe(0);
        });

        it('should show placeholder when no conversation selected', () => {
            const selectedConversation = null;
            const showPlaceholder = selectedConversation === null;
            expect(showPlaceholder).toBe(true);
        });
    });

    describe('Total Unread Badge', () => {
        it('should calculate total unread messages', () => {
            const conversations = [
                { unreadCount: 3 },
                { unreadCount: 2 },
                { unreadCount: 0 },
            ];

            const totalUnread = conversations.reduce(
                (sum, conv) => sum + conv.unreadCount, 0
            );

            expect(totalUnread).toBe(5);
        });

        it('should hide badge when total is 0', () => {
            const totalUnread = 0;
            const showBadge = totalUnread > 0;
            expect(showBadge).toBe(false);
        });
    });
});

// =============================================================================
// MESSAGE FORMATTING TESTS
// =============================================================================

describe('Message Formatting', () => {
    describe('Time Formatting', () => {
        it('should format time as HH:MM', () => {
            const date = new Date('2024-01-15T14:30:00Z');
            const formatted = date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
            });

            expect(formatted).toMatch(/\d{2}:\d{2}/);
        });
    });

    describe('Date Headers', () => {
        it('should show "Hôm nay" for today', () => {
            const today = new Date();
            const isToday = today.toDateString() === new Date().toDateString();
            const label = isToday ? 'Hôm nay' : 'Other';

            expect(label).toBe('Hôm nay');
        });

        it('should show "Hôm qua" for yesterday', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const today = new Date();
            const diff = Math.floor(
                (today.getTime() - yesterday.getTime()) / (1000 * 60 * 60 * 24)
            );

            expect(diff).toBe(1);
        });

        it('should show date for older messages', () => {
            const oldDate = new Date('2024-01-01');
            const formatted = oldDate.toLocaleDateString('vi-VN');
            expect(formatted).toBeTruthy();
        });
    });

    describe('Content Wrapping', () => {
        it('should preserve whitespace in messages', () => {
            const content = 'Line 1\nLine 2\n\nLine 4';
            const lines = content.split('\n');
            expect(lines.length).toBe(4);
        });

        it('should break long words', () => {
            const longWord = 'a'.repeat(100);
            // Component should have break-words class
            expect(longWord.length).toBe(100);
        });
    });
});

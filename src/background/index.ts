import { MessageType, type ExtensionMessage } from '@shared/types';

console.log('[TNC] Background service worker loaded');

/**
 * Extension 설치 시
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[TNC] Extension installed');
    // 설정 페이지 열기 등
  } else if (details.reason === 'update') {
    console.log('[TNC] Extension updated');
  }
});

/**
 * Extension 아이콘 클릭 시
 */
chrome.action.onClicked.addListener((tab) => {
  console.log('[TNC] Extension icon clicked', tab);
  // Popup이 있으므로 여기서는 별도 처리 불필요
});

/**
 * 메시지 수신 핸들러
 */
chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: ExtensionMessage) => void
  ) => {
    console.log('[TNC] Message received:', message.type);

    switch (message.type) {
      case MessageType.EXTRACT_CONTENT:
        // Content script로 전달
        handleExtractContent(sender.tab?.id, sendResponse);
        return true;

      default:
        console.warn('[TNC] Unknown message type:', message.type);
    }
  }
);

/**
 * 콘텐츠 추출 요청 처리
 */
async function handleExtractContent(
  tabId: number | undefined,
  sendResponse: (response: ExtensionMessage) => void
): Promise<void> {
  if (!tabId) {
    sendResponse({
      type: MessageType.ERROR,
      error: '활성 탭을 찾을 수 없습니다.',
    });
    return;
  }

  try {
    // Content script에 메시지 전송
    const response = await chrome.tabs.sendMessage(tabId, {
      type: MessageType.EXTRACT_CONTENT,
    });

    sendResponse(response);
  } catch (error) {
    console.error('[TNC] Error sending message to content script:', error);
    sendResponse({
      type: MessageType.ERROR,
      error: 'Content script와 통신할 수 없습니다. 페이지를 새로고침해주세요.',
    });
  }
}

/**
 * Keep-alive for service worker
 */
let keepAliveInterval: NodeJS.Timeout | null = null;

function startKeepAlive() {
  if (keepAliveInterval === null) {
    keepAliveInterval = setInterval(() => {
      console.log('[TNC] Keep-alive ping');
    }, 20000); // 20초마다
  }
}

function stopKeepAlive() {
  if (keepAliveInterval !== null) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}

// 시작 시 keep-alive 시작
startKeepAlive();

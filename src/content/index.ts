import { ContentParser } from './parser';
import { MessageType, type ExtensionMessage, type PageContent } from '@shared/types';

console.log('[TNC] Content script loaded');

/**
 * 지원하지 않는 페이지 패턴
 */
const UNSUPPORTED_URL_PATTERNS = [
  /^chrome:\/\//,
  /^edge:\/\//,
  /^about:/,
  /^file:\/\//,
  /^chrome-extension:\/\//,
  /^moz-extension:\/\//,
];

/**
 * 최소 텍스트 콘텐츠 길이 (글자 수)
 */
const MIN_CONTENT_LENGTH = 100;

/**
 * 페이지가 지원되는지 확인
 */
function isPageSupported(): boolean {
  const url = window.location.href;

  // 지원하지 않는 URL 패턴 체크
  if (UNSUPPORTED_URL_PATTERNS.some((pattern) => pattern.test(url))) {
    return false;
  }

  // 페이지가 완전히 로드되었는지 확인
  if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
    return false;
  }

  // 최소 텍스트 콘텐츠가 있는지 확인
  const bodyText = document.body?.innerText || '';
  if (bodyText.trim().length < MIN_CONTENT_LENGTH) {
    return false;
  }

  return true;
}

/**
 * Background script로부터 메시지 수신
 */
chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: ExtensionMessage) => void
  ) => {
    if (message.type === MessageType.EXTRACT_CONTENT) {
      handleExtractContent(sendResponse);
      return true; // 비동기 응답을 위해 true 반환
    }
  }
);

/**
 * 콘텐츠 추출 처리
 */
async function handleExtractContent(
  sendResponse: (response: ExtensionMessage) => void
): Promise<void> {
  try {
    console.log('[TNC] Extracting content from page...');

    // 페이지 지원 여부 확인
    if (!isPageSupported()) {
      console.log('[TNC] Unsupported page detected');
      sendResponse({
        type: MessageType.UNSUPPORTED_PAGE,
      });
      return;
    }

    const content = await ContentParser.extractContent();

    if (!content) {
      sendResponse({
        type: MessageType.ERROR,
        error: '페이지 본문을 추출할 수 없습니다. 다른 페이지에서 시도해주세요.',
      });
      return;
    }

    console.log('[TNC] Content extracted successfully:', {
      title: content.title,
      wordCount: content.wordCount,
    });

    sendResponse({
      type: MessageType.CONTENT_EXTRACTED,
      payload: content,
    });
  } catch (error) {
    console.error('[TNC] Content extraction error:', error);
    sendResponse({
      type: MessageType.ERROR,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    });
  }
}

/**
 * 페이지가 동적으로 로드되는 경우 대비 (SPA)
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[TNC] DOM loaded');
  });
} else {
  console.log('[TNC] DOM already loaded');
}

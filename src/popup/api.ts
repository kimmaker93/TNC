import { API_BASE_URL, API_ENDPOINTS } from '@shared/constants';
import type {
  SummaryRequest,
  SummaryResponse,
  SlackSendRequest,
  SlackSendResponse,
} from '@shared/types';

/**
 * Mock 모드 확인 (개발 중 백엔드 서버 없이 테스트)
 */
const USE_MOCK = !API_BASE_URL || API_BASE_URL.includes('your-serverless-api');

/**
 * Mock 요약 생성 (개발용)
 */
function mockSummarize(request: SummaryRequest): SummaryResponse {
  const mockSummaries = {
    summary: [
      `${request.title}의 주요 내용을 요약한 첫 번째 포인트입니다.`,
      '핵심 정보와 인사이트를 담은 두 번째 요약입니다.',
      '비즈니스 관점에서 중요한 세 번째 시사점입니다.',
    ],
    keywords: ['키워드1', '키워드2', '키워드3', '테크', '뉴스'],
  };

  return {
    success: true,
    data: {
      summary: request.mode === 'summary' ? mockSummaries.summary : mockSummaries.keywords,
      keywords: mockSummaries.keywords,
      insight: '이 기사는 최신 트렌드를 잘 반영하고 있으며, 팀에게 유용한 정보를 제공합니다.',
      processingTime: 1.5,
    },
    usage: {
      inputTokens: 500,
      outputTokens: 150,
      cost: 0.001,
    },
  };
}

/**
 * 요약 API 호출
 */
export async function summarize(request: SummaryRequest): Promise<SummaryResponse> {
  // Mock 모드
  if (USE_MOCK) {
    console.log('[TNC] Using MOCK API (backend server not configured)');
    await new Promise((resolve) => setTimeout(resolve, 1500)); // 실제 API처럼 지연
    return mockSummarize(request);
  }

  // 실제 API 호출
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUMMARIZE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.statusText}`);
    }

    const data: SummaryResponse = await response.json();
    return data;
  } catch (error) {
    console.error('[TNC] Summarize API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '요약 생성에 실패했습니다.',
    };
  }
}

/**
 * Slack 전송 API 호출
 */
export async function sendToSlack(request: SlackSendRequest): Promise<SlackSendResponse> {
  // Mock 모드
  if (USE_MOCK) {
    console.log('[TNC] Using MOCK Slack send (backend server not configured)');
    console.log('[TNC] Would send to Slack:', {
      title: request.title,
      url: request.url,
      summary: request.summary,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  // 실제 API 호출
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SEND_SLACK}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.statusText}`);
    }

    const data: SlackSendResponse = await response.json();
    return data;
  } catch (error) {
    console.error('[TNC] Slack send API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Slack 전송에 실패했습니다.',
    };
  }
}

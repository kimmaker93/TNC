import { API_BASE_URL, API_ENDPOINTS } from '@shared/constants';
import type {
  SummaryRequest,
  SummaryResponse,
  SlackSendRequest,
  SlackSendResponse,
} from '@shared/types';

/**
 * 요약 API 호출
 */
export async function summarize(request: SummaryRequest): Promise<SummaryResponse> {
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

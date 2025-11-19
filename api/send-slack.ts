import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SlackSendRequest {
  webhookUrl: string;
  title: string;
  url: string;
  summary: string | string[];
  keywords?: string[];
  insight?: string;
  comment?: string;
}

interface SlackSendResponse {
  success: boolean;
  messageId?: string;
  timestamp?: string;
  error?: string;
}

/**
 * CORS 헤더 추가
 */
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

/**
 * Slack Block Kit 메시지 생성
 */
function createSlackMessage(request: SlackSendRequest): any {
  const summaryText = Array.isArray(request.summary)
    ? request.summary.map((line, i) => `${i + 1}. ${line}`).join('\n')
    : request.summary;

  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📰 ${request.title}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*요약:*\n${summaryText}`,
      },
    },
  ];

  // 인사이트 추가
  if (request.insight) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*💡 인사이트:*\n${request.insight}`,
      },
    });
  }

  // 코멘트 추가
  if (request.comment) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*💬 코멘트:*\n${request.comment}`,
      },
    });
  }

  // 키워드 추가
  if (request.keywords && request.keywords.length > 0) {
    const keywordText = request.keywords.map((k) => `\`${k}\``).join(' ');
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `🏷️ ${keywordText}`,
        },
      ],
    });
  }

  // 원본 링크 버튼
  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '원문 보기',
          emoji: true,
        },
        url: request.url,
        style: 'primary',
      },
    ],
  });

  // 푸터
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `_Shared via Team News Clipper | ${new Date().toLocaleString('ko-KR')}_`,
      },
    ],
  });

  return { blocks };
}

/**
 * Slack Webhook으로 메시지 전송
 */
async function sendToSlackWebhook(webhookUrl: string, message: any): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Slack 전송 실패: ${error}`);
  }
}

/**
 * 메인 핸들러
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  setCorsHeaders(res);

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const request: SlackSendRequest = req.body;

    // 입력 검증
    if (!request.webhookUrl || !request.title || !request.url || !request.summary) {
      return res.status(400).json({
        success: false,
        error: '필수 파라미터가 누락되었습니다.',
      });
    }

    // Webhook URL 검증
    if (!request.webhookUrl.startsWith('https://hooks.slack.com/services/')) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 Slack Webhook URL입니다.',
      });
    }

    // Slack 메시지 생성
    const slackMessage = createSlackMessage(request);

    // Slack으로 전송
    await sendToSlackWebhook(request.webhookUrl, slackMessage);

    const response: SlackSendResponse = {
      success: true,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Send to Slack API error:', error);

    const response: SlackSendResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Slack 전송에 실패했습니다.',
    };

    return res.status(500).json(response);
  }
}

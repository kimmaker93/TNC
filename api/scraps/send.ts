/**
 * POST /api/scraps/send
 *
 * Scrap을 선택한 Slack 워크스페이스로 전송합니다.
 *
 * Request Body:
 * {
 *   "scrap_id": "uuid",
 *   "integration_id": "uuid",
 *   "user_comment": "optional comment"
 * }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT } from '../../src/shared/jwt';

// Supabase 클라이언트
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * JWT에서 사용자 ID 추출
 */
function getUserIdFromRequest(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyJWT(token);
  return payload?.userId || null;
}

/**
 * Slack으로 메시지 전송
 */
async function sendSlackMessage(
  webhookUrl: string,
  scrap: any,
  userComment?: string
): Promise<boolean> {
  const summary = Array.isArray(scrap.summary)
    ? scrap.summary
    : scrap.summary?.split('\n') || [];

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: scrap.title || 'Untitled',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🔗 *URL:* ${scrap.url}`,
      },
    },
    {
      type: 'divider',
    },
  ];

  // 요약
  if (summary.length > 0) {
    const summaryText = summary.map((line: string) => `• ${line}`).join('\n');
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*📝 요약 (${scrap.persona} 관점)*\n${summaryText}`,
      },
    });
  }

  // 키워드
  if (scrap.keywords && scrap.keywords.length > 0) {
    const keywordsText = scrap.keywords.join(', ');
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🏷️ 키워드:* ${keywordsText}`,
      },
    });
  }

  // 인사이트
  if (scrap.insight) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*💡 인사이트*\n${scrap.insight}`,
      },
    });
  }

  // 사용자 코멘트
  if (userComment) {
    blocks.push({
      type: 'divider',
    });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*💬 코멘트*\n${userComment}`,
      },
    });
  }

  // 푸터
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `📅 ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} | 🤖 Team News Clipper`,
      },
    ],
  });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blocks,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[API] Slack send error:', error);
    return false;
  }
}

/**
 * POST /api/scraps/send
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { scrap_id, integration_id, user_comment } = req.body;

    // 입력 검증
    if (!scrap_id || !integration_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: scrap_id, integration_id',
      });
    }

    // Scrap 조회 (본인 소유 확인)
    const { data: scrap, error: scrapError } = await supabase
      .from('scrap_logs')
      .select('*')
      .eq('id', scrap_id)
      .eq('user_id', userId)
      .single();

    if (scrapError || !scrap) {
      return res.status(404).json({
        success: false,
        error: 'Scrap not found or you do not have permission',
      });
    }

    // Integration 조회 (본인 소유 + 활성화 확인)
    const { data: integration, error: integrationError } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('id', integration_id)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found, inactive, or you do not have permission',
      });
    }

    // Slack으로 전송
    const success = await sendSlackMessage(
      integration.webhook_url,
      scrap,
      user_comment || scrap.user_comment
    );

    if (!success) {
      throw new Error('Failed to send message to Slack');
    }

    // Scrap에 integration_id 업데이트 (전송 기록)
    await supabase
      .from('scrap_logs')
      .update({
        integration_id: integration_id,
        user_comment: user_comment || scrap.user_comment,
      })
      .eq('id', scrap_id);

    return res.status(200).json({
      success: true,
      message: 'Scrap sent to Slack successfully',
    });
  } catch (error) {
    console.error('[API] Send scrap error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send scrap',
    });
  }
}

/**
 * Main handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

/**
 * /api/integrations
 *
 * GET: 사용자의 모든 연동 조회
 * POST: 새 연동 추가 (Webhook 검증 및 테스트 메시지 전송)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT } from '../src/shared/jwt';

// Supabase 클라이언트
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Slack Webhook URL 형식 검증
 */
function isValidSlackWebhookUrl(url: string): boolean {
  return url.startsWith('https://hooks.slack.com/services/');
}

/**
 * Slack 테스트 메시지 전송
 */
async function sendSlackTestMessage(webhookUrl: string): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: '🎉 TNC 연동 성공!',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Team News Clipper* 연동이 성공적으로 완료되었습니다!\n\n이제 웹 콘텐츠를 요약하고 Slack으로 공유할 수 있습니다.',
            },
          },
        ],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[API] Slack test message error:', error);
    return false;
  }
}

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
 * GET /api/integrations
 * 사용자의 모든 연동 조회
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { data, error } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      integrations: data || [],
    });
  } catch (error) {
    console.error('[API] Get integrations error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch integrations',
    });
  }
}

/**
 * POST /api/integrations
 * 새 연동 추가 (Webhook 검증 및 테스트 메시지 전송)
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { webhook_url, workspace_name } = req.body;

    if (!webhook_url) {
      return res.status(400).json({
        success: false,
        error: 'Webhook URL is required',
      });
    }

    // 1. URL 형식 검증
    if (!isValidSlackWebhookUrl(webhook_url)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Slack Webhook URL. URL must start with https://hooks.slack.com/services/',
      });
    }

    // 2. 테스트 메시지 전송
    console.log('[API] Sending test message to Slack...');
    const testResult = await sendSlackTestMessage(webhook_url);

    if (!testResult) {
      return res.status(400).json({
        success: false,
        error: 'Failed to send test message. Please check your Webhook URL.',
      });
    }

    // 3. DB에 저장
    const { data, error } = await supabase
      .from('user_integrations')
      .insert({
        user_id: userId,
        integration_type: 'slack',
        webhook_url,
        workspace_name: workspace_name || 'Slack Workspace',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      integration: data,
      message: 'Slack integration added successfully',
    });
  } catch (error) {
    console.error('[API] Create integration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create integration',
    });
  }
}

/**
 * Main handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

/**
 * /api/integrations/[id]
 *
 * PATCH: 연동 활성화 상태 변경
 * DELETE: 연동 삭제
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT } from '../../src/shared/jwt';

// Supabase 클라이언트
const supabaseUrl = process.env.SUPABASE_URL!;
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
 * PATCH /api/integrations/[id]
 * 활성화 상태 변경
 */
async function handlePatch(req: VercelRequest, res: VercelResponse, integrationId: string) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'is_active must be a boolean',
      });
    }

    // 사용자 소유 확인 및 업데이트
    const { data, error } = await supabase
      .from('user_integrations')
      .update({ is_active })
      .eq('id', integrationId)
      .eq('user_id', userId) // 본인 소유만 수정 가능
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Integration not found or you do not have permission',
        });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
      integration: data,
      message: `Integration ${is_active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('[API] Update integration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update integration',
    });
  }
}

/**
 * DELETE /api/integrations/[id]
 * 연동 삭제
 */
async function handleDelete(req: VercelRequest, res: VercelResponse, integrationId: string) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    // 사용자 소유 확인 및 삭제
    const { error } = await supabase
      .from('user_integrations')
      .delete()
      .eq('id', integrationId)
      .eq('user_id', userId); // 본인 소유만 삭제 가능

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Integration deleted successfully',
    });
  } catch (error) {
    console.error('[API] Delete integration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete integration',
    });
  }
}

/**
 * Main handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // URL에서 ID 추출
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Integration ID is required' });
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res, id);
  }

  if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

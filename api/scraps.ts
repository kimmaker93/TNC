/**
 * POST /api/scraps
 *
 * 페이지 콘텐츠를 받아 OpenAI로 요약을 생성하고 DB에 저장합니다.
 *
 * Request Body:
 * {
 *   "url": "https://...",
 *   "title": "Page title",
 *   "content": "Page content...",
 *   "persona": "general" | "marketing" | "dev" | "biz",
 *   "word_count": 1000
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "scrap": { ... }
 * }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT } from '../src/shared/jwt';
import OpenAI from 'openai';

// Supabase 클라이언트
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// OpenAI 클라이언트
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

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
 * Persona별 프롬프트 생성
 */
function getPromptForPersona(persona: 'general' | 'marketing' | 'dev' | 'biz', content: string, title: string): string {
  const basePrompt = `다음 웹 페이지 콘텐츠를 분석하여 요약해주세요.

제목: ${title}

콘텐츠:
${content}

`;

  const personaPrompts = {
    general: `${basePrompt}
다음 형식으로 응답해주세요:
1. 3줄 요약: 핵심 내용을 3줄로 요약
2. 키워드: 5개의 핵심 키워드 (쉼표로 구분)
3. 인사이트: 이 콘텐츠에서 얻을 수 있는 시사점이나 중요한 포인트

형식:
SUMMARY:
- 첫 번째 요약
- 두 번째 요약
- 세 번째 요약

KEYWORDS:
키워드1, 키워드2, 키워드3, 키워드4, 키워드5

INSIGHT:
인사이트 내용`,

    marketing: `${basePrompt}
마케팅 전문가 관점에서 분석해주세요:
1. 3줄 요약: 마케팅 관점에서의 핵심 내용
2. 키워드: 마케팅 관련 주요 키워드 5개
3. 인사이트: 마케팅 전략, 타겟 고객, 시장 트렌드 등 마케팅 시사점

형식:
SUMMARY:
- 첫 번째 요약
- 두 번째 요약
- 세 번째 요약

KEYWORDS:
키워드1, 키워드2, 키워드3, 키워드4, 키워드5

INSIGHT:
마케팅 인사이트`,

    dev: `${basePrompt}
개발자 관점에서 분석해주세요:
1. 3줄 요약: 기술적 핵심 내용
2. 키워드: 기술 스택, 프레임워크, 개발 방법론 관련 키워드 5개
3. 인사이트: 기술적 시사점, 구현 아이디어, 아키텍처 관점

형식:
SUMMARY:
- 첫 번째 요약
- 두 번째 요약
- 세 번째 요약

KEYWORDS:
키워드1, 키워드2, 키워드3, 키워드4, 키워드5

INSIGHT:
기술 인사이트`,

    biz: `${basePrompt}
비즈니스 전문가 관점에서 분석해주세요:
1. 3줄 요약: 비즈니스 관점에서의 핵심 내용
2. 키워드: 비즈니스 모델, 전략, 수익화 관련 키워드 5개
3. 인사이트: 비즈니스 기회, 시장 분석, 전략적 시사점

형식:
SUMMARY:
- 첫 번째 요약
- 두 번째 요약
- 세 번째 요약

KEYWORDS:
키워드1, 키워드2, 키워드3, 키워드4, 키워드5

INSIGHT:
비즈니스 인사이트`,
  };

  return personaPrompts[persona];
}

/**
 * OpenAI로 요약 생성
 */
async function generateSummary(
  content: string,
  title: string,
  persona: 'general' | 'marketing' | 'dev' | 'biz'
): Promise<{ summary: string[]; keywords: string[]; insight: string }> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = getPromptForPersona(persona, content, title);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: '당신은 웹 콘텐츠 요약 전문가입니다. 정확하고 간결하게 요약하며, 주어진 형식을 정확히 따릅니다.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const result = response.choices[0].message.content || '';

  // 결과 파싱
  const summaryMatch = result.match(/SUMMARY:\s*([\s\S]*?)\n\nKEYWORDS:/);
  const keywordsMatch = result.match(/KEYWORDS:\s*([\s\S]*?)\n\nINSIGHT:/);
  const insightMatch = result.match(/INSIGHT:\s*([\s\S]*)/);

  const summaryText = summaryMatch ? summaryMatch[1].trim() : '';
  const keywordsText = keywordsMatch ? keywordsMatch[1].trim() : '';
  const insight = insightMatch ? insightMatch[1].trim() : '';

  // Summary를 배열로 변환 (- 로 시작하는 줄들)
  const summary = summaryText
    .split('\n')
    .filter((line: string) => line.trim().startsWith('-'))
    .map((line: string) => line.trim().substring(1).trim())
    .filter((line: string) => line.length > 0);

  // Keywords를 배열로 변환
  const keywords = keywordsText
    .split(',')
    .map((k: string) => k.trim())
    .filter((k: string) => k.length > 0);

  return {
    summary: summary.length > 0 ? summary : ['요약을 생성할 수 없습니다.'],
    keywords: keywords.length > 0 ? keywords : ['키워드'],
    insight: insight || '인사이트를 생성할 수 없습니다.',
  };
}

/**
 * GET /api/scraps
 * 사용자의 Scrap 목록 조회
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { data: scraps, error } = await supabase
      .from('scrap_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      scraps: scraps || [],
    });
  } catch (error) {
    console.error('[API] Get scraps error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch scraps',
    });
  }
}

/**
 * POST /api/scraps
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { url, title, content, persona, word_count } = req.body;

    // 입력 검증
    if (!url || !title || !content || !persona) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: url, title, content, persona',
      });
    }

    if (!['general', 'marketing', 'dev', 'biz'].includes(persona)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid persona. Must be one of: general, marketing, dev, biz',
      });
    }

    // OpenAI로 요약 생성
    console.log('[API] Generating summary with OpenAI...');
    const { summary, keywords, insight } = await generateSummary(content, title, persona);

    // DB에 저장
    console.log('[API] Saving scrap to database...');
    const { data: scrap, error } = await supabase
      .from('scrap_logs')
      .insert({
        user_id: userId,
        url,
        title,
        summary: summary.join('\n'),
        keywords,
        persona,
        insight,
        word_count: word_count || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[API] Supabase insert error:', error);
      throw new Error('Failed to save scrap to database');
    }

    return res.status(201).json({
      success: true,
      scrap,
    });
  } catch (error) {
    console.error('[API] Create scrap error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create scrap',
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

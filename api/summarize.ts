import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SummaryRequest {
  content: string;
  title: string;
  url: string;
  mode: 'summary' | 'keywords';
  maxTokens?: number;
}

interface SummaryResponse {
  success: boolean;
  data?: {
    summary: string | string[];
    keywords?: string[];
    insight?: string;
    processingTime: number;
  };
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
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
 * OpenAI API 호출
 */
async function callOpenAI(content: string, mode: 'summary' | 'keywords'): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }

  const prompts = {
    summary: `다음 웹 페이지 내용을 한국어로 3줄 이내로 요약해주세요.

요약 규칙:
1. 핵심 정보와 인사이트 중심으로 작성
2. 불필요한 수식어 제거
3. 비즈니스 가치가 있는 내용 우선
4. 각 줄은 완전한 문장으로 작성

응답 형식:
- summary: 3줄 요약 배열
- keywords: 핵심 키워드 5개 배열
- insight: 시사점 1줄

반드시 JSON 형식으로만 응답하세요.

페이지 내용:
${content.substring(0, 5000)}

JSON 응답:`,

    keywords: `다음 텍스트에서 핵심 키워드 5개를 추출하세요.

텍스트:
${content.substring(0, 5000)}

응답 형식:
- keywords: 핵심 키워드 배열 (5개)
- insight: 간단한 시사점 1줄

반드시 JSON 형식으로만 응답하세요.

JSON 응답:`,
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 전문적인 콘텐츠 요약 전문가입니다. 항상 JSON 형식으로만 응답합니다.',
        },
        {
          role: 'user',
          content: prompts[mode],
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error: any = await response.json();
    throw new Error(error.error?.message || 'OpenAI API 호출 실패');
  }

  return response.json();
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
    const startTime = Date.now();
    const { content, title, url, mode }: SummaryRequest = req.body;

    // 입력 검증
    if (!content || !title || !url || !mode) {
      return res.status(400).json({
        success: false,
        error: '필수 파라미터가 누락되었습니다.',
      });
    }

    if (!['summary', 'keywords'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 모드입니다.',
      });
    }

    // OpenAI API 호출
    const aiResponse = await callOpenAI(content, mode);

    const processingTime = (Date.now() - startTime) / 1000;

    // 응답 파싱
    const messageContent = aiResponse.choices[0].message.content;
    let parsedContent;

    try {
      parsedContent = JSON.parse(messageContent);
    } catch (error) {
      console.error('Failed to parse AI response:', messageContent);
      throw new Error('AI 응답 파싱 실패');
    }

    const response: SummaryResponse = {
      success: true,
      data: {
        summary: mode === 'summary' ? parsedContent.summary : parsedContent.keywords,
        keywords: parsedContent.keywords || [],
        insight: parsedContent.insight || '',
        processingTime,
      },
      usage: {
        inputTokens: aiResponse.usage.prompt_tokens,
        outputTokens: aiResponse.usage.completion_tokens,
        cost:
          (aiResponse.usage.prompt_tokens * 0.00015 +
            aiResponse.usage.completion_tokens * 0.0006) /
          1000,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Summarize API error:', error);

    const response: SummaryResponse = {
      success: false,
      error: error instanceof Error ? error.message : '요약 생성에 실패했습니다.',
    };

    return res.status(500).json(response);
  }
}

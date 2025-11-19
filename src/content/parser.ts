import type { PageContent } from '@shared/types';
import { cleanContent, countWords } from '@shared/utils';
import { CHARACTER_LIMITS } from '@shared/constants';

/**
 * 웹페이지 콘텐츠 파서
 */
export class ContentParser {
  /**
   * 주요 사이트별 본문 선택자
   */
  private static readonly CONTENT_SELECTORS = [
    'article',
    'main',
    '[role="main"]',
    '.article-content',
    '.post-content',
    '.entry-content',
    '#content',
    '.content',
  ];

  /**
   * 제외할 요소 선택자
   */
  private static readonly EXCLUDE_SELECTORS = [
    'script',
    'style',
    'nav',
    'header',
    'footer',
    'aside',
    '.advertisement',
    '.ad',
    '.social-share',
    '.related-posts',
    '.comments',
  ];

  /**
   * 페이지 제목 추출
   */
  private static getTitle(): string {
    // Open Graph 메타 태그 우선
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    if (ogTitle) return ogTitle;

    // Twitter 카드
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    if (twitterTitle) return twitterTitle;

    // 일반 title 태그
    return document.title || 'Untitled';
  }

  /**
   * 메타데이터 추출
   */
  private static getMetadata() {
    const author =
      document.querySelector('meta[name="author"]')?.getAttribute('content') ||
      document.querySelector('meta[property="article:author"]')?.getAttribute('content');

    const publishedDate =
      document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
      document.querySelector('meta[name="date"]')?.getAttribute('content');

    const excerpt =
      document.querySelector('meta[name="description"]')?.getAttribute('content') ||
      document.querySelector('meta[property="og:description"]')?.getAttribute('content');

    return { author, publishedDate, excerpt };
  }

  /**
   * 본문 요소 찾기
   */
  private static findMainContent(): Element | null {
    // 선택자로 찾기
    for (const selector of this.CONTENT_SELECTORS) {
      const element = document.querySelector(selector);
      if (element && this.isValidContent(element)) {
        return element;
      }
    }

    // 가장 긴 텍스트를 가진 요소 찾기 (fallback)
    return this.findLongestTextElement();
  }

  /**
   * 유효한 본문인지 확인
   */
  private static isValidContent(element: Element): boolean {
    const text = element.textContent?.trim() || '';
    return text.length > 200; // 최소 200자
  }

  /**
   * 가장 긴 텍스트를 가진 요소 찾기
   */
  private static findLongestTextElement(): Element | null {
    const candidates = document.querySelectorAll('div, section, article');
    let longest: Element | null = null;
    let maxLength = 0;

    candidates.forEach((element) => {
      const text = this.extractText(element);
      if (text.length > maxLength) {
        maxLength = text.length;
        longest = element;
      }
    });

    return maxLength > 200 ? longest : null;
  }

  /**
   * 요소에서 텍스트 추출 (제외 요소 제거)
   */
  private static extractText(element: Element): string {
    const clone = element.cloneNode(true) as Element;

    // 제외할 요소들 제거
    this.EXCLUDE_SELECTORS.forEach((selector) => {
      clone.querySelectorAll(selector).forEach((el) => el.remove());
    });

    return clone.textContent?.trim() || '';
  }

  /**
   * 페이지 콘텐츠 추출
   */
  public static async extractContent(): Promise<PageContent | null> {
    try {
      const url = window.location.href;
      const title = this.getTitle();
      const metadata = this.getMetadata();

      // 본문 요소 찾기
      const mainElement = this.findMainContent();
      if (!mainElement) {
        throw new Error('본문을 찾을 수 없습니다.');
      }

      // 텍스트 추출 및 정제
      let content = this.extractText(mainElement);
      content = cleanContent(content);

      // 글자 수 제한
      if (content.length > CHARACTER_LIMITS.CONTENT_MAX) {
        content = content.substring(0, CHARACTER_LIMITS.CONTENT_MAX);
      }

      const wordCount = countWords(content);

      return {
        url,
        title,
        content,
        excerpt: metadata.excerpt,
        author: metadata.author || undefined,
        publishedDate: metadata.publishedDate || undefined,
        wordCount,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('[TNC] Content extraction failed:', error);
      return null;
    }
  }

  /**
   * SPA 대응 - DOM 변경 감지
   */
  public static observeDOMChanges(callback: () => void, delay = 2000): void {
    let timeout: NodeJS.Timeout;

    const observer = new MutationObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(callback, delay);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 초기 실행
    timeout = setTimeout(callback, delay);
  }
}

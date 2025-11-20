import { useTranslation } from '../hooks/useTranslation';

/**
 * 지원하지 않는 페이지 안내 컴포넌트
 */
export function UnsupportedPage() {
  const t = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8">
      {/* 아이콘 */}
      <div className="mb-6">
        <svg
          className="w-16 h-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* 메인 메시지 */}
      <h2 className="text-lg font-semibold text-gray-900 text-center mb-3">
        {t.unsupportedPageTitle}
      </h2>

      {/* 설명 */}
      <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
        {t.unsupportedPageDescription}
      </p>

      {/* 지원 페이지 목록 */}
      <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {t.supportedSites}
        </h3>
        <ul className="space-y-2">
          <li className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {t.supportedSitesList.news}
          </li>
          <li className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {t.supportedSitesList.blogs}
          </li>
          <li className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {t.supportedSitesList.medium}
          </li>
          <li className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {t.supportedSitesList.github}
          </li>
          <li className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {t.supportedSitesList.docs}
          </li>
        </ul>
      </div>
    </div>
  );
}

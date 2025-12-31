'use client';

import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';

interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

interface WebSearchData {
  query?: string;
  results?: SearchResult[];
}

interface WebSearchResultsProps {
  data: WebSearchData;
}

// Função para extrair resultados de pesquisa do texto da mensagem
export function extractSearchResults(text: string): { cleanText: string; searchData: WebSearchData | null } {
  // Padrão para detectar blocos de resultados de pesquisa
  const searchBlockPattern = /\[SEARCH_RESULTS\]([\s\S]*?)\[\/SEARCH_RESULTS\]/g;
  
  let searchData: WebSearchData | null = null;
  let cleanText = text;

  const match = searchBlockPattern.exec(text);
  if (match) {
    try {
      searchData = JSON.parse(match[1]);
      cleanText = text.replace(searchBlockPattern, '').trim();
    } catch {
      // Se não for JSON válido, ignorar
    }
  }

  return { cleanText, searchData };
}

export default function WebSearchResults({ data }: WebSearchResultsProps) {
  if (!data?.results || data.results.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Resultados da Pesquisa
        </span>
      </div>
      
      <div className="space-y-2">
        {data.results.slice(0, 3).map((result, index) => (
          <a
            key={index}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start gap-2">
              <ExternalLink className="w-3 h-3 mt-1 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {result.title}
                </p>
                {result.snippet && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {result.snippet}
                  </p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

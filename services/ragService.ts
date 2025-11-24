
import { REFERENCE_DOCS } from '../constants';
import { ReferenceDoc } from '../types';

/**
 * Mock Search Engine (RAG Service)
 * 실제 환경에서는 Vector Database (Pinecone, Weaviate 등)의 Similarity Search를 사용합니다.
 * 현재는 키워드 매칭 방식으로 간단하게 구현합니다.
 */
export const findRelevantDocuments = async (query: string): Promise<ReferenceDoc[]> => {
  // 네트워크 지연 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!query) return [];

  const lowerQuery = query.toLowerCase();
  
  // 1. 키워드 매칭 점수 계산
  const scoredDocs = REFERENCE_DOCS.map(doc => {
    let score = 0;
    
    // 제목에 키워드가 포함되면 높은 점수
    if (lowerQuery.includes(doc.title.toLowerCase())) {
      score += 10;
    }

    // 정의된 키워드가 쿼리에 포함되면 점수 추가
    doc.keywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) {
        score += 5;
      }
    });

    return { doc, score };
  });

  // 2. 점수가 0보다 큰 문서만 필터링하고 점수 내림차순 정렬
  const relevantDocs = scoredDocs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.doc);

  // 상위 3개 문서만 반환 (Context Window 절약을 위해)
  return relevantDocs.slice(0, 3);
};

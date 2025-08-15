export interface OffsetPaginationResponse<T> {
  data: T[];
  meta: {
    limit: number;
    offset: number;
    currentCount: number;
    totalCount: number;
  };
}

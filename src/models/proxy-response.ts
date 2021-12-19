export interface ProxyResponse {
  status: number;
  body: Buffer | string;
  headers: Record<string, string | string[]>;
}

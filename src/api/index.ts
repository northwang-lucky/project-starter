import axios from 'axios';

const BASE_URL =
  process.env.MODE === 'dev' ? 'http://localhost:8384/api' : 'https://project-template-api.vercel.app/api';

export async function fetchNamespaceList(): Promise<string[]> {
  const res = await axios.get<string[]>(`${BASE_URL}/namespaces`);
  return res.data;
}

export async function fetchTemplateList(namespace: string): Promise<string[]> {
  const res = await axios.get<string[]>(`${BASE_URL}/templates/${namespace}`);
  return res.data;
}

export async function fetchTemplate(namespace: string): Promise<Record<string, object>> {
  const res = await axios.get<Record<string, object>>(`${BASE_URL}/templates/${namespace}`);
  return res.data;
}

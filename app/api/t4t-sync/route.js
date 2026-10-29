import {createHash, timingSafeEqual} from 'node:crypto';
import {createClient} from 'next-sanity';
import {NextResponse} from 'next/server';
import {createPublicationStore} from '@/lib/t4t-sync/store.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(request) {
  const secret = process.env.T4T_SYNC_SECRET;
  if (!secret || secret.length < 32) return false;
  const value = request.headers.get('authorization') ?? '';
  const hash = input => createHash('sha256').update(input).digest();
  return timingSafeEqual(hash(value), hash(`Bearer ${secret}`));
}
function store() {
  const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
  if (!token) throw new Error('not_configured');
  return createPublicationStore(createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'qtpb6qpz',
    dataset: process.env.SANITY_DATASET || 'production', apiVersion:'2026-02-01',
    token, useCdn:false, perspective:'published',
  }));
}
function errorResponse() {
  // Never expose Sanity request headers, tokens, or client error bodies.
  return NextResponse.json({error:'sync_operation_failed',message:'Inspect the job state before retrying.'},{status:409});
}
export async function GET(request) {
  if (!authorized(request)) return NextResponse.json({error:'unauthorized'},{status:401});
  try { return NextResponse.json({jobs:await store().list(new URL(request.url).searchParams.get('concertId'))}); }
  catch { return errorResponse(); }
}
export async function POST(request) {
  if (!authorized(request)) return NextResponse.json({error:'unauthorized'},{status:401});
  if (Number(request.headers.get('content-length') || 0) > 65536) return NextResponse.json({error:'too_large'},{status:413});
  try {
    const text = await request.text();
    if (text.length > 65536) return NextResponse.json({error:'too_large'},{status:413});
    const input = JSON.parse(text);
    const service = store();
    if (input.operation === 'enqueue' && typeof input.concertId === 'string') return NextResponse.json({jobs:await service.enqueue(input.concertId)});
    if (input.operation === 'claim' && typeof input.jobId === 'string' && typeof input.worker === 'string' && input.worker.length <= 80) return NextResponse.json({job:await service.claim(input.jobId,input.worker)});
    if (input.operation === 'finish' && typeof input.jobId === 'string' && typeof input.leaseId === 'string') return NextResponse.json({job:await service.finish(input.jobId,input.leaseId,input.observation)});
    if (input.operation === 'fail' && typeof input.jobId === 'string' && typeof input.leaseId === 'string') return NextResponse.json({job:await service.fail(input.jobId,input.leaseId,input.reason)});
    return NextResponse.json({error:'invalid_operation'},{status:400});
  } catch { return errorResponse(); }
}

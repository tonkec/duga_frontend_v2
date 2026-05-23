import { IComment } from '..';

export type CommentUpdateSocketPayload = { data: Partial<IComment> };

/** Socket/API payloads use `{ data: { id, comment, uploadId, ... } }`. */
export function parseCommentUpdatePayload(payload: unknown): Partial<IComment> | null {
  if (!payload || typeof payload !== 'object') return null;

  const root = payload as Partial<IComment> & {
    data?: Partial<IComment> & { data?: Partial<IComment> };
  };

  if (root.id) return root;

  let updated = root.data;
  if (updated && typeof updated === 'object' && updated.data?.id) {
    updated = updated.data;
  }

  if (!updated?.id) return null;

  return updated;
}

export function toCommentUpdateSocketPayload(
  payload: unknown,
  fallback: { id: number; comment: string; uploadId: string }
): CommentUpdateSocketPayload {
  const parsed = parseCommentUpdatePayload(payload);

  return {
    data: {
      id: parsed?.id ?? fallback.id,
      comment: parsed?.comment ?? fallback.comment,
      uploadId: String(parsed?.uploadId ?? fallback.uploadId),
      ...(parsed?.taggedUsers ? { taggedUsers: parsed.taggedUsers } : {}),
    },
  };
}

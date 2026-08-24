export function clearCommentDraft(drafts: Record<number, string>, postId: number) {
  return { ...drafts, [postId]: "" };
}

export function nextCommentInputKey(postId: number, resetToken: number) {
  return `${postId}-${resetToken}`;
}


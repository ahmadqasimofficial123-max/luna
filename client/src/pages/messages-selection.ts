export async function selectConversationAfterInboxRefresh({
  conversationId,
  refreshInbox,
  clearSearch,
  navigate,
}: {
  conversationId: number;
  refreshInbox: () => Promise<unknown>;
  clearSearch: () => void;
  navigate: (path: string) => void;
}) {
  await refreshInbox();
  clearSearch();
  navigate(`/messages/${conversationId}`);
}

export function selectedConversationIsKnown(conversationId: number, conversationIds: number[]) {
  return conversationId > 0 && conversationIds.includes(conversationId);
}

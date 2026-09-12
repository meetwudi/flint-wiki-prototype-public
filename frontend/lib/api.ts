const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchEpisode(episodeId: string, hasFinanceAccess: boolean) {
  const response = await fetch(
    `${API_BASE}/api/episodes/${episodeId}?hasFinanceAccess=${hasFinanceAccess}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch episode');
  }
  return response.json();
}

export async function fetchMessage(messageId: string, hasFinanceAccess: boolean) {
  const response = await fetch(
    `${API_BASE}/api/messages/${messageId}?hasFinanceAccess=${hasFinanceAccess}`
  );
  return response;
}

export async function demoEdit(messageId: string, newText: string) {
  const response = await fetch(`${API_BASE}/api/demo/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messageId,
      action: 'edit',
      newText,
    }),
  });
  return response.json();
}

export async function demoDelete(messageId: string) {
  const response = await fetch(`${API_BASE}/api/demo/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messageId,
      action: 'delete',
    }),
  });
  return response.json();
}

export async function toggleClaimPin(episodeId: string, claimId: string) {
  const response = await fetch(
    `${API_BASE}/api/episodes/${episodeId}/claims/${claimId}/pin`,
    {
      method: 'POST',
    }
  );
  return response.json();
}

export async function reprojectEpisode(episodeId: string) {
  const response = await fetch(`${API_BASE}/api/episodes/${episodeId}/reproject`, {
    method: 'POST',
  });
  return response.json();
}

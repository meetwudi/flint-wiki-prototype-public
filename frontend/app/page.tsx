'use client';

import { useState, useEffect } from 'react';
import { Episode, Claim, SlackMessage } from '../lib/types';
import {
  fetchEpisode,
  fetchMessage,
  demoEdit,
  demoDelete,
  toggleClaimPin,
  reprojectEpisode,
} from '../lib/api';

export default function HomePage() {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [hasFinanceAccess, setHasFinanceAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [sourceMessage, setSourceMessage] = useState<SlackMessage | null>(null);
  const [messageAccessDenied, setMessageAccessDenied] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const PAGE_ID = 'episode_001';

  useEffect(() => {
    loadEpisode();
  }, [hasFinanceAccess]);

  async function loadEpisode() {
    setLoading(true);
    try {
      const data = await fetchEpisode(PAGE_ID, hasFinanceAccess);
      setEpisode(data);
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDigClaim(claim: Claim) {
    setSelectedClaim(claim);
    setMessageAccessDenied(false);
    setSourceMessage(null);

    if (claim.isStub) {
      setMessageAccessDenied(true);
      return;
    }

    try {
      const response = await fetchMessage(claim.sourceMessageId, hasFinanceAccess);
      if (response.ok) {
        const message = await response.json();
        setSourceMessage(message);
      } else if (response.status === 403) {
        setMessageAccessDenied(true);
      }
    } catch (error) {
      console.error('Failed to fetch message:', error);
    }
  }

  function closeModal() {
    setSelectedClaim(null);
    setSourceMessage(null);
    setMessageAccessDenied(false);
    setEditingMessage(null);
    setEditText('');
  }

  async function handleEditMessage(messageId: string) {
    if (!editText.trim()) return;
    await demoEdit(messageId, editText);
    setEditingMessage(null);
    setEditText('');
    closeModal();
    await loadEpisode();
  }

  async function handleDeleteMessage(messageId: string) {
    await demoDelete(messageId);
    closeModal();
    await loadEpisode();
  }

  async function handleTogglePin(claim: Claim) {
    await toggleClaimPin(episode!.id, claim.id);
    await loadEpisode();
  }

  async function handleReproject() {
    await reprojectEpisode(PAGE_ID);
    await loadEpisode();
  }

  function renderClaim(claim: Claim) {
    const classNames = ['claim'];
    if (claim.shouldntStand) classNames.push('shouldnt-stand');
    if (claim.isPinned) classNames.push('pinned');
    if (claim.isStub) classNames.push('acl-stub');

    return (
      <div key={claim.id} className={classNames.join(' ')}>
        <div className={claim.isStub ? 'claim-text claim-stub-text' : 'claim-text'}>
          {claim.text}
          {claim.shouldntStand && (
            <span className="badge badge-warning">Shouldn't stand</span>
          )}
          {claim.isPinned && <span className="badge badge-pin">Pinned</span>}
          {claim.isStub && <span className="badge badge-error">Source exists — no access</span>}
        </div>
        <div className="claim-actions">
          <button className="btn btn-small" onClick={() => handleDigClaim(claim)}>
            Dig → walk-back
          </button>
          <button className="btn btn-small" onClick={() => handleTogglePin(claim)}>
            {claim.isPinned ? 'Unpin' : 'Pin'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading page...</div>;
  }

  if (!episode) {
    return <div className="loading">Page not found</div>;
  }

  return (
    <div className="container">
      <div className="controls">
        <h3>Demo Controls</h3>
        <div className="controls-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={hasFinanceAccess}
              onChange={(e) => setHasFinanceAccess(e.target.checked)}
            />
            <span>Viewer has finance access (ACL demo)</span>
          </label>
        </div>
        <button className="btn btn-primary" onClick={handleReproject}>
          Re-synthesize page
        </button>
      </div>

      <div className="header">
        <h1>{episode.title}</h1>
        <div className="header-meta">
          #flint-v0-fixture · Last updated:{' '}
          {new Date(episode.updatedAt).toLocaleString()}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">The call</h2>
        {episode.claims.theCall.map(renderClaim)}
      </div>

      <div className="section">
        <h2 className="section-title">Why it mattered</h2>
        {episode.claims.whyItMattered.map(renderClaim)}
      </div>

      <div className="section">
        <h2 className="section-title">What no longer belongs</h2>
        {episode.claims.whatNoLongerBelongs.map(renderClaim)}
      </div>

      {selectedClaim && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Walk-back to source</h3>
            <div className="modal-content">
              {messageAccessDenied ? (
                <div className="message-box message-deleted">
                  <div className="message-meta">Access Denied</div>
                  <div className="message-text">
                    <strong>Source exists — no access</strong>
                    <br />
                    This message contains restricted financial information. Toggle "Viewer has
                    finance access" above to view.
                  </div>
                </div>
              ) : sourceMessage ? (
                <>
                  <div
                    className={`message-box ${
                      sourceMessage.isDeleted
                        ? 'message-deleted'
                        : sourceMessage.editHistory.length > 0
                        ? 'message-edited'
                        : ''
                    }`}
                  >
                    <div className="message-meta">
                      <strong>@{sourceMessage.userName}</strong> ·{' '}
                      {new Date(sourceMessage.timestamp).toLocaleString()}
                      {sourceMessage.isDeleted && ' · DELETED'}
                      {sourceMessage.editHistory.length > 0 && ' · EDITED'}
                    </div>
                    <div className="message-text">
                      {sourceMessage.isDeleted ? (
                        <em>[This message was deleted]</em>
                      ) : (
                        sourceMessage.text
                      )}
                    </div>
                    {sourceMessage.editHistory.length > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                        <details>
                          <summary style={{ cursor: 'pointer' }}>
                            Edit history ({sourceMessage.editHistory.length})
                          </summary>
                          {sourceMessage.editHistory.map((edit, i) => (
                            <div key={i} style={{ marginTop: '8px', paddingLeft: '8px' }}>
                              <div style={{ fontSize: '12px', color: '#999' }}>
                                {new Date(edit.editedAt).toLocaleString()}
                              </div>
                              <div>{edit.text}</div>
                            </div>
                          ))}
                        </details>
                      </div>
                    )}
                  </div>

                  {!sourceMessage.isDeleted && (
                    <div className="edit-form">
                      <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Demo: Edit message</h4>
                      {editingMessage === sourceMessage.id ? (
                        <>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            placeholder="New message text..."
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleEditMessage(sourceMessage.id)}
                            >
                              Save Edit
                            </button>
                            <button
                              className="btn"
                              onClick={() => {
                                setEditingMessage(null);
                                setEditText('');
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          className="btn"
                          onClick={() => {
                            setEditingMessage(sourceMessage.id);
                            setEditText(sourceMessage.text);
                          }}
                        >
                          Edit Message
                        </button>
                      )}
                    </div>
                  )}

                  {!sourceMessage.isDeleted && (
                    <div style={{ marginTop: '12px' }}>
                      <button
                        className="btn"
                        style={{ background: '#fee2e2', borderColor: '#fecaca' }}
                        onClick={() => handleDeleteMessage(sourceMessage.id)}
                      >
                        Demo: Delete Message
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="loading">Loading message...</div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

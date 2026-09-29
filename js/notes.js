/**
 * LifeOS Notes Module
 * Clean notes organization, pinning, search, categories
 */

document.addEventListener('DOMContentLoaded', async () => {
  const notesGrid = document.getElementById('notesGrid');
  const searchInput = document.getElementById('notesSearch');
  const noteForm = document.getElementById('noteForm');
  let allNotes = [];

  async function loadNotes() {
    if (!notesGrid) return;
    try {
      allNotes = await LifeOS_API.notes.list();
      renderNotes();
    } catch (err) {
      notesGrid.innerHTML = '<div class="form-error">Failed to load notes.</div>';
    }
  }

  function renderNotes() {
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const filtered = allNotes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));

    if (filtered.length === 0) {
      notesGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-title">No notes found</div>
          <div class="empty-state-desc">Capture quick study notes, project architecture thoughts, and interview prep checklists.</div>
          <button class="btn btn-primary btn-sm" onclick="LifeOS_Common.openModal('noteModal')">+ Create Note</button>
        </div>
      `;
      return;
    }

    notesGrid.innerHTML = filtered.map(n => `
      <div class="card" style="display: flex; flex-direction: column;">
        <div class="card-header" style="padding: 14px 18px;">
          <div>
            <span class="badge ${n.pinned ? 'badge-primary' : 'badge-purple'}" style="margin-bottom: 4px;">
              ${n.pinned ? '📌 Pinned' : n.category || 'Note'}
            </span>
            <h4 style="font-size: 15px; font-weight: 700; color: var(--text-primary);">${n.title}</h4>
          </div>
          <button class="action-icon-btn danger" onclick="deleteNote(${n.id})" title="Delete Note">🗑️</button>
        </div>
        <div class="card-body" style="flex: 1; font-size: 13px; color: var(--text-secondary); line-height: 1.5; white-space: pre-wrap;">
          ${n.content}
        </div>
        <div style="padding: 10px 18px; border-top: 1px solid var(--border-subtle); font-size: 11px; color: var(--text-light); text-align: right;">
          ${n.updated_at}
        </div>
      </div>
    `).join('');
  }

  window.deleteNote = async (id) => {
    if (confirm('Delete this note?')) {
      await LifeOS_API.notes.delete(id);
      LifeOS_Common.showToast('Note deleted', 'info');
      await loadNotes();
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', renderNotes);
  }

  if (noteForm) {
    noteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('noteTitle').value.trim();
      const category = document.getElementById('noteCategory').value;
      const content = document.getElementById('noteContent').value.trim();
      const pinned = document.getElementById('notePinned').checked;

      if (!title || !content) return;

      await LifeOS_API.notes.create({ title, category, content, pinned });
      LifeOS_Common.closeModal('noteModal');
      noteForm.reset();
      LifeOS_Common.showToast('Note saved successfully!', 'success');
      await loadNotes();
    });
  }

  await loadNotes();
});

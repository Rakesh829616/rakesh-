/**
 * LifeOS Personal Finance & Cash Flow Module
 * Features:
 * - Unified Cash Flow: Income, Living Expenses, Savings & Investments, Family Support (Money sent home/parents)
 * - Net Remaining = Income - (Expenses + Savings + Family Contribution)
 * - Sub-Tabs: All Cash Flow, Income Tracker, Expense Tracker, Family & Savings Impact
 * - Dedicated Quick Allocation Inputs: "Money Sent to Family/Home" and "Direct Savings"
 * - Highlight Card: "Impact & Savings" with encouraging dynamic message
 * - Full multi-tenant data isolation & persistent sync
 */

(function (global) {
  'use strict';

  let currentSubTab = 'all';
  let currentFilterType = 'all';
  let cachedFinanceData = null;
  let cashFlowChartInstance = null;

  async function fetchFinanceOverview() {
    if (global.apiService && global.apiService.expenses) {
      return await global.apiService.expenses.getOverview();
    }
    if (global.LifeOS_API && global.LifeOS_API.finance) {
      return await global.LifeOS_API.finance.getOverview();
    }
    return {
      monthly_income: 35000,
      monthly_expenses: 8450,
      monthly_savings: 8000,
      monthly_family_support: 12000,
      net_remaining: 6550,
      today_expense: 620,
      currency: '₹',
      impact_message: 'Great job supporting your family (₹12,000 sent home) and building your savings (₹8,000 invested) this month! 🎉',
      transactions: []
    };
  }

  function getBadgeForType(type) {
    const t = (type || 'EXPENSE').toUpperCase();
    if (t === 'INCOME') {
      return '<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #059669; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.3);">💰 INCOME</span>';
    }
    if (t === 'SAVINGS') {
      return '<span class="badge" style="background: rgba(14, 165, 233, 0.15); color: #0284c7; font-weight: 700; border: 1px solid rgba(14, 165, 233, 0.3);">🛡️ SAVINGS</span>';
    }
    if (t === 'FAMILY_SUPPORT') {
      return '<span class="badge" style="background: rgba(168, 85, 247, 0.15); color: #7e22ce; font-weight: 700; border: 1px solid rgba(168, 85, 247, 0.3);">🏡 FAMILY SUPPORT</span>';
    }
    return '<span class="badge" style="background: rgba(239, 68, 68, 0.12); color: #dc2626; font-weight: 700; border: 1px solid rgba(239, 68, 68, 0.25);">💳 EXPENSE</span>';
  }

  function getAmountFormatted(t, cur) {
    const type = (t.type || 'EXPENSE').toUpperCase();
    const amt = Number(t.amount || 0).toLocaleString();
    if (type === 'INCOME') {
      return `<span style="color: #16a34a; font-weight: 800; font-family: var(--font-mono);">+${cur}${amt}</span>`;
    }
    if (type === 'SAVINGS') {
      return `<span style="color: #0284c7; font-weight: 800; font-family: var(--font-mono);">🛡️ ${cur}${amt}</span>`;
    }
    if (type === 'FAMILY_SUPPORT') {
      return `<span style="color: #7e22ce; font-weight: 800; font-family: var(--font-mono);">🏡 ${cur}${amt}</span>`;
    }
    return `<span style="color: #dc2626; font-weight: 800; font-family: var(--font-mono); font-weight: 700;">-${cur}${amt}</span>`;
  }

  async function loadFinanceData() {
    try {
      const fin = await fetchFinanceOverview();
      cachedFinanceData = fin;
      const cur = fin.currency || '₹';

      // 1. Top 4 Allocation Cards
      const incEl = document.getElementById('totalIncomeVal');
      const expEl = document.getElementById('totalExpenseVal');
      const famEl = document.getElementById('totalFamilySupportVal');
      const savEl = document.getElementById('totalDirectSavingsVal');

      if (incEl) incEl.textContent = `${cur}${fin.monthly_income.toLocaleString()}`;
      if (expEl) expEl.textContent = `${cur}${fin.monthly_expenses.toLocaleString()}`;
      if (famEl) famEl.textContent = `${cur}${(fin.monthly_family_support || 0).toLocaleString()}`;
      if (savEl) savEl.textContent = `${cur}${(fin.monthly_savings || 0).toLocaleString()}`;

      // 2. Net Remaining Cash Flow Banner
      const netValEl = document.getElementById('netRemainingVal');
      const netBreakdownEl = document.getElementById('netFormulaBreakdown');
      if (netValEl) {
        netValEl.textContent = `${cur}${(fin.net_remaining != null ? fin.net_remaining : 0).toLocaleString()}`;
      }
      if (netBreakdownEl) {
        netBreakdownEl.innerHTML = `
          <strong>Formula:</strong> Total Income (${cur}${fin.monthly_income.toLocaleString()}) - 
          [Expenses (${cur}${fin.monthly_expenses.toLocaleString()}) + 
           Family Support (${cur}${(fin.monthly_family_support || 0).toLocaleString()}) + 
           Savings (${cur}${(fin.monthly_savings || 0).toLocaleString()})] = 
          <span style="font-weight: 700; color: #1e293b;">${cur}${(fin.net_remaining != null ? fin.net_remaining : 0).toLocaleString()} Unallocated Buffer</span>
        `;
      }

      // 3. Highlight Card: Impact & Savings
      const impactSavedEl = document.getElementById('impactTotalSaved');
      const impactFamilyEl = document.getElementById('impactTotalFamily');
      const impactMsgEl = document.getElementById('impactEncouragingMsg');
      const impactPctEl = document.getElementById('impactRatioPct');
      const impactBarEl = document.getElementById('impactProgressBar');

      const saved = fin.monthly_savings || 0;
      const sentHome = fin.monthly_family_support || 0;
      const combinedImpact = saved + sentHome;
      const impactRatio = fin.monthly_income > 0 ? ((combinedImpact / fin.monthly_income) * 100).toFixed(1) : 0;

      if (impactSavedEl) impactSavedEl.textContent = `${cur}${saved.toLocaleString()}`;
      if (impactFamilyEl) impactFamilyEl.textContent = `${cur}${sentHome.toLocaleString()}`;
      if (impactMsgEl) {
        impactMsgEl.textContent = fin.impact_message || 
          `Great job supporting your family (${cur}${sentHome.toLocaleString()} sent home) and building your savings (${cur}${saved.toLocaleString()} invested) this month! 🎉`;
      }
      if (impactPctEl) impactPctEl.textContent = `${impactRatio}%`;
      if (impactBarEl) impactBarEl.style.width = `${Math.min(100, impactRatio)}%`;

      // 4. Update Tab Counters
      const txs = fin.transactions || [];
      const countAll = txs.length;
      const countInc = txs.filter(t => (t.type || '').toUpperCase() === 'INCOME').length;
      const countExp = txs.filter(t => (t.type || '').toUpperCase() === 'EXPENSE').length;
      const countSav = txs.filter(t => (t.type || '').toUpperCase() === 'SAVINGS').length;
      const countFam = txs.filter(t => (t.type || '').toUpperCase() === 'FAMILY_SUPPORT').length;

      const badgeAll = document.getElementById('filterBadgeAll');
      const badgeInc = document.getElementById('filterBadgeIncome');
      const badgeExp = document.getElementById('filterBadgeExpense');
      const badgeSav = document.getElementById('filterBadgeSavings');
      const badgeFam = document.getElementById('filterBadgeFamily');

      if (badgeAll) badgeAll.textContent = countAll;
      if (badgeInc) badgeInc.textContent = countInc;
      if (badgeExp) badgeExp.textContent = countExp;
      if (badgeSav) badgeSav.textContent = countSav;
      if (badgeFam) badgeFam.textContent = countFam;

      // 5. Render Transaction Table according to active filters
      renderTransactionsTable(txs, cur);

      // 6. Render Cash Flow Doughnut Chart
      renderCashFlowAllocationChart(fin);

      // 7. Update Sub-Tab Specific Views
      updateSubTabCards(fin);

    } catch (err) {
      console.error('Failed to load finance data:', err);
    }
  }

  function renderTransactionsTable(allTxs, cur) {
    const tableBody = document.getElementById('financeTableBody');
    if (!tableBody) return;

    let filtered = allTxs;
    if (currentFilterType !== 'all') {
      filtered = allTxs.filter(t => (t.type || '').toUpperCase() === currentFilterType);
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 32px 16px; color: var(--text-muted);">
            <div style="font-size: 28px; margin-bottom: 6px;">🍃</div>
            <div style="font-weight: 600;">No transactions found for this filter</div>
            <div style="font-size: 12px; margin-top: 4px;">Use the quick forms above or click "+ Add Transaction" to log cash flow.</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(t => {
      const typeBadge = getBadgeForType(t.type);
      const formattedAmount = getAmountFormatted(t, cur);
      const isHomeOrSavings = (t.type || '').toUpperCase() === 'FAMILY_SUPPORT' || (t.type || '').toUpperCase() === 'SAVINGS';

      return `
        <tr style="${isHomeOrSavings ? 'background: rgba(248, 250, 252, 0.6);' : ''}">
          <td style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); white-space: nowrap;">
            ${t.date || 'Today'}
          </td>
          <td>
            <div style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${escapeHtml(t.title)}</div>
            ${t.notes ? `<div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(t.notes)}</div>` : ''}
          </td>
          <td>${typeBadge}</td>
          <td>
            <span class="badge badge-low" style="font-size: 11px; color: #475569; background: #f1f5f9;">
              ${escapeHtml(t.category || 'General')}
            </span>
          </td>
          <td style="font-size: 12px; color: var(--text-secondary);">
            ${escapeHtml(t.payment_method || 'UPI')}
          </td>
          <td style="text-align: right; white-space: nowrap;">
            ${formattedAmount}
          </td>
          <td style="text-align: right; width: 40px;">
            <button type="button" class="btn-icon-subtle" onclick="deleteFinanceTx(${t.id})" title="Delete entry" style="border: none; background: none; cursor: pointer; color: #94a3b8; font-size: 14px; padding: 4px 8px; border-radius: 4px;">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderCashFlowAllocationChart(fin) {
    const canvas = document.getElementById('financeCashFlowChart') || document.getElementById('financePieChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (cashFlowChartInstance) {
      cashFlowChartInstance.destroy();
    }

    const exp = fin.monthly_expenses || 0;
    const fam = fin.monthly_family_support || 0;
    const sav = fin.monthly_savings || 0;
    const rem = Math.max(0, fin.net_remaining || 0);

    cashFlowChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: [
          'Living Expenses', 
          'Family & Home Support', 
          'Direct Savings & Investments', 
          'Net Buffer Remaining'
        ],
        datasets: [{
          data: [exp, fam, sav, rem],
          backgroundColor: [
            '#ef4444', // Red for expenses
            '#a855f7', // Purple for Family
            '#0ea5e9', // Blue/Teal for Savings
            '#10b981'  // Green for buffer
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const cur = fin.currency || '₹';
                return ` ${ctx.label}: ${cur}${Number(ctx.raw).toLocaleString()}`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  function updateSubTabCards(fin) {
    const cur = fin.currency || '₹';

    // Income Tracker breakdown list
    const incomeListEl = document.getElementById('incomeTrackerBreakdown');
    if (incomeListEl) {
      const incTxs = (fin.transactions || []).filter(t => (t.type || '').toUpperCase() === 'INCOME');
      if (incTxs.length === 0) {
        incomeListEl.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); padding: 8px;">No earnings logged yet. Add salary, freelance, or coaching.</div>';
      } else {
        incomeListEl.innerHTML = incTxs.map(t => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;">
            <div>
              <div style="font-weight: 600; font-size: 13px; color: #0f172a;">${escapeHtml(t.title)}</div>
              <div style="font-size: 11px; color: #64748b;">${t.category} • ${t.date} • ${t.payment_method || 'Bank Transfer'}</div>
            </div>
            <div style="font-weight: 800; font-size: 14px; color: #16a34a; font-family: var(--font-mono);">
              +${cur}${Number(t.amount).toLocaleString()}
            </div>
          </div>
        `).join('');
      }
    }

    // Expense Tracker category breakdown
    const expenseCatEl = document.getElementById('expenseTrackerCategories');
    if (expenseCatEl) {
      const expTxs = (fin.transactions || []).filter(t => (t.type || '').toUpperCase() === 'EXPENSE');
      const catTotals = {};
      expTxs.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount);
      });
      const entries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
      if (entries.length === 0) {
        expenseCatEl.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); padding: 8px;">No expenses recorded yet.</div>';
      } else {
        expenseCatEl.innerHTML = entries.map(([cat, amt]) => {
          const pct = fin.monthly_expenses > 0 ? ((amt / fin.monthly_expenses) * 100).toFixed(0) : 0;
          return `
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                <span>${escapeHtml(cat)}</span>
                <span style="font-family: var(--font-mono);">${cur}${amt.toLocaleString()} (${pct}%)</span>
              </div>
              <div style="height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden;">
                <div style="height: 100%; width: ${pct}%; background: #ef4444; border-radius: 3px;"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Sub-Tab Switcher
  global.switchFinanceSubTab = function(tabName) {
    currentSubTab = tabName;
    document.querySelectorAll('.finance-subtab-btn').forEach(btn => {
      if (btn.getAttribute('data-subtab') === tabName) {
        btn.classList.add('active');
        btn.style.borderColor = '#1e6bf2';
        btn.style.color = '#1e6bf2';
        btn.style.background = 'rgba(30, 107, 242, 0.08)';
      } else {
        btn.classList.remove('active');
        btn.style.borderColor = '#e2e8f0';
        btn.style.color = '#64748b';
        btn.style.background = '#ffffff';
      }
    });

    const secAll = document.getElementById('subtabSectionAll');
    const secInc = document.getElementById('subtabSectionIncome');
    const secExp = document.getElementById('subtabSectionExpense');
    const secImpact = document.getElementById('subtabSectionImpact');

    if (secAll) secAll.style.display = tabName === 'all' ? 'block' : 'none';
    if (secInc) secInc.style.display = tabName === 'income' ? 'block' : 'none';
    if (secExp) secExp.style.display = tabName === 'expenses' ? 'block' : 'none';
    if (secImpact) secImpact.style.display = tabName === 'impact' ? 'block' : 'none';

    // Auto-sync table filter button with tab
    if (tabName === 'income') {
      filterFinanceTable('INCOME');
    } else if (tabName === 'expenses') {
      filterFinanceTable('EXPENSE');
    } else if (tabName === 'impact') {
      filterFinanceTable('all');
    } else {
      filterFinanceTable('all');
    }
  };

  // Table Filter Switcher
  global.filterFinanceTable = function(type) {
    currentFilterType = type;
    document.querySelectorAll('.filter-pill-btn').forEach(btn => {
      if (btn.getAttribute('data-filter') === type) {
        btn.style.background = '#1e293b';
        btn.style.color = '#ffffff';
        btn.style.borderColor = '#1e293b';
      } else {
        btn.style.background = '#ffffff';
        btn.style.color = '#475569';
        btn.style.borderColor = '#e2e8f0';
      }
    });
    if (cachedFinanceData) {
      renderTransactionsTable(cachedFinanceData.transactions || [], cachedFinanceData.currency || '₹');
    }
  };

  // Delete transaction
  global.deleteFinanceTx = async function(id) {
    if (!confirm('Are you sure you want to remove this transaction?')) return;
    try {
      if (global.apiService && global.apiService.expenses) {
        await global.apiService.expenses.delete(id);
      } else if (global.LifeOS_API && global.LifeOS_API.finance) {
        // Fallback
        const fin = cachedFinanceData;
        if (fin) {
          fin.transactions = (fin.transactions || []).filter(t => t.id != id);
          localStorage.setItem('lifeos_finance', JSON.stringify(fin));
        }
      }
      if (global.LifeOS_Common) {
        global.LifeOS_Common.showToast('Transaction removed', 'info');
      }
      await loadFinanceData();
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  // Dedicated Quick Form: Money Sent to Family / Parents
  async function setupFamilySupportQuickForm() {
    const form = document.getElementById('quickFamilySupportForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amountInput = document.getElementById('familySupportAmount');
      const descInput = document.getElementById('familySupportDesc');
      const methodInput = document.getElementById('familySupportMethod');
      const dateInput = document.getElementById('familySupportDate');

      const amount = Number(amountInput.value);
      const title = descInput.value.trim() || 'Monthly Family Support';
      const payment_method = methodInput ? methodInput.value : 'UPI';
      const date = (dateInput && dateInput.value) ? dateInput.value : new Date().toISOString().split('T')[0];

      if (!amount || amount <= 0) {
        alert('Please specify a valid contribution amount.');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      try {
        if (global.apiService && global.apiService.expenses) {
          await global.apiService.expenses.sendFamilySupport({
            title,
            amount,
            category: 'Family Support',
            payment_method,
            date
          });
        } else if (global.LifeOS_API && global.LifeOS_API.finance) {
          await global.LifeOS_API.finance.addTransaction({
            title,
            amount,
            category: 'Family Support',
            type: 'FAMILY_SUPPORT',
            payment_method,
            date
          });
        }

        form.reset();
        if (global.LifeOS_Common) {
          global.LifeOS_Common.showToast(`Recorded ₹${amount.toLocaleString()} sent home to family! ❤️`, 'success');
        }
        await loadFinanceData();
      } catch (err) {
        console.error('Family support record error:', err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Record Family Contribution 🏡';
        }
      }
    });
  }

  // Dedicated Quick Form: Direct Savings & Investments
  async function setupDirectSavingsQuickForm() {
    const form = document.getElementById('quickDirectSavingsForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amountInput = document.getElementById('directSavingsAmount');
      const descInput = document.getElementById('directSavingsDesc');
      const catInput = document.getElementById('directSavingsCategory');
      const methodInput = document.getElementById('directSavingsMethod');
      const dateInput = document.getElementById('directSavingsDate');

      const amount = Number(amountInput.value);
      const title = descInput.value.trim() || 'Direct Savings Deposit';
      const category = catInput ? catInput.value : 'Savings & Investments';
      const payment_method = methodInput ? methodInput.value : 'Auto-Debit';
      const date = (dateInput && dateInput.value) ? dateInput.value : new Date().toISOString().split('T')[0];

      if (!amount || amount <= 0) {
        alert('Please specify a valid savings amount.');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }

      try {
        if (global.apiService && global.apiService.expenses) {
          await global.apiService.expenses.addDirectSavings({
            title,
            amount,
            category,
            payment_method,
            date
          });
        } else if (global.LifeOS_API && global.LifeOS_API.finance) {
          await global.LifeOS_API.finance.addTransaction({
            title,
            amount,
            category,
            type: 'SAVINGS',
            payment_method,
            date
          });
        }

        form.reset();
        if (global.LifeOS_Common) {
          global.LifeOS_Common.showToast(`Recorded ₹${amount.toLocaleString()} deposited to ${category}! 🛡️`, 'success');
        }
        await loadFinanceData();
      } catch (err) {
        console.error('Direct savings record error:', err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Deposit to Savings 🛡️';
        }
      }
    });
  }

  // Main Transaction Modal Form
  function setupMainTransactionModalForm() {
    const txForm = document.getElementById('transactionForm');
    if (!txForm) return;

    // Dynamic category adjustment when transaction type changes
    const txTypeSelect = document.getElementById('txType');
    const txCategorySelect = document.getElementById('txCategory');

    if (txTypeSelect && txCategorySelect) {
      txTypeSelect.addEventListener('change', () => {
        const val = txTypeSelect.value.toUpperCase();
        if (val === 'INCOME') {
          txCategorySelect.innerHTML = `
            <option value="Salary">Salary</option>
            <option value="Freelance" selected>Freelance Project</option>
            <option value="Coaching">Tutoring / Coaching</option>
            <option value="Bonus">Bonus & Incentives</option>
            <option value="Investments">Investment Return</option>
            <option value="Other">Other Income</option>
          `;
        } else if (val === 'FAMILY_SUPPORT') {
          txCategorySelect.innerHTML = `
            <option value="Family Support" selected>Monthly Parents Support</option>
            <option value="Household Care">Home Maintenance & Groceries</option>
            <option value="Education Support">Sibling Education</option>
            <option value="Medical Care">Family Health & Medical</option>
            <option value="Festive Gift">Festive / Festival Care</option>
          `;
        } else if (val === 'SAVINGS') {
          txCategorySelect.innerHTML = `
            <option value="Emergency Fund" selected>Emergency Fund</option>
            <option value="Mutual Fund SIP">Mutual Fund SIP</option>
            <option value="Fixed Deposit">Recurring / Fixed Deposit</option>
            <option value="Gold / Precious Metals">Gold / Precious Metals</option>
            <option value="Personal Growth">Career Skill Fund</option>
          `;
        } else {
          // Expense
          txCategorySelect.innerHTML = `
            <option value="Food" selected>Food & Dining</option>
            <option value="Travel">Travel & Metro Transit</option>
            <option value="Education">Education & Books</option>
            <option value="Bills">Cloud Hosting & Tech Bills</option>
            <option value="Shopping">Shopping & Lifestyle</option>
            <option value="Health">Gym & Wellness</option>
            <option value="Other">Other Expenses</option>
          `;
        }
      });
    }

    txForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('txTitle').value.trim();
      const amount = Number(document.getElementById('txAmount').value);
      const category = document.getElementById('txCategory').value;
      const type = document.getElementById('txType').value;
      const payment_method = document.getElementById('txMethod').value;
      const date = document.getElementById('txDate').value || new Date().toISOString().split('T')[0];

      if (!title || !amount) return;

      if (global.apiService && global.apiService.expenses) {
        await global.apiService.expenses.create({ title, amount, category, type, payment_method, date });
      } else if (global.LifeOS_API && global.LifeOS_API.finance) {
        await global.LifeOS_API.finance.addTransaction({ title, amount, category, type, payment_method, date });
      }

      if (global.LifeOS_Common) {
        global.LifeOS_Common.closeModal('transactionModal');
        global.LifeOS_Common.showToast('Transaction logged successfully!', 'success');
      }
      txForm.reset();
      await loadFinanceData();
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', async () => {
    setupFamilySupportQuickForm();
    setupDirectSavingsQuickForm();
    setupMainTransactionModalForm();
    await loadFinanceData();
  });

  global.loadFinanceData = loadFinanceData;

})(window);

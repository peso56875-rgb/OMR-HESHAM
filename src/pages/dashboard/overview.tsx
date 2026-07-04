import { dashboardLayout } from './layout'

const MONTH_LABELS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const METHOD_LABELS: Record<string, string> = {
  'card': 'بطاقة ائتمانية',
  'transfer': 'تحويل بنكي',
  'wallet': 'محفظة إلكترونية',
  'instapay': 'إنستاباي',
  'vodafone_cash': 'فودافون كاش',
  'أخرى': 'أخرى',
}
const METHOD_COLORS = ['#1e88e5','#43a047','#f57c00','#e53935','#8e24aa','#00897b','#5c6bc0']

export const dashOverview = (stats: any, recentDonations: any[]) => {
  const monthlyData: number[] = stats.monthly_chart || new Array(12).fill(0)
  const methodChart: Record<string, number> = stats.method_chart || {}
  const methodLabels = Object.keys(methodChart).map(k => METHOD_LABELS[k] || k)
  const methodValues = Object.values(methodChart) as number[]
  const hasChartData = monthlyData.some((v: number) => v > 0)
  const hasMethodData = methodValues.length > 0 && methodValues.some(v => v > 0)

  return dashboardLayout(
  'overview',
  'النظرة العامة',
  `
  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card kpi-emerald">
      <div class="kpi-header">
        <div class="kpi-icon bg-emerald"><i class="fas fa-sack-dollar"></i></div>
      </div>
      <div class="kpi-value">${Number(stats.total_donations || 0).toLocaleString('ar-EG')}</div>
      <div class="kpi-label">إجمالي التبرّعات (ج.م)</div>
    </div>
    <div class="kpi-card kpi-blue">
      <div class="kpi-header">
        <div class="kpi-icon bg-blue"><i class="fas fa-bullhorn"></i></div>
      </div>
      <div class="kpi-value">${stats.total_campaigns || 0}</div>
      <div class="kpi-label">حملة نشطة</div>
    </div>
    <div class="kpi-card kpi-gold">
      <div class="kpi-header">
        <div class="kpi-icon bg-gold"><i class="fas fa-receipt"></i></div>
      </div>
      <div class="kpi-value">${stats.total_donors || 0}</div>
      <div class="kpi-label">عملية تبرّع</div>
    </div>
    <div class="kpi-card kpi-crimson">
      <div class="kpi-header">
        <div class="kpi-icon bg-crimson"><i class="fas fa-hands-helping"></i></div>
      </div>
      <div class="kpi-value">${stats.total_volunteers || 0}</div>
      <div class="kpi-label">متطوّع مسجل</div>
    </div>
  </div>

  <!-- Quick Stats Row -->
  <div class="quick-stats">
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(229,57,53,.08);color:#e53935"><i class="fas fa-envelope"></i></div>
      <div><div class="qs-value">${stats.unread_contacts || 0}</div><div class="qs-label">رسالة غير مقروءة</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(245,124,0,.08);color:#f57c00"><i class="fas fa-user-clock"></i></div>
      <div><div class="qs-value">${stats.pending_volunteers || 0}</div><div class="qs-label">متطوّع بانتظار الموافقة</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(30,136,229,.08);color:#1e88e5"><i class="fas fa-envelope-open-text"></i></div>
      <div><div class="qs-value">${stats.total_subscribers || 0}</div><div class="qs-label">مشترك بالنشرة</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(67,160,71,.08);color:#43a047"><i class="fas fa-calendar-check"></i></div>
      <div><div class="qs-value">${stats.total_events || 0}</div><div class="qs-label">فعالية</div></div>
    </div>
  </div>

  <!-- Charts -->
  <div class="chart-grid">
    <div class="chart-panel">
      <h3><i class="fas fa-chart-area" style="color:var(--emerald-600)"></i> التبرعات الشهرية (${new Date().getFullYear()})</h3>
      ${hasChartData
        ? `<div style="position:relative;height:260px"><canvas id="monthlyChart"></canvas></div>`
        : `<div style="text-align:center;padding:3rem 1rem;color:var(--muted)">
            <i class="fas fa-chart-area" style="font-size:2.5rem;opacity:.15;margin-bottom:.8rem;display:block"></i>
            <p>لا توجد بيانات تبرعات لهذا العام بعد</p>
          </div>`
      }
    </div>
    <div class="chart-panel">
      <h3><i class="fas fa-chart-pie" style="color:var(--blue-600)"></i> توزيع وسائل الدفع</h3>
      ${hasMethodData
        ? `<div style="position:relative;height:260px;display:flex;align-items:center;justify-content:center"><canvas id="methodChart"></canvas></div>`
        : `<div style="text-align:center;padding:3rem 1rem;color:var(--muted)">
            <i class="fas fa-chart-pie" style="font-size:2.5rem;opacity:.15;margin-bottom:.8rem;display:block"></i>
            <p>لا توجد بيانات كافية</p>
          </div>`
      }
    </div>
  </div>

  <!-- Recent Donations -->
  <div class="data-panel">
    <div class="data-panel-header">
      <h3><i class="fas fa-clock-rotate-left" style="color:var(--gold-600)"></i> أحدث التبرّعات</h3>
      <a href="/dashboard/donations">عرض الكل <i class="fas fa-arrow-left"></i></a>
    </div>
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>المتبرّع</th><th>المبلغ</th><th>الطريقة</th><th>الحالة</th><th>التاريخ</th></tr></thead>
        <tbody>
          ${recentDonations.length ? recentDonations.map(r => `
          <tr>
            <td><b>${r.donor_name}</b></td>
            <td><b style="color:var(--emerald-700)">${Number(r.amount).toLocaleString('ar-EG')} ج.م</b></td>
            <td>${r.payment_method === 'card' ? 'بطاقة' : r.payment_method === 'transfer' ? 'تحويل' : r.payment_method === 'wallet' ? 'محفظة' : r.payment_method === 'instapay' ? 'إنستاباي' : r.payment_method || '-'}</td>
            <td><span class="badge badge-${r.status === 'completed' ? 'ok' : r.status === 'pending' ? 'pend' : 'info'}">${r.status === 'completed' ? 'مكتمل' : r.status === 'pending' ? 'معلّق' : r.status}</span></td>
            <td style="color:var(--muted)">${new Date(r.created_at).toLocaleDateString('ar-EG')}</td>
          </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:2.5rem;color:var(--muted)"><i class="fas fa-inbox" style="font-size:2rem;opacity:.2;display:block;margin-bottom:.5rem"></i>لا توجد تبرعات بعد</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Charts Script — REAL DATA ONLY -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof Chart === 'undefined') return;
      Chart.defaults.font.family = 'Cairo, sans-serif';
      
      // Check dark mode
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      Chart.defaults.color = isDark ? '#8b95a8' : '#4b5b6e';
      const gridColor = isDark ? 'rgba(255,255,255,.06)' : 'rgba(12,26,43,.06)';

      // Monthly donations chart (REAL DATA from server)
      const monthlyEl = document.getElementById('monthlyChart');
      if (monthlyEl) {
        const ctx = monthlyEl.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 260);
        grad.addColorStop(0, 'rgba(67,160,71,.3)');
        grad.addColorStop(1, 'rgba(67,160,71,0)');
        new Chart(monthlyEl, {
          type: 'line',
          data: {
            labels: ${JSON.stringify(MONTH_LABELS)},
            datasets: [{
              label: 'التبرعات (ج.م)',
              data: ${JSON.stringify(monthlyData)},
              borderColor: '#43a047',
              backgroundColor: grad,
              fill: true,
              tension: .4,
              borderWidth: 2.5,
              pointRadius: 3,
              pointHoverRadius: 6,
              pointBackgroundColor: '#43a047',
              pointBorderColor: '#fff',
              pointBorderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { color: gridColor }, ticks: { callback: function(v) { return v.toLocaleString('ar-EG'); } } },
              x: { grid: { display: false } }
            },
            interaction: { intersect: false, mode: 'index' }
          }
        });
      }

      // Payment method chart (REAL DATA from server)
      const methodEl = document.getElementById('methodChart');
      if (methodEl) {
        const labels = ${JSON.stringify(methodLabels)};
        const values = ${JSON.stringify(methodValues)};
        const colors = ${JSON.stringify(METHOD_COLORS)}.slice(0, labels.length);
        new Chart(methodEl, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: values,
              backgroundColor: colors,
              borderWidth: 0,
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
              legend: { position: 'bottom', labels: { padding: 14, font: { size: 12, weight: 600 } } }
            }
          }
        });
      }
    });
  </script>
  `
)}

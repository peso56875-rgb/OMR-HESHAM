import { Layout, icon } from './shared'
import type { UserSession } from '../types'

export function ZakatCalculator({ user }: { user?: UserSession }) {
  return (
    <Layout
      user={user}
      title="حاسبة الزكاة والصدقات الذكية | مؤسسة الدكتور عمر هشام الخيرية"
      description="احسب زكاة مالك وذهبك وتجارتك وكفاراتك بدقة وسهولة وفق الضوابط الشرعية، ووجّه زكاتك لمستحقيها مباشرة."
      image="/static/img/og-image.png"
    >
      <section class="page-hero zakat-hero">
        <div class="hero-glow"></div>
        <p class="eyebrow">{icon('fa-scale-balanced')} فريضة العطاء والبركة</p>
        <h1>حاسبة الزكاة والصدقات الذكية</h1>
        <p>
          "خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا" — احسب زكاتك وصدقاتك بدقة شرعية ووجّه أثرها فوراً للأسر الأكثر استحقاقاً.
        </p>
        <div class="nisab-ticker-banner" id="nisab-banner">
          <div class="nisab-badge">
            <span class="nisab-pulse"></span>
            <b>نصاب زكاة المال لعام 2026:</b>
            <span id="nisab-value-text">حوالي <b>297,500</b> جنيه مصري (ما يعادل 85 جرام ذهب عيار 21)</span>
          </div>
        </div>
      </section>

      <section class="section-pad zakat-section-wrap">
        <div class="zakat-container">
          {/* Navigation Tabs */}
          <div class="zakat-tabs-nav" role="tablist" aria-label="أقسام حاسبة الزكاة">
            <button class="zakat-tab-btn active" data-tab="cash" role="tab" aria-selected="true">
              {icon('fa-money-bill-wave')}
              <span>زكاة الأموال والنقود</span>
            </button>
            <button class="zakat-tab-btn" data-tab="gold" role="tab" aria-selected="false">
              {icon('fa-gem')}
              <span>الذهب والفضة</span>
            </button>
            <button class="zakat-tab-btn" data-tab="trade" role="tab" aria-selected="false">
              {icon('fa-shop')}
              <span>عروض التجارة</span>
            </button>
            <button class="zakat-tab-btn" data-tab="stocks" role="tab" aria-selected="false">
              {icon('fa-chart-line')}
              <span>الأسهم والاستثمارات</span>
            </button>
            <button class="zakat-tab-btn" data-tab="kaffarah" role="tab" aria-selected="false">
              {icon('fa-hands-holding-circle')}
              <span>الكفارات وفدية الصيام</span>
            </button>
          </div>

          <div class="zakat-main-grid">
            {/* Left Calculator Form Panel */}
            <div class="zakat-form-card">
              {/* Tab 1: Cash */}
              <div class="zakat-tab-pane active" id="tab-cash">
                <div class="pane-header">
                  <h3>{icon('fa-money-bill-wave')} زكاة الأموال السائلة والمدخرات</h3>
                  <p>تجب في كل مال بلغ النصاب وحال عليه الحول الهجري، بنسبة 2.5% (ربع العشر).</p>
                </div>
                <div class="zakat-inputs-grid">
                  <div class="form-field">
                    <label for="cash_in_hand">النقود السائلة في اليد والخزينة (جنيه):</label>
                    <input type="number" id="cash_in_hand" class="zakat-input" placeholder="0" min="0" />
                  </div>
                  <div class="form-field">
                    <label for="cash_in_bank">الودائع والحسابات البنكية الجارية والادخارية:</label>
                    <input type="number" id="cash_in_bank" class="zakat-input" placeholder="0" min="0" />
                  </div>
                  <div class="form-field">
                    <label for="cash_receivables">ديون لك على الآخرين موثوقة السداد (مرجوة):</label>
                    <input type="number" id="cash_receivables" class="zakat-input" placeholder="0" min="0" />
                  </div>
                  <div class="form-field deduct-field">
                    <label for="cash_debts">يُخصم: ديون عليك واجبة السداد فوراً:</label>
                    <input type="number" id="cash_debts" class="zakat-input" placeholder="0" min="0" />
                  </div>
                </div>
              </div>

              {/* Tab 2: Gold & Silver */}
              <div class="zakat-tab-pane" id="tab-gold">
                <div class="pane-header">
                  <h3>{icon('fa-gem')} زكاة الذهب والفضة للادخار والسبائك</h3>
                  <p>تجب في الذهب والفضة المدخر بنسبة 2.5% إذا بلغ نصاب الذهب (85 جرام عيار 21/24) أو الفضة (595 جرام).</p>
                </div>
                <div class="zakat-price-controls">
                  <div class="gold-price-badge">
                    <span>سعر جرام الذهب عيار 21 المعتمد:</span>
                    <input type="number" id="gold_21_price" value="3500" class="mini-price-input" title="يمكنك تعديل سعر الجرام حسب سعر السوق اليوم" />
                    <small>ج.م/جرام</small>
                  </div>
                  <div class="gold-price-badge">
                    <span>سعر جرام الفضة المعتمد:</span>
                    <input type="number" id="silver_price" value="45" class="mini-price-input" title="يمكنك تعديل سعر الجرام" />
                    <small>ج.م/جرام</small>
                  </div>
                </div>
                <div class="zakat-inputs-grid">
                  <div class="form-field">
                    <label for="gold_24_grams">وزن الذهب عيار 24 (بالجرام):</label>
                    <input type="number" id="gold_24_grams" class="zakat-input" placeholder="0" min="0" />
                  </div>
                  <div class="form-field">
                    <label for="gold_21_grams">وزن الذهب عيار 21 (بالجرام):</label>
                    <input type="number" id="gold_21_grams" class="zakat-input" placeholder="0" min="0" />
                  </div>
                  <div class="form-field">
                    <label for="gold_18_grams">وزن الذهب عيار 18 (بالجرام):</label>
                    <input type="number" id="gold_18_grams" class="zakat-input" placeholder="0" min="0" />
                  </div>
                  <div class="form-field">
                    <label for="silver_grams">وزن الفضة المدخرة أو السبائك (بالجرام):</label>
                    <input type="number" id="silver_grams" class="zakat-input" placeholder="0" min="0" />
                  </div>
                </div>
                <small class="hint-text">* ذهب الزينة المعتاد للمرأة دون إسراف معفوّ عنه عند جمهور الفقهاء.</small>
              </div>

              {/* Tab 3: Trade Goods */}
              <div class="zakat-tab-pane" id="tab-trade">
                <div class="pane-header">
                  <h3>{icon('fa-shop')} زكاة عروض التجارة والأنشطة الاقتصادية</h3>
                  <p>تُقوّم البضائع بسعر البيع الحالي وقت إخراج الزكاة، وتُضاف للسيولة وتُخصم الديون العاجلة بنسبة 2.5%.</p>
                </div>
                <div class="zakat-inputs-grid">
                  <div class="form-field">
                    <label for="trade_inventory">قيمة البضائع والمخزون المعد للبيع (سعر السوق):</label>
                    <input type="number" id="trade_inventory" class="zakat-input" placeholder="0" min="0" />
                  </div>
                  <div class="form-field">
                    <label for="trade_cash">سيولة نقدية في حساب التجارة والخزائن:</label>
                    <input type="number" id="trade_cash" class="zakat-input" placeholder="0" min="0" />
                  </div>
                  <div class="form-field">
                    <label for="trade_receivables">ديون لك مرجوة التحصيل من العملاء:</label>
                    <input type="number" id="trade_receivables" class="zakat-input" placeholder="0" min="0" />
                  </div>
                  <div class="form-field deduct-field">
                    <label for="trade_debts">يُخصم: ديون والتزامات للموردين واجبة السداد:</label>
                    <input type="number" id="trade_debts" class="zakat-input" placeholder="0" min="0" />
                  </div>
                </div>
                <small class="hint-text">* الأصول الثابتة (العقارات، الآلات، السيارات، أدوات العمل) لا زكاة فيها.</small>
              </div>

              {/* Tab 4: Stocks & Investments */}
              <div class="zakat-tab-pane" id="tab-stocks">
                <div class="pane-header">
                  <h3>{icon('fa-chart-line')} زكاة الأسهم وصناديق الاستثمار</h3>
                  <p>للأسهم المعدة للمضاربة (تُزكى كامل قيمتها السوقية 2.5%) أو للاستثمار طويل الأجل (تُزكى أرباحها أو وعاؤها الزكوي).</p>
                </div>
                <div class="zakat-inputs-grid">
                  <div class="form-field">
                    <label for="stocks_trading">قيمة الأسهم بغرض المضاربة والتداول (القيمة السوقية):</label>
                    <input type="number" id="stocks_trading" class="zakat-input" placeholder="0" min="0" />
                  </div>
                  <div class="form-field">
                    <label for="stocks_invest_profits">عوائد وأرباح الأسهم الاستثمارية المحققة:</label>
                    <input type="number" id="stocks_invest_profits" class="zakat-input" placeholder="0" min="0" />
                  </div>
                  <div class="form-field">
                    <label for="mutual_funds">قيمة وثائق صناديق الاستثمار النقدية والمتوازنة:</label>
                    <input type="number" id="mutual_funds" class="zakat-input" placeholder="0" min="0" />
                  </div>
                </div>
              </div>

              {/* Tab 5: Kaffarah & Fidyah */}
              <div class="zakat-tab-pane" id="tab-kaffarah">
                <div class="pane-header">
                  <h3>{icon('fa-hands-holding-circle')} حاسبة الكفارات وفدية الصيام وزكاة الفطر</h3>
                  <p>حساب الإطعام الشرعي للمرضى وكبار السن وكفارات الأيمان ونقلها مباشرة للمستحقين.</p>
                </div>
                <div class="zakat-inputs-grid">
                  <div class="form-field">
                    <label for="fidyah_days">فدية إطعام مسكين (عن كل يوم إفطار بعذر دائم):</label>
                    <div class="input-with-subtext">
                      <input type="number" id="fidyah_days" class="zakat-input" placeholder="عدد الأيام" min="0" />
                      <span class="calc-rate-badge">40 ج.م / يوم (وجبة متكاملة)</span>
                    </div>
                  </div>
                  <div class="form-field">
                    <label for="kaffarah_yameen">كفارة اليمين (إطعام 10 مساكين عن كل يمين):</label>
                    <div class="input-with-subtext">
                      <input type="number" id="kaffarah_yameen" class="zakat-input" placeholder="عدد الأيمان" min="0" />
                      <span class="calc-rate-badge">400 ج.م / كفارة (10 مساكين)</span>
                    </div>
                  </div>
                  <div class="form-field">
                    <label for="fitr_persons">زكاة الفطر المباركة (عدد أفراد الأسرة):</label>
                    <div class="input-with-subtext">
                      <input type="number" id="fitr_persons" class="zakat-input" placeholder="عدد الأفراد" min="0" />
                      <span class="calc-rate-badge">45 ج.م / فرد (قيمة صاع القمح)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="zakat-actions-row">
                <button type="button" id="reset-zakat-btn" class="outline-btn mini-btn">
                  {icon('fa-rotate-right')} إعادة تعيين
                </button>
              </div>
            </div>

            {/* Right Summary & Checkout Panel */}
            <div class="zakat-summary-card">
              <div class="summary-header">
                <span class="summary-badge">{icon('fa-receipt')} ملخص حساب الزكاة</span>
                <h4>وعاء ومقدار الزكاة الواجبة</h4>
              </div>

              <div class="summary-breakdown">
                <div class="summary-row">
                  <span>إجمالي الأموال الخاضعة للزكاة:</span>
                  <strong id="total-wealth-val">0 ج.م</strong>
                </div>
                <div class="summary-row">
                  <span>حد النصاب الشرعي:</span>
                  <span id="nisab-threshold-val">297,500 ج.م</span>
                </div>
                <div class="summary-row status-row">
                  <span>حالة بلوغ النصاب:</span>
                  <b id="nisab-status-badge" class="badge-pending">أدخل المبالغ للحساب</b>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row total-row">
                  <div>
                    <span class="total-label">إجمالي الزكاة والصدقات الواجبة:</span>
                    <small>تشمل كافة الأقسام المحسوبة</small>
                  </div>
                  <div class="total-amount-box">
                    <strong id="final-zakat-amount">0</strong>
                    <small>جنيه مصري</small>
                  </div>
                </div>
              </div>

              <div class="zakat-destination-selector">
                <label for="zakat-campaign-select"><b>اختر مصرف الزكاة المفضل:</b></label>
                <select id="zakat-campaign-select">
                  <option value="general_zakat">صندوق مصارف الزكاة الشرعية (الأشد احتياجاً)</option>
                  <option value="medicine">زكاة علاج المرضى والعمليات الجراحية</option>
                  <option value="food">زكاة إطعام الطعام وكراتين الأسر</option>
                  <option value="school">زكاة كفالة طلبة العلم والتعليم</option>
                  <option value="debts">زكاة فك كرب الغارمين والغارمات</option>
                </select>
              </div>

              <div class="zakat-pay-box">
                <a id="donate-zakat-btn" href="/donate?type=زكاة" class="primary-btn zakat-submit-btn">
                  <span>{icon('fa-heart')} إخراج الزكاة الآن</span>
                  <i class="fa-solid fa-arrow-left"></i>
                </a>
                <p class="zakat-security-note">
                  {icon('fa-shield-check')} تبرع آمن 100% · يصدر إيصال رسمي معتمد برقم تسلسلي موثق
                </p>
              </div>

              <div class="zakat-sharia-card">
                <div class="sharia-icon">{icon('fa-book-quran')}</div>
                <div class="sharia-content">
                  <h5>المصارف الثمانية للزكاة</h5>
                  <p>"إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded interactive Calculator logic */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          const tabBtns = document.querySelectorAll('.zakat-tab-btn');
          const panes = document.querySelectorAll('.zakat-tab-pane');
          const inputs = document.querySelectorAll('.zakat-input, .mini-price-input');
          const resetBtn = document.getElementById('reset-zakat-btn');
          const donateBtn = document.getElementById('donate-zakat-btn');
          const campaignSelect = document.getElementById('zakat-campaign-select');

          // Switch Tabs
          tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
              tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
              });
              panes.forEach(p => p.classList.remove('active'));
              
              btn.classList.add('active');
              btn.setAttribute('aria-selected', 'true');
              const targetId = 'tab-' + btn.getAttribute('data-tab');
              const targetPane = document.getElementById(targetId);
              if (targetPane) targetPane.classList.add('active');
            });
          });

          // Calculation Engine
          function calculateZakat() {
            const gold21Price = parseFloat(document.getElementById('gold_21_price')?.value) || 3500;
            const silverPrice = parseFloat(document.getElementById('silver_price')?.value) || 45;
            const gold24Price = gold21Price * (24 / 21);
            const gold18Price = gold21Price * (18 / 21);
            const nisabThreshold = 85 * gold21Price;

            const nisabEl = document.getElementById('nisab-threshold-val');
            if (nisabEl) nisabEl.textContent = Math.round(nisabThreshold).toLocaleString('ar-EG') + ' ج.م';

            // Cash
            const cashHand = parseFloat(document.getElementById('cash_in_hand')?.value) || 0;
            const cashBank = parseFloat(document.getElementById('cash_in_bank')?.value) || 0;
            const cashRec = parseFloat(document.getElementById('cash_receivables')?.value) || 0;
            const cashDebts = parseFloat(document.getElementById('cash_debts')?.value) || 0;
            const netCash = Math.max(0, (cashHand + cashBank + cashRec) - cashDebts);

            // Gold & Silver
            const g24 = parseFloat(document.getElementById('gold_24_grams')?.value) || 0;
            const g21 = parseFloat(document.getElementById('gold_21_grams')?.value) || 0;
            const g18 = parseFloat(document.getElementById('gold_18_grams')?.value) || 0;
            const silver = parseFloat(document.getElementById('silver_grams')?.value) || 0;
            const goldTotalValue = (g24 * gold24Price) + (g21 * gold21Price) + (g18 * gold18Price) + (silver * silverPrice);

            // Trade
            const tradeInv = parseFloat(document.getElementById('trade_inventory')?.value) || 0;
            const tradeCash = parseFloat(document.getElementById('trade_cash')?.value) || 0;
            const tradeRec = parseFloat(document.getElementById('trade_receivables')?.value) || 0;
            const tradeDebts = parseFloat(document.getElementById('trade_debts')?.value) || 0;
            const netTrade = Math.max(0, (tradeInv + tradeCash + tradeRec) - tradeDebts);

            // Stocks
            const stocksTrade = parseFloat(document.getElementById('stocks_trading')?.value) || 0;
            const stocksProfits = parseFloat(document.getElementById('stocks_invest_profits')?.value) || 0;
            const mutualFunds = parseFloat(document.getElementById('mutual_funds')?.value) || 0;
            const netStocks = stocksTrade + stocksProfits + mutualFunds;

            // Kaffarah & Fidyah
            const fidyahDays = parseFloat(document.getElementById('fidyah_days')?.value) || 0;
            const kaffarahYameen = parseFloat(document.getElementById('kaffarah_yameen')?.value) || 0;
            const fitrPersons = parseFloat(document.getElementById('fitr_persons')?.value) || 0;
            const kaffarahTotal = (fidyahDays * 40) + (kaffarahYameen * 400) + (fitrPersons * 45);

            // Total Wealth for Zakat
            const totalZakatWealth = netCash + goldTotalValue + netTrade + netStocks;
            const totalWealthEl = document.getElementById('total-wealth-val');
            if (totalWealthEl) totalWealthEl.textContent = Math.round(totalZakatWealth).toLocaleString('ar-EG') + ' ج.م';

            const statusBadge = document.getElementById('nisab-status-badge');
            let zakatDue = 0;

            if (statusBadge) {
              if (totalZakatWealth === 0 && kaffarahTotal === 0) {
                statusBadge.textContent = 'أدخل المبالغ للحساب';
                statusBadge.className = 'badge-pending';
              } else if (totalZakatWealth >= nisabThreshold) {
                statusBadge.textContent = 'بلغ النصاب الشرعي ✓ (تجب الزكاة)';
                statusBadge.className = 'badge-reached';
                zakatDue = totalZakatWealth * 0.025;
              } else if (totalZakatWealth > 0) {
                statusBadge.textContent = 'أقل من النصاب (مستحب كصدقة)';
                statusBadge.className = 'badge-below';
                zakatDue = 0;
              }
            }

            const finalGrandTotal = Math.round(zakatDue + kaffarahTotal);
            const finalAmountEl = document.getElementById('final-zakat-amount');
            if (finalAmountEl) finalAmountEl.textContent = finalGrandTotal.toLocaleString('ar-EG');

            // Update Donate Button Link
            const selectedCampaign = campaignSelect?.value || 'general_zakat';
            if (donateBtn) {
              if (finalGrandTotal > 0) {
                donateBtn.href = '/donate?amount=' + finalGrandTotal + '&type=' + encodeURIComponent('زكاة مال') + '&campaign=' + encodeURIComponent(selectedCampaign);
              } else {
                donateBtn.href = '/donate?type=' + encodeURIComponent('زكاة مال');
              }
            }
          }

          inputs.forEach(inp => inp.addEventListener('input', calculateZakat));
          campaignSelect?.addEventListener('change', calculateZakat);

          resetBtn?.addEventListener('click', () => {
            inputs.forEach(inp => {
              if (inp.id !== 'gold_21_price' && inp.id !== 'silver_price') {
                inp.value = '';
              }
            });
            calculateZakat();
          });

          calculateZakat();
        });
      `}} />
    </Layout>
  )
}

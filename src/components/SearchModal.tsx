import { icon } from './shared'

export function SearchModal() {
  return (
    <>
      {/* Global Search Backdrop & Modal Dialog */}
      <div class="search-modal-backdrop" id="search-modal-backdrop" aria-hidden="true">
        <div class="search-modal-dialog" role="dialog" aria-modal="true" aria-label="البحث الذكي الشامل">
          <div class="search-modal-header">
            <div class="search-input-wrap">
              <span class="search-icon-inside">{icon('fa-magnifying-glass')}</span>
              <input
                type="text"
                id="global-search-input"
                placeholder="ابحث عن حملة، خبر، كفالة، زكاة، فعالية، أو وظيفة..."
                autocomplete="off"
                aria-autocomplete="list"
              />
              <button type="button" id="search-clear-btn" class="search-clear-btn" aria-label="مسح نص البحث" style="display:none">
                {icon('fa-xmark')}
              </button>
            </div>
            <button type="button" id="search-modal-close" class="search-close-btn" aria-label="إغلاق نافذة البحث">
              <kbd>Esc</kbd>
            </button>
          </div>

          {/* Quick Filter Tag Chips */}
          <div class="search-quick-tags">
            <span>كلمات مقترحة:</span>
            <button type="button" class="quick-tag-btn" data-query="زكاة">زكاة المال</button>
            <button type="button" class="quick-tag-btn" data-query="دواء">علاج ودواء</button>
            <button type="button" class="quick-tag-btn" data-query="أيتام">كفالة أيتام</button>
            <button type="button" class="quick-tag-btn" data-query="تطوع">فرص التطوع</button>
            <button type="button" class="quick-tag-btn" data-query="إيصال">التحقق من إيصال</button>
          </div>

          {/* Search Results Container */}
          <div class="search-results-list" id="search-results-list">
            <div class="search-initial-hint">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              <p>ابدأ بالكتابة للبحث الفوري في كافة أقسام ومبادرات المؤسسة</p>
              <small>يمكنك أيضاً استخدام الأسهم للتنقل والضغط على Enter للاختيار</small>
            </div>
          </div>

          <div class="search-modal-footer">
            <div class="keyboard-hints">
              <span><kbd>↑</kbd> <kbd>↓</kbd> للتنقل</span>
              <span><kbd>↵</kbd> للفتح</span>
              <span><kbd>Esc</kbd> للإغلاق</span>
            </div>
            <span class="search-brand-note">{icon('fa-shield-heart')} مؤسسة د. عمر هشام الخيرية</span>
          </div>
        </div>
      </div>

      {/* Embedded Search Modal Logic */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          const backdrop = document.getElementById('search-modal-backdrop');
          const searchInput = document.getElementById('global-search-input');
          const resultsList = document.getElementById('search-results-list');
          const closeBtn = document.getElementById('search-modal-close');
          const clearBtn = document.getElementById('search-clear-btn');
          const quickTags = document.querySelectorAll('.quick-tag-btn');
          let searchDebounceTimer = null;
          let activeIndex = -1;

          function openSearchModal() {
            if (!backdrop) return;
            backdrop.classList.add('open');
            backdrop.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            setTimeout(() => searchInput?.focus(), 50);
          }

          function closeSearchModal() {
            if (!backdrop) return;
            backdrop.classList.remove('open');
            backdrop.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (searchInput) searchInput.value = '';
            if (clearBtn) clearBtn.style.display = 'none';
            if (resultsList) {
              resultsList.innerHTML = '<div class="search-initial-hint"><i class="fa-solid fa-wand-magic-sparkles"></i><p>ابدأ بالكتابة للبحث الفوري في كافة أقسام ومبادرات المؤسسة</p></div>';
            }
          }

          // Triggers
          document.querySelectorAll('.open-search-trigger').forEach(el => {
            el.addEventListener('click', (e) => {
              e.preventDefault();
              openSearchModal();
            });
          });

          closeBtn?.addEventListener('click', closeSearchModal);
          backdrop?.addEventListener('click', (e) => {
            if (e.target === backdrop) closeSearchModal();
          });

          // Keyboard shortcut: Cmd+K / Ctrl+K / '/'
          window.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
              e.preventDefault();
              if (backdrop?.classList.contains('open')) {
                closeSearchModal();
              } else {
                openSearchModal();
              }
            } else if (e.key === 'Escape' && backdrop?.classList.contains('open')) {
              closeSearchModal();
            }
          });

          // Clear button
          clearBtn?.addEventListener('click', () => {
            if (searchInput) {
              searchInput.value = '';
              searchInput.focus();
              clearBtn.style.display = 'none';
              resultsList.innerHTML = '<div class="search-initial-hint"><i class="fa-solid fa-wand-magic-sparkles"></i><p>ابدأ بالكتابة للبحث الفوري في كافة أقسام ومبادرات المؤسسة</p></div>';
            }
          });

          // Quick Tags Click
          quickTags.forEach(tag => {
            tag.addEventListener('click', () => {
              const q = tag.getAttribute('data-query') || '';
              if (searchInput) {
                searchInput.value = q;
                clearBtn.style.display = 'block';
                performSearch(q);
              }
            });
          });

          // Search execution
          async function performSearch(query) {
            query = query.trim();
            if (query.length < 2) {
              resultsList.innerHTML = '<div class="search-initial-hint"><i class="fa-solid fa-wand-magic-sparkles"></i><p>ابدأ بالكتابة للبحث الفوري في كافة أقسام ومبادرات المؤسسة</p></div>';
              return;
            }

            resultsList.innerHTML = '<div class="search-loading-state"><i class="fa-solid fa-spinner fa-spin"></i><span>جاري البحث في مبادرات المؤسسة...</span></div>';

            try {
              const res = await fetch('/api/search?q=' + encodeURIComponent(query));
              const data = await res.json();
              const results = data.results || [];

              if (results.length === 0) {
                resultsList.innerHTML = '<div class="search-no-results"><i class="fa-solid fa-magnifying-glass"></i><h4>لم نجد نتائج مطابقة لـ "' + query + '"</h4><p>جرب البحث بكلمات أخرى مثل "زكاة" أو "علاج" أو تواصل معنا مباشرة.</p></div>';
                return;
              }

              let html = '';
              results.forEach((item, idx) => {
                html += '<a href="' + item.url + '" class="search-result-item" data-index="' + idx + '">';
                html += '<div class="result-icon-box"><i class="fa-solid ' + (item.icon || 'fa-arrow-left') + '"></i></div>';
                html += '<div class="result-content-box">';
                html += '<div class="result-top-row"><span class="result-cat-badge">' + item.category + '</span><h4 class="result-title">' + item.title + '</h4></div>';
                html += '<p class="result-snippet">' + item.snippet + '</p>';
                html += '</div>';
                html += '<i class="fa-solid fa-arrow-left result-arrow"></i>';
                html += '</a>';
              });

              resultsList.innerHTML = html;
              activeIndex = -1;
            } catch (err) {
              resultsList.innerHTML = '<div class="search-no-results"><p>تعذر إجراء البحث حالياً. يرجى المحاولة مرة أخرى.</p></div>';
            }
          }

          searchInput?.addEventListener('input', (e) => {
            const val = e.target.value;
            clearBtn.style.display = val ? 'block' : 'none';
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => performSearch(val), 180);
          });

          // Keyboard navigation through results
          searchInput?.addEventListener('keydown', (e) => {
            const items = resultsList?.querySelectorAll('.search-result-item');
            if (!items || items.length === 0) return;

            if (e.key === 'ArrowDown') {
              e.preventDefault();
              activeIndex = Math.min(items.length - 1, activeIndex + 1);
              updateActiveItem(items);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              activeIndex = Math.max(0, activeIndex - 1);
              updateActiveItem(items);
            } else if (e.key === 'Enter' && activeIndex >= 0) {
              e.preventDefault();
              items[activeIndex]?.click();
            }
          });

          function updateActiveItem(items) {
            items.forEach((it, idx) => {
              if (idx === activeIndex) {
                it.classList.add('selected');
                it.scrollIntoView({ block: 'nearest' });
              } else {
                it.classList.remove('selected');
              }
            });
          }
        });
      `}} />
    </>
  )
}

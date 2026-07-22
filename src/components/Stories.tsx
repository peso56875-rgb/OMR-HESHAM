import { Layout, PageHero } from './shared'
import type { UserSession } from '../types'

export function Stories({ stories = [], user }: { stories?: any[], user?: UserSession }) {
  const renderStories = stories.length > 0 ? stories : [
    { name: 'أم محمد', role: 'إحدى المستفيدات', content: 'لم تكن المساعدة مجرد دواء؛ كانت رسالة تقول إننا لسنا وحدنا. جزاكم الله عنا كل خير.' },
    { name: 'والد طالبة', role: 'من برنامج التعليم', content: 'حين جاءت المؤسسة لتكريم ابنتي في بيتنا، شعرتُ أن تعبها وتعبنا لم يذهب سدى.' },
    { name: 'متطوع ميداني', role: 'فريق المؤسسة', content: 'دخلتُ لأساعد الآخرين، فوجدت أن التطوع غيّرني أنا أيضًا، وعلّمني معنى النعمة.' }
  ]
  return <Layout user={user} title="قصص النجاح | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="قصص النجاح" title={'أثرٌ يُحكى،<br/><em>وأملٌ ينتقل.</em>'} text="نحفظ خصوصية المستفيدين، ونشارك كلماتهم التي تذكّرنا جميعًا بأن الخير يصل." />
    <section class="stories-grid section-pad">
      {renderStories.map((s: any) => <article class="story-card reveal">
        <div class="stars">{'★'.repeat(s.rating || 5)}</div>
        <blockquote>“{s.content}”</blockquote>
        <div>
          <span>{s.name.slice(0, 2)}</span>
          <p><b>{s.name}</b><small>{s.role}</small></p>
        </div>
      </article>)}
    </section>
  </Layout>
}

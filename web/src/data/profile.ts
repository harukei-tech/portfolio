// プロフィール情報。ここを書き換えるとサイト全体に反映されます。
export const profile = {
  name: 'harukei',
  role: 'Software Engineer',
  // \n で改行して表示されます
  tagline: '主にwebアプリ開発の仕事をしています。\nAIやbot開発、自動化等に興味があります。',
  bio: [
    '主にLaravel(PHP)でWebアプリケーション開発を行っています。',
    'Slackへ業務効率化botを取り入れたり、趣味でOSSを触ったりしています。',
  ],
  location: 'Japan',
  links: {
    github: 'https://github.com/harukei-tech',
    x: 'https://x.com/oggy_hk',
    qiita: 'https://qiita.com/harukei',
  },
  skills: [
    { category: 'Backend', items: ['PHP(Laravel)', 'Java', 'Golang', 'Python', 'Node.js', 'Shell Script'] },
    { category: 'Frontend', items: ['Vue.js', 'Next.js', 'Astro',] },
    { category: 'Infra', items: ['AWS', 'Terraform', 'GitHub Actions', 'Docker'] },
    { category: 'Bot', items: ['Slack Bot', 'LINE WORKS Bot', 'Discord Bot'] },
    { category: 'AI', items: ['Github Copilot', 'Claude Code', 'LocalAI(Ollama)'] }
  ],
};

export const site = {
  title: `${profile.name} | Portfolio`,
  // 検索結果などに出る説明文では改行を詰める
  description: profile.tagline.replace(/\n/g, ''),
};

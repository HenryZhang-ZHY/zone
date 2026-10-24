export interface DemoEntry {
  date: string
  datetime: string
  title: string
  excerpt?: string
  href: string
  meta?: string[]
  lang?: string
}

export interface DemoYear {
  year: string
  count: string
  entries: DemoEntry[]
}

export const archive: DemoYear[] = [
  {
    year: '2026',
    count: '10',
    entries: [
      {
        date: '10-11',
        datetime: '2026-10-11',
        title: '仓位管理：从降低回撤到与回撤共舞',
        excerpt:
          '用单只股票 20% 的仓位上限降低回撤对总账户的冲击，用分批建仓给下跌留出预案，并用三条规矩防止补仓失控。',
        href: 'https://shuzhi.zone/zh-hans/blog/position-sizing-dancing-with-drawdowns/',
        meta: ['居民资产配置手册', '中文'],
        lang: 'zh-Hans',
      },
      {
        date: '09-27',
        datetime: '2026-09-27',
        title: 'dowse: A Local Alternative to Sourcegraph and GitHub Code Search',
        excerpt:
          'A free, open-source desktop app and CLI that searches code across every Git repository on your machine.',
        href: 'https://shuzhi.zone/en/blog/dowse-local-code-search-across-git-repositories/',
        meta: ['Open source'],
      },
      {
        date: '09-25',
        datetime: '2026-09-25',
        title: '[中英对照] The Nature of the Firm 企业的性质',
        excerpt: 'R. H. Coase, Economica, November 1937. A bilingual reading of the paper that asked why firms exist.',
        href: 'https://shuzhi.zone/en/blog/the-nature-of-the-firm/',
        meta: ['Translation'],
      },
      {
        date: '09-20',
        datetime: '2026-09-20',
        title: '[中英对照] the senior engineer death spiral 资深工程师的死亡螺旋',
        excerpt: 'On proving yourself, burning out, and being a good teammate.',
        href: 'https://shuzhi.zone/en/blog/the-senior-engineer-death-spiral/',
        meta: ['Translation'],
      },
      {
        date: '09-18',
        datetime: '2026-09-18',
        title: 'refuge：让 OneDrive 成为私人 Git 仓库的存储层',
        excerpt:
          '不部署 Gitea、GitLab 这类私有 Git host，也能把 OneDrive 当作存储层，备份、恢复并跨设备使用自己的私人 Git 仓库。',
        href: 'https://shuzhi.zone/zh-hans/blog/refuge/',
        meta: ['Open source', '中文'],
        lang: 'zh-Hans',
      },
      {
        date: '09-10',
        datetime: '2026-09-10',
        title: 'Does a Modern .NET Project Still Need ComVisible(false)?',
        excerpt:
          'What the assembly-level ComVisible attribute controls, why older C# projects contain it, and what a new project should do.',
        href: 'https://shuzhi.zone/en/blog/do-modern-dotnet-projects-need-comvisible/',
        meta: ['.NET'],
      },
    ],
  },
  {
    year: '2025',
    count: '4',
    entries: [
      {
        date: '05-31',
        datetime: '2025-05-31',
        title: '关注点分离（Separation of Concerns）',
        excerpt: '从网页的内容与样式分离，到分层架构与模块划分，用分离降低系统复杂度。',
        href: 'https://shuzhi.zone/zh-hans/blog/separation-of-concerns/',
        meta: ['中文'],
        lang: 'zh-Hans',
      },
      {
        date: '04-12',
        datetime: '2025-04-12',
        title: '买入并持有寿险股',
        excerpt: '从寿险的业务模式与利润来源出发，看低利率与资管新规下分红险的负债端增长。',
        href: 'https://shuzhi.zone/zh-hans/blog/buy-and-hold-life-insurance-stocks/',
        meta: ['投资', '中文'],
        lang: 'zh-Hans',
      },
      {
        date: '03-02',
        datetime: '2025-03-02',
        title: 'How to Fix a Bug',
        excerpt: 'A small, repeatable procedure for turning a report into a failing test and a fix that stays fixed.',
        href: 'https://shuzhi.zone/en/blog/how-to-fix-a-bug/',
      },
    ],
  },
  {
    year: '2024',
    count: '2',
    entries: [
      {
        date: '11-08',
        datetime: '2024-11-08',
        title: 'DevOps Reading List',
        excerpt: 'A curated DevOps and CI engineering reading list: Prow and ChatOps, GitHub Actions, and the books worth rereading.',
        href: 'https://shuzhi.zone/en/blog/devops-reading-list/',
        meta: ['Reading list'],
      },
      {
        date: '08-19',
        datetime: '2024-08-19',
        title: 'How to Manage Local Files in a Shared Git Repository',
        excerpt: 'Keeping machine-local configuration out of a shared repository without fighting the ignore file.',
        href: 'https://shuzhi.zone/en/blog/how-to-manage-local-files-in-a-shared-git-repository/',
      },
    ],
  },
]

/**
 * The archive is one flat list. Year grouping lives only in the fixture so the
 * entries stay chronological; it is not part of the page pattern.
 */
export const posts: DemoEntry[] = archive.flatMap((year) =>
  year.entries.map((entry) => ({ ...entry, date: entry.datetime })),
)

export interface DemoBook {
  title: string
  cover: string
  href: string
}

export const books: DemoBook[] = [
  { title: '高效能人士的七个习惯', cover: '/books/s34893577.jpg', href: 'https://book.douban.com/subject/35124134/' },
  { title: '打造第二大脑', cover: '/books/s34691301.jpg', href: 'https://book.douban.com/subject/36636224/' },
  { title: '暗时间', cover: '/books/s6586365.jpg', href: 'https://book.douban.com/subject/6709809/' },
  { title: '卓有成效的工程师', cover: '/books/s34307316.jpg', href: 'https://book.douban.com/subject/35948443/' },
  { title: '系统思考', cover: '/books/s27414803.jpg', href: 'https://book.douban.com/subject/25963524/' },
  { title: 'Software Engineering at Google', cover: '/books/s35043704.jpg', href: 'https://book.douban.com/subject/34875994/' },
  { title: '俞军产品方法论', cover: '/books/s33543538.jpg', href: 'https://book.douban.com/subject/34907971/' },
  { title: '像火箭科学家一样思考', cover: '/books/s33742618.jpg', href: 'https://book.douban.com/subject/35228079/' },
  { title: 'Clean Code', cover: '/books/s4103991.jpg', href: 'https://book.douban.com/subject/4199741/' },
  { title: '重构：改善既有代码的设计', cover: '/books/s30014452.jpg', href: 'https://book.douban.com/subject/30468597/' },
  { title: 'The Art of Unit Testing', cover: '/books/s4195698.jpg', href: 'https://book.douban.com/subject/3874333/' },
  { title: 'Pro Git', cover: '/books/s27715507.jpg', href: 'https://book.douban.com/subject/26208470/' },
]

export interface DemoEpisode {
  title: string
  href: string
  show: string
  cover: string
  source: string
  notes?: { text: string; at?: string }[]
}

export const episodes: DemoEpisode[] = [
  {
    title: '在拼多多工作：身体在地狱，灵魂在天堂',
    href: 'https://www.xiaoyuzhoufm.com/episode/660803a01519139e4f8be08c',
    show: '小马宋商业观察',
    cover: 'https://image.xyzcdn.net/FoQPUZCPwVzCQhR7gAnRWaUPuFcA.jpg',
    source: '小宇宙',
    notes: [
      {
        at: '00:12',
        text: '他们实际上践行的是管理的科学主义，相信这个世界存在着客观规律，客观规律可被认识可被发现，基于客观规律可以建立一些基本原则，遵循原则就能导向成功。',
      },
      { text: '适合在地铁上听完：它不讲段子，只把「怎么让一大群人同时高效」一层层拆开。' },
    ],
  },
  {
    title: '用3张表的思路看待家庭财务：管钱，易如反掌！',
    href: 'https://www.xiaoyuzhoufm.com/episode/67b4abe6606e5c5940544785',
    show: '面基',
    cover: 'https://image.xyzcdn.net/Ftol1VYmqtTUXqIxdMjkt0BcBuFX.png',
    source: '小宇宙',
  },
  {
    title: 'E53.《一如既往》：历史不会重复，但它自然成韵',
    href: 'https://www.xiaoyuzhoufm.com/episode/661de4895dae7932c6c0923c',
    show: '面基',
    cover: 'https://image.xyzcdn.net/Ftol1VYmqtTUXqIxdMjkt0BcBuFX.png',
    source: '小宇宙',
  },
  {
    title: 'E120.经济上行期的美，增速下行期的狂',
    href: 'https://www.xiaoyuzhoufm.com/episode/68a3dcbd42cc2798e7414974',
    show: '面基',
    cover: 'https://image.xyzcdn.net/Ftol1VYmqtTUXqIxdMjkt0BcBuFX.png',
    source: '小宇宙',
  },
  {
    title: '101. 对 YouWare 创始人明超平 3 小时访谈：今天的 Agent 像大猩猩刚拿起一根烧火棍',
    href: 'https://www.xiaoyuzhoufm.com/episode/68372c9631215eb5063bcdb1',
    show: '张小珺Jùn｜商业访谈录',
    cover: 'https://image.xyzcdn.net/Fnuyt9PQDQx0I0wlErG3ZHcW9Gpu.png',
    source: '小宇宙',
  },
  {
    title: '118: 天生卷王郭人杰：从 97 年的扫地机总裁到创业做家庭通用机器人',
    href: 'https://www.xiaoyuzhoufm.com/episode/68379234661c1af455c9e42c',
    show: '晚点聊 LateTalk',
    cover: 'https://bts-image.xyzcdn.net/aHR0cHM6Ly9tZWRpYTI0LmZpcmVzaWRlLmZtL2ZpbGUvZmlyZXNpZGUtaW1hZ2VzLTIwMjQvcG9kY2FzdHMvaW1hZ2VzLzEvMTlhNDlmNTItMjhlZS00ZTI1LWI4ZTktNGYwZWU3MDkxN2UwL2NvdmVyLmpwZz92PTc=.jpg',
    source: '小宇宙',
  },
]

export const essayHeadings = [
  { depth: 2, text: 'The measure', slug: 'the-measure' },
  { depth: 3, text: 'A measure in characters', slug: 'a-measure-in-characters' },
  { depth: 2, text: 'The margin', slug: 'the-margin' },
  { depth: 2, text: 'The voice', slug: 'the-voice' },
  { depth: 2, text: 'The weather', slug: 'the-weather' },
  { depth: 2, text: 'A page, not a screen', slug: 'a-page-not-a-screen' },
]

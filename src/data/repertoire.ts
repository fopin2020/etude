/**
 * Curated piano repertoire database.
 *
 * Scope: composers and works most commonly studied/performed in Korean
 * piano programs. Difficulty ratings follow the Henle Verlag scale (1-9),
 * widely used in classical pedagogy. Where Henle has not published a
 * rating, or where it varies across the work, the field is omitted.
 *
 * Difficult-passage notes are intentionally limited to consensus
 * observations from standard pedagogical literature (Schnabel, Cortot,
 * Kleczyński, Hofmann, Kentner, Long, Gieseking, et al). Anything not
 * widely agreed upon is omitted rather than fabricated.
 */

export interface Composer {
  id: string
  name: string         // Korean name
  era: string          // 시대
  years: string        // '1810–1849'
}

export interface PieceEntry {
  id: string           // local id within work
  label: string        // dial display, e.g. 'No. 1 다장조'
  fullTitle?: string   // long-form display in preview
  nickname?: string    // '폭포'
  difficulty?: number  // Henle 1-9
  difficultSections?: string
  notes?: string
}

export interface Work {
  id: string
  composerId: string
  category: string     // '에튀드' '소나타' '발라드' etc.
  catSort: number      // ordering within composer
  opusLabel: string    // 'Op. 10', 'BWV 772', 'D 899'
  opusSort: number     // ordering within category
  pieces: PieceEntry[]
}

// ---------------------------------------------------------------------------
// COMPOSERS
// ---------------------------------------------------------------------------
export const COMPOSERS: Composer[] = [
  { id: 'grieg',    name: '그리그',     era: '낭만', years: '1843–1907' },
  { id: 'debussy',  name: '드뷔시',     era: '인상', years: '1862–1918' },
  { id: 'ravel',    name: '라벨',       era: '인상', years: '1875–1937' },
  { id: 'rach',     name: '라흐마니노프', era: '낭만', years: '1873–1943' },
  { id: 'liszt',    name: '리스트',     era: '낭만', years: '1811–1886' },
  { id: 'mendel',   name: '멘델스존',   era: '낭만', years: '1809–1847' },
  { id: 'mozart',   name: '모차르트',   era: '고전', years: '1756–1791' },
  { id: 'bach',     name: '바흐',       era: '바로크', years: '1685–1750' },
  { id: 'beethoven',name: '베토벤',     era: '고전·낭만', years: '1770–1827' },
  { id: 'brahms',   name: '브람스',     era: '낭만', years: '1833–1897' },
  { id: 'scarlatti',name: '스카를라티', era: '바로크', years: '1685–1757' },
  { id: 'scriabin', name: '스크리아빈', era: '낭만·근대', years: '1872–1915' },
  { id: 'schumann', name: '슈만',       era: '낭만', years: '1810–1856' },
  { id: 'schubert', name: '슈베르트',   era: '고전·낭만', years: '1797–1828' },
  { id: 'chopin',   name: '쇼팽',       era: '낭만', years: '1810–1849' },
  { id: 'tchai',    name: '차이콥스키', era: '낭만', years: '1840–1893' },
  { id: 'prokofiev',name: '프로코피예프',era: '근대', years: '1891–1953' },
  { id: 'haydn',    name: '하이든',     era: '고전', years: '1732–1809' },
]

// ---------------------------------------------------------------------------
// WORKS — grouped by composer
// ---------------------------------------------------------------------------
export const WORKS: Work[] = [
  // ===========================================================
  // J.S. BACH
  // ===========================================================
  {
    id: 'bach-inventions', composerId: 'bach', category: '인벤션', catSort: 1,
    opusLabel: 'BWV 772–786 (전곡)', opusSort: 1,
    pieces: [
      { id: '1',  label: 'No. 1 다장조 BWV 772',  difficulty: 3, notes: '인벤션 입문곡. 주제 모방의 기초.' },
      { id: '2',  label: 'No. 2 다단조 BWV 773',  difficulty: 4, notes: '엄격한 캐논. 양손 독립이 관건.' },
      { id: '3',  label: 'No. 3 라장조 BWV 774',  difficulty: 3 },
      { id: '4',  label: 'No. 4 라단조 BWV 775',  difficulty: 3 },
      { id: '5',  label: 'No. 5 마♭장조 BWV 776', difficulty: 3 },
      { id: '6',  label: 'No. 6 마장조 BWV 777',  difficulty: 4 },
      { id: '7',  label: 'No. 7 마단조 BWV 778',  difficulty: 3 },
      { id: '8',  label: 'No. 8 바장조 BWV 779',  difficulty: 3 },
      { id: '9',  label: 'No. 9 바단조 BWV 780',  difficulty: 4 },
      { id: '10', label: 'No. 10 사장조 BWV 781', difficulty: 3 },
      { id: '11', label: 'No. 11 사단조 BWV 782', difficulty: 4 },
      { id: '12', label: 'No. 12 가장조 BWV 783', difficulty: 3 },
      { id: '13', label: 'No. 13 가단조 BWV 784', difficulty: 3 },
      { id: '14', label: 'No. 14 시♭장조 BWV 785',difficulty: 3 },
      { id: '15', label: 'No. 15 시단조 BWV 786', difficulty: 3 },
    ],
  },
  {
    id: 'bach-sinfonia', composerId: 'bach', category: '신포니아 (3성 인벤션)', catSort: 2,
    opusLabel: 'BWV 787–801 (전곡)', opusSort: 1,
    pieces: [
      { id: '1',  label: 'No. 1 다장조 BWV 787',  difficulty: 4 },
      { id: '2',  label: 'No. 2 다단조 BWV 788',  difficulty: 4 },
      { id: '3',  label: 'No. 3 라장조 BWV 789',  difficulty: 4 },
      { id: '4',  label: 'No. 4 라단조 BWV 790',  difficulty: 5 },
      { id: '5',  label: 'No. 5 마♭장조 BWV 791', difficulty: 4 },
      { id: '6',  label: 'No. 6 마장조 BWV 792',  difficulty: 4 },
      { id: '7',  label: 'No. 7 마단조 BWV 793',  difficulty: 4 },
      { id: '8',  label: 'No. 8 바장조 BWV 794',  difficulty: 4 },
      { id: '9',  label: 'No. 9 바단조 BWV 795',  difficulty: 5, notes: '반음계 주제. 3성 텍스처 중 가장 짙은 정서.' },
      { id: '10', label: 'No. 10 사장조 BWV 796', difficulty: 4 },
      { id: '11', label: 'No. 11 사단조 BWV 797', difficulty: 4 },
      { id: '12', label: 'No. 12 가장조 BWV 798', difficulty: 5 },
      { id: '13', label: 'No. 13 가단조 BWV 799', difficulty: 4 },
      { id: '14', label: 'No. 14 시♭장조 BWV 800',difficulty: 4 },
      { id: '15', label: 'No. 15 시단조 BWV 801', difficulty: 4 },
    ],
  },
  {
    id: 'bach-wtc1', composerId: 'bach', category: '평균율 클라비어곡집 1권', catSort: 3,
    opusLabel: 'BWV 846–869', opusSort: 1,
    pieces: [
      { id: '1',  label: 'No. 1 다장조 BWV 846',   difficulty: 4, notes: '프렐류드는 분산화음의 모범. 푸가는 4성.' },
      { id: '2',  label: 'No. 2 다단조 BWV 847',   difficulty: 4 },
      { id: '3',  label: 'No. 3 다#장조 BWV 848',  difficulty: 6 },
      { id: '4',  label: 'No. 4 다#단조 BWV 849',  difficulty: 6, notes: '5성 푸가. 1권에서 가장 무거운 푸가.' },
      { id: '5',  label: 'No. 5 라장조 BWV 850',   difficulty: 5 },
      { id: '6',  label: 'No. 6 라단조 BWV 851',   difficulty: 5 },
      { id: '7',  label: 'No. 7 마♭장조 BWV 852',  difficulty: 5 },
      { id: '8',  label: 'No. 8 마♭단조/라#단조 BWV 853', difficulty: 6 },
      { id: '9',  label: 'No. 9 마장조 BWV 854',   difficulty: 5 },
      { id: '10', label: 'No. 10 마단조 BWV 855',  difficulty: 5 },
      { id: '11', label: 'No. 11 바장조 BWV 856',  difficulty: 5 },
      { id: '12', label: 'No. 12 바단조 BWV 857',  difficulty: 6 },
      { id: '13', label: 'No. 13 바#장조 BWV 858', difficulty: 5 },
      { id: '14', label: 'No. 14 바#단조 BWV 859', difficulty: 5 },
      { id: '15', label: 'No. 15 사장조 BWV 860',  difficulty: 5 },
      { id: '16', label: 'No. 16 사단조 BWV 861',  difficulty: 5 },
      { id: '17', label: 'No. 17 가♭장조 BWV 862', difficulty: 5 },
      { id: '18', label: 'No. 18 사#단조 BWV 863', difficulty: 5 },
      { id: '19', label: 'No. 19 가장조 BWV 864',  difficulty: 5 },
      { id: '20', label: 'No. 20 가단조 BWV 865',  difficulty: 5 },
      { id: '21', label: 'No. 21 시♭장조 BWV 866', difficulty: 5 },
      { id: '22', label: 'No. 22 시♭단조 BWV 867', difficulty: 6 },
      { id: '23', label: 'No. 23 시장조 BWV 868',  difficulty: 5 },
      { id: '24', label: 'No. 24 시단조 BWV 869',  difficulty: 6 },
    ],
  },
  {
    id: 'bach-french', composerId: 'bach', category: '프랑스 모음곡', catSort: 4,
    opusLabel: 'BWV 812–817 (6곡)', opusSort: 1,
    pieces: [
      { id: '1', label: 'No. 1 라단조 BWV 812', difficulty: 4 },
      { id: '2', label: 'No. 2 다단조 BWV 813', difficulty: 5 },
      { id: '3', label: 'No. 3 시단조 BWV 814', difficulty: 5 },
      { id: '4', label: 'No. 4 마♭장조 BWV 815', difficulty: 5 },
      { id: '5', label: 'No. 5 사장조 BWV 816', difficulty: 5, notes: '6곡 중 가장 자주 연주됨. 지그가 특히 알려짐.' },
      { id: '6', label: 'No. 6 마장조 BWV 817', difficulty: 5 },
    ],
  },
  {
    id: 'bach-italian', composerId: 'bach', category: '이탈리아 협주곡 / 단편', catSort: 5,
    opusLabel: 'BWV 971', opusSort: 1,
    pieces: [
      { id: 'all', label: '이탈리아 협주곡 바장조 (전악장)', difficulty: 6, notes: '독주 클라비어로 이탈리아 협주곡 양식을 모사. 1·3악장의 토카타적 추진력과 2악장의 노래선이 대비.' },
    ],
  },

  // ===========================================================
  // SCARLATTI
  // ===========================================================
  {
    id: 'scar-sonatas', composerId: 'scarlatti', category: '소나타', catSort: 1,
    opusLabel: '대표 소나타 (선별)', opusSort: 1,
    pieces: [
      { id: 'k1',   label: 'K. 1 라단조' },
      { id: 'k9',   label: 'K. 9 라단조 (Pastorale)', nickname: '목가' },
      { id: 'k27',  label: 'K. 27 시단조' },
      { id: 'k87',  label: 'K. 87 시단조', notes: '느린 4성 푸가풍. 가장 깊이 있다 평가받는 한 곡.' },
      { id: 'k141', label: 'K. 141 라단조', notes: '동음 연타와 도약. 비르투오소 단편의 대표.' },
      { id: 'k159', label: 'K. 159 다장조 (La Caccia)', nickname: '사냥' },
      { id: 'k466', label: 'K. 466 바단조' },
      { id: 'k380', label: 'K. 380 마장조', notes: '왕실 행진곡적 위엄. 가장 자주 연주되는 스카를라티 한 곡.' },
      { id: 'k531', label: 'K. 531 마장조' },
      { id: 'k545', label: 'K. 545 시♭장조' },
    ],
  },

  // ===========================================================
  // HAYDN
  // ===========================================================
  {
    id: 'haydn-sonatas', composerId: 'haydn', category: '소나타', catSort: 1,
    opusLabel: '주요 소나타 (선별)', opusSort: 1,
    pieces: [
      { id: 'hob35', label: 'Hob. XVI:35 다장조', difficulty: 5, notes: '학습용으로 가장 자주 채택. 1악장 명료한 알베르티 베이스.' },
      { id: 'hob37', label: 'Hob. XVI:37 라장조', difficulty: 5, notes: '발랄한 1악장과 짧은 2·3악장. 학습 단계 표준곡.' },
      { id: 'hob49', label: 'Hob. XVI:49 마♭장조', difficulty: 6 },
      { id: 'hob50', label: 'Hob. XVI:50 다장조', difficulty: 6 },
      { id: 'hob52', label: 'Hob. XVI:52 마♭장조', difficulty: 7, notes: '하이든 후기 걸작. 베토벤 전조기에 영향을 남긴 화성 운용.' },
      { id: 'hob20', label: 'Hob. XVI:20 다단조', difficulty: 6, notes: '하이든의 단조 소나타 중 가장 비극적.' },
      { id: 'hob23', label: 'Hob. XVI:23 라장조', difficulty: 5 },
    ],
  },

  // ===========================================================
  // MOZART
  // ===========================================================
  {
    id: 'mozart-k545', composerId: 'mozart', category: '소나타', catSort: 1,
    opusLabel: 'K. 545 다장조 (Sonata facile)', opusSort: 545,
    pieces: [
      { id: '1', label: '1악장 Allegro', difficulty: 4 },
      { id: '2', label: '2악장 Andante', difficulty: 4 },
      { id: '3', label: '3악장 Rondo: Allegretto', difficulty: 4 },
      { id: 'all', label: '전악장', difficulty: 4, notes: '제목 그대로 "쉬운 소나타". 모차르트 양식의 입문. 단순한 표면 아래 정확한 박자감과 균형이 요구됨.' },
    ],
  },
  {
    id: 'mozart-k310', composerId: 'mozart', category: '소나타', catSort: 1,
    opusLabel: 'K. 310 가단조', opusSort: 310,
    pieces: [
      { id: '1', label: '1악장 Allegro maestoso', difficulty: 6, difficultSections: '제시부 후반 8분음표 패시지·재현부 양손 옥타브 진입' },
      { id: '2', label: '2악장 Andante cantabile con espressione', difficulty: 5 },
      { id: '3', label: '3악장 Presto', difficulty: 6 },
      { id: 'all', label: '전악장', difficulty: 6, notes: '모차르트 두 단조 소나타 중 하나. 어머니의 죽음 직후 작곡되어 비통한 1악장이 두드러짐.' },
    ],
  },
  {
    id: 'mozart-k331', composerId: 'mozart', category: '소나타', catSort: 1,
    opusLabel: 'K. 331 가장조', opusSort: 331,
    pieces: [
      { id: '1', label: '1악장 Andante grazioso (변주곡)', difficulty: 5 },
      { id: '2', label: '2악장 Menuetto', difficulty: 5 },
      { id: '3', label: '3악장 Alla Turca', nickname: '터키 행진곡', difficulty: 5, difficultSections: 'A♭단조 코다 직전 양손 도약, 종결부 옥타브' },
      { id: 'all', label: '전악장', difficulty: 5, notes: '세 악장 모두 비-소나타 형식. 3악장 "터키 행진곡"이 압도적으로 유명.' },
    ],
  },
  {
    id: 'mozart-k576', composerId: 'mozart', category: '소나타', catSort: 1,
    opusLabel: 'K. 576 라장조', opusSort: 576,
    pieces: [
      { id: 'all', label: '전악장', difficulty: 7, notes: '모차르트 마지막 소나타. 1악장의 카논적 짜임이 특히 까다로움.' },
    ],
  },
  {
    id: 'mozart-k397', composerId: 'mozart', category: '환상곡', catSort: 2,
    opusLabel: 'K. 397 라단조', opusSort: 397,
    pieces: [
      { id: 'all', label: '환상곡 라단조', difficulty: 5, notes: '미완성 작품(타인이 마지막 10마디 보충). 즉흥적 분위기.' },
    ],
  },
  {
    id: 'mozart-k475', composerId: 'mozart', category: '환상곡', catSort: 2,
    opusLabel: 'K. 475 다단조', opusSort: 475,
    pieces: [
      { id: 'all', label: '환상곡 다단조', difficulty: 6, notes: 'K. 457 소나타와 짝을 이루는 서주적 환상곡. 광범위한 조성 변화.' },
    ],
  },

  // ===========================================================
  // BEETHOVEN — Sonatas (selected core repertoire)
  // ===========================================================
  {
    id: 'lvb-op2-1', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 2 No. 1 바단조', opusSort: 21,
    pieces: [{ id: 'all', label: '전악장', difficulty: 6, notes: '베토벤 첫 출판 소나타. 이미 1악장 전개부에서 베토벤적 추진력이 드러남.' }],
  },
  {
    id: 'lvb-op13', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 13 다단조 (Pathétique)', opusSort: 13,
    pieces: [
      { id: '1', label: '1악장 Grave – Allegro di molto e con brio', difficulty: 7, difficultSections: '서주부 무거운 화음과 트레몰로, Allegro 부분 양손 옥타브 트레몰로' },
      { id: '2', label: '2악장 Adagio cantabile', difficulty: 5, notes: '독립적으로 가장 자주 연주되는 악장.' },
      { id: '3', label: '3악장 Rondo: Allegro', difficulty: 6 },
      { id: 'all', label: '전악장', difficulty: 7, nickname: '비창', notes: '베토벤 초기 3대 소나타 중 가장 직접적인 극적 호소력.' },
    ],
  },
  {
    id: 'lvb-op27-1', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 27 No. 1 마♭장조', opusSort: 271,
    pieces: [{ id: 'all', label: '전악장', difficulty: 7, notes: '"환상곡풍" 부제. 4악장이 끊김 없이 연결.' }],
  },
  {
    id: 'lvb-op27-2', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 27 No. 2 다#단조 (Moonlight)', opusSort: 272,
    pieces: [
      { id: '1', label: '1악장 Adagio sostenuto', difficulty: 4, notes: '오른손 셋잇단음과 멜로디의 균형. 페달 운용이 결정적.' },
      { id: '2', label: '2악장 Allegretto', difficulty: 5 },
      { id: '3', label: '3악장 Presto agitato', difficulty: 8, difficultSections: '재현부 양손 분산화음의 정확성과 지구력, 코다의 트레몰로 연결' },
      { id: 'all', label: '전악장', difficulty: 7, nickname: '월광', notes: '"월광"은 후대 별명. 베토벤은 "Sonata quasi una fantasia"로 표기.' },
    ],
  },
  {
    id: 'lvb-op28', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 28 라장조 (Pastoral)', opusSort: 28,
    pieces: [{ id: 'all', label: '전악장', difficulty: 6, nickname: '전원', notes: '"전원"은 출판사 별명. 1악장의 지속음 베이스가 목가적 분위기를 만든다.' }],
  },
  {
    id: 'lvb-op31-2', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 31 No. 2 라단조 (Tempest)', opusSort: 312,
    pieces: [
      { id: '1', label: '1악장 Largo – Allegro', difficulty: 7, difficultSections: '재현부 진입의 레치타티보 구절 리듬' },
      { id: '2', label: '2악장 Adagio', difficulty: 6 },
      { id: '3', label: '3악장 Allegretto', difficulty: 7, difficultSections: '쉼 없는 16분음표 흐름의 양손 균형' },
      { id: 'all', label: '전악장', difficulty: 7, nickname: '템페스트', notes: '"셰익스피어의 템페스트를 읽으라"는 베토벤의 (의심스러운) 일화에서 유래된 별명.' },
    ],
  },
  {
    id: 'lvb-op53', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 53 다장조 (Waldstein)', opusSort: 53,
    pieces: [
      { id: '1', label: '1악장 Allegro con brio', difficulty: 8, difficultSections: '제시부 첫 주제의 동음 연타, 발전부 8분음표 화음 패시지' },
      { id: '2', label: '2악장 Introduzione: Adagio molto', difficulty: 6 },
      { id: '3', label: '3악장 Rondo: Allegretto moderato – Prestissimo', difficulty: 8, difficultSections: '오른손 옥타브 글리산도(또는 옥타브 트레몰로 대체), 코다 양손 옥타브' },
      { id: 'all', label: '전악장', difficulty: 8, nickname: '발트슈타인', notes: '베토벤 중기 비르투오소 양식의 정점 중 하나.' },
    ],
  },
  {
    id: 'lvb-op57', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 57 바단조 (Appassionata)', opusSort: 57,
    pieces: [
      { id: '1', label: '1악장 Allegro assai', difficulty: 8 },
      { id: '2', label: '2악장 Andante con moto (변주)', difficulty: 6 },
      { id: '3', label: '3악장 Allegro ma non troppo – Presto', difficulty: 8, difficultSections: '쉴 새 없이 이어지는 16분음표, 코다의 더블 셋잇단음 옥타브' },
      { id: 'all', label: '전악장', difficulty: 8, nickname: '열정', notes: '"열정"도 출판사 별명. 베토벤 단조 소나타의 정점.' },
    ],
  },
  {
    id: 'lvb-op81a', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 81a 마♭장조 (Les Adieux)', opusSort: 81,
    pieces: [{ id: 'all', label: '전악장', difficulty: 7, nickname: '고별', notes: '루돌프 대공의 빈 떠남을 기리는 표제 소나타. "이별–부재–재회" 3악장 구조.' }],
  },
  {
    id: 'lvb-op101', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 101 가장조', opusSort: 101,
    pieces: [{ id: 'all', label: '전악장', difficulty: 8, notes: '베토벤 후기 5대 소나타의 시작. 4악장의 푸가가 기술적 정점.' }],
  },
  {
    id: 'lvb-op106', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 106 시♭장조 (Hammerklavier)', opusSort: 106,
    pieces: [{ id: 'all', label: '전악장', difficulty: 9, nickname: '함머클라비어', notes: '피아노 문헌 최고의 난곡 중 하나. 4악장 푸가는 헨레 9/9. 1악장의 메트로놈 표시(♩=138)는 거의 모든 연주자에게 도전.' }],
  },
  {
    id: 'lvb-op109', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 109 마장조', opusSort: 109,
    pieces: [{ id: 'all', label: '전악장', difficulty: 8, notes: '후기 3대 소나타의 첫 곡. 3악장 변주가 정점.' }],
  },
  {
    id: 'lvb-op110', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 110 가♭장조', opusSort: 110,
    pieces: [{ id: 'all', label: '전악장', difficulty: 7, notes: '3악장의 "Arioso dolente"와 푸가가 베토벤 후기의 고백.' }],
  },
  {
    id: 'lvb-op111', composerId: 'beethoven', category: '소나타', catSort: 1,
    opusLabel: 'Op. 111 다단조', opusSort: 111,
    pieces: [{ id: 'all', label: '전악장', difficulty: 8, notes: '베토벤 마지막 소나타. 2악장 Arietta의 변주가 부기우기를 예견했다는 평가도.' }],
  },
  // Bagatelles & Variations
  {
    id: 'lvb-op126', composerId: 'beethoven', category: '바가텔', catSort: 2,
    opusLabel: 'Op. 126 (6곡)', opusSort: 126,
    pieces: [
      { id: '1', label: 'No. 1 사장조 Andante con moto' },
      { id: '2', label: 'No. 2 사단조 Allegro' },
      { id: '3', label: 'No. 3 마♭장조 Andante' },
      { id: '4', label: 'No. 4 시단조 Presto' },
      { id: '5', label: 'No. 5 사장조 Quasi allegretto' },
      { id: '6', label: 'No. 6 마♭장조 Presto – Andante' },
    ],
  },

  // ===========================================================
  // SCHUBERT
  // ===========================================================
  {
    id: 'schubert-op90', composerId: 'schubert', category: '즉흥곡', catSort: 1,
    opusLabel: 'Op. 90 / D. 899 (4곡)', opusSort: 1,
    pieces: [
      { id: '1', label: 'No. 1 다단조', difficulty: 6 },
      { id: '2', label: 'No. 2 마♭장조', difficulty: 6, difficultSections: '오른손 셋잇단음표의 균등한 흐름과 가운데 트리오의 양손 도약' },
      { id: '3', label: 'No. 3 사♭장조', difficulty: 5, notes: '셋잇단 반주 위 노래선. 슈베르트 "노래" 양식의 모범.' },
      { id: '4', label: 'No. 4 가♭장조', difficulty: 6 },
    ],
  },
  {
    id: 'schubert-op142', composerId: 'schubert', category: '즉흥곡', catSort: 1,
    opusLabel: 'Op. 142 / D. 935 (4곡)', opusSort: 2,
    pieces: [
      { id: '1', label: 'No. 1 바단조', difficulty: 7 },
      { id: '2', label: 'No. 2 가♭장조', difficulty: 6 },
      { id: '3', label: 'No. 3 시♭장조 (변주곡)', difficulty: 6 },
      { id: '4', label: 'No. 4 바단조', difficulty: 7 },
    ],
  },
  {
    id: 'schubert-d780', composerId: 'schubert', category: '악흥의 순간', catSort: 2,
    opusLabel: 'Op. 94 / D. 780 (6곡)', opusSort: 1,
    pieces: [
      { id: '1', label: 'No. 1 다장조' },
      { id: '2', label: 'No. 2 가♭장조' },
      { id: '3', label: 'No. 3 바단조', difficulty: 4, notes: '6곡 중 가장 알려진 곡. 짧고 우아함.' },
      { id: '4', label: 'No. 4 다#단조' },
      { id: '5', label: 'No. 5 바단조' },
      { id: '6', label: 'No. 6 가♭장조' },
    ],
  },
  {
    id: 'schubert-d960', composerId: 'schubert', category: '소나타', catSort: 3,
    opusLabel: 'D. 960 시♭장조', opusSort: 960,
    pieces: [{ id: 'all', label: '전악장', difficulty: 7, notes: '슈베르트 마지막 소나타. 1악장 도입부의 좌측 트릴이 작품 전체의 그림자를 깐다는 해석이 일반적.' }],
  },
  {
    id: 'schubert-d959', composerId: 'schubert', category: '소나타', catSort: 3,
    opusLabel: 'D. 959 가장조', opusSort: 959,
    pieces: [{ id: 'all', label: '전악장', difficulty: 7, notes: '2악장 안단티노가 광기에 가까운 중간부로 폭발하는 점에서 자주 분석 대상.' }],
  },
  {
    id: 'schubert-d958', composerId: 'schubert', category: '소나타', catSort: 3,
    opusLabel: 'D. 958 다단조', opusSort: 958,
    pieces: [{ id: 'all', label: '전악장', difficulty: 7 }],
  },
  {
    id: 'schubert-d760', composerId: 'schubert', category: '환상곡', catSort: 4,
    opusLabel: 'Op. 15 / D. 760 (Wanderer)', opusSort: 1,
    pieces: [{ id: 'all', label: '방랑자 환상곡', difficulty: 8, nickname: '방랑자', notes: '슈베르트가 "이건 도저히 못 치겠다"고 말했다는 일화의 곡. 4악장이 끊김 없이 이어지는 단일 악장 구조의 선구.' }],
  },

  // ===========================================================
  // MENDELSSOHN
  // ===========================================================
  {
    id: 'mendel-op19', composerId: 'mendel', category: '무언가 (Lieder ohne Worte)', catSort: 1,
    opusLabel: 'Op. 19b (1권, 6곡)', opusSort: 19,
    pieces: [
      { id: '1', label: 'No. 1 마장조' },
      { id: '2', label: 'No. 2 가단조' },
      { id: '3', label: 'No. 3 가장조 (Hunting Song)', nickname: '사냥의 노래' },
      { id: '4', label: 'No. 4 가장조' },
      { id: '5', label: 'No. 5 바#단조' },
      { id: '6', label: 'No. 6 사단조 (Venetian Boat Song I)', nickname: '베네치아의 뱃노래 1' },
    ],
  },
  {
    id: 'mendel-op30', composerId: 'mendel', category: '무언가 (Lieder ohne Worte)', catSort: 1,
    opusLabel: 'Op. 30 (2권, 6곡)', opusSort: 30,
    pieces: [
      { id: '6', label: 'No. 6 바#단조 (Venetian Boat Song II)', nickname: '베네치아의 뱃노래 2' },
    ],
  },
  {
    id: 'mendel-op62', composerId: 'mendel', category: '무언가 (Lieder ohne Worte)', catSort: 1,
    opusLabel: 'Op. 62 (5권, 6곡)', opusSort: 62,
    pieces: [
      { id: '6', label: 'No. 6 가장조 (Spring Song)', nickname: '봄의 노래', difficulty: 5 },
    ],
  },

  // ===========================================================
  // SCHUMANN
  // ===========================================================
  {
    id: 'schum-op15', composerId: 'schumann', category: '어린이정경', catSort: 1,
    opusLabel: 'Op. 15 (13곡)', opusSort: 15,
    pieces: [
      { id: '1',  label: 'No. 1 낯선 나라와 사람들에 대하여' },
      { id: '2',  label: 'No. 2 신기한 이야기' },
      { id: '3',  label: 'No. 3 술래잡기' },
      { id: '4',  label: 'No. 4 보채는 아이' },
      { id: '5',  label: 'No. 5 만족한 아이' },
      { id: '6',  label: 'No. 6 중요한 사건' },
      { id: '7',  label: 'No. 7 트로이메라이', nickname: '꿈', difficulty: 4, notes: '13곡 중 가장 자주 독립 연주됨.' },
      { id: '8',  label: 'No. 8 난로 옆에서' },
      { id: '9',  label: 'No. 9 목마' },
      { id: '10', label: 'No. 10 거의 너무 진지하게' },
      { id: '11', label: 'No. 11 무서움' },
      { id: '12', label: 'No. 12 잠든 아이' },
      { id: '13', label: 'No. 13 시인은 이야기하네' },
      { id: 'all',label: '전곡 (13곡 연속)', difficulty: 6, notes: '각 곡은 짧지만 전곡 연주는 음색·페달·정서적 일관성을 요구.' },
    ],
  },
  {
    id: 'schum-op9', composerId: 'schumann', category: '카니발', catSort: 2,
    opusLabel: 'Op. 9', opusSort: 9,
    pieces: [{ id: 'all', label: '카니발 (21곡 모음)', difficulty: 8, notes: '"네 음의 변형"으로 연결된 가면극. 키아리나·쇼팽·파가니니 등 인물 묘사 포함.' }],
  },
  {
    id: 'schum-op16', composerId: 'schumann', category: '크라이슬레리아나', catSort: 3,
    opusLabel: 'Op. 16 (8곡)', opusSort: 16,
    pieces: [{ id: 'all', label: '크라이슬레리아나 (8곡)', difficulty: 8, notes: 'E.T.A. 호프만의 가공 인물 카펠마이스터 크라이슬러를 모티프로. 슈만 자신 "내가 가장 좋아하는 곡".' }],
  },
  {
    id: 'schum-op12', composerId: 'schumann', category: '환상소품집', catSort: 4,
    opusLabel: 'Op. 12 (8곡)', opusSort: 12,
    pieces: [
      { id: '1', label: 'No. 1 저녁에' },
      { id: '2', label: 'No. 2 비상 (Aufschwung)', difficulty: 7, notes: '8곡 중 가장 자주 독립 연주됨.' },
      { id: '3', label: 'No. 3 왜?' },
      { id: '4', label: 'No. 4 변덕' },
      { id: '5', label: 'No. 5 밤에' },
      { id: '6', label: 'No. 6 우화' },
      { id: '7', label: 'No. 7 꿈의 혼란' },
      { id: '8', label: 'No. 8 노래의 끝' },
    ],
  },
  {
    id: 'schum-op13', composerId: 'schumann', category: '교향적 연습곡', catSort: 5,
    opusLabel: 'Op. 13', opusSort: 13,
    pieces: [{ id: 'all', label: '교향적 연습곡 (변주 + 5개 유작 변주)', difficulty: 8, notes: '주제와 12개의 변주(유작 5개 포함). 변주 형식의 정점 중 하나.' }],
  },
  {
    id: 'schum-op7', composerId: 'schumann', category: '토카타', catSort: 6,
    opusLabel: 'Op. 7 다장조', opusSort: 7,
    pieces: [{ id: 'all', label: '토카타 다장조', difficulty: 9, difficultSections: '오른손 더블노트 연속, 양손 옥타브 더블노트', notes: '슈만 본인이 손 부상의 직접적 원인이라 회고. 피아노 문헌 더블노트 토카타의 정점.' }],
  },

  // ===========================================================
  // CHOPIN
  // ===========================================================
  {
    id: 'chopin-op10', composerId: 'chopin', category: '에튀드', catSort: 1,
    opusLabel: 'Op. 10 (12곡)', opusSort: 10,
    pieces: [
      { id: '1',  label: 'No. 1 다장조', nickname: '폭포', difficulty: 9, difficultSections: '오른손 10도 분산화음의 지속적 확장과 손가락 독립' },
      { id: '2',  label: 'No. 2 가단조', difficulty: 9, difficultSections: '오른손 3·4·5번 손가락의 반음계 연속, 동시에 1·2번이 화음 잡기' },
      { id: '3',  label: 'No. 3 마장조', nickname: '이별의 노래 (Tristesse)', difficulty: 7, difficultSections: '중간부 양손 6도·옥타브 도약', notes: '쇼팽 본인이 "이보다 아름다운 멜로디를 다시 못 쓸 것"이라 했다는 일화.' },
      { id: '4',  label: 'No. 4 다#단조', difficulty: 8, difficultSections: '양손 16분음표의 끊임없는 흐름. 지구력의 시험.' },
      { id: '5',  label: 'No. 5 사♭장조', nickname: '검은 건반', difficulty: 7, notes: '오른손이 거의 검은 건반만 사용.' },
      { id: '6',  label: 'No. 6 마♭단조', difficulty: 6 },
      { id: '7',  label: 'No. 7 다장조', difficulty: 8 },
      { id: '8',  label: 'No. 8 바장조', difficulty: 8 },
      { id: '9',  label: 'No. 9 바단조', difficulty: 7 },
      { id: '10', label: 'No. 10 가♭장조', difficulty: 8 },
      { id: '11', label: 'No. 11 마♭장조', difficulty: 8, difficultSections: '양손 분산화음(아르페지오)의 일제 진행', notes: '"기타" 별명. 쇼팽이 가장 자주 강의에서 다룬 에튀드.' },
      { id: '12', label: 'No. 12 다단조', nickname: '혁명', difficulty: 8, difficultSections: '왼손의 끊임없는 16분음표 패시지의 지구력', notes: '바르샤바 함락 소식을 듣고 작곡되었다는 (확정되지 않은) 일화.' },
    ],
  },
  {
    id: 'chopin-op25', composerId: 'chopin', category: '에튀드', catSort: 1,
    opusLabel: 'Op. 25 (12곡)', opusSort: 25,
    pieces: [
      { id: '1',  label: 'No. 1 가♭장조', nickname: '에올리언 하프', difficulty: 7 },
      { id: '2',  label: 'No. 2 바단조', difficulty: 7 },
      { id: '3',  label: 'No. 3 바장조', difficulty: 7 },
      { id: '4',  label: 'No. 4 가단조', difficulty: 7 },
      { id: '5',  label: 'No. 5 마단조', difficulty: 7 },
      { id: '6',  label: 'No. 6 사#단조', difficulty: 9, difficultSections: '오른손 3도 반음계 패시지 전곡', notes: '피아노 문헌 3도 연습의 정점.' },
      { id: '7',  label: 'No. 7 다#단조', difficulty: 6 },
      { id: '8',  label: 'No. 8 라♭장조', difficulty: 8, notes: '6도 연습.' },
      { id: '9',  label: 'No. 9 사♭장조', nickname: '나비', difficulty: 6 },
      { id: '10', label: 'No. 10 시단조', difficulty: 8, notes: '옥타브 연습.' },
      { id: '11', label: 'No. 11 가단조', nickname: '겨울 바람', difficulty: 9, difficultSections: '오른손 16분음표 반음계 figuration의 지속적 흐름과 왼손 옥타브 도약 동시 진행' },
      { id: '12', label: 'No. 12 다단조', nickname: '바다', difficulty: 8, difficultSections: '양손의 거대한 분산화음 일제 진행' },
    ],
  },
  {
    id: 'chopin-ballade1', composerId: 'chopin', category: '발라드', catSort: 2,
    opusLabel: 'Op. 23 사단조 (1번)', opusSort: 23,
    pieces: [{ id: 'all', label: '발라드 1번 사단조', difficulty: 8, difficultSections: '코다(presto con fuoco)의 양손 옥타브와 양손 도약', notes: '4개 발라드 중 가장 자주 연주됨. 쇼팽이 "발라드"라는 명칭을 피아노 문헌에 처음 도입.' }],
  },
  {
    id: 'chopin-ballade2', composerId: 'chopin', category: '발라드', catSort: 2,
    opusLabel: 'Op. 38 바장조 (2번)', opusSort: 38,
    pieces: [{ id: 'all', label: '발라드 2번 바장조', difficulty: 7, notes: '바장조 안단테와 가단조 프레스토의 극단적 대조.' }],
  },
  {
    id: 'chopin-ballade3', composerId: 'chopin', category: '발라드', catSort: 2,
    opusLabel: 'Op. 47 가♭장조 (3번)', opusSort: 47,
    pieces: [{ id: 'all', label: '발라드 3번 가♭장조', difficulty: 7 }],
  },
  {
    id: 'chopin-ballade4', composerId: 'chopin', category: '발라드', catSort: 2,
    opusLabel: 'Op. 52 바단조 (4번)', opusSort: 52,
    pieces: [{ id: 'all', label: '발라드 4번 바단조', difficulty: 8, difficultSections: '코다의 양손 16분음표 figuration', notes: '4개 발라드 중 구조적으로 가장 정교하다는 평가가 일반적.' }],
  },
  {
    id: 'chopin-scherzo1', composerId: 'chopin', category: '스케르초', catSort: 3,
    opusLabel: 'Op. 20 시단조 (1번)', opusSort: 20,
    pieces: [{ id: 'all', label: '스케르초 1번 시단조', difficulty: 8 }],
  },
  {
    id: 'chopin-scherzo2', composerId: 'chopin', category: '스케르초', catSort: 3,
    opusLabel: 'Op. 31 시♭단조 (2번)', opusSort: 31,
    pieces: [{ id: 'all', label: '스케르초 2번 시♭단조', difficulty: 8, notes: '4개 스케르초 중 가장 자주 연주됨.' }],
  },
  {
    id: 'chopin-scherzo3', composerId: 'chopin', category: '스케르초', catSort: 3,
    opusLabel: 'Op. 39 다#단조 (3번)', opusSort: 39,
    pieces: [{ id: 'all', label: '스케르초 3번 다#단조', difficulty: 8 }],
  },
  {
    id: 'chopin-scherzo4', composerId: 'chopin', category: '스케르초', catSort: 3,
    opusLabel: 'Op. 54 마장조 (4번)', opusSort: 54,
    pieces: [{ id: 'all', label: '스케르초 4번 마장조', difficulty: 8 }],
  },
  {
    id: 'chopin-noct-op9', composerId: 'chopin', category: '녹턴', catSort: 4,
    opusLabel: 'Op. 9 (3곡)', opusSort: 9,
    pieces: [
      { id: '1', label: 'No. 1 시♭단조', difficulty: 6 },
      { id: '2', label: 'No. 2 마♭장조', difficulty: 5, notes: '쇼팽의 가장 유명한 한 곡. 첫 출판 시 즉시 인기.' },
      { id: '3', label: 'No. 3 시장조', difficulty: 6 },
    ],
  },
  {
    id: 'chopin-noct-op27', composerId: 'chopin', category: '녹턴', catSort: 4,
    opusLabel: 'Op. 27 (2곡)', opusSort: 27,
    pieces: [
      { id: '1', label: 'No. 1 다#단조', difficulty: 7 },
      { id: '2', label: 'No. 2 라♭장조', difficulty: 7, notes: '쇼팽 녹턴 중 가장 정교한 장식과 노래선.' },
    ],
  },
  {
    id: 'chopin-noct-op48', composerId: 'chopin', category: '녹턴', catSort: 4,
    opusLabel: 'Op. 48 (2곡)', opusSort: 48,
    pieces: [
      { id: '1', label: 'No. 1 다단조', difficulty: 7, notes: '쇼팽 녹턴 중 가장 비극적이고 구조적으로 큰 곡. 합창적 중간부를 거쳐 폭풍 같은 도플로 진입.' },
      { id: '2', label: 'No. 2 바#단조', difficulty: 7 },
    ],
  },
  {
    id: 'chopin-noct-cminor', composerId: 'chopin', category: '녹턴', catSort: 4,
    opusLabel: '유작 다#단조', opusSort: 200,
    pieces: [{ id: 'all', label: '녹턴 다#단조 (Lento con gran espressione)', difficulty: 5, notes: '"사후 출판" 녹턴. 영화 〈피아니스트〉로 대중에 알려짐.' }],
  },
  {
    id: 'chopin-waltz-op64', composerId: 'chopin', category: '왈츠', catSort: 5,
    opusLabel: 'Op. 64 (3곡)', opusSort: 64,
    pieces: [
      { id: '1', label: 'No. 1 라♭장조', nickname: '강아지 왈츠', difficulty: 5 },
      { id: '2', label: 'No. 2 다#단조', difficulty: 5 },
      { id: '3', label: 'No. 3 가♭장조', difficulty: 5 },
    ],
  },
  {
    id: 'chopin-waltz-op69', composerId: 'chopin', category: '왈츠', catSort: 5,
    opusLabel: 'Op. 69 (2곡, 유작)', opusSort: 69,
    pieces: [
      { id: '1', label: 'No. 1 가♭장조 (이별의 왈츠)', nickname: '이별', difficulty: 4 },
      { id: '2', label: 'No. 2 시단조', difficulty: 4 },
    ],
  },
  {
    id: 'chopin-waltz-op34', composerId: 'chopin', category: '왈츠', catSort: 5,
    opusLabel: 'Op. 34 (3곡)', opusSort: 34,
    pieces: [
      { id: '1', label: 'No. 1 가♭장조', difficulty: 6 },
      { id: '2', label: 'No. 2 가단조', difficulty: 5 },
      { id: '3', label: 'No. 3 바장조', difficulty: 6 },
    ],
  },
  {
    id: 'chopin-waltz-op18', composerId: 'chopin', category: '왈츠', catSort: 5,
    opusLabel: 'Op. 18 마♭장조', opusSort: 18,
    pieces: [{ id: 'all', label: '화려한 대왈츠', difficulty: 6 }],
  },
  {
    id: 'chopin-fantimp', composerId: 'chopin', category: '즉흥곡', catSort: 6,
    opusLabel: 'Op. 66 (유작) — 환상즉흥곡', opusSort: 66,
    pieces: [{ id: 'all', label: '환상즉흥곡 다#단조', difficulty: 7, difficultSections: '오른손 16분음표·왼손 8분음표 폴리리듬(4:3)', notes: '쇼팽 생전 출판 거부. 가장 자주 연주되는 즉흥곡.' }],
  },
  {
    id: 'chopin-imp-op29', composerId: 'chopin', category: '즉흥곡', catSort: 6,
    opusLabel: 'Op. 29 가♭장조 (1번)', opusSort: 29,
    pieces: [{ id: 'all', label: '즉흥곡 1번 가♭장조', difficulty: 6 }],
  },
  {
    id: 'chopin-fant-op49', composerId: 'chopin', category: '환상곡', catSort: 7,
    opusLabel: 'Op. 49 바단조', opusSort: 49,
    pieces: [{ id: 'all', label: '환상곡 바단조', difficulty: 8, notes: '쇼팽 후기 양식의 주요 작품. 행진곡적 도입에서 영웅적 결말까지.' }],
  },
  {
    id: 'chopin-pol-op53', composerId: 'chopin', category: '폴로네이즈', catSort: 8,
    opusLabel: 'Op. 53 가♭장조', opusSort: 53,
    pieces: [{ id: 'all', label: '폴로네이즈 가♭장조', nickname: '영웅', difficulty: 8, difficultSections: '중간부 왼손 옥타브 트레몰로의 지구력' }],
  },
  {
    id: 'chopin-pol-op40-1', composerId: 'chopin', category: '폴로네이즈', catSort: 8,
    opusLabel: 'Op. 40 No. 1 가장조', opusSort: 401,
    pieces: [{ id: 'all', label: '폴로네이즈 가장조', nickname: '군대', difficulty: 7 }],
  },
  {
    id: 'chopin-pol-op44', composerId: 'chopin', category: '폴로네이즈', catSort: 8,
    opusLabel: 'Op. 44 바#단조', opusSort: 44,
    pieces: [{ id: 'all', label: '폴로네이즈 바#단조', difficulty: 8 }],
  },
  {
    id: 'chopin-prelude-op28', composerId: 'chopin', category: '프렐류드', catSort: 9,
    opusLabel: 'Op. 28 (24곡)', opusSort: 28,
    pieces: [
      { id: '4',  label: 'No. 4 마단조', difficulty: 4 },
      { id: '6',  label: 'No. 6 시단조', difficulty: 4 },
      { id: '7',  label: 'No. 7 가장조', difficulty: 3 },
      { id: '15', label: 'No. 15 라♭장조', nickname: '빗방울', difficulty: 5, notes: '마요르카에서 작곡. 중간부 다#단조의 "빗방울" 모티프.' },
      { id: '20', label: 'No. 20 다단조', difficulty: 4 },
      { id: '24', label: 'No. 24 라단조', difficulty: 8, difficultSections: '왼손의 거의 끊임없는 도약' },
      { id: 'all',label: '전곡 (24곡)', difficulty: 8, notes: '24개 모든 조성 순회. 바흐 평균율의 19세기 응답.' },
    ],
  },
  {
    id: 'chopin-sonata2', composerId: 'chopin', category: '소나타', catSort: 10,
    opusLabel: 'Op. 35 시♭단조 (2번)', opusSort: 35,
    pieces: [
      { id: '3', label: '3악장 Marche funèbre', nickname: '장송행진곡', difficulty: 5 },
      { id: '4', label: '4악장 Presto', difficulty: 7, notes: '단성 8분음표만으로 80여 마디. 슈만이 "스핑크스가 비웃는다"고 평한 악장.' },
      { id: 'all',label: '전악장', difficulty: 8 },
    ],
  },
  {
    id: 'chopin-sonata3', composerId: 'chopin', category: '소나타', catSort: 10,
    opusLabel: 'Op. 58 시단조 (3번)', opusSort: 58,
    pieces: [{ id: 'all', label: '전악장', difficulty: 8, notes: '쇼팽 후기 대작. 4악장 코다가 비르투오소적 정점.' }],
  },
  {
    id: 'chopin-berceuse', composerId: 'chopin', category: '자장가·뱃노래', catSort: 11,
    opusLabel: 'Op. 57 라♭장조 (자장가)', opusSort: 57,
    pieces: [{ id: 'all', label: '자장가 라♭장조', difficulty: 6, notes: '왼손 4마디 오스티나토 위에 오른손 변주 14개.' }],
  },
  {
    id: 'chopin-barcarolle', composerId: 'chopin', category: '자장가·뱃노래', catSort: 11,
    opusLabel: 'Op. 60 바#장조 (뱃노래)', opusSort: 60,
    pieces: [{ id: 'all', label: '뱃노래 바#장조', difficulty: 8, notes: '쇼팽 후기 양식의 정점. 아라비아풍 6/8 박자 위 두 노래선의 대화.' }],
  },

  // ===========================================================
  // LISZT
  // ===========================================================
  {
    id: 'liszt-trans', composerId: 'liszt', category: '초절기교 연습곡', catSort: 1,
    opusLabel: 'S. 139 (12곡)', opusSort: 1,
    pieces: [
      { id: '4',  label: 'No. 4 라단조', nickname: '마제파', difficulty: 9, difficultSections: '양손 옥타브 패시지와 도약의 동시 진행', notes: 'Mazeppa. 위고의 시에 영감.' },
      { id: '5',  label: 'No. 5 시♭장조', nickname: '도깨비불', difficulty: 9, difficultSections: '오른손의 부서질 듯한 더블노트 트릴' },
      { id: '8',  label: 'No. 8 다단조', nickname: '사냥', difficulty: 9 },
      { id: '10', label: 'No. 10 바단조', difficulty: 9 },
      { id: '12', label: 'No. 12 시♭단조', nickname: '눈보라', difficulty: 9 },
    ],
  },
  {
    id: 'liszt-pag', composerId: 'liszt', category: '파가니니 대연습곡', catSort: 2,
    opusLabel: 'S. 141 (6곡)', opusSort: 1,
    pieces: [
      { id: '3', label: 'No. 3 사#단조', nickname: '라 캄파넬라', difficulty: 8, difficultSections: '오른손의 광대한 도약과 동음 연타', notes: '리스트 비르투오소 양식의 대표곡.' },
      { id: '6', label: 'No. 6 가단조 (테마와 변주)', difficulty: 9 },
    ],
  },
  {
    id: 'liszt-rhap', composerId: 'liszt', category: '헝가리 광시곡', catSort: 3,
    opusLabel: 'S. 244 (대표곡)', opusSort: 1,
    pieces: [
      { id: '2',  label: 'No. 2 다#단조', difficulty: 8, difficultSections: 'Friska 부분 양손 옥타브와 도약', notes: '19곡 중 압도적으로 가장 알려짐.' },
      { id: '6',  label: 'No. 6 라♭장조', difficulty: 8 },
      { id: '12', label: 'No. 12 다#단조', difficulty: 8 },
      { id: '15', label: 'No. 15 가단조', nickname: '라코치 행진곡', difficulty: 8 },
    ],
  },
  {
    id: 'liszt-traum', composerId: 'liszt', category: '사랑의 꿈', catSort: 4,
    opusLabel: 'S. 541 (3곡)', opusSort: 1,
    pieces: [
      { id: '3', label: 'No. 3 가♭장조', difficulty: 6, notes: '리스트의 가장 유명한 단편 중 하나. 원래 가곡을 피아노 독주로 편곡.' },
    ],
  },
  {
    id: 'liszt-bsonata', composerId: 'liszt', category: '소나타', catSort: 5,
    opusLabel: 'S. 178 시단조', opusSort: 1,
    pieces: [{ id: 'all', label: '시단조 소나타', difficulty: 9, notes: '단일 악장 30분. 19세기 피아노 소나타의 정점 중 하나.' }],
  },
  {
    id: 'liszt-meph', composerId: 'liszt', category: '메피스토 왈츠', catSort: 6,
    opusLabel: 'S. 514 No. 1', opusSort: 1,
    pieces: [{ id: 'all', label: '메피스토 왈츠 1번', difficulty: 9 }],
  },

  // ===========================================================
  // BRAHMS
  // ===========================================================
  {
    id: 'brahms-op118', composerId: 'brahms', category: '소품집', catSort: 1,
    opusLabel: 'Op. 118 (6곡)', opusSort: 118,
    pieces: [
      { id: '1', label: 'No. 1 인테르메초 가단조', difficulty: 6 },
      { id: '2', label: 'No. 2 인테르메초 가장조', difficulty: 6, notes: '브람스 후기 인테르메초의 대표곡.' },
      { id: '3', label: 'No. 3 발라드 사단조', difficulty: 7 },
      { id: '4', label: 'No. 4 인테르메초 바단조', difficulty: 6 },
      { id: '5', label: 'No. 5 로망스 바장조', difficulty: 6 },
      { id: '6', label: 'No. 6 인테르메초 마♭단조', difficulty: 6, notes: '브람스 후기 가장 음울한 단편 중 하나.' },
    ],
  },
  {
    id: 'brahms-op119', composerId: 'brahms', category: '소품집', catSort: 1,
    opusLabel: 'Op. 119 (4곡)', opusSort: 119,
    pieces: [
      { id: '1', label: 'No. 1 인테르메초 시단조', difficulty: 6 },
      { id: '2', label: 'No. 2 인테르메초 마단조', difficulty: 6 },
      { id: '3', label: 'No. 3 인테르메초 다장조', difficulty: 5 },
      { id: '4', label: 'No. 4 광시곡 마♭장조', difficulty: 7 },
    ],
  },
  {
    id: 'brahms-op79', composerId: 'brahms', category: '광시곡', catSort: 2,
    opusLabel: 'Op. 79 (2곡)', opusSort: 79,
    pieces: [
      { id: '1', label: 'No. 1 시단조', difficulty: 7 },
      { id: '2', label: 'No. 2 사단조', difficulty: 7 },
    ],
  },
  {
    id: 'brahms-op24', composerId: 'brahms', category: '변주곡', catSort: 3,
    opusLabel: 'Op. 24 (헨델 주제 변주와 푸가)', opusSort: 24,
    pieces: [{ id: 'all', label: '헨델 변주곡', difficulty: 8, notes: '브람스 변주 양식의 정점. 25 변주 + 푸가.' }],
  },
  {
    id: 'brahms-op35', composerId: 'brahms', category: '변주곡', catSort: 3,
    opusLabel: 'Op. 35 (파가니니 변주)', opusSort: 35,
    pieces: [
      { id: '1', label: '제1권', difficulty: 9 },
      { id: '2', label: '제2권', difficulty: 9 },
      { id: 'all',label: '전곡 (2권)', difficulty: 9, notes: '비르투오소 변주의 정점. 자주 발췌하여 연주.' },
    ],
  },

  // ===========================================================
  // DEBUSSY
  // ===========================================================
  {
    id: 'deb-bergamasque', composerId: 'debussy', category: '베르가마스크 모음곡', catSort: 1,
    opusLabel: 'L. 75 (4곡)', opusSort: 1,
    pieces: [
      { id: '1', label: 'No. 1 전주곡', difficulty: 6 },
      { id: '2', label: 'No. 2 미뉴에트', difficulty: 5 },
      { id: '3', label: 'No. 3 달빛 (Clair de lune)', nickname: '달빛', difficulty: 5, notes: '드뷔시 가장 유명한 한 곡. 페달과 음색 컨트롤이 핵심.' },
      { id: '4', label: 'No. 4 파스피에', difficulty: 6 },
    ],
  },
  {
    id: 'deb-images1', composerId: 'debussy', category: '영상', catSort: 2,
    opusLabel: '제1권 L. 110 (3곡)', opusSort: 1,
    pieces: [
      { id: '1', label: 'No. 1 물에 비친 그림자', difficulty: 7, notes: '드뷔시 본인 "쇼팽 이후 가장 새로운 발견을 했다"고 말한 곡.' },
      { id: '2', label: 'No. 2 라모를 찬양하며', difficulty: 7 },
      { id: '3', label: 'No. 3 움직임', difficulty: 8 },
    ],
  },
  {
    id: 'deb-images2', composerId: 'debussy', category: '영상', catSort: 2,
    opusLabel: '제2권 L. 111 (3곡)', opusSort: 2,
    pieces: [
      { id: '1', label: 'No. 1 잎새들 사이로 들리는 종소리', difficulty: 8 },
      { id: '2', label: 'No. 2 황폐한 사원에 걸린 달', difficulty: 7 },
      { id: '3', label: 'No. 3 금붕어', difficulty: 8 },
    ],
  },
  {
    id: 'deb-estampes', composerId: 'debussy', category: '판화', catSort: 3,
    opusLabel: 'L. 100 (3곡)', opusSort: 1,
    pieces: [
      { id: '1', label: 'No. 1 탑', difficulty: 7, notes: '자바 가믈란의 음향에 영감.' },
      { id: '2', label: 'No. 2 그라나다의 저녁', difficulty: 7 },
      { id: '3', label: 'No. 3 비 오는 정원', difficulty: 7 },
    ],
  },
  {
    id: 'deb-childrens', composerId: 'debussy', category: '어린이의 차지', catSort: 4,
    opusLabel: 'L. 113 (6곡)', opusSort: 1,
    pieces: [
      { id: '1', label: 'No. 1 그라두스 박사', difficulty: 5 },
      { id: '2', label: 'No. 2 코끼리 자장가', difficulty: 5 },
      { id: '3', label: 'No. 3 인형의 세레나데', difficulty: 5 },
      { id: '4', label: 'No. 4 눈은 춤춘다', difficulty: 6 },
      { id: '5', label: 'No. 5 작은 양치기', difficulty: 5 },
      { id: '6', label: 'No. 6 골리워그의 케이크워크', difficulty: 6, notes: '재즈/래그타임 어법을 클래식 문헌에 도입한 초기 사례.' },
    ],
  },
  {
    id: 'deb-prelude1', composerId: 'debussy', category: '프렐류드', catSort: 5,
    opusLabel: '제1권 L. 117 (12곡)', opusSort: 1,
    pieces: [
      { id: '1', label: 'No. 1 델포이의 무희들', difficulty: 6 },
      { id: '4', label: 'No. 4 소리와 향기는 저녁공기에 감돌고', difficulty: 6 },
      { id: '6', label: 'No. 6 눈 위의 발자국', difficulty: 5 },
      { id: '8', label: 'No. 8 아마빛 머리의 소녀', difficulty: 5, notes: '드뷔시 프렐류드 중 가장 자주 연주됨.' },
      { id: '10',label: 'No. 10 가라앉은 사원', difficulty: 6, notes: '리스의 전설을 음향화. 페달이 음색의 결정 요소.' },
      { id: '12',label: 'No. 12 음유시인들', difficulty: 7 },
    ],
  },
  {
    id: 'deb-prelude2', composerId: 'debussy', category: '프렐류드', catSort: 5,
    opusLabel: '제2권 L. 123 (12곡)', opusSort: 2,
    pieces: [
      { id: '5', label: 'No. 5 히드 들판', difficulty: 7 },
      { id: '12',label: 'No. 12 불꽃놀이', difficulty: 9, difficultSections: '양손 패시지의 정밀성과 화려한 글리산도', notes: '제2권의 종결곡. 비르투오소적 화려함.' },
    ],
  },

  // ===========================================================
  // RAVEL
  // ===========================================================
  {
    id: 'ravel-pavane', composerId: 'ravel', category: '단편', catSort: 1,
    opusLabel: '죽은 왕녀를 위한 파반 (M. 19)', opusSort: 1,
    pieces: [{ id: 'all', label: '죽은 왕녀를 위한 파반', difficulty: 4, notes: '라벨 본인 "유사한 인상주의 작품들 사이에서 너무 자주 연주된다"며 후일 평가절하. 그래도 입문 라벨로 가장 자주 선택됨.' }],
  },
  {
    id: 'ravel-jeux', composerId: 'ravel', category: '단편', catSort: 1,
    opusLabel: '물의 유희 (M. 30)', opusSort: 2,
    pieces: [{ id: 'all', label: '물의 유희', difficulty: 8, notes: '리스트 〈에스테 분수〉 이후 "물" 묘사 피아노 문헌의 새 단계. 드뷔시 〈물에 비친 그림자〉와 종종 비교.' }],
  },
  {
    id: 'ravel-sonatine', composerId: 'ravel', category: '소나티네', catSort: 2,
    opusLabel: 'M. 40 (3악장)', opusSort: 1,
    pieces: [
      { id: '1', label: '1악장 Modéré', difficulty: 6 },
      { id: '2', label: '2악장 Mouv. de Menuet', difficulty: 6 },
      { id: '3', label: '3악장 Animé', difficulty: 7 },
      { id: 'all',label: '전악장', difficulty: 7 },
    ],
  },
  {
    id: 'ravel-miroirs', composerId: 'ravel', category: '거울', catSort: 3,
    opusLabel: 'M. 43 (5곡)', opusSort: 1,
    pieces: [
      { id: '1', label: 'No. 1 밤나방', difficulty: 8 },
      { id: '2', label: 'No. 2 슬픈 새들', difficulty: 7 },
      { id: '3', label: 'No. 3 대양의 작은 배', difficulty: 8 },
      { id: '4', label: 'No. 4 어릿광대의 아침 노래', difficulty: 9, difficultSections: '오른손 동음 연타와 양손 도약', notes: '5곡 중 가장 까다로움. 라벨 본인이 오케스트라로 편곡.' },
      { id: '5', label: 'No. 5 종 계곡', difficulty: 7 },
    ],
  },
  {
    id: 'ravel-gaspard', composerId: 'ravel', category: '밤의 가스파르', catSort: 4,
    opusLabel: 'M. 55 (3곡)', opusSort: 1,
    pieces: [
      { id: '1', label: 'No. 1 옹딘', difficulty: 9, notes: '오른손의 끊임없는 동음 연타 위에 노래선.' },
      { id: '2', label: 'No. 2 교수대', difficulty: 8, notes: '시종일관 시♭(B♭) 페달 위. 라벨 본인 "균질한 음색 유지가 최대 난점".' },
      { id: '3', label: 'No. 3 스카르보', difficulty: 9, difficultSections: '동음 연타, 양손 도약, 9도/10도 분산화음의 끝없는 변용', notes: '라벨이 "발라키레프 〈이슬라메이〉보다 더 어렵게" 만들기로 작정한 곡.' },
      { id: 'all',label: '전곡 (3곡)', difficulty: 9 },
    ],
  },

  // ===========================================================
  // RACHMANINOFF
  // ===========================================================
  {
    id: 'rach-op3-2', composerId: 'rach', category: '프렐류드', catSort: 1,
    opusLabel: 'Op. 3 No. 2 다#단조', opusSort: 3,
    pieces: [{ id: 'all', label: '프렐류드 다#단조', nickname: '종', difficulty: 6, notes: '라흐마니노프 19세 작품. 그를 따라다닌 곡. 본인 "이 곡 없이는 어디서도 무대를 떠날 수 없었다".' }],
  },
  {
    id: 'rach-op23', composerId: 'rach', category: '프렐류드', catSort: 1,
    opusLabel: 'Op. 23 (10곡)', opusSort: 23,
    pieces: [
      { id: '4', label: 'No. 4 라장조', difficulty: 6 },
      { id: '5', label: 'No. 5 사단조', difficulty: 7, notes: '행진곡풍 외부와 노래풍 중간부의 대조. Op. 23 중 가장 자주 연주됨.' },
      { id: '6', label: 'No. 6 마♭장조', difficulty: 6 },
    ],
  },
  {
    id: 'rach-op32', composerId: 'rach', category: '프렐류드', catSort: 1,
    opusLabel: 'Op. 32 (13곡)', opusSort: 32,
    pieces: [
      { id: '5',  label: 'No. 5 사장조', difficulty: 7 },
      { id: '10', label: 'No. 10 시단조', difficulty: 8, notes: 'Op. 32 중 가장 깊이 있다 평가받음. 뵈클린의 〈고향에의 귀환〉에서 영감.' },
      { id: '12', label: 'No. 12 사#단조', difficulty: 8 },
    ],
  },
  {
    id: 'rach-op33', composerId: 'rach', category: '회화적 연습곡', catSort: 2,
    opusLabel: 'Op. 33 (8곡 중 9곡)', opusSort: 33,
    pieces: [
      { id: '2', label: 'No. 2 다장조', difficulty: 8 },
      { id: '6', label: 'No. 6 마♭단조', difficulty: 8 },
      { id: '7', label: 'No. 7 마♭장조', difficulty: 8 },
    ],
  },
  {
    id: 'rach-op39', composerId: 'rach', category: '회화적 연습곡', catSort: 2,
    opusLabel: 'Op. 39 (9곡)', opusSort: 39,
    pieces: [
      { id: '5', label: 'No. 5 마♭단조', difficulty: 9, notes: '비극적 어조의 대표곡. Op. 39 중 가장 자주 연주.' },
      { id: '6', label: 'No. 6 가단조', nickname: '빨간 모자와 늑대', difficulty: 9 },
      { id: '9', label: 'No. 9 라장조', difficulty: 9 },
    ],
  },
  {
    id: 'rach-sonata2', composerId: 'rach', category: '소나타', catSort: 3,
    opusLabel: 'Op. 36 시♭단조 (2번)', opusSort: 36,
    pieces: [{ id: 'all', label: '소나타 2번', difficulty: 9, notes: '1913년 원전과 1931년 개정판 중 어느 쪽을 택할지가 연주자의 결정 사항. 호로비츠는 두 판본을 절충.' }],
  },

  // ===========================================================
  // PROKOFIEV
  // ===========================================================
  {
    id: 'prok-op11', composerId: 'prokofiev', category: '토카타', catSort: 1,
    opusLabel: 'Op. 11 라단조', opusSort: 11,
    pieces: [{ id: 'all', label: '토카타 라단조', difficulty: 9, difficultSections: '오른손의 동음 연타와 양손 도약 동시 진행', notes: '20세기 토카타의 대표작.' }],
  },
  {
    id: 'prok-op22', composerId: 'prokofiev', category: '비전 푸지티브', catSort: 2,
    opusLabel: 'Op. 22 (20곡)', opusSort: 22,
    pieces: [{ id: 'all', label: '전곡 (20개 단편)', difficulty: 7 }],
  },
  {
    id: 'prok-sonata7', composerId: 'prokofiev', category: '소나타', catSort: 3,
    opusLabel: 'Op. 83 시♭장조 (7번)', opusSort: 83,
    pieces: [{ id: 'all', label: '소나타 7번', difficulty: 9, notes: '"전쟁 소나타" 3부작 중 가장 자주 연주됨. 3악장 Precipitato의 7/8박자 추진력.' }],
  },
  {
    id: 'prok-sonata3', composerId: 'prokofiev', category: '소나타', catSort: 3,
    opusLabel: 'Op. 28 가단조 (3번)', opusSort: 28,
    pieces: [{ id: 'all', label: '소나타 3번', difficulty: 8, notes: '단일 악장 7분. "옛 노트로부터" 부제. 콘서트 앙코르로 자주 선택.' }],
  },

  // ===========================================================
  // SCRIABIN
  // ===========================================================
  {
    id: 'scriabin-op8', composerId: 'scriabin', category: '에튀드', catSort: 1,
    opusLabel: 'Op. 8 (12곡)', opusSort: 8,
    pieces: [
      { id: '12', label: 'No. 12 라#단조', nickname: '비창', difficulty: 8, difficultSections: '오른손 옥타브 멜로디와 왼손 도약 동시', notes: '스크리아빈 초기 비르투오소 양식의 정점. 호로비츠 시그니처 곡.' },
    ],
  },
  {
    id: 'scriabin-op11', composerId: 'scriabin', category: '프렐류드', catSort: 2,
    opusLabel: 'Op. 11 (24곡)', opusSort: 11,
    pieces: [{ id: 'all', label: '24개 프렐류드', difficulty: 7, notes: '쇼팽 Op. 28의 직접적 후예. 24개 모든 조성.' }],
  },
  {
    id: 'scriabin-sonata2', composerId: 'scriabin', category: '소나타', catSort: 3,
    opusLabel: 'Op. 19 사#단조 (2번, Sonata-Fantasy)', opusSort: 19,
    pieces: [{ id: 'all', label: '소나타 2번 사#단조', difficulty: 8, notes: '바다의 두 모습. 1악장은 정적, 2악장은 폭풍.' }],
  },

  // ===========================================================
  // TCHAIKOVSKY
  // ===========================================================
  {
    id: 'tchai-op37', composerId: 'tchai', category: '사계', catSort: 1,
    opusLabel: 'Op. 37b (12곡)', opusSort: 37,
    pieces: [
      { id: '1',  label: '1월: 난로 옆에서', difficulty: 5 },
      { id: '6',  label: '6월: 뱃노래', difficulty: 5, notes: '12곡 중 가장 자주 독립 연주됨.' },
      { id: '10', label: '10월: 가을의 노래', difficulty: 5 },
      { id: '11', label: '11월: 트로이카', difficulty: 6 },
      { id: 'all',label: '전곡 (12곡)', difficulty: 6 },
    ],
  },

  // ===========================================================
  // GRIEG
  // ===========================================================
  {
    id: 'grieg-op12', composerId: 'grieg', category: '서정 소품집', catSort: 1,
    opusLabel: 'Op. 12 (1권, 8곡)', opusSort: 12,
    pieces: [
      { id: '1', label: 'No. 1 아리에타', difficulty: 3, notes: '서정 소품집 전 10권의 시작.' },
    ],
  },
  {
    id: 'grieg-op43', composerId: 'grieg', category: '서정 소품집', catSort: 1,
    opusLabel: 'Op. 43 (3권, 6곡)', opusSort: 43,
    pieces: [
      { id: '1', label: 'No. 1 나비', difficulty: 5 },
      { id: '6', label: 'No. 6 봄에', difficulty: 5 },
    ],
  },
  {
    id: 'grieg-op54', composerId: 'grieg', category: '서정 소품집', catSort: 1,
    opusLabel: 'Op. 54 (5권, 6곡)', opusSort: 54,
    pieces: [
      { id: '4', label: 'No. 4 야상곡', difficulty: 5 },
      { id: '5', label: 'No. 5 스케르초', difficulty: 6 },
    ],
  },
  {
    id: 'grieg-op68', composerId: 'grieg', category: '서정 소품집', catSort: 1,
    opusLabel: 'Op. 68 (8권, 6곡)', opusSort: 68,
    pieces: [
      { id: '5', label: 'No. 5 산속의 황혼', difficulty: 5 },
    ],
  },
  {
    id: 'grieg-concerto', composerId: 'grieg', category: '협주곡', catSort: 2,
    opusLabel: 'Op. 16 가단조 (피아노 솔로 부분 발췌 학습)', opusSort: 16,
    pieces: [{ id: 'all', label: '피아노 협주곡 가단조 (학습용)', difficulty: 8, notes: '오케스트라와 함께 연주되는 협주곡이지만 솔로 파트의 학습 빈도가 높음.' }],
  },
]

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** Sort composers in Korean alphabetical order. */
export function sortedComposers(): Composer[] {
  return [...COMPOSERS].sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'))
}

/** Distinct categories for a composer, in their defined order. */
export function categoriesOf(composerId: string): string[] {
  const works = WORKS.filter((w) => w.composerId === composerId)
  const seen = new Map<string, number>()
  for (const w of works) {
    if (!seen.has(w.category)) seen.set(w.category, w.catSort)
  }
  return Array.from(seen.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([cat]) => cat)
}

/** Distinct opus labels for a composer+category, ordered by opusSort. */
export function opusesOf(composerId: string, category: string): { label: string; workId: string; sort: number }[] {
  return WORKS.filter((w) => w.composerId === composerId && w.category === category)
    .sort((a, b) => a.opusSort - b.opusSort)
    .map((w) => ({ label: w.opusLabel, workId: w.id, sort: w.opusSort }))
}

/** Pieces under a specific work. */
export function piecesOf(workId: string): PieceEntry[] {
  return WORKS.find((w) => w.id === workId)?.pieces ?? []
}

export function getComposer(id: string): Composer | undefined {
  return COMPOSERS.find((c) => c.id === id)
}

export function getWork(id: string): Work | undefined {
  return WORKS.find((w) => w.id === id)
}

export interface ResolvedSelection {
  composer: Composer
  work: Work
  piece: PieceEntry
}

export function resolveSelection(composerId: string, workId: string, pieceId: string): ResolvedSelection | null {
  const composer = getComposer(composerId)
  const work = getWork(workId)
  const piece = work?.pieces.find((p) => p.id === pieceId)
  if (!composer || !work || !piece) return null
  return { composer, work, piece }
}
